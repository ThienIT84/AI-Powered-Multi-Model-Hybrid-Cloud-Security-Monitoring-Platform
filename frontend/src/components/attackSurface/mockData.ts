import { AssetNode, AttackPath, CorrelationItem, AwsServiceItem } from "./types";

export const INITIAL_ASSETS: AssetNode[] = [
  {
    id: "pfsense-fw",
    name: "pfSense Gateway Firewall",
    type: "Firewall Gateway",
    location: "pfSense",
    riskScore: 24,
    exposureScore: 18,
    exposureLevel: "Low",
    connections: 18450,
    lastAlert: "SPIKE IN PACKETS BLOCKED",
    aiRiskScore: 21,
    ip: "10.0.0.1",
    environment: "Hybrid Gateway Node",
    service: "NAT & Packet Filtering",
    owner: "Infra-Sec Team",
    topServices: [
      { service: "HTTPS Admin", count: 8400, proto: "TCP" },
      { service: "DNS Forwarder", count: 3200, proto: "UDP" },
      { service: "IPsec Tunnel", count: 850, proto: "UDP" },
    ],
    suricataAlerts: [
      { sigId: "SURICATA-200192", category: "Network Sweep Detection", severity: "Low", time: "2 min ago" }
    ],
    aiFindings: { aiMin: "No Anomaly detected", fusion: "Secure Tunneling Established" },
    mitre: ["T1046"]
  },
  {
    id: "web-server-01",
    name: "web-frontend-01",
    type: "Web Server",
    location: "DMZ",
    riskScore: 92,
    exposureScore: 95,
    exposureLevel: "Critical",
    connections: 8420,
    lastAlert: "EXPLOIT INBOUND PAYLOAD (XSS)",
    aiRiskScore: 97,
    ip: "192.168.10.15",
    environment: "Production-DMZ",
    service: "Client Web Dashboard",
    owner: "E-Commerce Web Ops",
    topServices: [
      { service: "HTTP (80)", count: 7200, proto: "TCP" },
      { service: "HTTPS (443)", count: 1220, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-201831", category: "Cross Site Scripting Attempt", severity: "High", time: "12 sec ago" },
      { sigId: "SURICATA-201835", category: "Inbound Command Injection Attempt", severity: "Critical", time: "1 min ago" }
    ],
    aiFindings: { aiMin: "Anomaly (AI1)", aiHTTP: "XSS Detected (97% via AI2B)", fusion: "Fusion: High Risk Web Attack Exposure" },
    mitre: ["T1190", "T1059", "T1566"]
  },
  {
    id: "api-gateway-02",
    name: "api-gateway-02",
    type: "API Gateway",
    location: "DMZ",
    riskScore: 85,
    exposureScore: 88,
    exposureLevel: "High",
    connections: 11200,
    lastAlert: "ABNORMAL REQUEST BURST",
    aiRiskScore: 91,
    ip: "192.168.10.20",
    environment: "Production-DMZ",
    service: "Customer REST Integrates",
    owner: "Integration API Team",
    topServices: [
      { service: "REST Gateway API", count: 11000, proto: "TCP" },
      { service: "gRPC Tunnel", count: 200, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-202281", category: "API Rate Limit Bypass", severity: "Medium", time: "45 sec ago" }
    ],
    aiFindings: { aiMin: "Anomaly (AI1: 92%)", aiClass: "Port Scan (91% via AI2A)", fusion: "Fusion: Escalated API Attack Probe" },
    mitre: ["T1110", "T1046", "T1190"]
  },
  {
    id: "public-dns",
    name: "public-bind-dns",
    type: "Public DNS",
    location: "DMZ",
    riskScore: 34,
    exposureScore: 30,
    exposureLevel: "Low",
    connections: 9200,
    lastAlert: "None Detected",
    aiRiskScore: 28,
    ip: "192.168.10.8",
    environment: "Production-DMZ Namespace",
    service: "BIND DNS Daemon",
    owner: "NetOps Core Team",
    topServices: [
      { service: "DNS Query (53)", count: 9150, proto: "UDP" },
      { service: "DNS Zone Transfer", count: 50, proto: "TCP" }
    ],
    suricataAlerts: [],
    aiFindings: { aiMin: "Normal Telemetry Status", fusion: "Secure" },
    mitre: []
  },
  {
    id: "app-server-core",
    name: "app-core-service",
    type: "App Server",
    location: "Internal Network",
    riskScore: 76,
    exposureScore: 71,
    exposureLevel: "High",
    connections: 4500,
    lastAlert: "DATABASE ACCESS PEAK",
    aiRiskScore: 73,
    ip: "10.100.1.12",
    environment: "Production-Internal Core",
    service: "Business Logic Engine",
    owner: "Core Backend Developers",
    topServices: [
      { service: "Java Microservice", count: 4200, proto: "TCP" },
      { service: "SSH Remote Control", count: 300, proto: "TCP" }
    ],
    suricataAlerts: [],
    aiFindings: { aiMin: "Lateral Probe Suspected", fusion: "Warning: Internal Pivot Path Identified" },
    mitre: ["T1059", "T1110"]
  },
  {
    id: "production-db",
    name: "production-sql-db",
    type: "Database Server",
    location: "Internal Network",
    riskScore: 55,
    exposureScore: 48,
    exposureLevel: "Medium",
    connections: 2800,
    lastAlert: "MULTIPLE SELECT ROWS",
    aiRiskScore: 45,
    ip: "10.100.2.14",
    environment: "Secure Storage Cluster",
    service: "Secure PostgreSQL Database",
    owner: "Database DBAs",
    topServices: [
      { service: "Database Query (5432)", count: 2800, proto: "TCP" }
    ],
    suricataAlerts: [],
    aiFindings: { aiMin: "Typical Query Engine Behavior", fusion: "Shielded Database Transactional Lane" },
    mitre: []
  },
  {
    id: "file-server-01",
    name: "storage-nas-01",
    type: "File Server",
    location: "Internal Network",
    riskScore: 28,
    exposureScore: 22,
    exposureLevel: "Low",
    connections: 1100,
    lastAlert: "No Alerts",
    aiRiskScore: 15,
    ip: "10.100.3.50",
    environment: "Internal LAN Storage",
    service: "Samba Share / Network storage",
    owner: "Internal IT Admins",
    topServices: [
      { service: "SMB Native protocol", count: 900, proto: "TCP" },
      { service: "NFS Export Daemon", count: 200, proto: "UDP" }
    ],
    suricataAlerts: [],
    aiFindings: { aiMin: "Baseline aligned", fusion: "Files Secure" },
    mitre: []
  },
  {
    id: "developer-workstation",
    name: "dev-workstation-99",
    type: "User Endpoint",
    location: "Internal Network",
    riskScore: 42,
    exposureScore: 45,
    exposureLevel: "Medium",
    connections: 750,
    lastAlert: "AD DECLASSIFIED CRED ACCESS",
    aiRiskScore: 48,
    ip: "10.200.5.99",
    environment: "Office Corporate LAN",
    service: "Corporate Dev Environment",
    owner: "Vulnerable Team Dev-Lead",
    topServices: [
      { service: "RDP Client Stream", count: 400, proto: "TCP" },
      { service: "LDAP Auth Queries", count: 350, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-201994", category: "Potential Credential Dumping", severity: "Medium", time: "4 mins ago" }
    ],
    aiFindings: { aiMin: "Suspicious Kerberos Activity (48%)", fusion: "Warning Exposure on Workstation" },
    mitre: ["T1110"]
  },
  {
    id: "ec2-microservice",
    name: "aws-ec2-gateway-cluster",
    type: "EC2 Instance",
    location: "AWS Cloud",
    riskScore: 82,
    exposureScore: 80,
    exposureLevel: "High",
    connections: 5400,
    lastAlert: "UNRECOGNIZED IP ATTEMPT",
    aiRiskScore: 80,
    ip: "172.31.2.45",
    environment: "AWS VPC us-east-1",
    service: "EKS Cluster Microservice",
    owner: "DevOps Cloud Admins",
    topServices: [
      { service: "Docker K8S Cluster API", count: 5100, proto: "TCP" },
      { service: "AWS Systems Manager", count: 300, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-280012", category: "Unknown Target Exploitation", severity: "High", time: "30 sec ago" }
    ],
    aiFindings: { aiMin: "Anomaly (84% via AI1)", fusion: "Elevated Risk on public Cloud Service" },
    mitre: ["T1190"]
  },
  {
    id: "rds-customer-db",
    name: "aws-rds-postgres",
    type: "RDS Database",
    location: "AWS Cloud",
    riskScore: 88,
    exposureScore: 89,
    exposureLevel: "High",
    connections: 4100,
    lastAlert: "EXTENSIVE OUTBOUND TRANSFER",
    aiRiskScore: 85,
    ip: "172.31.50.8",
    environment: "AWS VPC Secure Database Subnet",
    service: "Customer Profile Records Store",
    owner: "Cloud Database Ops Team",
    topServices: [
      { service: "PostgreSQL Secure Socket", count: 4100, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-201199", category: "Data Leakage Alert Blocked", severity: "High", time: "4 min ago" }
    ],
    aiFindings: { aiMin: "Anomaly Checked (AI1: 72%)", fusion: "High-Risk Data Extraction Suspected" },
    mitre: ["T1046", "T1110"]
  },
  {
    id: "s3-pii-records",
    name: "aws-s3-pii-records",
    type: "S3 Bucket",
    location: "AWS Cloud",
    riskScore: 94,
    exposureScore: 96,
    exposureLevel: "Critical",
    connections: 2310,
    lastAlert: "S3 Public Policy Detected",
    aiRiskScore: 95,
    ip: "s3-east-1.amazonaws.com/pii-client-bucket",
    environment: "AWS S3 Storage Global Tier",
    service: "Client Identity PII Cloud Drive",
    owner: "Cloud Security Compliance Auditor",
    topServices: [
      { service: "HTTPS Object API Session", count: 2310, proto: "TCP" }
    ],
    suricataAlerts: [
      { sigId: "SURICATA-201502", category: "Unauthenticated Bucket Access Pattern", severity: "Critical", time: "1 sec ago" }
    ],
    aiFindings: { aiMin: "Exposed S3 Policy Verified", fusion: "Critical: S3 Leak Threat Suspended" },
    mitre: ["T1190", "T1566"]
  },
  {
    id: "sqs-threat-queue",
    name: "aws-sqs-alert-queue",
    type: "SQS Queue",
    location: "AWS Cloud",
    riskScore: 15,
    exposureScore: 12,
    exposureLevel: "Low",
    connections: 1540,
    lastAlert: "No Alerts Pending",
    aiRiskScore: 10,
    ip: "sqs.us-east-1.amazonaws.com/alert-queue",
    environment: "AWS Simple Queue Service Node",
    service: "Asynchronous Threat Alert Backlog",
    owner: "SOC Engineering Team",
    topServices: [
      { service: "SQS SOAP/HTTPS Actions", count: 1540, proto: "TCP" }
    ],
    suricataAlerts: [],
    aiFindings: { aiMin: "Aligned with security baselines", fusion: "Clean" },
    mitre: []
  }
];

export const HARDCODED_ATTACK_PATHS: AttackPath[] = [
  {
    id: "path-1",
    name: "External Web Remote Code Execution (RCE) Corridor",
    description: "Multi-layered vulnerability sequence progressing from vulnerable public gateway layers, triggering XSS/RCE heuristics directly to Backend servers.",
    riskScore: 89,
    mitreMapping: ["T1190", "T1059", "T1046"],
    steps: [
      { nodeId: "pfsense-fw", label: "pfSense Gateway", vector: "Port Scan Heuristic", note: "Port 80/443 exposed, routing traffic directly inward." },
      { nodeId: "web-server-01", label: "web-frontend-01", vector: "XSS Filter Bypass", note: "Malicious payload accepted, feeding malicious inputs in JSON structure." },
      { nodeId: "app-server-core", label: "app-core-service", vector: "Command Injection", note: "Malicious parameter processed directly by deserialization routine." },
      { nodeId: "production-db", label: "production-sql-db", vector: "Privileged Execution", note: "Core admin credentials harvested, query execution successfully initialized." }
    ]
  },
  {
    id: "path-2",
    name: "Cloud Database API Leakage Route",
    description: "Public proxy attack exploiting API Rate limiting breaches and Suricata data transmission triggers to leak core information out via misconfigured cloud nodes.",
    riskScore: 84,
    mitreMapping: ["T1046", "T1110", "T1190"],
    steps: [
      { nodeId: "api-gateway-02", label: "api-gateway-02", vector: "API Rate limits breach", note: "Multiple endpoints enumeration via brute-force proxies." },
      { nodeId: "ec2-microservice", label: "aws-ec2-gateway-cluster", vector: "SSRF Exploit", note: "AWS instance metadata service requested, exposing credentials." },
      { nodeId: "rds-customer-db", label: "aws-rds-postgres", vector: "Unauthorized SELECT Extraction", note: "Large select loops dump patient table directly." },
      { nodeId: "s3-pii-records", label: "aws-s3-pii-records", vector: "Public Write S3 Policy", note: "Stolen records dumped into exposed bucket for raw extraction." }
    ]
  },
  {
    id: "path-3",
    name: "Corporate User Employee Phishing to Pivot",
    description: "Initial user endpoint compromise progressing via malicious email payload to exploit domain admin credentials and map local secure network mounts.",
    riskScore: 62,
    mitreMapping: ["T1566", "T1110"],
    steps: [
      { nodeId: "developer-workstation", label: "dev-workstation-99", vector: "Phishing Payload Execution", note: "Local developer triggers trojanized update file, establishing SSH reverses." },
      { nodeId: "file-server-01", label: "storage-nas-01", vector: "Active Directory Recon", note: "Samba mount analyzed, searching for unprotected credentials files." },
      { nodeId: "app-server-core", label: "app-core-service", vector: "SSO Admin Hijack", note: "Cached domain admin hashes reused to pivot onto secure applications backend." }
    ]
  }
];

export const INITIAL_CORRELATION: CorrelationItem[] = [
  {
    id: "corr-1",
    time: "10:09:45 AM",
    asset: "web-frontend-01",
    exposure: "Public HTTP (80) & HTTPS (443) Service Inbound",
    aiEvidence: "AI2B: Inbound XSS Identified (97.4% conf)",
    suricata: "SURICATA-201831: Cross Site Scripting Attempt Detected",
    fusionResult: "High Risk Fusion Alert: Active Web Attack Exposure",
    severity: "High"
  },
  {
    id: "corr-2",
    time: "10:08:12 AM",
    asset: "api-gateway-02",
    exposure: "External REST Customer Gateway Interface",
    aiEvidence: "AI1: Network Flow Anomaly Threshold Exceeded (92%)",
    suricata: "SURICATA-202281: API Speed Burst Triggered",
    fusionResult: "Fusion: Critical Multi-Model Security Ingress Warning",
    severity: "Critical"
  },
  {
    id: "corr-3",
    time: "10:05:30 AM",
    asset: "aws-s3-pii-records",
    exposure: "S3 Static Web Hosting Global Asset Storage",
    aiEvidence: "AI2B: Policy Leakage Detector Flagged",
    suricata: "SURICATA-201502: Unauthenticated Get Bucket Request",
    fusionResult: "Critical Fusion alert: Live PII Bucket Public Exposure",
    severity: "Critical"
  },
  {
    id: "corr-4",
    time: "09:59:12 AM",
    asset: "aws-ec2-gateway-cluster",
    exposure: "K8S Microservice Public Load Balancer Cluster",
    aiEvidence: "AI2A: Port Scan Alert flagged (91%)",
    suricata: "SURICATA-280012: Unknown Packet Signature Met",
    fusionResult: "Fusion: Elevated Exposure Status Logged",
    severity: "High"
  },
  {
    id: "corr-5",
    time: "09:48:20 AM",
    asset: "dev-workstation-99",
    exposure: "Corporate Active Directory Enduser Terminal",
    aiEvidence: "AI1: Non-Standard Login Timing Identified (48%)",
    suricata: "SURICATA-201994: High LDAP Lookup Rate Flagged",
    fusionResult: "Fusion: Warning: Potential Lateral Workstation Compromise",
    severity: "Medium"
  }
];

export const EXPOSURE_DONUT_DATA = [
  { name: "Web Applications", value: 4, score: 94, pct: "28%", fill: "#EF4444" },
  { name: "API Endpoints",   value: 5, score: 85, pct: "18%", fill: "#F97316" },
  { name: "Cloud Assets",     value: 6, score: 82, pct: "19%", fill: "#EAB308" },
  { name: "Secure Databases", value: 3, score: 78, pct: "15%", fill: "#3b82f6" },
  { name: "Endpoint Services",value: 8, score: 60, pct: "12%", fill: "#22C55E" },
  { name: "Samba/External",   value: 3, score: 40, pct: "8%",  fill: "#38BDF8" }
];

export const ANALYTICS_TRENDS = {
  "24H": [
    { time: "00:00", totalExposure: 65, criticalAssets: 21, attackPaths: 16, avgRisk: 61 },
    { time: "04:00", totalExposure: 66, criticalAssets: 22, attackPaths: 17, avgRisk: 63 },
    { time: "08:00", totalExposure: 68, criticalAssets: 24, attackPaths: 18, avgRisk: 67 },
    { time: "12:00", totalExposure: 67, criticalAssets: 23, attackPaths: 18, avgRisk: 66 },
    { time: "16:00", totalExposure: 65, criticalAssets: 22, attackPaths: 17, avgRisk: 65 },
    { time: "20:00", totalExposure: 64, criticalAssets: 21, attackPaths: 16, avgRisk: 62 },
  ],
  "7D": [
    { time: "Mon", totalExposure: 62, criticalAssets: 19, attackPaths: 14, avgRisk: 58 },
    { time: "Tue", totalExposure: 64, criticalAssets: 20, attackPaths: 15, avgRisk: 60 },
    { time: "Wed", totalExposure: 67, criticalAssets: 24, attackPaths: 18, avgRisk: 67 },
    { time: "Thu", totalExposure: 65, criticalAssets: 22, attackPaths: 17, avgRisk: 64 },
    { time: "Fri", totalExposure: 63, criticalAssets: 21, attackPaths: 16, avgRisk: 62 },
    { time: "Sat", totalExposure: 61, criticalAssets: 18, attackPaths: 13, avgRisk: 59 },
    { time: "Sun", totalExposure: 59, criticalAssets: 17, attackPaths: 12, avgRisk: 57 },
  ],
  "30D": [
    { time: "Day 3",  totalExposure: 60, criticalAssets: 18, attackPaths: 13, avgRisk: 59 },
    { time: "Day 6",  totalExposure: 61, criticalAssets: 19, attackPaths: 14, avgRisk: 61 },
    { time: "Day 9",  totalExposure: 63, criticalAssets: 20, attackPaths: 15, avgRisk: 63 },
    { time: "Day 12", totalExposure: 66, criticalAssets: 23, attackPaths: 17, avgRisk: 65 },
    { time: "Day 15", totalExposure: 68, criticalAssets: 25, attackPaths: 19, avgRisk: 68 },
    { time: "Day 18", totalExposure: 67, criticalAssets: 24, attackPaths: 18, avgRisk: 67 },
    { time: "Day 21", totalExposure: 65, criticalAssets: 22, attackPaths: 17, avgRisk: 64 },
    { time: "Day 24", totalExposure: 63, criticalAssets: 21, attackPaths: 15, avgRisk: 62 },
    { time: "Day 27", totalExposure: 66, criticalAssets: 23, attackPaths: 18, avgRisk: 65 },
    { time: "Day 30", totalExposure: 67, criticalAssets: 24, attackPaths: 18, avgRisk: 67 },
  ],
  "90D": [
    { time: "Wk 1", totalExposure: 58, criticalAssets: 16, attackPaths: 11, avgRisk: 55 },
    { time: "Wk 2", totalExposure: 60, criticalAssets: 18, attackPaths: 13, avgRisk: 58 },
    { time: "Wk 3", totalExposure: 62, criticalAssets: 20, attackPaths: 14, avgRisk: 61 },
    { time: "Wk 4", totalExposure: 65, criticalAssets: 22, attackPaths: 16, avgRisk: 63 },
    { time: "Wk 5", totalExposure: 68, criticalAssets: 25, attackPaths: 19, avgRisk: 68 },
    { time: "Wk 6", totalExposure: 66, criticalAssets: 23, attackPaths: 17, avgRisk: 65 },
    { time: "Wk 7", totalExposure: 64, criticalAssets: 21, attackPaths: 15, avgRisk: 62 },
    { time: "Wk 8", totalExposure: 61, criticalAssets: 19, attackPaths: 13, avgRisk: 59 },
    { time: "Wk 9", totalExposure: 63, criticalAssets: 21, attackPaths: 16, avgRisk: 62 },
    { time: "Wk 10",totalExposure: 65, criticalAssets: 23, attackPaths: 18, avgRisk: 64 },
    { time: "Wk 11",totalExposure: 67, criticalAssets: 24, attackPaths: 18, avgRisk: 67 },
    { time: "Wk 12",totalExposure: 68, criticalAssets: 24, attackPaths: 18, avgRisk: 68 },
  ]
};

export const INITIAL_AWS_SERVICES: AwsServiceItem[] = [
  {
    name: "EC2 Cloud Elastic Gateway",
    id: "ec2",
    monitored: "12 Instances monitored",
    exposureScore: 80,
    riskLevel: "High",
    recentAlerts: "Port Scan Payload Blocked",
    pct: 80,
    color: "text-amber-500",
    border: "border-amber-500/20"
  },
  {
    name: "RDS Relational Database Server",
    id: "rds",
    monitored: "4 Databases monitored",
    exposureScore: 89,
    riskLevel: "High",
    recentAlerts: "Outbound Leakage Blocked",
    pct: 89,
    color: "text-orange-500",
    border: "border-orange-500/20"
  },
  {
    name: "S3 Encryption Storage Bucket",
    id: "s3",
    monitored: "18 Buckets monitored",
    exposureScore: 94,
    riskLevel: "Critical",
    recentAlerts: "PII bucket policy exposed",
    pct: 94,
    color: "text-red-500",
    border: "border-red-500/20"
  },
  {
    name: "SQS Distributed Alert Queues",
    id: "sqs",
    monitored: "6 Queues monitored",
    exposureScore: 12,
    riskLevel: "Low",
    recentAlerts: "No Pending threat reports",
    pct: 12,
    color: "text-emerald-500",
    border: "border-emerald-500/20"
  }
];

export const STREAM_POOL = [
  {
    asset: "web-frontend-01",
    exposure: "Public HTTP (80) & HTTPS (443) Service Inbound",
    aiEvidence: "AI2B: Reflected XSS Script Flagged (98%)",
    suricata: "SURICATA-201831: Cross Site Scripting Attempt Detected",
    fusionResult: "High Risk Fusion Alert: Multi-Stage exploit blocked",
    severity: "High" as const
  },
  {
    asset: "api-gateway-02",
    exposure: "External REST Customer Gateway Interface",
    aiEvidence: "AI1: Malformed Json Payload Structure Trigger",
    suricata: "No Alert Detected",
    fusionResult: "Fusion: API Heuristic Flagged as Compromised Ingress",
    severity: "High" as const
  },
  {
    asset: "aws-ec2-gateway-cluster",
    exposure: "K8S Microservice Public Load Balancer Cluster",
    aiEvidence: "AI2A: Network Probe Signature detected (94%)",
    suricata: "SURICATA-280012: Unknown Malicious Shell Shock payload",
    fusionResult: "Fusion: Critical Cloud Workload Command Abuse Detected",
    severity: "Critical" as const
  },
  {
    asset: "web-frontend-01",
    exposure: "Public HTTP API Router Web Proxy",
    aiEvidence: "AI2B: Semantic SQL bypass string mapped (89%)",
    suricata: "SURICATA-201991: SQL SELECT Statement mapped in URL",
    fusionResult: "High Risk Fusion Alert: Web Application Injection Attack",
    severity: "High" as const
  },
  {
    asset: "dev-workstation-99",
    exposure: "Internal Workstation VLAN User Gateway",
    aiEvidence: "AI1: Lateral AD Lookup Heuristics spike (85%)",
    suricata: "No Alert Detected",
    fusionResult: "Fusion: Escalated Local User Privileges Suspected",
    severity: "Medium" as const
  },
  {
    asset: "production-sql-db",
    exposure: "Secure Postgres Cluster Inbound SQL Port",
    aiEvidence: "AI1: Query response packet size abnormal check",
    suricata: "SURICATA-201199: Large Byte Database Leak Alert",
    fusionResult: "Critical Multi-Model Fusion: Mass Data Exfiltration Attempt",
    severity: "Critical" as const
  }
];
