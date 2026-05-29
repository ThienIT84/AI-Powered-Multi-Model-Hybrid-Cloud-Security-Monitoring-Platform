export interface IntegrationConfig {
  webhookUrl?: string; // Slack / Discord
  firewallApiEndpoint?: string; // pfSense / Firewall
  apiSecretToken?: string; // pfSense / Webhook / General Api Key
  awsAccessKeyId?: string; // AWS CloudWatch/CloudTrail / AWS Services
  awsSecretAccessKey?: string; // AWS secret
  awsRegion?: string; // AWS region
  apiEndpoint?: string; // Default API endpoint / Host
  authToken?: string; // Default auth token
  syncInterval?: string; // e.g. "1m", "5m", "15m", "realtime"
  encryptionPolicy?: string; // e.g. "AES-256", "TLS-1.3", "ChaCha20"
  retryPolicy?: string; // e.g. "linear", "exponential"
}

export interface Integration {
  id: string;
  name: string;
  category: "inbound" | "notifications" | "security_actions";
  description: string;
  status: "ACTIVE" | "STANDBY" | "DEGRADED" | "OFFLINE";
  iconName: string; // fallback icon rendering
  configuredAt?: string;
  configuration?: IntegrationConfig;
  epsVolume?: number;
  logsProcessed?: string;
  syncedRules?: string;
  uptime?: string;
  tunnelCount?: number;
  queueDepth?: number;
}
