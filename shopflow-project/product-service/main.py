# main.py
#
# What this file does:
# The entry point of the Product Service.
# Creates the FastAPI app, connects the database, registers all routes, starts the server.
#
# Feynman version:
# This is the "opening checklist" of our products department:
#  1. Read the config (DB credentials, port)
#  2. Connect to MySQL and create tables if missing
#  3. Set up the signboards (routes)
#  4. Open the doors (start server)
#
# Run with: uvicorn main:app --host 0.0.0.0 --port 8002 --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from sqlalchemy import text
import os

from config.database import engine, Base
from routes.product_routes import router

# Load environment variables from .env file first
load_dotenv()


# lifespan handles startup and shutdown events
# @asynccontextmanager makes it work with FastAPI's lifespan system
# Feynman: like the store manager's morning routine (startup) and closing routine (shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──
    # Create all tables in MySQL if they don't already exist
    # SQLAlchemy reads our models (Product, Category) and creates the tables
    # It's smart — if the table already exists, it does nothing
    Base.metadata.create_all(bind=engine)
    # Existing databases need an explicit migration because create_all does not
    # change the type of an already-created column.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT NULL"))
    print("✅ Database tables created / verified")
    print("🚀 Product Service is starting...")

    yield  # app runs here — everything after yield is SHUTDOWN logic

    # ── SHUTDOWN ──
    print("🛑 Product Service shutting down...")


# Create the FastAPI application
app = FastAPI(
    title="ShopFlow — Product Service",
    description="Manages products, categories, and inventory for the ShopFlow e-commerce platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",      # Swagger UI at http://localhost:8002/docs
    redoc_url="/redoc",    # ReDoc UI at http://localhost:8002/redoc
)

# CORS middleware — allows the React frontend (running on a different port)
# to call this service without browser security blocking it
# Feynman: like allowing visitors from other cities into your building
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # In production: replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all product and category routes
app.include_router(router)


# Health check endpoint
# Simple endpoint to confirm the service is alive
# Used by API Gateway and Kubernetes later
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "product-service",
        "port": os.getenv("PORT", "8002")
    }


# ── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    print(f"📋 Routes:")
    print(f"   GET    /api/products")
    print(f"   GET    /api/products/{{id}}")
    print(f"   POST   /api/products          [admin only]")
    print(f"   PUT    /api/products/{{id}}     [admin only]")
    print(f"   PUT    /api/products/{{id}}/stock")
    print(f"   DELETE /api/products/{{id}}     [admin only]")
    print(f"   GET    /api/categories")
    print(f"   POST   /api/categories         [admin only]")
    print(f"   DELETE /api/categories/{{id}}   [admin only]")
    print(f"   GET    /health")
    print(f"   GET    /docs                   (Swagger UI)")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
