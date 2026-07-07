#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-southeast-1}"
AWS_PROFILE="${AWS_PROFILE:-}"
DLQ_QUEUE_URL="${DLQ_QUEUE_URL:-}"
DLQ_QUEUE_ARN="${DLQ_QUEUE_ARN:-}"
SOURCE_QUEUE_URL="${SOURCE_QUEUE_URL:-}"
SOURCE_QUEUE_ARN="${SOURCE_QUEUE_ARN:-}"
ROOT_CAUSE_FIXED="${ROOT_CAUSE_FIXED:-no}"
CONFIRM_REDRIVE="${CONFIRM_REDRIVE:-no}"
ALLOW_BATCH_REDRIVE="${ALLOW_BATCH_REDRIVE:-no}"
MAX_DLQ_VISIBLE_FOR_REDRIVE="${MAX_DLQ_VISIBLE_FOR_REDRIVE:-10}"
MAX_MESSAGES_PER_SECOND="${MAX_MESSAGES_PER_SECOND:-1}"
ARTIFACT_ROOT="${ARTIFACT_ROOT:-artifacts/dlq_recovery}"
TIMESTAMP="${TIMESTAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
ARTIFACT_DIR="${ARTIFACT_DIR:-${ARTIFACT_ROOT}/${TIMESTAMP}}"

if [[ -z "$DLQ_QUEUE_URL" ]]; then
  echo "[ERROR] DLQ_QUEUE_URL is required for queue attribute checks." >&2
  exit 2
fi

if [[ -z "$DLQ_QUEUE_ARN" ]]; then
  echo "[ERROR] DLQ_QUEUE_ARN is required for start-message-move-task." >&2
  exit 2
fi

if [[ -z "$SOURCE_QUEUE_ARN" ]]; then
  echo "[ERROR] SOURCE_QUEUE_ARN is required to make the redrive destination explicit." >&2
  exit 2
fi

AWS_ARGS=(--region "$AWS_REGION")
if [[ -n "$AWS_PROFILE" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

mkdir -p "$ARTIFACT_DIR"

PRECHECK_RECEIPT="$ARTIFACT_DIR/redrive_precheck.json"
RESULT_RECEIPT="$ARTIFACT_DIR/redrive_result.json"
TASKS_RECEIPT="$ARTIFACT_DIR/redrive_tasks.json"
QUEUE_ATTRS_AFTER="$ARTIFACT_DIR/queue_attributes_after_redrive.json"

echo "[INFO] Checking DLQ visible message count before redrive."
aws sqs get-queue-attributes \
  --queue-url "$DLQ_QUEUE_URL" \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  "${AWS_ARGS[@]}" \
  --output json > "$PRECHECK_RECEIPT"

DLQ_VISIBLE="$(python - "$PRECHECK_RECEIPT" <<'PY'
from __future__ import annotations

import json
import sys

data = json.load(open(sys.argv[1]))
print(data.get("Attributes", {}).get("ApproximateNumberOfMessages", "0"))
PY
)"

echo "[INFO] DLQ visible messages: $DLQ_VISIBLE"
echo "[INFO] MAX_DLQ_VISIBLE_FOR_REDRIVE: $MAX_DLQ_VISIBLE_FOR_REDRIVE"

if [[ "$DLQ_VISIBLE" =~ ^[0-9]+$ ]] && [[ "$MAX_DLQ_VISIBLE_FOR_REDRIVE" =~ ^[0-9]+$ ]]; then
  if (( DLQ_VISIBLE > MAX_DLQ_VISIBLE_FOR_REDRIVE )) && [[ "$ALLOW_BATCH_REDRIVE" != "yes" ]]; then
    echo "[ERROR] DLQ contains more visible messages than allowed for guarded redrive." >&2
    echo "[ERROR] Review full DLQ scope first, then set ALLOW_BATCH_REDRIVE=yes if appropriate." >&2
    exit 3
  fi
else
  echo "[ERROR] DLQ visible count or threshold is not numeric." >&2
  exit 3
fi

if [[ "$ROOT_CAUSE_FIXED" != "yes" ]]; then
  echo "[DRY-RUN] ROOT_CAUSE_FIXED is not yes. Redrive will not start."
  echo "[DRY-RUN] Set ROOT_CAUSE_FIXED=yes after documenting and verifying the fix."
  exit 0
fi

if [[ "$CONFIRM_REDRIVE" != "yes" ]]; then
  echo "[DRY-RUN] CONFIRM_REDRIVE is not yes. Redrive will not start."
  echo "[DRY-RUN] Set CONFIRM_REDRIVE=yes only after reviewing DLQ scope."
  exit 0
fi

echo "[INFO] Starting native SQS DLQ redrive task."
echo "[INFO] Native redrive is queue-level/batch-level, not single-message replay."

aws sqs start-message-move-task \
  --source-arn "$DLQ_QUEUE_ARN" \
  --destination-arn "$SOURCE_QUEUE_ARN" \
  --max-number-of-messages-per-second "$MAX_MESSAGES_PER_SECOND" \
  "${AWS_ARGS[@]}" \
  --output json > "$RESULT_RECEIPT"

TASK_HANDLE="$(python - "$RESULT_RECEIPT" <<'PY'
from __future__ import annotations

import json
import sys

data = json.load(open(sys.argv[1]))
print(data.get("TaskHandle", ""))
PY
)"

cat > "$ARTIFACT_DIR/redrive_request_summary.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "operator": "${USER:-unknown}",
  "dlq_queue_arn": "$DLQ_QUEUE_ARN",
  "source_queue_arn": "$SOURCE_QUEUE_ARN",
  "max_messages_per_second": "$MAX_MESSAGES_PER_SECOND",
  "task_handle": "$TASK_HANDLE"
}
EOF

aws sqs list-message-move-tasks \
  --source-arn "$DLQ_QUEUE_ARN" \
  --max-results 10 \
  "${AWS_ARGS[@]}" \
  --output json > "$TASKS_RECEIPT"

if [[ -n "$SOURCE_QUEUE_URL" ]]; then
  aws sqs get-queue-attributes \
    --queue-url "$SOURCE_QUEUE_URL" \
    --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
    "${AWS_ARGS[@]}" \
    --output json > "$ARTIFACT_DIR/source_queue_attributes_after_redrive.json"
fi

aws sqs get-queue-attributes \
  --queue-url "$DLQ_QUEUE_URL" \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  "${AWS_ARGS[@]}" \
  --output json > "$QUEUE_ATTRS_AFTER"

echo "[INFO] Redrive task handle: $TASK_HANDLE"
echo "[INFO] Redrive result: $RESULT_RECEIPT"
echo "[INFO] Recent redrive tasks: $TASKS_RECEIPT"
echo "[INFO] Queue attributes after redrive: $QUEUE_ATTRS_AFTER"
