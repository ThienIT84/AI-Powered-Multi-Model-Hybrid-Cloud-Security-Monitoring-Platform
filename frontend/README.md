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

Backend API mode:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

In API mode, start the backend first. The frontend listens to the backend WebSocket at `/ws/alerts` and renders alerts produced by `/api/events`, `/api/events/http`, or `/api/replay/demo`.

Realtime state is owned by `App.tsx`, which calls `useSocket()` once and passes alerts into pages. Page components should not open their own WebSocket streams, otherwise mock updates can duplicate or reset out of sync.

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
