# D5-5 Idempotency Duplicate Event Processing Runbook

## Goal

This runbook validates idempotent processing for the async SQS/RDS pipeline.

The test sends the same application-level `event_id` three times through:

```text
POST /api/events/http/async
```

It does not force SQS Standard to redeliver the same physical message. Instead, it proves that the application contract is safe when duplicate events with the same `event_id` are processed.

Source of truth:

```text
RDS final_alerts.event_id UNIQUE
ON CONFLICT(event_id) DO UPDATE
SELECT count(*) WHERE event_id = EVENT_ID -> 1
```

## When To Run

Run this after:

```text
SQS queue exists
socai-ai-worker is active
RDS final_alerts table exists
worker can write to RDS
/api/events/http/async returns 202
```

This is more important than S3 screenshot evidence for the current phase because SQS Standard is at-least-once delivery.

## Required Environment

Run from the backend deployment directory or repo root where `backend/app` exists.

Example on EC2 worker/backend host:

```bash
cd /home/ec2-user/soc-mvp/current
conda activate interior_ai
```

Set:

```bash
export API_BASE_URL="https://${CF_DOMAIN}"
export AWS_REGION="ap-southeast-1"
export RDS_SECRET_ID="socai-dev/rds/app"
```

Optional:

```bash
export EVENT_ID="evt-idempotency-d5-5-001"
export MAX_WAIT_SECONDS=180
export POLL_INTERVAL_SECONDS=5
export ARTIFACT_ROOT="artifacts/idempotency"
```

If `EVENT_ID` is omitted, the script generates:

```text
evt-idempotency-d5-5-<UTC timestamp>
```

## Run Test

```bash
scripts/run_idempotency_duplicate_event_test.sh
```

The script will:

```text
1. Check /health.
2. Read RDS secret without printing the password.
3. Connect RDS.
4. Confirm final_alerts exists.
5. Confirm final_alerts has UNIQUE(event_id) constraint or unique index.
6. Confirm EVENT_ID does not already exist.
7. Send attempt 1 with dup_attempt=1.
8. Require API response event_id == EVENT_ID.
9. Poll RDS until count = 1.
10. Send attempt 2 with dup_attempt=2.
11. Poll RDS until payload reflects dup_attempt=2.
12. Send attempt 3 with dup_attempt=3.
13. Poll RDS until payload reflects dup_attempt=3.
14. Save latest API response as secondary evidence.
15. Write a summary receipt.
```

## Evidence Output

Receipts are written to:

```text
artifacts/idempotency/<timestamp>/
```

Expected files:

```text
request_attempt_1.json
request_attempt_2.json
request_attempt_3.json
response_attempt_1.json
response_attempt_2.json
response_attempt_3.json
rds_precheck.json
rds_final_row.json
rds_count_check.txt
latest_api_response.json
environment_redacted.txt
test_summary.md
```

The script must not write:

```text
DB password
AWS credentials
secret values
Authorization headers
```

## Manual Verification

If needed, verify RDS directly:

```bash
PYTHONPATH=backend python - <<'PY'
from app.services.rds_alert_store import get_conn

event_id = "evt-idempotency-d5-5-001"

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute(
            "select count(*) as count from final_alerts where event_id = %s;",
            (event_id,),
        )
        print(cur.fetchone())
PY
```

Expected:

```text
{'count': 1}
```

Check the final row:

```bash
PYTHONPATH=backend python - <<'PY'
from app.services.rds_alert_store import get_conn

event_id = "evt-idempotency-d5-5-001"

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select event_id, created_at, payload
            from final_alerts
            where event_id = %s;
            """,
            (event_id,),
        )
        print(cur.fetchone())
PY
```

Expected:

```text
one row only
payload/raw_payload contains dup_attempt=3
```

## Worker Log Evidence

Check:

```bash
sudo journalctl -u socai-ai-worker -n 80 --no-pager
```

Expected:

```text
processed message event_id=<EVENT_ID> alert_id=<...> elapsed=<...>
```

The worker may show the same event ID multiple times because this test intentionally sends the same application event three times. RDS must still have one row.

## Latest API Evidence

The script calls:

```text
GET /api/alerts/latest
```

This is secondary evidence only. The test should not fail if another producer creates a newer alert during the run. RDS count by `event_id` remains the source of truth.

## Acceptance Criteria

```text
[PASS] Same EVENT_ID was sent three times.
[PASS] Backend preserved caller-provided EVENT_ID in each response.
[PASS] final_alerts has UNIQUE(event_id) constraint or unique index.
[PASS] SELECT count(*) WHERE event_id = EVENT_ID returns 1.
[PASS] Stored payload reflects dup_attempt=3.
[PASS] Worker did not create duplicate RDS rows.
[PASS] /api/alerts/latest returns this event when no other producer is active.
[PASS] No S3 writer was added in this phase.
```

## Troubleshooting

If `/health` fails:

```text
Check CloudFront/API route or backend service.
```

If `RDS_SECRET_ID` fails:

```text
Check worker/backend IAM role has secretsmanager:GetSecretValue.
```

If RDS connection fails:

```text
Check RDS security group allows PostgreSQL 5432 from backend/worker SG.
Check VPC, subnet, NACL, route, and RDS endpoint.
```

If pre-count is not zero:

```text
Choose a new EVENT_ID.
Do not reuse old evidence IDs unless you intentionally want to inspect previous state.
```

If final count is greater than 1:

```text
Stop the test.
Inspect final_alerts unique constraint/index.
Do not proceed with SQS Standard demo until idempotency is fixed.
```
