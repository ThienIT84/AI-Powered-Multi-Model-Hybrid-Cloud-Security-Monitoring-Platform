from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from typing import List, Optional
from datetime import datetime

from app.models.alert import Alert as AlertModel
from app.schemas.alert import Alert, AlertCreate, AlertFilter

async def get_alerts(db: AsyncSession, filters: AlertFilter) -> List[Alert]:
    """Get alerts with filtering"""
    query = select(AlertModel)

    # Apply filters
    if filters.severity:
        query = query.where(AlertModel.severity == filters.severity)
    if filters.attack_type:
        query = query.where(AlertModel.attack_type == filters.attack_type)
    if filters.ip:
        query = query.where(
            or_(
                AlertModel.source_ip == filters.ip,
                AlertModel.destination_ip == filters.ip
            )
        )
    if filters.mitre_attack:
        query = query.where(AlertModel.mitre_attack == filters.mitre_attack)
    if filters.ai_source:
        query = query.where(AlertModel.ai_source == filters.ai_source)

    # Apply time range filter
    if filters.time_range:
        start_time = filters.time_range.get("start")
        end_time = filters.time_range.get("end")
        if start_time:
            query = query.where(AlertModel.timestamp >= start_time)
        if end_time:
            query = query.where(AlertModel.timestamp <= end_time)

    # Order by timestamp descending
    query = query.order_by(desc(AlertModel.timestamp))

    # Apply pagination
    query = query.offset(filters.offset).limit(filters.limit)

    result = await db.execute(query)
    alerts = result.scalars().all()
    return [Alert.from_orm(alert) for alert in alerts]

async def create_alert(db: AsyncSession, alert: AlertCreate) -> Alert:
    """Create a new alert"""
    db_alert = AlertModel(
        id=alert.id,
        timestamp=datetime.utcnow(),
        severity=alert.severity,
        source_ip=alert.source_ip,
        destination_ip=alert.destination_ip,
        port=alert.port,
        attack_type=alert.attack_type,
        risk_score=alert.risk_score,
        zeek_evidence=alert.zeek_evidence.dict() if alert.zeek_evidence else None,
        suricata_evidence=alert.suricata_evidence,
        mitre_attack=alert.mitre_attack,
        ai_source=alert.ai_source,
        processed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return Alert.from_orm(db_alert)

async def get_alert_by_id(db: AsyncSession, alert_id: str) -> Optional[Alert]:
    """Get alert by ID"""
    result = await db.execute(select(AlertModel).where(AlertModel.id == alert_id))
    alert = result.scalars().first()
    return Alert.from_orm(alert) if alert else None

async def update_alert(db: AsyncSession, alert_id: str, alert_update: AlertCreate) -> Optional[Alert]:
    """Update an existing alert"""
    result = await db.execute(select(AlertModel).where(AlertModel.id == alert_id))
    db_alert = result.scalars().first()
    if not db_alert:
        return None

    # Update fields
    for field, value in alert_update.dict(exclude_unset=True).items():
        if field == "zeek_evidence" and value:
            setattr(db_alert, field, value.dict())
        else:
            setattr(db_alert, field, value)

    db_alert.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_alert)
    return Alert.from_orm(db_alert)