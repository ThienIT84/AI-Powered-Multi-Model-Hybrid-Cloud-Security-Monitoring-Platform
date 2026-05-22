export interface TrendItem {
  time: string;
  Low: number;
  Medium: number;
  High: number;
  Critical: number;
}

export interface CloudAsset {
  name: string;
  type: string;
  platform: "AWS" | "Azure" | "GCP";
  alerts: number;
  risk: number;
  status: "Investigating" | "Monitoring" | "Mitigated" | "Resolved";
}

export interface AttackTypeData {
  name: string;
  value: number;
  color: string;
}

export interface AttackingIP {
  ip: string;
  country: string;
  count: number;
  mainAttack: string;
  lastActive: string;
  status: "Active" | "Flagged" | "Monitored" | "Stopped";
}

export interface ModelMetric {
  name: string;
  source: string;
  status: "Active" | "Retraining";
  metrics: {
    accuracy: string;
    precision: string;
    recall: string;
    f1: string;
  };
  color: string;
  glow: string;
  lineColor: string;
}

export interface IngestionMetric {
  hour: string;
  RawEvents: number;
  BackendResolved: number;
  KafkaThroughput: number; // eps
  ElasticIndexRate: number; // eps
  PacketLatency: number; // ms
  AWSQueueDepth: number; // messages
  DroppedLogs: number; // eps
}

// SOC Cyber Theme Colors
export const CYBER_COLORS = {
  critical: "#f43f5e", // Rose Red Neon
  criticalGlow: "rgba(244, 63, 94, 0.15)",
  high: "#f97316", // Orange Neon
  highGlow: "rgba(249, 115, 22, 0.15)",
  medium: "#eab308", // Cyber Yellow
  mediumGlow: "rgba(234, 179, 8, 0.15)",
  low: "#06b6d4", // Cyan Neon
  lowGlow: "rgba(6, 182, 212, 0.15)",
  safe: "#10b981", // Emerald Green
  safeGlow: "rgba(16, 185, 129, 0.15)",
  amber: "#f59e0b", // Amber Retraining
  purpleAccent: "#a855f7",
  pinkAccent: "#ec4899",
  blueAccent: "#3b82f6"
};

// 1. Alert Volume Trend Data sets by Timeframes
export const TREND_DATASETS: Record<string, TrendItem[]> = {
  today: [
    { time: "00:00", Low: 30, Medium: 15, High: 8, Critical: 2 },
    { time: "04:00", Low: 25, Medium: 20, High: 10, Critical: 1 },
    { time: "08:00", Low: 48, Medium: 35, High: 18, Critical: 4 },
    { time: "12:00", Low: 65, Medium: 42, High: 25, Critical: 7 },
    { time: "16:00", Low: 80, Medium: 50, High: 30, Critical: 9 },
    { time: "20:00", Low: 55, Medium: 38, High: 15, Critical: 3 },
    { time: "23:59", Low: 40, Medium: 22, High: 12, Critical: 2 },
  ],
  "7d": [
    { time: "Mon", Low: 120, Medium: 80, High: 45, Critical: 10 },
    { time: "Tue", Low: 140, Medium: 95, High: 42, Critical: 8 },
    { time: "Wed", Low: 130, Medium: 88, High: 50, Critical: 14 },
    { time: "Thu", Low: 185, Medium: 120, High: 75, Critical: 19 },
    { time: "Fri", Low: 160, Medium: 105, High: 58, Critical: 11 },
    { time: "Sat", Low: 110, Medium: 72, High: 35, Critical: 5 },
    { time: "Sun", Low: 125, Medium: 82, High: 40, Critical: 7 },
  ],
  "30d": [
    { time: "05/01", Low: 110, Medium: 70, High: 40, Critical: 9 },
    { time: "05/05", Low: 130, Medium: 85, High: 52, Critical: 14 },
    { time: "05/10", Low: 165, Medium: 105, High: 60, Critical: 11 },
    { time: "05/15", Low: 190, Medium: 130, High: 85, Critical: 22 },
    { time: "05/20", Low: 175, Medium: 112, High: 68, Critical: 13 },
    { time: "05/25", Low: 195, Medium: 125, High: 78, Critical: 16 },
    { time: "05/30", Low: 210, Medium: 140, High: 90, Critical: 24 },
  ],
  custom: [
    { time: "Range-Start", Low: 145, Medium: 90, High: 55, Critical: 12 },
    { time: "Range-Mid1", Low: 180, Medium: 110, High: 65, Critical: 15 },
    { time: "Range-Mid2", Low: 220, Medium: 145, High: 95, Critical: 28 },
    { time: "Range-End", Low: 195, Medium: 130, High: 75, Critical: 18 },
  ]
};

