# Hybrid Cloud SOC Architecture - Nguồn Chuẩn

Tài liệu này là nguồn chuẩn cho kiến trúc đích và tên thành phần của Hybrid
Cloud SOC. Nó mô tả hợp đồng giữa ứng dụng và hạ tầng; nó không phải bằng chứng
rằng các tài nguyên AWS đã được tạo.

Các tài liệu `aws_mvp_*` và `aws_phase*` ghi lại các thin-slice hoặc lần thử
trước đây. Khi có khác biệt về kiến trúc đích, tài liệu này được ưu tiên.

## Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| `Có trong repo` | Có mã nguồn hoặc artifact có thể kiểm tra trong repository. |
| `Một phần` | Có một phần luồng, nhưng chưa đáp ứng đầy đủ hợp đồng đích. |
| `Tài liệu lịch sử` | Có hướng dẫn hoặc bằng chứng của một lần thử trước đây. |
| `Chưa có trong repo` | Không có implementation hoặc cấu hình tái tạo được. |
| `Chưa xác minh trên AWS` | Repository không đủ để kết luận tài nguyên đang tồn tại hoặc đang chạy. |

Không được đổi `Chưa xác minh trên AWS` thành `Đã triển khai` chỉ dựa trên tên
tài nguyên, ảnh chụp, log cũ hoặc placeholder trong tài liệu.

## Luồng chuẩn 1-9

### 1. Admin / Analyst -> Amazon CloudFront

Admin hoặc Analyst mở SOC Dashboard bằng browser qua HTTPS. CloudFront là điểm
truy cập public duy nhất cho giao diện, REST API, WebSocket và telemetry
ingestion.

### 2. Zeek Collector/Tailer -> CloudFront + AWS WAF

Collector/Tailer chuẩn hóa telemetry Zeek rồi gửi HTTPS tới `/ingest/*`. AWS WAF
được gắn với CloudFront distribution và kiểm tra request trước khi request được
chuyển tới origin.

WAF chỉ là lớp lọc biên. Backend `/ingest/zeek` xác thực collector bằng HMAC
SHA-256 trên timestamp + raw body, giới hạn cửa sổ chống replay và đọc secret từ
Secrets Manager trong chế độ AWS.

### 3. CloudFront -> S3 Static Frontend

Default behavior `/*` phục vụ React/Vite build từ private S3 frontend bucket qua
Origin Access Control. Bucket này chỉ chứa `index.html`, JavaScript, CSS và
assets; nó không lưu alert, raw Zeek log hoặc model.

### 4. CloudFront -> Application Load Balancer

Các behavior động được chuyển tới ALB:

- `/api/*`
- `/ws/*`
- `/ingest/*`

CloudFront có thể dùng `GET /api/health/live` cho smoke test. Target Group phải
kiểm tra trực tiếp backend bằng `GET /health/ready`.

### 5. ALB -> Target Group

ALB nhận request, áp dụng listener rule và chuyển request tới Target Group. ALB
không chạy AI inference và không lưu alert.

### 6. Target Group -> Backend EC2 Auto Scaling Group

Target Group route tới Backend EC2 healthy trong Private App Subnet AZ-A hoặc
AZ-B. Mỗi image/instance runtime có thể cung cấp:

- FastAPI REST API;
- WebSocket `/ws/alerts`;
- `/ingest/*` endpoint;
- SQS producer/consumer;
- feature extraction;
- AI1, AI2A, AI2B inference;
- Fusion Layer.

API process và worker process phải được quản lý độc lập. Các unit mẫu trong
`deploy/systemd/` chỉ là template; chúng không chứng minh có service trên EC2.

### 7. Backend EC2 <-> Amazon SQS

Luồng đích cho telemetry là:

