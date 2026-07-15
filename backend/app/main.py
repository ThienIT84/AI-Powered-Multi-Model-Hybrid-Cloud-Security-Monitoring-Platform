from __future__ import annotations

import asyncio
import base64
import json
import os
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from ipaddress import ip_address, ip_network
from typing import Annotated, Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware

from app.contracts import EventContractError, normalize_event, validate_zeek_ingest_event
from app.dependencies import model_runtime_status, orchestrator, store, websockets, workspace
from app.services.ingest_auth import (
    SIGNATURE_HEADER,
    TIMESTAMP_HEADER,
    IngestAuthenticationConfigurationError,
    IngestAuthenticationError,
    verify_ingest_signature,
)
from app.services.rds_alert_store import (
    AlertUpdateCursor,
    get_final_alert,
    get_latest_alert_update_cursor,
    list_final_alert_updates,
    list_final_alerts,
    upsert_final_alert,
)
from app.services.s3_data_store import archive_raw_zeek_event
from app.services.sqs_producer import send_event_to_sqs
from app.services.telemetry_pipeline import build_telemetry_envelope
from app.services.store import (
    asset_inventory,
    attack_distribution,
    dashboard_summary,
    ioc_inventory,
    network_activity,
    reports_summary,
    summarize_alerts,
)

@asynccontextmanager
async def _application_lifespan(_app: FastAPI) -> AsyncIterator[None]:
    await _start_rds_alert_sync()
    try:
        yield
    finally:
        await _stop_rds_alert_sync()


app = FastAPI(
    title="Hybrid Cloud SOC Backend",
    version="1.0.0",
    lifespan=_application_lifespan,
)

_cors_origins_value = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
_cors_origins = [origin.strip() for origin in _cors_origins_value.split(",") if origin.strip()]
if not _cors_origins:
    _cors_origins = ["http://localhost:3001", "http://127.0.0.1:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_USERS: dict[str, dict[str, Any]] = {
    "admin@defense.soc": {
        "password": "Password123!",
        "user": {
            "fullName": "Chief SOC Architect",
            "email": "admin@defense.soc",
            "role": "Admin",
            "organization": "Antigravity Global Security",
            "mfaEnabled": True,
            "avatar": "CA",
            "lastLogin": "Just Now",
        },
    },
    "analyst@defense.soc": {
        "password": "Password123!",
        "user": {
            "fullName": "Lead Threat Analyst",
            "email": "analyst@defense.soc",
            "role": "SOC Analyst",
            "organization": "Antigravity Global Security",
            "mfaEnabled": False,
            "avatar": "LA",
            "lastLogin": "Just Now",
        },
    },
}

_last_rds_error: str | None = None
_last_rds_read_ok: bool | None = None
_rds_alert_sync_task: asyncio.Task[None] | None = None
_rds_alert_sync_cursor: AlertUpdateCursor | None = None


def _rds_configured() -> bool:
    return bool(os.environ.get("RDS_SECRET_ID"))


def _deployment_target() -> str:
    target = os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower()
    if target in {"local", "dev", "development", "test", "ci"}:
        return "local"
    if target == "aws":
        return "aws"
    return "invalid"


def _rds_alert_sync_enabled() -> bool:
    explicit = os.getenv("RDS_ALERT_SYNC_ENABLED")
    if explicit is not None:
        return explicit.strip().lower() in {"1", "true", "yes", "on"}
    return _rds_configured() and _deployment_target() == "aws"


def _rds_alert_sync_settings() -> tuple[float, int]:
    try:
        interval = float(os.getenv("RDS_ALERT_SYNC_INTERVAL_SECONDS", "2"))
    except ValueError:
        interval = 2.0
    try:
        batch_size = int(os.getenv("RDS_ALERT_SYNC_BATCH_SIZE", "200"))
    except ValueError:
        batch_size = 200
    return max(0.5, interval), max(1, min(batch_size, 1000))


def _require_legacy_ingest_allowed() -> None:
    explicit = os.getenv("ALLOW_LEGACY_INGEST", "").strip().lower() in {"1", "true", "yes", "on"}
    if _deployment_target() != "local" and not explicit:
        raise HTTPException(status_code=404, detail="route is disabled in the AWS deployment target")


def _alert_key(alert: dict[str, Any]) -> str:
    return str(alert.get("id") or alert.get("event_id") or "")


def _timestamp_value(alert: dict[str, Any]) -> float:
    value = alert.get("timestamp")
    if not value:
        return 0.0
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return 0.0
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.timestamp()


