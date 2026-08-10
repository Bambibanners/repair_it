from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InventoryUnit, ClientJob
from ..schemas import ClientJobSchema, ClientJobUpdate

router = APIRouter(prefix="/api/v1", tags=["Client Repairs & Invoicing"])

@router.get("/inventory/{id}/client-job", response_model=ClientJobSchema)
def get_client_job(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    if not unit.client_job:
        job = ClientJob(
            unit_id=id,
            client_name="Customer Job",
            deposit_paid=0.0,
            labor_rate_per_hr=45.00,
            labor_hours_spent=1.0,
            invoice_status="Draft"
        )
        db.add(job)
        unit.is_client_job = True
        db.commit()
        db.refresh(job)
        return job

    return unit.client_job

@router.post("/inventory/{id}/client-job", response_model=ClientJobSchema)
def update_client_job(id: str, data: ClientJobUpdate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    job = unit.client_job
    if not job:
        job = ClientJob(unit_id=id, client_name=data.client_name or "Customer Job")
        db.add(job)
        unit.is_client_job = True

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(job, field, val)

    db.commit()
    db.refresh(job)
    return job
