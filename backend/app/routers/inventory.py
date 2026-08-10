from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import InventoryUnit, RepairLog, PartOrder, SalesListing
from ..schemas import (
    InventoryUnitCreate,
    InventoryUnitDetail,
    InventoryUnitBase,
    InventoryUnitStatusUpdate,
    InventoryUnitUpdate,
    NetProfitBreakdown
)

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

def compute_profit_summary(unit: InventoryUnit) -> NetProfitBreakdown:
    parts_cost = sum(p.cost for p in unit.part_orders) if unit.part_orders else 0.0
    total_cost_basis = unit.base_cost + parts_cost
    
    # Active or sold listing
    sold_listing = next((l for l in unit.sales_listings if l.final_sale_price is not None and l.final_sale_price > 0), None)
    active_listing = next((l for l in unit.sales_listings if l.is_active), None)
    
    target_price = active_listing.target_price if active_listing else None
    if sold_listing:
        final_sale = sold_listing.final_sale_price or 0.0
        fees = sold_listing.platform_fees or 0.0
        shipping = sold_listing.shipping_costs or 0.0
        is_sold = True
    else:
        final_sale = 0.0
        fees = active_listing.platform_fees if active_listing else 0.0
        shipping = active_listing.shipping_costs if active_listing else 0.0
        is_sold = False

    total_revenue = final_sale if is_sold else 0.0
    net_profit = (total_revenue - (total_cost_basis + fees + shipping)) if is_sold else 0.0

    return NetProfitBreakdown(
        unit_id=unit.unit_id,
        brand=unit.brand,
        model_number=unit.model_number,
        base_cost=unit.base_cost,
        parts_cost=parts_cost,
        total_cost_basis=total_cost_basis,
        target_price=target_price,
        final_sale_price=final_sale if is_sold else None,
        platform_fees=fees,
        shipping_costs=shipping,
        total_revenue=total_revenue,
        net_profit=net_profit,
        is_sold=is_sold
    )

@router.get("/", response_model=List[InventoryUnitDetail])
def list_inventory(
    status: Optional[str] = Query(None, description="Filter by system status"),
    category: Optional[str] = Query(None, description="Filter by hardware category"),
    search: Optional[str] = Query(None, description="Search brand, model, or serial number"),
    db: Session = Depends(get_db)
):
    query = db.query(InventoryUnit)
    
    if status:
        query = query.filter(InventoryUnit.system_status == status)
    if category:
        query = query.filter(InventoryUnit.category == category)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (InventoryUnit.brand.ilike(search_fmt)) |
            (InventoryUnit.model_number.ilike(search_fmt)) |
            (InventoryUnit.serial_number.ilike(search_fmt))
        )
    
    units = query.all()
    results = []
    for u in units:
        detail = InventoryUnitDetail.model_validate(u)
        detail.financial_summary = compute_profit_summary(u)
        results.append(detail)
    return results

@router.post("/", response_model=InventoryUnitDetail, status_code=201)
def create_inventory_intake(data: InventoryUnitCreate, db: Session = Depends(get_db)):
    # Check duplicate serial number
    existing = db.query(InventoryUnit).filter(InventoryUnit.serial_number == data.serial_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Unit with serial number '{data.serial_number}' already exists.")

    unit = InventoryUnit(
        brand=data.brand,
        model_number=data.model_number,
        serial_number=data.serial_number,
        category=data.category,
        acquisition_source=data.acquisition_source,
        base_cost=data.base_cost,
        cosmetic_condition=data.cosmetic_condition,
        system_status=data.system_status
    )
    db.add(unit)
    db.flush() # get unit_id

    # Create associated RepairLog
    repair_log = RepairLog(
        unit_id=unit.unit_id,
        priority=data.priority or 2,
        initial_symptoms=data.initial_symptoms or "Initial diagnostic triage pending."
    )
    db.add(repair_log)
    db.commit()
    db.refresh(unit)

    detail = InventoryUnitDetail.model_validate(unit)
    detail.financial_summary = compute_profit_summary(unit)
    return detail

@router.get("/{id}", response_model=InventoryUnitDetail)
def get_inventory_unit(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")
    
    detail = InventoryUnitDetail.model_validate(unit)
    detail.financial_summary = compute_profit_summary(unit)
    return detail

@router.put("/{id}/status", response_model=InventoryUnitDetail)
def update_unit_status(id: str, payload: InventoryUnitStatusUpdate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")
    
    valid_statuses = ["Triage", "On Bench", "Waiting Parts", "Ready to Sell", "Sold", "Scrapped"]
    if payload.system_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    unit.system_status = payload.system_status
    db.commit()
    db.refresh(unit)

    detail = InventoryUnitDetail.model_validate(unit)
    detail.financial_summary = compute_profit_summary(unit)
    return detail

@router.put("/{id}", response_model=InventoryUnitDetail)
def update_inventory_unit(id: str, payload: InventoryUnitUpdate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(unit, field, value)

    db.commit()
    db.refresh(unit)

    detail = InventoryUnitDetail.model_validate(unit)
    detail.financial_summary = compute_profit_summary(unit)
    return detail
