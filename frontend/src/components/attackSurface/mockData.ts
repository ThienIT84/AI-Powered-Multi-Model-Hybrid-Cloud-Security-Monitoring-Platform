import { Asset, CloudResource, ZeekConnection } from "./types";

export const MOCK_ZEEK_CONNECTIONS: Record<string, ZeekConnection[]> = {
  "pfsense-gateway": [
    { timestamp: "14:00:15", protocol: "UDP", service: "DNS", destPort: 53, bytes: 142, state: "SF" },
    { timestamp: "13:58:40", protocol: "TCP", service: "HTTPS", destPort: 443, bytes: 4096, state: "SF" },
    { timestamp: "13:52:11", protocol: "UDP", service: "IPsec", destPort: 500, bytes: 84501, state: "S0" }
  ],
  "web-frontend-01": [
    { timestamp: "14:00:38", protocol: "TCP", service: "HTTP", destPort: 80, bytes: 1840, state: "SF" },
    { timestamp: "14:00:30", protocol: "TCP", service: "HTTPS", destPort: 443, bytes: 12500, state: "SF" },
    { timestamp: "13:59:15", protocol: "TCP", service: "HTTP", destPort: 80, bytes: 430, state: "RSTR" }
  ],
  "api-gateway-02": [
    { timestamp: "14:00:22", protocol: "TCP", service: "gRPC", destPort: 50051, bytes: 9320, state: "SF" },
    { timestamp: "13:59:02", protocol: "TCP", service: "REST", destPort: 8080, bytes: 312000, state: "SF" }
  ],
  "public-bind-dns": [
    { timestamp: "14:00:05", protocol: "UDP", service: "DNS", destPort: 53, bytes: 96, state: "SF" },
    { timestamp: "13:57:42", protocol: "UDP", service: "DNS", destPort: 53, bytes: 124, state: "SF" }
  ],
  "core-db-server": [
    { timestamp: "13:55:12", protocol: "TCP", service: "PostgreSQL", destPort: 5432, bytes: 44102, state: "SF" },
    { timestamp: "13:51:30", protocol: "TCP", service: "SSH", destPort: 22, bytes: 4800, state: "SF" }
  ],
  "corp-desktop-99": [
    { timestamp: "13:48:19", protocol: "TCP", service: "RDP", destPort: 3389, bytes: 20950, state: "S1" },
    { timestamp: "13:42:15", protocol: "TCP", service: "WinRM", destPort: 5985, bytes: 1205, state: "SF" }
  ],
  "storage-nas-01": [
    { timestamp: "13:59:00", protocol: "TCP", service: "SMB", destPort: 445, bytes: 13589000, state: "SF" }
  ],
  "aws-ec2-gateway": [
    { timestamp: "14:00:10", protocol: "TCP", service: "Docker API", destPort: 2375, bytes: 4200, state: "SF" },
    { timestamp: "13:56:45", protocol: "TCP", service: "SSH", destPort: 22, bytes: 3200, state: "SF" }
  ],
  "aws-rds-postgres": [
    { timestamp: "13:59:45", protocol: "TCP", service: "PostgreSQL Sec", destPort: 5432, bytes: 102550, state: "SF" }
  ],
  "aws-s3-pii-records": [
    { timestamp: "14:00:39", protocol: "TCP", service: "HTTPS Object API", destPort: 443, bytes: 3410, state: "SF" }
  ],
  "aws-sqs-alert-queue": [
    { timestamp: "13:45:10", protocol: "TCP", service: "HTTPS SOAP", destPort: 443, bytes: 904, state: "SF" }
  ]
};

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "pfsense-gateway",
    hostname: "pfSense Firewall",
    ip: "10.0.0.1",
    zone: "On-Prem",
    type: "Network Device",
    owner: "NetOps Team",
    status: "Normal",
    riskScore: 24,
    openAlerts: 0,
    lastSeen: "2 min ago",
    services: ["NAT Engine", "DNS Forwarder", "IPsec Tunnel"],
    ports: [53, 443, 500, 4500],
    connections: MOCK_ZEEK_CONNECTIONS["pfsense-gateway"] || []
  },
  {
    id: "web-frontend-01",
    hostname: "web-frontend-01",
    ip: "192.168.10.15",
    zone: "DMZ",
    type: "Web Server",
    owner: "Web Ops",
    status: "Critical",
    riskScore: 92,
    openAlerts: 3,
    lastSeen: "12 sec ago",
    services: ["Nginx HTTP", "NodeJS HTTPS"],
    ports: [80, 443],
    connections: MOCK_ZEEK_CONNECTIONS["web-frontend-01"] || []
  },
  {
    id: "api-gateway-02",
    hostname: "api-gateway-02",
    ip: "192.168.10.20",
    zone: "DMZ",
    type: "API Service",
    owner: "Integration Team",
    status: "Warning",
    riskScore: 85,
    openAlerts: 2,
    lastSeen: "45 sec ago",
    services: ["REST Gateway API", "gRPC Microservice"],
    ports: [8080, 50051],
    connections: MOCK_ZEEK_CONNECTIONS["api-gateway-02"] || []
  },
  {
    id: "public-bind-dns",
    hostname: "public-bind-dns",
    ip: "192.168.10.8",
    zone: "DMZ",
    type: "Network Device",
    owner: "Core Infra",
    status: "Normal",
    riskScore: 28,
    openAlerts: 0,
    lastSeen: "1 min ago",
    services: ["BIND9 Daemon"],
    ports: [53],
    connections: MOCK_ZEEK_CONNECTIONS["public-bind-dns"] || []
  },
  {
    id: "core-db-server",
    hostname: "core-sql-db-server",
    ip: "10.100.2.14",
    zone: "Internal Network",
    type: "Database Server",
    owner: "DBA Team",
    status: "Warning",
    riskScore: 55,
    openAlerts: 1,
    lastSeen: "5 min ago",
    services: ["PostgreSQL Engine"],
    ports: [5432],
    connections: MOCK_ZEEK_CONNECTIONS["core-db-server"] || []
  },
  {
    id: "corp-desktop-99",
    hostname: "corp-desktop-99",
    ip: "10.200.5.99",
    zone: "Internal Network",
    type: "Endpoint",
    owner: "IT Support",
    status: "Warning",
    riskScore: 42,
    openAlerts: 1,
    lastSeen: "12 min ago",
    services: ["RDP Host", "WinRM Remote Exec"],
    ports: [3389, 5985],
    connections: MOCK_ZEEK_CONNECTIONS["corp-desktop-99"] || []
  },
  {
    id: "storage-nas-01",
    hostname: "storage-nas-01",
    ip: "10.100.3.50",
    zone: "Internal Network",
    type: "File Server",
    owner: "SysAdmins",
    status: "Normal",
    riskScore: 28,
    openAlerts: 0,
    lastSeen: "1 hour ago",
    services: ["Samba File Share", "NFS Storage"],
    ports: [139, 445, 2049],
    connections: MOCK_ZEEK_CONNECTIONS["storage-nas-01"] || []
  },
  {
    id: "aws-ec2-gateway",
    hostname: "aws-ec2-container-gw",
    ip: "172.31.2.45",
    zone: "AWS Cloud",
    type: "Web Server",
    owner: "Cloud Ops",
    status: "Warning",
    riskScore: 82,
    openAlerts: 2,
    lastSeen: "30 sec ago",
    services: ["Docker Daemon", "SSH Access"],
    ports: [22, 2375],
    connections: MOCK_ZEEK_CONNECTIONS["aws-ec2-gateway"] || []
  },
  {
    id: "aws-rds-postgres",
    hostname: "aws-rds-customer-postgres",
    ip: "172.31.50.8",
    zone: "AWS Cloud",
    type: "Database Server",
    owner: "Cloud DBA Ops",
    status: "Normal",
    riskScore: 48,
    openAlerts: 0,
    lastSeen: "4 min ago",
    services: ["RDS PostgreSQL"],
    ports: [5432],
    connections: MOCK_ZEEK_CONNECTIONS["aws-rds-postgres"] || []
  },
  {
    id: "aws-s3-pii-records",
    hostname: "aws-s3-pii-records",
    ip: "s3-east-1.amazonaws.com/pii-bucket",
    zone: "AWS Cloud",
    type: "Cloud Resource",
    owner: "S3 Custodians",
    status: "Critical",
    riskScore: 94,
    openAlerts: 4,
    lastSeen: "1 sec ago",
    services: ["S3 Object Storage"],
    ports: [443],
    connections: MOCK_ZEEK_CONNECTIONS["aws-s3-pii-records"] || []
  },
  {
    id: "aws-sqs-alert-queue",
    hostname: "aws-sqs-alerts",
    ip: "sqs.us-east-1.amazonaws.com/threat-queue",
    zone: "AWS Cloud",
    type: "Cloud Resource",
    owner: "SOC Tech",
    status: "Normal",
    riskScore: 12,
    openAlerts: 0,
    lastSeen: "15 min ago",
    services: ["SQS Queue Service"],
    ports: [443],
    connections: MOCK_ZEEK_CONNECTIONS["aws-sqs-alert-queue"] || []
  }
];

export const CLOUD_RESOURCES_MOCK: CloudResource[] = [
  { id: "res-1", name: "EC2 Core Container Gateways", type: "EC2", status: "Warning", region: "us-east-1", alerts: 2 },
  { id: "res-2", name: "RDS Customer Profile Database", type: "RDS", status: "Normal", region: "us-east-1", alerts: 0 },
  { id: "res-3", name: "S3 Patient PII Secure bucket", type: "S3", status: "Critical", region: "us-east-1", alerts: 4 },
  { id: "res-4", name: "SQS Alert Distributed Bus", type: "SQS", status: "Normal", region: "us-east-1", alerts: 0 },
  { id: "res-5", name: "IAM Administrator Groups Policy", type: "IAM", status: "Normal", region: "global", alerts: 0 }
];
