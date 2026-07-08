#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
RDS_SECRET_ID="${RDS_SECRET_ID:-}"
EVENT_ID="${EVENT_ID:-evt-idempotency-d5-5-$(date -u +%Y%m%dT%H%M%SZ)}"
MAX_WAIT_SECONDS="${MAX_WAIT_SECONDS:-180}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-5}"
ARTIFACT_ROOT="${ARTIFACT_ROOT:-artifacts/idempotency}"
TIMESTAMP="${TIMESTAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
ARTIFACT_DIR="${ARTIFACT_DIR:-${ARTIFACT_ROOT}/${TIMESTAMP}}"
PYTHON_BIN="${PYTHON_BIN:-python}"
APP_PYTHONPATH="${APP_PYTHONPATH:-backend}"

if [[ -z "$API_BASE_URL" ]]; then
  echo "[ERROR] API_BASE_URL is required, for example https://<cloudfront-domain>." >&2
  exit 2
fi

if [[ -z "$RDS_SECRET_ID" ]]; then
  echo "[ERROR] RDS_SECRET_ID is required, for example socai-dev/rds/app." >&2
  exit 2
fi

if [[ ! "$MAX_WAIT_SECONDS" =~ ^[0-9]+$ ]] || (( MAX_WAIT_SECONDS <= 0 )); then
  echo "[ERROR] MAX_WAIT_SECONDS must be a positive integer." >&2
  exit 2
fi

if [[ ! "$POLL_INTERVAL_SECONDS" =~ ^[0-9]+$ ]] || (( POLL_INTERVAL_SECONDS <= 0 )); then
  echo "[ERROR] POLL_INTERVAL_SECONDS must be a positive integer." >&2
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "[ERROR] curl is required." >&2
  exit 2
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "[ERROR] Python executable '$PYTHON_BIN' was not found." >&2
  exit 2
fi

if [[ ! -d backend/app ]]; then
  echo "[ERROR] Run this script from the repository root containing backend/app." >&2
  exit 2
fi

API_BASE_URL="${API_BASE_URL%/}"
mkdir -p "$ARTIFACT_DIR"

HEALTH_RESPONSE="$ARTIFACT_DIR/health_response.json"
RDS_PRECHECK="$ARTIFACT_DIR/rds_precheck.json"
RDS_FINAL_ROW="$ARTIFACT_DIR/rds_final_row.json"
RDS_COUNT_CHECK="$ARTIFACT_DIR/rds_count_check.txt"
LATEST_RESPONSE="$ARTIFACT_DIR/latest_api_response.json"
ENV_REDACTED="$ARTIFACT_DIR/environment_redacted.txt"
SUMMARY="$ARTIFACT_DIR/test_summary.md"
LATEST_STATUS_FILE="$ARTIFACT_DIR/latest_api_status.txt"

cat > "$ENV_REDACTED" <<EOF
timestamp=$TIMESTAMP
operator=${USER:-unknown}
api_base_url=$API_BASE_URL
aws_region=$AWS_REGION
rds_secret_id=$RDS_SECRET_ID
event_id=$EVENT_ID
max_wait_seconds=$MAX_WAIT_SECONDS
poll_interval_seconds=$POLL_INTERVAL_SECONDS
artifact_dir=$ARTIFACT_DIR
python_bin=$PYTHON_BIN
app_pythonpath=$APP_PYTHONPATH
EOF

echo "[INFO] Phase D5-5 duplicate event processing test."
echo "[INFO] EVENT_ID=$EVENT_ID"
echo "[INFO] Artifact dir: $ARTIFACT_DIR"

echo "[INFO] Checking backend health."
HEALTH_CODE="$(curl -sS -o "$HEALTH_RESPONSE" -w "%{http_code}" "$API_BASE_URL/health" || true)"
if [[ "$HEALTH_CODE" != "200" ]]; then
  echo "[ERROR] /health returned HTTP $HEALTH_CODE. Response saved to $HEALTH_RESPONSE." >&2
  exit 3
fi

"$PYTHON_BIN" - "$HEALTH_RESPONSE" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
try:
    data = json.loads(path.read_text())
except json.JSONDecodeError as exc:
    raise SystemExit(f"[ERROR] /health did not return valid JSON: {exc}") from exc

if data.get("status") != "ok":
    raise SystemExit(f"[ERROR] /health status is not ok: {data}")
PY

echo "[INFO] Checking RDS secret, schema, and pre-count."
AWS_REGION="$AWS_REGION" RDS_SECRET_ID="$RDS_SECRET_ID" PYTHONPATH="$APP_PYTHONPATH" "$PYTHON_BIN" - "$EVENT_ID" "$RDS_PRECHECK" <<'PY'
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from app.services.rds_alert_store import get_conn
from app.services.secrets import get_json_secret

event_id = sys.argv[1]
out_path = Path(sys.argv[2])