def _merge_alert_collections(*collections: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    anonymous: list[dict[str, Any]] = []
    for collection in collections:
        for alert in collection:
            key = _alert_key(alert)
            if not key:
                anonymous.append(dict(alert))
                continue
            by_id[key] = {**by_id.get(key, {}), **alert}
    merged = [*by_id.values(), *anonymous]
    merged.sort(key=_timestamp_value, reverse=True)
    return merged[:limit]


def _read_rds_alerts(limit: int) -> list[dict[str, Any]]:
    global _last_rds_error, _last_rds_read_ok
    if not _rds_configured():
        if _deployment_target() == "aws":
            _last_rds_error = "RDS_SECRET_ID is not configured"
            _last_rds_read_ok = False
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Final Alert store is unavailable: RDS_SECRET_ID is not configured",
            )
        _last_rds_error = None
        _last_rds_read_ok = None
        return []
    try:
        alerts = list_final_alerts(limit=limit)
        _last_rds_error = None
        _last_rds_read_ok = True
        return alerts
    except Exception as exc:  # noqa: BLE001 - local mode may use its process-local fallback.
        _last_rds_error = f"{type(exc).__name__}: {exc}"
        _last_rds_read_ok = False
        if _deployment_target() == "aws":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Final Alert store is temporarily unavailable",
            ) from exc
        return []


def _merged_alerts(limit: int = 50) -> list[dict[str, Any]]:
    bounded_limit = max(1, min(int(limit), 200))
    persisted = _read_rds_alerts(bounded_limit)
    if _deployment_target() == "aws":
        # RDS is the durable source of truth for every API node behind the ALB.
        # Process-local memory is only a WebSocket/cache aid and must never hide
        # an RDS outage or expose uncommitted analyst state.
        return persisted[:bounded_limit]
    memory = store.list(limit=bounded_limit)
    # Memory wins duplicate fields because it contains the newest live/action state.
    return _merge_alert_collections(persisted, memory, limit=bounded_limit)


def _persist_alert_best_effort(alert: dict[str, Any]) -> None:
    global _last_rds_error, _last_rds_read_ok
    if not _rds_configured():
        if _deployment_target() == "aws":
            _last_rds_error = "RDS_SECRET_ID is not configured"
            _last_rds_read_ok = False
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Final Alert store is unavailable: RDS_SECRET_ID is not configured",
            )
        return
    try:
        upsert_final_alert(alert)
        _last_rds_error = None
        _last_rds_read_ok = True
    except Exception as exc:  # noqa: BLE001 - local mode intentionally remains best-effort.
        _last_rds_error = f"{type(exc).__name__}: {exc}"
        _last_rds_read_ok = False
        if _deployment_target() == "aws":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Final Alert update was not committed because RDS is unavailable",
            ) from exc


def _read_one_alert(alert_id: str) -> dict[str, Any] | None:
    """Read an alert from the deployment's authoritative source."""

    global _last_rds_error, _last_rds_read_ok
    if _deployment_target() != "aws":
        alert = store.get(alert_id)
        if alert is not None:
            return alert
        return next(
            (item for item in _merged_alerts(limit=200) if _alert_key(item) == alert_id),
            None,
        )

    if not _rds_configured():
        _last_rds_error = "RDS_SECRET_ID is not configured"
        _last_rds_read_ok = False
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Final Alert store is unavailable: RDS_SECRET_ID is not configured",
        )
    try:
        alert = get_final_alert(alert_id)
        _last_rds_error = None
        _last_rds_read_ok = True
        return alert
    except Exception as exc:  # noqa: BLE001 - AWS must fail closed on its durable source.
        _last_rds_error = f"{type(exc).__name__}: {exc}"
        _last_rds_read_ok = False
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Final Alert store is temporarily unavailable",
        ) from exc


def _last_seen(alerts: list[dict[str, Any]], predicate: Any) -> str | None:
    matches = [alert for alert in alerts if predicate(alert)]
    if not matches:
        return None
    return str(max(matches, key=_timestamp_value).get("timestamp") or "") or None


def _has_zeek_evidence(alert: dict[str, Any]) -> bool:
    evidence = alert.get("zeek_evidence") or {}
    if not isinstance(evidence, dict):
        return False
    meaningful_fields = (
        "sensor_id",
        "uri",
        "method",
        "user_agent",
        "duration",
        "orig_bytes",
        "resp_bytes",
        "orig_pkts",
        "resp_pkts",
        "conn_state",
        "service",
    )
    return any(evidence.get(field) not in (None, "") for field in meaningful_fields)