1. FastAPI validate JSON và Data Contract.
2. FastAPI tạo normalized Zeek event có `event_id` ổn định.
3. Producer gọi `SendMessage` vào main queue.
4. Worker long-poll bằng `ReceiveMessage`.
5. Worker chạy feature extraction, AI inference và Fusion.
6. Worker chỉ gọi `DeleteMessage` sau khi Final Alert và evidence bắt buộc đã
   được lưu thành công.
7. Message lỗi được retry và cuối cùng chuyển tới DLQ theo redrive policy.

SQS là buffer với delivery at-least-once. `event_id` unique trong RDS là lớp
idempotency bắt buộc.

### 8. Backend EC2 -> S3 Gateway Endpoint -> S3 Data Bucket

Backend dùng S3 Gateway Endpoint để truy cập private S3 data bucket cho:

- `models/<model>/<version>/...` - model và manifest;
- `raw/zeek/<yyyy>/<mm>/<dd>/...` - raw Zeek logs;
- `evidence/<alert-id>/...` - evidence artifacts;
- `reports/...` - báo cáo;
- `datasets/...` - dataset được quản lý;
- `features/...` - training hoặc inference feature artifacts.

S3 frontend bucket và S3 data bucket là hai trust boundary khác nhau. Application
đã có adapter cho raw Zeek/evidence. Model sync không copy trực tiếp vào live
path: mỗi release prefix phải có `manifest.json` liệt kê path, byte size và
SHA-256 của toàn bộ artifact. Deployment pin SHA-256 của exact manifest bytes;
script tải vào `.staging/`, verify mọi artifact, chuyển thành version hoàn chỉnh
rồi atomically replace pointer `ACTIVE`. Adapter giữ các path `Dataset/...` hiện
có nhưng resolver trỏ chúng vào version active. Bundle thiếu, sai hash, có symlink
hoặc có file ngoài manifest không được activate. Reports, datasets và training
features vẫn là phạm vi tiếp theo.

### 9. Backend EC2 -> RDS Endpoint -> RDS PostgreSQL Primary

Sau AI1, AI2A, AI2B và Fusion, worker ghi Final Alert qua RDS DB Endpoint port
5432. API đọc lịch sử alert từ cùng endpoint để trả Dashboard.

Schema tái tạo ban đầu nằm tại
`backend/migrations/001_final_alerts.sql`. Các trường lưu trữ gồm:

- Alert ID và unique Event ID;
- event timestamp, created timestamp và updated timestamp;
- attack type, final label, severity, risk/confidence score;
- source/destination IP;
- evidence summary;
- raw log S3 URI và evidence S3 URI;
- full alert payload dạng JSONB.

RDS Multi-AZ replication từ Primary sang Standby do RDS quản lý. Application
không kết nối trực tiếp Standby. Trạng thái Multi-AZ thực tế chưa thể xác minh từ
repository.

## Dịch vụ hỗ trợ và High Availability

### NAT Gateway A/B

NAT Gateway chỉ phục vụ outbound Internet từ Private App Subnet, ví dụ cập nhật
OS, tải package hoặc image. Nó không nằm trên đường đi của alert. Theo kiến trúc
HA, mỗi AZ có NAT Gateway và route table tương ứng; cấu hình này chưa có trong
repo.

S3 đi qua Gateway Endpoint. Nếu không bổ sung Interface Endpoint cho SQS,
Secrets Manager và CloudWatch, traffic HTTPS tới các dịch vụ đó sẽ dùng NAT.

### IAM, AWS Secrets Manager và AWS KMS

- EC2 Instance Profile cấp quyền tối thiểu cho SQS, S3, CloudWatch và Secrets
  Manager.
- Secrets Manager lưu RDS credential và secret dùng xác thực ingestion.
- Không đặt AWS access key, database password hoặc HMAC secret trong repository,
  AMI, user-data hay systemd EnvironmentFile.
- KMS bảo vệ dữ liệu at-rest trong S3, RDS, SQS và Secrets Manager theo policy
  được review riêng.

