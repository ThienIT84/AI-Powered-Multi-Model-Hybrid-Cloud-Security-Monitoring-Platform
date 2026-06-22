# Multi-Model Fusion Backend MVP

FastAPI MVP for the Hybrid SOC dashboard integration.

The backend routes evidence to model adapters by input scope:

```text
flow/conn evidence -> AI1 + AI2A
http evidence      -> AI2B
suricata evidence  -> Fusion rule evidence
```

AI2B and AI2A can be selected independently through adapter modes. AI1 is
mock/unavailable in this MVP until a real adapter is supplied.

Adapter modes:

```bash
AI1_PREDICTOR_MODE=mock|unavailable|real
AI2A_PREDICTOR_MODE=mock|unavailable|real
AI2B_PREDICTOR_MODE=mock|unavailable|real
```

`real` never falls back to mock. If a frozen artifact cannot be loaded, the
adapter reports `not_available` in the API response.

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

Run with AI2A real and AI2B mock:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock AI2A_PREDICTOR_MODE=real AI2B_PREDICTOR_MODE=mock \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Replay local Zeek logs through the public `/api/events` path. Use `--dry-run`
first to verify parser/correlation counts without creating alerts:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log /path/to/conn.log \
  --http-log /path/to/http.log \
  --dry-run
```

Important: the AI2A real adapter only predicts when the flow evidence already
contains the frozen 41-feature vector used by the release candidate. Raw
`conn.log` replay is parsed and correlated, but the backend does not guess or
recreate those 41 features unless the exact extractor is wired in.

Tail a live Zeek `http.log` into the backend for the local lab MVP:

```bash
ssh zeek@192.168.1.20 "tail -n 0 -F <ZEEK_HTTP_LOG_PATH>" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events
```

Use `tail -n 0 -F` so old rows are not replayed when the stream starts. Use `--no-capture-output` for stdin/pipe mode so `conda run` does not swallow the stream. Use `--http-log - --limit 1 --dry-run` to verify stdin parsing without POSTing.

Frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api VITE_API_BASE_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000/ws/alerts pnpm dev
```
