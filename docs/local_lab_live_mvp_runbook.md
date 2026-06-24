# Local Lab Live MVP Runbook

Runbook này dùng cho demo MVP theo luồng chính:

```text
Kali -> Victim/Web VM -> Zeek http.log/conn.log -> Backend /api/events -> AI2A/AI2B/Fusion -> Dashboard
```

Replay Zeek logs chỉ là fallback/debug, không phải luồng demo chính.

IP/lab defaults lấy từ `Dataset/tools/attack_profiles/attack_012_web_semantic/configs/run_plan_attack_a12.yaml`:

```text
Kali attacker: 10.10.10.10
Victim/Web:    192.168.1.10
Zeek sensor:   192.168.1.20  (data-plane/capture IP)
Zeek SSH:      192.168.17.20 (host/dev SSH management IP)
Zeek iface:    ens33
Web root:      /ai2a_p11_app/
```

Backend và frontend chạy trên máy dev/host của bạn. Tailer cũng chạy trên máy dev/host; nó đọc `http.log` từ Zeek VM qua SSH stream.

## 1. Kiểm Tra Lab Trước Khi Chạy Backend

Trên Victim/Web VM `192.168.1.10`, xác nhận web service đang listen port `80`:

```bash
sudo ss -ltnp | grep ':80'
```

Trên Zeek VM, xác nhận sensor/data-plane interface nhìn thấy traffic Kali -> Victim:

```bash
sudo tcpdump -ni ens33 'host 10.10.10.10 and host 192.168.1.10 and tcp port 80'
```

Trên Kali, gửi thử request tới Victim:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/"
```

Nếu `tcpdump` không thấy SYN/HTTP traffic, sửa network/interface trước. Chưa cần debug backend.

## 2. Start Zeek Live Capture Trên Zeek VM

Phần này phải chạy trên **Zeek VM**, không chạy trên Kali và không chạy trên máy host/dev.

Từ máy dev/host, SSH vào Zeek VM bằng management IP:

```bash
ssh zeek@192.168.17.20
```

Trên Zeek VM, tạo thư mục live demo và chạy Zeek trên interface capture `ens33`:

```bash
cd /home/zeek/fcaj-ai2a-normal
mkdir -p live_mvp
cd live_mvp
sudo zeek -i ens33
```

Terminal này phải tiếp tục chạy. Nếu bạn `Ctrl-C`, Zeek sẽ dừng ghi `conn.log` và `http.log`.

Ở một terminal khác, kiểm tra log đã được tạo:

```bash
ssh zeek@192.168.17.20 'ls -lah /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log /home/zeek/fcaj-ai2a-normal/live_mvp/http.log 2>/dev/null'
```

Nếu `http.log` chưa xuất hiện ngay, gửi một HTTP request từ Kali tới Victim rồi kiểm lại:

```bash
curl -v "http://192.168.1.10/ai2a_p11_app/"
```

Kiểm log có tăng không:

```bash
ssh zeek@192.168.17.20 'stat /home/zeek/fcaj-ai2a-normal/live_mvp/http.log /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log'
```

Nếu `tcpdump` thấy packet nhưng `conn.log/http.log` không tăng, lỗi nằm ở Zeek process/interface/log directory, chưa phải backend/tailer.

## 3. Start Backend

Từ repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal này sẽ giữ process. Đó là bình thường.

Smoke test nhanh:

```bash
curl -s http://localhost:8000/health
```

## 4. Start Frontend API Mode

Terminal khác:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

Mở URL mà Vite in ra, đăng nhập bằng tài khoản demo đã ghi trong frontend docs.

## 5. Kiểm Tra Zeek Log Đang Ghi

Với live demo, path chuẩn là:

```text
/home/zeek/fcaj-ai2a-normal/live_mvp/http.log
/home/zeek/fcaj-ai2a-normal/live_mvp/conn.log
```

Từ máy dev/host, kiểm nhanh:

```bash
ssh zeek@192.168.17.20 'tail -n 3 /home/zeek/fcaj-ai2a-normal/live_mvp/http.log 2>/dev/null; tail -n 3 /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log 2>/dev/null'
```

Nếu bạn dùng thư mục khác, thay `live_mvp` bằng đúng path đang được Zeek ghi.

## 6. Start Correlated Zeek Tailer Qua SSH Stream

Đây là luồng live demo chính. Correlated tailer đọc đồng thời `conn.log` và
`http.log`, ghép theo:

```text
connection key  = sensor_id + uid
transaction key = sensor_id + uid + trans_depth
```

Nhờ vậy một HTTP keep-alive connection có nhiều request sẽ không bị ghi đè URI.

Chạy trên máy dev/host:

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

Ý nghĩa:

```text
tailer SSH vào Zeek VM để stream conn.log + http.log.
sensor_id giúp tránh correlate nhầm nếu sau này có nhiều Zeek sensor.
event_id deterministic giúp backend upsert, không tạo alert trùng.
filter exact pair giữ Kali <-> Victim và loại Victim -> Internet background.
```

Nếu SSH dùng password, script sẽ hiện password prompt trực tiếp trong terminal.

Correlated tailer có thể emit:

```text
combined  = có cả flow + HTTP evidence
http_only = có HTTP trước, flow chưa tới trong correlation timeout
flow_only = flow không có HTTP transaction tương ứng
```

Nếu `http_only` được emit trước rồi `conn.log` tới muộn, backend sẽ update cùng
`event_id` và dashboard nhận `alert.updated`.

Demo curl nên ép đóng connection để `conn.log` và `http.log` xuất hiện gọn hơn:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/"
```

