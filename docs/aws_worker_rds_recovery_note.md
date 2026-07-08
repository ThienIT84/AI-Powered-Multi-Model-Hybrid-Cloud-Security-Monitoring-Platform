# AWS Worker to RDS Recovery Note

## Muc tieu

Ghi lai qua trinh debug loi `socai-ai-worker` khong ghi duoc alert vao RDS, de lan sau co the kiem tra nhanh hon trong phase SQS/RDS/DLQ.

Ket luan hien tai:

```text
socai-ai-worker -> SQS -> model/fusion -> RDS final_alerts = PASS
```

Bang chung chot:

```text
event_id = evt-rds-recheck-001
RDS SELECT count(*) WHERE event_id = 'evt-rds-recheck-001' -> 1
```

## Timeline loi

### 1. Loi IAM ban dau

Worker tung bao loi:

```text
AccessDeniedException when calling GetSecretValue
User assumed-role/socai-dev-ai-worker-role is not authorized to perform:
secretsmanager:GetSecretValue on resource: socai-dev/rds/app
```

Nguyen nhan:

```text
AI worker IAM role thieu quyen doc secret RDS trong AWS Secrets Manager.
```

Fix:

```text
Gan secretsmanager:GetSecretValue cho role socai-dev-ai-worker-role tren secret socai-dev/rds/app.
```

### 2. Loi timeout RDS sau do

Worker tiep tuc tung bao:

```text
ERROR processing message: ConnectionTimeout: connection timeout expired
```

Va co luc:

```text
OperationalError: connection failed: connection to server at "10.20.32.78", port 5432 failed
server closed the connection unexpectedly
```

Ban dau nghi ngo:

```text
RDS security group / route / NACL / subnet / RDS availability.
```

Sau khi kiem tra lai, RDS SG da allow PostgreSQL 5432 tu:

```text
socai-dev-backend-sg
socai-dev-ai-worker-sg
```

Kiem tra port tu worker EC2 da pass:

```text
RDS port reachable
```

### 3. Loi test terminal gay nham lan

Khi test thu cong tren EC2 gap:

```text
ModuleNotFoundError: No module named 'app'
```

Nguyen nhan:

```text
Chua set PYTHONPATH=backend hoac khong dung dung thu muc repo.
```

Sau do gap:

```text
KeyError: 'RDS_SECRET_ID'
```

Nguyen nhan:

```text
Shell interactive khong co bien moi truong RDS_SECRET_ID.
Systemd service thi da co RDS_SECRET_ID trong ExecStart.
```

Service da xac nhan co env:

```text
RDS_SECRET_ID=socai-dev/rds/app
SQS_QUEUE_URL=https://sqs.ap-southeast-1.amazonaws.com/913626885845/socai-dev-normalized-zeek-events-queue
AWS_REGION=ap-southeast-1
```

## Lenh kiem tra dung

Chay tren EC2 worker:

```bash
cd /home/ec2-user/soc-mvp/current

export AWS_REGION=ap-southeast-1
export RDS_SECRET_ID=socai-dev/rds/app
```

Doc secret:

```bash
PYTHONPATH=backend python - <<'PY'
import os
from app.services.secrets import get_json_secret

secret = get_json_secret(os.environ["RDS_SECRET_ID"])
print(secret["host"], secret.get("port", 5432), secret["dbname"], secret["username"])
PY
```

Ket qua da thay:

```text
socai-dev-postgres-01.cryueq6im5pz.ap-southeast-1.rds.amazonaws.com 5432 socai socai_app
```

Kiem tra port:

```bash
RDS_HOST=$(PYTHONPATH=backend python - <<'PY'
import os
from app.services.secrets import get_json_secret
secret = get_json_secret(os.environ["RDS_SECRET_ID"])
print(secret["host"])
PY
)

timeout 5 bash -c "</dev/tcp/${RDS_HOST}/5432" \
  && echo "RDS port reachable" \
  || echo "RDS port failed"
```

Ket qua da thay:

```text
RDS port reachable
```

Kiem tra schema:

```bash
PYTHONPATH=backend python - <<'PY'
from app.services.rds_alert_store import get_conn

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute("""
            select column_name, data_type
            from information_schema.columns
            where table_name = 'final_alerts'
            order by ordinal_position;
        """)
        for row in cur.fetchall():
            print(row)
PY
```

Bang `final_alerts` da co cac cot chinh:

```text
alert_id
event_id
created_at
severity
attack_type
final_label
risk_score
confidence_score
source_ip
destination_ip
payload
```

Kiem tra index:

```bash
PYTHONPATH=backend python - <<'PY'
from app.services.rds_alert_store import get_conn

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute("""
            select indexname, indexdef
            from pg_indexes
            where tablename = 'final_alerts';
        """)
        for row in cur.fetchall():
            print(row)
PY
```

Ket qua quan trong:

```text
final_alerts_event_id_key
CREATE UNIQUE INDEX final_alerts_event_id_key ON public.final_alerts USING btree (event_id)
```

Dieu nay xac nhan idempotency layer cua RDS da dung: cung `event_id` se update bang `ON CONFLICT`, khong tao duplicate row.

## Bang chung worker -> RDS pass

Sau khi restart worker va gui event test:

```text
event_id = evt-rds-recheck-001
```

Query RDS:

```bash
PYTHONPATH=backend python - <<'PY'
from app.services.rds_alert_store import get_conn

with get_conn() as conn:
    with conn.cursor() as cur:
        cur.execute("""
            select count(*) as count
            from final_alerts
            where event_id = 'evt-rds-recheck-001';
        """)
        print(cur.fetchone())
PY
```

Ket qua:

```text
{'count': 1}
```

Ket luan:

```text
Worker da xu ly message va ghi duoc vao RDS.
RDS unique event_id dang hoat dong.
```

## Trang thai hien tai

```text
Secrets Manager access: PASS
RDS network reachability: PASS
RDS schema final_alerts: PASS
event_id unique index: PASS
Worker -> RDS write path: PASS
```

## Viec tiep theo

Sau khi worker/RDS da on, co the tiep tuc:

1. Chay Phase D5-5 idempotency duplicate test.
2. Gui cung `event_id` 3 lan vao `/api/events/http/async`.
3. Cho worker xu ly.
4. Query:

```sql
SELECT count(*)
FROM final_alerts
WHERE event_id = '<duplicate-test-event-id>';
```

Acceptance:

```text
count = 1
/api/alerts/latest tra ban moi nhat dung
khong co duplicate alert row
```

Neu co DLQ message cu, chi redrive sau khi da xac nhan worker/RDS path van pass.
