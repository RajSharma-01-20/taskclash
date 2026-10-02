from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

import models
import schemas
import security
from database import engine, get_db

# Create the database tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS MIDDLEWARE --- 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded proof files statically
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the TaskClash API! The server is alive."}

# ---- USER ROUTES ----

@app.post("/api/users/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/token", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserResponse)
@app.get("/api/users/me/", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    return current_user

@app.get("/api/leaderboard/", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.score.desc()).all()
    return users

# ---- CLASH ROUTES ----

@app.get("/api/clashes/public", response_model=List[schemas.ClashResponse])
def get_public_clashes(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Returns all open clashes that the current user did NOT create (they can accept these)."""
    clashes = db.query(models.Clash).filter(
        models.Clash.status == "open",
        models.Clash.challenger_id != current_user.id
    ).all()
    return clashes

@app.get("/api/clashes/", response_model=List[schemas.ClashResponse])
def get_my_clashes(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Returns all clashes the current user is involved in (as challenger or opponent)."""
    clashes = db.query(models.Clash).filter(
        (models.Clash.challenger_id == current_user.id) |
        (models.Clash.opponent_id == current_user.id)
    ).all()
    return clashes

@app.post("/api/clashes/", response_model=schemas.ClashResponse)
def create_clash(
    clash: schemas.ClashCreate,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Creates a new clash challenge."""
    new_clash = models.Clash(
        challenger_id=current_user.id,
        category=clash.category,
        challenger_task=clash.challenger_task,
        reward_stake=clash.reward_stake,
        deadline=clash.deadline,
        status="open"
    )
    db.add(new_clash)
    db.commit()
    db.refresh(new_clash)
    return new_clash

@app.put("/api/clashes/{clash_id}/accept", response_model=schemas.ClashResponse)
def accept_clash(
    clash_id: int,
    body: schemas.ClashAccept,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Opponent accepts a clash and sets their competing task."""
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash:
        raise HTTPException(status_code=404, detail="Clash not found")
    if clash.status != "open":
        raise HTTPException(status_code=400, detail="Clash is no longer open")
    if clash.challenger_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot accept your own clash")
    clash.opponent_id = current_user.id
    clash.opponent_task = body.opponent_task
    clash.status = "active"
    db.commit()
    db.refresh(clash)
    return clash

@app.post("/api/clashes/{clash_id}/proof", response_model=schemas.ClashResponse)
def submit_proof(
    clash_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload proof of task completion (image/video). Sets status to 'review' when both submit."""
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash:
        raise HTTPException(status_code=404, detail="Clash not found")
    if clash.status != "active":
        raise HTTPException(status_code=400, detail="Clash is not active")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    file_path = f"{UPLOADS_DIR}/clash_{clash_id}_{current_user.id}{file_ext}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Hosted URL (relative path, served by /uploads mount)
    proof_url = f"/{file_path}"

    if clash.challenger_id == current_user.id:
        clash.challenger_proof = proof_url
        clash.challenger_completed = True
    elif clash.opponent_id == current_user.id:
        clash.opponent_proof = proof_url
        clash.opponent_completed = True
    else:
        raise HTTPException(status_code=403, detail="You are not part of this clash")
    
    # Both submitted — move to review
    if clash.challenger_completed and clash.opponent_completed:
        clash.status = "review"
    
    db.commit()
    db.refresh(clash)
    return clash

@app.post("/api/clashes/{clash_id}/judge", response_model=schemas.ClashResponse)
def judge_clash(
    clash_id: int,
    body: schemas.JudgeVote,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Each player votes to approve or reject the OTHER player's proof."""
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash:
        raise HTTPException(status_code=404, detail="Clash not found")
    if clash.status != "review":
        raise HTTPException(status_code=400, detail="Clash is not in review phase")
    if body.vote not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Vote must be 'approve' or 'reject'")

    if clash.challenger_id == current_user.id:
        clash.challenger_vote = body.vote
    elif clash.opponent_id == current_user.id:
        clash.opponent_vote = body.vote
    else:
        raise HTTPException(status_code=403, detail="You are not part of this clash")

    # Resolve when both have voted
    if clash.challenger_vote and clash.opponent_vote:
        if clash.challenger_vote == "approve" and clash.opponent_vote == "approve":
            # Both approved — both win points
            challenger = db.query(models.User).filter(models.User.id == clash.challenger_id).first()
            opponent = db.query(models.User).filter(models.User.id == clash.opponent_id).first()
            if challenger:
                challenger.score += 50
            if opponent:
                opponent.score += 50
            clash.status = "finished"
        else:
            # Disagreement — disputed
            clash.status = "disputed"

    db.commit()
    db.refresh(clash)
    return clash

# --- RUNNER ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)