Code hiện tại đọc JSON secret từ Secrets Manager cho RDS và HMAC ingestion, đồng
thời hỗ trợ SSE-KMS khi ghi S3. IAM/KMS resource policy vẫn thuộc IaC và chưa có
artifact triển khai trong repo.

### CloudWatch và SNS

ALB, SQS, EC2/API/worker và RDS gửi log/metric tới CloudWatch. Alarm dự kiến bao
gồm tối thiểu:

- ALB 5xx, unhealthy targets và target latency;
- SQS age of oldest message, visible backlog và DLQ depth;
- EC2 CPU/memory/disk và process health;
- RDS CPU, connections, storage, latency và failover events.

CloudWatch Alarm gửi notification tới SNS; SNS chuyển Email/SMS tới SOC/Ops
Team. Repository hiện chưa có alarm, dashboard, log-agent hoặc SNS configuration.

CloudTrail trong sơ đồ là audit trail cho AWS control-plane/API activity; nó không
thay thế Zeek telemetry hay application log. Trail, destination bucket/CloudWatch
Logs integration và retention policy hiện chưa có artifact triển khai trong repo.

## CloudFront path behavior

Các behavior cụ thể phải đứng trước default behavior.

| Path | Origin | Methods | Cache | Hợp đồng chính |
|---|---|---|---|---|
| `/*` | S3 Static Frontend | `GET`, `HEAD`, `OPTIONS` | Cache static assets; `index.html` ngắn | Private bucket + OAC; SPA fallback về `index.html`. |
| `/api/*` | ALB | Theo REST endpoint | Disabled | Forward query string, `Authorization` hoặc session cookie theo cơ chế auth đã duyệt. |
| `/ws/*` | ALB | WebSocket upgrade | Disabled | Dùng `AllViewer` hoặc forward tối thiểu `Sec-WebSocket-Key` và `Sec-WebSocket-Version`; giữ các header WebSocket được AWS khuyến nghị và timeout phù hợp kết nối dài. |
| `/ingest/*` | ALB | `POST`, `OPTIONS` | Disabled | Forward `Content-Type`, `X-SOC-Timestamp`, `X-SOC-Signature`; WAF rate/body rules; backend validate schema, timestamp, HMAC và event ID idempotency. |
| `/api/health/live` | ALB qua CloudFront | `GET` | Disabled | Liveness/smoke test không gọi dependency. |
| `/health/ready` | ALB trực tiếp | `GET` | Disabled | Target Group readiness theo cấu hình và model đã load trong process. |

ALB origin nên dùng HTTPS. Security Group của target chỉ nhận traffic từ ALB
Security Group. Không mở port backend trực tiếp cho Internet.

### Authentication boundary chưa được chốt

HTTPS, WAF và collector HMAC không thay thế xác thực Admin/Analyst. Backend hiện
còn login/token demo và WebSocket chưa xác thực danh tính production. Vì workflow
được cung cấp chưa chọn Cognito, ALB OIDC hay một session service cụ thể, repo
không tự thêm một identity provider ngoài sơ đồ. Trước khi public distribution:

- chọn và threat-model cơ chế đăng nhập production;
- bảo vệ cả `/api/*` và WebSocket handshake, không chỉ ẩn nút ở frontend;
- forward đúng cookie/header tối thiểu qua CloudFront và không ghi token vào URL;
- loại bỏ hoặc disable user/password và unsigned token demo trong AWS target;
- kiểm thử logout, expiry, role authorization, CSRF và WebSocket reconnect.

`/health/ready` không phải live probe tới SQS, S3, RDS hoặc Secrets Manager. Ở
AWS, nó fail nếu thiếu cấu hình bắt buộc; mặc định
`AWS_REQUIRE_REAL_MODELS=true` còn yêu cầu AI1, AI2A và AI2B đều ở mode `real` và
đã load `healthy` trong process.

## Trạng thái implementation hiện tại

