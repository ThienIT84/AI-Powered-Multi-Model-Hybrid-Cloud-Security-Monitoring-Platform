# AI1 Handoff Documentation

- **AI1 purpose**: Network Anomaly Detection.
- **Input path**: `evidence.flow.ai1_features`.
- **Output**: `NORMAL` hoặc `ANOMALY`.
- **Feature order**: Lấy từ `feature_manifest.json`.
- **Threshold**: Lấy từ `thresholds_frozen.json`.
- **Score convention**: confidence nằm trong khoảng [0,1], score càng cao càng bất thường.
- **Decision rule**: confidence >= `selected_threshold` => `ANOMALY`, ngược lại `NORMAL`.

## Required artifact files:
Các file sau bắt buộc phải có mặt tại thư mục artifact và helper của AI1 (`Dataset/tools/ai1_modeling/`):
- `artifacts/release_candidate_v1/latest/model.joblib`
- `artifacts/release_candidate_v1/latest/preprocessor.joblib`
- `artifacts/release_candidate_v1/latest/feature_manifest.json`
- `artifacts/release_candidate_v1/latest/thresholds_frozen.json`
- `artifacts/release_candidate_v1/latest/smoke_samples.jsonl`
- `artifacts/release_candidate_v1/latest/model_card.md`
- `artifacts/release_candidate_v1/latest/api_smoke_ai1_response.json`
- `scripts/ai1_inference_common.py`

## Test evidence:
- **AI1 adapter unit test**: 6/6 PASSED (`pytest backend/tests/test_ai1_real_adapter.py -v`).
- **API smoke test**: Đã chạy thành công qua endpoint `/api/events` với chế độ `real`, kết quả (`ai_analysis.ai1.status = completed`, `ai_analysis.ai1.source = real`, `ai_analysis.ai1.verdict = ANOMALY`). Toàn bộ body request và response được lưu tại `artifacts/release_candidate_v1/latest/api_smoke_ai1_response.json`.

## Known limitation:
Backend hiện không tự đoán/extract feature từ dữ liệu `conn.log` thô. Muốn chạy được chế độ live/replay thật thì cần phải bổ sung thêm bước trích xuất đặc trưng (Zeek conn.log row -> `ai1_features`) trước khi đẩy vào `evidence.flow.ai1_features`.
