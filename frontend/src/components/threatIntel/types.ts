export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: string;
  riskLevel: string; // e.g. "Critical", "High", "Medium", "Low"
  industries: string[];
  techniques: string[];
  lastSeen: string;
  bio: string;
}

export interface IOC {
  id: string;
  type: "IP" | "Domain" | "URL" | "Hash" | "Email";
  value: string;
  confidence: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  sourceFeed: string;
  firstSeen: string;
  lastSeen: string;
  status: "Active" | "Expired" | "Revoked";
}

export interface ThreatFeed {
  id: string;
  name: string;
  status: "Active" | "Syncing" | "Offline";
  lastSync: string;
  iocCount: number;
  health: number; // percentage
  syncErrors: number;
}

export interface ThreatKnowledgeArticle {
  id: string;
  title: string;
  type: "Threat Report" | "Threat Profile" | "Advisory" | "Reference Article" | "TTP Reference";
  author: string;
  publishedDate: string;
  summary: string;
  tags: string[];
  references: string[];
}

export interface IntelCorrelation {
  id: string;
  iocValue: string;
  iocType: "IP" | "Domain" | "URL" | "Hash" | "Email";
  alignedActor: string;
  malwareFamily: string;
  campaignName: string;
  confidence: number;
  sourceFeed: string;
  detectedTime: string;
}
