from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import structlog
import asyncio

from app.config import settings
from app.database import create_tables
from app.routers import auth, alerts, system, websocket
from app.services.websocket import manager
from app.services.sqs_service import sqs_service
from app.services.alert_processor import alert_processor

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

app = FastAPI(
    title="Hybrid SOC API",
    description="AI-Powered Multi-Model Hybrid Cloud Security Monitoring Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Include routers
app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(system.router)
app.include_router(websocket.router)

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    await create_tables()
    # Start SQS consumer
    asyncio.create_task(sqs_service.start_consuming())
    # Start alert processor
    await alert_processor.start_processing()
    structlog.get_logger().info("Hybrid SOC API started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    sqs_service.stop_consuming()
    alert_processor.stop_processing()
    structlog.get_logger().info("Hybrid SOC API shutdown")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "hybrid-soc-api"}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Hybrid SOC API", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )