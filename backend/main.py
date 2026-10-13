from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from typing import List
import shutil
import os
import re
import math

import models
import schemas
import security
from database import engine, get_db

# Create the database tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

# Ensure newly added columns exist in SQLite database if it already existed
def ensure_sqlite_columns():
    try:
        inspector = inspect(engine)
        if "clashes" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("clashes")]
            with engine.connect() as conn:
                if "winner_id" not in columns:
                    conn.execute(text("ALTER TABLE clashes ADD COLUMN winner_id INTEGER;"))
                if "outcome" not in columns:
                    conn.execute(text("ALTER TABLE clashes ADD COLUMN outcome VARCHAR;"))
                if "challenger_reward" not in columns:
                    conn.execute(text("ALTER TABLE clashes ADD COLUMN challenger_reward VARCHAR;"))
                if "opponent_reward" not in columns:
                    conn.execute(text("ALTER TABLE clashes ADD COLUMN opponent_reward VARCHAR;"))
                conn.commit()
    except Exception as e:
        print(f"Database schema sync note: {e}")

ensure_sqlite_columns()

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
    
    # Full URL so the frontend can load it
    backend_base = os.getenv("BACKEND_BASE_URL", "https://taskclash-api.onrender.com").rstrip("/")
    proof_url = f"{backend_base}/{file_path}"

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

# ---- REWARD ALLOCATION UTILITY ----

def calculate_reward_allocation(reward_stake: str, outcome: str):
    """
    Allocates reward based on winner outcome:
    - 'challenger' (User 1 wins): User 1 receives 100%, User 2 receives 0%
    - 'opponent' (User 2 wins): User 2 receives 100%, User 1 receives 0%
    - 'tie' (Both users win / tie): Split reward equally, 50% each
    """
    clean_stake = (reward_stake or "50 PTS").strip()
    match = re.search(r'^([$€£¥]?)\s*([0-9]+(?:\.[0-9]+)?)\s*(.*?)$', clean_stake)
    if match and match.group(2):
        prefix = match.group(1) or ""
        num_val = float(match.group(2)) if '.' in match.group(2) else int(match.group(2))
        unit = match.group(3).strip()
        unit_spaced = f" {unit}" if unit else ""
        is_float = isinstance(num_val, float)
        
        def format_amount(val):
            if is_float:
                return f"{prefix}{val:.1f}{unit_spaced}".strip()
            return f"{prefix}{int(val)}{unit_spaced}".strip()

        base_pts = int(num_val) if ('pt' in unit.lower() or not unit) else max(50, int(num_val))
        if base_pts <= 0:
            base_pts = 50

        if outcome == "challenger":
            return f"{clean_stake} (100%)", f"{prefix}0{unit_spaced} (0%)".strip(), base_pts, 0
        elif outcome == "opponent":
            return f"{prefix}0{unit_spaced} (0%)".strip(), f"{clean_stake} (100%)", 0, base_pts
        else:  # tie / both
            half_1 = math.ceil(num_val / 2.0)
            half_2 = math.floor(num_val / 2.0)
            c_rew = f"{format_amount(half_1)} (50%)"
            o_rew = f"{format_amount(half_2)} (50%)"
            c_pts = math.ceil(base_pts / 2.0)
            o_pts = math.floor(base_pts / 2.0)
            return c_rew, o_rew, c_pts, o_pts
    else:
        # Non-numeric custom reward (e.g. "Pizza", "Coffee", "Bragging rights")
        base_pts = 100
        if outcome == "challenger":
            return f"{clean_stake} (100%)", "None (0%)", base_pts, 0
        elif outcome == "opponent":
            return "None (0%)", f"{clean_stake} (100%)", 0, base_pts
        else:
            return f"Split {clean_stake} (50%)", f"Split {clean_stake} (50%)", 50, 50

