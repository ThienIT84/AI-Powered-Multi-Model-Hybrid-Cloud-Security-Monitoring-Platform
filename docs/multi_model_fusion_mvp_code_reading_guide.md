# Multi-Model Fusion MVP Code Reading Guide

Tài liệu này giải thích phần vừa được thêm/sửa cho MVP tích hợp AI1 + AI2A + AI2B vào backend/frontend. Mục tiêu chính là giúp bạn đọc code theo đúng thứ tự, hiểu vì sao backend không ép mọi event chạy qua cả ba model, và thấy dữ liệu đi từ event đầu vào tới dashboard như thế nào.

## 1. Ý Tưởng Tổng Quan

Pipeline mới là:

```text
Raw observation/event
-> Evidence Router / EventOrchestrator
-> AI1 / AI2A / AI2B adapters nếu supports(event) = true
-> FusionService
-> Final Alert DTO
-> WebSocket alert.created
-> Frontend mapper
-> Alert table + detail drawer
```

Điểm quan trọng:

- AI1 và AI2A dùng evidence dạng flow/conn log.
- AI2B dùng evidence HTTP method + URI.
- HTTP-only event không chạy qua AI1/AI2A; hai model đó trả `not_applicable`.
- Flow-only event không chạy qua AI2B; AI2B trả `not_applicable`.
- Dashboard hiển thị kết luận cuối từ Fusion, không lấy nhãn raw AI2B làm kết luận toàn hệ thống.

## 2. Thứ Tự Đọc Backend

### Bước 1: Contract chung

Đọc file:

```text
backend/app/contracts.py
```

File này định nghĩa ngôn ngữ chung của backend:

- `ModelStatus`: `completed`, `not_applicable`, `not_available`, `failed`, `simulated`, ...
- `ModelSource`: `real`, `mock`, `replay`, `unavailable`.
- `ModelOutput`: output chuẩn của từng model adapter.
- `FusionOutput`: output chuẩn của fusion engine.
- `normalize_event()`: chuẩn hóa mọi input thành envelope chung.

Đây là file nên đọc đầu tiên vì toàn bộ backend và frontend đều xoay quanh contract này.

### Bước 2: Interface adapter

Đọc file:

```text
backend/app/adapters/base.py
```

File này định nghĩa interface:

```python
class ModelAdapter:
    def supports(self, event) -> bool: ...
    def build_input(self, event): ...
    def predict(self, model_input): ...
```

Ý nghĩa:

- `supports()` quyết định model có nên nhận event này không.
- `build_input()` biến event envelope thành input riêng của model.
- `predict()` chạy model và trả `ModelOutput`.

### Bước 3: Mock adapters

Đọc file:

```text
backend/app/adapters/mock.py
```

File này có:

- `MockAI1Adapter`
- `MockAI2AAdapter`
- `MockAI2BAdapter`

Các adapter này phục vụ demo/dev. Chúng không giả vờ là model thật vì output có `source = "mock"`.

Điểm cần để ý:

- AI1/AI2A `supports()` chỉ true khi có `evidence.flow`.
- AI2B `supports()` chỉ true khi có HTTP `method` và `uri`.

### Bước 4: Real AI2A adapter

Đọc file:

```text
backend/app/adapters/ai2a_real.py
```

File này load AI2A release candidate:

```text
rf_v2_1_full_safe_plus_ssh_minimal
threshold = 0.9
```

Nó kiểm tra model/preprocessor/feature manifest bằng startup canary:

- đúng 41 frozen features;
- đúng class order từ `model.classes_`;
- threshold frozen có tồn tại;
- probability finite.

Điểm quan trọng: adapter này không nhận flow raw tối giản. Nó chỉ predict khi
`evidence.flow` đã chứa đủ frozen feature vector. Replay bridge và live
`conn.log` tailer hiện đã enrich Zeek conn rows thành đúng 41 feature trước khi
POST vào `/api/events`. Nếu bạn tự gửi event bằng `curl` chỉ có vài field raw như
`service`, `dst_port`, `orig_pkts`, adapter vẫn trả `not_available` với reason rõ
ràng thay vì đoán bừa.

