from __future__ import annotations

import json
from typing import Any


class WebSocketManager:
    def __init__(self) -> None:
        self._connections: list[Any] = []

    async def connect(self, websocket: Any) -> None:
        await websocket.accept()
        self._connections.append(websocket)

    def disconnect(self, websocket: Any) -> None:
        if websocket in self._connections:
            self._connections.remove(websocket)

    async def broadcast_alert(self, alert: dict[str, Any], *, created: bool = True) -> None:
        message_type = "alert.created" if created else "alert.updated"
        message = json.dumps({"type": message_type, "data": alert})
        dead: list[Any] = []
        for websocket in self._connections:
            try:
                await websocket.send_text(message)
            except Exception:  # noqa: BLE001 - connection cleanup.
                dead.append(websocket)
        for websocket in dead:
            self.disconnect(websocket)