def _data_source_status(alerts: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    items = alerts if alerts is not None else _merged_alerts(limit=200)
    zeek_alerts = [alert for alert in items if _has_zeek_evidence(alert)]
    suricata_alerts = [alert for alert in items if bool(alert.get("suricata_evidence"))]
    return [
        {
            "id": "zeek",
            "name": "Zeek Collector / Tailer",
            "type": "security_sensor",
            "configured": None,
            "online": None,
            "status": "unknown",
            "observationStatus": "observed" if zeek_alerts else "not_observed",
            "eventsObserved": len(zeek_alerts),
            "eventCount": len(zeek_alerts),
            "lastSeenAt": _last_seen(items, _has_zeek_evidence),
            "eps": None,
            "message": "Telemetry exists in retained alerts; live sensor health is not probed." if zeek_alerts else "No retained Zeek evidence.",
        },
        {
            "id": "suricata",
            "name": "Suricata",
            "type": "security_sensor",
            "configured": None,
            "online": None,
            "status": "unknown",
            "observationStatus": "observed" if suricata_alerts else "not_observed",
            "eventsObserved": len(suricata_alerts),
            "eventCount": len(suricata_alerts),
            "lastSeenAt": _last_seen(items, lambda alert: bool(alert.get("suricata_evidence"))),
            "eps": None,
            "message": "Telemetry exists in retained alerts; live sensor health is not probed." if suricata_alerts else "No retained Suricata evidence.",
        },
        {
            "id": "aws-sqs",
            "name": "Amazon SQS Telemetry Queue",
            "type": "message_queue",
            "configured": bool(os.environ.get("SQS_QUEUE_URL")),
            "online": None,
            "status": "unknown",
            "configurationStatus": "configured" if os.environ.get("SQS_QUEUE_URL") else "not_configured",
            "eventsObserved": None,
            "eventCount": None,
            "lastSeenAt": None,
            "eps": None,
            "message": "Queue URL is configured; connectivity is not probed." if os.environ.get("SQS_QUEUE_URL") else "SQS_QUEUE_URL is not configured.",
        },
        {
            "id": "amazon-s3-data",
            "name": "Amazon S3 Data Bucket",
            "type": "object_storage",
            "configured": bool(os.environ.get("S3_DATA_BUCKET")),
            "online": None,
            "status": "unknown",
            "configurationStatus": "configured" if os.environ.get("S3_DATA_BUCKET") else "not_configured",
            "eventsObserved": None,
            "eventCount": None,
            "lastSeenAt": None,
            "eps": None,
            "message": "Data bucket is configured; connectivity is not probed." if os.environ.get("S3_DATA_BUCKET") else "S3_DATA_BUCKET is not configured.",
        },
        {
            "id": "postgresql-rds",
            "name": "Amazon RDS for PostgreSQL",
            "type": "database",
            "configured": _rds_configured(),
            "online": _last_rds_read_ok,
            "status": "healthy" if _last_rds_read_ok is True else ("warning" if _last_rds_read_ok is False else "unknown"),
            "configurationStatus": "configured" if _rds_configured() else "not_configured",
            "eventsObserved": None,
            "eventCount": None,
            "lastSeenAt": None,
            "eps": None,
            "lastError": _last_rds_error,
            "message": _last_rds_error or ("RDS is configured; no read has been attempted." if _rds_configured() and _last_rds_read_ok is None else "RDS_SECRET_ID is not configured." if not _rds_configured() else None),
        },
    ]


def _case_status_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for case in workspace.list_cases():
        status_value = str(case.get("status") or "Open")
        counts[status_value] = counts.get(status_value, 0) + 1
    return counts


def _source_ip_matches(value: str, condition: str) -> bool:
    if not condition:
        return True
    try:
        if "/" in condition:
            return ip_address(value) in ip_network(condition, strict=False)
    except ValueError:
        return False
    return value == condition


def _alert_matches_rule(alert: dict[str, Any], rule: dict[str, Any]) -> bool:
    conditions = rule.get("conditions") or {}
    if not isinstance(conditions, dict):
        return False

    severity_condition = str(conditions.get("severity") or "").upper()
    if severity_condition:
        rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
        if rank.get(str(alert.get("severity") or "").upper(), 0) < rank.get(severity_condition, 0):
            return False

    attack_type = str(conditions.get("attackType") or "").strip().lower()
    if attack_type and attack_type not in str(alert.get("attack_type") or "").lower():
        return False

    protocol = str(conditions.get("protocol") or "").strip().upper()
    if protocol and protocol != str(alert.get("protocol") or "").upper():
        return False

    source_ip = str(conditions.get("sourceIp") or "").strip()
    if source_ip and not _source_ip_matches(str(alert.get("source_ip") or ""), source_ip):
        return False

    destination_port = str(conditions.get("destPort") or "").strip()
    if destination_port:
        try:
            if int(destination_port) != int(alert.get("destination_port") or 0):
                return False
        except ValueError:
            return False

    confidence = conditions.get("confidence")
    if confidence not in (None, ""):
        try:
            threshold = float(confidence)
        except (TypeError, ValueError):
            return False
        threshold = threshold / 100.0 if threshold > 1 else threshold
        if float(alert.get("confidence_score") or 0.0) < threshold:
            return False

    cloud_provider = str(conditions.get("cloudProvider") or "").strip().lower()
    actual_cloud_provider = str(alert.get("cloud_provider") or alert.get("cloudProvider") or "").lower()
    if cloud_provider and cloud_provider != actual_cloud_provider:
        return False

    mitre_id = str(rule.get("mitreId") or "").strip().upper()
    mitre = alert.get("mitre") or {}
    if mitre_id and mitre_id != str(mitre.get("technique_id") or "").upper():
        return False
    return True


def _case_from_alert(alert: dict[str, Any]) -> dict[str, Any]:
    alert_id = _alert_key(alert)
    return {
        "id": f"CASE-{alert_id}",
        "title": f"{alert.get('attack_type') or 'Security alert'} investigation",
        "severity": alert.get("severity") or "Medium",
        "status": "Open",
        "timestamp": alert.get("timestamp"),
        "source_ip": alert.get("source_ip"),
        "destination_ip": alert.get("destination_ip"),
        "attack_type": alert.get("attack_type"),
        "alertId": alert_id,
        "detection": alert.get("ai_analysis") or {},
        "suricata": alert.get("suricata_evidence"),
        "timeline": {"events": [f"{alert.get('timestamp')} - Case created from alert {alert_id}"]},
        "comments": [],
    }


def _encode_demo_token(email: str, role: str, organization: str | None) -> str:
    header = {"alg": "none", "typ": "JWT"}
    payload = {
        "sub": email,
        "role": role,
        "org": organization,
        "exp": int(time.time()) + 8 * 60 * 60,
    }
    encoded_header = base64.b64encode(json.dumps(header).encode()).decode()
    encoded_payload = base64.b64encode(json.dumps(payload).encode()).decode()
    return f"{encoded_header}.{encoded_payload}.demo-signature"


async def _sync_rds_alert_batch(
    cursor: AlertUpdateCursor | None,
    *,
    limit: int,
) -> tuple[AlertUpdateCursor | None, int]:
    updates = await asyncio.to_thread(
        lambda: list_final_alert_updates(cursor, limit=limit)
    )
    next_cursor = cursor
    for update in updates:
        stored, created = store.upsert(update.alert)
        await websockets.broadcast_alert(stored, created=created)
        next_cursor = update.cursor
    return next_cursor, len(updates)


async def _rds_alert_sync_loop() -> None:
    """Fan durable worker results out to this API instance's WebSocket clients.

    Every EC2 API process reads the shared RDS result set, so this remains
    correct behind an ALB/Auto Scaling Group without relying on process-local
    state from the separate SQS worker.  It is near-real-time polling, not a
    replacement for a dedicated pub/sub backplane.
    """

    global _last_rds_error, _last_rds_read_ok, _rds_alert_sync_cursor
    interval, batch_size = _rds_alert_sync_settings()
    while True:
        try:
            _rds_alert_sync_cursor, update_count = await _sync_rds_alert_batch(
                _rds_alert_sync_cursor,
                limit=batch_size,
            )
            _last_rds_error = None
            _last_rds_read_ok = True
            if update_count == batch_size:
                # Drain bursts without waiting a full polling interval. The DB
                # query and each broadcast still yield control to the event loop.
                continue
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001 - a transient RDS failure must not stop the API.
            _last_rds_error = f"{type(exc).__name__}: {exc}"
            _last_rds_read_ok = False
        await asyncio.sleep(interval)


async def _start_rds_alert_sync() -> None:
    global _last_rds_error, _last_rds_read_ok, _rds_alert_sync_cursor, _rds_alert_sync_task
    if _rds_alert_sync_enabled() and _rds_alert_sync_task is None:
        try:
            _rds_alert_sync_cursor = await asyncio.to_thread(get_latest_alert_update_cursor)
            _last_rds_error = None
            _last_rds_read_ok = True
        except Exception as exc:  # noqa: BLE001 - the background loop keeps retrying RDS.
            _rds_alert_sync_cursor = None
            _last_rds_error = f"{type(exc).__name__}: {exc}"
            _last_rds_read_ok = False
        _rds_alert_sync_task = asyncio.create_task(_rds_alert_sync_loop(), name="rds-alert-websocket-sync")


async def _stop_rds_alert_sync() -> None:
    global _rds_alert_sync_cursor, _rds_alert_sync_task
    if _rds_alert_sync_task is None:
        return
    _rds_alert_sync_task.cancel()
    try:
        await _rds_alert_sync_task
    except asyncio.CancelledError:
        pass
    _rds_alert_sync_task = None
    _rds_alert_sync_cursor = None


@app.get("/health")
@app.get("/health/live")
@app.get("/api/health/live")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "hybrid-soc-backend", "deploymentTarget": _deployment_target()}