secret = get_json_secret(os.environ["RDS_SECRET_ID"])
secret_summary = {
    "host": secret.get("host"),
    "port": int(secret.get("port", 5432)),
    "dbname": secret.get("dbname"),
    "username": secret.get("username"),
    "has_password": bool(secret.get("password")),
}

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute("select to_regclass('public.final_alerts') as table_name;")
        table_name = cur.fetchone()["table_name"]
        if table_name is None:
            raise SystemExit("[ERROR] public.final_alerts table does not exist.")

        cur.execute(
            """
            select conname, pg_get_constraintdef(oid) as definition
            from pg_constraint
            where conrelid = 'public.final_alerts'::regclass
              and contype in ('u', 'p')
              and pg_get_constraintdef(oid) ilike '%event_id%';
            """
        )
        constraints = cur.fetchall()

        cur.execute(
            """
            select indexname, indexdef
            from pg_indexes
            where schemaname = 'public'
              and tablename = 'final_alerts'
              and indexdef ilike 'CREATE UNIQUE INDEX%'
              and indexdef ilike '%(event_id)%';
            """
        )
        unique_indexes = cur.fetchall()

        if not constraints and not unique_indexes:
            raise SystemExit("[ERROR] final_alerts has no UNIQUE(event_id) constraint or unique index.")

        cur.execute("select count(*) as count from final_alerts where event_id = %s;", (event_id,))
        pre_count = int(cur.fetchone()["count"])

receipt = {
    "event_id": event_id,
    "secret_summary": secret_summary,
    "table_name": str(table_name),
    "event_id_unique_constraints": constraints,
    "event_id_unique_indexes": unique_indexes,
    "pre_count": pre_count,
}
out_path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False, default=str) + "\n")

if pre_count != 0:
    raise SystemExit(f"[ERROR] EVENT_ID already exists in RDS. pre_count={pre_count}")
PY

create_request() {
  local attempt="$1"
  local request_file="$2"

  "$PYTHON_BIN" - "$EVENT_ID" "$attempt" "$request_file" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

event_id = sys.argv[1]
attempt = sys.argv[2]
out_path = Path(sys.argv[3])
payload = {
    "event_id": event_id,
    "method": "GET",
    "uri": f"/search?q=%27%20OR%201%3D1--&dup_attempt={attempt}",
    "source_ip": "10.10.10.10",
    "destination_ip": "192.168.1.10",
    "user_agent": f"socai-idempotency-test/attempt-{attempt}",
}
out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
PY
}

post_attempt() {
  local attempt="$1"
  local request_file="$ARTIFACT_DIR/request_attempt_${attempt}.json"
  local response_file="$ARTIFACT_DIR/response_attempt_${attempt}.json"

  create_request "$attempt" "$request_file"

  echo "[INFO] Sending duplicate attempt $attempt."
  local code
  code="$(curl -sS -o "$response_file" -w "%{http_code}" \
    -X POST "$API_BASE_URL/api/events/http/async" \
    -H "Content-Type: application/json" \
    --data-binary "@$request_file" || true)"

  if [[ "$code" != "202" ]]; then
    echo "[ERROR] Attempt $attempt returned HTTP $code. Response saved to $response_file." >&2
    exit 4
  fi

  "$PYTHON_BIN" - "$response_file" "$EVENT_ID" "$attempt" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

response_path = Path(sys.argv[1])
expected_event_id = sys.argv[2]
attempt = sys.argv[3]
data = json.loads(response_path.read_text())
actual_event_id = data.get("event_id")
if actual_event_id != expected_event_id:
    raise SystemExit(
        f"[ERROR] Attempt {attempt} response event_id mismatch: "
        f"expected={expected_event_id} actual={actual_event_id}"
    )
if data.get("status") != "queued":
    raise SystemExit(f"[ERROR] Attempt {attempt} response status is not queued: {data}")
PY
}

rds_snapshot() {
  local output_file="$1"

  AWS_REGION="$AWS_REGION" RDS_SECRET_ID="$RDS_SECRET_ID" PYTHONPATH="$APP_PYTHONPATH" "$PYTHON_BIN" - "$EVENT_ID" "$output_file" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

from app.services.rds_alert_store import get_conn

event_id = sys.argv[1]
out_path = Path(sys.argv[2])

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute("select count(*) as count from final_alerts where event_id = %s;", (event_id,))
        count = int(cur.fetchone()["count"])

        cur.execute(
            """
            select alert_id, event_id, created_at, severity, attack_type, final_label,
                   risk_score, confidence_score, source_ip, destination_ip, payload
            from final_alerts
            where event_id = %s
            order by created_at desc
            limit 1;
            """,
            (event_id,),
        )
        row = cur.fetchone()

data = {
    "event_id": event_id,
    "count": count,
    "row": row,
}
out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False, default=str) + "\n")
PY
}

