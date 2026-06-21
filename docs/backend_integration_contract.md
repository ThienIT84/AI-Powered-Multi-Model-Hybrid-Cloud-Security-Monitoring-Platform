# Backend Integration Contract For Multi-Model Fusion MVP

Tài liệu này là bản bàn giao ngắn cho backend team. Mục tiêu là giúp backend tiếp tục tích hợp AI1, AI2A, AI2B và Fusion API mà không cần đọc toàn bộ frontend.

Source of truth hiện tại là schema backend/frontend đã implement. Không đổi top-level response sang `event_id` / `final_label` trong task handoff này; final alert DTO hiện dùng `id`, `attack_type`, `risk_score`, `ai_analysis.*`.

## 1. Current Architecture

Backend MVP hiện đi theo luồng:

```text
POST /api/events
-> normalize event envelope
-> EventOrchestrator
-> AI1 / AI2A / AI2B adapters nếu supports(event) = true
-> FusionService
-> final alert DTO
-> in-memory alert store
-> WebSocket alert.created
-> frontend dashboard
```

Nguyên tắc quan trọng:

- Không ép mọi event chạy qua cả ba model.
- AI1/AI2A dùng `flow` evidence.
- AI2B dùng `http` evidence.
- Model không phù hợp input phải trả `not_applicable`, không fake prediction.
- Model chưa tích hợp thật phải trả `not_available` hoặc `mock/simulated`, không trình bày như real.

## 2. Main Endpoints

### `GET /health`

Response:

```json
{ "status": "ok" }
```

### `POST /api/events`

Endpoint chính cho mọi event type.

Request body:

```json
{
  "schema_version": "1.0",
  "event_type": "http",
  "event_id": "evt-001",
  "correlation_id": "zeek-Cabc123",
  "timestamp": "2026-06-18T10:00:00Z",
  "source_ip": "192.168.56.10",
  "destination_ip": "192.168.56.20",
  "evidence": {
    "http": {
      "method": "GET",
      "uri": "/search?q=test",
      "user_agent": "Mozilla/5.0"
    },
    "flow": null,
    "suricata": null
  }
}
```

Supported `event_type`:

```text
http
network_flow
combined
unknown
```

Nếu `event_type` thiếu, backend tự suy luận từ `evidence`.

### `POST /api/events/http`

Convenience wrapper cho HTTP event.

Request body:

```json
{
  "method": "GET",
  "uri": "/search?q=' OR 1=1--",
  "source_ip": "192.168.56.10",
  "destination_ip": "192.168.56.20",
  "user_agent": "Mozilla/5.0",
  "flow": null,
  "suricata": null
}
```

Backend sẽ convert sang event envelope có `event_type = "http"`.

`POST /api/events` và `POST /api/events/http` phải trả cùng một final alert DTO. Khác biệt chỉ nằm ở request input: `/api/events/http` là wrapper tiện lợi cho HTTP-only event.

### `GET /api/alerts`

Query:

```text
limit=50
```

Response: list alert DTO.

### `GET /api/summary`

Response hiện là summary từ in-memory store.

### `POST /api/replay/demo`

Tạo một số event demo và broadcast qua WebSocket.

### `WS /ws/alerts`

Khi client connect:

```json
{
  "type": "INITIAL_DATA",
  "data": []
}
```

Khi alert mới được tạo:

```json
{
  "type": "alert.created",
  "data": { "... final alert DTO ..." }
}
```

## 3. Event Evidence Schema

### HTTP Evidence

Minimum fields cho AI2B:

```json
{
  "method": "GET",
  "uri": "/search?q=test"
}
```

Optional:

```json
{
  "user_agent": "Mozilla/5.0"
}
```

AI2B adapter chỉ `supports(event) = true` khi có cả `method` và `uri`.

### Flow Evidence

Minimum fields cho AI1/AI2A mock hiện tại:

```json
{
  "service": "ssh",
  "dst_port": 22,
  "orig_pkts": 700,
  "attack_hint": "scan"
}
```

Suggested real AI1/AI2A fields:

```json
{
  "src_port": 44321,
  "dst_port": 22,
  "proto": "tcp",
  "service": "ssh",
  "duration": 1.2,
  "orig_bytes": 1280,
  "resp_bytes": 240,
  "orig_pkts": 20,
  "resp_pkts": 4,
  "conn_state": "S0"
}
```

AI1/AI2A adapter nên `supports(event) = true` khi có `evidence.flow`.

AI2A real adapter có ràng buộc riêng: model freeze hiện tại dùng 41 frozen
features của release candidate `rf_v2_1_full_safe_plus_ssh_minimal`. Backend
không được tự đoán lại 41 feature từ raw `conn.log`. Nếu flow evidence chưa có
đủ frozen feature vector, AI2A real trả `not_available` với reason rõ ràng.
Raw Zeek replay bridge chỉ parse/correlate logs rồi POST event vào `/api/events`.

