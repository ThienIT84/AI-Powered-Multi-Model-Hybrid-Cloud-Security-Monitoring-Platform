# Multi-Model Fusion Backend MVP

FastAPI MVP for the Hybrid SOC dashboard integration.

The backend routes evidence to model adapters by input scope:

```text
flow/conn evidence -> AI1 + AI2A
http evidence      -> AI2B
suricata evidence  -> Fusion rule evidence
```

AI1, AI2A, and AI2B can be selected independently through adapter modes. AI1
real is integration-ready, but it requires a local AI1 artifact bundle plus
`evidence.flow.ai1_features`; if either is missing, it reports
`not_available` instead of guessing or falling back to mock.

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

Run with AI1 real for artifact smoke testing:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=real AI2A_PREDICTOR_MODE=mock AI2B_PREDICTOR_MODE=mock \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

AI1 artifact handoff path:

```text
Dataset/tools/ai1_modeling/artifacts/release_candidate_v1/latest/
├── model.joblib
├── preprocessor.joblib        # optional
├── feature_manifest.json
├── thresholds_frozen.json
├── smoke_samples.jsonl        # optional canary
└── model_card.md
```

AI1 real input contract:

```json
{
  "evidence": {
    "flow": {
      "ai1_features": {
        "duration": 1.2,
        "orig_bytes": 1280
      }
    }
  }
}
```

The AI1 model must expose a normalized anomaly confidence where higher means
more anomalous and `confidence >= selected_threshold` maps to `ANOMALY`.

Replay local Zeek logs through the public `/api/events` path. Use `--dry-run`
first to verify parser/correlation counts without creating alerts:

```bash
mkdir -p tmp/zeek_logs/live_mvp
scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/live_mvp/http.log tmp/zeek_logs/live_mvp/http.log
scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/live_mvp/conn.log tmp/zeek_logs/live_mvp/conn.log

conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/live_mvp/conn.log \
  --http-log tmp/zeek_logs/live_mvp/http.log \
  --dry-run
```

Important: the AI2A real adapter predicts only when flow evidence contains the
frozen 41-feature vector used by the release candidate. `conn.log` replay now
enriches normalized Zeek flow rows with that vector before posting to
`/api/events`; direct hand-written flow JSON without `ai2a_features` still
returns `not_available` instead of guessing.

AI2A capability note: the selected release candidate
`rf_v2_1_full_safe_plus_ssh_minimal` is a flow-level multi-class detector, not
an SSH-only model. The final 41-feature schema keeps a minimal SSH temporal pack,
while HTTP beaconing and web initial access are still learned from the optimized
`full_safe` flow features. The release report shows validation/holdout support
for `http_beaconing_indicator`, `web_initial_access_indicator`, and
`ssh_bruteforce_indicator`; use exact release labels instead of introducing a
new `DDoS` label unless the project taxonomy maps it explicitly.
Reference holdout recall for the selected candidate is approximately `0.726`
for HTTP beaconing, `0.831` for web initial access, and `0.883` for SSH brute
force.

Replay mode reads local files on the host. Live mode streams from the Zeek VM
with `ssh tail`.

Tail a live Zeek `http.log` into the backend for the local lab MVP:

```bash
ssh zeek@192.168.1.20 "tail -n 0 -F <ZEEK_HTTP_LOG_PATH>" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events
```

Use `tail -n 0 -F` so old rows are not replayed when the stream starts. Use `--no-capture-output` for stdin/pipe mode so `conda run` does not swallow the stream. Use `--http-log - --limit 1 --dry-run` to verify stdin parsing without POSTing.

Tail a live Zeek `conn.log` into AI2A real inference:

```bash
ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_conn_to_backend.py \
    --conn-log - \
    --api-url http://localhost:8000/api/events
```

The conn tailer enriches each flow with the frozen AI2A 41-feature vector before
POSTing. It is intentionally separate from the HTTP tailer; live UID correlation
between the two streams is a later step. Temporal SSH counters are buffered by
Zeek timestamp so rows with the same timestamp do not become prior context for
each other.

Frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api VITE_API_BASE_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000/ws/alerts pnpm dev
```
