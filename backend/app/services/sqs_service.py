import asyncio
import json
from typing import Dict, Any, Callable
import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.services.ai_engine import ai_engine

class SQSService:
    def __init__(self):
        self.sqs_client = boto3.client(
            'sqs',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        self.queue_url = settings.sqs_queue_url
        self.processing = False

    async def start_consuming(self):
        """Start consuming messages from SQS queue"""
        self.processing = True
        while self.processing:
            try:
                # Receive messages
                response = self.sqs_client.receive_message(
                    QueueUrl=self.queue_url,
                    MaxNumberOfMessages=10,
                    WaitTimeSeconds=20,
                    VisibilityTimeout=30
                )

                messages = response.get('Messages', [])
                if not messages:
                    continue

                # Process messages concurrently
                tasks = []
                for message in messages:
                    task = asyncio.create_task(self._process_message(message))
                    tasks.append(task)

                await asyncio.gather(*tasks)

            except ClientError as e:
                print(f"SQS Error: {e}")
                await asyncio.sleep(5)  # Wait before retrying

    def stop_consuming(self):
        """Stop consuming messages"""
        self.processing = False

    async def _process_message(self, message: Dict[str, Any]):
        """Process a single SQS message"""
        try:
            # Parse message body
            body = json.loads(message['Body'])
            alert_data = body.get('data', {})

            # Process through AI engine
            ai_result = await ai_engine.process_alert(alert_data)

            # Delete message after successful processing
            self.sqs_client.delete_message(
                QueueUrl=self.queue_url,
                ReceiptHandle=message['ReceiptHandle']
            )

            print(f"Processed alert {alert_data.get('id')} with AI insights")

        except json.JSONDecodeError:
            print("Invalid message format")
            # Delete invalid message
            self.sqs_client.delete_message(
                QueueUrl=self.queue_url,
                ReceiptHandle=message['ReceiptHandle']
            )
        except Exception as e:
            print(f"Error processing message: {e}")
            # Don't delete message, let it become visible again

    async def send_message(self, message_body: Dict[str, Any]) -> bool:
        """Send a message to the SQS queue"""
        try:
            response = self.sqs_client.send_message(
                QueueUrl=self.queue_url,
                MessageBody=json.dumps(message_body)
            )
            return True
        except ClientError as e:
            print(f"Failed to send SQS message: {e}")
            return False

    def get_queue_attributes(self) -> Dict[str, Any]:
        """Get queue attributes"""
        try:
            response = self.sqs_client.get_queue_attributes(
                QueueUrl=self.queue_url,
                AttributeNames=['All']
            )
            return response.get('Attributes', {})
        except ClientError as e:
            print(f"Failed to get queue attributes: {e}")
            return {}

# Global SQS service instance
sqs_service = SQSService()