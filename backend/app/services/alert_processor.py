from typing import Dict, Any, List
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.alert import Alert as AlertModel
from app.services.ai_engine import ai_engine
from app.services.sqs_service import sqs_service
from app.services.websocket import manager

class AlertProcessor:
    def __init__(self):
        self.processing_queue = asyncio.Queue()
        self.worker_task = None

    async def start_processing(self):
        """Start the alert processing worker"""
        if self.worker_task is None:
            self.worker_task = asyncio.create_task(self._process_alerts_worker())

    def stop_processing(self):
        """Stop the alert processing worker"""
        if self.worker_task:
            self.worker_task.cancel()
            self.worker_task = None

    async def queue_alert(self, alert_data: Dict[str, Any]):
        """Queue an alert for processing"""
        await self.processing_queue.put(alert_data)

    async def _process_alerts_worker(self):
        """Worker that processes alerts from the queue"""
        while True:
            try:
                # Get alert from queue
                alert_data = await self.processing_queue.get()

                # Process alert
                await self._process_single_alert(alert_data)

                # Mark task as done
                self.processing_queue.task_done()

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error processing alert: {e}")

    async def _process_single_alert(self, alert_data: Dict[str, Any]):
        """Process a single alert"""
        try:
            # Send to AI engine for analysis
            ai_insights = await ai_engine.process_alert(alert_data)

            # Store enhanced alert in database
            await self._store_enhanced_alert(alert_data, ai_insights)

            # Send real-time update via WebSocket
            await manager.send_alert({
                "type": "alert_processed",
                "alert": alert_data,
                "ai_insights": ai_insights,
                "timestamp": datetime.utcnow().isoformat()
            })

            print(f"Alert {alert_data.get('id')} processed successfully")

        except Exception as e:
            print(f"Failed to process alert {alert_data.get('id')}: {e}")

    async def _store_enhanced_alert(self, alert_data: Dict[str, Any], ai_insights: Dict[str, Any]):
        """Store the enhanced alert in database"""
        # This would update the alert record with AI insights
        # For now, just mark as processed
        pass

    async def process_batch_alerts(self, alerts: List[Dict[str, Any]]):
        """Process multiple alerts in batch"""
        tasks = []
        for alert in alerts:
            task = asyncio.create_task(self._process_single_alert(alert))
            tasks.append(task)

        await asyncio.gather(*tasks)

    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return {
            "queue_size": self.processing_queue.qsize(),
            "worker_active": self.worker_task is not None and not self.worker_task.done(),
            "ai_model": ai_engine.current_model
        }

# Global alert processor instance
alert_processor = AlertProcessor()