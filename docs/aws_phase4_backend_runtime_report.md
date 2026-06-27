# AWS MVP Phase 4 Backend Runtime Report

## Triển Khai Và Kiểm Thử FastAPI Backend Trên Amazon EC2

```text
Dự án: AI-Powered Multi-Model Hybrid Cloud Security Monitoring Platform
Ngày hoàn thành: 27/06/2026
Giai đoạn: Phase 4 - Backend Runtime Validation
Trạng thái: PASS - Hoàn thành
```

## 1. Mục Tiêu Giai Đoạn

Giai đoạn 4 nhằm triển khai và kiểm thử backend FastAPI trực tiếp trên Amazon EC2, bảo đảm hệ thống có thể:

- Khởi động backend thành công trên EC2.
- Nhận request từ máy local thông qua Elastic IP.
- Chạy model AI2A và AI2B ở chế độ real.
- Tạo Final Alert sau quá trình phân tích và Fusion.
- Gửi cảnh báo realtime qua WebSocket.
- Tiếp tục hoạt động sau khi đóng phiên SSH.
- Ghi log phục vụ kiểm tra và xử lý lỗi.

## 2. Kiến Trúc Đã Kiểm Thử

```text
Máy Local / WSL
        |
        | HTTP :8000
        | WebSocket :8000
        v
Elastic IP
18.136.192.241
        |
        v
Amazon EC2
        |
        v
FastAPI + Uvicorn
        |
        |-- AI1 Adapter
        |     -> Mode: mock
        |
        |-- AI2A Adapter
        |     -> Mode: real
        |
        |-- AI2B Adapter
        |     -> Mode: real
        |
        |-- Fusion Service
        |
        |-- Final Alert
        |
        `-- WebSocket Alert Broadcast
```

Endpoint backend trực tiếp:

```text
http://18.136.192.241:8000
```

## 3. Cấu Hình Runtime

Backend được chạy trong Conda environment:

```text
Environment: interior_ai
Python: 3.10.x
```

Cấu hình model:

```bash
AI1_PREDICTOR_MODE=mock
AI2A_PREDICTOR_MODE=real
AI2B_PREDICTOR_MODE=real
```

Cấu hình Uvicorn:

```text
Host: 0.0.0.0
Port: 8000
Workers: 1
```

Lệnh khởi động chính:

```bash
cd ~/soc-mvp

conda run --no-capture-output -n interior_ai \
  env PYTHONPATH=backend \
  AI1_PREDICTOR_MODE=mock \
  AI2A_PREDICTOR_MODE=real \
  AI2B_PREDICTOR_MODE=real \
  uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --log-level info
```

Việc sử dụng một worker phù hợp với thin-slice MVP hiện tại vì model chỉ cần load một lần và WebSocket connection manager đang được quản lý trong bộ nhớ của một process.

## 4. Kết Quả Kiểm Thử Kết Nối

### 4.1. Kiểm Thử Bên Trong EC2

Endpoint health được gọi trực tiếp trên EC2:

```bash
curl -i http://127.0.0.1:8000/health
```

Kết quả:

```text
PASS
HTTP 200 OK
Backend phản hồi bình thường.
```

### 4.2. Kiểm Thử Từ Máy Local

Endpoint health được gọi từ máy local thông qua Elastic IP:

```bash
curl -i http://18.136.192.241:8000/health
```

Kết quả:

```text
PASS
Máy local kết nối thành công tới backend trên EC2.
```

Điều này xác nhận:

- Elastic IP đã được associate đúng với EC2.
- EC2 có thể nhận traffic từ Internet.
- Uvicorn đang bind đúng vào `0.0.0.0:8000`.
- Security Group cho phép đúng traffic cần thiết.
- Route table và Internet Gateway đang hoạt động.

## 5. Cấu Hình Bảo Mật Mạng

Security Group của EC2 được cấu hình:

```text
TCP 22
Source: Public IP của quản trị viên /32

