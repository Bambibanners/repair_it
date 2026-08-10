from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import inventory, repair, parts, sales, dashboard

# Initialize tables
Base.metadata.create_all(bind=engine)

# Seed database with sample vintage gear
seed_database()

app = FastAPI(
    title="Repair-It API",
    description="Backend API for Vintage Electronics Lifecycle Management Platform (Repair-It)",
    version="1.0.0"
)

# Enable CORS for local React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(inventory.router)
app.include_router(repair.router)
app.include_router(parts.router)
app.include_router(sales.router)
app.include_router(dashboard.router)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "app": "Repair-It Backend API"}
