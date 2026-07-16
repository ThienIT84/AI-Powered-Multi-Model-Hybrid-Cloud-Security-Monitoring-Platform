# Hybrid Cloud SOC Infrastructure Contract

Thư mục này hiện chỉ chứa contract và checklist. Repository chưa có Terraform,
CloudFormation hoặc CDK deployable. Không xem tài liệu này là bằng chứng tài
nguyên AWS đã được tạo.

Nguồn chuẩn về luồng ứng dụng:
[`docs/hybrid_cloud_soc_architecture.md`](../docs/hybrid_cloud_soc_architecture.md).

## Phạm vi của một IaC phase tương lai

Một implementation IaC được review riêng phải quản lý tối thiểu:

1. VPC, hai Availability Zone, public/private app/private DB subnets và route
   tables;
2. Internet Gateway, NAT Gateway A/B và S3 Gateway Endpoint;
3. private S3 frontend bucket, CloudFront OAC, distribution và path behaviors;
4. WAF WebACL gắn với CloudFront;
5. public ALB, HTTPS listener, Target Group và Security Groups;
6. EC2 Launch Template, Instance Profile và Auto Scaling Group đa AZ;
7. SQS main queue, DLQ, redrive policy và KMS encryption;
8. private S3 data bucket, bucket policy, versioning và lifecycle;
9. RDS PostgreSQL Multi-AZ, DB subnet group, backup và KMS encryption;
10. Secrets Manager resources không chứa secret value trong state input;
11. CloudWatch log groups, metrics/alarms và SNS notification topic;
12. CloudTrail audit trail, encrypted destination và retention theo account policy.

Không thêm placeholder resource rồi đánh dấu `deployed`. Mỗi phase cần plan
review, smoke test, evidence và rollback riêng.

## Input cần chốt trước khi viết IaC

- AWS account/organization boundary, region và `dev/staging/prod` environments;
- project prefix và mandatory tags (`Environment`, `Owner`, `CostCenter`,
  `DataClassification`);
- VPC CIDR, subnet CIDR và hai AZ;
- dashboard domain, Route 53 ownership và ACM certificate strategy;
- CloudFront-to-ALB origin authentication strategy;
- Admin/Analyst identity provider, API authorization và WebSocket session strategy;
- allowed analyst/collector networks và ingestion rate/body limits;
- EC2 architecture, AMI/build pipeline, instance type, min/desired/max capacity;
- model release prefix, manifest SHA-256 pin, bundle size, boot timeout và
  health/readiness definition;
- SQS throughput, visibility timeout, retention, max receive count và DLQ policy;
- S3 retention, object-lock/versioning requirement và evidence lifecycle;
- RDS engine version, instance/storage, backup/PITR retention và maintenance;
- KMS key ownership/rotation/deletion policy;
- log retention, alarm thresholds và approved SNS Email/SMS destinations;
- NAT-per-AZ cost decision and optional SQS/Secrets/CloudWatch interface endpoints.

## Expected logical resources

| Layer | Logical resources |
|---|---|
| Edge | CloudFront distribution, OAC, WAF WebACL, ACM certificate |
| Frontend | Private S3 static bucket and bucket policy |
| Load balancing | ALB, HTTPS listener/rules, Target Group |
| Compute | Launch Template, ASG, EC2 Instance Profile, API/worker log groups |
| Messaging | SQS main queue, DLQ, redrive policy, queue alarms |
| Data | S3 data bucket, S3 Gateway Endpoint, RDS PostgreSQL Multi-AZ |
| Security | Security Groups, IAM policies, KMS keys, Secrets Manager metadata |
| Operations | CloudWatch alarms/dashboard and SNS topic/subscriptions |

Naming phải theo bảng trong architecture source of truth; ARN và endpoint là
outputs, không phải giá trị commit cứng.

## Network contract

| From | To | Port/protocol | Điều kiện |
|---|---|---|---|
| Internet | CloudFront | TCP 443 | Không public S3 hoặc backend port. |
| CloudFront | ALB | TCP 443 | Origin được giới hạn và xác thực. |
| ALB SG | Backend target SG | TCP 8000 | Chỉ ALB SG được phép. |
| Backend | SQS | TCP 443 | Qua NAT hoặc Interface Endpoint được duyệt. |
| Backend | S3 | TCP 443 | Qua S3 Gateway Endpoint và endpoint policy. |
| Backend SG | RDS SG | TCP 5432 | Không cho phép CIDR Internet. |
| Backend | Secrets Manager/CloudWatch | TCP 443 | NAT hoặc Interface Endpoint. |
| RDS Primary | RDS Standby | AWS managed | Application không route trực tiếp. |

