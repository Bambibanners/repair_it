import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import InventoryUnit, UnitMedia, ServiceManual, ManualCompatibility
from ..schemas import UnitMediaSchema, ServiceManualSchema, ManualCompatibilitySchema, ManualCompatibilityCreate
from ..gdrive import gdrive_manager, LOCAL_UPLOADS_DIR
from .auth import GoogleOAuthToken

router = APIRouter(prefix="/api/v1", tags=["Media & Service Manuals"])

def get_active_access_token(db: Session) -> Optional[str]:
    token_record = db.query(GoogleOAuthToken).first()
    return token_record.access_token if token_record else None

@router.post("/inventory/{id}/media", response_model=UnitMediaSchema, status_code=201)
async def upload_unit_media(
    id: str,
    file: UploadFile = File(...),
    file_type: str = Form("image"), # image, video, manual, schematic
    db: Session = Depends(get_db)
):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    access_token = get_active_access_token(db)

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil_content = await file.read()
        tmp.write(shutil_content)
        tmp_path = tmp.name

    try:
        folder_name = f"Repair-It/{unit.brand}_{unit.model_number}_{unit.serial_number}"
        gdrive_res = gdrive_manager.upload_file(
            file_path=tmp_path,
            file_name=file.filename,
            mime_type=file.content_type or "application/octet-stream",
            folder_name=folder_name,
            access_token=access_token
        )

        media = UnitMedia(
            unit_id=id,
            file_name=file.filename,
            file_type=file_type,
            gdrive_file_id=gdrive_res.get("gdrive_file_id"),
            web_view_link=gdrive_res.get("web_view_link"),
            thumbnail_link=gdrive_res.get("thumbnail_link")
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        return media
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/inventory/{id}/media", response_model=List[UnitMediaSchema])
def get_unit_media_list(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")
    return unit.media_items

@router.get("/media/{media_id}/file")
def serve_media_file(media_id: str, db: Session = Depends(get_db)):
    media = db.query(UnitMedia).filter(UnitMedia.media_id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")

    # If hosted on Google Drive
    if media.gdrive_file_id:
        return RedirectResponse(url=f"https://lh3.googleusercontent.com/d/{media.gdrive_file_id}")

    # If stored locally
    if media.web_view_link and media.web_view_link.startswith("/uploads/"):
        filename = media.web_view_link.replace("/uploads/", "")
        file_path = os.path.join(LOCAL_UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)

    if media.thumbnail_link and media.thumbnail_link.startswith("/uploads/"):
        filename = media.thumbnail_link.replace("/uploads/", "")
        file_path = os.path.join(LOCAL_UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)

    raise HTTPException(status_code=404, detail="Media file not found on local disk or drive")

@router.delete("/media/{media_id}", status_code=204)
def delete_unit_media(media_id: str, db: Session = Depends(get_db)):
    media = db.query(UnitMedia).filter(UnitMedia.media_id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")
    db.delete(media)
    db.commit()
    return None

@router.post("/manuals/upload", response_model=ServiceManualSchema, status_code=201)
async def upload_service_manual(
    brand: str = Form(...),
    model_number: str = Form(...),
    title: str = Form(...),
    doc_type: str = Form("Service Manual"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    access_token = get_active_access_token(db)

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        folder_name = f"Repair-It/Manuals/{brand}"
        gdrive_res = gdrive_manager.upload_file(
            file_path=tmp_path,
            file_name=file.filename,
            mime_type=file.content_type or "application/pdf",
            folder_name=folder_name,
            access_token=access_token
        )

        manual = ServiceManual(
            brand=brand,
            model_number=model_number,
            title=title,
            doc_type=doc_type,
            gdrive_file_id=gdrive_res.get("gdrive_file_id"),
            web_view_link=gdrive_res.get("web_view_link")
        )
        db.add(manual)
        db.flush()

        # Add initial model compatibility link
        comp = ManualCompatibility(
            manual_id=manual.manual_id,
            brand=brand,
            model_number=model_number
        )
        db.add(comp)

        db.commit()
        db.refresh(manual)
        return manual
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/manuals/{manual_id}/link", response_model=ManualCompatibilitySchema, status_code=201)
def link_manual_to_model(manual_id: str, data: ManualCompatibilityCreate, db: Session = Depends(get_db)):
    manual = db.query(ServiceManual).filter(ServiceManual.manual_id == manual_id).first()
    if not manual:
        raise HTTPException(status_code=404, detail="Service manual not found")

    comp = ManualCompatibility(
        manual_id=manual_id,
        brand=data.brand,
        model_number=data.model_number
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.get("/manuals/search", response_model=List[ServiceManualSchema])
def search_service_manuals(
    brand: Optional[str] = Query(None),
    model_number: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ServiceManual)
    if brand or model_number:
        query = query.outerjoin(ServiceManual.compatibilities)
        if brand and model_number:
            query = query.filter(
                ((ServiceManual.brand.ilike(f"%{brand}%")) & (ServiceManual.model_number.ilike(f"%{model_number}%"))) |
                ((ManualCompatibility.brand.ilike(f"%{brand}%")) & (ManualCompatibility.model_number.ilike(f"%{model_number}%")))
            )
        elif brand:
            query = query.filter(
                (ServiceManual.brand.ilike(f"%{brand}%")) | (ManualCompatibility.brand.ilike(f"%{brand}%"))
            )
        elif model_number:
            query = query.filter(
                (ServiceManual.model_number.ilike(f"%{model_number}%")) | (ManualCompatibility.model_number.ilike(f"%{model_number}%"))
            )
    return query.distinct().all()
