from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from app.services.secrets import get_json_secret


AlertUpdateCursor = tuple[datetime, str]


@dataclass(frozen=True)
class FinalAlertUpdate:
    alert: dict[str, Any]
    updated_at: datetime
    event_id: str

    @property
    def cursor(self) -> AlertUpdateCursor:
        return (self.updated_at, self.event_id)


def get_conn() -> psycopg.Connection:
    secret_id = os.environ.get("RDS_SECRET_ID")

    if not secret_id:
        raise RuntimeError("RDS_SECRET_ID is not configured")

    secret = get_json_secret(secret_id)
    timeout_value = os.getenv("RDS_CONNECT_TIMEOUT_SECONDS", "10").strip()
    try:
        connect_timeout = max(1, min(int(timeout_value), 60))
    except ValueError as exc:
        raise RuntimeError("RDS_CONNECT_TIMEOUT_SECONDS must be an integer") from exc
    application_name = os.getenv("RDS_APPLICATION_NAME", "hybrid-soc").strip() or "hybrid-soc"

    return psycopg.connect(
        host=secret["host"],
        port=int(secret.get("port", 5432)),
        dbname=secret["dbname"],
        user=secret["username"],
        password=secret["password"],
        sslmode="require",
        connect_timeout=connect_timeout,
        application_name=application_name,
        row_factory=dict_row,
    )


def upsert_final_alert(alert: dict[str, Any]) -> None:
    event_id = alert.get("event_id") or alert.get("id")
    if not event_id:
        raise ValueError("alert must contain id or event_id")

    event_id = str(event_id)
    alert_id = str(alert.get("id") or f"alert-{event_id}")
    final_label = alert.get("final_label") or alert.get("attack_type")
    storage = alert.get("storage") if isinstance(alert.get("storage"), dict) else {}
    evidence_summary = alert.get("evidence_summary")
    if not isinstance(evidence_summary, dict):
        evidence_summary = {
            "zeek": alert.get("zeek_evidence"),
            "suricata": alert.get("suricata_evidence"),
            "detected_by": alert.get("detected_by") or [],
        }

    sql = """
    INSERT INTO final_alerts (
      alert_id, event_id, severity, attack_type, final_label,
      risk_score, confidence_score, source_ip, destination_ip,
      event_timestamp, evidence_summary, raw_s3_uri, evidence_s3_uri, payload
    )
    VALUES (
      %(alert_id)s, %(event_id)s, %(severity)s, %(attack_type)s, %(final_label)s,
      %(risk_score)s, %(confidence_score)s, %(source_ip)s, %(destination_ip)s,
      %(event_timestamp)s, %(evidence_summary)s, %(raw_s3_uri)s,
      %(evidence_s3_uri)s, %(payload)s
    )
    ON CONFLICT (event_id)
    DO UPDATE SET
      updated_at = clock_timestamp(),
      severity = EXCLUDED.severity,
      attack_type = EXCLUDED.attack_type,
      final_label = EXCLUDED.final_label,
      risk_score = EXCLUDED.risk_score,
      confidence_score = EXCLUDED.confidence_score,
      source_ip = EXCLUDED.source_ip,
      destination_ip = EXCLUDED.destination_ip,
      event_timestamp = EXCLUDED.event_timestamp,
      evidence_summary = EXCLUDED.evidence_summary,
      raw_s3_uri = EXCLUDED.raw_s3_uri,
      evidence_s3_uri = EXCLUDED.evidence_s3_uri,
      payload = EXCLUDED.payload;
    """

    params = {
        "alert_id": alert_id,
        "event_id": event_id,
        "severity": alert.get("severity"),
        "attack_type": alert.get("attack_type"),
        "final_label": final_label,
        "risk_score": alert.get("risk_score"),
        "confidence_score": alert.get("confidence_score"),
        "source_ip": alert.get("source_ip"),
        "destination_ip": alert.get("destination_ip"),
        "event_timestamp": alert.get("timestamp"),
        "evidence_summary": Jsonb(evidence_summary),
        "raw_s3_uri": alert.get("raw_s3_uri") or storage.get("raw_s3_uri"),
        "evidence_s3_uri": alert.get("evidence_s3_uri") or storage.get("evidence_s3_uri"),
        "payload": Jsonb(alert),
    }

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
        conn.commit()


