from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+mysqlconnector://root:12345678@127.0.0.1:3306/farmers_market"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ADMIN_BOOTSTRAP_SECRET: str = "adminbootstrap"
    
    class Config:
        env_file = ".env"

settings = Settings()
