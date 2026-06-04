export type EndpointType = "EC2" | "VM" | "Container" | "IoT";
export type CloudProvider = "AWS" | "Azure" | "GCP";
export type EndpointStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "OFFLINE";
export type AgentStatus = "INSTALLED" | "OUTDATED" | "MISSING";

export interface NetworkFlow {
  protocol: string;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  direction: "INBOUND" | "OUTBOUND";
  bytes: number;
  timestamp: string;
}

export interface ThreatEvent {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  eventClass: string;
  description: string;
  timestamp: string;
  mitreTechId: string;
  mitreTechName: string;
  mitigated: boolean;
}

export interface EndpointAsset {
  id: string;
  hostname: string;
  ip: string;
  type: EndpointType;
  provider: CloudProvider;
  status: EndpointStatus;
  riskScore: number; // 0 - 100
  lastSeen: string;
  region: string;
  os: string;
  agentStatus: AgentStatus;
  agentVersion: string;
  cpuUsage: number;
  memUsage: number;
  macAddress: string;
  vpcId: string;
  anomalies: string[];
  mitreMapping: { id: string; name: string; phase: string }[];
  networkFlows: NetworkFlow[];
  threatHistory: ThreatEvent[];
  rawLogs: string[];
  trafficSparkline: number[]; // mini series
}

// Sparklines helper
const generateSparkline = (length = 10, seed = 50) => {
  let val = seed;
  const arr = [];
  for (let i = 0; i < length; i++) {
    val = Math.max(10, Math.min(100, val + (Math.random() - 0.5) * 15));
    arr.push(Math.round(val));
  }
  return arr;
};

