# Hybrid SOC Frontend

React + Vite dashboard for the AI-powered hybrid cloud security monitoring platform.

## Requirements

- Node.js 20+
- pnpm 9+

## Environment

Copy `.env.example` to `.env.local` when you need local overrides.

```bash
VITE_DATA_MODE=mock
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/alerts
VITE_MOCK_WS_URL=ws://localhost:3001
```

`VITE_DATA_MODE=mock` uses the local mock WebSocket server in `server.ts`. `VITE_DATA_MODE=api` points the client to the FastAPI backend.

## Run Modes

Mock SOC demo mode:

```bash
cd frontend
pnpm install
VITE_DATA_MODE=mock pnpm dev
```

In mock mode, the frontend connects to `VITE_MOCK_WS_URL` and receives initial alerts plus live alert/traffic updates from the local Express/WebSocket server. The default mock socket is `ws://localhost:3001`.

Backend API mode requires two terminals.

Terminal 1, start backend:

From the repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If the terminal is already inside `backend/`, use:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=. \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend process keeps the terminal open while it serves requests. If no logs appear, make sure `--no-capture-output` is present.

Optional backend smoke checks:

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/replay/demo
```

Terminal 2, start frontend in API mode:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

In API mode, start the backend first. The frontend listens to the backend WebSocket at `/ws/alerts` and renders alerts produced by `/api/events`, `/api/events/http`, or `/api/replay/demo`.

Realtime state is owned by `App.tsx`, which calls `useSocket()` once and passes alerts into pages. Page components should not open their own WebSocket streams, otherwise mock updates can duplicate or reset out of sync.

## Demo Login

Local frontend auth is a demo/localStorage simulation, not production authentication. These accounts are safe to document for local testing:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@defense.soc` | `Password123!` |
| SOC Analyst | `analyst@defense.soc` | `Password123!` |

New accounts created from the register page are also stored in browser `localStorage`.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Data Contract

Backend responses should follow the README contract with `snake_case` fields. The frontend maps those DTOs into internal React types with `camelCase` fields before rendering components.
