export interface SettingsStateData {
  // 1. General Info
  systemName: string;
  version: string;
  environment: "Development" | "Staging" | "Production";
  timezone: "UTC" | "UTC+7" | "UTC+8";
  language: "English" | "Vietnamese";

  // 2. Appearance
  theme: "Dark" | "Light" | "System";
  density: "Compact" | "Comfortable";
  sidebarMode: "Expanded" | "Collapsed";
  animations: "Enable" | "Disable";
  colorBlindMode: boolean;
  severityPreview: "Critical" | "High" | "Medium" | "Low";

  // 3. AI Engine
  ai1Status: string;
  ai1Model: string;
  ai1Version: string;
  ai1Threshold: number;
  ai2aStatus: string;
  ai2aModel: string;
  ai2aClasses: string[];
  ai2aConfidence: number;
  ai2bStatus: string;
  ai2bModel: string;
  ai2bThreshold: number;
  ai2bAttackTypes: string[];
  batchSize: number;
  inferenceMode: "Realtime" | "Batch";

  // 4. Fusion
  weightAI1: number;
  weightAI2A: number;
  weightAI2B: number;
  weightSuricata: number;
  thresholdLow: number;
  thresholdMedium: number;
  thresholdHigh: number;
  thresholdCritical: number;

  // 5. Alerts
  alertColors: {
    Critical: string;
    High: string;
    Medium: string;
    Low: string;
  };
  alertSounds: {
    Critical: boolean;
    High: boolean;
    Medium: boolean;
    Low: boolean;
  };
  alertNotifications: {
    Critical: boolean;
    High: boolean;
    Medium: boolean;
    Low: boolean;
  };
  alertRetention: "7 Days" | "30 Days" | "90 Days" | "180 Days";
  alertAutoClose: boolean;
  alertAutoCloseDuration: "1h" | "6h" | "24h";

  // 6. AWS
  awsSqsUrl: string;
  awsSqsStatus: "Connected" | "Disconnected" | "Connecting";
  awsSqsMessages: number;
  awsS3Bucket: string;
  awsS3Status: "Connected" | "Disconnected";
  awsRdsDatabase: string;
  awsRdsStatus: "Connected" | "Disconnected";
  awsCloudWatchStatus: "Connected" | "Disconnected";

  // 7. Integrations
  zeekStatus: "Connected" | "Disconnected";
  zeekLogs: string[];
  suricataStatus: "Connected" | "Disconnected";
  suricataRules: number;
  filebeatStatus: "Connected" | "Disconnected";
  websocketStatus: "Connected" | "Disconnected";
  websocketLatency: number;

  // 8. Dataset
  connDatasetName: string;
  httpDatasetName: string;
  datasetDuplicates: number;
  datasetMissing: number;
  datasetPsi: number;
  datasetOutliers: number;
  datasetMismatchStatus: "Safe" | "Warning" | "Critical";
  datasetLab: string;
  datasetPublic: string;

  // 9. Reports
  reportFormat: "PDF" | "CSV" | "JSON";
  reportSchedule: "Daily" | "Weekly" | "Monthly";
  reportAutoGenerate: boolean;

  // 10. Users
  users: Array<{ id: number; username: string; role: string; status: "Active" | "Suspended"; lastLogin: string }>;
  permissions: Record<string, Record<string, boolean>>;

  // 11. Monitoring
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  aiEngineHealth: {
    ai1: boolean;
    ai2a: boolean;
    ai2b: boolean;
    fusion: boolean;
  };
  connectedClients: number;
  sqsQueueLength: number;
  sqsProcessingRate: number;

  // 14. Advanced Options
  developerMode: boolean;
  debugConsole: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "warning" | "info";
}