@app.get("/health/ready")
def readiness() -> dict[str, Any]:
    missing: list[str] = []
    if _deployment_target() == "aws":
        required = {
            "SQS_QUEUE_URL": os.getenv("SQS_QUEUE_URL"),
            "S3_DATA_BUCKET": os.getenv("S3_DATA_BUCKET"),
            "RDS_SECRET_ID": os.getenv("RDS_SECRET_ID"),
            "INGEST_HMAC_SECRET_ID": os.getenv("INGEST_HMAC_SECRET_ID"),
        }
        missing = [name for name, value in required.items() if not value]
    elif _deployment_target() == "invalid":
        missing.append("SOC_DEPLOYMENT_TARGET must be local or aws")

    models = model_runtime_status()
    usable_models = [model for model in models if model.get("status") in {"healthy", "simulated"}]
    if _deployment_target() == "aws":
        require_real_models = os.getenv("AWS_REQUIRE_REAL_MODELS", "true").strip().lower() in {
            "1",
            "true",
            "yes",
            "on",
        }
        if require_real_models:
            model_by_name = {str(model.get("name")): model for model in models}
            unavailable = [
                name
                for name in ("AI1", "AI2A", "AI2B")
                if model_by_name.get(name, {}).get("mode") != "real"
                or model_by_name.get(name, {}).get("status") != "healthy"
            ]
            if unavailable:
                missing.append(f"healthy real models required: {', '.join(unavailable)}")
        elif not usable_models:
            missing.append("at least one usable AI model")
    if missing:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "missing": missing, "deploymentTarget": _deployment_target()},
        )
    return {
        "status": "ready",
        "deploymentTarget": _deployment_target(),
        "usableModels": [model["name"] for model in usable_models],
    }


