from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    score: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ClashCreate(BaseModel):
    category: str
    challenger_task: str
    reward_stake: str
    deadline: datetime

class ClashAccept(BaseModel):
    opponent_task: str

class JudgeSubmit(BaseModel):
    vote: str

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