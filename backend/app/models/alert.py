from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    severity = Column(String, index=True)  # Critical, High, Medium, Low
    source_ip = Column(String, index=True)
    destination_ip = Column(String, index=True)
    port = Column(Integer)
    attack_type = Column(String, index=True)
    risk_score = Column(Float)
    zeek_evidence = Column(JSON)
    suricata_evidence = Column(Text)
    mitre_attack = Column(String)
    ai_source = Column(String)  # AI1, AI2A, AI2B
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())