@app.get("/api/status")
def platform_status() -> dict[str, Any]:
    alerts = _merged_alerts(limit=200)
    summary = summarize_alerts(alerts)
    metrics = store.metrics()
    models = model_runtime_status()
    sources = _data_source_status(alerts)
    known_source_states = [source["online"] for source in sources if isinstance(source.get("online"), bool)]
    database = next((source for source in sources if source["id"] == "postgresql-rds"), None)
    return {
        "deploymentTarget": _deployment_target(),
        "dataSourcesOnline": sum(1 for online in known_source_states if online) if known_source_states else None,
        "dataSourcesTotal": len(sources),
        "modelHealthy": sum(1 for model in models if model["status"] == "healthy"),
        "modelTotal": len(models),
        "eventRatePerSecond": metrics["event_rate_per_second"],
        "lastIngestAt": metrics["last_ingest_at"],
        "lastError": _last_rds_error,
        "dataSources": sources,
        "models": models,
        "databaseStatus": database["status"] if database else "unknown",
        "summary": summary,
    }


@app.post("/api/auth/login")
def login(payload: dict[str, Any]) -> dict[str, Any]:
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    record = AUTH_USERS.get(email)
    if not record or record["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid operator credentials.")

    user = {**record["user"], "lastLogin": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    token = _encode_demo_token(user["email"], user["role"], user.get("organization"))
    return {"token": token, "user": user}


@app.post("/api/auth/register")
def register(payload: dict[str, Any]) -> dict[str, Any]:
    email = str(payload.get("email", "")).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    if email in AUTH_USERS:
        raise HTTPException(status_code=409, detail="Operator already exists.")

    full_name = str(payload.get("fullName", "")).strip() or "Security Operator"
    organization = str(payload.get("organization", "")).strip() or "Independent Sentinel"
    password = str(payload.get("password", ""))
    avatar = "".join(part[:1] for part in full_name.split())[:2].upper() or "OP"
    user = {
        "fullName": full_name,
        "email": email,
        "role": "Security Engineer",
        "organization": organization,
        "mfaEnabled": False,
        "avatar": avatar,
        "lastLogin": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    AUTH_USERS[email] = {"password": password, "user": user}
    token = _encode_demo_token(user["email"], user["role"], user.get("organization"))
    return {"token": token, "user": user}


@app.post("/api/auth/logout")
def logout() -> dict[str, bool]:
    return {"success": True}


@app.post("/api/auth/mfa/verify")
def verify_mfa(payload: dict[str, Any]) -> dict[str, bool]:
    code = str(payload.get("code", ""))
    return {"verified": len(code) == 6}


@app.post("/ingest/zeek", status_code=status.HTTP_202_ACCEPTED)
async def ingest_zeek_event(request: Request) -> dict[str, Any]:
    """Canonical CloudFront/WAF/ALB entry point for normalized Zeek telemetry."""

    # Keep room for the versioned envelope under the conservative SQS message limit.
    maximum_bytes = max(1024, int(os.getenv("INGEST_MAX_BODY_BYTES", "240000")))
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > maximum_bytes:
                raise HTTPException(status_code=413, detail=f"ingest body exceeds {maximum_bytes} bytes")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="invalid Content-Length header") from exc
    body_parts: list[bytes] = []
    body_size = 0
    async for chunk in request.stream():
        body_size += len(chunk)
        if body_size > maximum_bytes:
            raise HTTPException(status_code=413, detail=f"ingest body exceeds {maximum_bytes} bytes")
        body_parts.append(chunk)
    body = b"".join(body_parts)

    try:
        auth = await asyncio.to_thread(
            verify_ingest_signature,
            body,
            timestamp=request.headers.get(TIMESTAMP_HEADER),
            signature=request.headers.get(SIGNATURE_HEADER),
        )
    except IngestAuthenticationError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except IngestAuthenticationConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - Secrets Manager/IAM outages are retryable for the collector.
        raise HTTPException(status_code=503, detail="ingest authentication service is unavailable") from exc

    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError, RecursionError) as exc:
        raise HTTPException(status_code=400, detail="request body must contain valid JSON") from exc
    try:
        event = validate_zeek_ingest_event(payload)
    except EventContractError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        raw_s3_uri = await asyncio.to_thread(archive_raw_zeek_event, event)
        envelope = build_telemetry_envelope(event, raw_s3_uri=raw_s3_uri)
        result = await asyncio.to_thread(send_event_to_sqs, envelope)
    except Exception as exc:  # noqa: BLE001 - the collector should retry an unavailable durable pipeline.
        raise HTTPException(status_code=503, detail=f"Failed to durably accept telemetry: {exc}") from exc

    store.record_ingest()
    return {
        "status": "queued",
        "pipeline": "cloudfront-waf-alb-sqs",
        "event_id": event["event_id"],
        "message_id": result["message_id"],
        "raw_archived": raw_s3_uri is not None,
        "authentication": {"hmac": auth.enabled, "source": auth.source},
    }


