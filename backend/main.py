from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import asyncio
import json
import random
import time
from typing import List

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

@app.get("/health")
async def health():
    return {"status": "ok"}

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
