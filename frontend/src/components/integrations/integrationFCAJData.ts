export interface PipelineNode {
  id: string;
  name: string;
  category: "lab" | "ingest" | "transit" | "router" | "ai" | "fusion" | "db" | "client";
  status: "Healthy" | "Warning" | "Critical" | "Offline";
  health: number;
  latencyMs: number;
  throughputEps: number;
  dependencies: string[];
}

export interface FCAJIntegrationItem {
  id: string;
  name: string;
  version: string;
  status: "Healthy" | "Warning" | "Critical" | "Offline";
  lastSync: string;
  latencyMs: number;
  healthScore: number;
  category: string;
  description: string;
  specs: Record<string, string>;
  metrics: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export interface DataSourceItem {
  name: string;
  type: string;
  status: "Healthy" | "Warning" | "Critical" | "Offline";
  recordsToday: number;
  lastReceived: string;
  schema: string;
}

export interface AuditLogItem {
  timestamp: string;
  component: string;
  event: string;
  status: "Success" | "Failure" | "Warning" | "Info";
  user: string;
  action: string;
}

// Initial Integrations Grid Data (Requirement 3)
export const initialIntegrationsList: FCAJIntegrationItem[] = [
  {
    id: "zeek",
    name: "Zeek Network Intrusion Sensor Integration",
    version: "v3.2.1-fcaj",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 12,
    healthScore: 100,
    category: "Telemetry Ingestion",
    description: "Parses core conn.log, http.log and dns.log schemas at network mirror points.",
    specs: {
      "Interface": "eth0 (Network Mirror)",
      "SSL Handshake Parser": "Enabled",
      "Dynamic Protocol Detection": "Active",
      "Format": "JSON syslog stream"
    },
    metrics: [
      { label: "Active Flows / sec", value: "340 EPS", trend: "+12%" },
      { label: "TCP Ingress", value: "85%", trend: "Stable" },
      { label: "Parser Drop Rate", value: "0.00%", trend: "0%" }
    ]
  },
  {
    id: "suricata",
    name: "Suricata Signature IDS Streamer",
    version: "v6.0.4-enterprise",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 18,
    healthScore: 100,
    category: "Signature Rules",
    description: "Stream ruleset warnings (eve.json) straight into our local security buffer forwarders.",
    specs: {
      "Rule Count": "14,502 Active Rules",
      "Multithreading": "Active (8 workers)",
      "Home Net Define": "10.100.0.0/16",
      "Payload Inspection": "Full packet content"
    },
    metrics: [
      { label: "Active Alarms / Min", value: "12 Alerts", trend: "-3%" },
      { label: "Kernel Drops", value: "0.002%", trend: "Stable" },
      { label: "Hyperscan Engine", value: "Compiled", trend: "OK" }
    ]
  },
  {
    id: "sqs",
    name: "AWS SQS Enterprise Buffer Queue",
    version: "AWS SQS FIFO",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 45,
    healthScore: 99,
    category: "Cloud Buffer Queue",
    description: "Asynchronous transit point buffering massive raw payloads from local network nodes.",
    specs: {
      "Queue Type": "FIFO (First-In, First-Out)",
      "VPC Endpoint Proxy": "Enabled",
      "KMS Encryption Key": "aws/sqs/fcaj-v3-key",
      "Redrive Policy": "Active (Dead Letter Queue)"
    },
    metrics: [
      { label: "Queue Depth", value: "1,200 Msgs", trend: "Normal" },
      { label: "In Flight", value: "320 Msgs", trend: "+2%" },
      { label: "Avg Latency", value: "45ms", trend: "+1%" }
    ]
  },
  {
    id: "rds",
    name: "PostgreSQL Database Layer",
    version: "PG v15.4-alpine",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 8,
    healthScore: 98,
    category: "Durable Cloud Storage",
    description: "Primary database backend recording alerts, asset metrics, and consolidated threat histories.",
    specs: {
      "Pool Connections": "Active (52 / 200)",
      "Replication Factor": "2 (Dual AZ)",
      "Auto Vacuum": "Enabled",
      "Storage Class": "NVMe SSD Provisioned IOPS"
    },
    metrics: [
      { label: "Writes / Sec", value: "142 Queries", trend: "+5%" },
      { label: "Reads / Sec", value: "98 Queries", trend: "+8%" },
      { label: "Free Storage Space", value: "4.2 TB", trend: "Stable" }
    ]
  },
  {
    id: "websocket",
    name: "WebSocket Realtime Event Dispatcher",
    version: "WS Gateway RFC6455",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 3,
    healthScore: 100,
    category: "Realtime Socket",
    description: "Low-latency frame dispatcher feeding live updates to active security analyst screens.",
    specs: {
      "Heartbeat Interval": "30s Ping-Pong",
      "Compression": "permessage-deflate",
      "Auth Protocol": "JWT Header Bearer",
      "Port Bind": "3000 (Proxy Integrated)"
    },
    metrics: [
      { label: "Active Subscribers", value: "14 Analysts", trend: "Stable" },
      { label: "Sent Frames", value: "15,204 Frames", trend: "+15%" },
      { label: "Buffer Usage", value: "1.2 MB", trend: "-5%" }
    ]
  },
  {
    id: "ai",
    name: "Dual-Engine AI Cyber Pipeline",
    version: "Model Core v3.0",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 65,
    healthScore: 97,
    category: "Threat Reasoning",
    description: "Hosts AI1 (Unsupervised Anomaly Detector) and AI2A/B (Supervised Classifier Sprints).",
    specs: {
      "Framework": "PyTorch / ONNX C++ Runtime",
      "GPU Device Mapping": "CUDA Enabled (Device 0)",
      "Precision Mode": "INT8 Decimation Quantized",
      "Inference Threads": "12 Core Parallel Execution"
    },
    metrics: [
      { label: "Inference Time AI1", value: "12ms", trend: "Fast" },
      { label: "Inference Time AI2A/B", value: "48ms", trend: "Stable" },
      { label: "Accuracy Target", value: "99.42%", trend: "Peak" }
    ]
  },
  {
    id: "fusion",
    name: "FCAJ Fusion Decision Layer",
    version: "FCAJ Core v3.0",
    status: "Healthy",
    lastSync: "JUST NOW",
    latencyMs: 5,
    healthScore: 100,
    category: "Context Synthesizer",
    description: "Integrates Zeek profiles, Suricata alert streams, and neural metrics to make unified verdicts.",
    specs: {
      "MITRE Alignment": "T1190, T1059 Matrix Mapping",
      "Rule Framework": "Declarative Fusion YAML v3.0",
      "Deduplication window": "30s Sliding Epoch",
      "Action Dispatch": "Slack and Firewall Quarantine Integration"
    },
    metrics: [
      { label: "Consolidated Today", value: "52 Incidents", trend: "-5%" },
      { label: "False Positive Rate", value: "0.24%", trend: "Optimal" },
      { label: "Action Dispatch Time", value: "1.2ms", trend: "Immediate" }
    ]
  }
];

// Initial Data Source Tables (Requirement 8)
export const initialDataSources: DataSourceItem[] = [
  {
    name: "conn.log",
    type: "Zeek Ingestion Core",
    status: "Healthy",
    recordsToday: 142100,
    lastReceived: "JUST NOW",
    schema: "ts, uid, id.orig_h, id.orig_p, id.resp_h, id.resp_p, proto, service, duration, orig_bytes, resp_bytes..."
  },
  {
    name: "http.log",
    type: "Zeek HTTP Parser",
    status: "Healthy",
    recordsToday: 32400,
    lastReceived: "JUST NOW",
    schema: "ts, uid, id.orig_h, orig_p, resp_h, resp_p, trans_depth, method, host, uri, referrer, user_agent, status_code..."
  },
  {
    name: "dns.log",
    type: "Zeek DNS Analyzer",
    status: "Healthy",
    recordsToday: 18450,
    lastReceived: "10S AGO",
    schema: "ts, uid, proto, trans_id, query, qclass, qtype, rcode, answers, TTLs..."
  },
  {
    name: "eve.json",
    type: "Suricata Event log",
    status: "Healthy",
    recordsToday: 1250,
    lastReceived: "JUST NOW",
    schema: "timestamp, flow_id, in_iface, event_type, src_ip, src_port, dest_ip, dest_port, alert: { signature, category, severity }..."
  },
  {
    name: "alerts",
    type: "IDS Core Ingestion",
    status: "Healthy",
    recordsToday: 512,
    lastReceived: "JUST NOW",
    schema: "alert_id, signature_id, severity_level, payload_preview_b64, classification_tag..."
  },
  {
    name: "fusion_alerts",
    type: "Fusion Layer Output",
    status: "Healthy",
    recordsToday: 104,
    lastReceived: "JUST NOW",
    schema: "fusion_id, consolidated_attack_type, final_risk_score, severity_tag, mitre_mappings, node_impact_list..."
  }
];

// Mock Audit Logs (Requirement 15)
export const initialAuditLogs: AuditLogItem[] = [
  {
    timestamp: "2026-06-01T08:00:10Z",
    component: "Zeek Ingestion",
    event: "Sensor Node Established",
    status: "Success",
    user: "SOC-SYSTEM",
    action: "Mount vpc-mirror-03"
  },
  {
    timestamp: "2026-06-01T08:05:22Z",
    component: "AWS SQS Queue",
    event: "FIFO Tunnel Initialized",
    status: "Success",
    user: "IAM-SERVICE-SQS",
    action: "VPC Transit Auth Key Checked"
  },
  {
    timestamp: "2026-06-01T08:10:45Z",
    component: "AI Pipeline Engine",
    event: "Model Quantization Loaded",
    status: "Success",
    user: "AI-CO-ARCH",
    action: "ONNX Runtime mapping enabled"
  },
  {
    timestamp: "2026-06-01T08:12:01Z",
    component: "Fusion Layer",
    event: "MITRE ATT&CK Matrix Matrix Sync",
    status: "Success",
    user: "SYSTEM-CRON",
    action: "YAML Matrix updated to v3.0 compatibility"
  },
  {
    timestamp: "2026-06-01T08:13:00Z",
    component: "PostgreSQL DB",
    event: "Sparsity Tables Vacuum Completed",
    status: "Success",
    user: "DB-ADMIN",
    action: "Index rebuild for speed performance optimization"
  },
  {
    timestamp: "2026-06-01T08:13:05Z",
    component: "WebSocket Gateway",
    event: "Channel Client Authenticated",
    status: "Success",
    user: "phutd0212@gmail.com",
    action: "Analysts token verified for real-time visual streaming"
  }
];
