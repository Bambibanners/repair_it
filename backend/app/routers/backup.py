import os
import shutil
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db, SQLITE_DB_PATH
from ..models import InventoryUnit

router = APIRouter(prefix="/api/v1/system", tags=["System Backup & Export"])

@router.get("/backup")
def download_database_backup():
    if not os.path.exists(SQLITE_DB_PATH):
        raise HTTPException(status_code=404, detail="Database file not found.")
    
    return FileResponse(
        path=SQLITE_DB_PATH,
        filename="repair_it_backup.db",
        media_type="application/octet-stream"
    )

@router.post("/restore")
async def restore_database(file: UploadFile = File(...)):
    if not file.filename.endswith(".db"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a .db SQLite database file.")

    content = await file.read()
    try:
        with open(SQLITE_DB_PATH, "wb") as f:
            f.write(content)
        return {"status": "ok", "message": "Database restored successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore database: {e}")

@router.get("/export/csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    units = db.query(InventoryUnit).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV Header
    writer.writerow([
        "Unit ID", "Brand", "Model Number", "Serial Number", "Category", 
        "Acquisition Source", "Base Cost (£)", "Cosmetic Condition", "System Status", 
        "Client Job", "Parts Cost (£)", "Total Cost Basis (£)", "Target Price (£)", 
        "Final Sale Price (£)", "Platform Fees (£)", "Shipping Costs (£)", "Net Profit (£)"
    ])

    for u in units:
        parts_cost = sum(p.cost for p in u.part_orders) if u.part_orders else 0.0
        total_cost_basis = u.base_cost + parts_cost
        listing = u.sales_listings[0] if u.sales_listings else None
        
        target_price = listing.target_price if listing else 0.0
        final_sale_price = listing.final_sale_price if listing else 0.0
        fees = listing.platform_fees if listing else 0.0
        shipping = listing.shipping_costs if listing else 0.0

        net_profit = (final_sale_price - (total_cost_basis + fees + shipping)) if final_sale_price > 0 else 0.0

        writer.writerow([
            u.unit_id, u.brand, u.model_number, u.serial_number, u.category,
            u.acquisition_source or "", f"{u.base_cost:.2f}", u.cosmetic_condition, u.system_status,
            "Yes" if u.is_client_job else "No", f"{parts_cost:.2f}", f"{total_cost_basis:.2f}",
            f"{target_price:.2f}" if target_price else "", f"{final_sale_price:.2f}" if final_sale_price else "",
            f"{fees:.2f}", f"{shipping:.2f}", f"{net_profit:.2f}" if final_sale_price > 0 else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=repair_it_inventory_export.csv"}
    )
