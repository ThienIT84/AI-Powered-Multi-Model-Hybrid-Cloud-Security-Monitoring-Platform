# S3 + SQS Implementation Plan

## Overview
Integrate Amazon S3 (for evidence storage) and Amazon SQS (for async event processing) into the Hybrid SOC Multi-Model Fusion MVP.

## Goals
- [x] Add S3 service for storing evidence
- [x] Add SQS service for async event processing
- [x] Backward compatible with existing sync processing
- [x] Support hierarchical S3 key structure
- [x] Systemd service for worker process
- [x] Use IAM roles instead of access keys

## Architecture
### Before (Current)
```
Frontend → Backend → Orchestrator (sync) → Fusion → Alert → WebSocket
```

### After (With SQS/S3)
```
Frontend → Backend → SQS → Worker → Orchestrator → Fusion → Alert → WebSocket
                                             ↓
                                          S3 (evidence)
```

## Files Modified/Created
| File | Status | Description |
|------|--------|-------------|
| `docs/s3_sqs_implementation_plan.md` | ✅ Updated | This plan |
| `backend/requirements.txt` | ✅ Updated | Added `boto3` and `python-dotenv` |
| `backend/.env.example` | ✅ Updated | Added AWS config |
| `backend/app/dependencies.py` | ✅ Updated | Initialized S3/SQS services |
| `backend/app/main.py` | ✅ Updated | Added async mode support |
| `backend/app/services/s3_service.py` | ✅ Created | S3 evidence storage service |
| `backend/app/services/sqs_service.py` | ✅ Created | SQS messaging service |
| `backend/scripts/sqs_worker.py` | ✅ Created | Async worker for processing events |
| `backend/scripts/socai-sqs-worker.service` | ✅ Created | Systemd service template |

## IAM Permissions
Attach this policy to your EC2 instance role:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3Permissions",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::socai-dev-data-913626885845",
                "arn:aws:s3:::socai-dev-data-913626885845/*"
            ]
        },
        {
            "Sid": "SQSPermissions",
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
                "sqs:ChangeMessageVisibility"
            ],
            "Resource": "arn:aws:sqs:us-east-1:123456789012:soc-mvp-event-queue"
        }
    ]
}
```

## Implementation Steps (Next Steps)
### 1. S3 Configuration
Use the existing bucket: `socai-dev-data-913626885845`

Evidence will be stored at:
```
evidence/
  http/
    year=2026/
      month=07/
        day=06/
          <event_id>.json
  network_flow/
    year=2026/
      month=07/
        day=06/
          <event_id>.json
```

### 2. SQS Configuration
Create two queues:
- **Main Queue**: `soc-mvp-event-queue` (for processing events)
- **DLQ (Dead Letter Queue)**: `soc-mvp-event-dlq` (for failed events)

Configure main queue to send messages to DLQ after 3 failed attempts.

### 3. Deploy Backend Code
1. Sync code to EC2
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Create `.env` file in backend directory (use `.env.example` as template)
4. Set `PROCESSING_MODE=async` in `.env`

### 4. Systemd Service Setup
1. Copy service file to systemd directory:
   ```bash
   sudo cp backend/scripts/socai-sqs-worker.service /etc/systemd/system/
   ```
2. Edit service file to match your environment (paths, queue URL, etc.)
3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable socai-sqs-worker
   sudo systemctl start socai-sqs-worker
   ```
4. Check status:
   ```bash
   sudo systemctl status socai-sqs-worker
   sudo journalctl -u socai-sqs-worker -f
   ```

### 5. Testing End-to-End
Test the flow:
1. Send event via API:
   ```bash
   curl -X POST "https://<your-cloudfront-domain>/api/events/http" \
     -H "Content-Type: application/json" \
     -d '{
       "method": "GET",
       "uri": "/search?q=test-sqli",
       "source_ip": "10.0.0.1",
       "destination_ip": "192.168.1.10"
     }'
   ```
2. Verify response: Should return `{"status": "queued", "event_id": "..."}`
3. Check worker logs: `sudo journalctl -u socai-sqs-worker -f`
4. Check S3 bucket for evidence file
5. Check WebSocket for alert
6. Check SQS metrics: NumberOfMessagesSent should increase

## API Endpoint Changes
### Async Mode Response
When `PROCESSING_MODE=async`, endpoints return:
```json
{
    "status": "queued",
    "event_id": "abc123-xyz",
    "processing_mode": "async",
    "message": "Event has been queued for processing"
}
```

### Health Check
Updated to show processing mode:
```json
{
    "status": "ok",
    "processing_mode": "async"
}
```