| Thành phần đích | Trạng thái repo | Ghi chú |
|---|---|---|
| React/Vite frontend | `Có trong repo` | AWS static upload/distribution chưa được xác minh. |
| CloudFront -> S3 frontend | `Tài liệu lịch sử` | Có manual thin-slice runbook; không có IaC. |
| CloudFront `/api/*`, `/ws/*` | `Tài liệu lịch sử` | Runbook cũ dùng public EC2 origin, không phải ALB target. |
| CloudFront `/ingest/*` | `Có trong repo` | FastAPI có canonical `POST /ingest/zeek`; behavior CloudFront/ALB chưa xác minh. |
| AWS WAF | `Chưa có trong repo` | Không có WebACL/rule/association artifact. |
| ALB, Target Group, ASG | `Chưa có trong repo` | Không có Launch Template, scaling policy hoặc listener rules. |
| FastAPI REST + `/ws/alerts` | `Có trong repo` | Socket state cục bộ; API node poll RDS để fan-out kết quả worker. |
| Admin/Analyst production authentication | `Chưa có trong repo` | Login/token hiện là demo; phải chọn Cognito/OIDC hoặc session backend được ký trước khi public. |
| Normalized ingestion -> SQS | `Có trong repo` | `/ingest/zeek` validate, archive raw và enqueue envelope; route `/api/events*` được giữ cho local/debug. |
| SQS worker + delete-after-success | `Có trong repo` | Queue/DLQ deployment và policy chưa được xác minh. |
| RDS alert persistence/read | `Có trong repo` | Adapter ghi timestamp/evidence/S3 URI/payload; migration là schema contract, chưa phải bằng chứng đã áp dụng. |
| Secrets Manager RDS/HMAC lookup | `Có trong repo` | Quyền IAM thực tế chưa được xác minh. |
| S3 models/raw/evidence/reports | `Một phần` | Model sync dùng manifest SHA-256 pin, staging/version và atomic `ACTIVE`; có raw/evidence adapters. Reports/datasets/features và lifecycle thuộc phase tiếp theo. |
| S3 Gateway Endpoint | `Chưa có trong repo` | Chưa có route-table/endpoint policy. |
| RDS Multi-AZ | `Chưa có trong repo` | AWS state chưa được xác minh. |
| NAT Gateway A/B | `Chưa có trong repo` | AWS state chưa được xác minh. |
| IAM/KMS policies | `Chưa có trong repo` | Không suy ra policy từ tên role trong log cũ. |
| CloudWatch/SNS | `Chưa có trong repo` | Worker ghi structured JSON stdout; agent/alarm/SNS chưa có. |
| CloudTrail | `Chưa có trong repo` | Chưa có trail, log destination, retention hoặc evidence đã enable. |
| systemd API/worker | `Có template trong repo` | Template phải được review và cài bởi deployment process. |
| Terraform/CloudFormation/CDK | `Chưa có trong repo` | `infra/README.md` chỉ là contract/checklist. |

## Mapping local và AWS

Business logic, Data Contract, AI adapters và Fusion dùng chung. Khác biệt môi
trường nằm ở edge, process manager và storage adapter.

| Khả năng | Local lab | AWS target |
|---|---|---|
| Dashboard | Vite dev server | CloudFront -> private S3 static frontend |
| API | Uvicorn trên localhost/LAN | CloudFront -> ALB -> private EC2 ASG |
| Ingestion | Tailer POST trực tiếp `/api/events*` | Tailer HTTPS `/ingest/*` qua WAF, sau đó SQS |
| Queue | Có thể bypass để debug/replay | SQS main queue + DLQ bắt buộc |
| Alert storage | In-memory store hoặc PostgreSQL local | RDS PostgreSQL Multi-AZ |
| Model/evidence | File local | S3 data bucket qua Gateway Endpoint |
| Secret | Biến môi trường không chứa production secret | Secrets Manager qua EC2 role |
| Realtime | WebSocket trong một process | Mỗi API node poll incremental từ RDS và fan-out tới socket cục bộ |
| Log/metric | Console/local files | CloudWatch Logs/Metrics -> Alarm -> SNS |