TCP 8000
Source: Public IP của quản trị viên /32
```

Port `8000` không mở công khai cho toàn bộ Internet.

Trạng thái:

```text
PASS
Port 8000 chỉ cho phép public IP được chỉ định.
```

Đây là cấu hình tạm thời phục vụ kiểm thử trực tiếp backend trước khi chuyển traffic qua CloudFront hoặc ALB.

## 6. Kết Quả Kiểm Thử AI2B

### 6.1. SQL Injection

Một HTTP event chứa payload SQL Injection đã được gửi tới:

```text
POST /api/events/http
```

Ví dụ payload:

```text
' OR 1=1--
```

Kết quả:

```text
PASS
AI2B status: success
AI2B source: real
AI2B nhận diện SQL Injection
Final Alert được tạo
```

### 6.2. Cross-Site Scripting

Một HTTP event chứa payload XSS đã được gửi tới:

```text
POST /api/events/http
```

Ví dụ payload:

```html
<img src=x onerror=alert(1)>
```

Kết quả:

```text
PASS
AI2B status: success
AI2B source: real
AI2B nhận diện XSS
Final Alert được tạo
```

Kết luận AI2B:

```text
AI2B đã load model artifact thành công trên EC2.
AI2B thực hiện inference bằng model thật.
Không sử dụng kết quả mock cho các bài kiểm thử SQLI và XSS.
```

## 7. Kết Quả Kiểm Thử AI2A

AI2A được kiểm thử bằng dữ liệu flow từ Zeek thông qua replay script.

Luồng kiểm thử:

```text
Zeek conn.log / http.log
        |
        v
Replay Script
        |
        v
Feature Extraction
        |
        v
POST /api/events
        |
        v
AI2A Real Model
        |
        v
Fusion
        |
        v
Final Alert
```

Kết quả:

```text
PASS
Replay script gửi event thành công.
AI2A status: success
AI2A source: real
Feature extraction hoạt động.
Model artifact được load đúng.
Final Alert được tạo.
```

Không phát hiện:

```text
Artifact missing
Feature manifest mismatch
Model source=mock
HTTP 500
```

## 8. Kết Quả Kiểm Thử Fusion Và Final Alert

Sau khi event được đưa vào backend:

```text
Normalized Event
        |
        v
Event Orchestrator
        |
        |-- AI1
        |-- AI2A
        `-- AI2B
        |
        v
Fusion Service
        |
        v
Final Alert
```

Kết quả:

```text
PASS
Backend thu thập kết quả từ các adapter.
Fusion Service xử lý kết quả model.
Final Alert được tạo thành công.
```

Trạng thái model trong Final Alert:

```text
AI1: mock
AI2A: real
AI2B: real
```

AI1 ở chế độ mock là cấu hình chủ đích của thin-slice MVP, không được xem là lỗi của giai đoạn này.

## 9. Kết Quả Kiểm Thử WebSocket

WebSocket endpoint:

```text
ws://18.136.192.241:8000/ws/alerts
```

Kết quả kết nối:

```text
PASS
WebSocket client kết nối thành công.
```

Sau khi gửi event tạo cảnh báo, WebSocket nhận được message:

```text
alert.created
```

Kết quả:

```text
PASS
Backend broadcast Final Alert thành công.
WebSocket client nhận được cảnh báo realtime.
```

Luồng realtime đã xác nhận:

```text
API Event
   |
   v
Model Inference
   |
   v
Fusion
   |
   v
Final Alert
   |
   v
WebSocket Broadcast
   |
   v
Connected Client
```

## 10. Kiểm Tra Model Artifact Và Dependency

Các model artifact và file cấu hình cần thiết đã được copy lên EC2 theo đúng cấu trúc thư mục.

Kết quả:

```text
PASS
Không có lỗi artifact path.
Không có lỗi FileNotFoundError liên quan model.
Không có lỗi feature manifest.
Không có lỗi dependency version.
Không có broken requirements.
```

Các thư viện runtime quan trọng đã hoạt động:

```text
FastAPI
Uvicorn
NumPy
pandas
SciPy
scikit-learn
joblib
WebSocket dependencies
```

## 11. Kiểm Tra Tài Nguyên Hệ Thống

Backend và các model đã được chạy thử trên EC2 trong quá trình gửi HTTP event và replay dữ liệu.

Kết quả:

```text
PASS
Không phát hiện Out of Memory.
Không có process Python hoặc Uvicorn bị OOM Killer dừng.
Không có hiện tượng backend bị crash khi load model.
```

Instance hiện tại đủ tài nguyên cho phạm vi thin-slice MVP và demo đã kiểm thử.

