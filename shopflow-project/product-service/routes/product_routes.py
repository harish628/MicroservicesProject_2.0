# routes/product_routes.py
#
# What this file does:
# Registers all the API routes (URLs) and connects them to the right handler functions.
#
# Feynman version:
# Think of this as the signboard directory in a shopping mall:
#   "Electronics → Floor 2, Shop 5"
#   "Clothing    → Floor 1, Shop 12"
# This file is that directory — it maps each URL to the right handler.
#
# The actual WORK is done in handlers/. This file just connects URLs to handlers.

from fastapi import APIRouter
from handlers.product import (
    get_products, get_product, create_product,
    update_product, update_stock, delete_product
)
from handlers.category import get_categories, create_category, delete_category

# APIRouter is like a mini-app — we group related routes together
# prefix="/api" means all routes here start with /api
router = APIRouter(prefix="/api")

# ── Product Routes ──────────────────────────────────────────────────────────
# Public routes — no token needed
router.add_api_route("/products",          get_products,    methods=["GET"],    tags=["Products"])
router.add_api_route("/products/{product_id}", get_product, methods=["GET"],    tags=["Products"])

# Protected routes — token required (admin_only enforced inside handler)
router.add_api_route("/products",          create_product,  methods=["POST"],   tags=["Products"])
router.add_api_route("/products/{product_id}", update_product, methods=["PUT"], tags=["Products"])
router.add_api_route("/products/{product_id}/stock", update_stock, methods=["PUT"], tags=["Products"])
router.add_api_route("/products/{product_id}", delete_product, methods=["DELETE"], tags=["Products"])

# ── Category Routes ─────────────────────────────────────────────────────────
router.add_api_route("/categories",        get_categories,   methods=["GET"],   tags=["Categories"])
router.add_api_route("/categories",        create_category,  methods=["POST"],  tags=["Categories"])
router.add_api_route("/categories/{category_id}", delete_category, methods=["DELETE"], tags=["Categories"])
