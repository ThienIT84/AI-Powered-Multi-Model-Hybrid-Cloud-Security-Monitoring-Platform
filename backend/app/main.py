from __future__ import annotations

from datetime import datetime, timezone
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/status")
def platform_status() -> dict[str, Any]:
    return store.status()


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


@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str) -> dict[str, Any]:
    alert = store.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str) -> dict[str, Any]:
    alert = store.update(alert_id, {"status": "investigating", "audit_action": "alert.acknowledged"})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await websockets.broadcast_alert(alert, created=False)
    return alert


@app.post("/api/alerts/{alert_id}/assign")
async def assign_alert(alert_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    analyst = str(payload.get("analyst") or "").strip()
    if not analyst:
        raise HTTPException(status_code=400, detail="analyst is required")
    alert = store.update(alert_id, {"assigned_analyst": analyst, "audit_action": "alert.assigned"})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await websockets.broadcast_alert(alert, created=False)
    return alert


@app.patch("/api/alerts/{alert_id}/status")
async def update_alert_status(alert_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    status = str(payload.get("status") or "").strip()
    if not status:
        raise HTTPException(status_code=400, detail="status is required")
    alert = store.update(alert_id, {"status": status, "audit_action": "alert.status_updated"})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await websockets.broadcast_alert(alert, created=False)
    return alert


@app.post("/api/alerts/{alert_id}/false-positive")
async def mark_false_positive(alert_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    alert = store.update(
        alert_id,
        {
            "status": "false_positive",
            "false_positive_reason": payload.get("reason"),
            "audit_action": "alert.false_positive_marked",
        },
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await websockets.broadcast_alert(alert, created=False)
    return alert


@app.post("/api/alerts/{alert_id}/notes")
async def add_alert_note(alert_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    alert = store.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    note = str(payload.get("note") or "").strip()
    if not note:
        raise HTTPException(status_code=400, detail="note is required")
    item = {
        "id": f"note-{alert_id}-{len(alert.get('analyst_notes') or []) + 1}",
        "alert_id": alert_id,
        "analyst": payload.get("analyst") or "SOC Analyst",
        "note": note,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    notes = [*list(alert.get("analyst_notes") or []), item]
    updated = store.update(alert_id, {"analyst_notes": notes, "audit_action": "alert.note_added"})
    if updated:
        await websockets.broadcast_alert(updated, created=False)
    return item


@app.post("/api/alerts/{alert_id}/case")
async def create_case_from_alert(alert_id: str) -> dict[str, str]:
    case = store.create_case_from_alert(alert_id)
    if not case:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert = store.get(alert_id)
    if alert:
        await websockets.broadcast_alert(alert, created=False)
    return {"caseId": case["id"]}


@app.get("/api/summary")
def summary() -> dict[str, Any]:
    return store.summary()


@app.get("/api/network/flows")
def network_flows(limit: int = 200) -> list[dict[str, Any]]:
    return store.network_flows(limit=limit)


@app.get("/api/network/flows/{flow_id}")
def get_network_flow(flow_id: str) -> dict[str, Any]:
    flow = store.get_network_flow(flow_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Network flow not found")
    return flow


@app.get("/api/cases")
def list_cases() -> list[dict[str, Any]]:
    return store.list_cases()


@app.get("/api/cases/{case_id}")
def get_case(case_id: str) -> dict[str, Any]:
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases")
def create_case(payload: dict[str, Any]) -> dict[str, Any]:
    return store.upsert_case(payload)


@app.patch("/api/cases/{case_id}")
def update_case(case_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    case = store.update_case(case_id, payload)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases/{case_id}/assign")
def assign_case(case_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    analyst = str(payload.get("analyst") or "").strip()
    if not analyst:
        raise HTTPException(status_code=400, detail="analyst is required")
    case = store.assign_case(case_id, analyst)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases/{case_id}/notes")
def add_case_note(case_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    note = str(payload.get("note") or "").strip()
    if not note:
        raise HTTPException(status_code=400, detail="note is required")
    case = store.add_case_note(case_id, note, str(payload.get("author") or "SOC Analyst"))
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases/{case_id}/close")
def close_case(case_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    resolution = str(payload.get("resolution") or "").strip()
    if not resolution:
        raise HTTPException(status_code=400, detail="resolution is required")
    case = store.close_case(case_id, resolution)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.get("/api/rules")
def list_rules() -> list[dict[str, Any]]:
    return store.list_rules()


@app.post("/api/rules")
def create_rule(payload: dict[str, Any]) -> dict[str, Any]:
    return store.create_rule(payload)


@app.post("/api/rules/test")
def test_rule(payload: dict[str, Any]) -> dict[str, Any]:
    return store.test_rule(payload)


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
