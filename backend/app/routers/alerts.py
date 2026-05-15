from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas.alert import Alert, AlertCreate, AlertFilter
from app.schemas.user import User
from app.services.auth import get_current_user
from app.services.alerts import get_alerts, create_alert, get_alert_by_id, update_alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
async def read_alerts(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[str] = None,
    attack_type: Optional[str] = None,
    ip: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alerts with optional filtering"""
    filters = AlertFilter(
        severity=severity,
        attack_type=attack_type,
        ip=ip,
        limit=limit,
        offset=skip
    )
    alerts = await get_alerts(db, filters)
    return alerts

@router.post("/", response_model=Alert)
async def create_new_alert(
    alert: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new alert"""
    return await create_alert(db, alert)

@router.get("/{alert_id}", response_model=Alert)
async def read_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific alert by ID"""
    alert = await get_alert_by_id(db, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=Alert)
async def update_existing_alert(
    alert_id: str,
    alert_update: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing alert"""
    alert = await update_alert(db, alert_id, alert_update)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert