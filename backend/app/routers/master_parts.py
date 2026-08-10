from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import MasterPart, PartCompatibility
from ..schemas import MasterPartSchema, MasterPartCreate, PartCompatibilitySchema, PartCompatibilityCreate

router = APIRouter(prefix="/api/v1/master-parts", tags=["Master Parts Catalog"])

@router.get("/", response_model=List[MasterPartSchema])
def get_master_parts(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    model_number: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MasterPart)

    if category:
        query = query.filter(MasterPart.category == category)

    if search:
        search_filter = (
            MasterPart.part_number.ilike(f"%{search}%") |
            MasterPart.name.ilike(f"%{search}%") |
            MasterPart.supplier.ilike(f"%{search}%") |
            MasterPart.notes.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if brand or model_number:
        query = query.join(MasterPart.compatibilities)
        if brand:
            query = query.filter(PartCompatibility.brand.ilike(f"%{brand}%"))
        if model_number:
            query = query.filter(PartCompatibility.model_number.ilike(f"%{model_number}%"))

    return query.distinct().all()

@router.post("/", response_model=MasterPartSchema, status_code=201)
def create_master_part(data: MasterPartCreate, db: Session = Depends(get_db)):
    part = MasterPart(
        part_number=data.part_number,
        name=data.name,
        category=data.category,
        supplier=data.supplier,
        unit_cost=data.unit_cost,
        stock_qty=data.stock_qty,
        notes=data.notes
    )
    db.add(part)
    db.flush()

    for comp in data.compatibilities:
        c = PartCompatibility(
            master_part_id=part.master_part_id,
            brand=comp.brand,
            model_number=comp.model_number,
            notes=comp.notes
        )
        db.add(c)

    db.commit()
    db.refresh(part)
    return part

@router.get("/{part_id}", response_model=MasterPartSchema)
def get_master_part_detail(part_id: str, db: Session = Depends(get_db)):
    part = db.query(MasterPart).filter(MasterPart.master_part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Master part not found")
    return part

@router.post("/{part_id}/compatibility", response_model=PartCompatibilitySchema, status_code=201)
def add_compatibility(part_id: str, data: PartCompatibilityCreate, db: Session = Depends(get_db)):
    part = db.query(MasterPart).filter(MasterPart.master_part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Master part not found")

    comp = PartCompatibility(
        master_part_id=part_id,
        brand=data.brand,
        model_number=data.model_number,
        notes=data.notes
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/compatibility/{compatibility_id}", status_code=204)
def delete_compatibility(compatibility_id: str, db: Session = Depends(get_db)):
    comp = db.query(PartCompatibility).filter(PartCompatibility.compatibility_id == compatibility_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Compatibility record not found")
    db.delete(comp)
    db.commit()
    return None
