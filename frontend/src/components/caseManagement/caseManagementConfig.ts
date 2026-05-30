// ─── Case Management – static config & mock data ─────────────────────────────

export interface CaseTrendPoint {
  week: string;
  opened: number;
  closed: number;
  critical: number;
}

export interface StatusDistItem {
  name: string;
  value: number;
  color: string;
}

export interface ResolutionTimePoint {
  priority: string;
  hours: number;
}

export interface ActiveCase {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "In Progress" | "Open" | "Resolved" | "Pending Review";
  createdAgo: string;
  assignedTo: string;
  progress: number;
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
export const CASE_KPI = [
  {
    label: "Open",
    value: "34",
    delta: "+2",
    positive: false,
    icon: "FolderOpen",
    color: "text-red-800 dark:text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#991b1b",
  },
  {
    label: "In Progress",
    value: "18",
    delta: "-1",
    positive: true,
    icon: "Clock",
    color: "text-orange-800 dark:text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#9a3412",
  },
  {
    label: "Resolved",
    value: "64",
    delta: "+3",
    positive: true,
    icon: "CheckCircle2",
    color: "text-emerald-800 dark:text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#065f46",
  },
  {
    label: "Avg Resolution",
    value: "6.2h",
    delta: "-0.4h",
    positive: true,
    icon: "TrendingDown",
    color: "text-blue-800 dark:text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#1e40af",
  },
  {
    label: "SLA Compliance",
    value: "94.2%",
    delta: "+2.1%",
    positive: true,
    icon: "ShieldCheck",
    color: "text-purple-800 dark:text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#6b21a8",
  },
];

// ── Case Trend (5 weeks) ──────────────────────────────────────────────────────
export const CASE_TREND: CaseTrendPoint[] = [
  { week: "W1", opened: 11, closed: 8,  critical: 3 },
  { week: "W2", opened: 15, closed: 12, critical: 4 },
  { week: "W3", opened: 10, closed: 11, critical: 2 },
  { week: "W4", opened: 18, closed: 14, critical: 5 },
  { week: "W5", opened: 16, closed: 13, critical: 4 },
];

// ── Status Distribution (donut) ───────────────────────────────────────────────
export const STATUS_DISTRIBUTION: StatusDistItem[] = [
  { name: "Open",           value: 34, color: "#ef4444" },
  { name: "In Progress",    value: 18, color: "#f97316" },
  { name: "Pending Review", value: 12, color: "#eab308" },
  { name: "Resolved",       value: 64, color: "#10b981" },
];

// ── Avg Resolution Time by Priority ──────────────────────────────────────────
export const RESOLUTION_TIME: ResolutionTimePoint[] = [
  { priority: "Critical", hours: 2  },
  { priority: "High",     hours: 5  },
  { priority: "Medium",   hours: 9  },
  { priority: "Low",      hours: 16 },
];

// ── Active Cases ──────────────────────────────────────────────────────────────
export const ACTIVE_CASES: ActiveCase[] = [
  {
    id: "CASE-001",
    title: "Unauthorized Admin Access",
    severity: "Critical",
    status: "In Progress",
    createdAgo: "2 hours ago",
    assignedTo: "John Doe",
    progress: 65,
  },
  {
    id: "CASE-002",
    title: "SQL Injection Attempt",
    severity: "High",
    status: "In Progress",
    createdAgo: "4 hours ago",
    assignedTo: "Sarah Smith",
    progress: 40,
  },
  {
    id: "CASE-003",
    title: "Suspicious Data Exfiltration",
    severity: "Critical",
    status: "Open",
    createdAgo: "1 hour ago",
    assignedTo: "Unassigned",
    progress: 0,
  },
  {
    id: "CASE-004",
    title: "DDoS Attack Pattern",
    severity: "High",
    status: "Resolved",
    createdAgo: "1 day ago",
    assignedTo: "Mike Johnson",
    progress: 100,
  },
  {
    id: "CASE-005",
    title: "Malware Detection",
    severity: "Medium",
    status: "In Progress",
    createdAgo: "6 hours ago",
    assignedTo: "Emily Wilson",
    progress: 75,
  },
  {
    id: "CASE-006",
    title: "Configuration Drift",
    severity: "Low",
    status: "Pending Review",
    createdAgo: "3 days ago",
    assignedTo: "David Lee",
    progress: 90,
  },
  {
    id: "CASE-007",
    title: "Brute Force Login",
    severity: "High",
    status: "Open",
    createdAgo: "30 min ago",
    assignedTo: "Unassigned",
    progress: 0,
  },
  {
    id: "CASE-008",
    title: "Lateral Movement Detected",
    severity: "Critical",
    status: "In Progress",
    createdAgo: "5 hours ago",
    assignedTo: "John Doe",
    progress: 30,
  },
];

// ── Threat Detection Feed ──────────────────────────────────────────────────────
export const THREAT_DETECTION_FEED = [
  {
    id: "brute-force",
    title: "Brute Force Attack",
    severity: "High" as const,
    count: 12,
    confidence: 88,
    color: "var(--high-accent)",
  },
  {
    id: "privilege-escalation",
    title: "Privilege Escalation",
    severity: "Critical" as const,
    count: 5,
    confidence: 91,
    color: "var(--critical-accent)",
  },
  {
    id: "data-exfiltration",
    title: "Data Exfiltration",
    severity: "Critical" as const,
    count: 3,
    confidence: 87,
    color: "var(--critical-accent)",
  },
  {
    id: "lateral-movement",
    title: "Lateral Movement",
    severity: "High" as const,
    count: 8,
    confidence: 85,
    color: "var(--high-accent)",
  },
];