Không fork hai codebase local/cloud. Chọn adapter bằng cấu hình và giữ cùng API
contract.

## Cách chạy Collector theo môi trường

Local lab tiếp tục dùng đường xử lý đồng bộ để quan sát/debug nhanh:

```powershell
$ZeekIp = "192.168.171.128"
$env:PYTHONPATH = (Resolve-Path ".\backend").Path

& .\.venv\Scripts\python.exe -u .\backend\scripts\tail_zeek_correlated_to_backend.py `
  --zeek-ssh "hai2@$ZeekIp" `
  --conn-log /opt/zeek/spool/zeek/conn.log `
  --http-log /opt/zeek/spool/zeek/http.log `
  --api-url http://127.0.0.1:8000/api/events `
  --sensor-id zeek-local-lab `
  --correlation-timeout 15 `
  --heartbeat-interval 15 `
  --ssh-reconnect-delay 5
```

AWS dùng đúng cùng tailer nhưng đổi URL sang CloudFront. Secret HMAC phải được
inject vào environment của collector từ secret store/quy trình đã duyệt; không
ghi giá trị thật vào command history hoặc repository:

```powershell
$ZeekIp = "192.168.171.128"
$CloudFrontDomain = "<dashboard-cloudfront-domain>"
# INGEST_HMAC_SECRET đã được process manager/secret store inject trước đó.

& .\.venv\Scripts\python.exe -u .\backend\scripts\tail_zeek_correlated_to_backend.py `
  --zeek-ssh "hai2@$ZeekIp" `
  --conn-log /opt/zeek/spool/zeek/conn.log `
  --http-log /opt/zeek/spool/zeek/http.log `
  --api-url "https://$CloudFrontDomain/ingest/zeek" `
  --sensor-id zeek-local-lab `
  --correlation-timeout 15 `
  --heartbeat-interval 15 `
  --ssh-reconnect-delay 5
```

Response `202 queued` chỉ xác nhận raw event đã archive và SQS đã nhận message;
Final Alert xuất hiện sau khi worker ghi S3 evidence và RDS.
Khi `SOC_DEPLOYMENT_TARGET=aws`, các route local/debug `/api/events*` và
`/api/replay/demo` mặc định trả `404` để không bypass HMAC/SQS; chỉ bật lại bằng
`ALLOW_LEGACY_INGEST=true` trong một đợt kiểm thử được kiểm soát.

## Environment contract

### Biến backend đang được code sử dụng

