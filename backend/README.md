# Backend (FastAPI) — WebSocket mock server

This folder contains a minimal FastAPI-based backend that exposes:
- WebSocket endpoint that sends INITIAL_DATA, periodic TRAFFIC_UPDATE and occasional NEW_ALERT messages.
- HTTP endpoints for health and initial alerts (optional).

Assumptions:
- The frontend (Vite) can connect to the backend WebSocket using the Vite env variable `VITE_WS_URL` (recommended) or by running the backend on the same origin as the frontend.

Quick start (Windows PowerShell):

```powershell
cd backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# project code lives in backend/src — run uvicorn using module path
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

If you run the frontend separately (e.g. Vite on `localhost:5173`), set the WebSocket URL for the frontend before starting it:

- Create a file `frontend/.env` containing:

```
VITE_WS_URL=ws://localhost:8000/ws
```

-- Then start the frontend as usual (`npm run dev` or `pnpm dev`). The frontend's `useSocket` hook will prefer `VITE_WS_URL` if present.

Test WebSocket client (for local checks): `backend/src/test_ws.py` — run with the venv Python:

```powershell
cd backend
.\.venv\Scripts\python.exe src\test_ws.py
```

API key for sensitive actions (required)
--------------------------------------
The `block-ip`, `unblock-ip` and `blocked-ips` endpoints are protected by an API key. This server requires you to explicitly set the `BACKEND_API_KEY` environment variable before starting the server. If the variable is not set the server will return a 500 error for protected endpoints.

Set the key in PowerShell for the current session and start the server:

```powershell
# set a key for the terminal session (replace <YOUR_KEY> with a secure value)
$env:BACKEND_API_KEY = "<YOUR_KEY>"
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

When calling protected endpoints include the header `X-API-KEY: <YOUR_KEY>`. Example using PowerShell `Invoke-WebRequest`:

```powershell
$headers = @{ 'X-API-KEY' = '<YOUR_KEY>' }
$body = '{"ip":"9.9.9.9"}'
Invoke-WebRequest -Method POST -Body $body -ContentType 'application/json' -Headers $headers http://localhost:8000/api/actions/block-ip
```

Note: This change improves security by removing any default development key. For local development you can set a short-lived key in your session as shown above.

Notes:
- This is a lightweight mock server for development/demos. For production, replace with secure WebSocket hosting, authentication, and persistent storage.
