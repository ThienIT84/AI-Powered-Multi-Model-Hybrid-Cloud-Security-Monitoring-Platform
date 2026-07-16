# AWS MVP Thin-Slice Deployment Runbook (Historical)

> **Historical:** Tài liệu này mô tả CloudFront → public EC2 thin-slice cũ,
> không phải kiến trúc đích hiện tại. Dùng
> [`hybrid_cloud_soc_architecture.md`](hybrid_cloud_soc_architecture.md) làm nguồn
> chuẩn cho CloudFront/WAF → ALB → private EC2 ASG → SQS/S3/RDS.

Runbook này hướng dẫn triển khai bản AWS MVP nhỏ nhất để demo luồng:

```text
Local Lab / Test Client
        -> HTTPS POST
CloudFront
        -> EC2 FastAPI
        -> AI1 mock + AI2A real + AI2B real
        -> Fusion / Final Alert
        -> WebSocket
CloudFront
        -> WSS
React Dashboard
```

Mục tiêu là chứng minh hệ thống chạy được trên AWS ở mức thin-slice:

- Frontend React/Vite được phục vụ từ S3 qua CloudFront.
- Backend FastAPI chạy trên EC2.
- AI2A và AI2B dùng artifact thật.
- API nhận event từ curl, replay hoặc live Zeek tailer.
- Alert được đẩy realtime lên dashboard bằng WebSocket.
- Không bị lỗi mixed content.

Thin-slice này chưa triển khai các thành phần target architecture sau:

```text
ALB
Auto Scaling Group
WAF
SQS worker pipeline
RDS PostgreSQL
S3 Evidence Bucket
NAT Gateway
Multi-AZ
```

Các thành phần đó chỉ nên làm sau khi thin-slice chạy ổn định.

## 1. Overview

### 1.1. AWS MVP Structure

```text
Internet
  |
  | HTTPS / WSS
  v
CloudFront single domain
  |
  |-- Default (*)  -> private S3 frontend bucket
  |-- /api/*       -> public EC2 FastAPI origin :8000
  |-- /ws/*        -> public EC2 FastAPI origin :8000
  |-- /health      -> public EC2 FastAPI origin :8000
```

CloudFront giao tiếp với browser bằng HTTPS/WSS. Trong MVP, CloudFront có thể giao tiếp với EC2 origin bằng HTTP port `8000`.

### 1.2. Dashboard Flow

```text
Browser
  -> HTTPS GET /
CloudFront
  -> S3 frontend bucket
CloudFront
  -> Browser runs React dashboard
```

### 1.3. API Flow

```text
Browser / curl / replay / Zeek tailer
  -> HTTPS POST /api/events
CloudFront
  -> HTTP :8000
EC2 FastAPI
  -> Orchestrator
  -> AI adapters
  -> Fusion
  -> API response
```

### 1.4. WebSocket Flow

```text
Browser
  <-> WSS /ws/alerts
CloudFront
  <-> WebSocket connection
EC2 FastAPI
  -> alert.created / alert.updated over existing connection
```

### 1.5. Local Lab Flow

```text
Attacker
  -> pfSense
  -> Victim
       |
       | traffic observed by Zeek
       v
Zeek Sensor
  -> conn.log / http.log
Collector / Tailer
  -> HTTPS POST /api/events
CloudFront
  -> EC2 FastAPI
```

Collector không gửi trực tiếp vào SQS trong thin-slice vì MVP chưa có SQS.

## 2. AWS Resource Placeholders

Điền các biến này trên máy deploy. Không ghi access key hoặc secret vào file docs/commit.

```bash
export PROJECT_NAME="soc-mvp"
export AWS_REGION="<region>"

export FRONTEND_BUCKET="soc-mvp-frontend-<unique-suffix>"
export EC2_NAME="soc-mvp-backend"
export EC2_SG_NAME="soc-mvp-backend-sg"

export BACKEND_EC2_PUBLIC_DNS="<ec2-public-dns-or-elastic-ip-domain>"
export BACKEND_PORT="8000"

export CLOUDFRONT_DISTRIBUTION_ID="<distribution-id>"
export CLOUDFRONT_DOMAIN="<distribution-domain>"  # example: dxxxx.cloudfront.net
```

