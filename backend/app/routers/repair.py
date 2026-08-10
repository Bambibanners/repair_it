from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InventoryUnit, RepairLog
from ..schemas import RepairLogSchema, RepairLogUpdate

router = APIRouter(prefix="/api/v1", tags=["Repair Logs"])

@router.get("/inventory/{id}/repair", response_model=RepairLogSchema)
def get_repair_log(id: str, db: Session = Depends(get_db)):
    repair_log = db.query(RepairLog).filter(RepairLog.unit_id == id).first()
    if not repair_log:
        # Create default repair log if it doesn't exist
        unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")
        repair_log = RepairLog(unit_id=id, priority=2, initial_symptoms="Diagnostic pending.")
        db.add(repair_log)
        db.commit()
        db.refresh(repair_log)
    return repair_log

@router.put("/inventory/{id}/repair", response_model=RepairLogSchema)
def update_repair_log(id: str, payload: RepairLogUpdate, db: Session = Depends(get_db)):
    repair_log = db.query(RepairLog).filter(RepairLog.unit_id == id).first()
    if not repair_log:
        unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")
        repair_log = RepairLog(unit_id=id)
        db.add(repair_log)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repair_log, field, value)

    db.commit()
    db.refresh(repair_log)
    return repair_log
