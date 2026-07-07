# DLQ Inspection and Controlled Redrive Runbook

## Goal

Day 4 proved that failed async messages can land in the DLQ. Day 5 adds an operational recovery procedure:

```text
Inspect DLQ
-> classify root cause
-> fix root cause
-> choose redrive scope
-> run controlled redrive
-> verify worker/RDS recovery
-> purge only after approval
```

The goal is controlled recovery, not blind replay. Native SQS redrive with `start-message-move-task` is a queue-level/batch-level operation. It does not redrive only the single message you inspected.

## Required Variables

```bash
export AWS_PROFILE=socai-deploy
export AWS_REGION=ap-southeast-1

export DLQ_QUEUE_URL="<dlq-queue-url>"
export DLQ_QUEUE_ARN="<dlq-queue-arn>"
export SOURCE_QUEUE_URL="<main-source-queue-url>"
export SOURCE_QUEUE_ARN="<main-source-queue-arn>"
export CF_DOMAIN="<cloudfront-domain>"
```

Do not hard-code queue URLs, ARNs, credentials, or secrets inside scripts.

## Step 1 - Inspect One DLQ Message

```bash
AWS_PROFILE="$AWS_PROFILE" \
AWS_REGION="$AWS_REGION" \
DLQ_QUEUE_URL="$DLQ_QUEUE_URL" \
scripts/dlq_inspect_message.sh
```

The script uses:

```bash
aws sqs receive-message \
  --max-number-of-messages 1 \
  --visibility-timeout 30 \
  --attribute-names All \
  --message-attribute-names All
```

Important behavior:

```text
- Inspecting makes the message invisible for the chosen visibility timeout.
- Inspecting may affect receive metadata such as ApproximateReceiveCount.
- The inspect script must never call DeleteMessage.
```

Artifacts:

```text
artifacts/dlq_recovery/<timestamp>/dlq_message_inspection.json
artifacts/dlq_recovery/<timestamp>/root_cause_summary.md
```

## Step 2 - Classify Root Cause

Use this taxonomy:

```text
PAYLOAD_SCHEMA_ERROR
MODEL_RUNTIME_ERROR
RDS_CONNECTION_ERROR
RDS_SCHEMA_ERROR
IAM_PERMISSION_ERROR
SQS_VISIBILITY_TIMEOUT_TOO_SHORT
UNKNOWN_WORKER_EXCEPTION
```

Fill `root_cause_summary.md`:

```text
Root cause:
Impact:
Fix applied:
Fix verification:
Redrive scope:
Redrive approved by:
Purge decision:
Purge approved by:
```

Rule:

```text
UNKNOWN_WORKER_EXCEPTION -> no redrive, no purge, escalate to backend/worker owner.
```

## Step 3 - Fix and Verify the Cause

Examples:

```text
PAYLOAD_SCHEMA_ERROR -> fix event producer or reject bad payload earlier.
RDS_CONNECTION_ERROR -> fix SG/IAM/secret/network.
RDS_SCHEMA_ERROR -> fix final_alerts schema.
IAM_PERMISSION_ERROR -> fix backend/worker role policy.
SQS_VISIBILITY_TIMEOUT_TOO_SHORT -> tune worker processing or visibility timeout.
```

Do not redrive until the root cause has a concrete fix and verification.

## Step 4 - Controlled Redrive

Default redrive is dry-run. A real redrive requires:

```bash
export ROOT_CAUSE_FIXED=yes
export CONFIRM_REDRIVE=yes
```

Run:

```bash
ROOT_CAUSE_FIXED=yes \
CONFIRM_REDRIVE=yes \
AWS_PROFILE="$AWS_PROFILE" \
AWS_REGION="$AWS_REGION" \
DLQ_QUEUE_URL="$DLQ_QUEUE_URL" \
DLQ_QUEUE_ARN="$DLQ_QUEUE_ARN" \
SOURCE_QUEUE_URL="$SOURCE_QUEUE_URL" \
SOURCE_QUEUE_ARN="$SOURCE_QUEUE_ARN" \
scripts/dlq_redrive_to_source.sh
```

Batch guard:

```text
MAX_DLQ_VISIBLE_FOR_REDRIVE=10
```

If the DLQ has more visible messages than the threshold, the script stops unless:

```bash
export ALLOW_BATCH_REDRIVE=yes
```

Throttle:

```bash
export MAX_MESSAGES_PER_SECOND=1
```

The script records:

```text
TaskHandle
DLQ_QUEUE_ARN
SOURCE_QUEUE_ARN
MAX_MESSAGES_PER_SECOND
operator
timestamp
```

It also calls:

```bash
aws sqs list-message-move-tasks \
  --source-arn "$DLQ_QUEUE_ARN" \
  --max-results 10
```

SQS queue metrics are approximate. Use them to observe backlog/trends, not as exact instantaneous counts.

## Step 5 - Verify Worker and RDS Recovery

Check worker logs:

```bash
sudo journalctl -u socai-ai-worker -n 100 --no-pager
```

Expected:

```text
processed message event_id=... alert_id=... elapsed=...s
```

Check latest alert:

```bash
curl -sS "https://${CF_DOMAIN}/api/alerts/latest" | python -m json.tool
```

Expected:

```text
id or event_id matches recovered message
attack_type exists
ai_analysis exists
```

Alternatively, query RDS `final_alerts` by `event_id`.

Redrive is idempotent at the persistence layer because `final_alerts.event_id` is unique and the worker uses upsert.

## Step 6 - Purge Only After Approval

Purge is destructive. AWS may take up to 60 seconds to complete it, and purged messages cannot be retrieved.

Only purge when:

```text
1. message was redriven and recovery was verified, or
2. message is intentionally discarded after forensic evidence is saved.
```

Run:

```bash
FORENSIC_EVIDENCE_SAVED=yes \
APPROVAL="I_APPROVE_PURGE_<dlq-queue-name>" \
AWS_PROFILE="$AWS_PROFILE" \
AWS_REGION="$AWS_REGION" \
DLQ_QUEUE_URL="$DLQ_QUEUE_URL" \
scripts/dlq_purge_after_approval.sh
```

Never purge only to make the dashboard or queue view look clean.

## Fallback If CLI Does Not Support Native Redrive

Use AWS Console DLQ redrive if `aws sqs start-message-move-task` is unavailable.

Do not use manual receive-send-delete as the default fallback because it can accidentally lose message metadata or delete the wrong message.

## Done Criteria

```text
[ ] Inspect script reads one DLQ message.
[ ] Inspect script does not delete the message.
[ ] Inspection receipt is saved.
[ ] root_cause_summary.md is completed.
[ ] Root cause is fixed and verified.
[ ] Redrive task records TaskHandle/result.
[ ] Worker log confirms message reprocessing.
[ ] RDS or /api/alerts/latest confirms alert recovery.
[ ] Purge requires exact approval string.
[ ] Purge requires FORENSIC_EVIDENCE_SAVED=yes.
```