Resources bắt buộc:

```text
1 S3 bucket              frontend build output
1 CloudFront distribution
1 EC2 instance           FastAPI + model artifacts
1 EC2 security group
1 IAM role for EC2       only if backend needs AWS API access
```

Resources chưa cần cho lần deploy đầu:

```text
ALB
NAT Gateway
RDS
SQS
WAF
Auto Scaling Group
S3 Evidence Bucket
```

## 3. Phase 0 - Verify Local Before Deploy

Không deploy AWS nếu local backend chưa chạy được với AI2A/AI2B real.

### 3.1. Start Local Backend

Chạy từ repo root:

```bash
conda run --no-capture-output -n interior_ai env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000
```

Terminal đứng yên là bình thường vì `uvicorn` là long-running server.

### 3.2. Test Local Health

```bash
curl http://127.0.0.1:8000/health
```

Expected:

```json
{"status":"ok"}
```

### 3.3. Test Local AI2B SQLI

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

Điều kiện tiếp tục:

```text
[ ] Backend khởi động không lỗi
[ ] /health trả status ok
[ ] AI2B source=real
[ ] AI2A adapter load thành công
[ ] WebSocket hoạt động local
```

### 3.4. Lock Dependency Snapshot

Trong environment local đang chạy thành công:

```bash
conda activate interior_ai

python --version
pip freeze > requirements-aws-lock.txt

python -c "import sklearn; print(sklearn.__version__)"
python -c "import numpy; print(numpy.__version__)"
python -c "import scipy; print(scipy.__version__)"
python -c "import joblib; print(joblib.__version__)"
```

Không để EC2 tự cài dependency latest một cách không kiểm soát.

### 3.5. Verify Required Artifacts

```bash
test -d Dataset/tools/ai2a_modeling/artifacts/release_candidate_v1/20260605T071810Z

test -f \
Dataset/tools/ai2a_modeling/artifacts/temporal_v2_1/20260603T080212Z/rf_v2_1_full_safe_plus_ssh_minimal/feature_manifest.json

test -f \
Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest/ai2b_v1_4_9_freeze_manifest.json

test -f \
Dataset/tools/ai2b_modeling/configs/ai2b_v1_4_8j_overlap_cleanup_policy.json
```

Tất cả phải tồn tại trước khi copy lên EC2.

## 4. Phase 1 - Create EC2 Backend

### 4.1. Network

Thin-slice EC2 đặt trong:

```text
Default VPC or demo VPC
Public subnet
Public IPv4 or Elastic IP
Route 0.0.0.0/0 -> Internet Gateway
```

Không cần NAT Gateway vì EC2 MVP đang nằm trong public subnet. NAT Gateway thuộc target architecture khi EC2 chuyển vào private subnet.

### 4.2. EC2 Sizing

Trước khi chọn instance:

1. Chạy AI2A và AI2B local.
2. Đo peak RAM.
3. Chọn EC2 có RAM lớn hơn peak RAM tối thiểu khoảng 30%.
4. Dùng kiến trúc `x86_64` nếu artifact local được tạo/kiểm thử trên `x86_64`.

EC2 chỉ chạy inference. Không train model trên EC2.

### 4.3. Security Group

Inbound ban đầu:

```text
TCP 22
Source: YOUR_PUBLIC_IP/32

TCP 8000
Source: CloudFront origin-facing managed prefix list
```

Managed prefix list name:

```text
com.amazonaws.global.cloudfront.origin-facing
```

Không mở port `8000` cho:

```text
0.0.0.0/0
```

Nếu cần debug trực tiếp từ máy cá nhân, tạm thời thêm:

```text
TCP 8000
Source: YOUR_PUBLIC_IP/32
```

Sau khi debug xong phải xóa rule này.

Outbound:

```text
Allow all outbound
```

Cho lần MVP đầu tiên để EC2 cài package và cập nhật hệ thống.

