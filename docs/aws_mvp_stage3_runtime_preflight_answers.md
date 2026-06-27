# AWS MVP Stage 3 Runtime Preflight Answers

Tài liệu này trả lời các câu hỏi cần chốt trước khi copy backend/model artifacts lên EC2 ở Giai đoạn 3.

Mục tiêu của Giai đoạn 3:

```text
EC2: ~/soc-mvp/
├── backend/
├── Dataset/
│   └── tools/
│       ├── ai2a_modeling/
│       └── ai2b_modeling/
├── requirements-aws-lock.txt
├── DEPLOY_COMMIT.txt
├── LOCAL_RUNTIME_VERSIONS.txt
└── logs/
```

Cuối giai đoạn này chưa cần chạy `uvicorn` liên tục. Chỉ cần chứng minh:

```text
Dependency install OK
Backend import OK
AI2A real adapter load OK
AI2B real adapter load OK
Minimal inference smoke OK
```

## 1. Quyết Định Phạm Vi Triển Khai

Chọn:

```text
A. Runtime-only
```

Lý do:

- EC2 thin-slice dùng để chạy FastAPI + inference, không dùng để train model.
- Không cần notebook, plotting, report generation, training workflow trên EC2.
- Giảm dung lượng copy, giảm thời gian cài package, giảm rủi ro dependency conflict.

Không chọn:

```text
B. Full modeling environment
```

trừ khi sau này cần debug training/report ngay trên EC2.

## 2. Worktree Chưa Sạch Thì Xử Lý Sao?

Trước khi deploy, cần phân biệt:

```text
Tracked code change
Untracked artifact/data
Generated temporary file
```

Lệnh kiểm tra:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git status --short --untracked-files=no
```

Quy tắc:

- `git status --short --untracked-files=no` sạch thì tracked code đã sạch.
- `Dataset/` có thể vẫn untracked vì artifact lớn không nhất thiết commit.
- Nếu deploy có dùng untracked artifact, phải ghi checksum artifact riêng.
- Không dùng commit hash để đại diện cho untracked artifact.

Với trạng thái thường gặp:

```text
 M frontend/pnpm-lock.yaml
?? Dataset/
?? docs/aws_mvp_deployment_runbook.md
?? reparse_all_v3_profile_folders.py
```

Xử lý đề xuất:

```bash
# Commit docs nếu muốn giữ
git add docs/aws_mvp_deployment_runbook.md
git commit -m "docs: add AWS MVP thin-slice deployment runbook"

# Kiểm frontend lockfile trước khi quyết định
git diff -- frontend/pnpm-lock.yaml

# Nếu không đổi dependency frontend thật sự
git restore frontend/pnpm-lock.yaml
```

Không commit mặc định:

```text
Dataset/
reparse_all_v3_profile_folders.py
```

trừ khi có task riêng.

Sau khi chốt code:

```bash
git rev-parse HEAD > DEPLOY_COMMIT.txt
```

## 3. Environment Name Nên Dùng Gì?

Khuyến nghị:

```text
LOCAL: dùng environment đã smoke pass, có thể là interior_ai hoặc soc_mvp_aws.
EC2: dùng interior_ai để khớp toàn bộ command/runbook hiện tại.
```

Tên environment không bắt buộc giống nhau. Phần bắt buộc giống là:

```text
Python version
scikit-learn/joblib/numpy/scipy/pandas versions
Runtime packages needed by FastAPI/adapters
```

Nếu muốn tạo local env sạch riêng để lock:

```bash
conda create -n soc_mvp_aws python=3.10 -y
conda activate soc_mvp_aws
export PYTHONNOUSERSITE=1
```

Nếu dùng luôn env hiện tại đã chạy model tốt:

```bash
conda activate interior_ai
export PYTHONNOUSERSITE=1
```

Kiểm tra:

```bash
echo "CONDA_ENV=$CONDA_DEFAULT_ENV"
which python
python --version
python -m pip --version
python -c 'import site; print("ENABLE_USER_SITE =", site.ENABLE_USER_SITE)'
python -m pip check
```

Expected:

```text
Python nằm trong env đang chọn
pip check: No broken requirements found
```

## 4. Dependency Runtime Thực Sự

### 4.1. Backend Manifest

`backend/requirements.txt` hiện là runtime tối thiểu:

```text
fastapi
uvicorn[standard]
joblib
numpy
pandas
scikit-learn
scipy
```

File này dùng version range, không đủ để khóa EC2 chính xác. Vì vậy khi deploy phải sinh:

```bash
python -m pip freeze > requirements-aws-lock.txt
```

từ environment local đã smoke pass.

### 4.2. AI2A Manifest

`Dataset/tools/ai2a_modeling/environment-ai2a.yml` chứa cả runtime và modeling/test/report packages:

```text
runtime core:
  python
  numpy
  pandas
  scipy
  scikit-learn
  joblib

