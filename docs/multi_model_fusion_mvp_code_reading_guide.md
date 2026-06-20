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

### Bước 4: Real AI2B adapter

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

Đây là adapter thật đầu tiên trong MVP.

### Bước 5: Adapter registry / dependency wiring

Đọc file:

```text
backend/app/dependencies.py
```

File này tạo orchestrator và chọn adapter.

Biến môi trường quan trọng:

```bash
AI2B_PREDICTOR_MODE=real
```

Nếu bật `real`, backend dùng `RealAI2BAdapter`. Nếu không, AI2B dùng mock adapter.

### Bước 6: Orchestrator

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

### Bước 7: Fusion rule engine

Đọc file:

```text
backend/app/services/fusion.py
```

Fusion hiện tại là rule-based, không average confidence.

Luật chính:

- AI2B `SQLI` -> final label `SQL Injection`.
- AI2B `XSS` -> final label `Cross-Site Scripting`.
- AI1 `ANOMALY` + AI2A non-normal -> `Suspicious Network Activity`.
- Chỉ AI1 anomaly -> `Network Anomaly`.
- Không model nào xác nhận attack -> `Benign / No Confirmed Attack`.

Fusion mode:

- `FULL_MULTI_MODEL`: cả ba model real cùng đóng góp.
- `DEGRADED_AI2B_ONLY`: chỉ AI2B real đóng góp.
- `SIMULATED_FULL_MULTI_MODEL`: cả ba là mock/replay.
- `NO_AI_AVAILABLE`: không model nào chạy được.

### Bước 8: Store và WebSocket

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

### Bước 9: API entrypoint

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

### Bước 10: Backend tests

Đọc file:

```text
backend/tests/test_fusion_mvp.py
```

Các test chính:

- HTTP-only event không chạy AI1/AI2A.
- Flow-only event không chạy AI2B.
- Combined event chạy cả ba mock adapters.

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
AI1 -> completed
AI2A -> completed
AI2B -> not_applicable
Fusion -> Suspicious Network Activity hoặc Network Anomaly
```

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
pytest: 3 passed
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
4. backend/app/adapters/ai2b_real.py
5. backend/app/dependencies.py
6. backend/app/services/orchestrator.py
7. backend/app/services/fusion.py
8. backend/app/services/store.py
9. backend/app/services/websocket_manager.py
10. backend/app/main.py
11. backend/tests/test_fusion_mvp.py
12. frontend/src/types.ts
13. frontend/src/lib/alertMapper.ts
14. frontend/src/useSocket.ts
15. frontend/src/components/alerts/AlertTable.tsx
16. frontend/src/components/alerts/AlertDetailDrawer.tsx
17. frontend/src/mocks/securityData.ts
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
- Chưa tích hợp real AI2A adapter.
- Chưa có long-lived correlation window nhiều event.
- Chưa lưu database bền vững; store hiện là in-memory.
- Chưa dùng final holdout `133-136` để quyết định dashboard integration.

Nhưng contract đã sẵn sàng để cắm AI1/AI2A thật sau này mà không cần đổi frontend schema.
