from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_farmer: bool = False
    farm_name: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class AdminCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str

class User(UserBase):
    id: int
    is_farmer: bool
    is_admin: bool
    farm_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    organic_certified: bool = False
    stock_quantity: int = 0
    unit: str = "кг"
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    farmer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItem(OrderItemBase):
    id: int
    price_at_time: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    delivery_address: str

class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderAdmin(Order):
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
