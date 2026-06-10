export interface Integration {
  id: string;
  name: string;
  category: "Security Sensors" | "Cloud Services" | "Storage" | "Messaging" | "Database";
  status: "Connected" | "Warning" | "Disconnected";
  lastSync: string;
  dataType: string;
  health: "Healthy" | "Warning" | "Critical";
  region?: string;
  description: string;
  connectedServices: string[];
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  integration: string;
  event: string;
  status: "Success" | "Warning" | "Failure" | "Active";
}