### Suricata Evidence

Optional evidence cho Fusion:

```json
{
  "signature_id": "2010935",
  "signature": "ET WEB_SERVER Possible SQL Injection Attempt",
  "category": "Web Application Attack",
  "severity": 1
}
```

Suricata hiện chưa có adapter riêng; Fusion có thể dùng nó như rule evidence sau này.

## 4. Model Output Contract

Mọi adapter phải trả object tương đương:

```json
{
  "status": "completed",
  "source": "real",
  "label": "SQLI",
  "confidence": 0.96,
  "probabilities": {
    "NONE": 0.01,
    "SQLI": 0.96,
    "XSS": 0.03
  },
  "model_version": "AI2B_V1.4.8j",
  "release_candidate": "AI2B_V1.4.9_RC",
  "input_scope": "HTTP_URI_QUERY",
  "reason": "Frozen AI2B prediction."
}
```

Allowed `status`:

| Status | Ý nghĩa backend | Ví dụ đúng |
| --- | --- | --- |
| `completed` | Adapter chạy và có prediction hợp lệ. | AI2B real dự đoán `SQLI`. |
| `not_applicable` | Event thiếu loại evidence mà model hỗ trợ. | HTTP-only event làm AI1/AI2A `not_applicable`. |
| `not_available` | Model phù hợp với evidence nhưng artifact/config chưa có hoặc đang tắt. | Flow event có thể chạy AI1, nhưng AI1 real artifact chưa được cấu hình. |
| `not_run` | Pipeline chủ động không chạy model dù có thể áp dụng. | Future sampling/rate-limit mode. |
| `failed` | Adapter được gọi nhưng lỗi trong inference hoặc preprocessing. | Model load được nhưng predict lỗi. |
| `timeout` | Adapter vượt timeout. | Future timeout wrapper. |
| `simulated` | Output giả lập có chủ đích cho UI/dev. | Demo full multi-model fixture. |

Điểm cần nhớ: `not_applicable != not_available`. Nếu HTTP-only event không có `flow`, AI1/AI2A là `not_applicable`, không phải `not_available`.

Allowed `source`:

| Source | Ý nghĩa |
| --- | --- |
| `real` | Prediction đến từ model/artifact thật. |
| `mock` | Output mock trong dev/demo backend. |
| `replay` | Output do router/replay/default path sinh ra từ event, không phải model thật. |
| `unavailable` | Model/artifact không sẵn sàng. |

Backend rules:

- `completed`: adapter ran successfully.
- `not_applicable`: event does not contain evidence for this model.
- `not_available`: adapter/model artifact is not configured or unavailable.
- `failed`: adapter crashed or prediction failed.
- `simulated`: intentionally simulated output.

AI2A threshold note: release candidate dùng threshold frozen `0.9`; nếu
`max_proba < 0.9`, label thresholded là `unknown`. Fusion không được xem
`unknown` là attack label.
- `mock`: development output, never present as real model evidence.
- Router-generated `not_applicable` hiện đang dùng `source = "replay"` theo code hiện tại. Nếu muốn đổi sang `source = "router"`, đó là task code/schema riêng và phải cập nhật enum/frontend mapper.

## 5. Exact API Response Example

Backend returns/broadcasts this exact shape. Đây là ví dụ HTTP SQLI với AI2B real completed, AI1/AI2A not applicable, và fusion mode `DEGRADED_AI2B_ONLY`.

