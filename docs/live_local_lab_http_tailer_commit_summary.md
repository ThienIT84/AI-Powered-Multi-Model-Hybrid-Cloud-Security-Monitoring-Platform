# Live Local Lab HTTP Tailer Commit Summary

Commit:

```text
542e3d4 feat(backend): add live Zeek HTTP tailer for local lab
```

Tài liệu này giải thích commit trên đã thêm gì, đọc code theo thứ tự nào, và cách test luồng MVP live local lab.

## 1. Mục Tiêu Của Commit

Commit này chuyển MVP từ chỉ có replay/offline demo sang có thể chạy luồng live local lab tối thiểu:

```text
Kali -> Victim/Web VM -> Zeek http.log -> Backend /api/events -> AI2B/Fusion -> Dashboard
```

Phạm vi commit chỉ tập trung HTTP path để AI2B real phát hiện SQLI/XSS. Chưa xử lý live `conn.log` cho AI2A temporal features.

## 2. Những Gì Đã Thêm/Sửa

### Backend parser

File:

```text
backend/app/replay/zeek.py
```

Thay đổi chính:

- Tách logic parse từng dòng Zeek thành helper `parse_zeek_line()`.
- `ZeekLogParser.parse()` dùng lại helper này.
- Mục đích là để parser dùng được cho cả:
  - file log tĩnh trong replay;
  - từng dòng mới khi tail live `http.log`.

### Live HTTP tailer CLI

File mới:

```text
backend/scripts/tail_zeek_http_to_backend.py
```

Chức năng:

- Tail file Zeek `http.log`.
- Hoặc đọc Zeek log từ stdin bằng `--http-log -`, phù hợp với SSH stream từ Zeek VM.
- Parse dòng mới bằng helper trong `backend/app/replay/zeek.py`.
- Build event HTTP qua `ReplayEventBuilder`.
- POST event vào backend `/api/events`.
- Có `--dry-run` để kiểm tra parsing mà không tạo alert.

Command chính khi `http.log` đọc được local:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_http_to_backend.py \
  --http-log /path/to/zeek/current/http.log \
  --api-url http://localhost:8000/api/events
```

Command chính cho lab VM, đọc log từ Zeek VM `192.168.1.20`:

```bash
ssh zeek@192.168.1.20 "tail -F <ZEEK_HTTP_LOG_PATH>" \
| conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
    python backend/scripts/tail_zeek_http_to_backend.py \
    --http-log - \
    --api-url http://localhost:8000/api/events
```

Với stdin/pipe mode, dùng `--no-capture-output` để `conda run` truyền stream ổn định.

Dry-run:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_http_to_backend.py \
  --http-log /path/to/zeek/current/http.log \
  --from-start \
  --limit 5 \
  --dry-run
```

### Tests

File:

```text
backend/tests/test_ai2a_real_and_replay.py
```

Thêm test:

```text
test_zeek_parse_line_supports_incremental_tailer_rows
```

Test này đảm bảo helper parse-line giữ được `#fields` state và parse được row TSV kiểu Zeek khi tail từng dòng.

### Backend README

File:

```text
backend/README.md
```

Thêm hướng dẫn chạy tailer live `http.log` và dry-run.

### Local lab runbook

File mới:

```text
docs/local_lab_live_mvp_runbook.md
```

Nội dung:

- Kiểm tra Victim/Web VM có listen port `80`.
- Kiểm tra Zeek VM thấy traffic Kali -> Victim.
- Start backend.
- Start frontend.
- Start HTTP tailer.
- Gửi request SQLI/XSS từ Kali.
- Replay fallback nếu live lab lỗi.

### Code reading guide

File:

```text
docs/multi_model_fusion_mvp_code_reading_guide.md
```

Cập nhật lại thứ tự đọc code cho đúng trạng thái mới:

- AI2A real adapter đã có nhưng fail-safe.
- AI2B real adapter là path HTTP chính.
- Replay bridge và live tailer thuộc local lab integration.
- Backend tests hiện pass `13` tests.

## 3. Thứ Tự Đọc Code Nên Theo

Nếu muốn hiểu commit này nhanh, đọc theo thứ tự:

```text
1. docs/local_lab_live_mvp_runbook.md
2. backend/scripts/tail_zeek_http_to_backend.py
3. backend/app/replay/zeek.py
4. backend/tests/test_ai2a_real_and_replay.py
5. backend/README.md
6. docs/multi_model_fusion_mvp_code_reading_guide.md
```

Nếu muốn hiểu toàn bộ backend flow sau khi tailer POST event:

```text
1. backend/app/main.py
2. backend/app/services/orchestrator.py
3. backend/app/adapters/ai2b_real.py
4. backend/app/services/fusion.py
5. backend/app/services/websocket_manager.py
```

## 4. Luồng Runtime Sau Commit

Runtime mong muốn:

```text
Zeek writes http.log
-> tail_zeek_http_to_backend.py reads new row
-> normalize_http_row()
-> ReplayEventBuilder.build()
-> POST /api/events
-> EventOrchestrator
-> AI2BAdapter
-> FusionService
-> Store + WebSocket
-> Frontend dashboard
```

Ví dụ Zeek row:

```text
uid=C1, id.orig_h=10.10.10.10, id.resp_h=192.168.1.10, method=GET, uri=/ai2a_p11_app/search?q=' OR 1=1--
```

Sẽ thành backend event:

```json
{
  "event_type": "http",
  "correlation_id": "C1",
  "source_ip": "10.10.10.10",
  "destination_ip": "192.168.1.10",
  "evidence": {
    "http": {
      "method": "GET",
      "uri": "/ai2a_p11_app/search?q=' OR 1=1--"
    },
    "flow": null,
    "suricata": null
  }
}
```

## 5. Verification Đã Chạy

Backend lint:

```bash
conda run -n interior_ai ruff check backend
```

Kết quả:

```text
All checks passed!
```

Backend tests:

```bash
conda run -n interior_ai env PYTHONPATH=backend pytest backend/tests -q
```

Kết quả:

```text
13 passed
```

Frontend type-check:

```bash
cd frontend
pnpm exec tsc --noEmit
```

Kết quả: PASS.

Tailer dry-run smoke:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_http_to_backend.py \
  --http-log /tmp/zeek_http_tail_test.log \
  --from-start \
  --limit 1 \
  --dry-run
```

Kết quả: script build được event HTTP đúng schema và dừng với `tail_stopped`.

## 6. Những Gì Chưa Làm

- Chưa tail live `conn.log` cho AI2A.
- Chưa tự sinh 41 frozen AI2A features từ raw Zeek flow.
- Chưa thêm persistent database; alert store vẫn in-memory.
- Chưa kiểm trực tiếp trên VM lab trong commit này.
- Chưa đụng AI2B holdout/protocol.

## 7. Ghi Chú Worktree

Sau commit này vẫn có một số mục ngoài scope trong working tree:

```text
frontend/pnpm-lock.yaml
Dataset/
reparse_all_v3_profile_folders.py
```

Không đưa các mục này vào commit live tailer nếu chưa xác minh nguồn gốc/thay đổi.
