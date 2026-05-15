from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ZeekEvidence(BaseModel):
    uri: Optional[str] = None
    method: Optional[str] = None
    user_agent: Optional[str] = None
    host: Optional[str] = None
    status_code: Optional[int] = None
    duration: Optional[float] = None
    orig_bytes: Optional[int] = None
    resp_bytes: Optional[int] = None
    conn_state: Optional[str] = None
    history: Optional[str] = None

class AlertBase(BaseModel):
    severity: str = Field(..., description="Alert severity: Critical, High, Medium, Low")
    source_ip: str = Field(..., description="Source IP address")
    destination_ip: str = Field(..., description="Destination IP address")
    port: int = Field(..., description="Destination port")
    attack_type: str = Field(..., description="Type of attack detected")
    risk_score: float = Field(..., ge=0, le=100, description="Risk score (0-100)")
    zeek_evidence: Optional[ZeekEvidence] = None
    suricata_evidence: Optional[str] = None
    mitre_attack: Optional[str] = None
    ai_source: Optional[str] = None

class AlertCreate(AlertBase):
    id: str = Field(..., description="Unique alert identifier")

class Alert(AlertBase):
    id: str
    timestamp: datetime
    processed: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AlertFilter(BaseModel):
    severity: Optional[str] = None
    attack_type: Optional[str] = None
    ip: Optional[str] = None
    time_range: Optional[Dict[str, datetime]] = None
    mitre_attack: Optional[str] = None
    ai_source: Optional[str] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)