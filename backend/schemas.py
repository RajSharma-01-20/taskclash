from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    score: int = 0

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# --- Clash Schemas ---

class ClashCreate(BaseModel):
    category: str = "Tech"
    challenger_task: str
    reward_stake: str
    deadline: datetime

class ClashAccept(BaseModel):
    opponent_task: str

class JudgeVote(BaseModel):
    vote: str  # "approve" or "reject"

class ClashResponse(BaseModel):
    id: int
    challenger_id: int
    opponent_id: Optional[int] = None
    category: str
    challenger_task: str
    opponent_task: Optional[str] = None
    challenger_proof: Optional[str] = None
    opponent_proof: Optional[str] = None
    challenger_completed: bool
    opponent_completed: bool
    challenger_vote: Optional[str] = None
    opponent_vote: Optional[str] = None
    reward_stake: str
    deadline: datetime
    status: str

    class Config:
        from_attributes = True