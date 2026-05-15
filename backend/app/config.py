from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Hybrid SOC API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:80"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]

    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost/soc_db"

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"

    # JWT settings
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AWS settings
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    # Application settings
    APP_NAME: str = "Hybrid SOC API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:80"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]

    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost/soc_db"

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"

    # JWT settings
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AWS settings
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    SQS_QUEUE_URL: str = "https://sqs.us-east-1.amazonaws.com/123456789012/soc-queue"

    # AI Engine settings
    AI_ENGINE_URL: str = "http://localhost:5000"
    AI_MODELS: List[str] = ["AI1", "AI2A", "AI2B"]

    # WebSocket settings
    WS_MAX_CONNECTIONS: int = 1000
    WS_HEARTBEAT_INTERVAL: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()