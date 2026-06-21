# Backend Task Breakdown For Multi-Model Fusion MVP

Tài liệu này chia việc cụ thể cho backend member. Mục tiêu là làm backend chạy được pipeline đa model trung thực:

```text
event -> router -> model adapters -> fusion -> final alert DTO -> WebSocket/dashboard
```

AI2B là adapter HTTP thật đầu tiên cho SQLI/XSS. AI2A real adapter cũng đã có
theo hướng fail-safe, nhưng chỉ predict khi flow event đã mang đủ frozen
41-feature vector. Kiến trúc không được biến thành AI2B-only backend.

## Source Of Truth

Đọc trước:

1. `docs/backend_integration_contract.md`
2. `docs/multi_model_fusion_mvp_code_reading_guide.md`
3. `backend/app/adapters/base.py`
4. `backend/app/services/orchestrator.py`
5. `backend/app/services/fusion.py`
6. `backend/app/main.py`

Response DTO hiện dùng top-level:

```text
id
attack_type
risk_score
severity
ai_analysis.ai1
ai_analysis.ai2a
ai_analysis.ai2b
ai_analysis.fusion
```

Không đổi sang schema mới như `event_id` hoặc `final_label` ở top-level trong task này.

## B1. Add Adapter Mode Configuration

Mục tiêu: backend có thể bật/tắt từng model rõ ràng bằng env vars.

Env vars cần hỗ trợ:

```bash
AI1_PREDICTOR_MODE=mock|real|unavailable
AI2A_PREDICTOR_MODE=mock|real|unavailable
AI2B_PREDICTOR_MODE=mock|real|unavailable
```

Expected behavior:

- `mock`: dùng mock adapter hiện có hoặc mock adapter tương ứng.
- `real`: dùng real adapter nếu đã có.
- `unavailable`: dùng unavailable mode, không fake prediction.

Gợi ý file:

```text
backend/app/dependencies.py
backend/app/adapters/
backend/tests/
```

Done khi:

- Có thể start backend với AI1/AI2A unavailable.
- Có thể start backend với AI2B unavailable.
- `AI2A_PREDICTOR_MODE=real` load AI2A release candidate nếu artifact đủ, nhưng không fallback mock khi artifact lỗi.
- `AI2B_PREDICTOR_MODE=real` vẫn giữ nguyên logic load artifact hiện có.

## B2. Add UnavailableAdapter

Mục tiêu: phân biệt đúng `not_applicable` và `not_available`.

Quan trọng:

- `not_applicable`: event không có evidence phù hợp model.
- `not_available`: event có evidence phù hợp, nhưng model/artifact chưa sẵn sàng.

Ví dụ đúng:

| Event | AI1 | AI2A | AI2B |
| --- | --- | --- | --- |
| HTTP-only, AI2B unavailable | `not_applicable` | `not_applicable` | `not_available` |
| Flow-only, AI1 unavailable | `not_available` | tùy mode | `not_applicable` |
| HTTP-only, AI2B real | `not_applicable` | `not_applicable` | `completed` |

Implementation suggestion:

```python
class UnavailableAdapter:
    name: str
    input_scope: str
    supported_scope: str

    def supports(self, event):
        # Return true only when this model would normally support the event:
        # flow for AI1/AI2A, http for AI2B.
        ...

    def build_input(self, event):
        return {}

    def predict(self, model_input):
        return ModelOutput(
            status="not_available",
            source="unavailable",
            label="N/A",
            confidence=0.0,
            reason="Model is configured as unavailable."
        )
```

Không để unavailable adapter trả `supports=True` cho mọi event, vì như vậy HTTP-only event có thể làm AI1 thành `not_available` thay vì `not_applicable`.

## B3. Add Tests For Status Semantics

Backend tests cần cover:

```text
HTTP-only event -> AI1/AI2A not_applicable
Flow-only event -> AI2B not_applicable
HTTP event + AI2B unavailable -> AI2B not_available
Flow event + AI1 unavailable -> AI1 not_available
AI2B real artifact load fail -> not_available, no silent mock fallback
AI2B inference exception -> failed
AI2A real missing frozen 41-feature vector -> not_available, no guessed feature extraction
```

Command:

```bash
ruff check backend
PYTHONPATH=backend pytest backend/tests -q
```

## B4. Keep Final Alert DTO Stable

Không rename các field frontend đang dùng:

```text
attack_type
severity
risk_score
detected_by
ai_analysis.ai1.status/source/verdict/input_scope
ai_analysis.ai2a.status/source/attack_type/input_scope
ai_analysis.ai2b.status/source/web_attack_type/input_scope/probabilities
ai_analysis.fusion.mode/contributors/excluded_models
```

Nếu cần thêm field mới, thêm theo kiểu backward-compatible. Không xóa field cũ trong sprint này.

## B5. PR Must Include Sample API Response

Mỗi PR backend liên quan adapter/fusion phải kèm:

1. Env vars đã dùng.
2. Lệnh curl đã chạy.
3. Response JSON mẫu.
4. Test output.

Minimum curl:

```bash
curl -X POST http://localhost:8000/api/events/http \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","uri":"/search?q=%27%20OR%201%3D1--","source_ip":"192.168.56.10","destination_ip":"192.168.56.20"}'
```

Expected shape:

```text
top-level attack_type = SQL Injection
ai_analysis.ai1.status = not_applicable
ai_analysis.ai2a.status = not_applicable
ai_analysis.ai2b.status = completed or not_available depending mode
ai_analysis.fusion.mode = DEGRADED_AI2B_ONLY when AI2B real contributes
```

## B6. Do Not Touch These Areas

Không sửa các vùng sau nếu chưa trao đổi:

```text
Dataset/tools/ai2b_modeling/**
Dataset/tools/attack_profiles/attack_012_web_semantic/**
frontend schema/mappers
AI2B holdout/scoring protocol
AI2B training/build/stress scripts
```

Backend member không cần train lại AI2B, không tune threshold, không sửa holdout protocol. AI2B backend chỉ load frozen artifact hoặc báo unavailable/failed rõ ràng.

## B7. AI2A Real Adapter And Replay Bridge Guardrails

AI2A release candidate:

```text
rf_v2_1_full_safe_plus_ssh_minimal
threshold = 0.9
```

Rules:

- Không viết lại 41 feature bằng công thức đoán trong backend.
- Adapter AI2A chỉ predict khi `evidence.flow` đã có đủ frozen feature vector.
- Raw `conn.log` replay chỉ parser/correlate thành event; nếu chưa có extractor chính xác thì AI2A trả `not_available`.
- Threshold logic phải giữ behavior release: `max_proba < 0.9` => label `unknown`.
- `unknown` không được xem là attack label trong Fusion.

Replay dry-run:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log /path/to/conn.log \
  --http-log /path/to/http.log \
  --dry-run
```

## Suggested Branch And Review Checklist

Branch:

```text
feature/backend-adapter-modes
```

Checklist trước khi gửi PR:

- `ruff check backend` PASS.
- `PYTHONPATH=backend pytest backend/tests -q` PASS.
- Nếu frontend-facing field đổi, `cd frontend && pnpm exec tsc --noEmit` PASS.
- Có sample response JSON.
- `not_applicable` và `not_available` được test riêng.
- Không có silent fallback từ real model sang mock.
- Không sửa AI2B modeling/holdout files.