## 12. Quản Lý Process Bằng tmux

Backend được chạy trong session:

```text
soc-backend
```

Kiểm tra:

```bash
tmux ls
```

Kết quả:

```text
PASS
Session soc-backend tồn tại.
Backend tiếp tục chạy sau khi detach khỏi tmux.
Backend tiếp tục chạy sau khi đóng phiên SSH.
```

Lệnh attach lại:

```bash
tmux attach -t soc-backend
```

Lệnh detach:

```text
Ctrl-b
d
```

## 13. Quản Lý Log

Log backend được lưu tại:

```text
/home/ubuntu/soc-mvp/logs/backend.log
```

Xem log gần nhất:

```bash
tail -n 100 ~/soc-mvp/logs/backend.log
```

Theo dõi log realtime:

```bash
tail -F ~/soc-mvp/logs/backend.log
```

Kết quả:

```text
PASS
Log được ghi thành công.
Có thể theo dõi request, model inference, Fusion và WebSocket.
```

## 14. Checklist Nghiệm Thu

```text
[x] Uvicorn chạy bằng 0.0.0.0:8000
[x] Chỉ sử dụng 1 worker
[x] /health hoạt động trên EC2 localhost
[x] /health hoạt động từ máy local qua Elastic IP
[x] Security Group port 8000 chỉ mở cho IP quản trị viên
[x] AI2B SQLI trả source=real
[x] AI2B XSS trả source=real
[x] AI2A replay trả source=real
[x] Final Alert được tạo
[x] WebSocket kết nối thành công
[x] WebSocket nhận được alert.created
[x] Không có lỗi artifact path
[x] Không có lỗi dependency version
[x] Không có OOM kill
[x] Backend chạy trong tmux
[x] Backend vẫn chạy sau khi đóng SSH
[x] Log được lưu tại logs/backend.log
```

## 15. Kết Luận

Giai đoạn 4 đã hoàn thành thành công.

Backend FastAPI hiện có thể:

- Chạy ổn định trên EC2.
- Nhận HTTP event từ máy local.
- Chạy AI2A bằng model thật.
- Chạy AI2B bằng model thật.
- Thực hiện Fusion.
- Tạo Final Alert.
- Gửi cảnh báo realtime qua WebSocket.
- Tiếp tục hoạt động sau khi phiên SSH bị đóng.
- Ghi log để kiểm tra và xử lý sự cố.

Kết quả nghiệm thu:

```text
PHASE 4: PASS
BACKEND EC2 RUNTIME: READY
AI2A REAL INFERENCE: PASS
AI2B REAL INFERENCE: PASS
FINAL ALERT PIPELINE: PASS
WEBSOCKET BROADCAST: PASS
```

## 16. Giới Hạn Hiện Tại

Hệ thống hiện tại vẫn là thin-slice MVP và còn các giới hạn:

1. Client đang truy cập trực tiếp Elastic IP qua HTTP.
2. Backend EC2 đang có public IP.
3. Chưa có HTTPS ở phía client/backend direct path.
4. Chưa đặt CloudFront hoặc ALB phía trước backend.
5. Chưa triển khai WAF.
6. Chưa sử dụng Auto Scaling Group.
7. Chưa sử dụng SQS để tách ingestion và detection worker.
8. Chưa lưu Final Alert vào RDS.
9. AI1 vẫn đang chạy ở chế độ mock.
10. `tmux` không tự khởi động lại backend nếu EC2 reboot.

Các giới hạn trên được chấp nhận trong phạm vi kiểm thử thin-slice MVP và sẽ được xử lý ở các giai đoạn triển khai tiếp theo.

## 17. Sẵn Sàng Cho Giai Đoạn Tiếp Theo

Backend đã sẵn sàng làm origin cho tầng phân phối tiếp theo.

Hướng triển khai tiếp theo:

```text
S3 Private Frontend
        |
        v
CloudFront
        |
        |-- /*       -> S3 Frontend
        |-- /api/*   -> EC2 Backend
        |-- /ws/*    -> EC2 Backend
        `-- /health  -> EC2 Backend
```

Trạng thái chuyển giai đoạn:

```text
PHASE 4 COMPLETED
READY FOR PHASE 5
```