| Biến | Ví dụ không chứa secret | Mục đích |
|---|---|---|
| `AWS_REGION` | `ap-southeast-1` | Region cho boto3 clients. |
| `SECRETS_CACHE_TTL_SECONDS` | `300` | TTL cache secret trong process; không ghi secret ra disk/log. |
| `SQS_QUEUE_URL` | URL có placeholder account ID | Main normalized-event queue. |
| `SQS_VISIBILITY_TIMEOUT_SECONDS` | `120` | Visibility timeout ban đầu của worker. |
| `SQS_VISIBILITY_HEARTBEAT_SECONDS` | `30` | Chu kỳ gia hạn visibility khi inference/persistence còn chạy. |
| `RDS_SECRET_ID` | `socai/dev/rds/app` | Secrets Manager ID chứa RDS JSON credential. |
| `RDS_CONNECT_TIMEOUT_SECONDS` | `10` | Timeout mở PostgreSQL connection. |
| `RDS_APPLICATION_NAME` | `hybrid-soc` | Tên fallback; systemd override thành `socai-api`/`socai-worker`. |
| `RDS_ALERT_SYNC_INTERVAL_SECONDS` | `2` | Chu kỳ mỗi API node poll Final Alert mới để WS fan-out. |
| `RDS_ALERT_SYNC_BATCH_SIZE` | `200` | Số row tối đa mỗi batch incremental poll (clamp 1-1000). |
| `SOC_DEPLOYMENT_TARGET` | `aws` | Bật các ràng buộc fail-closed của cloud runtime. |
| `S3_DATA_BUCKET` | bucket có placeholder account ID | Data bucket chứa model/raw/evidence. |
| `S3_KMS_KEY_ID` | KMS ARN placeholder | SSE-KMS khi ghi raw/evidence. |
| `MODEL_S3_PREFIX` | `models/runtime-bundle/v1` | Prefix model bundle đã review. |
| `MODEL_ARTIFACT_ROOT` | `/var/lib/socai/model-bundle` | Container của `ACTIVE`, `versions/` và `.staging/`, không phải live `Dataset/` trực tiếp. |
| `MODEL_BUNDLE_MANIFEST_SHA256` | 64 lowercase hex | SHA-256 của exact `${MODEL_S3_PREFIX}/manifest.json` bytes. |
| `INGEST_HMAC_REQUIRED` | `true` | Local có thể opt-in/opt-out; `aws` và mọi target không phải local luôn fail-closed và không cho `false` tắt HMAC. Backend cloud chỉ nhận `INGEST_HMAC_SECRET_ID`; `INGEST_HMAC_SECRET` chỉ dành cho collector/local. |
| `INGEST_HMAC_SECRET_ID` | `socai/dev/ingest/hmac` | Secret ký telemetry collector. |
| `CORS_ALLOWED_ORIGINS` | dashboard HTTPS origin | Origin được phép trong trường hợp gọi cross-origin. |
| `AWS_REQUIRE_REAL_MODELS` | `true` | AWS readiness/canary yêu cầu cả ba real model load healthy. |
| `AI1_PREDICTOR_MODE` | `real` | `mock`, `unavailable` hoặc `real`. |
| `AI2A_PREDICTOR_MODE` | `real` | `mock`, `unavailable` hoặc `real`. |
| `AI2B_PREDICTOR_MODE` | `real` | `mock`, `unavailable` hoặc `real`. |

`backend/.env.aws.example` là mẫu để export hoặc dùng làm systemd
EnvironmentFile. Application hiện không tự động nạp file này.

Không cấu hình `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` trên EC2; boto3 phải
dùng EC2 Instance Profile.

### Biến frontend build-time

| Biến | AWS build value |
|---|---|
| `VITE_DATA_MODE` | `live` |
| `VITE_DEPLOYMENT_ENV` | `aws` |
| `VITE_API_BASE_URL` | để trống để dùng cùng CloudFront origin |
| `VITE_WS_URL` | để trống để suy ra `wss://<CloudFront>/ws/alerts` |

Các biến trên chỉ mô tả application contract. Việc có tên biến trong
EnvironmentFile không chứng minh IAM, endpoint, bucket, queue hoặc database đã
được triển khai đúng trên AWS.

## Quy ước tên logical resource

Quy ước đề xuất dùng `socai-<env>-<purpose>`, với `<env>` là `dev`, `staging`
hoặc `prod`. Bucket bổ sung account/region để đảm bảo uniqueness.

| Resource | Logical name mẫu |
|---|---|
| CloudFront distribution | `socai-<env>-soc-dashboard` |
| WAF WebACL | `socai-<env>-edge-web-acl` |
| S3 frontend bucket | `socai-<env>-<account>-<region>-frontend` |
| ALB | `socai-<env>-backend-alb` |
| Target Group | `socai-<env>-backend-tg` |
| Auto Scaling Group | `socai-<env>-backend-asg` |
| SQS main queue | `socai-<env>-normalized-zeek-events-queue` |
| SQS DLQ | `socai-<env>-normalized-zeek-events-dlq` |
| S3 data bucket | `socai-<env>-<account>-<region>-data` |
| RDS identifier | `socai-<env>-postgres` |
| RDS secret ID | `socai/<env>/rds/app` |
| Ingest HMAC secret ID | `socai/<env>/ingest/hmac` |
| KMS aliases | `alias/socai-<env>-data`, `alias/socai-<env>-database` |
| CloudWatch log groups | `/socai/<env>/api`, `/socai/<env>/worker` |
| CloudTrail trail | `socai-<env>-audit-trail` |
| SNS topic | `socai-<env>-soc-ops-alerts` |