## 5. Phase 2 - Prepare EC2 Runtime

### 5.1. SSH Into EC2

```bash
ssh -i <key.pem> ubuntu@${BACKEND_EC2_PUBLIC_DNS}
```

### 5.2. Install System Tools

```bash
sudo apt update

sudo apt install -y \
  git \
  rsync \
  curl \
  tmux \
  build-essential
```

### 5.3. Install Miniconda

Cài Miniconda cho Linux `x86_64`, sau đó mở terminal mới hoặc source shell configuration.

Kiểm tra:

```bash
conda --version
```

### 5.4. Create Environment

```bash
conda create -n interior_ai python=3.10 -y
```

Không cài dependency cho đến khi đã copy `requirements-aws-lock.txt` lên EC2.

## 6. Phase 3 - Copy Code And Model Artifacts

### 6.1. Create EC2 Project Directory

```bash
ssh ubuntu@${BACKEND_EC2_PUBLIC_DNS} \
  "mkdir -p ~/soc-mvp"
```

### 6.2. Copy Required Files

Chạy từ repo root trên máy local:

```bash
rsync -avR \
  ./backend \
  ./Dataset/tools/ai2a_modeling \
  ./Dataset/tools/ai2b_modeling \
  ./requirements-aws-lock.txt \
  ubuntu@${BACKEND_EC2_PUBLIC_DNS}:~/soc-mvp/
```

Kết quả bắt buộc:

```text
~/soc-mvp/
├── backend/
├── Dataset/
│   └── tools/
│       ├── ai2a_modeling/
│       └── ai2b_modeling/
└── requirements-aws-lock.txt
```

### 6.3. Verify Artifacts On EC2

```bash
ssh ubuntu@${BACKEND_EC2_PUBLIC_DNS}

cd ~/soc-mvp

test -d backend

test -d Dataset/tools/ai2a_modeling
test -d Dataset/tools/ai2b_modeling

ls Dataset/tools/ai2a_modeling/artifacts/release_candidate_v1/20260605T071810Z
ls Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest
```

### 6.4. Install Python Dependencies

```bash
cd ~/soc-mvp

conda run -n interior_ai \
  pip install -r requirements-aws-lock.txt
```

Nếu package thiếu, xác định nguyên nhân trước khi cài thêm. Sau khi cài thêm, cập nhật lại lock file trong repo.

## 7. Phase 4 - Run Backend On EC2

### 7.1. First Foreground Run

```bash
cd ~/soc-mvp

conda run --no-capture-output -n interior_ai \
  env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000
```

### 7.2. Test Locally On EC2

Mở SSH terminal thứ hai:

```bash
curl http://127.0.0.1:8000/health
```

Test AI2B:

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

Điều kiện tiếp tục:

```text
[ ] /health thành công trên EC2
[ ] AI2B trả source=real
[ ] AI2A load không lỗi
[ ] Không có artifact path error
```

### 7.3. Run With tmux

```bash
tmux new -s soc-backend
```

Trong tmux:

```bash
cd ~/soc-mvp

conda run --no-capture-output -n interior_ai \
  env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000
```

Detach:

```text
Ctrl-b
d
```

Attach lại:

```bash
tmux attach -t soc-backend
```

## 8. Phase 5 - Create S3 Frontend Bucket

### 8.1. Bucket Configuration

```text
Block Public Access: Enabled
Static website hosting: Not required
Object ownership: Bucket owner enforced
Versioning: Optional
```

Bucket không public.

### 8.2. CloudFront OAC

Tạo Origin Access Control cho S3:

```text
Origin type: S3
Signing behavior: Always sign
```

Bucket policy chỉ cho phép CloudFront distribution đọc object.

Không dùng S3 public website endpoint nếu đang dùng OAC.

## 9. Phase 6 - Create CloudFront Distribution

CloudFront distribution có hai origin:

```text
Origin 1: S3 frontend bucket
Origin 2: EC2 FastAPI public DNS / Elastic IP domain, port 8000
```

### 9.1. Origin 1 - S3 Frontend

