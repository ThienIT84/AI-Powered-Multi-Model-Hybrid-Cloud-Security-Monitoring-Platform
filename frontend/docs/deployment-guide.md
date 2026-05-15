# Deployment Guide

## Overview

This guide covers the deployment process for the Hybrid SOC Dashboard frontend, including Docker containerization, production builds, and infrastructure setup.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- AWS CLI (for CloudWatch integration)
- GitHub repository access

## Local Development

### Setup
```bash
# Clone repository
git clone <repository-url>
cd soc-dashboard

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```bash
# .env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_CLOUDWATCH_LOG_GROUP=soc-dashboard-logs
```

## Docker Deployment

### Build Docker Image
```bash
# Build production image
docker build -t soc-dashboard:latest .

# Or build with specific tag
docker build -t soc-dashboard:v1.0.0 .
```

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_WS_URL=http://backend:8000
    depends_on:
      - backend
    networks:
      - soc-network
    restart: unless-stopped

  backend:
    image: your-backend-image:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/soc_db
    depends_on:
      - db
    networks:
      - soc-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=soc_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - soc-network

networks:
  soc-network:
    driver: bridge

volumes:
  postgres_data:
```

### Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Production Deployment

### AWS ECS Deployment

#### 1. Create ECR Repository
```bash
# Create ECR repository
aws ecr create-repository --repository-name soc-dashboard --region us-east-1

# Get repository URI
aws ecr describe-repositories --repository-names soc-dashboard
```

#### 2. Build and Push Image
```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag soc-dashboard:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/soc-dashboard:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/soc-dashboard:latest
```

#### 3. Create ECS Task Definition
```json
{
  "family": "soc-dashboard",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/soc-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_API_URL",
          "value": "https://api.yourdomain.com"
        },
        {
          "name": "VITE_WS_URL",
          "value": "wss://api.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/soc-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4. Create ECS Service
```bash
# Create service
aws ecs create-service \
  --cluster soc-cluster \
  --service-name soc-dashboard-service \
  --task-definition soc-dashboard \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Nginx Configuration

#### Reverse Proxy Setup
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    # SSL configuration (recommended)
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass https://api.yourdomain.com/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass https://api.yourdomain.com/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;
}
```

### Environment Variables for Production

#### Runtime Configuration
```bash
# Production environment variables
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your-production-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-production-secret-key
VITE_CLOUDWATCH_LOG_GROUP=/aws/soc-dashboard/production
VITE_APP_ENV=production
```

#### Build-time Configuration
```bash
# Build arguments for Docker
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_WS_URL=wss://api.yourdomain.com \
  -t soc-dashboard:latest .
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: soc-dashboard
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

    - name: Update ECS service
      run: |
        aws ecs update-service \
          --cluster soc-cluster \
          --service soc-dashboard-service \
          --force-new-deployment \
          --task-definition soc-dashboard
```

## Monitoring and Logging

### CloudWatch Setup

#### 1. Create Log Group
```bash
aws logs create-log-group --log-group-name /aws/soc-dashboard/production
```

#### 2. Configure Application Logging
```typescript
// src/utils/logger.ts
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs'

const cloudwatch = new CloudWatchLogsClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
})

export const logToCloudWatch = async (message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') => {
  const params = {
    logGroupName: import.meta.env.VITE_CLOUDWATCH_LOG_GROUP,
    logStreamName: `frontend-${Date.now()}`,
    logEvents: [
      {
        message: `[${level}] ${message}`,
        timestamp: Date.now()
      }
    ]
  }

  try {
    await cloudwatch.send(new PutLogEventsCommand(params))
  } catch (error) {
    console.error('Failed to log to CloudWatch:', error)
  }
}
```

#### 3. Error Tracking
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  logToCloudWatch(`JavaScript Error: ${event.error}`, 'ERROR')
})

// React error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logToCloudWatch(`React Error: ${error.message}\n${errorInfo.componentStack}`, 'ERROR')
  }
}
```

### Performance Monitoring

#### Real User Monitoring (RUM)
```typescript
// src/utils/performance.ts
export const trackPerformance = () => {
  // Track Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }

  // Track custom metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        logToCloudWatch(`Performance: ${entry.name} - ${entry.duration}ms`)
      }
    }
  })

  observer.observe({ entryTypes: ['measure'] })
}
```

## Scaling

### Horizontal Scaling
```yaml
# ECS service configuration for scaling
services:
  frontend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Load Balancing
```hcl
# Terraform configuration for ALB
resource "aws_lb" "soc_dashboard" {
  name               = "soc-dashboard-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public.*.id
}

resource "aws_lb_target_group" "frontend" {
  name        = "soc-dashboard-frontend"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}
```

## Backup and Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="soc_dashboard_backup_$DATE.sql"

docker exec soc_dashboard_db pg_dump -U user soc_db > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://soc-dashboard-backups/

# Clean up old backups (keep last 30 days)
aws s3 ls s3://soc-dashboard-backups/ | while read -r line; do
  createDate=`echo $line | awk {'print $1" "$2'}`
  createDate=`date -d"$createDate" +%s`
  olderThan=`date -d'30 days ago' +%s`
  if [[ $createDate -lt $olderThan ]]; then
    fileName=`echo $line | awk {'print $4'}`
    if [[ $fileName != "" ]]; then
      aws s3 rm s3://soc-dashboard-backups/$fileName
    fi
  fi
done
```

### Disaster Recovery
```yaml
# docker-compose.override.yml for DR
version: '3.8'

services:
  frontend:
    environment:
      - VITE_API_URL=https://dr-api.yourdomain.com
      - VITE_WS_URL=wss://dr-api.yourdomain.com
    networks:
      - dr-network

  db:
    volumes:
      - dr_postgres_data:/var/lib/postgresql/data
```

## Security

### SSL/TLS Configuration
```nginx
# SSL configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

### Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Container Security
```dockerfile
# Use non-root user
FROM nginx:alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy files with correct permissions
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next

USER nextjs
```

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Issues
```bash
# Check WebSocket connectivity
curl -I -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" -H "Sec-WebSocket-Version: 13" ws://localhost:8000/socket.io/
```

#### 2. Container Health Checks
```bash
# Check container logs
docker logs soc-dashboard-frontend

# Check container health
docker ps --filter "name=soc-dashboard"

# Restart unhealthy containers
docker-compose restart frontend
```

#### 3. Performance Issues
```bash
# Monitor resource usage
docker stats soc-dashboard-frontend

# Check nginx access logs
docker exec soc-dashboard-frontend tail -f /var/log/nginx/access.log

# Analyze bundle size
npm run build -- --analyze
```

### Debug Mode
```bash
# Run with debug logging
docker run -e DEBUG=* soc-dashboard:latest

# Enable React DevTools in production
if (process.env.NODE_ENV === 'development') {
  // Enable DevTools
}
```

## Maintenance

### Regular Tasks
- Update Docker images monthly
- Rotate SSL certificates
- Review and update dependencies
- Monitor performance metrics
- Backup verification

### Emergency Procedures
1. Check system status dashboard
2. Review error logs in CloudWatch
3. Scale up resources if needed
4. Rollback to previous version if necessary
5. Notify stakeholders

This deployment guide provides a comprehensive setup for production deployment of the Hybrid SOC Dashboard. Adjust configurations based on your specific infrastructure requirements and security policies.