def get_latest_alert_payload() -> dict[str, Any] | None:
    sql = """
    SELECT payload
    FROM final_alerts
    ORDER BY created_at DESC
    LIMIT 1;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()

    if not row:
        return None

    payload = row["payload"]
    if not isinstance(payload, dict):
        raise RuntimeError("latest alert payload must be a JSON object")

    return payload


def list_final_alerts(limit: int = 50) -> list[dict[str, Any]]:
    """Return the most recently persisted alert payloads from RDS.

    The worker persists the complete alert contract in ``payload``. Reading that
    JSON back keeps the API response consistent with live WebSocket alerts.
    """

    bounded_limit = max(1, min(int(limit), 200))
    sql = """
    SELECT payload
    FROM final_alerts
    ORDER BY created_at DESC
    LIMIT %(limit)s;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, {"limit": bounded_limit})
            rows = cur.fetchall()

    alerts: list[dict[str, Any]] = []
    for row in rows:
        payload = row["payload"]
        if not isinstance(payload, dict):
            raise RuntimeError("persisted alert payload must be a JSON object")
        alerts.append(payload)

    return alerts


def get_final_alert(alert_id: str) -> dict[str, Any] | None:
    """Return one durable Final Alert by either its alert or event identifier."""

    normalized_id = str(alert_id).strip()
    if not normalized_id:
        raise ValueError("alert_id is required")

    sql = """
    SELECT payload
    FROM final_alerts
    WHERE alert_id = %(alert_id)s OR event_id = %(alert_id)s
    ORDER BY updated_at DESC
    LIMIT 1;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, {"alert_id": normalized_id})
            row = cur.fetchone()

    if not row:
        return None
    payload = row["payload"]
    if not isinstance(payload, dict):
        raise RuntimeError("persisted alert payload must be a JSON object")
    return payload


def get_latest_alert_update_cursor() -> AlertUpdateCursor:
    """Return an atomic high-water mark for incremental alert synchronization.

    When the table is empty, the database clock becomes the high-water mark so
    an alert committed after this query is still observed by the next poll.
    """

    sql = """
    SELECT
      COALESCE(latest.updated_at, CURRENT_TIMESTAMP) AS updated_at,
      COALESCE(latest.event_id, '') AS event_id
    FROM (VALUES (1)) AS seed(value)
    LEFT JOIN LATERAL (
      SELECT updated_at, event_id
      FROM final_alerts
      ORDER BY updated_at DESC, event_id DESC
      LIMIT 1
    ) AS latest ON TRUE;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()

    if not row:
        raise RuntimeError("failed to read the final-alert update cursor")
    return (_as_utc_datetime(row["updated_at"]), str(row["event_id"] or ""))


def list_final_alert_updates(
    after: AlertUpdateCursor | None,
    *,
    limit: int = 200,
) -> list[FinalAlertUpdate]:
    """Read one ascending page after the total-order cursor.

    ``event_id`` breaks ties when several transactions share the same
    ``updated_at`` value. Callers can immediately request another page when the
    returned page is full, so bursts are not truncated to the dashboard limit.
    """

    bounded_limit = max(1, min(int(limit), 1000))
    params: dict[str, Any] = {"limit": bounded_limit}
    if after is None:
        sql = """
        SELECT payload, updated_at, event_id
        FROM final_alerts
        ORDER BY updated_at ASC, event_id ASC
        LIMIT %(limit)s;
        """
    else:
        params.update(updated_at=after[0], event_id=after[1])
        sql = """
        SELECT payload, updated_at, event_id
        FROM final_alerts
        WHERE (updated_at, event_id) > (%(updated_at)s, %(event_id)s)
        ORDER BY updated_at ASC, event_id ASC
        LIMIT %(limit)s;
        """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

    updates: list[FinalAlertUpdate] = []
    for row in rows:
        payload = row["payload"]
        if not isinstance(payload, dict):
            raise RuntimeError("persisted alert payload must be a JSON object")
        event_id = str(row["event_id"] or "")
        if not event_id:
            raise RuntimeError("persisted alert update has no event_id")
        updates.append(
            FinalAlertUpdate(
                alert=payload,
                updated_at=_as_utc_datetime(row["updated_at"]),
                event_id=event_id,
            )
        )
    return updates


def _as_utc_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        parsed = value
    else:
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError as exc:
            raise RuntimeError(f"invalid final-alert updated_at value: {value!r}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)