```json
{
  "id": "evt-001",
  "timestamp": "2026-06-18T10:00:00Z",
  "severity": "Critical",
  "attack_type": "SQL Injection",
  "source_ip": "192.168.56.10",
  "destination_ip": "192.168.56.20",
  "source_port": null,
  "destination_port": 443,
  "protocol": "HTTP",
  "direction": "External -> Internal",
  "confidence_score": 0.96,
  "risk_score": 94,
  "detected_by": ["AI2B"],
  "mitre": {
    "technique_id": "T1190",
    "technique_name": "Exploit Public-Facing Application",
    "tactic": "Initial Access"
  },
  "raw_payload": "/search?q=' OR 1=1--",
  "zeek_evidence": {
    "uri": "/search?q=' OR 1=1--",
    "method": "GET",
    "user_agent": "Mozilla/5.0",
    "duration": null,
    "orig_bytes": null,
    "resp_bytes": null,
    "orig_pkts": null,
    "resp_pkts": null,
    "conn_state": null,
    "service": "http"
  },
  "suricata_evidence": null,
  "ai_analysis": {
    "ai1": {
      "status": "not_applicable",
      "source": "replay",
      "verdict": "N/A",
      "anomaly_score": 0.0,
      "model_version": "AI1_UNAVAILABLE",
      "input_scope": "",
      "reason": "AI1 input scope does not match event_type=http."
    },
    "ai2a": {
      "status": "not_applicable",
      "source": "replay",
      "attack_type": "N/A",
      "confidence_score": 0.0,
      "model_version": "AI2A_UNAVAILABLE",
      "input_scope": "",
      "reason": "AI2A input scope does not match event_type=http."
    },
    "ai2b": {
      "status": "completed",
      "source": "real",
      "web_attack_type": "SQLI",
      "confidence_score": 0.96,
      "probabilities": {
        "NONE": 0.01,
        "SQLI": 0.96,
        "XSS": 0.03
      },
      "model_version": "AI2B_V1.4.8j",
      "release_candidate": "AI2B_V1.4.9_RC",
      "input_scope": "HTTP_URI_QUERY",
      "reason": "Frozen AI2B V1.4.9 release-candidate prediction."
    },
    "fusion": {
      "confidence_score": 0.96,
      "risk_score": 94,
      "reason": "AI2B HTTP semantic detector classified the request as SQL Injection.",
      "mode": "DEGRADED_AI2B_ONLY",
      "contributors": ["AI2B"],
      "excluded_models": {
        "AI1": "not_applicable",
        "AI2A": "not_applicable"
      },
      "decision_version": "FUSION_V1_RULE_BASED"
    }
  },
  "decision_flow": [],
  "status": "new"
}
```

Không thêm schema song song kiểu top-level `event_id` hoặc `final_label` trong MVP này. Khái niệm final label được thể hiện bằng top-level `attack_type`; `fusion.mode`, `contributors`, `excluded_models` nằm trong `ai_analysis.fusion`.

Frontend currently depends on:

```text
attack_type
severity
risk_score
ai_analysis.ai1.status/source/verdict/input_scope
ai_analysis.ai2a.status/source/attack_type/input_scope
ai_analysis.ai2b.status/source/web_attack_type/input_scope/probabilities
ai_analysis.fusion.mode/contributors/excluded_models
```

## 6. Fusion Behavior

Fusion is rule-based.

Current decision rules:

```text
AI2B label SQLI -> SQL Injection
AI2B label XSS  -> Cross-Site Scripting
AI1 ANOMALY + AI2A non-normal -> Suspicious Network Activity
AI1 ANOMALY only -> Network Anomaly
otherwise -> Benign / No Confirmed Attack
```

Current fusion modes:

```text
FULL_MULTI_MODEL
DEGRADED_AI2B_ONLY
DEGRADED_AI2A_AI2B
DEGRADED_<MODEL_NAMES>
SIMULATED_FULL_MULTI_MODEL
SIMULATED_PARTIAL
NO_AI_AVAILABLE
```

Important rule:

```text
Dashboard final alert must use top-level attack_type,
not raw AI2B label alone.
```

MVP fusion rules for backend handoff:

- Chỉ output có `status = completed` và `source = real` mới là real contributor.
- `not_applicable`, `not_available`, `failed`, `timeout`, `not_run` đi vào `excluded_models`.
- Mock/simulated outputs chỉ dùng cho dev/demo mode và phải hiển thị đúng source/status.
- Không tạo prediction giả chỉ để đủ ba model.
- Không đổi thuật toán fusion trong task backend handoff này, trừ khi có task riêng.

## 7. Adapter Implementation Rules

All real adapters should implement:

```python
from typing import Protocol, Any

class ModelAdapter(Protocol):
    name: str

    def supports(self, event: dict[str, Any]) -> bool:
        ...

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        ...

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        ...
```

Orchestrator chỉ gọi adapter qua interface này. Không nhét logic AI2B trực tiếp vào orchestrator. Real adapter có thể wrap helper nội bộ, nhưng public contract vẫn là `supports() -> build_input() -> predict()`.

### AI1 Adapter

Expected scope:

```text
ZEEK_CONN_FLOW
```

`supports()` should be true only when `evidence.flow` has required AI1 features.

Expected labels:

```text
NORMAL
ANOMALY
```

### AI2A Adapter

Expected scope:

```text
ZEEK_CONN_FLOW
```

`supports()` should be true only when `evidence.flow` has required AI2A features.

Expected labels should be replaced with actual team labels. Temporary examples:

```text
NORMAL
PORT_SCAN_OR_RECON
SSH_BRUTEFORCE_INDICATOR
DOS_INDICATOR
WEB_ATTACK
```

### AI2B Adapter

Expected scope:

```text
HTTP_URI_QUERY
```

`supports()` true only when:

```text
evidence.http.method exists
evidence.http.uri exists
```

Current real labels:

```text
NONE
SQLI
XSS
```

AI2B real load policy:

- Manifest mặc định:
  `Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest/ai2b_v1_4_9_freeze_manifest.json`
