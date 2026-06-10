import { CloudAsset, CloudThreat, ComplianceFramework } from "./types";

export const MOCK_CLOUD_ASSETS: CloudAsset[] = [
  {
    id: "asset-01",
    name: "prod-eks-payment-cluster",
    service: "EKS",
    region: "us-east-1",
    owner: "SecOps Core",
    environment: "Production",
    status: "Active",
    riskScore: 84,
    exposureScore: 92,
    complianceScore: 78,
    isInternetExposed: true,
    publicEndpoints: ["https://api.payment.eks.us-east-1.amazonaws.com"],
    openPorts: [443, 6443, 10250],
    securityConfig: {
      encryption: "KMS Dedicated CMK",
      mfaEnabled: true,
      iamRole: "eks-master-executor-role",
      vpcRing: "vpc-09fa4e21 (prod-transit)"
    },
    findings: [
      {
        id: "find-eks-01",
        severity: "Critical",
        category: "Public API Server Exposure",
        description: "The EKS control plane API server is configured as publicly accessible without target CIDR constraints.",
        status: "Open"
      },
      {
        id: "find-eks-02",
        severity: "High",
        category: "Missing CoreDNS Network Policies",
        description: "Pod-to-pod communications internally lack explicit network isolation policies inside default namespace.",
        status: "Open"
      },
      {
        id: "find-eks-03",
        severity: "Medium",
        category: "Outdated Kubernetes Patch Level",
        description: "EKS cluster is running node version v1.28.4 which has known vulnerabilities.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-02",
    name: "corp-billing-records",
    service: "S3",
    region: "eu-west-1",
    owner: "Finance Platform",
    environment: "Production",
    status: "Active",
    riskScore: 95,
    exposureScore: 100,
    complianceScore: 62,
    isInternetExposed: true,
    publicEndpoints: ["https://corp-billing-records.s3.eu-west-1.amazonaws.com"],
    openPorts: [80, 443],
    securityConfig: {
      encryption: "SSE-S3 Default (Shared)",
      mfaEnabled: false,
      iamRole: "s3-billing-writer-policy",
      vpcRing: "None (Direct Object storage endpoint)"
    },
    findings: [
      {
        id: "find-s3-01",
        severity: "Critical",
        category: "Public Access Block Disabled",
        description: "S3 public block override capability is completely disabled, exposing billing spreadsheets directly to the index.",
        status: "Open"
      },
      {
        id: "find-s3-02",
        severity: "High",
        category: "Missing Object Versioning",
        description: "Versioning is disabled on compliance-regulated ledger files, leaving them vulnerable to unrecoverable overwrites.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-03",
    name: "staging-app-host-ec2",
    service: "EC2",
    region: "us-west-2",
    owner: "DevOps Fleet",
    environment: "Staging",
    status: "Active",
    riskScore: 68,
    exposureScore: 75,
    complianceScore: 84,
    isInternetExposed: true,
    publicEndpoints: ["54.195.20.106", "ec2-app-staging.us-west-2.compute.amazonaws.com"],
    openPorts: [22, 80, 443, 8080],
    securityConfig: {
      encryption: "EBS Encrypted (Default)",
      mfaEnabled: false,
      iamRole: "devops-ec2-diagnostic-role",
      vpcRing: "vpc-ef81a42 (staging-main)"
    },
    findings: [
      {
        id: "find-ec2-01",
        severity: "High",
        category: "Open SSH Port Configuration",
        description: "Security Groupsg-92b11a permits inbound SSH connections on Port 22 from the global Internet CIDR 0.0.0.0/0.",
        status: "Open"
      },
      {
        id: "find-ec2-02",
        severity: "Medium",
        category: "Excessive EC2 Instance Profile Permissions",
        description: "IAM Instance Profile attached to EC2 possesses full raw access over S3 buckets.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-04",
    name: "prod-customer-metrics-db",
    service: "RDS",
    region: "us-east-1",
    owner: "DB Admin Collective",
    environment: "Production",
    status: "Active",
    riskScore: 22,
    exposureScore: 0,
    complianceScore: 95,
    isInternetExposed: false,
    securityConfig: {
      encryption: "KMS Dedicated CMK",
      mfaEnabled: true,
      iamRole: "rds-cloudwatch-export-role",
      vpcRing: "vpc-09fa4e21 (prod-isolated)"
    },
    findings: [
      {
        id: "find-rds-01",
        severity: "Medium",
        category: "Postgres Diagnostic Logging Off",
        description: "Detailed operational telemetry logs for DDL audit trail and query parameters are partially disabled.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-05",
    name: "auth-token-validator",
    service: "Lambda",
    region: "us-east-1",
    owner: "Core Security Engineering",
    environment: "Production",
    status: "Active",
    riskScore: 45,
    exposureScore: 10,
    complianceScore: 90,
    isInternetExposed: false,
    securityConfig: {
      encryption: "KMS Default Shared Key",
      mfaEnabled: true,
      iamRole: "lambda-token-verifier-execution-role",
      vpcRing: "vpc-09fa4e21 (prod-transit)"
    },
    findings: [
      {
        id: "find-lam-01",
        severity: "Medium",
        category: "Hardcoded Environment Configuration Secrets",
        description: "Lambda environment variable map contains standard database tokens inside clean text format.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-06",
    name: "global-dns-admin-role",
    service: "IAM",
    region: "Global",
    owner: "Identity Services",
    environment: "Production",
    status: "Active",
    riskScore: 75,
    exposureScore: 0,
    complianceScore: 70,
    isInternetExposed: false,
    securityConfig: {
      encryption: "Hardware Security Module Multi-Key",
      mfaEnabled: false,
      iamRole: "N/A (Direct IAM Entity)",
      vpcRing: "N/A"
    },
    findings: [
      {
        id: "find-iam-01",
        severity: "High",
        category: "Multi-Factor Authentication Absent",
        description: "User accounts mapped to global Route53 zone administration are active without hardware or software MFA checks.",
        status: "Open"
      },
      {
        id: "find-iam-02",
        severity: "High",
        category: "Excessive Policy Privileges",
        description: "Role mapped as Admin possesses direct IAM role assignment rights, permitting privilege escalation loop.",
        status: "Open"
      }
    ]
  },
  {
    id: "asset-07",
    name: "dev-sandboxed-node",
    service: "EC2",
    region: "ap-southeast-1",
    owner: "R&D Lab Team",
    environment: "Development",
    status: "Stopped",
    riskScore: 35,
    exposureScore: 50,
    complianceScore: 82,
    isInternetExposed: true,
    publicEndpoints: ["13.228.40.90"],
    openPorts: [80, 8080],
    securityConfig: {
      encryption: "Unencrypted EBS Mounts Detected",
      mfaEnabled: false,
      iamRole: "lab-sandbox-restricted",
      vpcRing: "vpc-99ac212 (dev-sandbox)"
    },
    findings: [
      {
        id: "find-ec2-sub-01",
        severity: "Medium",
        category: "Unencrypted Storage Volume",
        description: "Secondary EBS data partitions attached to storage indices remain unencrypted at rest.",
        status: "Open"
      }
    ]
  }
];

export const MOCK_CLOUD_THREATS: CloudThreat[] = [
  {
    id: "threat-01",
    timestamp: "2026-06-10 13:12 UTC",
    asset: "global-dns-admin-role",
    threatType: "Credential Abuse",
    severity: "Critical",
    source: "CloudTrail Anomalous IP Heuristic",
    status: "Investigating"
  },
  {
    id: "threat-02",
    timestamp: "2026-06-10 11:45 UTC",
    asset: "prod-eks-payment-cluster",
    threatType: "Privilege Escalation Attempt",
    severity: "High",
    source: "Kubernetes Audit Controller",
    status: "Active"
  },
  {
    id: "threat-03",
    timestamp: "2026-06-10 09:20 UTC",
    asset: "corp-billing-records",
    threatType: "Public Storage Access",
    severity: "Critical",
    source: "GuardDuty Object Read Wavefront",
    status: "Active"
  },
  {
    id: "threat-04",
    timestamp: "2026-06-10 07:15 UTC",
    asset: "staging-app-host-ec2",
    threatType: "Cloud Reconnaissance",
    severity: "Medium",
    source: "VPC Flow Log Port Sweep Classifier",
    status: "Resolved"
  },
  {
    id: "threat-05",
    timestamp: "2026-06-10 04:30 UTC",
    asset: "auth-token-validator",
    threatType: "Suspicious IAM Activity",
    severity: "High",
    source: "Admin Proxy Policy Evaluator",
    status: "Active"
  },
  {
    id: "threat-06",
    timestamp: "2026-06-09 23:14 UTC",
    asset: "dev-sandboxed-node",
    threatType: "Compromised Access Key",
    severity: "High",
    source: "GitHub Public Secrets Crawler Sync",
    status: "Resolved"
  }
];

export const MOCK_COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    name: "CIS AWS Foundations",
    passRate: 74.5,
    failedControls: 12,
    warnings: 8,
    recommendations: [
      "Enforce explicit MFA on Root and Privilege Administrations",
      "Deactivate API Credentials unused for greater than 90 days",
      "Restrict Security Group egress rules from generic public broad scopes"
    ]
  },
  {
    name: "NIST SP 800-53",
    passRate: 81.2,
    failedControls: 24,
    warnings: 15,
    recommendations: [
      "Mandate Customer Managed Keys (CMK) for active RDS indices",
      "Establish VPC isolation boundaries between Staging and Production tenants"
    ]
  },
  {
    name: "ISO 27501 Cloud Extension",
    passRate: 88.0,
    failedControls: 6,
    warnings: 4,
    recommendations: [
      "Adopt KMS envelope security policies inside S3 storage targets",
      "Enforce quarterly access review cycles internally"
    ]
  },
  {
    name: "SOC 2 Type II Security",
    passRate: 92.4,
    failedControls: 3,
    warnings: 9,
    recommendations: [
      "Rotate long-standing EC2 diagnostic security keys",
      "Enable EKS encryption providers for envelope secrets storage"
    ]
  }
];
