from fastapi import APIRouter, Query
from typing import Optional
from ..pricing import calculate_market_valuation

router = APIRouter(prefix="/api/v1/market", tags=["UK eBay Market Valuation"])

@router.get("/valuation")
def get_market_valuation_endpoint(
    brand: str = Query(...),
    model_number: str = Query(...),
    category: Optional[str] = Query("General"),
    seller_price: Optional[float] = Query(0.0)
):
    return calculate_market_valuation(
        brand=brand,
        model_number=model_number,
        category=category,
        seller_price=seller_price or 0.0
    )
