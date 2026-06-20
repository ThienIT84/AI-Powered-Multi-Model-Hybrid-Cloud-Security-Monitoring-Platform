import { Alert, Severity, AlertStatus } from "../../../types";

export interface DashboardMetrics {
  totalNetworkFlows: number;
  totalFusionAlerts: number;
  criticalAlerts: number;
  openCases: number;
  activeEndpoints: number;
  cloudAssets: number;
  threatIntelMatches: number;
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
  aiAgreementRate: number; // percentage
  falsePositiveReduction: number; // percentage
  averageConfidence: number; // percentage
}

export interface SecurityPostureMetrics {
  overallRisk: number; // 0-100
  networkRisk: number; // 0-100
  endpointRisk: number; // 0-100
  cloudRisk: number; // 0-100
}

export interface OpenCasesMetrics {
  open: number;
  inProgress: number;
  resolvedToday: number;
  slaCompliance: number; // percentage
}

export interface SeverityDistributionItem {
  name: "Critical" | "High" | "Medium" | "Low";
  value: number; // count
  percentage: number;
  trend: string; // e.g., "+3%", "-2%"
}