// 2. Affected Cloud Assets Inventory
export const ASSETS_DATASETS: Record<string, CloudAsset[]> = {
  today: [
    { name: "EC2-PROD-APP-01", type: "Virtual Machine", platform: "AWS", alerts: 12, risk: 92, status: "Investigating" },
    { name: "VPC-EAST-CORE", type: "Network Hub", platform: "Azure", alerts: 8, risk: 85, status: "Monitoring" },
    { name: "RDS-POSTGRES-USERLOGS", type: "Relational DB", platform: "AWS", alerts: 5, risk: 65, status: "Mitigated" },
  ],
  "7d": [
    { name: "EC2-PROD-APP-01", type: "Virtual Machine", platform: "AWS", alerts: 85, risk: 92, status: "Investigating" },
    { name: "VPC-EAST-CORE", type: "Network Hub", platform: "Azure", alerts: 62, risk: 85, status: "Monitoring" },
    { name: "S3-PAYMENTS-DECRYPTED", type: "Blob Store", platform: "AWS", alerts: 34, risk: 78, status: "Mitigated" },
    { name: "RDS-POSTGRES-USERLOGS", type: "Relational DB", platform: "AWS", alerts: 27, risk: 65, status: "Mitigated" },
  ],
  "30d": [
    { name: "EC2-PROD-APP-01", type: "Virtual Machine", platform: "AWS", alerts: 198, risk: 92, status: "Investigating" },
    { name: "VPC-EAST-CORE", type: "Network Hub", platform: "Azure", alerts: 145, risk: 85, status: "Monitoring" },
    { name: "S3-PAYMENTS-DECRYPTED", type: "Blob Store", platform: "AWS", alerts: 98, risk: 78, status: "Mitigated" },
    { name: "RDS-POSTGRES-USERLOGS", type: "Relational DB", platform: "AWS", alerts: 84, risk: 65, status: "Mitigated" },
    { name: "K8S-MICRO-INGRESS", type: "Container Cluster", platform: "GCP", alerts: 72, risk: 60, status: "Resolved" },
  ],
  custom: [
    { name: "CUSTOM-PROD-VM", type: "Virtual Machine", platform: "AWS", alerts: 112, risk: 89, status: "Investigating" },
    { name: "RDS-POSTGRES-USERLOGS", type: "Relational DB", platform: "AWS", alerts: 55, risk: 65, status: "Mitigated" },
    { name: "K8S-MICRO-INGRESS", type: "Container Cluster", platform: "GCP", alerts: 43, risk: 60, status: "Resolved" },
  ]
};

// 3. Attack Mix Distribution Data
export const ATTACK_MIX_DATASETS: Record<string, AttackTypeData[]> = {
  today: [
    { name: "Network Anomaly", value: 34, color: CYBER_COLORS.low },
    { name: "Brute Force", value: 25, color: CYBER_COLORS.purpleAccent },
    { name: "Web Attack", value: 18, color: CYBER_COLORS.pinkAccent },
    { name: "DDoS Attempt", value: 12, color: CYBER_COLORS.high },
    { name: "Malware Activity", value: 4, color: CYBER_COLORS.critical },
  ],
  "7d": [
    { name: "Network Anomaly", value: 124, color: CYBER_COLORS.low },
    { name: "Brute Force", value: 87, color: CYBER_COLORS.purpleAccent },
    { name: "Web Attack", value: 65, color: CYBER_COLORS.pinkAccent },
    { name: "DDoS Attempt", value: 42, color: CYBER_COLORS.high },
    { name: "Malware Activity", value: 18, color: CYBER_COLORS.critical },
  ],
  "30d": [
    { name: "Network Anomaly", value: 432, color: CYBER_COLORS.low },
    { name: "Brute Force", value: 312, color: CYBER_COLORS.purpleAccent },
    { name: "Web Attack", value: 247, color: CYBER_COLORS.pinkAccent },
    { name: "DDoS Attempt", value: 185, color: CYBER_COLORS.high },
    { name: "Malware Activity", value: 98, color: CYBER_COLORS.critical },
  ],
  custom: [
    { name: "Network Anomaly", value: 215, color: CYBER_COLORS.low },
    { name: "Brute Force", value: 154, color: CYBER_COLORS.purpleAccent },
    { name: "Web Attack", value: 110, color: CYBER_COLORS.pinkAccent },
    { name: "DDoS Attempt", value: 92, color: CYBER_COLORS.high },
    { name: "Malware Activity", value: 46, color: CYBER_COLORS.critical },
  ]
};

