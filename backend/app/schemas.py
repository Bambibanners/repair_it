from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date

# QC Checklist Schemas
class QCChecklistBase(BaseModel):
    dc_offset_mv: Optional[float] = None
    bias_current_ma: Optional[float] = None
    channel_balance_ok: bool = True
    potentiometers_flushed: bool = True
    burn_in_hours: int = 24
    frequency_response_ok: bool = True
    visual_inspection_ok: bool = True
    tech_signature: Optional[str] = "Master Tech"
    notes: Optional[str] = None

class QCChecklistUpdate(QCChecklistBase):
    pass

class QCChecklistSchema(QCChecklistBase):
    qc_id: str
    unit_id: str
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Client Job Schemas
class ClientJobBase(BaseModel):
    client_name: str
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    deposit_paid: float = 0.0
    labor_rate_per_hr: float = 45.00
    labor_hours_spent: float = 0.0
    invoice_notes: Optional[str] = None
    invoice_status: str = "Draft"

class ClientJobUpdate(BaseModel):
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    deposit_paid: Optional[float] = None
    labor_rate_per_hr: Optional[float] = None
    labor_hours_spent: Optional[float] = None
    invoice_notes: Optional[str] = None
    invoice_status: Optional[str] = None

class ClientJobSchema(ClientJobBase):
    job_id: str
    unit_id: str

    model_config = ConfigDict(from_attributes=True)

# Master Parts Catalog Schemas
class PartCompatibilityBase(BaseModel):
    brand: str
    model_number: str
    notes: Optional[str] = None

class PartCompatibilityCreate(PartCompatibilityBase):
    pass

class PartCompatibilitySchema(PartCompatibilityBase):
    compatibility_id: str
    master_part_id: str

    model_config = ConfigDict(from_attributes=True)

class MasterPartBase(BaseModel):
    part_number: str
    name: str
    category: str = "General"
    supplier: Optional[str] = None
    unit_cost: float = 0.0
    stock_qty: int = 0
    notes: Optional[str] = None

class MasterPartCreate(MasterPartBase):
    compatibilities: List[PartCompatibilityCreate] = []

class MasterPartSchema(MasterPartBase):
    master_part_id: str
    created_at: datetime
    compatibilities: List[PartCompatibilitySchema] = []

    model_config = ConfigDict(from_attributes=True)

# Media & Manual Schemas
class UnitMediaSchema(BaseModel):
    media_id: str
    unit_id: str
    file_name: str
    file_type: str
    gdrive_file_id: Optional[str] = None
    web_view_link: Optional[str] = None
    thumbnail_link: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ManualCompatibilityBase(BaseModel):
    brand: str
    model_number: str

class ManualCompatibilityCreate(ManualCompatibilityBase):
    pass

class ManualCompatibilitySchema(ManualCompatibilityBase):
    compatibility_id: str
    manual_id: str

    model_config = ConfigDict(from_attributes=True)

class ServiceManualSchema(BaseModel):
    manual_id: str
    brand: str
    model_number: str
    title: str
    doc_type: str = "Service Manual"
    gdrive_file_id: Optional[str] = None
    web_view_link: Optional[str] = None
    uploaded_at: datetime
    compatibilities: List[ManualCompatibilitySchema] = []

    model_config = ConfigDict(from_attributes=True)

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
    is_client_job: bool = False
    has_remote: bool = False
    has_physical_manual: bool = False
    other_accessories: Optional[str] = None

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
    is_client_job: Optional[bool] = None
    has_remote: Optional[bool] = None
    has_physical_manual: Optional[bool] = None
    other_accessories: Optional[str] = None

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
    media_items: List[UnitMediaSchema] = []
    qc_checklist: Optional[QCChecklistSchema] = None
    client_job: Optional[ClientJobSchema] = None
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