Threshold behavior:

```text
max_proba < 0.9 -> label = unknown
```

Fusion không xem `unknown` là attack label.

### Bước 5: Real AI2B adapter

Đọc file:

```text
backend/app/adapters/ai2b_real.py
```

File này load AI2B frozen release-candidate V1.4.9:

- freeze manifest từ `Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest/...`
- model path từ manifest
- policy có `extends` thông qua `ai2b_common.load_json()`
- model joblib frozen

Nó trả:

```text
status = completed
source = real
label = NONE | SQLI | XSS
probabilities = {...}
model_version = AI2B_V1.4.8j
release_candidate = AI2B_V1.4.9_RC
```

Đây là adapter HTTP thật cho SQLI/XSS.

### Bước 6: Unavailable adapter

Đọc file:

```text
backend/app/adapters/unavailable.py
```

File này giúp phân biệt:

- `not_applicable`: event không có evidence mà model đó hỗ trợ.
- `not_available`: model đáng lẽ hỗ trợ evidence này, nhưng artifact/config chưa sẵn sàng.

Ví dụ HTTP-only event sẽ làm AI1/AI2A là `not_applicable`, không phải
`not_available`.

### Bước 7: Adapter registry / dependency wiring

Đọc file:

```text
backend/app/dependencies.py
```

File này tạo orchestrator và chọn adapter.

Biến môi trường quan trọng:

```bash
AI1_PREDICTOR_MODE=mock|real|unavailable
AI2A_PREDICTOR_MODE=mock|real|unavailable
AI2B_PREDICTOR_MODE=real
```

Nếu bật `real`, backend dùng adapter thật tương ứng. Nếu artifact lỗi, backend
không fallback sang mock; adapter trả `not_available` hoặc `failed`.

### Bước 8: Orchestrator

Đọc file:

```text
backend/app/services/orchestrator.py
```

Đây là trái tim của evidence router.

Luồng trong `EventOrchestrator.process()`:

```text
normalize_event(raw_event)
for AI1, AI2A, AI2B:
  nếu không có adapter -> not_available
  nếu adapter.supports(event) false -> not_applicable
  nếu supports true -> predict
FusionService.combine(outputs)
build_alert(event, outputs, fusion)
```

`build_alert()` biến output backend thành DTO mà frontend đang dùng:

- `attack_type`
- `risk_score`
- `severity`
- `detected_by`
- `zeek_evidence`
- `suricata_evidence`
- `ai_analysis.ai1`
- `ai_analysis.ai2a`
- `ai_analysis.ai2b`
- `ai_analysis.fusion`
- `decision_flow`

### Bước 9: Fusion rule engine

Đọc file:

```text
backend/app/services/fusion.py
```

Fusion hiện tại là rule-based, không average confidence.

Luật chính:

- AI2B `SQLI` -> final label `SQL Injection`.
- AI2B `XSS` -> final label `Cross-Site Scripting`.
- AI1 `ANOMALY` + AI2A non-normal/non-unknown -> `Suspicious Network Activity`.
- Chỉ AI1 anomaly -> `Network Anomaly`.
- Không model nào xác nhận attack -> `Benign / No Confirmed Attack`.

Fusion mode:

- `FULL_MULTI_MODEL`: cả ba model real cùng đóng góp.
- `DEGRADED_AI2B_ONLY`: chỉ AI2B real đóng góp.
- `SIMULATED_FULL_MULTI_MODEL`: cả ba là mock/replay.
- `NO_AI_AVAILABLE`: không model nào chạy được.

### Bước 10: Replay bridge cho local lab

Đọc hai file:

```text
backend/app/replay/zeek.py
backend/scripts/replay_local_lab_logs.py
```

`zeek.py` có:

- `ZeekConnParser`: đọc Zeek `conn.log` JSON-lines hoặc `#fields` TSV.
- `ZeekHttpParser`: đọc Zeek `http.log`.
- `ZeekUidCorrelator`: ghép conn/http theo Zeek `uid`.
- `ReplayEventBuilder`: tạo event `network_flow`, `http`, hoặc `combined`.