// 4. Critical Offending Network IPs
export const OFFENDING_IPS_DATASETS: Record<string, AttackingIP[]> = {
  today: [
    { ip: "185.220.101.5", country: "Russia (RU)", count: 32, mainAttack: "Brute Force", lastActive: "1m ago", status: "Active" },
    { ip: "45.142.120.44", country: "China (CN)", count: 24, mainAttack: "Web Attack", lastActive: "4m ago", status: "Active" },
    { ip: "91.241.19.82", country: "Netherlands (NL)", count: 15, mainAttack: "Network Anomaly", lastActive: "12m ago", status: "Flagged" },
  ],
  "7d": [
    { ip: "185.220.101.5", country: "Russia (RU)", count: 118, mainAttack: "Brute Force", lastActive: "2m ago", status: "Active" },
    { ip: "45.142.120.44", country: "China (CN)", count: 83, mainAttack: "Web Attack", lastActive: "15m ago", status: "Active" },
    { ip: "91.241.19.82", country: "Netherlands (NL)", count: 52, mainAttack: "Network Anomaly", lastActive: "1h ago", status: "Flagged" },
    { ip: "198.51.100.12", country: "United States (US)", count: 41, mainAttack: "DDoS Attempt", lastActive: "35m ago", status: "Monitored" },
  ],
  "30d": [
    { ip: "185.220.101.5", country: "Russia (RU)", count: 421, mainAttack: "Brute Force", lastActive: "2m ago", status: "Active" },
    { ip: "45.142.120.44", country: "China (CN)", count: 310, mainAttack: "Web Attack", lastActive: "12m ago", status: "Active" },
    { ip: "91.241.19.82", country: "Netherlands (NL)", count: 188, mainAttack: "Network Anomaly", lastActive: "1h ago", status: "Flagged" },
    { ip: "198.51.100.12", country: "United States (US)", count: 142, mainAttack: "DDoS Attempt", lastActive: "3h ago", status: "Monitored" },
    { ip: "103.245.20.1", country: "India (IN)", count: 91, mainAttack: "Malware Activity", lastActive: "8h ago", status: "Stopped" },
  ],
  custom: [
    { ip: "185.220.101.5", country: "Russia (RU)", count: 210, mainAttack: "Brute Force", lastActive: "3m ago", status: "Active" },
    { ip: "45.142.120.44", country: "China (CN)", count: 142, mainAttack: "Web Attack", lastActive: "8m ago", status: "Active" },
    { ip: "103.245.20.1", country: "India (IN)", count: 68, mainAttack: "Malware Activity", lastActive: "2h ago", status: "Stopped" },
  ]
};

// 5. AI ML Models Performance Weights
export const SHAP_EXPLAIN_DATA = [
  { name: "orig_bytes", score: 0.88, color: CYBER_COLORS.blueAccent },
  { name: "duration", score: 0.76, color: CYBER_COLORS.low },
  { name: "resp_pkts", score: 0.65, color: CYBER_COLORS.purpleAccent },
  { name: "orig_pkts", score: 0.54, color: CYBER_COLORS.purpleAccent },
  { name: "resp_bytes", score: 0.49, color: CYBER_COLORS.pinkAccent },
  { name: "orig_ip_bytes", score: 0.38, color: CYBER_COLORS.critical },
  { name: "resp_ip_bytes", score: 0.29, color: CYBER_COLORS.high },
];

export const MODEL_METRICS_DATA: ModelMetric[] = [
  {
    name: "AI1: Network Anomaly",
    source: "Zeek conn.log",
    status: "Active",
    metrics: { accuracy: "98.4%", precision: "97.9%", recall: "98.1%", f1: "98.0%" },
    color: "text-cyan-400",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    lineColor: "bg-cyan-500",
  },
  {
    name: "AI2A: Attack Classifier",
    source: "Zeek conn.log",
    status: "Active",
    metrics: { accuracy: "96.5%", precision: "95.8%", recall: "96.2%", f1: "96.0%" },
    color: "text-purple-400",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    lineColor: "bg-purple-500",
  },
  {
    name: "AI2B: Threat Intel Sync",
    source: "Zeek http.log",
    status: "Retraining",
    metrics: { accuracy: "94.2%", precision: "93.9%", recall: "94.5%", f1: "94.2%" },
    color: "text-amber-400",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.08)]",
    lineColor: "bg-amber-500",
  },
];

