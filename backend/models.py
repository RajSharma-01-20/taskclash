from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    score = Column(Integer, default=0)

    clashes_initiated = relationship("Clash", foreign_keys="Clash.challenger_id", back_populates="challenger")
    clashes_received = relationship("Clash", foreign_keys="Clash.opponent_id", back_populates="opponent")

class Clash(Base):
    __tablename__ = "clashes"

    id = Column(Integer, primary_key=True, index=True)
    
    challenger_id = Column(Integer, ForeignKey("users.id"))
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    category = Column(String, default="Tech")
    
    challenger_task = Column(String)
    opponent_task = Column(String, nullable=True)
    
    challenger_proof = Column(String, nullable=True)
    opponent_proof = Column(String, nullable=True)
    challenger_completed = Column(Boolean, default=False)
    opponent_completed = Column(Boolean, default=False)

    challenger_vote = Column(String, nullable=True)
    opponent_vote = Column(String, nullable=True)

    reward_stake = Column(String)
    deadline = Column(DateTime)
    status = Column(String, default="open")

    challenger = relationship("User", foreign_keys=[challenger_id], back_populates="clashes_initiated")
    opponent = relationship("User", foreign_keys=[opponent_id], back_populates="clashes_received")