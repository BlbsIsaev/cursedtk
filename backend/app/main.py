from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from app import crud, schemas, models, auth
from app.database import SessionLocal, engine, get_db
from app.config import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmers Market Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/products", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@app.post("/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_farmer:
        raise HTTPException(status_code=403, detail="Only farmers can add products")
    return crud.create_product(db=db, product=product, farmer_id=current_user.id)

@app.get("/farmers/{farmer_id}/products", response_model=List[schemas.Product])
def read_farmer_products(farmer_id: int, db: Session = Depends(get_db)):
    return crud.get_products_by_farmer(db, farmer_id=farmer_id)

@app.post("/orders", response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_order(db=db, order=order, customer_id=current_user.id)

@app.get("/farmers")
def get_farmers(db: Session = Depends(get_db)):
    farmers = db.query(models.User).filter(models.User.is_farmer == True).all()
    return farmers

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}