CLI replay:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log /path/to/conn.log \
  --http-log /path/to/http.log \
  --dry-run
```

`--dry-run` chỉ in số lượng event/correlation, không tạo alert. Khi bỏ
`--dry-run`, script POST từng event vào `/api/events`, tức là đi qua đúng
đường backend công khai thay vì gọi adapter trực tiếp.

Với `conn.log`, replay bridge enrich flow thành frozen AI2A 41-feature vector.
Với `http.log`, replay bridge tạo HTTP evidence cho AI2B. Nếu cả hai log có cùng
Zeek `uid`, replay có thể tạo `combined` event.

### Bước 11: Store và WebSocket

Đọc hai file:

```text
backend/app/services/store.py
backend/app/services/websocket_manager.py
```

`store.py` là in-memory alert store cho MVP.

`websocket_manager.py` gửi message:

```json
{
  "type": "alert.created",
  "data": { "... alert dto ..." }
}
```

### Bước 12: API entrypoint

Đọc file:

```text
backend/app/main.py
```

Endpoints:

```text
GET  /health
POST /api/events
POST /api/events/http
GET  /api/alerts
GET  /api/summary
POST /api/replay/demo
WS   /ws/alerts
```

`/api/events` là endpoint chính cho mọi event type.

`/api/events/http` là wrapper tiện lợi cho HTTP event.

`/api/replay/demo` tạo một số event mẫu để frontend nhận qua WebSocket.

### Bước 13: Backend tests

Đọc các file:

```text
backend/tests/test_fusion_mvp.py
backend/tests/test_ai2a_real_and_replay.py
```

Các test chính:

- HTTP-only event không chạy AI1/AI2A.
- Flow-only event không chạy AI2B.
- Combined event chạy cả ba mock adapters.
- AI2A real threshold `unknown` không bị fusion xem là attack.
- AI2A real thiếu frozen 41 features trả `not_available`.
- Zeek parser đọc JSON-lines và `#fields` TSV.
- UID correlator tạo đúng `network_flow/http/combined`.

## 3. Thứ Tự Đọc Frontend

### Bước 1: Type contract frontend

Đọc file:

```text
frontend/src/types.ts
```

Phần được sửa quan trọng:

- `BackendAiAnalysisDTO`
- `AiDecision`
- `FusionAlertMeta`
- `getAlertFusionMeta(alert)`

`getAlertFusionMeta()` bây giờ ưu tiên dữ liệu thật từ `alert.aiDecision`, gồm:

- status/source của từng model
- label của từng model
- fusion mode

Nếu dữ liệu cũ không có `aiDecision`, nó vẫn fallback theo logic legacy để UI không vỡ.

### Bước 2: Backend DTO mapper

Đọc file:

```text
frontend/src/lib/alertMapper.ts
```

File này map backend snake_case sang frontend camelCase:

```text
ai_analysis.ai1.status -> aiDecision.ai1.status
ai_analysis.ai2b.probabilities -> aiDecision.ai2b.probabilities
ai_analysis.fusion.mode -> aiDecision.fusion.mode
```

Đây là cầu nối quan trọng giữa backend mới và UI cũ.

### Bước 3: WebSocket hook

Đọc file:

```text
frontend/src/useSocket.ts
```

File này xử lý WebSocket messages:

- `INITIAL_DATA`
- `NEW_ALERT`
- `alert.created`
- `TRAFFIC_UPDATE`

Nó có hai đường:

- Nếu data là backend mới dạng snake_case -> dùng `mapBackendAlertToAlert()`.
- Nếu data là mock server cũ dạng camelCase -> dùng `normalizeLegacyAiDecision()` để gắn `status/source = mock`.

### Bước 4: Dashboard alert table

Đọc file:

```text
frontend/src/components/alerts/AlertTable.tsx
```

Các thay đổi chính:

- Cột `AI1_RESULT`, `AI2A_CLASS`, `AI2B_WEB` không còn hard-code theo attack type.
- Dùng `getAlertFusionMeta(alert)`.
- Hiển thị badge theo trạng thái:
  - `✓` real completed
  - `M` mock/simulated
  - `— N/A` not_applicable
  - `○ UNAVAIL` not_available
  - `! FAILED` failed/timeout

