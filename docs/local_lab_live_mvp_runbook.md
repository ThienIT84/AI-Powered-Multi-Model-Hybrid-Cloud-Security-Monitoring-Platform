# Local Lab Live MVP Runbook

Runbook này dùng cho demo MVP theo luồng chính:

```text
Kali -> Victim/Web VM -> Zeek http.log -> Backend /api/events -> AI2B/Fusion -> Dashboard
```

Replay Zeek logs chỉ là fallback/debug, không phải luồng demo chính.

## 1. Kiểm Tra Lab Trước Khi Chạy Backend

Trên Victim/Web VM, xác nhận web service đang listen port `80`:

```bash
sudo ss -ltnp | grep ':80'
```

Trên Zeek VM, xác nhận sensor nhìn thấy traffic Kali -> Victim:

```bash
sudo tcpdump -ni any 'host <KALI_IP> and host <VICTIM_IP> and tcp port 80'
```

Trên Kali, gửi thử request tới Victim:

```bash
curl -v "http://<VICTIM_IP>/"
```

Nếu `tcpdump` không thấy SYN/HTTP traffic, sửa network/interface trước. Chưa cần debug backend.

## 2. Start Backend

Từ repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=mock \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal này sẽ giữ process. Đó là bình thường.

Smoke test nhanh:

```bash
curl -s http://localhost:8000/health
```

## 3. Start Frontend API Mode

Terminal khác:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

Mở URL mà Vite in ra, đăng nhập bằng tài khoản demo đã ghi trong frontend docs.

## 4. Start Zeek HTTP Tailer

Trỏ `--http-log` tới file `http.log` hiện tại của Zeek. Ví dụ:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_http_to_backend.py \
  --http-log /path/to/zeek/current/http.log \
  --api-url http://localhost:8000/api/events
```

Nếu muốn test trên log có sẵn mà không POST backend:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_http_to_backend.py \
  --http-log /path/to/zeek/current/http.log \
  --from-start \
  --limit 5 \
  --dry-run
```

## 5. Gửi Traffic Từ Kali

Normal HTTP:

```bash
curl -v "http://<VICTIM_IP>/"
```

SQL Injection demo:

```bash
curl -v "http://<VICTIM_IP>/search?q=%27%20OR%201%3D1--"
```

XSS demo:

```bash
curl -v "http://<VICTIM_IP>/profile?bio=%3Cscript%3Ealert(1)%3C/script%3E"
```

Expected result:

- Zeek `http.log` có URI tương ứng.
- Tailer in `status=posted`.
- Backend WebSocket gửi alert mới.
- Dashboard hiện alert SQL Injection hoặc Cross-Site Scripting.
- Detail drawer hiển thị AI2B `completed` / `real`; AI1/AI2A theo mode demo.

## 6. Fallback Replay Mode

Nếu live lab/network có vấn đề nhưng đã có `http.log`, replay offline:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --http-log /path/to/http.log \
  --api-url http://localhost:8000/api/events
```

Dry-run trước khi POST:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --http-log /path/to/http.log \
  --dry-run
```

## 7. Scope Ghi Nhớ

- Primary demo: live local lab.
- Fallback demo: replay Zeek logs.
- AI2B real là model chính cho HTTP SQLI/XSS trong MVP.
- AI2A real adapter đã có, nhưng raw `conn.log` chưa tự sinh đủ frozen 41-feature vector trong backend.
- Không quay lại training/holdout trong demo MVP này.