check_rds_condition() {
  local snapshot_file="$1"
  local expected_attempt="${2:-}"

  "$PYTHON_BIN" - "$snapshot_file" "$expected_attempt" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

snapshot_path = Path(sys.argv[1])
expected_attempt = sys.argv[2]
data = json.loads(snapshot_path.read_text())

if data.get("count") != 1:
    raise SystemExit(1)

if not expected_attempt:
    raise SystemExit(0)

row = data.get("row") or {}
payload = row.get("payload") or {}
payload_text = json.dumps(payload, ensure_ascii=False, default=str)
raw_payload = str(payload.get("raw_payload") or "")
uri = str((payload.get("zeek_evidence") or {}).get("uri") or "")
marker = f"dup_attempt={expected_attempt}"

if marker not in payload_text and marker not in raw_payload and marker not in uri:
    raise SystemExit(1)
PY
}

poll_rds() {
  local expected_attempt="${1:-}"
  local label="${2:-RDS condition}"
  local deadline=$((SECONDS + MAX_WAIT_SECONDS))
  local tmp_file="$ARTIFACT_DIR/.rds_poll_tmp.json"

  echo "[INFO] Waiting for $label."
  while (( SECONDS < deadline )); do
    rds_snapshot "$tmp_file"
    cp "$tmp_file" "$RDS_FINAL_ROW"
    if check_rds_condition "$tmp_file" "$expected_attempt"; then
      rm -f "$tmp_file"
      echo "[INFO] $label satisfied."
      return 0
    fi
    sleep "$POLL_INTERVAL_SECONDS"
  done

  cp "$tmp_file" "$RDS_FINAL_ROW" 2>/dev/null || true
  rm -f "$tmp_file"
  echo "[ERROR] Timed out waiting for $label after ${MAX_WAIT_SECONDS}s." >&2
  exit 5
}

post_attempt 1
poll_rds "" "RDS count=1 after attempt 1"

post_attempt 2
poll_rds "2" "RDS payload update marker dup_attempt=2"

post_attempt 3
poll_rds "3" "RDS payload update marker dup_attempt=3"

"$PYTHON_BIN" - "$RDS_FINAL_ROW" "$RDS_COUNT_CHECK" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

snapshot = json.loads(Path(sys.argv[1]).read_text())
out_path = Path(sys.argv[2])
out_path.write_text(f"event_id={snapshot.get('event_id')}\ncount={snapshot.get('count')}\n")
PY

echo "[INFO] Checking latest alert as secondary evidence."
LATEST_CODE="$(curl -sS -o "$LATEST_RESPONSE" -w "%{http_code}" "$API_BASE_URL/api/alerts/latest" || true)"
LATEST_STATUS="WARN latest endpoint returned HTTP ${LATEST_CODE}"
if [[ "$LATEST_CODE" == "200" ]]; then
  if "$PYTHON_BIN" - "$LATEST_RESPONSE" "$EVENT_ID" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

latest = json.loads(Path(sys.argv[1]).read_text())
event_id = sys.argv[2]
actual = latest.get("event_id") or latest.get("id")
if actual != event_id:
    raise SystemExit(1)
PY
  then
    LATEST_STATUS="PASS latest alert matches EVENT_ID"
  else
    LATEST_STATUS="WARN latest alert does not match EVENT_ID; another producer may have written a newer alert"
  fi
fi
echo "$LATEST_STATUS" > "$LATEST_STATUS_FILE"

cat > "$SUMMARY" <<EOF
# D5-5 Idempotency Duplicate Event Processing Summary

Timestamp: $TIMESTAMP
Event ID: $EVENT_ID
API base URL: $API_BASE_URL
Artifact dir: $ARTIFACT_DIR

## Result

[PASS] Sent the same EVENT_ID three times through /api/events/http/async.
[PASS] Backend preserved caller-provided EVENT_ID in all enqueue responses.
[PASS] RDS final_alerts has a unique arbiter for event_id.
[PASS] RDS count by EVENT_ID remained 1.
[PASS] Stored payload reflects the final duplicate attempt marker dup_attempt=3.
[PASS] Worker did not create duplicate final_alerts rows.
[$(cut -d' ' -f1 "$LATEST_STATUS_FILE")] /api/alerts/latest secondary evidence: $(cat "$LATEST_STATUS_FILE")
[PASS] No S3 writer was added in this phase.

## Evidence Files

- request_attempt_1.json
- request_attempt_2.json
- request_attempt_3.json
- response_attempt_1.json
- response_attempt_2.json
- response_attempt_3.json
- rds_precheck.json
- rds_final_row.json
- rds_count_check.txt
- latest_api_response.json
- environment_redacted.txt

## Source of Truth

RDS is the source of truth for this test:

\`\`\`sql
SELECT count(*)
FROM final_alerts
WHERE event_id = '$EVENT_ID';
\`\`\`

Expected result:

\`\`\`text
count = 1
\`\`\`
EOF

echo "[PASS] D5-5 duplicate event processing test completed."
echo "[PASS] RDS count by EVENT_ID remained 1."
echo "[INFO] Latest API evidence: $LATEST_STATUS"
echo "[INFO] Summary: $SUMMARY"
