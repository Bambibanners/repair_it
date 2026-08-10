import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import Base, generate_uuid
from ..gdrive import gdrive_manager, CREDENTIALS_FILE
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
    auth_mode: str = "none" # "service_account", "oauth_token", "none"
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    picture_url: Optional[str] = None

router = APIRouter(prefix="/api/v1/auth", tags=["Google Authentication"])

@router.post("/google/service-account", response_model=GoogleAuthStatus)
async def upload_service_account_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Read file content and validate JSON
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
        if data.get("type") != "service_account" or "private_key" not in data:
            raise HTTPException(status_code=400, detail="Invalid Service Account JSON format. Must contain 'type': 'service_account' and 'private_key'.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse JSON file: {e}")

    # Write credentials.json locally to backend/gdrive_credentials.json
    try:
        with open(CREDENTIALS_FILE, "wb") as f:
            f.write(content)
        
        # Re-initialize gdrive_manager
        gdrive_manager.reload_credentials()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save credentials file: {e}")

    return GoogleAuthStatus(
        is_authenticated=True,
        auth_mode="service_account",
        user_email=data.get("client_email", "Service Account Active")
    )

@router.post("/google", response_model=GoogleAuthStatus)
def save_google_oauth_token(data: GoogleTokenPayload, db: Session = Depends(get_db)):
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
        auth_mode="oauth_token",
        user_email=token_record.user_email,
        user_name=token_record.user_name,
        picture_url=token_record.picture_url
    )

@router.get("/google/status", response_model=GoogleAuthStatus)
def get_google_auth_status(db: Session = Depends(get_db)):
    # 1. Check if Service Account JSON exists
    if os.path.exists(CREDENTIALS_FILE):
        try:
            with open(CREDENTIALS_FILE, "r") as f:
                data = json.load(f)
                return GoogleAuthStatus(
                    is_authenticated=True,
                    auth_mode="service_account",
                    user_email=data.get("client_email", "Service Account Active")
                )
        except Exception:
            pass

    # 2. Check if OAuth Token exists
    token_record = db.query(GoogleOAuthToken).first()
    if token_record and token_record.access_token:
        return GoogleAuthStatus(
            is_authenticated=True,
            auth_mode="oauth_token",
            user_email=token_record.user_email,
            user_name=token_record.user_name,
            picture_url=token_record.picture_url
        )

    return GoogleAuthStatus(is_authenticated=False, auth_mode="none")

@router.post("/google/logout", response_model=GoogleAuthStatus)
def google_logout(db: Session = Depends(get_db)):
    db.query(GoogleOAuthToken).delete()
    db.commit()
    if os.path.exists(CREDENTIALS_FILE):
        try:
            os.remove(CREDENTIALS_FILE)
        except Exception:
            pass
    gdrive_manager.reload_credentials()
    return GoogleAuthStatus(is_authenticated=False, auth_mode="none")
