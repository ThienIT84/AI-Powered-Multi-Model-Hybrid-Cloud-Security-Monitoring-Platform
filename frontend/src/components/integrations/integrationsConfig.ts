export interface IntegrationConfig {
  webhookUrl?: string; // Slack / Discord
  firewallApiEndpoint?: string; // pfSense / Firewall
  apiSecretToken?: string; // pfSense / Webhook / General Api Key
  awsAccessKeyId?: string; // AWS CloudWatch/CloudTrail / AWS Services
  awsSecretAccessKey?: string; // AWS secret
  awsRegion?: string; // AWS region
  apiEndpoint?: string; // Default API endpoint / Host
  authToken?: string; // Default auth token
}

export interface Integration {
  id: string;
  name: string;
  category: "inbound" | "notifications" | "security_actions";
  description: string;
  status: "connected" | "not_configured";
  iconName: string; // fallback icon rendering
  configuredAt?: string;
  configuration?: IntegrationConfig;
}
