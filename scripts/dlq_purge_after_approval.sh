#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-southeast-1}"
AWS_PROFILE="${AWS_PROFILE:-}"
DLQ_QUEUE_URL="${DLQ_QUEUE_URL:-}"
DLQ_QUEUE_NAME="${DLQ_QUEUE_NAME:-}"
APPROVAL="${APPROVAL:-}"
FORENSIC_EVIDENCE_SAVED="${FORENSIC_EVIDENCE_SAVED:-no}"
ARTIFACT_ROOT="${ARTIFACT_ROOT:-artifacts/dlq_recovery}"
TIMESTAMP="${TIMESTAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
ARTIFACT_DIR="${ARTIFACT_DIR:-${ARTIFACT_ROOT}/${TIMESTAMP}}"

if [[ -z "$DLQ_QUEUE_URL" ]]; then
  echo "[ERROR] DLQ_QUEUE_URL is required." >&2
  exit 2
fi

if [[ -z "$DLQ_QUEUE_NAME" ]]; then
  DLQ_QUEUE_NAME="$(basename "$DLQ_QUEUE_URL")"
fi

EXPECTED_APPROVAL="I_APPROVE_PURGE_${DLQ_QUEUE_NAME}"

if [[ "$FORENSIC_EVIDENCE_SAVED" != "yes" ]]; then
  echo "[ERROR] FORENSIC_EVIDENCE_SAVED=yes is required before purge." >&2
  exit 3
fi

if [[ "$APPROVAL" != "$EXPECTED_APPROVAL" ]]; then
  echo "[ERROR] Purge approval string mismatch." >&2
  echo "[ERROR] Required: APPROVAL=$EXPECTED_APPROVAL" >&2
  exit 4
fi

AWS_ARGS=(--region "$AWS_REGION")
if [[ -n "$AWS_PROFILE" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

mkdir -p "$ARTIFACT_DIR"

PRE_PURGE="$ARTIFACT_DIR/purge_precheck_queue_attributes.json"
PURGE_RECEIPT="$ARTIFACT_DIR/purge_receipt.json"

echo "[WARNING] PurgeQueue permanently deletes all messages in the DLQ."
echo "[WARNING] This includes visible and in-flight messages."
echo "[WARNING] AWS may take up to 60 seconds to complete purge."

aws sqs get-queue-attributes \
  --queue-url "$DLQ_QUEUE_URL" \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  "${AWS_ARGS[@]}" \
  --output json > "$PRE_PURGE"

aws sqs purge-queue \
  --queue-url "$DLQ_QUEUE_URL" \
  "${AWS_ARGS[@]}"

cat > "$PURGE_RECEIPT" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "operator": "${USER:-unknown}",
  "dlq_queue_url": "$DLQ_QUEUE_URL",
  "dlq_queue_name": "$DLQ_QUEUE_NAME",
  "approval": "$APPROVAL",
  "forensic_evidence_saved": "$FORENSIC_EVIDENCE_SAVED",
  "note": "PurgeQueue requested. Wait at least 60 seconds before checking final queue state."
}
EOF

echo "[INFO] Purge requested. Wait at least 60 seconds before checking DLQ state."
echo "[INFO] Pre-purge attributes: $PRE_PURGE"
echo "[INFO] Purge receipt: $PURGE_RECEIPT"
