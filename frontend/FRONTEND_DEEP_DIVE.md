# Frontend Deep Dive (Hybrid SOC)

## Scope
This note documents the current React + Vite frontend under `frontend/`. It focuses on runtime flow, data contracts, UI structure, and key components.

## Stack and Build
- Runtime: React 19 + Vite 6 + Tailwind v4.
- Charts: Recharts.
- Motion: motion (Framer Motion v12).
- State: Zustand.
- Dev server: custom Express + WebSocket mock server.

### Commands
- `pnpm install`
- `VITE_DATA_MODE=mock pnpm dev` (starts Express + Vite middleware + local mock WebSocket)
- `VITE_DATA_MODE=api VITE_API_BASE_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000/ws/alerts pnpm dev` (connects to backend)
- `pnpm build` (Vite build + server bundle)
- `pnpm start` (runs bundled server)
- `pnpm lint` (tsc)

### Full-stack local run
Terminal 1, backend:

From the repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If already inside `backend/`:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=. \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

This terminal is expected to remain occupied because `uvicorn` is serving the backend. `--no-capture-output` prevents `conda run` from hiding live server logs.

Useful backend checks:

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/replay/demo
```

Terminal 2, frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

### Environment
- `VITE_DATA_MODE=mock|api`
- `VITE_API_BASE_URL` (REST base)
- `VITE_WS_URL` (WebSocket API)
- `VITE_MOCK_WS_URL` (local mock socket url; default `.env.example` uses `ws://localhost:3001`)

### Demo login
Frontend authentication is a local demo implemented by `src/components/auth/authService.ts`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@defense.soc` | `Password123!` |
| SOC Analyst | `analyst@defense.soc` | `Password123!` |

These credentials are local demo data seeded into browser `localStorage`; they are not backend or production secrets.

## Entry and Layout
- HTML entry: `index.html` mounts `#root`.
- React entry: `src/main.tsx` renders `App`.
- `App` is the top-level layout. It owns:
  - `currentView` (no router, view switch by state)
  - `selectedAlert`, `searchQuery`, `isDarkMode`
  - `disabledAttackTypes` (donut legend toggle)
  - panel state (`usePanelState`) for alert/settings flyouts
- `Sidebar` switches `currentView`.
- `Header` shows system status, global search, theme toggle, quick panels.

## Data Flow and Contracts
### Data mode
- `src/config.ts` chooses `mock` or `api` based on `VITE_DATA_MODE`.
- WebSocket endpoint chosen from `wsUrl` (api) or `mockWsUrl` (mock).
- `App.tsx` owns the single `useSocket()` instance and passes alert state into pages.
- Page components should render socket state from props instead of opening another WebSocket stream.

### WebSocket message types
`useSocket` handles:
- `INITIAL_DATA` -> replaces alerts list
- `NEW_ALERT` -> prepends and caps at 50
- `alert.created` -> same as NEW_ALERT
- `TRAFFIC_UPDATE` -> appends to traffic chart, caps at 100

### Alert DTO mapping
- `src/useSocket.ts` receives WebSocket messages and calls `src/lib/alertMapper.ts` for snake_case backend DTOs.
- Legacy/mock camelCase alerts are normalized in `useSocket.ts` so the dashboard can keep using the same internal `Alert` type.

### Mock data
- `src/mocks/securityData.ts` provides `generateMockAlertDTO`, `generateMockTrafficPoint`, plus static summary/status lists.
- `server.ts` uses these to emit `INITIAL_DATA`, `NEW_ALERT`, and `TRAFFIC_UPDATE` messages at 2s intervals and serves Vite SPA.

## App Views (Page Summary)
### Dashboard
- Composition: `KPIOverview`, `AnalyticsZone`, `AlertTable`, `IncidentDetail`, `BottomWidgets`.
- `KPIOverview` computes live counters and sparkline trends from traffic/alerts.
- `AnalyticsZone`:
  - time window filter
  - traffic area chart with anomaly overlay
  - donut distribution with per-attack toggle
  - list panel shares the toggle state
- `AlertTable`:
  - local filters (severity, attack type, IP)
  - pagination and row selection
- `IncidentDetail`:
  - tabs: overview, payload, AI, timeline
  - payload shows example extraction
  - AI tab shows synthetic feature weights

### Alerts
- `AlertsPage`:
  - search + filters (UI only)
  - list view modes: table or grid
  - detail drawer on selection
- `AlertDetailedList`:
  - table or grid layout
  - attack-themed colors from `useAttackTheme`
