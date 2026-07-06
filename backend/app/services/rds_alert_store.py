from __future__ import annotations

import os
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from app.services.secrets import get_json_secret


def get_conn() -> psycopg.Connection:
    secret_id = os.environ.get("RDS_SECRET_ID")

    if not secret_id:
        raise RuntimeError("RDS_SECRET_ID is not configured")

    secret = get_json_secret(secret_id)

    return psycopg.connect(
        host=secret["host"],
        port=int(secret.get("port", 5432)),
        dbname=secret["dbname"],
        user=secret["username"],
        password=secret["password"],
        sslmode="require",
        row_factory=dict_row,
    )


def upsert_final_alert(alert: dict[str, Any]) -> None:
    event_id = alert.get("event_id") or alert.get("id")
    if not event_id:
        raise ValueError("alert must contain id or event_id")

    event_id = str(event_id)
    alert_id = str(alert.get("id") or f"alert-{event_id}")
    final_label = alert.get("final_label") or alert.get("attack_type")

    sql = """
    INSERT INTO final_alerts (
      alert_id, event_id, severity, attack_type, final_label,
      risk_score, confidence_score, source_ip, destination_ip, payload
    )
    VALUES (
      %(alert_id)s, %(event_id)s, %(severity)s, %(attack_type)s, %(final_label)s,
      %(risk_score)s, %(confidence_score)s, %(source_ip)s, %(destination_ip)s,
      %(payload)s
    )
    ON CONFLICT (event_id)
    DO UPDATE SET
      created_at = now(),
      severity = EXCLUDED.severity,
      attack_type = EXCLUDED.attack_type,
      final_label = EXCLUDED.final_label,
      risk_score = EXCLUDED.risk_score,
      confidence_score = EXCLUDED.confidence_score,
      source_ip = EXCLUDED.source_ip,
      destination_ip = EXCLUDED.destination_ip,
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