@app.post("/api/clashes/{clash_id}/resolve", response_model=schemas.ClashResponse)
def resolve_clash(
    clash_id: int,
    body: schemas.ResolveOutcome,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Selects the winner and permanently distributes the reward:
    - challenger: User 1 receives 100%, User 2 receives 0%
    - opponent: User 2 receives 100%, User 1 receives 0%
    - tie / both: Split equally, 50% each
    """
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash:
        raise HTTPException(status_code=404, detail="Clash not found")
    if clash.status == "finished":
        raise HTTPException(status_code=400, detail="Clash is already finished")
    if current_user.id != clash.challenger_id and current_user.id != clash.opponent_id:
        raise HTTPException(status_code=403, detail="Only duel participants can finalize the outcome")
    if not clash.opponent_id:
        raise HTTPException(status_code=400, detail="Cannot resolve a clash without an opponent")

    norm_outcome = body.outcome.lower().strip()
    if norm_outcome in ("user1", "challenger", "challenger_win"):
        outcome_key = "challenger"
        winner_id = clash.challenger_id
    elif norm_outcome in ("user2", "opponent", "opponent_win"):
        outcome_key = "opponent"
        winner_id = clash.opponent_id
    elif norm_outcome in ("tie", "both", "draw", "split"):
        outcome_key = "tie"
        winner_id = None
    else:
        raise HTTPException(status_code=400, detail="Outcome must be 'challenger', 'opponent', or 'tie'")

    c_rew, o_rew, c_pts, o_pts = calculate_reward_allocation(clash.reward_stake, outcome_key)

    clash.outcome = outcome_key
    clash.winner_id = winner_id
    clash.challenger_reward = c_rew
    clash.opponent_reward = o_rew
    clash.status = "finished"

    # Credit points to user accounts
    challenger = db.query(models.User).filter(models.User.id == clash.challenger_id).first()
    opponent = db.query(models.User).filter(models.User.id == clash.opponent_id).first()
    if challenger:
        challenger.score = (challenger.score or 0) + c_pts
    if opponent:
        opponent.score = (opponent.score or 0) + o_pts

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
    """
    Judge endpoint supporting:
    1. Direct winner outcome resolution ('challenger', 'opponent', 'tie')
    2. Dual-vote consensus ('approve', 'reject')
    """
    clash = db.query(models.Clash).filter(models.Clash.id == clash_id).first()
    if not clash:
        raise HTTPException(status_code=404, detail="Clash not found")
    if clash.status == "finished":
        raise HTTPException(status_code=400, detail="Clash is already finished")
    if current_user.id != clash.challenger_id and current_user.id != clash.opponent_id:
        raise HTTPException(status_code=403, detail="You are not part of this clash")

    vote_val = (body.outcome or body.vote or "").lower().strip()

    # If direct winner outcome was specified
    if vote_val in ("challenger", "opponent", "tie", "both", "user1", "user2"):
        outcome_key = "challenger" if vote_val in ("challenger", "user1") else ("opponent" if vote_val in ("opponent", "user2") else "tie")
        winner_id = clash.challenger_id if outcome_key == "challenger" else (clash.opponent_id if outcome_key == "opponent" else None)
        c_rew, o_rew, c_pts, o_pts = calculate_reward_allocation(clash.reward_stake, outcome_key)
        
        clash.outcome = outcome_key
        clash.winner_id = winner_id
        clash.challenger_reward = c_rew
        clash.opponent_reward = o_rew
        clash.status = "finished"

        challenger = db.query(models.User).filter(models.User.id == clash.challenger_id).first()
        opponent = db.query(models.User).filter(models.User.id == clash.opponent_id).first()
        if challenger:
            challenger.score = (challenger.score or 0) + c_pts
        if opponent:
            opponent.score = (opponent.score or 0) + o_pts

        db.commit()
        db.refresh(clash)
        return clash

    if vote_val not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Vote must be 'approve', 'reject', 'challenger', 'opponent', or 'tie'")

    if clash.challenger_id == current_user.id:
        clash.challenger_vote = vote_val
    elif clash.opponent_id == current_user.id:
        clash.opponent_vote = vote_val

    # Resolve when both have voted
    if clash.challenger_vote and clash.opponent_vote:
        if clash.challenger_vote == "approve" and clash.opponent_vote == "approve":
            c_rew, o_rew, c_pts, o_pts = calculate_reward_allocation(clash.reward_stake, "tie")
            clash.outcome = "tie"
            clash.winner_id = None
            clash.challenger_reward = c_rew
            clash.opponent_reward = o_rew
            clash.status = "finished"

            challenger = db.query(models.User).filter(models.User.id == clash.challenger_id).first()
            opponent = db.query(models.User).filter(models.User.id == clash.opponent_id).first()
            if challenger:
                challenger.score = (challenger.score or 0) + c_pts
            if opponent:
                opponent.score = (opponent.score or 0) + o_pts
        else:
            clash.status = "disputed"

    db.commit()
    db.refresh(clash)
    return clash

# --- RUNNER ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)