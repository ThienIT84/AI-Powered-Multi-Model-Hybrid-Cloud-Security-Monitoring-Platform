export interface Finding {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  description: string;
  status: "Open" | "Mitigated" | "Suppressed";
}

export interface CloudAsset {
  id: string;
  name: string;
  service: "EC2" | "RDS" | "S3" | "IAM" | "Lambda" | "EKS";
  region: string;
  owner: string;
  environment: "Production" | "Staging" | "Development";
  status: "Active" | "Stopped" | "Terminated" | "Provisioning";
  riskScore: number; // 0 to 100
  exposureScore: number; // 0 to 100
  complianceScore: number; // 0 to 100
  findings: Finding[];
  isInternetExposed: boolean;
  publicEndpoints?: string[];
  openPorts?: number[];
  securityConfig?: {
    encryption: string;
    mfaEnabled?: boolean;
    iamRole: string;
    vpcRing: string;
  };
}

export interface CloudThreat {
  id: string;
  timestamp: string;
  asset: string;
  threatType: "Credential Abuse" | "Suspicious IAM Activity" | "Public Storage Access" | "Privilege Escalation Attempt" | "Cloud Reconnaissance" | "Compromised Access Key";
  severity: "Critical" | "High" | "Medium" | "Low";
  source: string;
  status: "Active" | "Investigating" | "Resolved";
}

export interface ComplianceFramework {
  name: string; // CIS AWS Foundations, NIST, ISO 27001, SOC 2
  passRate: number; // percentage
  failedControls: number;
  warnings: number;
  recommendations: string[];
}