export const MOCK_ENDPOINTS: EndpointAsset[] = [
  {
    id: "EP-AWS-7241",
    hostname: "prod-k8s-controller-01",
    ip: "10.150.12.8",
    type: "Container",
    provider: "AWS",
    status: "CRITICAL",
    riskScore: 88,
    lastSeen: "JUST NOW",
    region: "AP-Southeast-1",
    os: "Ubuntu 22.04.3 LTS (Kernel 5.15)",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 94,
    memUsage: 82,
    macAddress: "02:42:0a:96:0c:08",
    vpcId: "vpc-0a82fed29",
    anomalies: [
      "Suspicious system binary compilation detected in temp storage",
      "Lateral connections attempt to database subnet",
      "Abnormal DNS queries triggered towards unverified .onion zones"
    ],
    mitreMapping: [
      { id: "T1059", name: "Command and Scripting Interpreter", phase: "Execution" },
      { id: "T1071", name: "Application Layer Protocol", phase: "Command and Control" },
      { id: "T1210", name: "Exploitation of Remote Services", phase: "Lateral Movement" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "10.150.12.8", sourcePort: 49451, destIp: "185.112.14.88", destPort: 4444, direction: "OUTBOUND", bytes: 142401, timestamp: "2026-05-29T07:11:12Z" },
      { protocol: "TCP", sourceIp: "10.150.12.8", sourcePort: 8080, destIp: "10.150.92.14", destPort: 3306, direction: "OUTBOUND", bytes: 45012, timestamp: "2026-05-29T07:10:45Z" },
      { protocol: "UDP", sourceIp: "10.150.12.8", sourcePort: 53, destIp: "8.8.8.8", destPort: 53, direction: "OUTBOUND", bytes: 512, timestamp: "2026-05-29T07:09:01Z" },
      { protocol: "TCP", sourceIp: "192.168.1.100", sourcePort: 5410, destIp: "10.150.12.8", destPort: 443, direction: "INBOUND", bytes: 23110, timestamp: "2026-05-29T07:08:15Z" }
    ],
    threatHistory: [
      { id: "TH-804", severity: "CRITICAL", eventClass: "C2 Connection", description: "Established socket outbound to unauthorized command island", timestamp: "5M AGO", mitreTechId: "T1071", mitreTechName: "C2 Channels", mitigated: false },
      { id: "TH-801", severity: "HIGH", eventClass: "Binary Creation", description: "Created file /tmp/nc-static execution parameters logged", timestamp: "1H AGO", mitreTechId: "T1059", mitreTechName: "Execution", mitigated: true }
    ],
    rawLogs: [
      "[07:21:05] SEC_WATCH: outbound connection open [TCP] 10.150.12.8:49451 -> 185.112.14.88:4444",
      "[07:20:44] KERNEL: privilege change detected: uid=0(root) gid=0(root) mapped inside container",
      "[07:19:12] OS_AUDIT: file written at /tmp/nc-static with chmod +x triggers threat rule EP-401",
      "[07:15:22] SHELL: parent shell spawned from node environment: npx /bin/bash"
    ],
    trafficSparkline: [88, 92, 85, 90, 110, 142, 131, 155, 178, 192]
  },
  {
    id: "EP-GCP-0492",
    hostname: "gcp-api-server-prod",
    ip: "34.120.45.192",
    type: "VM",
    provider: "GCP",
    status: "WARNING",
    riskScore: 68,
    lastSeen: "2M AGO",
    region: "US-West-1",
    os: "Debian 12 Bookworm",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 45,
    memUsage: 61,
    macAddress: "42:01:0a:aa:00:03",
    vpcId: "gcp-prod-vpc-3",
    anomalies: [
      "Unusual burst of HTTP 401 and 403 responses outgoing to ingress gateway",
      "API peak usage outside typical business profiles"
    ],
    mitreMapping: [
      { id: "T1110", name: "Brute Force Attempt", phase: "Credential Access" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "34.120.45.192", sourcePort: 443, destIp: "123.4.52.1", destPort: 52109, direction: "INBOUND", bytes: 8490, timestamp: "2026-05-29T07:10:00Z" },
      { protocol: "TCP", sourceIp: "34.120.45.192", sourcePort: 22, destIp: "45.112.5.12", destPort: 49210, direction: "INBOUND", bytes: 4321, timestamp: "2026-05-29T07:05:01Z" }
    ],
    threatHistory: [
      { id: "TH-721", severity: "MEDIUM", eventClass: "Brute Force Audit", description: "IP 45.112.5.12 submitted 14 SSH credential failures in 60s", timestamp: "12M AGO", mitreTechId: "T1110", mitreTechName: "Brute Force", mitigated: false }
    ],
    rawLogs: [
      "[07:14:00] SSHD: failed password for root from 45.112.5.12 port 49210 ssh2",
      "[07:13:45] SSHD: failed password for admin from 45.112.5.12 port 49210 ssh2",
      "[07:12:30] NGX_ACCESS: 34.120.45.192 HTTP 403 /api/admin/identity_key mapped to agent"
    ],
    trafficSparkline: [40, 42, 48, 45, 52, 65, 80, 50, 48, 68]
  },
  {
    id: "EP-AZU-1082",
    hostname: "azu-sql-reconcile-0",
    ip: "10.40.1.15",
    type: "VM",
    provider: "Azure",
    status: "HEALTHY",
    riskScore: 12,
    lastSeen: "4M AGO",
    region: "EU-West-1",
    os: "Windows Server 2022 Core",
    agentStatus: "INSTALLED",
    agentVersion: "v4.1.9-stable",
    cpuUsage: 14,
    memUsage: 35,
    macAddress: "00:0d:3a:53:bb:ef",
    vpcId: "azu-vnet-reconcile",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:18:12] WIN_EVENT: security audit logged success code 4624 user_token System",
      "[07:10:00] AGENT_D: heartbeat broadcast successfully dispatched"
    ],
    trafficSparkline: [12, 14, 15, 11, 10, 15, 14, 12, 10, 12]
  },
  {
    id: "EP-AWS-0012",
    hostname: "aws-bastion-gateway",
    ip: "54.210.88.112",
    type: "EC2",
    provider: "AWS",
    status: "WARNING",
    riskScore: 55,
    lastSeen: "JUST NOW",
    region: "US-East-1",
    os: "Ubuntu 20.04 LTS",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 78,
    memUsage: 44,
    macAddress: "0e:b4:94:ab:c0:de",
    vpcId: "vpc-public-ingress",
    anomalies: ["Spike in inbound traffic volume on SSH port (22)"],
    mitreMapping: [
      { id: "T1078", name: "Valid Accounts Use", phase: "Defense Evasion" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "54.210.88.112", sourcePort: 22, destIp: "198.51.100.2", destPort: 50401, direction: "INBOUND", bytes: 152000, timestamp: "2026-05-29T07:22:00Z" }
    ],
    threatHistory: [
      { id: "TH-502", severity: "LOW", eventClass: "Ingress Peak", description: "SSH traffic volume from 198.51.100.2 exceeds benchmark limits", timestamp: "20M AGO", mitreTechId: "T1078", mitreTechName: "Valid Accounts", mitigated: true }
    ],
    rawLogs: [
      "[07:22:12] SSHD: lawful session opened for user trans.phu from 198.51.100.2",
      "[07:05:00] AGENT: performance logs metric pushed: cpu=78% ram=44%"
    ],
    trafficSparkline: [20, 25, 30, 40, 55, 60, 48, 52, 55, 55]
  },
  {
    id: "EP-IOT-5021",
    hostname: "apac-smart-gateway-c8",
    ip: "192.168.120.4",
    type: "IoT",
    provider: "AWS",
    status: "OFFLINE",
    riskScore: 0,
    lastSeen: "24H AGO",
    region: "AP-Southeast-1",
    os: "Yocto Project Embedded Linux",
    agentStatus: "MISSING",
    agentVersion: "n/a",
    cpuUsage: 0,
    memUsage: 0,
    macAddress: "b8:27:eb:d3:03:d9",
    vpcId: "n/a (Static Edge Office)",
    anomalies: ["Asset failed to handshake with telemetry controller"],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[2026-05-28 07:00:00] DISCONNECT: heartbeat timeout of absolute 600 seconds breached on cloud edge module."
    ],
    trafficSparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "EP-AWS-9124",
    hostname: "prod-db-replica-02",
    ip: "10.150.92.15",
    type: "Container",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 28,
    lastSeen: "JUST NOW",
    region: "AP-Southeast-1",
    os: "Amazon Linux 2023",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 42,
    memUsage: 79,
    macAddress: "02:42:0a:96:5c:0f",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [
      { protocol: "TCP", sourceIp: "10.150.12.8", sourcePort: 8080, destIp: "10.150.92.15", destPort: 3306, direction: "INBOUND", bytes: 14120, timestamp: "2026-05-29T07:22:15Z" }
    ],
    threatHistory: [],
    rawLogs: [
      "[07:22:15] MYSQL: query completed successfully query='SELECT counts FROM stats_cache'",
      "[07:15:00] CRON: flushed buffer cache structures internally safely"
    ],
    trafficSparkline: [22, 25, 28, 26, 30, 29, 28, 32, 27, 28]
  },
  {
    id: "EP-GCP-8831",
    hostname: "gcp-gpu-deeplearning-node01",
    ip: "34.140.12.55",
    type: "VM",
    provider: "GCP",
    status: "HEALTHY",
    riskScore: 15,
    lastSeen: "1M AGO",
    region: "AP-Northeast-1",
    os: "RedHat Enterprise Linux 9",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.0-stable",
    cpuUsage: 99,
    memUsage: 88,
    macAddress: "42:01:0a:fe:01:14",
    vpcId: "gcp-ai-vpc",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:21:02] NVIDIA_DRIVER: load average peaking 100% on tensor core units for batch training",
      "[07:15:01] AGENT: process reporting healthy metrics check active model weights validated"
    ],
    trafficSparkline: [12, 11, 15, 12, 13, 15, 14, 15, 15, 15]
  },
  {
    id: "EP-AZU-4432",
    hostname: "azu-ad-auth-sync",
    ip: "10.40.10.22",
    type: "VM",
    provider: "Azure",
    status: "CRITICAL",
    riskScore: 92,
    lastSeen: "JUST NOW",
    region: "EU-West-1",
    os: "Windows Server 2022 Core",
    agentStatus: "OUTDATED",
    agentVersion: "v3.9.5-legacy",
    cpuUsage: 89,
    memUsage: 94,
    macAddress: "00:0d:3a:94:cf:3a",
    vpcId: "azu-vnet-reconcile",
    anomalies: [
      "LSASS memory dump process spawned suspiciously",
      "Bulk export of active directory metadata triggered to unverified mount point"
    ],
    mitreMapping: [
      { id: "T1003", name: "OS Credential Dumping", phase: "Credential Access" },
      { id: "T1114", name: "Email Collection", phase: "Collection" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "10.40.10.22", sourcePort: 445, destIp: "10.40.100.41", destPort: 49120, direction: "OUTBOUND", bytes: 41249012, timestamp: "2026-05-29T07:21:10Z" }
    ],
    threatHistory: [
      { id: "TH-912", severity: "CRITICAL", eventClass: "LSASS Access", description: "Credential extraction logic pattern detected from lsass.exe process by unverified administrative script", timestamp: "2M AGO", mitreTechId: "T1003", mitreTechName: "Credential Dumping", mitigated: false }
    ],
    rawLogs: [
      "[07:21:30] SYS_EVENT: process rundll32.exe initialized with target C:\\Windows\\System32\\comsvcs.dll, MiniDump lsass memory logs",
      "[07:20:01] AGENT: warning outdated agent logic: v3.9.5-legacy doesn't deploy zero-day bypass memory protection guards"
    ],
    trafficSparkline: [40, 48, 50, 62, 75, 82, 90, 89, 91, 92]
  },
  {
    id: "EP-AWS-7721",
    hostname: "vpc-traffic-mirror-endpoint",
    ip: "10.150.1.41",
    type: "EC2",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 5,
    lastSeen: "5M AGO",
    region: "US-West-1",
    os: "Amazon Linux 2",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 8,
    memUsage: 12,
    macAddress: "02:ab:f1:22:8a:c0",
    vpcId: "vpc-mirroring-system",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:15:00] SYS: Mirroring driver receiving logs packets without memory overflow drops."
    ],
    trafficSparkline: [5, 4, 3, 5, 5, 5, 4, 5, 5, 5]
  },
  {
    id: "EP-CON-3042",
    hostname: "k8s-ingress-nginx-ingress",
    ip: "10.150.12.92",
    type: "Container",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 35,
    lastSeen: "JUST NOW",
    region: "AP-Southeast-1",
    os: "Alpine Linux 3.19",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 36,
    memUsage: 54,
    macAddress: "02:42:0a:96:bc:fc",
    vpcId: "vpc-0a82fed29",
    anomalies: ["High rate of HTTP 500 error responses globally during past 10 minutes"],
    mitreMapping: [
      { id: "T1499", name: "Endpoint Denial of Service", phase: "Impact" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "192.168.12.1", sourcePort: 52109, destIp: "10.150.12.92", destPort: 443, direction: "INBOUND", bytes: 49102, timestamp: "2026-05-29T07:22:15Z" }
    ],
    threatHistory: [],
    rawLogs: [
      "[07:22:15] NGINX_ACCESS: upstream dispatch timeout mapping to backend system cluster IP 10.150.12.8:8080",
      "[07:18:22] AGENT: traffic limits standard threshold alert loaded."
    ],
    trafficSparkline: [25, 30, 22, 45, 32, 34, 40, 31, 33, 35]
  },
  {
    id: "EP-AWS-0481",
    hostname: "aws-redis-caches-01",
    ip: "10.150.15.5",
    type: "Container",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 18,
    lastSeen: "12M AGO",
    region: "AP-Southeast-1",
    os: "Ubuntu 22.04 LTS",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 19,
    memUsage: 89,
    macAddress: "02:42:0a:96:ff:c8",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:10:00] REDIS: system allocated 412 MB of RAM, active clients connections database verified"
    ],
    trafficSparkline: [12, 14, 18, 15, 17, 19, 15, 20, 19, 18]
  },
  {
    id: "EP-AZU-7248",
    hostname: "azu-vpn-gateway-prod",
    ip: "102.40.85.12",
    type: "VM",
    provider: "Azure",
    status: "WARNING",
    riskScore: 61,
    lastSeen: "1M AGO",
    region: "US-East-1",
    os: "Alpine Embedded kernel VM",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 54,
    memUsage: 61,
    macAddress: "00:0d:3a:ec:df:99",
    vpcId: "azu-vnet-core",
    anomalies: ["Vpn access key rotation overdue on user accounts"],
    mitreMapping: [
      { id: "T1133", name: "External Remote Services", phase: "Initial Access" }
    ],
    networkFlows: [
      { protocol: "UDP", sourceIp: "102.40.85.12", sourcePort: 1194, destIp: "198.51.100.12", destPort: 52145, direction: "INBOUND", bytes: 124090, timestamp: "2026-05-29T07:21:40Z" }
    ],
    threatHistory: [
      { id: "TH-302", severity: "MEDIUM", eventClass: "Bypassed Authentication", description: "Established remote session tunnel with expired token", timestamp: "1H AGO", mitreTechId: "T1133", mitreTechName: "External Services", mitigated: false }
    ],
    rawLogs: [
      "[07:21:00] OpenVPN: peer connection initiated from 198.51.100.12 on protocol UDP",
      "[07:10:15] OpenVPN: account user_prod_01 verified via SAML callback integration"
    ],
    trafficSparkline: [50, 52, 55, 62, 60, 55, 59, 61, 60, 61]
  },
  {
    id: "EP-GCP-1102",
    hostname: "gcp-elk-logging-node01",
    ip: "10.40.8.100",
    type: "VM",
    provider: "GCP",
    status: "HEALTHY",
    riskScore: 22,
    lastSeen: "JUST NOW",
    region: "US-West-1",
    os: "Rocky Linux 9",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 68,
    memUsage: 91,
    macAddress: "42:01:0a:fe:92:ba",
    vpcId: "gcp-mgmt-vpc",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:22:00] ELASTIC: indexing index-logs-soc-2026-05-29 successfully at 10,400 doc/sec"
    ],
    trafficSparkline: [20, 22, 21, 25, 23, 22, 24, 23, 22, 22]
  },
  {
    id: "EP-IOT-4091",
    hostname: "eu-smart-gateway-01",
    ip: "192.168.150.12",
    type: "IoT",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 40,
    lastSeen: "8M AGO",
    region: "EU-West-1",
    os: "Yocto Embedded Linux",
    agentStatus: "INSTALLED",
    agentVersion: "v4.0.0-embedded",
    cpuUsage: 12,
    memUsage: 22,
    macAddress: "b8:27:eb:fa:40:91",
    vpcId: "n/a (Edge Office)",
    anomalies: ["Unusual timezone mismatch reported from NTP sync servers"],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:14:22] SYSLOG: timezone corrected sync NTP shift by -3600 seconds"
    ],
    trafficSparkline: [10, 20, 15, 30, 25, 41, 32, 28, 35, 40]
  },
  {
    id: "EP-AWS-1402",
    hostname: "prod-redis-replica-01",
    ip: "10.150.15.6",
    type: "Container",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 25,
    lastSeen: "JUST NOW",
    region: "AP-Southeast-1",
    os: "Ubuntu 22.04 LTS",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 14,
    memUsage: 78,
    macAddress: "02:42:0a:96:ff:c9",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:22:12] REDIS: sync cluster sequence complete with master 10.150.15.5"
    ],
    trafficSparkline: [15, 18, 20, 21, 24, 25, 23, 25, 26, 25]
  },
  {
    id: "EP-AZU-0248",
    hostname: "azu-win-ad-controller-02",
    ip: "10.40.10.23",
    type: "VM",
    provider: "Azure",
    status: "HEALTHY",
    riskScore: 24,
    lastSeen: "3M AGO",
    region: "EU-West-1",
    os: "Windows Server 2022 Core",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 22,
    memUsage: 45,
    macAddress: "00:0d:3a:94:cf:3b",
    vpcId: "azu-vnet-reconcile",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:19:00] WIN_EVENT: synchronization protocol complete with master auth sync unit code 2101"
    ],
    trafficSparkline: [20, 22, 25, 21, 23, 24, 24, 22, 23, 24]
  },
  {
    id: "EP-AWS-8894",
    hostname: "prod-grafana-analytics",
    ip: "10.150.10.15",
    type: "VM",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 10,
    lastSeen: "Just Now",
    region: "AP-Southeast-1",
    os: "Ubuntu 22.04 LTS",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 12,
    memUsage: 35,
    macAddress: "02:ab:4a:d1:cc:94",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:22:00] GRAFANA: background caching complete for shared dashboards"
    ],
    trafficSparkline: [8, 9, 10, 11, 10, 10, 9, 10, 10, 10]
  },
  {
    id: "EP-GCP-1132",
    hostname: "gcp-prod-k8s-node-worker-9",
    ip: "10.40.2.19",
    type: "Container",
    provider: "GCP",
    status: "HEALTHY",
    riskScore: 32,
    lastSeen: "JUST NOW",
    region: "US-West-1",
    os: "Container-Optimized OS (GCP)",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 41,
    memUsage: 74,
    macAddress: "42:01:0a:fe:90:a9",
    vpcId: "gcp-prod-vpc-1",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:22:01] KUBELET: container pod 'ingress-proxy-cf210' status changed to active running"
    ],
    trafficSparkline: [25, 27, 29, 32, 31, 29, 30, 31, 32, 32]
  },
  {
    id: "EP-AWS-7110",
    hostname: "corporate-api-manager",
    ip: "172.16.8.10",
    type: "VM",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 15,
    lastSeen: "4M AGO",
    region: "US-East-1",
    os: "Amazon Linux 2",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 34,
    memUsage: 51,
    macAddress: "0a:fe:d1:fe:30:19",
    vpcId: "vpc-corp-management",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:18:00] HELM_D: auto synchronization triggers successfully on internal subnets cluster."
    ],
    trafficSparkline: [10, 12, 11, 14, 15, 12, 13, 15, 14, 15]
  },
  {
    id: "EP-AZU-9922",
    hostname: "azu-aks-ingress-portal",
    ip: "20.12.94.88",
    type: "Container",
    provider: "Azure",
    status: "HEALTHY",
    riskScore: 28,
    lastSeen: "2M AGO",
    region: "EU-West-1",
    os: "Alpine Linux 3.19",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 25,
    memUsage: 48,
    macAddress: "00:0d:3a:cc:b0:de",
    vpcId: "azu-vnet-k8s",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:20:00] INGRESS_NGX: successfully loaded standard TLS certificate context bindings."
    ],
    trafficSparkline: [20, 22, 25, 24, 28, 26, 27, 26, 28, 28]
  },
  {
    id: "EP-GCP-7744",
    hostname: "gcp-bi-warehouse-replica",
    ip: "10.40.15.90",
    type: "VM",
    provider: "GCP",
    status: "CRITICAL",
    riskScore: 81,
    lastSeen: "JUST NOW",
    region: "AP-Northeast-1",
    os: "CentOS Stream 9",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 89,
    memUsage: 92,
    macAddress: "42:01:0a:fe:cd:e5",
    vpcId: "gcp-bi-vpc",
    anomalies: [
      "Encrypted data container transfer to unauthenticated proxy client",
      "Process execution using hidden structures bypassed internal file audits"
    ],
    mitreMapping: [
      { id: "T1562", name: "Impair Defenses", phase: "Defense Evasion" },
      { id: "T1048", name: "Exfiltration Over Alternative Protocol", phase: "Exfiltration" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "10.40.15.90", sourcePort: 52109, destIp: "45.14.22.188", destPort: 443, direction: "OUTBOUND", bytes: 8490012, timestamp: "2026-05-29T07:22:00Z" }
    ],
    threatHistory: [
      { id: "TH-664", severity: "HIGH", eventClass: "Hidden Process Execution", description: "Launched system query helper inside isolated process context structure without audit trail logging matching rules", timestamp: "5M AGO", mitreTechId: "T1562", mitreTechName: "Impair Defenses", mitigated: false }
    ],
    rawLogs: [
      "[07:21:44] LIBAUDIT: security rule T1562 violation triggered: unauthorized hidden directory task called: /var/tmp/.secure_crypt",
      "[07:20:12] SYSTEM: socket telemetry upload dispatch initiated outwards safely."
    ],
    trafficSparkline: [50, 55, 62, 58, 60, 72, 80, 78, 81, 81]
  },
  {
    id: "EP-IOT-2200",
    hostname: "factory-floor-pl01",
    ip: "192.168.200.12",
    type: "IoT",
    provider: "AWS",
    status: "WARNING",
    riskScore: 52,
    lastSeen: "8M AGO",
    region: "US-West-1",
    os: "FreeRTOS Secure Gateway v1",
    agentStatus: "INSTALLED",
    agentVersion: "v1.0.8-rtos",
    cpuUsage: 19,
    memUsage: 45,
    macAddress: "b8:27:eb:d3:03:ca",
    vpcId: "n/a (Static Factory Office)",
    anomalies: ["Abnormal port scan execution activity target IP addresses list"],
    mitreMapping: [
      { id: "T1046", name: "Network Service Discovery", phase: "Discovery" }
    ],
    networkFlows: [
      { protocol: "TCP", sourceIp: "192.168.200.12", sourcePort: 4501, destIp: "192.168.200.255", destPort: 80, direction: "OUTBOUND", bytes: 14000, timestamp: "2026-05-29T07:15:22Z" }
    ],
    threatHistory: [],
    rawLogs: [
      "[07:14:12] RTOS: dispatched bulk network discovery requests outwards to check subnet neighbors status."
    ],
    trafficSparkline: [20, 25, 40, 31, 35, 33, 48, 55, 50, 52]
  },
  {
    id: "EP-AWS-0015",
    hostname: "internal-smtp-service",
    ip: "10.150.80.25",
    type: "VM",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 12,
    lastSeen: "1H AGO",
    region: "AP-Southeast-1",
    os: "Amazon Linux 2",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 5,
    memUsage: 19,
    macAddress: "02:42:0a:96:bc:8a",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[06:22:15] SMTPD: dispatched 12 internal report logs successfully to administrative mail lists"
    ],
    trafficSparkline: [12, 10, 8, 11, 12, 12, 11, 13, 12, 12]
  },
  {
    id: "EP-AZU-1122",
    hostname: "azu-billing-scheduler",
    ip: "10.40.10.88",
    type: "VM",
    provider: "Azure",
    status: "OFFLINE",
    riskScore: 0,
    lastSeen: "2D AGO",
    region: "EU-West-1",
    os: "Windows Server 2019 Core",
    agentStatus: "MISSING",
    agentVersion: "n/a",
    cpuUsage: 0,
    memUsage: 0,
    macAddress: "00:0d:3a:cc:df:fa",
    vpcId: "azu-vnet-reconcile",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[2026-05-27] EVENT: cloud cluster scheduler shutdown gracefully for scheduled hardware replacement."
    ],
    trafficSparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "EP-CON-7742",
    hostname: "prod-grafana-replicator-0",
    ip: "10.150.10.16",
    type: "Container",
    provider: "AWS",
    status: "HEALTHY",
    riskScore: 8,
    lastSeen: "JUST NOW",
    region: "AP-Southeast-1",
    os: "Alpine Linux 3.19",
    agentStatus: "INSTALLED",
    agentVersion: "v4.2.1-stable",
    cpuUsage: 8,
    memUsage: 25,
    macAddress: "02:42:0a:96:cc:aa",
    vpcId: "vpc-0a82fed29",
    anomalies: [],
    mitreMapping: [],
    networkFlows: [],
    threatHistory: [],
    rawLogs: [
      "[07:22:00] GRAFANA_REPLICA: metrics synchronizations completed successfully."
    ],
    trafficSparkline: [8, 8, 9, 8, 8, 8, 9, 8, 8, 8]
  }
];

export function getRiskLevel(score: number): "HEALTHY" | "WARNING" | "CRITICAL" {
  if (score >= 80) return "CRITICAL";
  if (score >= 50) return "WARNING";
  return "HEALTHY";
}

export function getStatusBadgeColor(status: EndpointStatus): { text: string; bg: string; border: string; dot: string } {
  switch (status) {
    case "CRITICAL":
      return {
        text: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        dot: "bg-red-500"
      };
    case "WARNING":
      return {
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-500"
      };
    case "HEALTHY":
      return {
        text: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500"
      };
    case "OFFLINE":
    default:
      return {
        text: "text-zinc-400 dark:text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/10",
        dot: "bg-zinc-400 dark:bg-zinc-600"
      };
  }
}
