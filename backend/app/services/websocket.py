from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "alerts": [],
            "system": [],
            "threats": []
        }

    async def connect(self, websocket: WebSocket, room: str):
        """Connect a WebSocket to a room"""
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    def disconnect(self, websocket: WebSocket, room: str):
        """Disconnect a WebSocket from a room"""
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)

    async def broadcast(self, message: dict, room: str):
        """Broadcast message to all connections in a room"""
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Remove dead connections
                    self.active_connections[room].remove(connection)

    async def broadcast_to_user(self, message: dict, username: str):
        """Broadcast message to specific user (placeholder for future implementation)"""
        # For now, broadcast to all rooms
        for room in self.active_connections:
            await self.broadcast(message, room)

    async def send_alert(self, alert_data: dict):
        """Send alert to all connected clients"""
        await self.broadcast(alert_data, "alerts")

    async def send_system_update(self, system_data: dict):
        """Send system status update"""
        await self.broadcast(system_data, "system")

    async def send_threat_update(self, threat_data: dict):
        """Send threat intelligence update"""
        await self.broadcast(threat_data, "threats")

# Global connection manager instance
manager = ConnectionManager()