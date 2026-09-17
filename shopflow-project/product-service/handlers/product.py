# handlers/product.py
#
# What this file does:
# Contains all the logic for every product-related API endpoint.
# Each function here handles ONE specific request.
#
# Feynman version:
# Think of handlers like staff at specific counters in a store:
#   - get_products()    → the person at the "browse products" counter
#   - get_product()     → the person at the "find one item" counter
#   - create_product()  → the stockroom manager who adds new items
#   - update_product()  → the person who updates price tags
#   - update_stock()    → the inventory counter (called by Order Service)
#   - delete_product()  → the manager who removes items from shelves

import math
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from config.database import get_db
from config.auth import verify_token, admin_only
from models.product import Product, Category
from schemas.product import (
    ProductCreate, ProductUpdate, StockUpdate,
    ProductResponse, ProductListResponse
)


# ── GET /products ────────────────────────────────────────────────────────────
async def get_products(
    page:        int = 1,
    per_page:    int = 10,
    category_id: int = None,
    search:      str = None,
    db: Session = Depends(get_db)
) -> ProductListResponse:
    """
    Returns a paginated list of all active products.
    Supports filtering by category and searching by name.

    Feynman: Like a search results page on Amazon.
    You can filter by department (category) or search by keyword.
    Results come in pages so we don't send 10,000 products at once.
    """
    # Start with all active products, eagerly load their category info
    query = db.query(Product).options(joinedload(Product.category)).filter(Product.is_active == True)

    # Apply category filter if provided
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Apply search filter — searches in name OR description
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),        # ilike = case-insensitive LIKE
                Product.description.ilike(f"%{search}%")
            )
        )

    # Count total matching products (before pagination)
    total = query.count()

    # Apply pagination: skip records before current page, take only per_page records
    # Page 1: skip 0, take 10
    # Page 2: skip 10, take 10
    # Page 3: skip 20, take 10
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()

    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page)
    )


# ── GET /products/{id} ───────────────────────────────────────────────────────
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
) -> ProductResponse:
    """
    Returns a single product by its ID.
    Raises 404 if product doesn't exist or is inactive (hidden/deleted).
    """
    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.id == product_id, Product.is_active == True)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    return product


# ── POST /products ───────────────────────────────────────────────────────────
async def create_product(
    product_data: ProductCreate,
    db:   Session = Depends(get_db),
    user: dict    = Depends(admin_only)   # only admins can create products
) -> ProductResponse:
    """
    Creates a new product. Admin only.

    Feynman: The stockroom manager adds a new item to the shelf.
    They fill in the form (name, price, stock, category) and it appears in the store.
    """
    # If category_id provided, verify the category exists
    if product_data.category_id:
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    # Create the Product object from the request data
    new_product = Product(**product_data.model_dump())

    db.add(new_product)
    db.commit()              # save to MySQL
    db.refresh(new_product)  # reload from DB to get auto-generated id, created_at etc.

    # Reload with category relationship
    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == new_product.id).first()


# ── PUT /products/{id} ───────────────────────────────────────────────────────
async def update_product(
    product_id:   int,
    product_data: ProductUpdate,
    db:   Session = Depends(get_db),
    user: dict    = Depends(admin_only)
) -> ProductResponse:
    """
    Updates product details. Admin only.
    Only updates fields that are actually provided (partial update).

    Feynman: The price tag updater. You only tell them which tags to change.
    You don't re-describe the whole product every time you update the price.
    """
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Only update fields that were actually sent (exclude_unset=True skips None values)
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == product.id).first()


# ── PUT /products/{id}/stock ─────────────────────────────────────────────────
async def update_stock(
    product_id:  int,
    stock_data:  StockUpdate,
    db:   Session = Depends(get_db),
    user: dict    = Depends(verify_token)  # any logged-in service can update stock
) -> dict:
    """
    Updates the stock quantity for a product.
    Called by Order Service after a purchase:
      - quantity = -1 means "someone bought 1, reduce stock by 1"
      - quantity = +5 means "5 items restocked"

    Feynman: The inventory counter. Every time something is sold,
    Order Service calls here and says "minus 1". Every restock says "plus N".
    """
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_stock = product.stock + stock_data.quantity

    if new_stock < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Current: {product.stock}, Requested reduction: {abs(stock_data.quantity)}"
        )

    product.stock = new_stock
    db.commit()

    return {
        "message": "Stock updated successfully",
        "product_id": product_id,
        "previous_stock": product.stock - stock_data.quantity,
        "new_stock": new_stock
    }


# ── DELETE /products/{id} ────────────────────────────────────────────────────
async def delete_product(
    product_id: int,
    db:   Session = Depends(get_db),
    user: dict    = Depends(admin_only)
) -> dict:
    """
    Soft deletes a product — sets is_active = False instead of removing from DB.

    Feynman: Like hiding an item from the shelf without throwing it away.
    We keep the data in MySQL (in case old orders reference it)
    but it won't appear in any product listing anymore.
    This is called a "soft delete" — very common in production apps.
    """
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False   # soft delete
    db.commit()

    return {"message": f"Product '{product.name}' deleted successfully", "product_id": product_id}
