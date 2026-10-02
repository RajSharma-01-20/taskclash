import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from datetime import datetime

import models
import schemas
from database import engine, Base, get_db
from security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskClash API")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login/")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "TaskClash Backend is running!"}

@app.post("/api/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login/", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None: raise credentials_exception
    return user

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/api/leaderboard/", response_model=list[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.score.desc()).limit(10).all()

# --- Clash Endpoints ---
@app.post("/api/clashes/", response_model=schemas.ClashResponse)
def create_clash(clash_data: schemas.ClashCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    deadline = clash_data.deadline
    if deadline.tzinfo is not None:
        deadline = deadline.astimezone().replace(tzinfo=None)

    new_clash = models.Clash(
        challenger_id=current_user.id, category=clash_data.category,
        challenger_task=clash_data.challenger_task, reward_stake=clash_data.reward_stake,
        deadline=deadline, status="open"
    )
    db.add(new_clash); db.commit(); db.refresh(new_clash)
    return new_clash

@app.get("/api/clashes/public", response_model=list[schemas.ClashResponse])
def get_public_clashes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Clash).filter(models.Clash.status == "open", models.Clash.challenger_id != current_user.id).all()

@app.put("/api/clashes/{clash_id}/accept", response_model=schemas.ClashResponse)
def accept_clash(clash_id: int, accept_data: schemas.ClashAccept, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash or clash.status != "open" or clash.challenger_id == current_user.id:
        raise HTTPException(status_code=400, detail="Invalid action")
    clash.opponent_id = current_user.id
    clash.opponent_task = accept_data.opponent_task
    clash.status = "active"
    db.commit(); db.refresh(clash)
    return clash

@app.post("/api/clashes/{clash_id}/proof", response_model=schemas.ClashResponse)
async def submit_proof(clash_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash or clash.status != "active":
        raise HTTPException(status_code=400, detail="Invalid action")
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"clash_{clash_id}_user_{current_user.id}.{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    with open(file_path, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    media_url = f"http://localhost:8000/uploads/{unique_filename}"
        
    if current_user.id == clash.challenger_id:
        clash.challenger_proof = media_url
        clash.challenger_completed = True
    elif current_user.id == clash.opponent_id:
        clash.opponent_proof = media_url
        clash.opponent_completed = True
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if clash.challenger_completed and clash.opponent_completed:
        clash.status = "review"
        
    db.commit(); db.refresh(clash)
    return clash

@app.post("/api/clashes/{clash_id}/judge", response_model=schemas.ClashResponse)
def judge_clash(clash_id: int, judge_data: schemas.JudgeSubmit, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash or clash.status != "review":
        raise HTTPException(status_code=400, detail="Invalid action")
        
    if current_user.id == clash.challenger_id:
        clash.challenger_vote = judge_data.vote
    elif current_user.id == clash.opponent_id:
        clash.opponent_vote = judge_data.vote
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if clash.challenger_vote and clash.opponent_vote:
        if clash.challenger_vote == "approve" and clash.opponent_vote == "approve":
            clash.status = "finished"
            challenger = db.query(models.User).filter(models.User.id == clash.challenger_id).first()
            opponent = db.query(models.User).filter(models.User.id == clash.opponent_id).first()
            challenger.score += 50
            opponent.score += 50
        else:
            clash.status = "disputed"
            
    db.commit(); db.refresh(clash)
    return clash

@app.get("/api/clashes/", response_model=list[schemas.ClashResponse])
def get_user_clashes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Clash).filter((models.Clash.challenger_id == current_user.id) | (models.Clash.opponent_id == current_user.id)).all()