modeling/test/report extras:
  pytest
  pyarrow
  matplotlib
  seaborn
```

Với runtime-only EC2:

- Không cần `pytest`, trừ khi muốn chạy test trên EC2.
- Không cần `pyarrow`, nếu inference không đọc parquet.
- Không cần `matplotlib`, `seaborn`, nếu không sinh report/plot trên EC2.

### 4.3. AI2B Manifest

Trong `Dataset/tools/ai2b_modeling`, hiện không có `requirements*.txt`, `environment*.yml`, `pyproject.toml`, hoặc `setup.py` riêng.

Vì vậy AI2B runtime dependency được suy ra từ adapter/loader:

```text
joblib
pandas
numpy/scipy/scikit-learn through frozen model pipeline
AI2B scripts under Dataset/tools/ai2b_modeling/scripts
AI2B policy/config JSON
```

Không copy full training/report dependency nếu chỉ chạy inference.

## 5. Kiểm Tra Lock File Có Portable Không

Sau khi tạo `requirements-aws-lock.txt`:

```bash
grep -nE '(@ file:|^-e |/mnt/|/home/|C:\\)' \
  requirements-aws-lock.txt || true
```

Nếu không có output:

```text
OK để copy lên EC2.
```

Nếu có output kiểu:

```text
some-package @ file:///home/...
-e /home/user/project
```

thì không cài ngay trên EC2. Cần xử lý package đó thành package installable hoặc loại khỏi runtime lock nếu không cần.

## 6. Backend Load Model Như Thế Nào?

Các file quyết định:

```text
backend/app/main.py
backend/app/dependencies.py
backend/app/adapters/ai2a_real.py
backend/app/adapters/ai2b_real.py
backend/app/replay/ai2a_features.py
backend/app/services/orchestrator.py
backend/app/services/fusion.py
```

Kết luận:

```text
Model adapters được tạo khi app.dependencies được import.
Nếu AI2A_PREDICTOR_MODE=real, RealAI2AAdapter() sẽ load artifact ngay.
Nếu AI2B_PREDICTOR_MODE=real, RealAI2BAdapter() sẽ load freeze manifest/model ngay.
Không load lại model mỗi request.
```

`backend/app/main.py` import:

```python
from app.dependencies import orchestrator, store, websockets
```

nên import `app.main` sẽ kéo theo adapter construction.

Hiện backend không kết nối RDS/S3/Redis khi import. MVP store đang là in-memory `AlertStore`.

## 7. Environment Variables Backend Dùng

Backend hiện dùng:

```text
AI1_PREDICTOR_MODE
AI2A_PREDICTOR_MODE
AI2B_PREDICTOR_MODE
```

Giá trị hợp lệ:

```text
mock
real
unavailable
```

Thin-slice demo mode:

```bash
AI1_PREDICTOR_MODE=mock
AI2A_PREDICTOR_MODE=real
AI2B_PREDICTOR_MODE=real
```

Nếu artifact thiếu:

- AI2A/AI2B không tự fallback sang mock.
- Adapter trả `not_available` hoặc `failed` rõ ràng.

## 8. Artifact Paths Cần Có

### 8.1. AI2A

Default paths trong `RealAI2AAdapter`:

```text
Dataset/tools/ai2a_modeling/artifacts/release_candidate_v1/20260605T071810Z
Dataset/tools/ai2a_modeling/artifacts/temporal_v2_1/20260603T080212Z/rf_v2_1_full_safe_plus_ssh_minimal/feature_manifest.json
Dataset/tools/ai2a_modeling/scripts/ai2a_training_common.py
```

Model files chính:

```text
.../release_candidate_v1/20260605T071810Z/rf_v2_1_full_safe_plus_ssh_minimal/model.joblib
.../release_candidate_v1/20260605T071810Z/rf_v2_1_full_safe_plus_ssh_minimal/preprocessor.joblib
.../release_candidate_v1/20260605T071810Z/thresholds_frozen.json
```

AI2A yêu cầu đúng 41 features từ `feature_manifest.json`.

### 8.2. AI2B

Default paths trong `RealAI2BAdapter`:

```text
Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest/ai2b_v1_4_9_freeze_manifest.json
Dataset/tools/ai2b_modeling/configs/ai2b_v1_4_8j_overlap_cleanup_policy.json
Dataset/tools/ai2b_modeling/scripts
```

AI2B model path lấy từ field:

```text
selected_model_path
```

trong freeze manifest.

## 9. Copy Toàn Bộ Modeling Hay Runtime Bundle?

Khuyến nghị cho MVP:

```text
Copy backend/
Copy Dataset/tools/ai2a_modeling/
Copy Dataset/tools/ai2b_modeling/
```

Lý do:

- Adapter hiện import helper từ `Dataset/tools/.../scripts`.
- Artifact/policy/manifest đang dùng relative paths theo repo root.
- Copy toàn bộ hai modeling folders giảm rủi ro thiếu file trong lần deploy đầu.

Không commit `Dataset/` lên GitHub nếu nó là artifact/data lớn. Copy lên EC2 bằng `rsync`.

Sau MVP có thể tối ưu thành runtime bundle nhỏ hơn:

```text
backend/
runtime_artifacts/ai2a/
runtime_artifacts/ai2b/
runtime_helpers/
```

nhưng chưa nên làm trong thin-slice đầu tiên.

## 10. Artifact Hashes

Vì `Dataset/` có thể không nằm trong Git, cần tạo hash riêng:

```bash
find \
  Dataset/tools/ai2a_modeling/artifacts/release_candidate_v1/20260605T071810Z \
  Dataset/tools/ai2a_modeling/artifacts/temporal_v2_1/20260603T080212Z/rf_v2_1_full_safe_plus_ssh_minimal \
  Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest \
  Dataset/tools/ai2b_modeling/configs/ai2b_v1_4_8j_overlap_cleanup_policy.json \
  -type f \
  -print0 \