CloudFront smoke path là `GET /api/health/live`; Target Group gọi trực tiếp
`GET /health/ready`. Readiness kiểm tra cấu hình bắt buộc và trạng thái model đã
load trong process, không probe trực tiếp AWS dependencies. Health check không
được ghi dữ liệu hoặc chạy inference nặng.

## IAM contract tối thiểu

Tách policy theo trách nhiệm nếu deployment tách API và worker role:

- API: `sqs:SendMessage`, đọc RDS secret cần thiết, CloudWatch logging và các S3
  actions thực sự do API sử dụng;
- Worker: `sqs:ReceiveMessage`, `sqs:DeleteMessage`,
  `sqs:ChangeMessageVisibility`, đọc RDS secret, đọc model và ghi raw/evidence
  đúng prefix S3, CloudWatch logging;
- deployment/migration role: tạo/alter schema; runtime role không có DDL quyền;
- KMS permissions phải giới hạn theo key và `kms:ViaService` khi phù hợp.

Không dùng `Resource: "*"` nếu service hỗ trợ resource-level permissions. Không
đặt access key trên EC2.

## Required outputs của IaC

- CloudFront distribution ID/domain và WAF ARN;
- frontend bucket name;
- ALB DNS/ARN, listener ARN, Target Group ARN và Security Group IDs;
- ASG/Launch Template names;
- SQS main/DLQ URL và ARN;
- S3 data bucket name và Gateway Endpoint ID;
- RDS endpoint/port, DB identifier và Secrets Manager ID, không output password;
- CloudWatch log-group names/alarm ARNs và SNS topic ARN.

Sensitive outputs phải được đánh dấu sensitive và không đưa vào build log.

## Checklist triển khai và evidence

### Edge/frontend

- [ ] S3 frontend bucket private, Block Public Access bật và CloudFront dùng OAC.
- [ ] `/*`, `/api/*`, `/ws/*`, `/ingest/*` behaviors đúng origin/cache/method.
- [ ] `/ingest/*` forward `Content-Type`, `X-SOC-Timestamp` và
      `X-SOC-Signature`; `/api/*` chỉ forward auth cookie/header đã duyệt.
- [ ] SPA deep link trả `index.html`; static asset cache hợp lý.
- [ ] WAF association và scoped rule test pass, không chặn WebSocket hợp lệ.
- [ ] Login demo/unsigned token bị vô hiệu trên AWS; API và WebSocket đều có
      authentication + role authorization production đã kiểm thử.

### Network/compute

- [ ] ALB ở public subnets; backend targets ở private app subnets hai AZ.
- [ ] Backend port không truy cập trực tiếp từ Internet.
- [ ] Launch Template cài API/worker từ immutable, pinned artifact.
- [ ] Model release có manifest liệt kê đủ path/size/SHA-256; exact manifest
      digest được pin và sync/canary chỉ atomically đổi `ACTIVE` sau khi pass.
- [ ] systemd services restart, graceful stop và journal logging được test.
- [ ] ASG scale-out, scale-in drain và instance replacement được test.

### Queue/data

- [ ] Main queue, DLQ, redrive/retention/visibility settings được review.
- [ ] Duplicate `event_id` tạo đúng một Final Alert row.
- [ ] Migration `001_final_alerts.sql` được ghi nhận trong migration history.
- [ ] S3 data bucket versioning/encryption/lifecycle và prefix policy được test.
- [ ] Packet tới S3 đi qua Gateway Endpoint như thiết kế.
- [ ] RDS Multi-AZ, backup/PITR và failover exercise được xác minh.
- [ ] Final Alert API fail closed khi RDS lỗi; không trả cache process-local như
      thể đó là dữ liệu durable.
- [ ] UI/runbook công bố rõ cases/playbooks/rules/settings hiện process-local,
      không shared giữa ASG instances và không sống qua restart.

### Security/operations

- [ ] IAM access analyzer/least-privilege review hoàn tất.
- [ ] Secret/KMS key rotation và recovery ownership được chốt.
- [ ] Không có credential/secret trong repository, user-data hoặc logs.
- [ ] CloudWatch alarms được kích hoạt thử và SNS notification được nhận.
- [ ] CloudTrail ghi control-plane events và log destination/retention được xác minh.
- [ ] Log retention, redaction và correlation ID được kiểm tra.
- [ ] WebSocket cross-instance behavior được chứng minh, không chỉ single-node.

## Trình tự IaC khuyến nghị

1. Chốt input, threat model và cost boundaries.
2. Tạo network/security baseline.
3. Tạo data services và migration path.
4. Tạo immutable compute artifact, Target Group, ALB và ASG.
5. Tạo frontend bucket, CloudFront và WAF.
6. Tạo observability/notification.
7. Chạy smoke, failover, idempotency và scale tests.
8. Lưu plan/apply evidence đã redacted và cập nhật trạng thái triển khai riêng.
