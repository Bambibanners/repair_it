from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import InventoryUnit, PartOrder
from ..schemas import PartOrderSchema, PartOrderCreate, PartOrderUpdate

router = APIRouter(prefix="/api/v1", tags=["Parts"])

@router.get("/inventory/{id}/parts", response_model=List[PartOrderSchema])
def get_unit_parts(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit.part_orders

@router.post("/inventory/{id}/parts", response_model=PartOrderSchema, status_code=201)
def add_part_order(id: str, data: PartOrderCreate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    part = PartOrder(
        unit_id=id,
        description=data.description,
        supplier=data.supplier,
        cost=data.cost,
        order_status=data.order_status,
        eta_date=data.eta_date
    )
    db.add(part)
    db.commit()
    db.refresh(part)
    return part

@router.put("/parts/{part_id}", response_model=PartOrderSchema)
def update_part_order(part_id: str, payload: PartOrderUpdate, db: Session = Depends(get_db)):
    part = db.query(PartOrder).filter(PartOrder.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part order not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, field, value)

    db.commit()
    db.refresh(part)
    return part

@router.delete("/parts/{part_id}", status_code=204)
def delete_part_order(part_id: str, db: Session = Depends(get_db)):
    part = db.query(PartOrder).filter(PartOrder.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part order not found")
    db.delete(part)
    db.commit()
    return None
