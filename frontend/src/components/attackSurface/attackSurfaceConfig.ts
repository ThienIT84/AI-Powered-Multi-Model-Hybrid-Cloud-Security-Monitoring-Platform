// ─── Attack Surface – static config & mock data ──────────────────────────────

export interface AssetDistributionPoint {
  name: string;
  assets: number;
}

export interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface RiskTrendPoint {
  month: string;
  total: number;
  high: number;
  critical: number;
}

export interface AssetGroup {
  id: string;
  name: string;
  status: "Healthy" | "Warning" | "Critical";
  assets: number;
  critical: number;
  high: number;
  lastScan: string;
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
export const ATTACK_SURFACE_KPI = [
  {
    label: "Critical Exposure",
    value: "14",
    delta: "+2",
    positive: false,
    icon: "AlertTriangle",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#dc2626",
  },
  {
    label: "Total Assets",
    value: "1,588",
    delta: "+23",
    positive: false,
    icon: "Globe",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/30",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#ea580c",
  },
  {
    label: "Avg Risk Score",
    value: "6.8/10",
    delta: "-0.2",
    positive: true,
    icon: "TrendingDown",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    border: "border-yellow-200 dark:border-yellow-500/30",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#ca8a04",
  },
  {
    label: "Last Scan",
    value: "Live",
    delta: "Active",
    positive: true,
    icon: "CheckCircle2",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#059669",
  },
];

// ── Asset Distribution by Type ────────────────────────────────────────────────
export const ASSET_DISTRIBUTION: AssetDistributionPoint[] = [
  { name: "Public IPs",      assets: 210 },
  { name: "Compute",         assets: 380 },
  { name: "Subdomains",      assets: 1050 },
  { name: "APIs",            assets: 145 },
  { name: "Cloud Assets",    assets: 267 },
  { name: "Databases",       assets: 98  },
  { name: "Services",        assets: 320 },
];

// ── Risk Distribution (donut) ─────────────────────────────────────────────────
export const RISK_DISTRIBUTION: RiskDistributionItem[] = [
  { name: "Critical", value: 14,  color: "#ef4444" },
  { name: "High",     value: 39,  color: "#f97316" },
  { name: "Medium",   value: 81,  color: "#eab308" },
  { name: "Low",      value: 156, color: "#22d3ee" },
  { name: "Info",     value: 210, color: "#3b82f6" },
];

// ── Risk Trend (5 months) ─────────────────────────────────────────────────────
export const RISK_TREND: RiskTrendPoint[] = [
  { month: "Jan", total: 145, high: 55, critical: 28 },
  { month: "Feb", total: 138, high: 50, critical: 26 },
  { month: "Mar", total: 162, high: 62, critical: 32 },
  { month: "Apr", total: 178, high: 68, critical: 35 },
  { month: "May", total: 158, high: 60, critical: 30 },
];

// ── Asset Groups ──────────────────────────────────────────────────────────────
export const ASSET_GROUPS: AssetGroup[] = [
  {
    id: "prod",
    name: "Production Servers",
    status: "Healthy",
    assets: 45,
    critical: 2,
    high: 8,
    lastScan: "1 hour ago",
  },
  {
    id: "dev",
    name: "Dev Environment",
    status: "Warning",
    assets: 23,
    critical: 0,
    high: 5,
    lastScan: "3 hours ago",
  },
  {
    id: "cloud",
    name: "Cloud Infrastructure",
    status: "Critical",
    assets: 267,
    critical: 3,
    high: 18,
    lastScan: "2 hours ago",
  },
  {
    id: "third",
    name: "Third-party Services",
    status: "Healthy",
    assets: 156,
    critical: 1,
    high: 8,
    lastScan: "4 hours ago",
  },
];

// ── Threat Detection Feed ──────────────────────────────────────────────────────
export const THREAT_DETECTION_FEED = [
  {
    id: "port-scan",
    title: "Port Scan",
    severity: "Medium" as const,
    count: 10,
    confidence: 82,
    color: "var(--medium-accent)",
  },
  {
    id: "sql-injection",
    title: "SQL Injection",
    severity: "High" as const,
    count: 7,
    confidence: 89,
    color: "var(--high-accent)",
  },
  {
    id: "lfi",
    title: "LFI",
    severity: "Medium" as const,
    count: 7,
    confidence: 85,
    color: "var(--medium-accent)",
  },
  {
    id: "command-injection",
    title: "Command Injection",
    severity: "High" as const,
    count: 5,
    confidence: 84,
    color: "var(--high-accent)",
  },
];