| sort -z \
| xargs -0 sha256sum \
> DEPLOY_ARTIFACTS_SHA256.txt
```

Sau khi copy lên EC2, chạy lại hash ở EC2 và so sánh.

## 11. Local Preflight Commands

Chạy trên LOCAL/WSL từ repo root:

```bash
pwd
ls

git branch --show-current
git rev-parse HEAD
git status --short
git status --short --untracked-files=no

git rev-parse HEAD > DEPLOY_COMMIT.txt
cat DEPLOY_COMMIT.txt
```

Runtime versions:

```bash
python - <<'PY' > LOCAL_RUNTIME_VERSIONS.txt
import sys
import joblib
import numpy
import pandas
import scipy
import sklearn
import fastapi
import uvicorn

print("python=" + sys.version.split()[0])
print("fastapi=" + fastapi.__version__)
print("uvicorn=" + uvicorn.__version__)
print("scikit-learn=" + sklearn.__version__)
print("joblib=" + joblib.__version__)
print("numpy=" + numpy.__version__)
print("scipy=" + scipy.__version__)
print("pandas=" + pandas.__version__)
PY

cat LOCAL_RUNTIME_VERSIONS.txt
```

Backend import smoke:

```bash
PYTHONPATH=backend \
AI1_PREDICTOR_MODE=mock \
AI2A_PREDICTOR_MODE=real \
AI2B_PREDICTOR_MODE=real \
python -c 'import app.main; print("BACKEND_IMPORT_OK")'
```

Nếu lệnh này fail, không deploy.

## 12. Minimal Local Inference Smoke

Start backend local:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app --host 127.0.0.1 --port 8000
```

AI2B HTTP smoke:

```bash
curl -X POST "http://127.0.0.1:8000/api/events/http" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "uri": "/search?q=%27%20OR%201%3D1--",
    "source_ip": "10.10.10.10",
    "destination_ip": "192.168.1.10"
  }'
```

AI2A replay smoke:

```bash
conda run -n interior_ai env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/a10_mixed_chain/conn.log \
  --http-log tmp/zeek_logs/a10_mixed_chain/http.log \
  --api-url http://127.0.0.1:8000/api/events
```

Expected:

```text
AI2B source=real for HTTP event
AI2A source=real for flow events with generated 41 features
No artifact path error
```

## 13. EC2 Information Needed

