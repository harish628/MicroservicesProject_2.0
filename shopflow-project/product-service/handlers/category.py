# handlers/category.py
#
# What this file does:
# Handles all category-related operations.
# Categories are like "departments" in a store — Electronics, Clothing, Books etc.
# Products belong to categories. Categories make browsing easier.

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from config.auth import admin_only
from models.product import Category
from schemas.product import CategoryCreate, CategoryResponse


async def get_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    """Returns all categories — public, no token needed"""
    return db.query(Category).all()


async def create_category(
    category_data: CategoryCreate,
    db:   Session = Depends(get_db),
    user: dict    = Depends(admin_only)
) -> CategoryResponse:
    """Creates a new category. Admin only."""
    # Check if category with same name already exists
    existing = db.query(Category).filter(Category.name == category_data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category with this name already exists")

    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


async def delete_category(
    category_id: int,
    db:   Session = Depends(get_db),
    user: dict    = Depends(admin_only)
) -> dict:
    """Deletes a category. Admin only. Will not delete if products still reference it."""
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()

    return {"message": f"Category '{category.name}' deleted", "category_id": category_id}
