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

## 6. Start Zeek Conn Tailer Cho AI2A Qua SSH Stream

Nếu muốn AI2A real nhận flow realtime từ `conn.log`, chạy thêm terminal này trên máy dev/host:

```bash
ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_conn_to_backend.py \
    --conn-log - \
    --api-url http://localhost:8000/api/events
```

Ý nghĩa:

```text
grep '^#fields' gửi header TSV một lần để parser biết tên cột.
tail -n 0 -F chỉ gửi các conn row mới phát sinh.
tail_zeek_conn_to_backend.py enrich flow thành frozen AI2A 41-feature vector.
Backend /api/events gọi AI2A real nếu AI2A_PREDICTOR_MODE=real.
Các SSH temporal counters được buffer theo timestamp; các row cùng timestamp
không được dùng làm prior context cho nhau.
```

Dry-run không cần SSH:

```bash
printf '#fields\tts\tuid\tid.orig_h\tid.orig_p\tid.resp_h\tid.resp_p\tproto\tservice\tduration\torig_bytes\tresp_bytes\torig_pkts\tresp_pkts\torig_ip_bytes\tconn_state\thistory\n1.0\tC1\t10.10.10.10\t38932\t192.168.1.10\t22\ttcp\tssh\t0.5\t100\t50\t5\t5\t300\tSF\tShADadFf\n' \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_conn_to_backend.py \
    --conn-log - \
    --limit 1 \
    --dry-run
```

Lưu ý: HTTP tailer và conn tailer hiện tạo event riêng. Live correlation gom HTTP + flow cùng UID thành một alert duy nhất để sau.

## 7. Gửi Traffic Từ Kali

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
- Nếu conn tailer cũng đang chạy và backend bật `AI2A_PREDICTOR_MODE=real`, dashboard sẽ có thêm flow event với AI2A `completed` / `real` hoặc `unknown` nếu confidence dưới threshold `0.9`.

## 8. Replay Demo Mode Cho AI2A Và AI2B

Replay mode dùng khi bạn đã có log Zeek và muốn phát lại vào backend. Script
`replay_local_lab_logs.py` **không tự SSH và không tự copy log**. Nó chỉ đọc
file log đã nằm trên máy host/dev.

Luồng replay:

```text
Zeek VM http.log/conn.log
-> scp về host/dev
-> replay_local_lab_logs.py đọc file local
-> POST /api/events
-> AI2A/AI2B/Fusion
-> Dashboard
```

### 8.1. Copy log từ Zeek VM về host/dev

Từ repo root trên máy host/dev:

```bash
mkdir -p tmp/zeek_logs/live_mvp

scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/live_mvp/http.log \
  tmp/zeek_logs/live_mvp/http.log

scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/live_mvp/conn.log \
  tmp/zeek_logs/live_mvp/conn.log
```

Sau khi copy, file nằm ở:

```text
tmp/zeek_logs/live_mvp/http.log
tmp/zeek_logs/live_mvp/conn.log
```

Nếu bạn đang dùng path log khác trên Zeek VM, thay phần
`/home/zeek/fcaj-ai2a-normal/live_mvp/...` bằng path thật.

### 8.2. Dry-run trước khi bắn vào backend

Dry-run chỉ parse/correlate, không tạo alert:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/live_mvp/conn.log \
  --http-log tmp/zeek_logs/live_mvp/http.log \
  --dry-run
```

Expected summary có các field kiểu:

```text
conn_rows
ai2a_feature_enriched_flows
http_rows
combined_events
flow_only_events
http_only_events
```

`ai2a_feature_enriched_flows > 0` nghĩa là `conn.log` đã được enrich thành
frozen AI2A 41-feature vector.

### 8.3. Replay AI2B-only từ `http.log`

Backend nên chạy với AI2B real:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=mock \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Replay:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --http-log tmp/zeek_logs/live_mvp/http.log \
  --api-url http://localhost:8000/api/events
```

Kết quả mong đợi:

- HTTP evidence đi vào AI2B.
- AI2B hiển thị `completed` / `real` trong dashboard detail.
- SQLI/XSS URI nếu có trong `http.log` sẽ tạo SQL Injection hoặc Cross-Site Scripting alert.

### 8.4. Replay AI2A-only từ `conn.log`

Backend nên chạy với AI2A real:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=mock \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Replay:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/live_mvp/conn.log \
  --api-url http://localhost:8000/api/events
```

Kết quả mong đợi:

- `conn.log` được parse thành flow evidence.
- Replay bridge thêm `ai2a_features` đủ 41 feature vào `evidence.flow`.
- AI2A hiển thị `completed` / `real` nếu model artifact load được.
- Nếu confidence dưới frozen threshold `0.9`, label có thể là `unknown`; đây là đúng release logic, không phải lỗi.

### 8.5. Replay combined AI2A + AI2B

Backend chạy cả AI2A real và AI2B real:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Replay cả `conn.log` và `http.log`:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/live_mvp/conn.log \
  --http-log tmp/zeek_logs/live_mvp/http.log \
  --api-url http://localhost:8000/api/events
```

Kết quả mong đợi:

- Nếu `conn.log` và `http.log` có cùng Zeek `uid`, backend tạo `combined` event.
- AI2A xử lý flow side.
- AI2B xử lý HTTP side.
- Fusion tạo final alert và dashboard hiển thị contributors theo model thật sự completed.

## 9. Scope Ghi Nhớ

- Primary demo: live local lab.
- Replay demo: copy `conn.log`/`http.log` về host rồi phát lại qua `/api/events`.
- AI2B real là model chính cho HTTP SQLI/XSS trong MVP.
- AI2A real chạy được từ `conn.log` replay nhờ backend enrich frozen 41-feature vector.
- Live `conn.log` tailer cho AI2A đã có, nhưng hiện tạo flow alert riêng; live combined correlation theo UID sẽ làm sau.
- AI2A không phải SSH-only. Release candidate `rf_v2_1_full_safe_plus_ssh_minimal`
  là flow-level multi-class detector: SSH temporal minimal là phần temporal được
  giữ trong 41 feature, còn `http_beaconing_indicator` và
  `web_initial_access_indicator` vẫn được detect bằng nhóm `full_safe` flow
  features đã tối ưu.
- Theo AI2A final report, selected candidate có validation/holdout evidence đáng
  chú ý:
  - `ssh_bruteforce_indicator`: validation recall `0.985`, holdout recall `0.883`.
  - `http_beaconing_indicator`: validation recall `0.950`, holdout recall `0.726`, holdout PR-AUC `0.970`.
  - `web_initial_access_indicator`: validation recall `0.862`, holdout recall `0.831`.
- Nếu cần nói về DoS/DDoS trong báo cáo hoặc demo, dùng đúng label/taxonomy của
  AI2A release report. Không tự gọi là `DDoS` nếu release artifact không có class
  tên đó.
- Không quay lại training/holdout trong demo MVP này.
