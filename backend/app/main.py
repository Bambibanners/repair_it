from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .database import engine, Base
from .seed import seed_database
from .gdrive import LOCAL_UPLOADS_DIR
from .routers import inventory, repair, parts, sales, dashboard, media

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory if needed
os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=LOCAL_UPLOADS_DIR), name="uploads")

# Include API Routers
app.include_router(inventory.router)
app.include_router(repair.router)
app.include_router(parts.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(media.router)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "app": "Repair-It Backend API"}

# Mount frontend dist static files if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
