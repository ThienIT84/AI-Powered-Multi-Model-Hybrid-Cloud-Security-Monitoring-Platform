import { Alert, Severity, AlertStatus } from "../../../types";

export interface DashboardMetrics {
  totalNetworkFlows: number;
  totalFusionAlerts: number;
  criticalAlerts: number;
  openCases: number | null;
  observedDestinations: number;
  cloudAssets: number | null;
  threatIntelMatches: number | null;
}

export type PlatformStatusValue = "Healthy" | "Warning" | "Offline";

export interface PlatformHealthStatus {
  Zeek: PlatformStatusValue;
  Suricata: PlatformStatusValue;
  Fusion: PlatformStatusValue;
  Database: PlatformStatusValue;
  WebSocket: PlatformStatusValue;
  AWS: PlatformStatusValue;
}

export interface FusionOverviewMetrics {
  fusionAlerts24h: number;
  aiAgreementRate: number | null;
  falsePositiveReduction: number | null;
  averageConfidence: number | null;
}

export interface SecurityPostureMetrics {
  overallRisk: number | null;
  networkRisk: number | null;
  endpointRisk: number | null;
  cloudRisk: number | null;
}

export interface OpenCasesMetrics {
  open: number | null;
  inProgress: number | null;
  resolvedToday: number | null;
  slaCompliance: number | null;
}

export interface SeverityDistributionItem {
  name: "Critical" | "High" | "Medium" | "Low";
  value: number; // count
  percentage: number;
  trend: string | null;
}
