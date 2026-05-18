from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import asyncio
import json
import random
import time
from typing import List, Dict, Any
from fastapi import Body, Header, Depends, HTTPException
from fastapi.responses import PlainTextResponse
import os
from pathlib import Path

app = FastAPI()

connected_clients: List[WebSocket] = []

# Simple mock data generators
def make_alert(i: int):
    return {
        "id": f"alert-{int(time.time())}-{i}",
        "sourceIp": f"192.168.1.{random.randint(2,254)}",
        "destIp": f"10.0.0.{random.randint(2,254)}",
        "attackType": random.choice(["SQLi", "XSS", "BruteForce", "PortScan"]),
        "severity": random.choice(["low", "medium", "high"]).upper(),
        "payload": "suspicious-payload",
        "timestamp": int(time.time())
    }

def make_traffic():
    return {
        "time": int(time.time()),
        "bytes": random.randint(100, 10000),
        "flows": random.randint(1, 20)
    }

async def broadcast(message: dict):
    data = json.dumps(message)
    dead = []
    for ws in connected_clients:
        try:
            await ws.send_text(data)
        except Exception:
            dead.append(ws)
    for d in dead:
        try:
            connected_clients.remove(d)
        except ValueError:
            pass

@app.get("/api/alerts")
async def get_alerts():
    items = [make_alert(i) for i in range(5)]
    return JSONResponse(content=items)


@app.get("/api/dashboard/summary")
async def dashboard_summary():
    # Mock KPI summary
    summary = {
        "total_alerts": random.randint(50, 200),
        "open_alerts": random.randint(1, 50),
        "high_severity": random.randint(0, 20),
        "avg_response_time_sec": round(random.uniform(30, 600), 1),
        "last_24h_alerts": random.randint(10, 100)
    }
    return JSONResponse(content=summary)


@app.get("/api/network/activity")
async def network_activity(points: int = 60):
    # Return time-series mock for charting
    now = int(time.time())
    series = []
    for i in range(points):
        t = now - (points - i) * 60
        series.append({"time": t, "bytes": random.randint(1000, 20000), "flows": random.randint(1, 50)})
    return JSONResponse(content=series)


@app.get("/api/attacks/distribution")
async def attacks_distribution():
    # Return mock distribution by attack type
    types = ["SQLi", "XSS", "BruteForce", "PortScan", "Ransomware"]
    dist = [{"attackType": t, "count": random.randint(0, 50)} for t in types]
    return JSONResponse(content=dist)


async def require_api_key(x_api_key: str = Header(None)):
    expected = os.getenv("BACKEND_API_KEY")
    if not expected:
        # Fail fast if server not configured for API key protection
        raise HTTPException(status_code=500, detail="Server misconfigured: BACKEND_API_KEY not set")
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


BLOCKED_FILE = Path(__file__).resolve().parent.parent / "blocked_ips.json"


@app.post("/api/actions/block-ip")
async def block_ip(payload: Dict[str, Any] = Body(...), authorized: bool = Depends(require_api_key)):
    # Expect { "ip": "1.2.3.4" }
    ip = payload.get("ip")
    if not ip:
        return JSONResponse(status_code=400, content={"error": "ip is required"})

    entry = {"ip": ip, "timestamp": int(time.time())}
    try:
        if BLOCKED_FILE.exists():
            with open(BLOCKED_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = []
    except Exception:
        data = []

    data.append(entry)
    try:
        with open(BLOCKED_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        return JSONResponse(status_code=500, content={"error": "failed to write block log"})

    return JSONResponse(content={"blocked": True, "ip": ip})


@app.get("/api/actions/blocked-ips")
async def get_blocked_ips(authorized: bool = Depends(require_api_key)):
    if BLOCKED_FILE.exists():
        with open(BLOCKED_FILE, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception:
                data = []
    else:
        data = []
    return JSONResponse(content=data)


@app.post("/api/actions/unblock-ip")
async def unblock_ip(payload: Dict[str, Any] = Body(...), authorized: bool = Depends(require_api_key)):
    # Expect { "ip": "1.2.3.4" }
    ip = payload.get("ip")
    if not ip:
        return JSONResponse(status_code=400, content={"error": "ip is required"})

    try:
        if BLOCKED_FILE.exists():
            with open(BLOCKED_FILE, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception:
                    data = []
        else:
            data = []
    except Exception:
        data = []

    # Filter out entries matching the ip
    new_data = [e for e in data if e.get("ip") != ip]

    try:
        with open(BLOCKED_FILE, "w", encoding="utf-8") as f:
            json.dump(new_data, f, indent=2)
    except Exception:
        return JSONResponse(status_code=500, content={"error": "failed to update block log"})

    return JSONResponse(content={"unblocked": True, "ip": ip, "blocked_ips": new_data})


@app.get("/api/reports/export")
async def reports_export(format: str = "csv"):
    # Return a small CSV report for download
    rows = [
        ["id", "sourceIp", "destIp", "attackType", "severity", "timestamp"]
    ]
    for i in range(10):
        a = make_alert(i)
        rows.append([a["id"], a["sourceIp"], a["destIp"], a["attackType"], a["severity"], str(a["timestamp"])])
    csv = "\n".join([",".join(r) for r in rows])
    if format == "csv":
        return PlainTextResponse(content=csv, media_type="text/csv")
    else:
        return JSONResponse(content={"report": rows})

@app.get("/health")
async def health():
    return {"status": "ok"}


# ...internal debug endpoints removed

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    # send initial data
    initial = [make_alert(i) for i in range(5)]
    await websocket.send_text(json.dumps({"type": "INITIAL_DATA", "data": initial}))

    # start periodic push tasks for this connection
    async def push_updates(ws: WebSocket):
        counter = 0
        try:
            while True:
                # every 2 seconds send a traffic update
                await asyncio.sleep(2)
                traffic = make_traffic()
                await ws.send_text(json.dumps({"type": "TRAFFIC_UPDATE", "data": traffic}))

                # every ~10 seconds send a new alert
                counter += 1
                if counter % 5 == 0:
                    alert = make_alert(counter)
                    await broadcast({"type": "NEW_ALERT", "data": alert})
        except Exception:
            # connection closed or send failed
            return

    task = asyncio.create_task(push_updates(websocket))

    try:
        while True:
            # keep receiving to detect disconnects (client heartbeats optional)
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        try:
            connected_clients.remove(websocket)
        except ValueError:
            pass
        task.cancel()
