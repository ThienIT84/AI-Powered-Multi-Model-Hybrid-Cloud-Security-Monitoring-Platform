# AWS MVP Phase 3 Rehearsal Summary

Tài liệu này tổng kết lần thử nghiệm deploy Phase 3 để lần sau đọc lại có thể rút ngắn thời gian setup AWS.

Trạng thái của lần này:

```text
Loại triển khai: Rehearsal / thử nghiệm
Không phải production build
Không chuyển thẳng sang systemd
Runtime thử nghiệm có thể xóa và build lại chính thức
```

Mục tiêu rehearsal:

- Xác minh quy trình đóng gói từ Local/WSL sang EC2.
- Phát hiện dependency conflict trước khi demo thật.
- Xác minh đường dẫn model AI2A và AI2B.
- Thử `rsync` qua SSH.
- Thử cài dependency trên EC2.
- Thử backend import và replay Zeek log.
- Ghi lại lỗi để bản build chính thức không lặp lại.

## 1. Phạm Vi Đã Chốt

Chọn:

```text
Runtime-only
```

Bao gồm trong deployment rehearsal:

```text
backend/
Dataset/tools/ai2a_modeling/
Dataset/tools/ai2b_modeling/
requirements-aws-lock.txt
DEPLOY_COMMIT.txt
LOCAL_RUNTIME_VERSIONS.txt
DEPLOY_FILES_SHA256.txt
tmp/zeek_logs/a10_mixed_chain/   # smoke-test data only
```

Không triển khai lên EC2:

```text
Notebook
Training workflow
Plot/report generation
CUDA/GPU stack
Gradio
ControlNet
Diffusers
Computer Vision packages
Secret thật
Private key
```

Bài học chính:

```text
EC2 inference runtime không nên dùng chung environment với các dự án khác.
Không đưa dependency training/CV/UI thừa lên AWS MVP backend.
```

## 2. Môi Trường Đã Dùng

### Local / WSL

```text
Repository:
~/AI-Powered-Multi-Model-Hybrid-Cloud-Security-Monitoring-Platform

Conda environment:
soc_mvp_aws
```

Vai trò:

- Kiểm tra source code.
- Cài runtime dependency sạch.
- Tạo `requirements-aws-lock.txt`.
- Tạo checksum.
- Gửi file lên EC2.

### EC2

```text
User:
ubuntu

Project directory:
/home/ubuntu/soc-mvp

Conda environment:
interior_ai
```

Vai trò:

- Nhận source và model artifact.
- Cài dependency.
- Kiểm tra checksum.
- Load backend và model thật.
- Chạy smoke test tạm thời.

Kết luận:

```text
Tên environment local và EC2 không bắt buộc giống nhau.
Phiên bản package và khả năng load model mới là phần bắt buộc khớp.
```

## 3. Runtime Dependency Baseline

Backend runtime tối thiểu:

```text
FastAPI
Uvicorn
NumPy
pandas
SciPy
scikit-learn
Joblib
```

AI2A runtime baseline đã dùng:

```text
Python=3.10.20
NumPy=2.2.6
pandas=2.3.3
SciPy=1.15.2
scikit-learn=1.7.2
Joblib=1.5.3
```

Không dùng environment local `interior_ai` cũ để tạo requirements nếu environment đó đã chứa dependency của dự án khác.

## 4. Lỗi Đã Gặp Và Cách Xử Lý

### Lỗi 1 - requirements chứa đường dẫn local

Triệu chứng:

```text
package @ file:///home/...
package @ file:///croot/...
```

Nguyên nhân:

```text
Environment cũ chứa package được Conda build/cài bằng đường dẫn nội bộ.
Các đường dẫn đó không tồn tại trên EC2.
```

Cách xử lý đúng:

```text
Tạo environment local sạch: soc_mvp_aws
Chỉ cài dependency runtime của SOC MVP
Tạo lại requirements-aws-lock.txt
```

Lệnh kiểm:

```bash
grep -nE '(@ file:|^-e |/mnt/|/home/|C:\\)' \
  requirements-aws-lock.txt || true
```

Nếu có output, chưa được dùng file đó để cài trên EC2.

### Lỗi 2 - dependency conflict WebSocket

Triệu chứng:

```text
gradio-client 0.12.0 yêu cầu websockets >=10,<12
realtime 2.28.3 yêu cầu websockets >=11,<16
Environment cũ có websockets 16.0
```

Nguyên nhân:

```text
Dependency của nhiều dự án bị trộn trong cùng một environment.
```

Cách xử lý đúng:

```text
Không sửa từng package riêng lẻ.
Không đưa Gradio/Supabase/CV stack lên EC2.
Tạo environment runtime-only sạch.
```

### Lỗi 3 - Python đọc package ngoài Conda

Triệu chứng:

```text
ENABLE_USER_SITE=True
USER_SITE=/home/tran_thien/.local/lib/python3.10/site-packages
```

Cách xử lý:

```bash
export PYTHONNOUSERSITE=1
```

Mục tiêu:

```text
Smoke test chỉ sử dụng package trong Conda environment.
```

