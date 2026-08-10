from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date

# Part Order Schemas
class PartOrderBase(BaseModel):
    description: str
    supplier: Optional[str] = None
    cost: float = 0.0
    order_status: str = "To Order"
    eta_date: Optional[date] = None

class PartOrderCreate(PartOrderBase):
    pass

class PartOrderUpdate(BaseModel):
    description: Optional[str] = None
    supplier: Optional[str] = None
    cost: Optional[float] = None
    order_status: Optional[str] = None
    eta_date: Optional[date] = None

class PartOrderSchema(PartOrderBase):
    part_id: str
    unit_id: str

    model_config = ConfigDict(from_attributes=True)

# Repair Log Schemas
class RepairLogBase(BaseModel):
    priority: int = 2
    initial_symptoms: Optional[str] = None
    action_plan: Optional[str] = None
    bench_notes: Optional[str] = None

class RepairLogCreate(RepairLogBase):
    pass

class RepairLogUpdate(BaseModel):
    priority: Optional[int] = None
    initial_symptoms: Optional[str] = None
    action_plan: Optional[str] = None
    bench_notes: Optional[str] = None

class RepairLogSchema(RepairLogBase):
    log_id: str
    unit_id: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Sales Listing Schemas
class SalesListingBase(BaseModel):
    platform: str
    target_price: Optional[float] = None
    listing_url: Optional[str] = None
    final_sale_price: Optional[float] = None
    platform_fees: float = 0.0
    shipping_costs: float = 0.0
    is_active: bool = True

class SalesListingCreate(SalesListingBase):
    pass

class SalesListingUpdate(BaseModel):
    platform: Optional[str] = None
    target_price: Optional[float] = None
    listing_url: Optional[str] = None
    final_sale_price: Optional[float] = None
    platform_fees: Optional[float] = None
    shipping_costs: Optional[float] = None
    is_active: Optional[bool] = None

class SalesListingSchema(SalesListingBase):
    listing_id: str
    unit_id: str

    model_config = ConfigDict(from_attributes=True)

# Inventory Unit Schemas
class InventoryUnitBase(BaseModel):
    brand: str
    model_number: str
    serial_number: str
    category: str
    acquisition_source: Optional[str] = None
    base_cost: float = 0.0
    cosmetic_condition: str = "Good"
    system_status: str = "Triage"

class InventoryUnitCreate(InventoryUnitBase):
    initial_symptoms: Optional[str] = None
    priority: Optional[int] = 2

class InventoryUnitStatusUpdate(BaseModel):
    system_status: str

class InventoryUnitUpdate(BaseModel):
    brand: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[str] = None
    acquisition_source: Optional[str] = None
    base_cost: Optional[float] = None
    cosmetic_condition: Optional[str] = None
    system_status: Optional[str] = None

class NetProfitBreakdown(BaseModel):
    unit_id: str
    brand: str
    model_number: str
    base_cost: float
    parts_cost: float
    total_cost_basis: float
    target_price: Optional[float] = None
    final_sale_price: Optional[float] = None
    platform_fees: float
    shipping_costs: float
    total_revenue: float
    net_profit: float
    is_sold: bool

class InventoryUnitDetail(InventoryUnitBase):
    unit_id: str
    created_at: datetime
    repair_log: Optional[RepairLogSchema] = None
    part_orders: List[PartOrderSchema] = []
    sales_listings: List[SalesListingSchema] = []
    financial_summary: Optional[NetProfitBreakdown] = None

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_units_stock: int
    units_on_bench: int
    units_waiting_parts: int
    units_ready_to_sell: int
    units_sold: int
    thirty_day_profit: float
    action_required_items: List[dict]
