# models/product.py
#
# What this file does:
# Defines what a Product and Category look like in MySQL.
# These are the "blueprints" — SQLAlchemy uses them to create and manage tables.
#
# Feynman version:
# If MySQL is a filing cabinet, this file is the form template.
# Every product saved in MySQL must follow this exact template —
# it must have a name, a price, a category, a stock count, etc.
# SQLAlchemy reads this template and creates the actual drawer (table) in MySQL.

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Category(Base):
    # This Python class = the "categories" table in MySQL
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name        = Column(String(100), nullable=False, unique=True)   # e.g. "Electronics"
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: one category has many products
    # Think of it like: Electronics category → [iPhone, Samsung TV, Laptop, ...]
    # SQLAlchemy handles the JOIN queries for us
    products    = relationship("Product", back_populates="category")


class Product(Base):
    # This Python class = the "products" table in MySQL
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name        = Column(String(255), nullable=False)          # e.g. "iPhone 15"
    description = Column(Text, nullable=True)                  # Long product description
    price       = Column(Float, nullable=False)                # e.g. 79999.00
    image_url   = Column(Text, nullable=True)                  # URL or uploaded data URL
    stock       = Column(Integer, default=0, nullable=False)   # How many in stock
    is_active   = Column(Boolean, default=True)                # False = product hidden/deleted
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship: each product belongs to one category
    category    = relationship("Category", back_populates="products")
