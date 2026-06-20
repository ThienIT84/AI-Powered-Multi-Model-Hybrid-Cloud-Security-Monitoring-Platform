# Multi-Model Fusion Backend MVP

FastAPI MVP for the Hybrid SOC dashboard integration.

The backend routes evidence to model adapters by input scope:

```text
flow/conn evidence -> AI1 + AI2A
http evidence      -> AI2B
suricata evidence  -> Fusion rule evidence
```

AI2B is the first real adapter candidate. AI1 and AI2A can run as mock,
simulated, unavailable, or real adapters later without changing the dashboard
contract.

## Run

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

For a quick replay:

```bash
python scripts/replay_demo.py
```

Frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api VITE_API_BASE_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000/ws/alerts pnpm dev
```

