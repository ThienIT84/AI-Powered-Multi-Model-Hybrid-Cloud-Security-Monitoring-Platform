# systemd Runtime Templates

Các file trong thư mục này là sample cho EC2 image/Launch Template tương lai.
Chúng chưa được cài trên máy nào và không thay thế IaC.

## Filesystem contract

```text
/opt/socai/current/          immutable application release
/opt/socai/venv/             pinned Python runtime
/etc/socai/socai.env         non-secret identifiers/config, mode 0640
/var/lib/socai/model-bundle/ stable model bundle container
  ACTIVE                     atomic text pointer to versions/<version>
  versions/                  complete, verified bundles retained for rollback
  .staging/                  incomplete downloads; never used by adapters
```

User/group `socai` phải tồn tại. EC2 Instance Profile cung cấp AWS credentials.
Không đặt database password, HMAC secret hoặc access key trong `socai.env`.
API và worker có `RDS_APPLICATION_NAME` override riêng để phân biệt connection;
giá trị `hybrid-soc` trong shared env chỉ là fallback.

## Model manifest contract

Mỗi `MODEL_S3_PREFIX` là một release prefix immutable. Upload artifact trước,
sau đó upload đúng một file `${MODEL_S3_PREFIX}/manifest.json` có dạng:

```json
{
  "schema_version": 1,
  "bundle_id": "runtime-2026-07-15",
  "artifacts": [
    {
      "path": "Dataset/tools/ai1_modeling/artifacts/model.joblib",
      "sha256": "<64 lowercase hexadecimal characters>",
      "size": 123456
    }
  ]
}
```

`path` phải là POSIX path tương đối, canonical và duy nhất. Manifest phải liệt kê
toàn bộ file của bundle; không có symlink hoặc file ngoài manifest. Deployment
tính SHA-256 trên **exact bytes** của `manifest.json` đã upload rồi đặt digest đó
vào `MODEL_BUNDLE_MANIFEST_SHA256`. Không dùng ETag thay SHA-256.

`socai-model-sync.service` tải manifest đã pin, tải từng artifact vào `.staging/`,
kiểm tra size + SHA-256, rồi chuyển cả thư mục thành version hoàn chỉnh. Chỉ sau
đó service mới atomically replace pointer `ACTIVE`. Download/hash/canary lỗi không
thay bundle đang active. `ExecStartPost` re-verify toàn bộ bundle và load các real
adapter giống API/worker; với `AWS_REQUIRE_REAL_MODELS=true`, AI1/AI2A/AI2B đều
phải ở mode `real` và load `healthy`.

## Install và rollout

Trước khi cài:

1. thay mọi placeholder trong `socai.env.example`, đặc biệt manifest digest;
2. kiểm tra pinned Python dependencies và immutable application release;
3. áp dụng database migration bằng migration role riêng;
4. xác nhận Target Group chỉ cho ALB truy cập port 8000;
5. review các systemd hardening flags và filesystem ownership.

Deployment automation đã duyệt cài các file như sau:

```text
socai-api.service        -> /etc/systemd/system/socai-api.service
socai-worker.service     -> /etc/systemd/system/socai-worker.service
socai-model-sync.service -> /etc/systemd/system/socai-model-sync.service
socai.env                -> /etc/socai/socai.env
```

Quy trình release model:

1. tạo prefix mới, upload artifacts rồi `manifest.json`;
2. cập nhật `MODEL_S3_PREFIX` và exact `MODEL_BUNDLE_MANIFEST_SHA256` trong env;
3. restart `socai-model-sync.service` và kiểm tra status/journal canary;
4. chỉ khi sync/canary pass mới restart `socai-api.service` và
   `socai-worker.service`.

`RemainAfterExit` làm model sync chỉ chạy khi unit được start/restart. Restart API
riêng không tự tải release model mới. Version cũ được giữ để rollback bằng cách
pin lại prefix + digest cũ rồi chạy lại quy trình; chưa có automatic garbage
collection nên retention phải do deployment policy quản lý.

Local development vẫn có thể trỏ `MODEL_ARTIFACT_ROOT` trực tiếp vào một tree
chứa `Dataset/...` khi không có `ACTIVE`. `SOC_DEPLOYMENT_TARGET=aws` không có
fallback này: thiếu `ACTIVE` là lỗi startup/readiness.

CloudFront smoke test dùng `GET /api/health/live`. Target Group gọi trực tiếp
`GET /health/ready`. Readiness chỉ kiểm tra cấu hình bắt buộc và model đã load
trong process; nó không probe trực tiếp SQS, S3, RDS hoặc Secrets Manager.

Mỗi service ghi stdout/stderr vào journal để CloudWatch Agent thu thập. Không
dùng sample này để tuyên bố ASG hoặc service đã được triển khai.