@app.post("/api/events")
async def ingest_event(payload: dict[str, Any]) -> dict[str, Any]:
    _require_legacy_ingest_allowed()
    alert, created = store.upsert(orchestrator.process(payload))
    _persist_alert_best_effort(alert)
    await websockets.broadcast_alert(alert, created=created)
    return alert


@app.post("/api/events/http")
async def ingest_http_event(payload: dict[str, Any]) -> dict[str, Any]:
    _require_legacy_ingest_allowed()
    event = build_http_event(payload)
    alert, created = store.upsert(orchestrator.process(event))
    _persist_alert_best_effort(alert)
    await websockets.broadcast_alert(alert, created=created)
    return alert


@app.post("/api/events/http/async", status_code=status.HTTP_202_ACCEPTED)
def enqueue_http_event(payload: dict[str, Any]) -> dict[str, Any]:
    _require_legacy_ingest_allowed()
    if not payload.get("method"):
        raise HTTPException(status_code=400, detail="method is required")
    if not payload.get("uri"):
        raise HTTPException(status_code=400, detail="uri is required")

    event = build_http_event(payload)

    try:
        result = send_event_to_sqs(build_telemetry_envelope(event))
    except Exception as exc:  # noqa: BLE001 - surface AWS/config failure as API unavailability.
        raise HTTPException(status_code=503, detail=f"Failed to queue event: {exc}") from exc

    return {
        "status": "queued",
        "event_id": event["event_id"],
        "message_id": result["message_id"],
    }


@app.get("/api/alerts")
def list_alerts(limit: Annotated[int, Query(ge=1, le=200)] = 50) -> list[dict[str, Any]]:
    return _merged_alerts(limit=limit)


@app.get("/api/alerts/latest")
def latest_alert() -> dict[str, Any]:
    alerts = _merged_alerts(limit=50)
    if not alerts:
        raise HTTPException(status_code=404, detail="No alerts found")
    return alerts[0]


