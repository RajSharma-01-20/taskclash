from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import security
from database import engine, get_db

# Create the database tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS MIDDLEWARE --- 
# This MUST be here so your Vercel frontend can talk to your Render backend without being blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Vercel, localhost, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- ROUTES ---

@app.get("/")
def read_root():
    """Simple health check to see if the API is awake"""
    return {"message": "Welcome to the TaskClash API! The server is alive."}

@app.post("/api/users/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registers a new user into the database"""
    # Check if username exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password and save the user
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/token", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Logs a user in and returns a JWT access token"""
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me/", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    """Fetches the profile data of the currently logged-in user"""
    return current_user

@app.get("/api/leaderboard/", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    """Fetches a list of all users for the leaderboard"""
    users = db.query(models.User).all()
    return users

# --- RUNNER ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)