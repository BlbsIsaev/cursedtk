from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_farmer=user.is_farmer,
        is_admin=False,
        farm_name=user.farm_name,
        location=user.location,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_admin_user(db: Session, user: schemas.AdminCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_farmer=False,
        is_admin=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_products_by_farmer(db: Session, farmer_id: int):
    return db.query(models.Product).filter(models.Product.farmer_id == farmer_id).all()

def create_product(db: Session, product: schemas.ProductCreate, farmer_id: int):
    db_product = models.Product(**product.dict(), farmer_id=farmer_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def create_order(db: Session, order: schemas.OrderCreate, customer_id: int):
    total = 0
    order_items = []
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            total += product.price * item.quantity
            order_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_time": product.price
            })
    
    db_order = models.Order(
        customer_id=customer_id,
        total_amount=total,
        delivery_address=order.delivery_address
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item_data in order_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)
    
    db.commit()
    return db_order
