from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta

from app.models.system import SystemStatus as SystemStatusModel, SystemMetrics as SystemMetricsModel
from app.models.alert import Alert as AlertModel
from app.schemas.system import SystemStatus, SystemMetrics, SystemHealth, ThreatStats

async def get_system_status(db: AsyncSession) -> List[SystemStatus]:
    """Get system component status"""
    result = await db.execute(select(SystemStatusModel))
    statuses = result.scalars().all()
    return [SystemStatus.from_orm(status) for status in statuses]

async def get_system_metrics(db: AsyncSession) -> List[SystemMetrics]:
    """Get system metrics"""
    result = await db.execute(select(SystemMetricsModel))
    metrics = result.scalars().all()
    return [SystemMetrics.from_orm(metric) for metric in metrics]

async def get_system_health() -> SystemHealth:
    """Get overall system health"""
    # This would typically check actual service health
    # For now, return mock data
    return SystemHealth(
        websocket="connected",
        ai_engine="AI1",
        aws_sqs="active",
        database="healthy",
        redis="healthy"
    )

async def get_threat_stats(db: AsyncSession) -> ThreatStats:
    """Get threat statistics"""
    # Get total alerts
    result = await db.execute(select(func.count(AlertModel.id)))
    total_alerts = result.scalar()

    # Get alerts in last hour for alerts per minute calculation
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    result = await db.execute(
        select(func.count(AlertModel.id)).where(AlertModel.timestamp >= one_hour_ago)
    )
    recent_alerts = result.scalar()
    alerts_per_minute = recent_alerts / 60.0

    # Get top threat type
    result = await db.execute(
        select(AlertModel.attack_type, func.count(AlertModel.id))
        .group_by(AlertModel.attack_type)
        .order_by(func.count(AlertModel.id).desc())
        .limit(1)
    )
    top_threat_result = result.first()
    top_threat = top_threat_result[0] if top_threat_result else "None"

    # Get threats by type
    result = await db.execute(
        select(AlertModel.attack_type, func.count(AlertModel.id))
        .group_by(AlertModel.attack_type)
    )
    threats_by_type = {row[0]: row[1] for row in result.all()}

    return ThreatStats(
        total_flows=total_alerts * 10,  # Mock multiplier for flows
        total_alerts=total_alerts,
        top_threat=top_threat,
        active_incidents=total_alerts // 10,  # Mock calculation
        alerts_per_minute=round(alerts_per_minute, 2),
        threats_by_type=threats_by_type
    )