Local dry-run không cần SSH:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_correlated_to_backend.py \
  --conn-log tmp/zeek_logs/live_mvp/conn.log \
  --http-log tmp/zeek_logs/live_mvp/http.log \
  --from-start \
  --dry-run \
  --max-emitted-events 5 \
  --allow-endpoint 10.10.10.10 \
  --allow-endpoint 192.168.1.10 \
  --require-both-endpoints
```

## 7. Debug Fallback: Tail HTTP Hoặc Conn Riêng

Chỉ dùng hai tailer cũ khi cần debug riêng AI2B hoặc AI2A.

AI2B HTTP-only debug:

```bash
ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/http.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/http.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events
```

AI2A conn-only debug:

```bash
ssh zeek@192.168.17.20 "grep '^#fields' /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log; tail -n 0 -F /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_conn_to_backend.py \
    --conn-log - \
    --api-url http://localhost:8000/api/events
```

Trong demo chính, ưu tiên `tail_zeek_correlated_to_backend.py`.

## 8. Gửi Traffic Từ Kali

Normal HTTP:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/"
```

SQL Injection demo:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/search?q=%27%20OR%201%3D1--"
```

XSS demo payload nên dùng payload event-handler encoded, vì đây là style AI2B
frozen candidate nhận ổn hơn `script>alert(1)</script>` đơn giản:

```bash
curl -v -H "Connection: close" "http://192.168.1.10/ai2a_p11_app/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E"
```

Expected result:

- Zeek `http.log` có URI tương ứng.
- Correlated tailer in `status=posted`.
- Backend WebSocket gửi alert mới.
- Dashboard hiện alert SQL Injection hoặc Cross-Site Scripting.
- Detail drawer hiển thị AI2B `completed` / `real`.
- Nếu `conn.log` và `http.log` cùng `uid` có mặt trong correlation lifecycle,
  alert là `combined` và có cả AI2A flow side + AI2B HTTP side.

## 9. Replay Demo Mode Cho AI2A Và AI2B

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

### 9.1. Copy log từ Zeek VM về host/dev

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

### 9.2. Dry-run trước khi bắn vào backend

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

### 9.3. Replay AI2B-only từ `http.log`

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

### 9.4. Replay AI2A-only từ `conn.log`

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

### 9.5. Replay combined AI2A + AI2B

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

### 9.6. Replay AI2A A10 Mixed Chain Capability Demo

Nếu muốn chứng minh AI2A real phát hiện flow-level campaign tốt hơn `live_mvp`
ngắn, dùng A10 mixed chain log đã thu thập trước đó:

```bash
mkdir -p tmp/zeek_logs/a10_mixed_chain

scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/runs/a10_008_callback_augmented_chain/conn.log \
  tmp/zeek_logs/a10_mixed_chain/conn.log

scp zeek@192.168.17.20:/home/zeek/fcaj-ai2a-normal/runs/a10_008_callback_augmented_chain/http.log \
  tmp/zeek_logs/a10_mixed_chain/http.log
```

Backend mode:

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
  --conn-log tmp/zeek_logs/a10_mixed_chain/conn.log \
  --http-log tmp/zeek_logs/a10_mixed_chain/http.log \
  --api-url http://localhost:8000/api/events
```

Kỳ vọng với sample A10 này:

```text
AI2A thresholded detections:
- 6 x HTTP Beaconing / Callback
- 2 x Controlled Exfiltration

AI2A unknown rows remain low/benign because threshold 0.9 is still enforced.
```

Đây là capability replay/demo, không phải final holdout metric. Không hạ
threshold, không train lại model, không dùng raw label dưới threshold để tạo
alert.

## 10. Scope Ghi Nhớ

- Primary demo: live local lab.
- Replay demo: copy `conn.log`/`http.log` về host rồi phát lại qua `/api/events`.
- AI2B real là model chính cho HTTP SQLI/XSS trong MVP.
- AI2A real chạy được từ `conn.log` replay nhờ backend enrich frozen 41-feature vector.
- Fusion MVP cho phép AI2A real tự raise alert khi label đã vượt threshold
  frozen `0.9`; `unknown` vẫn là abstain và không được xem là attack.
- Live correlated tailer là luồng demo chính: nó correlate theo
  `sensor_id + uid + trans_depth`, emit deterministic `event_id`, và backend
  upsert để tránh duplicate alert.
- Hai tailer riêng `tail_zeek_http_to_backend.py` và
  `tail_zeek_conn_to_backend.py` chỉ là debug fallback.
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
