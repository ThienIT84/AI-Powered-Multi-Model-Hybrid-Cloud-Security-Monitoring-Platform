from typing import Dict, Any, Optional, List
import asyncio
import json
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.services.websocket import manager

class AIEngine:
    def __init__(self):
        self.sqs_client = boto3.client(
            'sqs',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        self.queue_url = settings.sqs_queue_url
        self.current_model = "AI1"  # Default model

    async def process_alert(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process alert through AI engine"""
        try:
            # Send alert to SQS for processing
            message_body = json.dumps({
                "alert_id": alert_data.get("id"),
                "data": alert_data,
                "timestamp": datetime.utcnow().isoformat(),
                "model": self.current_model
            })

            response = self.sqs_client.send_message(
                QueueUrl=self.queue_url,
                MessageBody=message_body
            )

            # Simulate AI processing (in real implementation, this would be async)
            await asyncio.sleep(0.1)  # Simulate processing time

            # Generate AI insights
            ai_insights = self._generate_insights(alert_data)

            # Broadcast update via WebSocket
            await manager.send_alert({
                "type": "ai_processed",
                "alert_id": alert_data.get("id"),
                "insights": ai_insights,
                "model_used": self.current_model
            })

            return ai_insights

        except ClientError as e:
            print(f"SQS Error: {e}")
            return {"error": "Failed to process alert"}

    def _generate_insights(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI insights for alert"""
        attack_type = alert_data.get("attack_type", "")
        risk_score = alert_data.get("risk_score", 0)

        insights = {
            "confidence_score": min(95, risk_score + 10),
            "threat_level": self._calculate_threat_level(risk_score),
            "recommended_actions": self._get_recommended_actions(attack_type),
            "similar_incidents": self._find_similar_incidents(attack_type),
            "mitre_mapping": self._map_to_mitre(attack_type),
            "processing_time": "0.15s"
        }

        return insights

    def _calculate_threat_level(self, risk_score: float) -> str:
        """Calculate threat level based on risk score"""
        if risk_score >= 80:
            return "Critical"
        elif risk_score >= 60:
            return "High"
        elif risk_score >= 40:
            return "Medium"
        else:
            return "Low"

    def _get_recommended_actions(self, attack_type: str) -> List[str]:
        """Get recommended actions based on attack type"""
        actions_map = {
            "SQL Injection": [
                "Block source IP immediately",
                "Review database access logs",
                "Update WAF rules",
                "Notify security team"
            ],
            "XSS": [
                "Sanitize user inputs",
                "Implement CSP headers",
                "Review client-side validation",
                "Monitor for data exfiltration"
            ],
            "Brute Force": [
                "Implement rate limiting",
                "Enable account lockout",
                "Review authentication logs",
                "Consider MFA requirements"
            ],
            "DDoS": [
                "Activate DDoS protection",
                "Scale infrastructure",
                "Filter malicious traffic",
                "Contact ISP if needed"
            ]
        }

        return actions_map.get(attack_type, [
            "Investigate the alert",
            "Review system logs",
            "Update security policies",
            "Monitor for recurrence"
        ])

    def _find_similar_incidents(self, attack_type: str) -> List[Dict[str, Any]]:
        """Find similar historical incidents"""
        # Mock similar incidents
        return [
            {
                "incident_id": "INC-2024-001",
                "similarity_score": 85,
                "outcome": "Blocked",
                "date": "2024-01-15"
            },
            {
                "incident_id": "INC-2024-002",
                "similarity_score": 72,
                "outcome": "Investigated",
                "date": "2024-01-20"
            }
        ]

    def _map_to_mitre(self, attack_type: str) -> Dict[str, Any]:
        """Map attack to MITRE ATT&CK framework"""
        mitre_map = {
            "SQL Injection": {
                "technique": "T1190",
                "tactic": "Initial Access",
                "description": "Exploit Public-Facing Application"
            },
            "XSS": {
                "technique": "T1189",
                "tactic": "Initial Access",
                "description": "Drive-by Compromise"
            },
            "Brute Force": {
                "technique": "T1110",
                "tactic": "Credential Access",
                "description": "Brute Force"
            },
            "DDoS": {
                "technique": "T1498",
                "tactic": "Impact",
                "description": "Network Denial of Service"
            }
        }

        return mitre_map.get(attack_type, {
            "technique": "Unknown",
            "tactic": "Unknown",
            "description": "Unknown attack pattern"
        })

    def switch_model(self, model: str):
        """Switch AI model"""
        valid_models = ["AI1", "AI2A", "AI2B"]
        if model in valid_models:
            self.current_model = model
            return True
        return False

# Global AI engine instance
ai_engine = AIEngine()