```text
Origin name:
frontend-s3-origin

Origin domain:
S3 REST endpoint

Origin access:
Origin Access Control
```

### 9.2. Origin 2 - EC2 FastAPI

```text
Origin name:
fastapi-ec2-origin

Origin domain:
EC2 public DNS or Elastic IP domain

Origin protocol policy:
HTTP only

HTTP port:
8000
```

Khuyến nghị dùng Elastic IP hoặc DNS ổn định để tránh phải sửa CloudFront origin sau khi EC2 stop/start.

### 9.3. Default Behavior - Frontend

```text
Path pattern:
Default (*)

Origin:
frontend-s3-origin

Viewer protocol:
Redirect HTTP to HTTPS

Allowed methods:
GET, HEAD, OPTIONS

Cache policy:
CachingOptimized

Compress:
Enabled
```

### 9.4. API Behavior

```text
Path pattern:
/api/*

Origin:
fastapi-ec2-origin

Viewer protocol:
Redirect HTTP to HTTPS

Allowed methods:
GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE

Cache policy:
CachingDisabled

Origin request policy:
AllViewerExceptHostHeader
```

### 9.5. WebSocket Behavior

```text
Path pattern:
/ws/*

Origin:
fastapi-ec2-origin

Viewer protocol:
Redirect HTTP to HTTPS

Allowed methods:
GET, HEAD, OPTIONS

Cache policy:
CachingDisabled

Origin request policy:
AllViewerExceptHostHeader
```

### 9.6. Health Behavior

```text
Path pattern:
/health

Origin:
fastapi-ec2-origin

Viewer protocol:
Redirect HTTP to HTTPS

Allowed methods:
GET, HEAD

Cache policy:
CachingDisabled
```

### 9.7. Distribution Settings

```text
Default root object:
index.html

HTTP versions:
HTTP/2 enabled

IPv6:
Optional

Price class:
Choose demo-appropriate cost scope
```

Không cấu hình custom error `403/404 -> index.html` cho toàn distribution trong lần đầu nếu chưa cần client-side routing, vì API error có thể bị trả thành frontend HTML.

## 10. Phase 7 - Build And Upload Frontend

Frontend production build không gọi trực tiếp EC2. Nó gọi CloudFront cùng domain.

```bash
export CLOUDFRONT_DOMAIN="<distribution-domain>"
```

Build:

```bash
cd frontend

VITE_DATA_MODE=api \
VITE_API_BASE_URL="https://${CLOUDFRONT_DOMAIN}" \
VITE_WS_URL="wss://${CLOUDFRONT_DOMAIN}/ws/alerts" \
pnpm build
```

Không dùng trong frontend production build:

```text
http://EC2:8000
ws://EC2:8000
```

Upload:

```bash
aws s3 sync dist/ \
  "s3://${FRONTEND_BUCKET}/" \
  --delete \
  --region "${AWS_REGION}"
```

Invalidate:

```bash
aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
  --paths "/*"
```

## 11. Phase 8 - Cloud Smoke Tests

### 11.1. Health Through CloudFront

```bash
curl "https://${CLOUDFRONT_DOMAIN}/health"
```

Expected:

```json
{"status":"ok"}
```

Nếu localhost trên EC2 chạy nhưng URL CloudFront không chạy, kiểm tra:

```text
EC2 Security Group
CloudFront EC2 origin domain
Origin port 8000
Origin protocol HTTP only
/health behavior
Uvicorn --host 0.0.0.0
```

### 11.2. AI2B SQL Injection Through CloudFront

```bash
curl -X POST \
  "https://${CLOUDFRONT_DOMAIN}/api/events/http" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "uri": "/search?q=%27%20OR%201%3D1--",
    "source_ip": "10.10.10.10",
    "destination_ip": "192.168.1.10"
  }'
```

Expected:

```text
HTTP success response
AI2B source=real
SQLI / SQL Injection label
Final alert generated
```

### 11.3. AI2B XSS Through CloudFront

