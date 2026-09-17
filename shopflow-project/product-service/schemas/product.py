# schemas/product.py
#
# What this file does:
# Defines the shape of data coming IN (requests) and going OUT (responses).
#
# Feynman version:
# Think of schemas like customs at an airport.
# Customs has a checklist: "Do you have a valid passport? Anything to declare?"
# Pydantic schemas do the same for API data:
# "Does this request have a name? Is price a number? Is stock an integer?"
# If anything is wrong, FastAPI auto-rejects it with a clear error — before
# our handler even runs. No bad data ever reaches our database.
#
# Two types of schemas:
#   - "Request" schemas: what we EXPECT to receive (input validation)
#   - "Response" schemas: what we PROMISE to send back (output shape)

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# ── Category Schemas ────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    """Shape of data needed to CREATE a category"""
    name: str = Field(..., min_length=1, max_length=100, example="Electronics")
    description: Optional[str] = Field(None, example="Electronic gadgets and devices")


class CategoryResponse(BaseModel):
    """Shape of data we RETURN when someone asks about a category"""
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    # model_config tells Pydantic: "read data from SQLAlchemy model attributes"
    # Without this, Pydantic wouldn't know how to read from our DB objects
    model_config = ConfigDict(from_attributes=True)


# ── Product Schemas ─────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    """Shape of data needed to CREATE a product (admin only)"""
    name:        str            = Field(..., min_length=1, example="iPhone 15 Pro")
    description: Optional[str] = Field(None, example="Latest Apple smartphone")
    price:       float          = Field(..., gt=0, example=79999.00)   # gt=0 means price > 0
    image_url:   Optional[str] = Field(None, example="https://example.com/iphone.jpg")
    stock:       int            = Field(default=0, ge=0, example=100)  # ge=0 means stock >= 0
    category_id: Optional[int] = Field(None, example=1)


class ProductUpdate(BaseModel):
    """Shape of data for UPDATING a product — all fields optional"""
    name:        Optional[str]   = None
    description: Optional[str]   = None
    price:       Optional[float] = Field(None, gt=0)
    image_url:   Optional[str]   = None
    category_id: Optional[int]   = None


class StockUpdate(BaseModel):
    """Used when Order Service updates stock after a purchase"""
    quantity: int = Field(..., description="Positive = add stock, Negative = reduce stock")


class ProductResponse(BaseModel):
    """Shape of data we RETURN for a single product"""
    id:          int
    name:        str
    description: Optional[str]
    price:       float
    image_url:   Optional[str]
    stock:       int
    is_active:   bool
    category_id: Optional[int]
    category:    Optional[CategoryResponse]   # nested category info
    created_at:  datetime
    updated_at:  Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Shape of response when listing multiple products (with pagination)"""
    products:    list[ProductResponse]
    total:       int           # total number of products in DB
    page:        int           # current page
    per_page:    int           # items per page
    total_pages: int           # how many pages total
