// ─── AI Threat Detection – static config & mock data ───────────────────────

export interface DetectionTimelinePoint {
  time: string;
  detections: number;
}

export interface ModelPerformancePoint {
  subject: string;
  modelA: number;
  modelB: number;
  modelC: number;
}

export interface AccuracyTrendPoint {
  time: string;
  accuracy: number;
}

export interface RecentDetection {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  model: string;
  confidence: number;
  timeAgo: string;
}

export interface ActiveModel {
  id: string;
  name: string;
  status: "ACTIVE" | "IDLE" | "RETRAINING";
  accuracy: number;
  inferences: string;
  latency: string;
  delta: string;
  deltaPositive: boolean;
}

// ── KPI cards ────────────────────────────────────────────────────────────────
export const KPI_DATA = [
  {
    label: "Total Detections",
    value: "2,847",
    delta: "+12%",
    positive: true,
    icon: "ShieldAlert",
    color: "text-red-800 dark:text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#991b1b",
  },
  {
    label: "Avg Accuracy",
    value: "94.1%",
    delta: "+2.3%",
    positive: true,
    icon: "TrendingUp",
    color: "text-emerald-800 dark:text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#065f46",
  },
  {
    label: "False Positive",
    value: "2.8%",
    delta: "-0.4%",
    positive: true,
    icon: "Target",
    color: "text-orange-800 dark:text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#9a3412",
  },
  {
    label: "Active Models",
    value: "4/4",
    delta: "All Running",
    positive: true,
    icon: "Cpu",
    color: "text-blue-800 dark:text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#1e40af",
  },
  {
    label: "Avg Latency",
    value: "29ms",
    delta: "-2ms",
    positive: true,
    icon: "Zap",
    color: "text-purple-800 dark:text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#6b21a8",
  },
];

// ── Detection Timeline (24h) ─────────────────────────────────────────────────
export const DETECTION_TIMELINE: DetectionTimelinePoint[] = [
  { time: "00:00", detections: 12 },
  { time: "02:00", detections: 18 },
  { time: "04:00", detections: 14 },
  { time: "06:00", detections: 28 },
  { time: "08:00", detections: 45 },
  { time: "10:00", detections: 52 },
  { time: "12:00", detections: 38 },
  { time: "14:00", detections: 60 },
  { time: "16:00", detections: 55 },
  { time: "18:00", detections: 42 },
  { time: "20:00", detections: 35 },
  { time: "22:00", detections: 22 },
];

// ── System Health ─────────────────────────────────────────────────────────────
export const SYSTEM_HEALTH = [
  { name: "Model 1", value: 96.2, color: "#22d3ee" },
  { name: "Model 2", value: 94.5, color: "#22d3ee" },
  { name: "Model 3", value: 91.8, color: "#22d3ee" },
];

// ── Model Type Distribution (multi-color donut) ───────────────────────────────
export const MODEL_TYPE_DISTRIBUTION = [
  { name: "SQL Injection",      value: 8,  color: "#ef4444" },
  { name: "DDoS",               value: 12, color: "#f97316" },
  { name: "Behavior Anomaly",   value: 9,  color: "#eab308" },
  { name: "Bot Activity",       value: 7,  color: "#22d3ee" },
  { name: "Port Scan",          value: 6,  color: "#3b82f6" },
  { name: "Phishing",           value: 5,  color: "#a855f7" },
  { name: "Malware",            value: 4,  color: "#ec4899" },
  { name: "Lateral Movement",   value: 3,  color: "#10b981" },
  { name: "Credential Stuffing",value: 4,  color: "#84cc16" },
  { name: "Ransomware",         value: 2,  color: "#06b6d4" },
];

// ── Model Performance Radar ───────────────────────────────────────────────────
export const MODEL_PERFORMANCE_RADAR: ModelPerformancePoint[] = [
  { subject: "Accuracy",    modelA: 96, modelB: 92, modelC: 88 },
  { subject: "Precision",   modelA: 94, modelB: 90, modelC: 85 },
  { subject: "Recall",      modelA: 92, modelB: 88, modelC: 82 },
  { subject: "F1-Score",    modelA: 93, modelB: 89, modelC: 84 },
  { subject: "Latency",     modelA: 95, modelB: 91, modelC: 87 },
  { subject: "Throughput",  modelA: 97, modelB: 93, modelC: 89 },
];

// ── Accuracy Trend ────────────────────────────────────────────────────────────
export const ACCURACY_TREND: AccuracyTrendPoint[] = [
  { time: "00:00", accuracy: 93.2 },
  { time: "04:00", accuracy: 94.0 },
  { time: "08:00", accuracy: 93.8 },
  { time: "12:00", accuracy: 94.5 },
  { time: "16:00", accuracy: 94.1 },
  { time: "20:00", accuracy: 94.3 },
];

// ── Recent Detections ─────────────────────────────────────────────────────────
export const RECENT_DETECTIONS: RecentDetection[] = [
  {
    id: "1",
    name: "SQL Injection",
    severity: "Critical",
    model: "NLP-SQLi",
    confidence: 98.0,
    timeAgo: "2 min ago",
  },
  {
    id: "2",
    name: "DDoS Pattern",
    severity: "High",
    model: "Traffic Anomaly",
    confidence: 92.0,
    timeAgo: "5 min ago",
  },
  {
    id: "3",
    name: "Behavior Anomaly",
    severity: "Medium",
    model: "Behavior Analysis",
    confidence: 87.0,
    timeAgo: "12 min ago",
  },
  {
    id: "4",
    name: "Bot Activity",
    severity: "High",
    model: "Botnet Detection",
    confidence: 91.0,
    timeAgo: "24 min ago",
  },
];

// ── Active AI Models ──────────────────────────────────────────────────────────
export const ACTIVE_MODELS: ActiveModel[] = [
  {
    id: "nlp-sqli",
    name: "NLP-SQLi Detection",
    status: "ACTIVE",
    accuracy: 96.2,
    inferences: "2.3K",
    latency: "23ms",
    delta: "+2.2%",
    deltaPositive: true,
  },
  {
    id: "behavior",
    name: "Behavior Analysis",
    status: "ACTIVE",
    accuracy: 94.1,
    inferences: "1.8K",
    latency: "31ms",
    delta: "+1.6%",
    deltaPositive: true,
  },
  {
    id: "traffic",
    name: "Traffic Anomaly",
    status: "ACTIVE",
    accuracy: 91.5,
    inferences: "1.7K",
    latency: "18ms",
    delta: "-0.5%",
    deltaPositive: false,
  },
  {
    id: "botnet",
    name: "Botnet Detection",
    status: "IDLE",
    accuracy: 93.8,
    inferences: "0.9K",
    latency: "45ms",
    delta: "+0.3%",
    deltaPositive: true,
  },
];
