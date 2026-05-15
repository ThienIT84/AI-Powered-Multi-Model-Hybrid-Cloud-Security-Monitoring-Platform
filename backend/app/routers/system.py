from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.system import SystemStatus, SystemMetrics, SystemHealth, ThreatStats
from app.schemas.user import User
from app.services.auth import get_current_user
from app.services.system import get_system_status, get_system_metrics, get_system_health, get_threat_stats

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/status", response_model=List[SystemStatus])
async def read_system_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get system component status"""
    return await get_system_status(db)

@router.get("/metrics", response_model=List[SystemMetrics])
async def read_system_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get system metrics"""
    return await get_system_metrics(db)

@router.get("/health", response_model=SystemHealth)
async def read_system_health(
    current_user: User = Depends(get_current_user)
):
    """Get overall system health"""
    return await get_system_health()

@router.get("/threats/stats", response_model=ThreatStats)
async def read_threat_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get threat statistics"""
    return await get_threat_stats(db)