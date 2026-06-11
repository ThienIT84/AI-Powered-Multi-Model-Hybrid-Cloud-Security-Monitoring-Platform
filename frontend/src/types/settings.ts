export interface SettingsStateData {
  // 1. General System Branding
  systemName: string;
  version: string;
  environment: "Development" | "Staging" | "Production";
  timezone: "UTC" | "UTC+7" | "UTC+8" | "UTC-5";
  language: "en" | "vi" | "es" | "ja";
  refreshInterval: number;
  organization: string;

  // 2. Appearance & UX Preferences
  theme: "Dark" | "Light" | "System";
  density: "Compact" | "Comfortable";
  sidebarMode: "Expanded" | "Collapsed";
  animations: "Enable" | "Disable";
  severityColorCritical: string;
  severityColorHigh: string;
  severityColorMedium: string;
  severityColorLow: string;

  // 3. Detection Policy Configurations
  ai1Threshold: number;
  ai2aConfidence: number;
  ai2bThreshold: number;
  consensusThreshold: number;
  thresholdCritical: number;
  thresholdHigh: number;
  thresholdMedium: number;
  thresholdLow: number;

  // 4. Alert Management Settings
  alertRetention: "7 Days" | "30 Days" | "90 Days" | "180 Days" | "365 Days";
  alertAutoClose: boolean;
  alertAutoCloseDuration: "1h" | "6h" | "24h";
  soundCritical: boolean;
  soundHigh: boolean;
  soundMedium: boolean;
  soundLow: boolean;
  channelEmail: boolean;
  channelSlack: boolean;
  channelTeams: boolean;
  escalateDelayCritical: number;
  escalateDelayHigh: number;
  escalateDelayMedium: number;

  // 5. Ingress Plugs & Integrations Configuration
  zeekStatus: "Connected" | "Disconnected";
  zeekEndpointUrl: string;
  suricataStatus: "Connected" | "Disconnected";
  suricataRulesUrl: string;
  suricataRulesSyncInterval: number;
  awsSqsUrl: string;
  awsSqsStatus: "Connected" | "Disconnected";
  postgresHost: string;
  postgresPort: number;
  postgresDb: string;
  postgresStatus: "Connected" | "Disconnected";
  websocketUrl: string;
  websocketMaxRetry: number;

  // 6. User & Access Control (AccessControl)
  sessionTimeout: number;
  mfaRequired: boolean;
  passwordRotationValue: "30 Days" | "60 Days" | "90 Days" | "None";
  operatorUsers: Array<{
    id: number;
    username: string;
    role: "Admin" | "SOC Analyst" | "Security Engineer" | "Viewer";
    status: "Active" | "Suspended";
    lastLogin: string;
  }>;
  permissions: Record<string, Record<string, boolean>>;

  // 7. Reporting Configuration
  reportFormat: "PDF" | "CSV" | "XLSX";
  reportSchedule: "Daily" | "Weekly" | "Monthly";
  reportAutoGenerate: boolean;
  reportRetentionMonths: number;
  reportStoragePath: "Local Secure Vault" | "AWS S3 Glacier" | "Enterprise Database";
  emailSubscribers: string;

  // 8. Audit & Compliance Settings
  auditLogRetention: number;
  trackConfigChanges: boolean;
  complianceMapping: "NIST SP 800-53" | "ISO 27001" | "SOC2 Type II" | "CIS Controls";
  mitreTrackingEnabled: boolean;
  enableDailyPolicyValidation: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "warning" | "info";
}
