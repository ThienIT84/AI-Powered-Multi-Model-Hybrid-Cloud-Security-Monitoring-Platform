// ─── MITRE ATT&CK – static config & mock data ─────────────────────────────────

export interface TacticCoveragePoint {
  tactic: string;
  coverage: number;
}

export interface DetectionTrendPoint {
  day: string;
  detections: number;
  techniques: number;
}

export interface ThreatActor {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium";
  lastSeen: string;
  techniquesUsed: number;
  detections: number;
}

export interface TechniqueRow {
  id: string;
  name: string;
  reconnaissance: boolean | "partial";
  resourceDev: boolean | "partial";
  execution: boolean | "partial";
  persistence: boolean | "partial";
  privilegeEsc: boolean | "partial";
  defenseEvasion: boolean | "partial";
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
export const MITRE_KPI = [
  {
    label: "Coverage",
    value: "90%",
    delta: "+2.1%",
    positive: true,
    icon: "Shield",
    color: "text-red-800 dark:text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#991b1b",
  },
  {
    label: "Tactics Covered",
    value: "14/14",
    delta: "100%",
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
    label: "Threat Actors",
    value: "12",
    delta: "+1",
    positive: false,
    icon: "Users",
    color: "text-yellow-800 dark:text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    border: "border-yellow-200 dark:border-yellow-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#854d0e",
  },
  {
    label: "Week Detections",
    value: "348",
    delta: "+23%",
    positive: false,
    icon: "TrendingUp",
    color: "text-blue-800 dark:text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    gradFrom: "transparent",
    gradTo: "transparent",
    glowColor: "transparent",
    accentHex: "#1e40af",
  },
];

// ── Tactic Coverage (horizontal bar) ─────────────────────────────────────────
export const TACTIC_COVERAGE: TacticCoveragePoint[] = [
  { tactic: "Thu thập thông tin",    coverage: 95 },
  { tactic: "Phát triển tài nguyên",  coverage: 100 },
  { tactic: "Truy cập ban đầu",      coverage: 88 },
  { tactic: "Thực thi",             coverage: 97 },
  { tactic: "Duy trì",              coverage: 85 },
  { tactic: "Leo thang đặc quyền",   coverage: 92 },
  { tactic: "Lẩn trốn phòng thủ",    coverage: 78 },
  { tactic: "Truy cập thông tin",    coverage: 90 },
  { tactic: "Di chuyển ngang",      coverage: 83 },
  { tactic: "Thu thập",             coverage: 76 },
  { tactic: "Điều khiển & Kiểm soát", coverage: 94 },
  { tactic: "Đánh cắp dữ liệu",      coverage: 80 },
  { tactic: "Tác động",             coverage: 87 },
];

// ── Detection Trend (weekly) ──────────────────────────────────────────────────
export const DETECTION_TREND: DetectionTrendPoint[] = [
  { day: "Mon", detections: 45, techniques: 22 },
  { day: "Tue", detections: 52, techniques: 28 },
  { day: "Wed", detections: 38, techniques: 20 },
  { day: "Thu", detections: 61, techniques: 32 },
  { day: "Fri", detections: 57, techniques: 29 },
  { day: "Sat", detections: 39, techniques: 18 },
  { day: "Sun", detections: 44, techniques: 21 },
];

// ── Threat Actors ─────────────────────────────────────────────────────────────
export const THREAT_ACTORS: ThreatActor[] = [
  {
    id: "apt28",
    name: "APT-28",
    severity: "Critical",
    lastSeen: "2 hours ago",
    techniquesUsed: 145,
    detections: 234,
  },
  {
    id: "lazarus",
    name: "Lazarus Group",
    severity: "Critical",
    lastSeen: "5 hours ago",
    techniquesUsed: 198,
    detections: 187,
  },
  {
    id: "wizard",
    name: "Wizard Spider",
    severity: "High",
    lastSeen: "12 hours ago",
    techniquesUsed: 167,
    detections: 142,
  },
  {
    id: "carbanak",
    name: "Carbanak",
    severity: "High",
    lastSeen: "1 day ago",
    techniquesUsed: 112,
    detections: 89,
  },
];

// ── Technique Coverage Matrix ─────────────────────────────────────────────────
export const TECHNIQUE_MATRIX: TechniqueRow[] = [
  {
    id: "T1589",
    name: "Thu thập thông tin tổ chức nạn nhân",
    reconnaissance: true,
    resourceDev: true,
    execution: false,
    persistence: false,
    privilegeEsc: false,
    defenseEvasion: false,
  },
  {
    id: "T1595",
    name: "Quét chủ động",
    reconnaissance: true,
    resourceDev: true,
    execution: false,
    persistence: false,
    privilegeEsc: false,
    defenseEvasion: false,
  },
  {
    id: "T1199",
    name: "Mối quan hệ tin cậy",
    reconnaissance: false,
    resourceDev: false,
    execution: true,
    persistence: "partial",
    privilegeEsc: false,
    defenseEvasion: false,
  },
  {
    id: "T1566",
    name: "Lừa đảo",
    reconnaissance: false,
    resourceDev: "partial",
    execution: true,
    persistence: true,
    privilegeEsc: false,
    defenseEvasion: false,
  },
  {
    id: "T1059",
    name: "Lệnh và kịch bản",
    reconnaissance: false,
    resourceDev: false,
    execution: true,
    persistence: true,
    privilegeEsc: "partial",
    defenseEvasion: true,
  },
  {
    id: "T1078",
    name: "Tài khoản hợp lệ",
    reconnaissance: false,
    resourceDev: false,
    execution: false,
    persistence: true,
    privilegeEsc: true,
    defenseEvasion: true,
  },
  {
    id: "T1055",
    name: "Quy trình tiêm",
    reconnaissance: false,
    resourceDev: false,
    execution: true,
    persistence: false,
    privilegeEsc: true,
    defenseEvasion: true,
  },
  {
    id: "T1071",
    name: "Giao thức lớp ứng dụng",
    reconnaissance: false,
    resourceDev: false,
    execution: false,
    persistence: false,
    privilegeEsc: false,
    defenseEvasion: false,
  },
];

export const MATRIX_COLUMNS = [
  { key: "reconnaissance",  label: "Recon" },
  { key: "resourceDev",     label: "Resource Dev" },
  { key: "execution",       label: "Execution" },
  { key: "persistence",     label: "Persistence" },
  { key: "privilegeEsc",    label: "Privilege Esc" },
  { key: "defenseEvasion",  label: "Defense Evasion" },
];
