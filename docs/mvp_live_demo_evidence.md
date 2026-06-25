# MVP Live Local Lab Demo Evidence

Tài liệu này dùng để ghi bằng chứng demo MVP live local lab. Mục tiêu là chứng minh luồng:

```text
Kali -> Victim/Web VM -> Zeek http.log/conn.log -> FastAPI -> AI2A/AI2B -> Fusion -> Dashboard
```

## 1. Environment Snapshot

Ghi lại trước khi demo:

```text
Date/time:
Git branch:
Git commit:
Backend host:
Frontend URL:
Kali IP: 10.10.10.10
Victim IP: 192.168.1.10
Zeek SSH IP: 192.168.17.20
Zeek log dir: /home/zeek/fcaj-ai2a-normal/live_mvp
```

Verification:

```bash
git log -1 --oneline
conda run -n interior_ai ruff check backend
conda run -n interior_ai env PYTHONPATH=backend pytest backend/tests -q
```

Expected:

```text
ruff: All checks passed
pytest: all backend tests passed
```

## 2. Start Zeek Live Capture

Chạy trên Zeek VM qua SSH:

```bash
ssh zeek@192.168.17.20
```

Trong terminal SSH của Zeek VM:

```bash
cd /home/zeek/fcaj-ai2a-normal
mkdir -p live_mvp
cd live_mvp
sudo zeek -i ens33
```

Terminal này phải giữ nguyên trong lúc demo. Nếu dừng terminal này thì Zeek không ghi log mới.

Kiểm từ máy host/dev:

```bash
ssh zeek@192.168.17.20 'ls -lah /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log /home/zeek/fcaj-ai2a-normal/live_mvp/http.log 2>/dev/null'
ssh zeek@192.168.17.20 'stat /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log /home/zeek/fcaj-ai2a-normal/live_mvp/http.log 2>/dev/null'
```

Evidence to capture:

```text
[ ] Zeek VM terminal is running sudo zeek -i ens33.
[ ] conn.log exists.
[ ] http.log exists after first HTTP request.
[ ] stat Modify time changes after traffic.
```

## 3. Start Backend And Frontend

Backend:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

Evidence to capture:

```text
[ ] Backend terminal shows server started.
[ ] Frontend dashboard opens.
[ ] WebSocket/data mode is API mode, not mock mode.
```

## 4. Start Live Correlated Tailer

Preferred live MVP path:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_correlated_to_backend.py \
  --zeek-ssh zeek@192.168.17.20 \
  --sensor-id zeek-vm-01 \
  --conn-log /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log \
  --http-log /home/zeek/fcaj-ai2a-normal/live_mvp/http.log \
  --api-url http://localhost:8000/api/events \
  --allow-endpoint 10.10.10.10 \
  --allow-endpoint 192.168.1.10 \
  --require-both-endpoints \
  --correlation-timeout 5.0
```

Debug fallback only:

```bash
ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/http.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/http.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events

ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_conn_to_backend.py \
    --conn-log - \
    --api-url http://localhost:8000/api/events
```

Evidence to capture:

```text
[ ] Correlated tailer prints correlated_tail_started.
[ ] No SSH error.
[ ] No backend POST error.
[ ] Posted events include event_id like zeek:zeek-vm-01:<uid>:<trans_depth>.
```

## 5. Send Demo Traffic From Kali

Normal HTTP:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/"
```

SQL Injection:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/search?q=%27%20OR%201%3D1--"
```

XSS:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E"
```

Optional SSH/flow traffic for AI2A:

```bash
ssh -o ConnectTimeout=3 user@192.168.1.10
```

If no SSH service/user is available, use any traffic that produces new `conn.log` rows and note that AI2A may classify as `unknown` when confidence is below threshold `0.9`.

## 6. Expected Evidence

Tailers:

```text
[ ] Correlated tailer prints status=posted for normal/SQLI/XSS rows.
[ ] SQLI/XSS rows are combined when conn.log and http.log for the same UID are both available.
[ ] Background traffic outside Kali <-> Victim is filtered from the demo stream.
```

Dashboard:

```text
[ ] Normal HTTP appears as benign/low or no confirmed attack.
[ ] SQLI appears as SQL Injection.
[ ] XSS appears as Cross-Site Scripting.
[ ] Detail drawer shows AI2B status=completed, source=real.
[ ] Combined event shows AI2A flow side when conn evidence is available.
[ ] Late enrichment, if observed, updates existing alert instead of creating a duplicate row.
[ ] Fusion contributors/excluded_models are visible and honest.
```

Screenshots to save:

```text
[ ] Main dashboard after SQLI.
[ ] Detail drawer for SQLI showing AI2B real.
[ ] Main dashboard after XSS.
[ ] Detail drawer for XSS showing AI2B real.
[ ] Detail drawer for AI2A flow event, if available.
[ ] Optional A10 replay dashboard showing HTTP Beaconing / Callback.
[ ] Optional A10 replay dashboard showing Controlled Exfiltration.
```

## 7. Notes For Report

Use this wording:

```text
The MVP demonstrates live ingestion from the local lab through Zeek logs into a FastAPI multi-model fusion backend and SOC dashboard. The correlated Zeek tailer combines conn.log and http.log by sensor, UID, and HTTP transaction depth before sending deterministic events to the backend. AI2B performs real HTTP semantic SQLI/XSS detection from http.log. AI2A performs real flow-level classification from conn.log when the frozen 41-feature vector is available; outputs below the frozen 0.9 threshold are reported as unknown rather than forced into an attack label.
```

Optional A10 replay wording:

```text
The A10 replay is used as a capability demonstration rather than a final evaluation. On the copied `a10_008_callback_augmented_chain` logs, AI2A thresholded detections include six HTTP Beaconing / Callback events and two Controlled Exfiltration events. Fusion displays these AI2A real detections without lowering the frozen 0.9 threshold; rows below threshold remain unknown/benign.
```

Current limitations:

```text
- AI1 remains mock/unavailable in the MVP.
- Incident/campaign aggregation across multiple HTTP transactions is future work.
- Final AI2B strict blind holdout remains future validation and does not block the dashboard MVP.
```