@app.post("/api/alerts/{alert_id}/actions")
async def alert_action(alert_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    alert = _read_one_alert(alert_id)
    if (
        alert is not None
        and _deployment_target() != "aws"
        and store.get(alert_id) is None
    ):
        store.upsert(alert)
    if alert is None:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    action = str(payload.get("action") or "")
    supported_actions = {
        "acknowledgeAlert",
        "assignAlert",
        "updateAlertStatus",
        "createCaseFromAlert",
        "markFalsePositive",
        "addAnalystNote",
    }
    if action not in supported_actions:
        raise HTTPException(status_code=400, detail=f"Unsupported alert action: {action or 'missing'}")

    requested_updates = payload.get("updates") if isinstance(payload.get("updates"), dict) else {}
    updates: dict[str, Any] = {}
    if action == "acknowledgeAlert":
        updates["status"] = "investigating"
    elif action == "assignAlert":
        analyst_id = str(payload.get("analystId") or requested_updates.get("assignedAnalyst") or "").strip()
        if not analyst_id:
            raise HTTPException(status_code=400, detail="analystId is required")
        updates["assignedAnalyst"] = analyst_id
    elif action == "updateAlertStatus":
        next_status = str(payload.get("status") or requested_updates.get("status") or "").strip()
        if not next_status:
            raise HTTPException(status_code=400, detail="status is required")
        updates["status"] = next_status
    elif action == "markFalsePositive":
        updates["status"] = "false_positive"
        if payload.get("reason"):
            updates["false_positive_reason"] = str(payload["reason"])
    elif action == "addAnalystNote":
        note = str(payload.get("note") or "").strip()
        if not note:
            raise HTTPException(status_code=400, detail="note is required")
        notes = list(alert.get("analyst_notes") or [])
        notes.append({"id": f"NOTE-{uuid4().hex[:12]}", "note": note, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
        updates["analyst_notes"] = notes
    elif action == "createCaseFromAlert":
        if _deployment_target() == "aws":
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=(
                    "Case creation is unavailable on AWS until a durable, "
                    "shared case store is implemented"
                ),
            )
        case_id = f"CASE-{alert_id}"
        case = workspace.get_case(case_id)
        if case is None:
            case = workspace.create_case({"source": "alert", "alertId": alert_id, "evidence": _case_from_alert(alert)})
        updates["caseId"] = case["id"]

    response_updates = dict(updates)
    audit_event_id = f"AUDIT-{uuid4().hex[:12]}"
    action_history = alert.get("analyst_actions")
    if not isinstance(action_history, list):
        action_history = []
    updates["analyst_actions"] = [
        *action_history,
        {
            "id": audit_event_id,
            "action": action,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "updates": response_updates,
        },
    ]

    if _deployment_target() == "aws":
        # Commit the authoritative record before changing cache state or
        # broadcasting success. A failed RDS write therefore returns 503 and
        # cannot create an action that exists only inside one EC2 process.
        updated = {**alert, **updates}
        _persist_alert_best_effort(updated)
        updated, _ = store.upsert(updated)
    else:
        updated = store.update(alert_id, updates)
        if updated is None:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        _persist_alert_best_effort(updated)
    await websockets.broadcast_alert(updated, created=False)
    return {
        "alertId": alert_id,
        "updates": response_updates,
        "auditEventId": audit_event_id,
        "alert": updated,
    }


@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str) -> dict[str, Any]:
    alert = _read_one_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert


@app.get("/api/alert-rules")
def list_alert_rules() -> list[dict[str, Any]]:
    return workspace.list_alert_rules()


@app.post("/api/alert-rules", status_code=status.HTTP_201_CREATED)
def create_alert_rule(payload: dict[str, Any]) -> dict[str, Any]:
    if not str(payload.get("ruleName") or "").strip():
        raise HTTPException(status_code=400, detail="ruleName is required")
    try:
        return workspace.create_alert_rule(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/alert-rules/test")
def test_alert_rule(payload: dict[str, Any]) -> dict[str, Any]:
    alerts = _merged_alerts(limit=200)
    matches = [alert for alert in alerts if _alert_matches_rule(alert, payload)]
    return {
        "matchedEvents": len(matches),
        "matchedAlertIds": [_alert_key(alert) for alert in matches],
        "status": "evaluated",
        "scope": "retained_alerts",
    }


@app.get("/api/summary")
def summary() -> dict[str, Any]:
    return summarize_alerts(_merged_alerts(limit=200))


@app.get("/api/dashboard/summary")
def get_dashboard_summary() -> dict[str, Any]:
    result = dashboard_summary(_merged_alerts(limit=200))
    case_counts = _case_status_counts()
    result["openCases"] = sum(count for case_status, count in case_counts.items() if case_status.lower() not in {"resolved", "closed"})
    result["caseStatusDistribution"] = case_counts
    return result


@app.get("/api/network/activity")
def get_network_activity() -> dict[str, Any]:
    return network_activity(_merged_alerts(limit=200))


@app.get("/api/attacks/distribution")
def get_attack_distribution() -> list[dict[str, Any]]:
    return attack_distribution(_merged_alerts(limit=200))


@app.get("/api/models/status")
def get_models_status() -> list[dict[str, Any]]:
    return model_runtime_status()


@app.get("/api/data-sources/health")
def get_data_sources_health() -> list[dict[str, Any]]:
    return _data_source_status()


@app.get("/api/assets")
def get_assets() -> list[dict[str, Any]]:
    return asset_inventory(_merged_alerts(limit=200))


@app.get("/api/threat-intel/iocs")
def get_threat_intel_iocs() -> list[dict[str, Any]]:
    return ioc_inventory(_merged_alerts(limit=200))


@app.get("/api/integrations")
def get_integrations() -> list[dict[str, Any]]:
    categories = {
        "security_sensor": "Security Sensors",
        "message_queue": "Messaging",
        "object_storage": "Object Storage",
        "database": "Database",
    }
    return [
        {
            "id": source["id"],
            "name": source["name"],
            "category": categories.get(source["type"], source["type"]),
            "status": source["status"],
            "configured": source["configured"],
            "online": source["online"],
            "health": "Unknown" if source["online"] is None else ("Healthy" if source["online"] else "Critical"),
            "lastSync": source["lastSeenAt"],
            "eventsObserved": source["eventsObserved"],
            "lastError": source.get("lastError"),
        }
        for source in _data_source_status()
    ]


@app.get("/api/reports/summary")
def get_reports_summary() -> dict[str, Any]:
    result = reports_summary(_merged_alerts(limit=200))
    result["totalCases"] = len(workspace.list_cases())
    result["caseStatusDistribution"] = _case_status_counts()
    return result


@app.get("/api/workspace/status")
def get_workspace_status() -> dict[str, Any]:
    """Describe the explicitly non-durable auxiliary workspace API."""

    return {
        "persistence": "process_local",
        "durable": False,
        "sharedAcrossInstances": False,
        "survivesRestart": False,
        "collections": ["cases", "playbooks", "alert_rules", "settings"],
        "message": (
            "Auxiliary workspace state is held only by the current backend process; "
            "Final Alerts remain the only RDS-backed dashboard records."
        ),
    }


@app.get("/api/cases")
def list_cases() -> list[dict[str, Any]]:
    return workspace.list_cases()


@app.post("/api/cases", status_code=status.HTTP_201_CREATED)
def create_case(payload: dict[str, Any]) -> dict[str, Any]:
    if _deployment_target() == "aws":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Case mutation is unavailable on AWS until a durable, shared case store is implemented",
        )
    try:
        return workspace.create_case(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/cases/{case_id}")
def get_case(case_id: str) -> dict[str, Any]:
    case = workspace.get_case(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@app.patch("/api/cases/{case_id}")
def update_case(case_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    if _deployment_target() == "aws":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Case mutation is unavailable on AWS until a durable, shared case store is implemented",
        )
    updates = payload.get("updates") if isinstance(payload.get("updates"), dict) else payload
    case = workspace.update_case(case_id, updates)
    if case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@app.get("/api/playbooks")
def list_playbooks() -> list[dict[str, Any]]:
    return workspace.list_playbooks()


@app.post("/api/playbooks", status_code=status.HTTP_201_CREATED)
def create_playbook(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        return workspace.create_playbook(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/playbooks/{playbook_id}")
def get_playbook(playbook_id: str) -> dict[str, Any]:
    playbook = workspace.get_playbook(playbook_id)
    if playbook is None:
        raise HTTPException(status_code=404, detail=f"Playbook {playbook_id} not found")
    return playbook


@app.patch("/api/playbooks/{playbook_id}")
def update_playbook(playbook_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updates = payload.get("updates") if isinstance(payload.get("updates"), dict) else payload
    playbook = workspace.update_playbook(playbook_id, updates)
    if playbook is None:
        raise HTTPException(status_code=404, detail=f"Playbook {playbook_id} not found")
    return playbook


@app.get("/api/settings")
def get_settings() -> dict[str, Any]:
    return workspace.get_settings()


@app.patch("/api/settings")
def update_settings(payload: dict[str, Any]) -> dict[str, Any]:
    updates = payload.get("updates") if isinstance(payload.get("updates"), dict) else payload
    if "runtime" in updates:
        raise HTTPException(
            status_code=400,
            detail="runtime settings are read-only and report backend configuration",
        )
    return workspace.update_settings(updates)


@app.post("/api/replay/demo")
async def replay_demo() -> dict[str, Any]:
    _require_legacy_ingest_allowed()
    events = demo_events()
    alerts = []
    for event in events:
        alert, created = store.upsert(orchestrator.process(event))
        _persist_alert_best_effort(alert)
        alerts.append(alert)
        await websockets.broadcast_alert(alert, created=created)
    return {"created": len(alerts), "alerts": alerts}


@app.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket) -> None:
    await websockets.connect(websocket)
    initial_alerts = await asyncio.to_thread(lambda: _merged_alerts(limit=200))
    await websocket.send_json({"type": "INITIAL_DATA", "data": initial_alerts})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websockets.disconnect(websocket)


def build_http_event(payload: dict[str, Any]) -> dict[str, Any]:
    return normalize_event(
        {
            **payload,
            "event_type": "http",
            "evidence": {
                "http": {
                    "method": payload.get("method", "GET"),
                    "uri": payload.get("uri", "/"),
                    "user_agent": payload.get("user_agent"),
                },
                "flow": payload.get("flow"),
                "suricata": payload.get("suricata"),
            },
        }
    )


def demo_events() -> list[dict[str, Any]]:
    return [
        {
            "event_type": "http",
            "source_ip": "192.168.56.10",
            "destination_ip": "192.168.56.20",
            "evidence": {"http": {"method": "GET", "uri": "/home?q=normal"}},
        },
        {
            "event_type": "http",
            "source_ip": "192.168.56.11",
            "destination_ip": "192.168.56.20",
            "evidence": {"http": {"method": "GET", "uri": "/search?q=%27%20OR%201%3D1--%20-"}},
        },
        {
            "event_type": "http",
            "source_ip": "192.168.56.12",
            "destination_ip": "192.168.56.20",
            "evidence": {"http": {"method": "GET", "uri": "/profile?bio=%3Cscript%3Ealert(1)%3C/script%3E"}},
        },
        {
            "event_type": "network_flow",
            "source_ip": "192.168.56.13",
            "destination_ip": "192.168.56.21",
            "evidence": {"flow": {"attack_hint": "scan", "service": "ssh", "dst_port": 22, "orig_pkts": 700}},
        },
        {
            "event_type": "combined",
            "source_ip": "192.168.56.14",
            "destination_ip": "192.168.56.22",
            "evidence": {
                "http": {"method": "GET", "uri": "/search?q=%27%20OR%201%3D1--%20-"},
                "flow": {"attack_hint": "web", "service": "http", "dst_port": 80, "orig_pkts": 80},
            },
        },
    ]
