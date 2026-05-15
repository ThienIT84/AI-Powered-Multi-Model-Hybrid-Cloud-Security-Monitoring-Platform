from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SystemStatus(BaseModel):
    component: str
    status: str
    details: Optional[Dict[str, Any]] = None
    last_updated: datetime

class SystemMetrics(BaseModel):
    metric_name: str
    metric_value: float
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class SystemHealth(BaseModel):
    websocket: str  # connected/disconnected
    ai_engine: str  # AI1/AI2A/AI2B
    aws_sqs: str   # active/inactive
    database: str  # healthy/degraded/down
    redis: str     # healthy/degraded/down

class ThreatStats(BaseModel):
    total_flows: int
    total_alerts: int
    top_threat: str
    active_incidents: int
    alerts_per_minute: float
    threats_by_type: Dict[str, int]