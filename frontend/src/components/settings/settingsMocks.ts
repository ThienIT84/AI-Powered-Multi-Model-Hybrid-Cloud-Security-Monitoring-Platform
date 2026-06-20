import { SettingsStateData } from "../../types/settings";

export const DEFAULT_COMPLETE_SETTINGS: SettingsStateData = {
  // 1. General System
  systemName: "AI-Powered Hybrid Cloud Security Platform v3",
  version: "v3.0",
  environment: "Development",
  timezone: "UTC+7",
  language: "en",
  refreshInterval: 30,
  organization: "Global Threat Defenses",

  // 2. Appearance
  theme: "Dark",
  density: "Comfortable",
  sidebarMode: "Expanded",
  animations: "Enable",
  severityColorCritical: "#ef4444",
  severityColorHigh: "#f97316",
  severityColorMedium: "#eab308",
  severityColorLow: "#3b82f6",

  // 3. Detection
  ai1Threshold: 0.65,
  ai2aConfidence: 75,
  ai2bThreshold: 82,
  consensusThreshold: 65,
  thresholdCritical: 90,
  thresholdHigh: 70,
  thresholdMedium: 40,
  thresholdLow: 15,

  // 4. Alerts
  alertRetention: "30 Days",
  alertAutoClose: true,
  alertAutoCloseDuration: "6h",
  soundCritical: true,
  soundHigh: true,
  soundMedium: false,
  soundLow: false,
  channelEmail: true,
  channelSlack: true,
  channelTeams: false,
  escalateDelayCritical: 5,
  escalateDelayHigh: 15,
  escalateDelayMedium: 60,

  // 5. Integrations
  zeekStatus: "Connected",
  zeekEndpointUrl: "http://10.92.110.12:4734",
  suricataStatus: "Connected",
  suricataRulesUrl: "https://rules.emergingthreats.net/open/suricata/emerging.rules.tar.gz",
  suricataRulesSyncInterval: 60,
  awsSqsUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/soc-zeek-queue.fifo",
  awsSqsStatus: "Connected",
  postgresHost: "10.0.98.42",
  postgresPort: 5432,
  postgresDb: "zeek_ai_soc_production",
  postgresStatus: "Connected",
  websocketUrl: "wss://soc-gateway.corp.internal:443/live",
  websocketMaxRetry: 5,

  // 6. Access Control
  sessionTimeout: 30,
  mfaRequired: true,
  passwordRotationValue: "60 Days",
  operatorUsers: [
    { id: 1, username: "phutd@security.net", role: "Admin", status: "Active", lastLogin: "2026-06-05 08:34:12" },
    { id: 2, username: "analyst_alpha@soc.net", role: "SOC Analyst", status: "Active", lastLogin: "2026-06-05 09:12:44" },
    { id: 3, username: "engineer_prime@soc.net", role: "Security Engineer", status: "Active", lastLogin: "2026-06-05 07:02:11" },
    { id: 4, username: "viewer_standard@soc.net", role: "Viewer", status: "Active", lastLogin: "2026-06-04 15:44:02" },
  ],
  permissions: {
    Dashboard: { Admin: true, "SOC Analyst": true, "Security Engineer": true, Viewer: true },
    Alerts: { Admin: true, "SOC Analyst": true, "Security Engineer": true, Viewer: false },
    Reports: { Admin: true, "SOC Analyst": true, "Security Engineer": false, Viewer: false },
    Settings: { Admin: true, "SOC Analyst": false, "Security Engineer": true, Viewer: false },
    Users: { Admin: true, "SOC Analyst": false, "Security Engineer": false, Viewer: false },
  },

  // 7. Reporting
  reportFormat: "PDF",
  reportSchedule: "Weekly",
  reportAutoGenerate: true,
  reportRetentionMonths: 12,
  reportStoragePath: "Local Secure Vault",
  emailSubscribers: "phutd@security.net, admin-alert@corp.internal",

  // 8. Audit & Compliance
  auditLogRetention: 5,
  trackConfigChanges: true,
  complianceMapping: "NIST SP 800-53",
  mitreTrackingEnabled: true,
  enableDailyPolicyValidation: true,
};