```bash
curl -X POST \
  "https://${CLOUDFRONT_DOMAIN}/api/events/http" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "uri": "/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E",
    "source_ip": "10.10.10.10",
    "destination_ip": "192.168.1.10"
  }'
```

Expected:

```text
AI2B source=real
XSS label
Alert broadcast through WebSocket
```

## 12. Phase 9 - Dashboard Test

Open:

```text
https://<CLOUDFRONT_DOMAIN>
```

Demo accounts:

```text
admin@defense.soc / Password123!
analyst@defense.soc / Password123!
```

Browser DevTools checks:

```text
Console:
No mixed-content error
No CORS error

Network:
GET /health -> 200
POST /api/... -> success
/ws/alerts -> 101 Switching Protocols
```

Acceptance:

```text
[ ] Dashboard loads through HTTPS
[ ] Frontend runs API mode
[ ] WebSocket connects through WSS
[ ] SQLI alert appears without refresh
[ ] XSS alert appears without refresh
[ ] Detail drawer shows AI2B source=real
```

## 13. Phase 10 - Replay A10 To Cloud

Run from repo root on local machine:

```bash
conda run -n interior_ai \
  env PYTHONPATH=backend \
  python backend/scripts/replay_local_lab_logs.py \
  --conn-log tmp/zeek_logs/a10_mixed_chain/conn.log \
  --http-log tmp/zeek_logs/a10_mixed_chain/http.log \
  --api-url \
  "https://${CLOUDFRONT_DOMAIN}/api/events"
```

Expected:

```text
Events posted successfully
AI2A real adapter runs
Dashboard displays AI2A detections
No manual browser refresh required
```

## 14. Phase 11 - Live Local Lab To Cloud

### 14.1. Identify IPs Seen By Zeek

```bash
export ZEEK_SSH="zeek@<zeek-ip>"
export ATTACKER_IP="<source-ip-seen-by-zeek>"
export VICTIM_IP="<destination-ip-seen-by-zeek>"
```

Check logs:

```bash
ssh "${ZEEK_SSH}"

tail -n 5 /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log
tail -n 5 /home/zeek/fcaj-ai2a-normal/live_mvp/http.log
```

Nếu pfSense NAT địa chỉ, dùng IP xuất hiện trong Zeek log, không dùng IP dự đoán.

### 14.2. Run Correlated Tailer

```bash
conda run --no-capture-output -n interior_ai \
  env PYTHONPATH=backend \
  python backend/scripts/tail_zeek_correlated_to_backend.py \
  --zeek-ssh "${ZEEK_SSH}" \
  --sensor-id zeek-vm-01 \
  --conn-log \
  /home/zeek/fcaj-ai2a-normal/live_mvp/conn.log \
  --http-log \
  /home/zeek/fcaj-ai2a-normal/live_mvp/http.log \
  --api-url \
  "https://${CLOUDFRONT_DOMAIN}/api/events" \
  --allow-endpoint "${ATTACKER_IP}" \
  --allow-endpoint "${VICTIM_IP}" \
  --require-both-endpoints \
  --correlation-timeout 5.0
```

### 14.3. Send Traffic From Kali

```bash
curl -v \
  -H "Connection: close" \
  "http://${VICTIM_IP}/ai2a_p11_app/search?q=%27%20OR%201%3D1--"
```

```bash
curl -v \
  -H "Connection: close" \
  "http://${VICTIM_IP}/ai2a_p11_app/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E"
```

Expected:

```text
Zeek writes conn.log and http.log
Tailer correlates event
Tailer POSTs HTTPS to CloudFront
CloudFront routes /api/events to EC2
Backend runs AI2A/AI2B
Fusion creates final alert
Dashboard receives alert through WSS
```

## 15. Troubleshooting Map

### Dashboard Opens But API Fails

Check:

```text
/api/* behavior
EC2 origin port
Security Group
Backend process
```

### /health Returns Frontend HTML

Likely cause:

```text
/health behavior missing
or behavior order is wrong
```

### POST Returns 403/405

Check:

```text
Allowed HTTP methods for /api/*
Origin request policy
FastAPI route
```

