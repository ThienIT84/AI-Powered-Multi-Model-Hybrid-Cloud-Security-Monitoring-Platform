from __future__ import annotations

import base64
import json
import time
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.contracts import normalize_event
from app.dependencies import orchestrator, store, websockets

app = FastAPI(title="Hybrid SOC Multi-Model Fusion MVP", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/status")
def platform_status() -> dict[str, Any]:
    summary = store.summary()
    return {
        "dataSourcesOnline": None,
        "dataSourcesTotal": None,
        "modelHealthy": None,
        "modelTotal": None,
        "eventRatePerSecond": None,
        "lastIngestAt": None,
        "lastError": None,
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


@app.post("/api/events")
async def ingest_event(payload: dict[str, Any]) -> dict[str, Any]:
    alert, created = store.upsert(orchestrator.process(payload))
    await websockets.broadcast_alert(alert, created=created)
    return alert


@app.post("/api/events/http")
async def ingest_http_event(payload: dict[str, Any]) -> dict[str, Any]:
    event = normalize_event(
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
    alert, created = store.upsert(orchestrator.process(event))
    await websockets.broadcast_alert(alert, created=created)
    return alert


@app.get("/api/alerts")
def list_alerts(limit: int = 50) -> list[dict[str, Any]]:
    return store.list(limit=limit)


@app.get("/api/summary")
def summary() -> dict[str, Any]:
    return store.summary()


@app.post("/api/replay/demo")
async def replay_demo() -> dict[str, Any]:
    events = demo_events()
    alerts = []
    for event in events:
        alert, created = store.upsert(orchestrator.process(event))
        alerts.append(alert)
        await websockets.broadcast_alert(alert, created=created)
    return {"created": len(alerts), "alerts": alerts}


@app.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket) -> None:
    await websockets.connect(websocket)
    await websocket.send_json({"type": "INITIAL_DATA", "data": store.list(limit=50)})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websockets.disconnect(websocket)


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
            "evidence": {"http": {"method": "GET", "uri": "/search?q=mock-sqli"}},
        },
        {
            "event_type": "http",
            "source_ip": "192.168.56.12",
            "destination_ip": "192.168.56.20",
            "evidence": {"http": {"method": "GET", "uri": "/profile?bio=mock-xss"}},
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
                "http": {"method": "GET", "uri": "/search?q=mock-sqli"},
                "flow": {"attack_hint": "web", "service": "http", "dst_port": 80, "orig_pkts": 80},
            },
        },
    ]