### Lỗi 4 - thiếu checksum manifest trên EC2

Triệu chứng:

```bash
sha256sum -c DEPLOY_FILES_SHA256.txt
```

báo:

```text
No such file or directory
```

Nguyên nhân:

```text
File checksum chưa được tạo hoặc chưa được đưa lên EC2.
```

Cách xử lý chính thức:

```text
Tạo checksum sau khi mọi file deployment đã được chốt.
Copy checksum cùng một lần với source/artifact.
Chạy sha256sum -c trước khi cài dependency.
```

### Lỗi 5 - thư mục tmp chưa được copy

Triệu chứng:

```text
FileNotFoundError:
tmp/zeek_logs/a10_mixed_chain/conn.log
```

Nguyên nhân:

```text
tmp/ không nằm trong phạm vi rsync ban đầu.
```

Cách xử lý:

```text
Copy riêng smoke-test dataset.
Không xem tmp/ là runtime dependency production.
```

Đường dẫn EC2 đã xác nhận:

```text
/home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain/conn.log
/home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain/http.log
```

### Lỗi 6 - chạy script từ sai working directory

Đã chạy từ:

```text
/home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain
```

nhưng gọi:

```bash
python backend/scripts/replay_local_lab_logs.py
```

Python tìm nhầm thành:

```text
/home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain/backend/scripts/...
```

Cách xử lý:

```bash
cd /home/ubuntu/soc-mvp
```

hoặc dùng absolute path:

```bash
PYTHONPATH=/home/ubuntu/soc-mvp/backend \
python /home/ubuntu/soc-mvp/backend/scripts/replay_local_lab_logs.py
```

Quy tắc cho build chính thức:

```text
Mọi backend/model command phải chạy với WorkingDirectory=/home/ubuntu/soc-mvp.
```

## 5. Những Phần Đã Hoàn Thành

```text
[x] Tạo EC2 Ubuntu
[x] Cài Miniconda
[x] Tạo environment interior_ai trên EC2
[x] Tạo thư mục /home/ubuntu/soc-mvp
[x] Owner project là ubuntu:ubuntu
[x] Copy backend lên EC2
[x] Copy AI2A modeling folder lên EC2
[x] Copy AI2B modeling folder lên EC2
[x] Copy Zeek conn.log và http.log lên EC2
[x] Cài requirements trên EC2
[x] Xác định đúng working directory của replay script
```

## 6. Việc Cần Ghi Nhận Trước Khi Xóa Rehearsal

Trước khi reset EC2 trial runtime, cần lưu lại:

```text
[ ] pip check trên EC2
[ ] Runtime versions trên EC2
[ ] EC2 backend import với AI2A real và AI2B real
[ ] AI2B HTTP smoke response
[ ] AI2A replay smoke result
[ ] Checksum deployment pass
[ ] Log lỗi và log thành công được copy về Local
```

Rehearsal chỉ được xem là có giá trị khi các kết quả trên được lưu, kể cả khi một số test FAIL.

## 7. Lệnh Thu Thập Evidence Trên EC2

Chạy tại:

```bash
cd /home/ubuntu/soc-mvp
mkdir -p logs/stage3-rehearsal
```

Lưu trạng thái hệ thống:

```bash
{
  echo "===== DATE ====="
  date -u

  echo "===== HOST ====="
  hostname
  uname -m

  echo "===== DISK ====="
  df -h /

  echo "===== MEMORY ====="
  free -h

  echo "===== PYTHON ====="
  $HOME/miniconda3/bin/conda run -n interior_ai python --version

  echo "===== PIP CHECK ====="
  $HOME/miniconda3/bin/conda run -n interior_ai python -m pip check

  echo "===== PROJECT SIZE ====="
  du -sh backend Dataset tmp 2>/dev/null
} | tee logs/stage3-rehearsal/ec2_preflight.txt
```

Lưu phiên bản runtime:

```bash
$HOME/miniconda3/bin/conda run -n interior_ai python - <<'PY' \
  | tee logs/stage3-rehearsal/ec2_runtime_versions.txt
import sys
import fastapi
import uvicorn
import joblib
import numpy
import pandas
import scipy
import sklearn

print("python=" + sys.version.split()[0])
print("fastapi=" + fastapi.__version__)
print("uvicorn=" + uvicorn.__version__)
print("numpy=" + numpy.__version__)
print("pandas=" + pandas.__version__)
print("scipy=" + scipy.__version__)
print("scikit-learn=" + sklearn.__version__)
print("joblib=" + joblib.__version__)
PY
```

Lưu backend import result:

```bash
PYTHONNOUSERSITE=1 \
$HOME/miniconda3/bin/conda run \
  --no-capture-output \
  -n interior_ai \
  env \
  PYTHONPATH=/home/ubuntu/soc-mvp/backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  python -c 'from app.main import app; print("EC2_BACKEND_IMPORT_OK", app.title)' \
  2>&1 | tee logs/stage3-rehearsal/backend_import.txt
```

Lưu replay result:

