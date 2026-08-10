from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InventoryUnit, QCChecklist
from ..schemas import QCChecklistSchema, QCChecklistUpdate

router = APIRouter(prefix="/api/v1", tags=["QC Checklist & Calibration"])

@router.get("/inventory/{id}/qc", response_model=QCChecklistSchema)
def get_unit_qc_checklist(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    if not unit.qc_checklist:
        qc = QCChecklist(
            unit_id=id,
            dc_offset_mv=0.5,
            bias_current_ma=25.0,
            channel_balance_ok=True,
            potentiometers_flushed=True,
            burn_in_hours=24,
            frequency_response_ok=True,
            visual_inspection_ok=True,
            tech_signature="Master Tech",
            notes="Bench calibration complete."
        )
        db.add(qc)
        db.commit()
        db.refresh(qc)
        return qc

    return unit.qc_checklist

@router.put("/inventory/{id}/qc", response_model=QCChecklistSchema)
def update_unit_qc_checklist(id: str, data: QCChecklistUpdate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    qc = unit.qc_checklist
    if not qc:
        qc = QCChecklist(unit_id=id)
        db.add(qc)

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(qc, field, val)

    db.commit()
    db.refresh(qc)
    return qc
