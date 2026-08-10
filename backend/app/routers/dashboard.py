from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models import InventoryUnit, PartOrder, SalesListing
from ..schemas import DashboardStats
from .inventory import compute_profit_summary

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    all_units = db.query(InventoryUnit).all()
    
    total_units_stock = len([u for u in all_units if u.system_status != "Sold" and u.system_status != "Scrapped"])
    units_on_bench = len([u for u in all_units if u.system_status == "On Bench"])
    units_waiting_parts = len([u for u in all_units if u.system_status == "Waiting Parts"])
    units_ready_to_sell = len([u for u in all_units if u.system_status == "Ready to Sell"])
    units_sold = len([u for u in all_units if u.system_status == "Sold"])

    # 30 day profit calculation
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    thirty_day_profit = 0.0

    for u in all_units:
        if u.system_status == "Sold":
            p = compute_profit_summary(u)
            thirty_day_profit += p.net_profit

    # Action items list
    action_items = []

    # 1. Check for parts that arrived or are installed recently
    for u in all_units:
        if u.system_status == "Waiting Parts":
            received_parts = [p for p in u.part_orders if p.order_status in ["Received", "Installed"]]
            if received_parts:
                part_names = ", ".join([p.description for p in received_parts])
                action_items.append({
                    "id": f"part-{u.unit_id}",
                    "type": "part_arrived",
                    "title": "Part Arrived",
                    "message": f"{part_names} for {u.brand} {u.model_number}",
                    "unit_id": u.unit_id,
                    "action_text": "Move to Bench",
                    "target_status": "On Bench"
                })

    # 2. Check for sold listings needing dispatch
    for u in all_units:
        if u.system_status == "Sold":
            action_items.append({
                "id": f"sold-{u.unit_id}",
                "type": "unit_sold",
                "title": "Listing Sold",
                "message": f"{u.brand} {u.model_number} has been sold.",
                "unit_id": u.unit_id,
                "action_text": "View Financials",
                "target_status": None
            })

    # 3. High priority units sitting in triage
    for u in all_units:
        if u.system_status == "Triage" and u.repair_log and u.repair_log.priority == 1:
            action_items.append({
                "id": f"triage-{u.unit_id}",
                "type": "high_priority_triage",
                "title": "High Priority Triage",
                "message": f"{u.brand} {u.model_number} needs urgent workbench diagnosis.",
                "unit_id": u.unit_id,
                "action_text": "Start Bench Repair",
                "target_status": "On Bench"
            })

    return DashboardStats(
        total_units_stock=total_units_stock,
        units_on_bench=units_on_bench,
        units_waiting_parts=units_waiting_parts,
        units_ready_to_sell=units_ready_to_sell,
        units_sold=units_sold,
        thirty_day_profit=round(thirty_day_profit, 2),
        action_required_items=action_items
    )