- `AlertDetailDrawer`:
  - tabs: overview, analysis, logs, timeline
  - radar chart for a mock threat profile
- `AlertDropdownPanel`:
  - floating panel for recent alerts, filter tabs

### AI Threat Detection
- `AIThreatDetectionPage` uses config arrays and runs periodic updates.
- KPI cards and charts are driven by `aiThreatDetectionConfig.ts`.

### Attack Surface
- `AttackSurfacePage` uses `attackSurfaceConfig.ts` for KPI, bar chart, donut, and feed.
- Periodic timer mutates values for liveliness.

### MITRE ATT&CK
- `MitreAttackPage` uses `mitreConfig.ts` for KPI, coverage bars, trends, and matrix.
- Local search filters technique matrix.

### Case Management
- `CaseManagementPage` uses `caseManagementConfig.ts` for KPI, trends, status distribution, and case list.
- Periodic timer updates values.

### Network Monitoring
- `NetworkMonitoringPage` uses `useNetworkStream` for simulated logs and chart points.
- `useThreatAnalytics` derives KPI from logs.
- `NetworkStats` renders 8 KPI tiles with sparklines.
- `NetworkChart` shows flows and bandwidth plus anomaly markers.
- `NetworkStreamTable` supports sorting, filtering, pagination, and row expansion.

### Integrations
- `IntegrationsPage` manages a local integrations list.
- Search + tab filters via `IntegrationTabs` and `IntegrationGrid`.
- `IntegrationFormModal` includes a simulated connection test terminal.

### Playbooks
- `PlaybooksPage` supports search/filters and playbook CRUD modal.
- `PlaybookCard` shows status, trigger, and action pipeline.
- `PlaybookModal` has a visualizer tab and an edit tab plus a simulated run console.

### Reports
- `ReportsPage` uses `ReportFilters` + `ReportStats` + tab panels:
  - `ExecutiveSummaryTab`
  - `ThreatIntelTab`
  - `AIPerformanceTab`
  - `InfrastructureTab`
- All are driven by `reportsConfig.ts` datasets with loading and empty-state simulation.

### Settings
- `SettingsPage` is split into a sidebar and detail area.
- Uses `useSettingsStore` for draft vs saved values with `isDirty` gating.
- Settings categories implement forms for:
  - General
  - Appearance
  - AI Configuration
  - Security
  - Cloud Integration
  - Notifications
  - User Management
- `SettingsQuickPanel` offers fast toggles and auto-saves to store.

## Shared Components
- `MultiColorDonut`: interactive donut with active segment legend.
- `IncidentsFeed`: reusable list for severity-based feeds.
- `FloatingPanel`: generic overlay panel with backdrop and motion.
- `EventModal`: legacy alert modal (not currently wired in App).

## Hooks and Utilities
- `useAttackTheme`: deterministic color palette per attack type.
- `usePanelState`: manages global alert/settings panel state.
- `useRealtimeBuffer`: batch queue to reduce render storms.
- `useNetworkStream`: emits logs + chart points and injectors.
- `useThreatAnalytics`: computes KPIs from logs.
- `attackColors.ts`: hash-based theme generator.

## Styling and Theming
- Tailwind v4 via `@tailwindcss/vite` and `@theme` tokens in `src/index.css`.
- Light/dark tokens in CSS variables; `App` toggles `.dark` on `documentElement`.
- Fonts from Google: Inter (sans) and JetBrains Mono (mono).
- Custom utilities: `neon-card`, `glass-card`, `custom-scrollbar`, etc.

## Notes and Potential Mismatches
- Two alert mappers exist; only the one in `useSocket` is used. If backend sends snake_case DTOs, consider using `alertMapper.ts` directly.
- `SecondaryWidgets` exists but is not used anywhere.
- `src/utils/networkGenerator.ts` and `src/utils/syslogGenerator.ts` import a path `../components/network/networksConfig` which does not match the actual `NetworkConfig.ts` file name. These utils also appear unused.
- `index.html` title is still the default placeholder.
- Mock server emits camelCase alert fields; confirm mapping rules if switching to real API.

## Key Files (Relative to frontend/)
- `src/App.tsx`
- `src/main.tsx`
- `src/config.ts`
- `src/useSocket.ts`
- `src/types.ts`
- `src/types/views.ts`
- `src/index.css`
- `server.ts`
- `src/mocks/securityData.ts`
- `src/hooks/*`
- `src/components/**`
- `src/pages/**`
