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
VITE_MOCK_WS_URL=ws://localhost:3000
```

`VITE_DATA_MODE=mock` uses the local mock WebSocket server in `server.ts`. `VITE_DATA_MODE=api` points the client to the future FastAPI backend.

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
