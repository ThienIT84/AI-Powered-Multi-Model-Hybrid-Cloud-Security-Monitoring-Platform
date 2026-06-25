from __future__ import annotations

from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
