#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-southeast-1}"
AWS_PROFILE="${AWS_PROFILE:-}"
DLQ_QUEUE_URL="${DLQ_QUEUE_URL:-}"
ARTIFACT_ROOT="${ARTIFACT_ROOT:-artifacts/dlq_recovery}"
TIMESTAMP="${TIMESTAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
ARTIFACT_DIR="${ARTIFACT_DIR:-${ARTIFACT_ROOT}/${TIMESTAMP}}"

if [[ -z "$DLQ_QUEUE_URL" ]]; then
  echo "[ERROR] DLQ_QUEUE_URL is required." >&2
  exit 2
fi

AWS_ARGS=(--region "$AWS_REGION")
if [[ -n "$AWS_PROFILE" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

mkdir -p "$ARTIFACT_DIR"

RECEIPT="$ARTIFACT_DIR/dlq_message_inspection.json"
SUMMARY="$ARTIFACT_DIR/root_cause_summary.md"

echo "[INFO] Inspecting one DLQ message."
echo "[INFO] Message will be invisible for 30 seconds if one is received."
echo "[INFO] This script never calls DeleteMessage."

aws sqs receive-message \
  --queue-url "$DLQ_QUEUE_URL" \
  --max-number-of-messages 1 \
  --visibility-timeout 30 \
  --attribute-names All \
  --message-attribute-names All \
  "${AWS_ARGS[@]}" \
  --output json > "$RECEIPT"

python - "$RECEIPT" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

receipt_path = Path(sys.argv[1])
data = json.loads(receipt_path.read_text())
messages = data.get("Messages") or []

if not messages:
    print("[INFO] No visible DLQ messages were returned.")
    raise SystemExit(0)

message = messages[0]
body_raw = message.get("Body", "")
try:
    body = json.loads(body_raw)
except json.JSONDecodeError:
    body = None

attrs = message.get("Attributes") or {}

print("[DLQ MESSAGE]")
print(f"MessageId: {message.get('MessageId', '')}")
print(f"ApproximateReceiveCount: {attrs.get('ApproximateReceiveCount', '')}")

if isinstance(body, dict):
    print(f"event_id: {body.get('event_id', '')}")
    print(f"event_type: {body.get('event_type', '')}")
    print(f"source_ip: {body.get('source_ip', '')}")
    print(f"destination_ip: {body.get('destination_ip', '')}")
    print("[Body]")
    print(json.dumps(body, indent=2, ensure_ascii=False))
else:
    print("[Body is not valid JSON]")
    print(body_raw)
PY

if [[ ! -f "$SUMMARY" ]]; then
  cat > "$SUMMARY" <<'EOF'
# DLQ Root Cause Summary

Root cause:

Impact:

Fix applied:

Fix verification:

Redrive scope:
- single known message
- whole DLQ

Redrive approved by:

Purge decision:
- keep forensic evidence
- purge after approval

Purge approved by:

Notes:

EOF
fi

echo "[INFO] Inspection receipt: $RECEIPT"
echo "[INFO] Root cause template: $SUMMARY"
