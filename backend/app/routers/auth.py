from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import Base, generate_uuid
from sqlalchemy import Column, String, Text, DateTime

class GoogleOAuthToken(Base):
    __tablename__ = "google_oauth_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    user_email = Column(String(255), nullable=True)
    user_name = Column(String(255), nullable=True)
    picture_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GoogleTokenPayload(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    picture_url: Optional[str] = None

class GoogleAuthStatus(BaseModel):
    is_authenticated: bool
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    picture_url: Optional[str] = None

router = APIRouter(prefix="/api/v1/auth", tags=["Google Authentication"])

@router.post("/google", response_model=GoogleAuthStatus)
def save_google_oauth_token(data: GoogleTokenPayload, db: Session = Depends(get_db)):
    # Store or update the active Google OAuth token
    token_record = db.query(GoogleOAuthToken).first()
    if not token_record:
        token_record = GoogleOAuthToken(
            access_token=data.access_token,
            refresh_token=data.refresh_token,
            user_email=data.user_email,
            user_name=data.user_name,
            picture_url=data.picture_url
        )
        db.add(token_record)
    else:
        token_record.access_token = data.access_token
        if data.refresh_token:
            token_record.refresh_token = data.refresh_token
        token_record.user_email = data.user_email
        token_record.user_name = data.user_name
        token_record.picture_url = data.picture_url

    db.commit()
    db.refresh(token_record)

    return GoogleAuthStatus(
        is_authenticated=True,
        user_email=token_record.user_email,
        user_name=token_record.user_name,
        picture_url=token_record.picture_url
    )

@router.get("/google/status", response_model=GoogleAuthStatus)
def get_google_auth_status(db: Session = Depends(get_db)):
    token_record = db.query(GoogleOAuthToken).first()
    if token_record and token_record.access_token:
        return GoogleAuthStatus(
            is_authenticated=True,
            user_email=token_record.user_email,
            user_name=token_record.user_name,
            picture_url=token_record.picture_url
        )
    return GoogleAuthStatus(is_authenticated=False)

@router.post("/google/logout", response_model=GoogleAuthStatus)
def google_logout(db: Session = Depends(get_db)):
    db.query(GoogleOAuthToken).delete()
    db.commit()
    return GoogleAuthStatus(is_authenticated=False)
