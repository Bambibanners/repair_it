import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class InventoryUnit(Base):
    __tablename__ = "inventory_units"

    unit_id = Column(String(36), primary_key=True, default=generate_uuid)
    brand = Column(String(100), nullable=False)
    model_number = Column(String(100), nullable=False)
    serial_number = Column(String(100), nullable=False, unique=True, index=True)
    category = Column(String(50), nullable=False) # e.g. CD Player, Turntable, Amplifier, Tape Deck, Receiver
    acquisition_source = Column(String(100), nullable=True) # e.g. eBay, Car Boot, Flea Market
    base_cost = Column(Float, nullable=False, default=0.0) # GBP purchase price
    cosmetic_condition = Column(String(50), nullable=False, default="Good") # Mint, Good, Fair, Poor, For Parts
    system_status = Column(String(50), nullable=False, default="Triage") # Triage, On Bench, Waiting Parts, Ready to Sell, Sold, Scrapped
    is_client_job = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    repair_log = relationship("RepairLog", back_populates="unit", uselist=False, cascade="all, delete-orphan")
    part_orders = relationship("PartOrder", back_populates="unit", cascade="all, delete-orphan")
    sales_listings = relationship("SalesListing", back_populates="unit", cascade="all, delete-orphan")
    media_items = relationship("UnitMedia", back_populates="unit", cascade="all, delete-orphan")
    qc_checklist = relationship("QCChecklist", back_populates="unit", uselist=False, cascade="all, delete-orphan")
    client_job = relationship("ClientJob", back_populates="unit", uselist=False, cascade="all, delete-orphan")

class RepairLog(Base):
    __tablename__ = "repair_logs"

    log_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    priority = Column(Integer, default=2) # 1 (High), 2 (Med), 3 (Low)
    initial_symptoms = Column(Text, nullable=True)
    action_plan = Column(Text, nullable=True)
    bench_notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    unit = relationship("InventoryUnit", back_populates="repair_log")

class QCChecklist(Base):
    __tablename__ = "qc_checklists"

    qc_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    dc_offset_mv = Column(Float, nullable=True)
    bias_current_ma = Column(Float, nullable=True)
    channel_balance_ok = Column(Boolean, default=True)
    potentiometers_flushed = Column(Boolean, default=True)
    burn_in_hours = Column(Integer, default=24)
    frequency_response_ok = Column(Boolean, default=True)
    visual_inspection_ok = Column(Boolean, default=True)
    tech_signature = Column(String(100), default="Master Tech")
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    unit = relationship("InventoryUnit", back_populates="qc_checklist")

class ClientJob(Base):
    __tablename__ = "client_jobs"

    job_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    client_name = Column(String(100), nullable=False)
    client_phone = Column(String(50), nullable=True)
    client_email = Column(String(100), nullable=True)
    deposit_paid = Column(Float, default=0.0)
    labor_rate_per_hr = Column(Float, default=45.00)
    labor_hours_spent = Column(Float, default=0.0)
    invoice_notes = Column(Text, nullable=True)
    invoice_status = Column(String(50), default="Draft") # Draft, Sent, Paid

    unit = relationship("InventoryUnit", back_populates="client_job")

class PartOrder(Base):
    __tablename__ = "part_orders"

    part_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    description = Column(String(255), nullable=False)
    supplier = Column(String(100), nullable=True)
    cost = Column(Float, nullable=False, default=0.0)
    order_status = Column(String(50), nullable=False, default="To Order") # To Order, Ordered, Shipped, Received, Installed
    eta_date = Column(Date, nullable=True)

    unit = relationship("InventoryUnit", back_populates="part_orders")

class SalesListing(Base):
    __tablename__ = "sales_listings"

    listing_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    platform = Column(String(50), nullable=False) # e.g. eBay, Reverb, Facebook Marketplace
    target_price = Column(Float, nullable=True)
    listing_url = Column(String(255), nullable=True)
    final_sale_price = Column(Float, nullable=True)
    platform_fees = Column(Float, default=0.0)
    shipping_costs = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    unit = relationship("InventoryUnit", back_populates="sales_listings")

class UnitMedia(Base):
    __tablename__ = "unit_media"

    media_id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(36), ForeignKey("inventory_units.unit_id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False, default="image") # image, video, manual, schematic
    gdrive_file_id = Column(String(100), nullable=True)
    web_view_link = Column(String(500), nullable=True)
    thumbnail_link = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    unit = relationship("InventoryUnit", back_populates="media_items")

class ServiceManual(Base):
    __tablename__ = "service_manuals"

    manual_id = Column(String(36), primary_key=True, default=generate_uuid)
    brand = Column(String(100), nullable=False, index=True)
    model_number = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False, default="Service Manual") # Service Manual, Schematic, Alignment Guide, User Manual
    gdrive_file_id = Column(String(100), nullable=True)
    web_view_link = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    compatibilities = relationship("ManualCompatibility", back_populates="manual", cascade="all, delete-orphan")

class ManualCompatibility(Base):
    __tablename__ = "manual_compatibilities"

    compatibility_id = Column(String(36), primary_key=True, default=generate_uuid)
    manual_id = Column(String(36), ForeignKey("service_manuals.manual_id"), nullable=False)
    brand = Column(String(100), nullable=False, index=True)
    model_number = Column(String(100), nullable=False, index=True)

    manual = relationship("ServiceManual", back_populates="compatibilities")

class MasterPart(Base):
    __tablename__ = "master_parts"

    master_part_id = Column(String(36), primary_key=True, default=generate_uuid)
    part_number = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="General") # Laser Pickup, Belt, Capacitor, IC, Transistor, Mechanical
    supplier = Column(String(100), nullable=True)
    unit_cost = Column(Float, default=0.0)
    stock_qty = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    compatibilities = relationship("PartCompatibility", back_populates="master_part", cascade="all, delete-orphan")

class PartCompatibility(Base):
    __tablename__ = "part_compatibilities"

    compatibility_id = Column(String(36), primary_key=True, default=generate_uuid)
    master_part_id = Column(String(36), ForeignKey("master_parts.master_part_id"), nullable=False)
    brand = Column(String(100), nullable=False, index=True)
    model_number = Column(String(100), nullable=False, index=True)
    notes = Column(String(255), nullable=True)

    master_part = relationship("MasterPart", back_populates="compatibilities")