// 6. Detailed Pipeline and Network Observability Data (Ingestion Latency, Kafka, Elasticsearch, AWS depths)
export const PIPELINE_DATASETS: Record<string, IngestionMetric[]> = {
  today: [
    { hour: "00:00", RawEvents: 4200, BackendResolved: 4100, KafkaThroughput: 8400, ElasticIndexRate: 4150, PacketLatency: 12, AWSQueueDepth: 100, DroppedLogs: 0 },
    { hour: "04:00", RawEvents: 3500, BackendResolved: 3500, KafkaThroughput: 7000, ElasticIndexRate: 3520, PacketLatency: 10, AWSQueueDepth: 50, DroppedLogs: 0 },
    { hour: "08:00", RawEvents: 6800, BackendResolved: 6500, KafkaThroughput: 13600, ElasticIndexRate: 6480, PacketLatency: 18, AWSQueueDepth: 350, DroppedLogs: 2 },
    { hour: "12:00", RawEvents: 9200, BackendResolved: 8100, KafkaThroughput: 18400, ElasticIndexRate: 8050, PacketLatency: 35, AWSQueueDepth: 1250, DroppedLogs: 12 },
    { hour: "16:00", RawEvents: 8500, BackendResolved: 8200, KafkaThroughput: 17000, ElasticIndexRate: 8180, PacketLatency: 28, AWSQueueDepth: 840, DroppedLogs: 8 },
    { hour: "20:00", RawEvents: 5400, BackendResolved: 5350, KafkaThroughput: 10800, ElasticIndexRate: 5390, PacketLatency: 15, AWSQueueDepth: 180, DroppedLogs: 1 },
    { hour: "23:59", RawEvents: 4120, BackendResolved: 4100, KafkaThroughput: 8240, ElasticIndexRate: 4110, PacketLatency: 11, AWSQueueDepth: 80, DroppedLogs: 0 },
  ],
  "7d": [
    { hour: "Mon", RawEvents: 45000, BackendResolved: 44200, KafkaThroughput: 90000, ElasticIndexRate: 44500, PacketLatency: 14, AWSQueueDepth: 1500, DroppedLogs: 5 },
    { hour: "Tue", RawEvents: 51000, BackendResolved: 49500, KafkaThroughput: 102000, ElasticIndexRate: 49200, PacketLatency: 22, AWSQueueDepth: 2100, DroppedLogs: 14 },
    { hour: "Wed", RawEvents: 48000, BackendResolved: 47200, KafkaThroughput: 96000, ElasticIndexRate: 47000, PacketLatency: 16, AWSQueueDepth: 1200, DroppedLogs: 7 },
    { hour: "Thu", RawEvents: 72000, BackendResolved: 63000, KafkaThroughput: 144000, ElasticIndexRate: 62500, PacketLatency: 52, AWSQueueDepth: 9400, DroppedLogs: 86 },
    { hour: "Fri", RawEvents: 61000, BackendResolved: 59000, KafkaThroughput: 122000, ElasticIndexRate: 59100, PacketLatency: 31, AWSQueueDepth: 3500, DroppedLogs: 24 },
    { hour: "Sat", RawEvents: 38000, BackendResolved: 37900, KafkaThroughput: 76000, ElasticIndexRate: 38000, PacketLatency: 11, AWSQueueDepth: 350, DroppedLogs: 0 },
    { hour: "Sun", RawEvents: 41000, BackendResolved: 40800, KafkaThroughput: 82000, ElasticIndexRate: 40950, PacketLatency: 13, AWSQueueDepth: 480, DroppedLogs: 1 },
  ],
  "30d": [
    { hour: "Wk 1", RawEvents: 310000, BackendResolved: 304000, KafkaThroughput: 620000, ElasticIndexRate: 305000, PacketLatency: 18, AWSQueueDepth: 4200, DroppedLogs: 45 },
    { hour: "Wk 2", RawEvents: 345000, BackendResolved: 332000, KafkaThroughput: 690000, ElasticIndexRate: 331000, PacketLatency: 26, AWSQueueDepth: 5100, DroppedLogs: 92 },
    { hour: "Wk 3", RawEvents: 420000, BackendResolved: 385000, KafkaThroughput: 840000, ElasticIndexRate: 381000, PacketLatency: 48, AWSQueueDepth: 18400, DroppedLogs: 312 },
    { hour: "Wk 4", RawEvents: 380000, BackendResolved: 372000, KafkaThroughput: 760000, ElasticIndexRate: 370500, PacketLatency: 32, AWSQueueDepth: 8900, DroppedLogs: 115 },
  ],
  custom: [
    { hour: "Day 1", RawEvents: 48000, BackendResolved: 47100, KafkaThroughput: 96000, ElasticIndexRate: 47200, PacketLatency: 15, AWSQueueDepth: 950, DroppedLogs: 2 },
    { hour: "Day 2", RawEvents: 55000, BackendResolved: 51200, KafkaThroughput: 110000, ElasticIndexRate: 50800, PacketLatency: 28, AWSQueueDepth: 4100, DroppedLogs: 19 },
    { hour: "Day 3", RawEvents: 68000, BackendResolved: 58000, KafkaThroughput: 136000, ElasticIndexRate: 57500, PacketLatency: 49, AWSQueueDepth: 11200, DroppedLogs: 142 },
    { hour: "Day 4", RawEvents: 52000, BackendResolved: 51500, KafkaThroughput: 104000, ElasticIndexRate: 51200, PacketLatency: 21, AWSQueueDepth: 2400, DroppedLogs: 8 },
  ]
};
