from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
import json

from app.services.websocket import manager
from app.services.auth import get_current_user_ws
from app.schemas.user import User

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("/alerts")
async def websocket_alerts(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user_ws)
):
    """WebSocket endpoint for real-time alerts"""
    await manager.connect(websocket, "alerts")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await manager.broadcast_to_user(json.loads(data), current_user.username)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")

@router.websocket("/system")
async def websocket_system(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user_ws)
):
    """WebSocket endpoint for system status updates"""
    await manager.connect(websocket, "system")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_to_user(json.loads(data), current_user.username)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "system")

@router.websocket("/threats")
async def websocket_threats(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user_ws)
):
    """WebSocket endpoint for threat intelligence"""
    await manager.connect(websocket, "threats")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_to_user(json.loads(data), current_user.username)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "threats")