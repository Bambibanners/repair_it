from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import InventoryUnit, SalesListing
from ..schemas import SalesListingSchema, SalesListingCreate, SalesListingUpdate, NetProfitBreakdown
from .inventory import compute_profit_summary

router = APIRouter(prefix="/api/v1", tags=["Sales & Finance"])

@router.get("/inventory/{id}/sales", response_model=List[SalesListingSchema])
def get_unit_sales_listings(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit.sales_listings

@router.post("/inventory/{id}/sales", response_model=SalesListingSchema, status_code=201)
def create_sales_listing(id: str, data: SalesListingCreate, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    listing = SalesListing(
        unit_id=id,
        platform=data.platform,
        target_price=data.target_price,
        listing_url=data.listing_url,
        final_sale_price=data.final_sale_price,
        platform_fees=data.platform_fees,
        shipping_costs=data.shipping_costs,
        is_active=data.is_active
    )
    db.add(listing)
    
    # If final sale price is recorded, optionally update unit status to Sold
    if data.final_sale_price and data.final_sale_price > 0:
        unit.system_status = "Sold"

    db.commit()
    db.refresh(listing)
    return listing

@router.put("/sales/{listing_id}", response_model=SalesListingSchema)
def update_sales_listing(listing_id: str, payload: SalesListingUpdate, db: Session = Depends(get_db)):
    listing = db.query(SalesListing).filter(SalesListing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    # If final_sale_price set, update unit status to Sold
    if listing.final_sale_price and listing.final_sale_price > 0:
        listing.unit.system_status = "Sold"

    db.commit()
    db.refresh(listing)
    return listing

@router.get("/finance/profit/{id}", response_model=NetProfitBreakdown)
def calculate_unit_net_profit(id: str, db: Session = Depends(get_db)):
    unit = db.query(InventoryUnit).filter(InventoryUnit.unit_id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")

    return compute_profit_summary(unit)