```bash
PYTHONNOUSERSITE=1 \
PYTHONPATH=/home/ubuntu/soc-mvp/backend \
python /home/ubuntu/soc-mvp/backend/scripts/replay_local_lab_logs.py \
  --conn-log /home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain/conn.log \
  --http-log /home/ubuntu/soc-mvp/tmp/zeek_logs/a10_mixed_chain/http.log \
  --api-url http://127.0.0.1:8000/api/events \
  --limit 5 \
  2>&1 | tee logs/stage3-rehearsal/replay_smoke.txt
```

Lưu ý:

```text
Replay command cần backend đang chạy ở 127.0.0.1:8000.
Nếu chỉ muốn test import/model load, dùng backend_import.txt trước.
```

## 8. Copy Evidence Từ EC2 Về Local

Chạy trên Local/WSL:

```bash
mkdir -p docs/evidence/aws-phase3-rehearsal
```

```bash
rsync -av \
  -e "ssh -i $EC2_KEY -o IdentitiesOnly=yes" \
  "${EC2_USER}@${EC2_HOST}:/home/ubuntu/soc-mvp/logs/stage3-rehearsal/" \
  docs/evidence/aws-phase3-rehearsal/
```

Kiểm tra:

```bash
find docs/evidence/aws-phase3-rehearsal \
  -type f \
  -printf '%p | %s bytes\n'
```

Chỉ xóa rehearsal trên EC2 sau khi evidence đã có ở Local.

## 9. Rsync Bài Bản Cho Lần Sau

Biến kết nối đã dùng:

```bash
export EC2_USER="ubuntu"
export EC2_HOST="18.136.192.241"
export EC2_KEY="$HOME/.ssh/soc-mvp-backend-key.pem"
export REMOTE_DIR="/home/ubuntu/soc-mvp"
```

Test SSH trước:

```bash
chmod 400 "$EC2_KEY"

ssh -i "$EC2_KEY" -o IdentitiesOnly=yes \
  "${EC2_USER}@${EC2_HOST}" \
  'echo SSH_OK; hostname; whoami'
```

Nếu `rsync` báo:

```text
Warning: Identity file -o not accessible
ssh: Could not resolve hostname identitiesonly=yes
```

thì thường là do `$EC2_KEY` đang rỗng hoặc bị set sai. Kiểm tra:

```bash
echo "EC2_KEY=$EC2_KEY"
ls -l "$EC2_KEY"
```

Rsync dry-run:

```bash
rsync -avR \
  --dry-run \
  --itemize-changes \
  --exclude '.git/' \
  --exclude '.env' \
  --exclude '*.pem' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache/' \
  -e "ssh -i ${EC2_KEY} -o IdentitiesOnly=yes" \
  ./backend \
  ./Dataset/tools/ai2a_modeling \
  ./Dataset/tools/ai2b_modeling \
  ./requirements-aws-lock.txt \
  ./DEPLOY_COMMIT.txt \
  ./LOCAL_RUNTIME_VERSIONS.txt \
  ./DEPLOY_FILES_SHA256.txt \
  "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"
```

Rsync thật chỉ chạy sau khi dry-run đúng cấu trúc.

## 10. Kết Luận Rehearsal

Kết quả tổng quát:

```text
Quy trình Local -> rsync -> EC2 đã được xác minh.
Dependency hỗn hợp ban đầu không phù hợp cho deployment.
Environment runtime-only là bắt buộc.
Các artifact hiện phụ thuộc vào repository root.
Replay script phải chạy từ repository root hoặc dùng absolute path.
tmp/ chỉ là smoke-test data, không phải production runtime artifact.
```

Điểm quan trọng nhất để lần sau nhanh hơn:

```text
Không bắt đầu từ environment cũ.
Không tạo requirements từ environment lẫn nhiều dự án.
Không chạy command từ thư mục tmp.
Không rsync khi chưa test SSH.
Không xóa rehearsal trước khi copy evidence về Local.
```

## 11. Build Chính Thức Lần Sau

Trình tự chính thức nên là:

```text
1. Chốt Git commit.
2. Chốt artifact release AI2A/AI2B.
3. Tạo environment local sạch.
4. Cài exact runtime versions.
5. pip check local.
6. Backend import local.
7. AI2A/AI2B inference smoke local.
8. Tạo requirements-aws-lock.txt.
9. Cài thử lock vào environment trống.
10. Tạo deployment checksum sau cùng.
11. Reset EC2 trial runtime.
12. Rsync dry-run.
13. Rsync chính thức.
14. Kiểm tra checksum trước khi cài.
15. Cài dependency EC2.
16. pip check EC2.
17. So sánh runtime versions.
18. Backend import EC2.
19. AI2A/AI2B smoke EC2.
20. Dừng Uvicorn thủ công.
21. Chuyển sang Phase 4 tmux/systemd.
```

## 12. Phase 3 Rehearsal Sign-Off

```text
Phase 3 Rehearsal:
[ ] PASS
[ ] PARTIAL PASS
[ ] FAIL

Ngày thực hiện:
____________________

Git commit:
____________________

Người thực hiện:
____________________

Ghi chú cuối:
____________________
```