Đây là nơi nhìn rõ nhất dashboard đã chuyển sang multi-model honest display.

### Bước 5: Alert detail drawer

Đọc file:

```text
frontend/src/components/alerts/AlertDetailDrawer.tsx
```

Đã thêm block:

```text
MULTI-MODEL ADAPTER STATUS
```

Block này hiển thị:

- AI1 Analysis
- AI2A Analysis
- AI2B Analysis
- source: real/mock/legacy
- status: completed/not_applicable/not_available/...
- input scope
- Fusion Mode

Đây là phần phù hợp để demo cho hội đồng vì nó cho thấy hệ thống trung thực về model nào thật, model nào chưa áp dụng.

### Bước 6: Mock fixture

Đọc file:

```text
frontend/src/mocks/securityData.ts
```

Mock data đã được gắn:

```text
status = completed
source = mock
model_version = AI*_MOCK_V1
```

Như vậy UI fixture không bị trình bày như model thật.

### Bước 7: Network type cleanup

Đọc file:

```text
frontend/src/components/network/NetworkConfig.ts
frontend/src/utils/networkGenerator.ts
frontend/src/utils/syslogGenerator.ts
frontend/src/pages/AttackSurfacePage.tsx
```

Các sửa nhỏ ở đây chủ yếu để TypeScript compile sạch:

- import đúng `NetworkConfig`.
- thêm enum/type còn thiếu cho network/syslog generator.
- thêm icon `RefreshCw`.

Đây không phải phần logic fusion chính, nhưng cần để `tsc --noEmit` pass.

## 4. Luồng Dữ Liệu Ví Dụ

### HTTP-only SQLI event

Input:

```json
{
  "event_type": "http",
  "source_ip": "192.168.56.10",
  "destination_ip": "192.168.56.20",
  "evidence": {
    "http": {
      "method": "GET",
      "uri": "/search?q=' OR 1=1--"
    }
  }
}
```

Backend xử lý:

```text
AI1.supports = false -> not_applicable
AI2A.supports = false -> not_applicable
AI2B.supports = true  -> completed SQLI
Fusion -> SQL Injection, DEGRADED_AI2B_ONLY
```

Frontend hiển thị:

```text
AI1: — N/A
AI2A: — N/A
AI2B: ✓ SQLi
Fusion: SQL Injection
```

### Flow-only network event

Input có `evidence.flow` nhưng không có `evidence.http`.

Backend xử lý:

```text
AI1 -> completed nếu adapter phù hợp
AI2A -> completed nếu flow đã có frozen 41-feature vector
AI2B -> not_applicable
Fusion -> Suspicious Network Activity hoặc Network Anomaly
```

Nếu chỉ gửi flow raw tối giản bằng `curl`, ví dụ chỉ có `service`, `dst_port`,
`orig_pkts`, AI2A real sẽ trả `not_available` vì thiếu feature vector frozen.
Đó là hành vi đúng, không phải mock và không phải model fail.

Frontend hiển thị:

```text
AI1: M/✓ ANOMALY
AI2A: M/✓ PortScan/DoS/...
AI2B: — N/A
Fusion: network alert
```

## 5. Cách Chạy Nhanh

### Backend mode

Từ repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Nếu terminal đang đứng trong `backend/`:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=. \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Lưu ý: backend server sẽ giữ terminal. Nếu nhìn như “treo” và không thấy log, thường là do thiếu `--no-capture-output` hoặc đang dùng sai `PYTHONPATH` so với thư mục hiện tại.

Nếu đang dùng shell đã activate sẵn `interior_ai`, có thể chạy ngắn từ repo root:

