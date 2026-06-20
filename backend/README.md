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

From the repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If your shell is already inside `backend/`, use `PYTHONPATH=.` instead:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=. \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

`uvicorn` is a long-running server, so the terminal is expected to stay open. `--no-capture-output` makes startup logs visible instead of letting `conda run` buffer them.

For a quick replay:

```bash
conda run -n interior_ai python backend/scripts/replay_demo.py
```

Frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api VITE_API_BASE_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000/ws/alerts pnpm dev
```
