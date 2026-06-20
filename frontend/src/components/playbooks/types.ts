export type PlaybookCategory =
  | "Web Attacks"
  | "Network Attacks"
  | "Authentication Attacks"
  | "Cloud Security"
  | "Data Exposure"
  | "Malware"
  | "Insider Threat";

export interface Playbook {
  id: string;
  name: string;
  category: PlaybookCategory;
  severity: "critical" | "high" | "medium" | "low";
  version: string;
  lastUpdated: string;
  status: "Published" | "Draft";
  purpose: string;
  estimatedTime: string; // e.g., "15m", "45m"
  owner: string; // e.g., "SecOps Core Team", "Tier-2 Analyst Squad"
  detectionSources: string[];
  triageSteps: string[];
  investigationSteps: string[];
  containmentProcedures: string[];
  eradicationProcedures: string[];
  recoveryProcedures: string[];
  lessonsLearnedTemplate: string[];
}

export interface PlaybookKPIsData {
  totalPlaybooks: number;
  publishedCount: number;
  draftCount: number;
  categoriesCount: number;
  recentlyUpdatedCount: number;
}

export interface PlaybookUsageEvent {
  id: string;
  timestamp: string;
  playbookName: string;
  relatedCase: string;
  analyst: string;
  status: "APPLIED" | "COMPLETED" | "ACTIVE";
}