Không gửi private key content. Chỉ cần các biến:

```bash
export EC2_USER="ubuntu"
export EC2_HOST="<Elastic-IP-or-public-DNS>"
export EC2_KEY="$HOME/.ssh/<key-name>.pem"
export REMOTE_DIR="/home/ubuntu/soc-mvp"
```

Test SSH:

```bash
chmod 400 "$EC2_KEY"

ssh -i "$EC2_KEY" \
  "${EC2_USER}@${EC2_HOST}" \
  'echo "SSH_OK"; hostname; whoami'
```

EC2 system check:

```bash
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" '
echo "===== SYSTEM ====="
uname -m
cat /etc/os-release | grep PRETTY_NAME
nproc
free -h
df -h /

echo "===== CONDA ====="
conda env list || true

echo "===== TOOLS ====="
rsync --version | head -n 1 || true
git --version || true
tmux -V || true
'
```

## 14. Rsync Scope

Dry-run trước:

```bash
rsync -avR --dry-run \
  --exclude '.git/' \
  --exclude '.env' \
  --exclude '*.pem' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache/' \
  ./backend \
  ./Dataset/tools/ai2a_modeling \
  ./Dataset/tools/ai2b_modeling \
  ./requirements-aws-lock.txt \
  ./DEPLOY_COMMIT.txt \
  ./LOCAL_RUNTIME_VERSIONS.txt \
  ./DEPLOY_ARTIFACTS_SHA256.txt \
  "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"
```

Nếu cấu trúc đúng, chạy thật:

```bash
rsync -avR \
  --exclude '.git/' \
  --exclude '.env' \
  --exclude '*.pem' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache/' \
  ./backend \
  ./Dataset/tools/ai2a_modeling \
  ./Dataset/tools/ai2b_modeling \
  ./requirements-aws-lock.txt \
  ./DEPLOY_COMMIT.txt \
  ./LOCAL_RUNTIME_VERSIONS.txt \
  ./DEPLOY_ARTIFACTS_SHA256.txt \
  "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"
```

## 15. Files/Secrets Không Được Copy

Không copy:

```text
.env chứa secret thật
*.pem
AWS access key
AWS secret access key
Database password
JWT/API token
Local notebook output không cần runtime
Training outputs ngoài artifact runtime cần thiết
```

Tên biến secret có thể ghi trong docs, nhưng không ghi giá trị:

```text
DATABASE_URL
AWS_REGION
S3_BUCKET
REDIS_URL
CORS_ORIGINS
MODEL_ROOT
```

## 16. Stage 3 Acceptance Criteria

Giai đoạn 3 hoàn thành khi:

```text
[ ] Deployment scope = runtime-only
[ ] Git commit/working tree đã xác định rõ
[ ] Dependency runtime-only đã xác định
[ ] requirements-aws-lock.txt không chứa file:/// hoặc path local
[ ] pip check thành công ở local
[ ] Backend import thành công ở local
[ ] AI2A load/inference smoke thành công ở local
[ ] AI2B load/inference smoke thành công ở local
[ ] Artifact paths chính xác
[ ] Artifact hashes được ghi
[ ] EC2 đủ dung lượng
[ ] rsync dry-run đúng cấu trúc
[ ] rsync thật hoàn tất
[ ] Checksum local và EC2 giống nhau
[ ] Dependency cài thành công trên EC2
[ ] Backend import thành công trên EC2
[ ] Chưa chạy Uvicorn liên tục
```

## 17. Trình Tự Giai Đoạn 3 Chuẩn

```text
1. Clean/record Git state
2. Choose runtime-only scope
3. Activate clean local env
4. pip check
5. Generate requirements-aws-lock.txt
6. Verify lock has no local paths
7. Record LOCAL_RUNTIME_VERSIONS.txt
8. Verify AI2A/AI2B artifacts
9. Run backend import smoke
10. Run minimal AI2A/AI2B inference smoke
11. Create DEPLOY_COMMIT.txt
12. Create DEPLOY_ARTIFACTS_SHA256.txt
13. Check EC2 system/disk/conda/tools
14. rsync dry-run
15. rsync real
16. Install requirements on EC2
17. Compare artifact checksums
18. Backend import smoke on EC2
19. Stop before long-running Uvicorn
```

Sau khi các mục trên pass, mới chuyển sang Giai đoạn 4: chạy backend bằng `tmux` hoặc `systemd`.
