from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Replace 'YOUR_NEW_PASSWORD' with the password you just set in pgAdmin
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/taskclash"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()