- Model path lấy từ `selected_model_path` trong manifest.
- Policy path ưu tiên `policy_path` trong manifest.
- Fallback policy chỉ dùng nếu manifest thiếu `policy_path`.
- Model load một lần khi dependency/orchestrator được khởi tạo, không load lại mỗi request.
- Backend không được train, fit, tune threshold, hoặc sửa AI2B artifact.
- Nếu `AI2B_PREDICTOR_MODE=real` nhưng artifact/config thiếu: không tự fallback sang mock; trả `not_available`.
- Nếu artifact load được nhưng inference lỗi: trả `failed`.

## 8. Runtime Configuration

Currently implemented:

```bash
AI1_PREDICTOR_MODE=mock|real|unavailable
AI2A_PREDICTOR_MODE=mock|real|unavailable
AI2B_PREDICTOR_MODE=mock|real|unavailable
```

Recommended MVP default for demo with real AI2B:

```bash
AI1_PREDICTOR_MODE=mock
AI2A_PREDICTOR_MODE=mock
AI2B_PREDICTOR_MODE=real
```

Recommended MVP default when testing AI2A real behavior:

```bash
AI1_PREDICTOR_MODE=mock
AI2A_PREDICTOR_MODE=real
AI2B_PREDICTOR_MODE=mock
```

`real` mode must not silently fall back to mock. If a frozen artifact, feature
schema, or canary check fails, the adapter must return `not_available` or
`failed` with a clear reason.

## 9. Run Commands

Backend mock mode:

```bash
PYTHONPATH=backend uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend real AI2B mode:

```bash
PYTHONPATH=backend AI1_PREDICTOR_MODE=mock AI2A_PREDICTOR_MODE=mock AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend real AI2A mode:

```bash
PYTHONPATH=backend AI1_PREDICTOR_MODE=mock AI2A_PREDICTOR_MODE=real AI2B_PREDICTOR_MODE=mock \
  uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Replay demo:

```bash
curl -X POST http://localhost:8000/api/replay/demo
```

Single HTTP test:

```bash
curl -X POST http://localhost:8000/api/events/http \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","uri":"/search?q=%27%20OR%201%3D1--","source_ip":"192.168.56.10","destination_ip":"192.168.56.20"}'
```

General `/api/events` test:

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "schema_version": "1.0",
    "event_type": "http",
    "event_id": "evt-http-sqli-001",
    "correlation_id": "zeek-demo-001",
    "timestamp": "2026-06-18T10:00:00Z",
    "source_ip": "192.168.56.10",
    "destination_ip": "192.168.56.20",
    "evidence": {
      "http": {
        "method": "GET",
        "uri": "/search?q=%27%20OR%201%3D1--",
        "user_agent": "Mozilla/5.0"
      },
      "flow": null,
      "suricata": null
    }
  }'
```

Frontend API mode:

```bash
cd frontend
VITE_DATA_MODE=api \
VITE_API_BASE_URL=http://localhost:8000 \
VITE_WS_URL=ws://localhost:8000/ws/alerts \
pnpm dev
```

Backend tests:

```bash
ruff check backend
PYTHONPATH=backend pytest backend/tests -q
```

Frontend type check:

```bash
cd frontend
pnpm exec tsc --noEmit
```

## 10. Test And Git Workflow

Recommended branch:

```text
feature/backend-adapter-modes
```

PR must include:

- Backend test output.
- Frontend type-check output if frontend-facing fields changed.
- Sample API response from `/api/events` or `/api/events/http`.
- Env vars used during test/demo.

Do not edit without prior agreement:

```text
Dataset/tools/ai2b_modeling/**
frontend schema/mappers
```

For this backend handoff, keep the final alert DTO stable.

## 11. Backend Tasks Remaining

Priority order:

1. Add real AI1 adapter when model artifact/input schema is available.
2. Wire exact raw Zeek `conn.log` -> frozen AI2A 41-feature extractor if the
   original release extractor is made available.
3. Add persistent alert store if needed for demo recording.
4. Extend replay bridge with pacing/batch mode if needed for local lab demos.
5. Add API request validation with Pydantic models if time allows.
6. Add production CORS/auth only if deployment requires it.

Do not block MVP on final AI2B holdout `133-136`. Holdout remains future validation.

## 12. Acceptance Checklist For Backend Team

Backend MVP is ready when:

- `POST /api/events/http` returns SQLI/XSS alert with AI2B real mode.
- HTTP-only event marks AI1/AI2A as `not_applicable`.
- Flow-only event marks AI2B as `not_applicable`.
- WebSocket sends `INITIAL_DATA` and `alert.created`.
- Frontend table receives alert and renders model status badges.
- `ruff check backend` passes.
- `pytest backend/tests -q` passes.
- TypeScript frontend check still passes.
