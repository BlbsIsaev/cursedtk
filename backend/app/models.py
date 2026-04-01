from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    hashed_password = Column(String(255), nullable=False)
    is_farmer = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    farm_name = Column(String(100))
    farm_description = Column(Text)
    location = Column(String(200))
    phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="farmer")
    orders = relationship("Order", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50))
    organic_certified = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0)
    unit = Column(String(20))
    farmer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    image_url = Column(String(500))
    
    farmer = relationship("User", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="pending")
    delivery_address = Column(String(300))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
