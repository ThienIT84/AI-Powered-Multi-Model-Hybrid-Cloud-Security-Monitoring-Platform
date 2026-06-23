# Local Lab Live MVP Runbook

Runbook này dùng cho demo MVP theo luồng chính:

```text
Kali -> Victim/Web VM -> Zeek http.log -> Backend /api/events -> AI2B/Fusion -> Dashboard
```

Replay Zeek logs chỉ là fallback/debug, không phải luồng demo chính.

IP/lab defaults lấy từ `Dataset/tools/attack_profiles/attack_012_web_semantic/configs/run_plan_attack_a12.yaml`:

```text
Kali attacker: 10.10.10.10
Victim/Web:    192.168.1.10
Zeek sensor:   192.168.1.20
Zeek iface:    ens33
Web root:      /ai2a_p11_app/
```

Backend và frontend chạy trên máy dev/host của bạn. Tailer cũng chạy trên máy dev/host; nó đọc `http.log` từ Zeek VM qua SSH stream.

## 1. Kiểm Tra Lab Trước Khi Chạy Backend

Trên Victim/Web VM `192.168.1.10`, xác nhận web service đang listen port `80`:

```bash
sudo ss -ltnp | grep ':80'
```

Trên Zeek VM `192.168.1.20`, xác nhận sensor nhìn thấy traffic Kali -> Victim:

```bash
sudo tcpdump -ni ens33 'host 10.10.10.10 and host 192.168.1.10 and tcp port 80'
```

Trên Kali, gửi thử request tới Victim:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/"
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

## 4. Tìm Zeek http.log Đang Ghi

Từ máy dev hoặc Kali, tìm các file `http.log` trên Zeek VM:

```bash
ssh zeek@192.168.1.20 'find /home/zeek/fcaj-ai2a-normal -name http.log -type f | sort | tail -20'
```

Nếu chưa thấy, tìm rộng hơn:

```bash
ssh zeek@192.168.1.20 'find /opt/zeek /home/zeek -name http.log -type f 2>/dev/null | sort | tail -20'
```

Chọn file đang tăng khi Kali gửi request. Gọi path đó là:

```text
ZEEK_HTTP_LOG_PATH
```

## 5. Start Zeek HTTP Tailer Qua SSH Stream

Tailer chạy trên máy dev/host, nhưng đọc log từ Zeek VM qua `ssh tail -n 0 -F`:

```bash
ssh zeek@192.168.1.20 "tail -n 0 -F <ZEEK_HTTP_LOG_PATH>" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events
```

Ý nghĩa:

```text
tail -n 0 -F chạy trên Zeek VM
Python tailer chạy trên máy dev
Backend vẫn là http://localhost:8000 trên máy dev
```

`tail -F` mặc định sẽ in 10 dòng cuối có sẵn. Dùng `tail -n 0 -F` để chỉ gửi các request mới phát sinh sau khi tailer bắt đầu.

Lưu ý: với pipe/stdin, dùng `conda run --no-capture-output`; dạng `conda run` thường có thể không truyền stdin ổn định.

Test stdin dry-run không cần SSH:

```bash
printf '#fields\tts\tuid\tid.orig_h\tid.resp_h\tmethod\turi\n1.0\tC1\t10.10.10.10\t192.168.1.10\tGET\t/ai2a_p11_app/search?q=x\n' \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --limit 1 \
    --dry-run
```

## 6. Gửi Traffic Từ Kali

Normal HTTP:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/"
```

SQL Injection demo:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/search?q=%27%20OR%201%3D1--"
```

XSS demo:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/search?q=%3Cscript%3Ealert(1)%3C/script%3E"
```

Expected result:

- Zeek `http.log` có URI tương ứng.
- Tailer in `status=posted`.
- Backend WebSocket gửi alert mới.
- Dashboard hiện alert SQL Injection hoặc Cross-Site Scripting.
- Detail drawer hiển thị AI2B `completed` / `real`; AI1/AI2A theo mode demo.

## 7. Fallback Replay Mode

Nếu live lab/network có vấn đề nhưng đã có `http.log` hoặc `conn.log`, replay offline:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --http-log /path/to/http.log \
  --api-url http://localhost:8000/api/events
```

Nếu có `conn.log`, replay bridge sẽ enrich flow thành frozen AI2A 41-feature vector trước khi POST:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  AI2A_PREDICTOR_MODE=real \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log /path/to/conn.log \
  --api-url http://localhost:8000/api/events
```

Dry-run trước khi POST:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --http-log /path/to/http.log \
  --dry-run
```

## 8. Scope Ghi Nhớ

- Primary demo: live local lab.
- Fallback demo: replay Zeek logs.
- AI2B real là model chính cho HTTP SQLI/XSS trong MVP.
- AI2A real chạy được từ `conn.log` replay nhờ backend enrich frozen 41-feature vector.
- Live `conn.log` tailer cho AI2A chưa phải primary path; ưu tiên replay `conn.log` hoặc combined replay khi cần demo AI2A.
- Không quay lại training/holdout trong demo MVP này.