Tên là contract để mapping; ARN, endpoint, account ID và secret value không được
commit.

## WebSocket khi chạy nhiều EC2

WebSocket manager giữ connection trong memory của từng process. ALB giữ một
WebSocket connection ở một target, trong khi SQS có thể giao message cho worker
ở target khác. Application giải quyết đường dữ liệu hiện tại bằng cách để mỗi API
node poll incremental Final Alert từ RDS, deduplicate theo alert ID rồi broadcast
tới các socket cục bộ. Vì vậy:

- SQS không phải pub/sub fan-out;
- sticky session không giải quyết worker chạy ở instance khác;
- ghi RDS làm alert bền vững; độ trễ push phụ thuộc `RDS_ALERT_SYNC_INTERVAL_SECONDS`;
- restart hoặc scale-in làm mất connection/state cục bộ.

Trước khi tuyên bố realtime HA, phải kiểm thử scale-out/failover của cơ chế polling
hiện tại. Nếu lưu lượng lớn hơn khả năng polling RDS, cần duyệt một backplane pub/sub
riêng; SQS work queue không được dùng làm fan-out.

REST đọc từ RDS vẫn là durable source of truth; WebSocket là kênh thông báo
near-real-time và frontend tiếp tục reconciliation định kỳ để tự phục hồi event bị lỡ.

## Giới hạn state của workspace phụ trợ

Workflow được chốt ở trên chỉ quy định RDS cho **Final Alert**. Các collection
`cases`, `playbooks`, `alert_rules` và `settings` hiện vẫn do `WorkspaceStore`
giữ trong memory của từng backend process. Vì vậy chúng:

- không phải dữ liệu durable;
- không được chia sẻ giữa các EC2 trong Auto Scaling Group;
- mất khi process restart, instance replacement hoặc scale-in;
- không được dùng làm bằng chứng rằng case/configuration đã được lưu vào RDS.

API công bố trạng thái này tại `GET /api/workspace/status`; `/api/settings` cũng
trả `runtime.workspacePersistence=process_local`. Dashboard phải hiển thị giới
hạn này thay vì dùng từ ngữ “persisted” hoặc “backend-synced”. Không mở thêm bảng
RDS cho các collection trên trong phase này vì chúng nằm ngoài workflow đã duyệt.
Muốn productionize chúng cần một data contract/migration riêng được phê duyệt.
Với deployment target `aws`, action `createCaseFromAlert` và các endpoint mutation
`POST/PATCH /api/cases` vì vậy trả `501` trước mọi side effect thay vì tạo một
case process-local rồi báo thành công giả. Local mode vẫn cho phép workspace tạm
để phục vụ phát triển.

## Điều kiện để gọi là matching kiến trúc

Chỉ đánh dấu hoàn tất khi có evidence độc lập cho từng lớp:

- path behavior và origin đúng trên CloudFront;
- WAF association và rule scope `/ingest/*`;
- ALB target ở cả hai AZ và không public trực tiếp port backend;
- ingestion thực sự enqueue trước inference;
- worker delete message sau khi RDS/S3 commit;
- migration được áp dụng và idempotency test pass;
- model manifest digest được pin, hash/canary pass và failure test chứng minh
  `ACTIVE` không đổi khi bundle mới hỏng;
- S3 access đi qua Gateway Endpoint theo route/policy mong đợi;
- RDS Multi-AZ, backup và failover được xác minh;
- CloudWatch alarm tạo SNS notification test;
- scale-out test chứng minh REST và realtime behavior đã công bố.
