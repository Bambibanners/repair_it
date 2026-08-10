import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_units_stock" in data
    assert "units_on_bench" in data
    assert "thirty_day_profit" in data

def test_inventory_list():
    response = client.get("/api/v1/inventory/")
    assert response.status_code == 200
    units = response.json()
    assert len(units) > 0

def test_inventory_intake():
    unique_sn = f"TEST-SN-{uuid.uuid4().hex[:6]}"
    new_unit = {
        "brand": "Technics",
        "model_number": "SL-1200MK2",
        "serial_number": unique_sn,
        "category": "Turntable",
        "acquisition_source": "Estate Sale",
        "base_cost": 150.00,
        "cosmetic_condition": "Mint",
        "system_status": "Triage",
        "initial_symptoms": "Pitch fader sticks slightly.",
        "priority": 1
    }
    response = client.post("/api/v1/inventory/", json=new_unit)
    assert response.status_code == 201
    data = response.json()
    assert data["brand"] == "Technics"
    assert data["model_number"] == "SL-1200MK2"
    assert data["financial_summary"]["base_cost"] == 150.00