### WebSocket Does Not Connect

Check:

```text
/ws/* behavior
CachingDisabled
Origin request policy
VITE_WS_URL uses wss://
Uvicorn WebSocket endpoint
```

### AI2A Or AI2B Returns not_available

Check:

```text
Artifact path
File permission
Python package version
Current working directory
PYTHONPATH
Environment variables
```

### CloudFront Returns 502

Check:

```text
EC2 is running
Origin port 8000
Security Group allows CloudFront origin-facing traffic
Uvicorn binds 0.0.0.0
EC2 public DNS is correct
Origin protocol is HTTP only
```

### Alert Does Not Appear On Dashboard

Check in order:

```text
1. Did POST request succeed?
2. Did backend create final alert?
3. Is WebSocket connected?
4. Did browser receive alert.created / alert.updated?
5. Did frontend mapper handle the payload?
```

## 16. Evidence Checklist

Record:

```text
Git commit hash:
AWS Region:
EC2 instance ID:
EC2 public DNS:
CloudFront domain:
S3 frontend bucket:
Backend modes:
  AI1=mock
  AI2A=real
  AI2B=real
```

Screenshots:

```text
[ ] EC2 localhost /health
[ ] CloudFront /health
[ ] Dashboard HTTPS
[ ] DevTools WebSocket status 101
[ ] SQLI final alert
[ ] XSS final alert
[ ] AI2A replay alert
[ ] Live Zeek tailer posted event
[ ] EC2 backend running in tmux
```

Report wording:

```text
This AWS deployment is an MVP thin-slice. The deployed demo uses S3/CloudFront for the frontend and EC2/FastAPI for real-time multi-model detection. The target architecture includes ALB, scoped WAF rules for evidence ingestion, SQS worker processing, RDS persistence, and S3 evidence/report storage.
```

## 17. MVP Acceptance Criteria

MVP hoàn thành khi:

```text
[ ] Frontend served from S3 through CloudFront
[ ] S3 bucket is not public
[ ] CloudFront uses OAC
[ ] EC2 port 8000 is not open to the entire Internet
[ ] /health works through CloudFront
[ ] /api/events works through CloudFront
[ ] /ws/alerts works through WSS
[ ] AI2A source=real
[ ] AI2B source=real
[ ] SQLI and XSS appear realtime
[ ] Replay A10 can post events
[ ] Live Zeek tailer can post events
[ ] Screenshots and commit hash are captured
```

## 18. After MVP: Target Architecture Upgrade Path

Sau khi thin-slice ổn định mới chuyển sang target architecture:

```text
CloudFront + scoped WAF
        -> Internet-facing ALB
        -> Private EC2 Auto Scaling Group
        -> SQS worker pipeline
        -> AI2A / AI2B / Fusion
        -> RDS PostgreSQL
        -> S3 Evidence Bucket
```

Thứ tự nâng cấp đề xuất:

```text
Phase 1: ALB + private EC2
Phase 2: SQS async worker
Phase 3: RDS persistence
Phase 4: S3 evidence storage
Phase 5: scoped WAF rules
Phase 6: ASG + Multi-AZ
Phase 7: CloudWatch alarms + SNS
```

Không triển khai toàn bộ cùng lúc. Mỗi phase phải có smoke test và rollback riêng.

## 19. Final Execution Order

```text
1. Verify model runs locally
2. Lock dependency snapshot
3. Check artifacts
4. Create public EC2
5. Configure security group
6. Copy code and artifacts with correct structure
7. Install runtime
8. Run backend
9. Test localhost on EC2
10. Create private S3 bucket
11. Create CloudFront with two origins
12. Create /api/*, /ws/* and /health behaviors
13. Build frontend with CloudFront HTTPS/WSS URL
14. Upload frontend to S3
15. Invalidate CloudFront
16. Test /health through CloudFront
17. Test SQLI/XSS through CloudFront
18. Test WebSocket dashboard
19. Test A10 replay
20. Test live Zeek tailer
21. Collect evidence
22. Close MVP
```