```bash
PYTHONPATH=backend uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Backend real AI2B mode from repo root

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Trigger demo events

```bash
curl -X POST http://localhost:8000/api/replay/demo
```

### Frontend API mode

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

### Frontend mock SOC mode

```bash
cd frontend
VITE_DATA_MODE=mock \
VITE_MOCK_WS_URL=ws://localhost:3001 \
pnpm dev
```

Mock mode does not need the backend. It uses `frontend/server.ts` to stream initial alerts plus a new alert and traffic point every 2 seconds. The realtime state is owned once in `frontend/src/App.tsx`; pages receive `alerts` and `isConnected` as props.

Frontend demo login:

```text
Admin:       admin@defense.soc / Password123!
SOC Analyst: analyst@defense.soc / Password123!
```

These are local demo accounts seeded by `frontend/src/components/auth/authService.ts` into browser `localStorage`; they are safe for local testing docs and are not production credentials.

Nếu `pnpm` trên WSL bị lỗi shim, chạy theo cách Node/npm mà môi trường của bạn hỗ trợ. Trong lần verify này, TypeScript được chạy bằng:

```bash
/home/tran_thien/.nvm/versions/node/v24.13.0/bin/node node_modules/typescript/bin/tsc --noEmit
```

## 6. Verification Đã Chạy

Backend:

```bash
/home/tran_thien/miniconda3/bin/conda run -n interior_ai ruff check backend
/home/tran_thien/miniconda3/bin/conda run -n interior_ai env PYTHONPATH=backend pytest backend/tests -q
```

Kết quả:

```text
ruff: PASS
pytest: 13 passed
```

AI2A modeling tests:

```bash
/home/tran_thien/miniconda3/bin/conda run -n interior_ai pytest Dataset/tools/ai2a_modeling/tests -q
```

Kết quả:

```text
83 passed, 11 skipped
```

Frontend:

```bash
/home/tran_thien/.nvm/versions/node/v24.13.0/bin/node node_modules/typescript/bin/tsc --noEmit
```

Kết quả:

```text
PASS
```

Real AI2B smoke:

```text
HTTP SQLI event -> AI2B completed SQLI
Fusion mode -> DEGRADED_AI2B_ONLY
```

## 7. Những File Nên Đọc Theo Checklist

Đọc theo thứ tự này là hợp lý nhất:

```text
1. backend/app/contracts.py
2. backend/app/adapters/base.py
3. backend/app/adapters/mock.py
4. backend/app/adapters/ai2a_real.py
5. backend/app/adapters/ai2b_real.py
6. backend/app/adapters/unavailable.py
7. backend/app/dependencies.py
8. backend/app/services/orchestrator.py
9. backend/app/services/fusion.py
10. backend/app/replay/zeek.py
11. backend/scripts/replay_local_lab_logs.py
12. backend/app/services/store.py
13. backend/app/services/websocket_manager.py
14. backend/app/main.py
15. backend/tests/test_fusion_mvp.py
16. backend/tests/test_ai2a_real_and_replay.py
17. frontend/src/types.ts
18. frontend/src/lib/alertMapper.ts
19. frontend/src/useSocket.ts
20. frontend/src/components/alerts/AlertTable.tsx
21. frontend/src/components/alerts/AlertDetailDrawer.tsx
22. frontend/src/mocks/securityData.ts
```

Nếu chỉ có 30 phút để hiểu nhanh, đọc:

```text
backend/app/contracts.py
backend/app/services/orchestrator.py
backend/app/services/fusion.py
backend/app/main.py
frontend/src/types.ts
frontend/src/useSocket.ts
frontend/src/components/alerts/AlertTable.tsx
```

## 8. Việc Chưa Làm Trong MVP Này

Các phần chưa được làm, để tránh hiểu nhầm:

- Chưa tích hợp real AI1 adapter.
- Live combined correlation giữa HTTP tailer và conn tailer chưa có. Hai tailer
  hiện có thể tạo alert riêng; replay mode vẫn có thể ghép `conn.log`/`http.log`
  theo UID trong cùng một lần chạy.
- Chưa có long-lived correlation window nhiều event.
- Chưa lưu database bền vững; store hiện là in-memory.
- Chưa dùng final holdout `133-136` để quyết định dashboard integration.

Nhưng contract đã sẵn sàng để cắm AI1/AI2A thật sau này mà không cần đổi frontend schema.
