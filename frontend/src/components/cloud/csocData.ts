export interface OperationalFinding {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  resource: string;
  service: "S3" | "RDS" | "EKS" | "EC2" | "IAM" | "Lambda" | "CloudTrail";
  category: string;
  status: "Open" | "In Progress" | "Investigating" | "Resolved";
  lastSeen: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  resource: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Flagged" | "Monitored" | "Blocked";
}

export interface IncidentFeedItem {
  id: string;
  timestamp: string;
  resource: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  finding: string;
  status: "Active" | "Contained" | "Investigating" | "Resolved";
}

export interface ServiceHealthItem {
  name: "EC2" | "S3" | "RDS" | "IAM" | "CloudTrail" | "EKS";
  fullName: string;
  status: "Healthy" | "Warning" | "Critical";
  activeChecks: number;
  openIssues: number;
}

// 24 Hour Time-Series trend representing CSOC Security findings wave
export const THREAT_TREND_DATA = [
  { hour: "14:00", Critical: 2, High: 6, Medium: 12 },
  { hour: "16:00", Critical: 2, High: 7, Medium: 14 },
  { hour: "18:00", Critical: 3, High: 9, Medium: 15 },
  { hour: "20:00", Critical: 3, High: 8, Medium: 18 },
  { hour: "22:00", Critical: 2, High: 8, Medium: 20 },
  { hour: "00:00", Critical: 4, High: 10, Medium: 22 },
  { hour: "02:00", Critical: 4, High: 12, Medium: 25 },
  { hour: "04:00", Critical: 5, High: 11, Medium: 28 },
  { hour: "06:00", Critical: 3, High: 13, Medium: 24 },
  { hour: "08:00", Critical: 2, High: 10, Medium: 19 },
  { hour: "10:00", Critical: 2, High: 9, Medium: 15 },
  { hour: "12:00", Critical: 3, High: 8, Medium: 14 },
  { hour: "14:00", Critical: 3, High: 8, Medium: 13 }
];

export const MOCK_OPERATIONAL_FINDINGS: OperationalFinding[] = [
  {
    id: "find-op-01",
    severity: "Critical",
    resource: "aws-s3-pii-records",
    service: "S3",
    category: "Public Exposure",
    status: "Open",
    lastSeen: "2 mins ago"
  },
  {
    id: "find-op-02",
    severity: "High",
    resource: "prod-rds-payment",
    service: "RDS",
    category: "Misconfiguration",
    status: "Open",
    lastSeen: "12 mins ago"
  },
  {
    id: "find-op-03",
    severity: "Medium",
    resource: "eks-cluster-core",
    service: "EKS",
    category: "Privilege Risk",
    status: "Investigating",
    lastSeen: "45 mins ago"
  },
  {
    id: "find-op-04",
    severity: "Critical",
    resource: "global-dns-admin-entity",
    service: "IAM",
    category: "Credential Abuse",
    status: "In Progress",
    lastSeen: "1 hour ago"
  },
  {
    id: "find-op-05",
    severity: "High",
    resource: "prod-api-endpoint",
    service: "EC2",
    category: "Security Group Modification",
    status: "Open",
    lastSeen: "2 hours ago"
  },
  {
    id: "find-op-06",
    severity: "Low",
    resource: "dev-billing-archive",
    service: "S3",
    category: "Encryption Disabled",
    status: "Resolved",
    lastSeen: "5 hours ago"
  },
  {
    id: "find-op-07",
    severity: "Medium",
    resource: "token-validator-lambda",
    service: "Lambda",
    category: "Insecure Env Variable",
    status: "Investigating",
    lastSeen: "8 hours ago"
  }
];

export const LIVE_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: "evt-01",
    timestamp: "13:52:10 UTC",
    eventType: "IAM Policy Change",
    actor: "AdminSession-891",
    resource: "RolePrivilegeEscalationGuard",
    severity: "High",
    status: "Flagged"
  },
  {
    id: "evt-02",
    timestamp: "13:51:30 UTC",
    eventType: "Public Bucket Exposure",
    actor: "s3-sync-daemon",
    resource: "customer-analytics-raw",
    severity: "Critical",
    status: "Blocked"
  },
  {
    id: "evt-03",
    timestamp: "13:48:15 UTC",
    eventType: "Security Group Modification",
    actor: "deploy-runner-03",
    resource: "sg-payment-inbound",
    severity: "High",
    status: "Flagged"
  },
  {
    id: "evt-04",
    timestamp: "13:45:00 UTC",
    eventType: "Role Escalation",
    actor: "LambdaProcessExecutor",
    resource: "arn:aws:iam::3720:role/lambda-role",
    severity: "High",
    status: "Flagged"
  },
  {
    id: "evt-05",
    timestamp: "13:40:22 UTC",
    eventType: "Access Key Creation",
    actor: "phutd0212@gmail.com",
    resource: "root-temp-credential",
    severity: "High",
    status: "Monitored"
  },
  {
    id: "evt-06",
    timestamp: "13:30:19 UTC",
    eventType: "CloudTrail Anomaly",
    actor: "Anomalous-IP-AS3215",
    resource: "DescribeInstancesFromForeignRegion",
    severity: "Medium",
    status: "Monitored"
  },
  {
    id: "evt-07",
    timestamp: "13:15:44 UTC",
    eventType: "Credential Rotation Failure",
    actor: "system-key-rotator",
    resource: "kms-master-vault",
    severity: "Medium",
    status: "Flagged"
  }
];

export const SERVICE_HEALTH_LIST: ServiceHealthItem[] = [
  { name: "EKS", fullName: "Elastic Kubernetes Service", status: "Warning", activeChecks: 142, openIssues: 1 },
  { name: "S3", fullName: "Simple Storage Service", status: "Critical", activeChecks: 89, openIssues: 2 },
  { name: "EC2", fullName: "Elastic Compute Cloud", status: "Warning", activeChecks: 204, openIssues: 1 },
  { name: "RDS", fullName: "Relational Database Service", status: "Healthy", activeChecks: 76, openIssues: 0 },
  { name: "IAM", fullName: "Identity & Access Management", status: "Healthy", activeChecks: 322, openIssues: 0 },
  { name: "CloudTrail", fullName: "Audit & Compliance Logging", status: "Healthy", activeChecks: 110, openIssues: 0 }
];

export const MOCK_CLOUD_INCIDENTS: IncidentFeedItem[] = [
  {
    id: "inc-01",
    timestamp: "2026-06-10 13:48 UTC",
    resource: "aws-s3-pii-records",
    severity: "Critical",
    finding: "Unrestricted Public Read ACL applied by automated script deploy-runner-03",
    status: "Active"
  },
  {
    id: "inc-02",
    timestamp: "2026-06-10 13:12 UTC",
    resource: "global-dns-admin-entity",
    severity: "High",
    finding: "Anomalous credential abuse flagged from non-corporate residential IP block",
    status: "Investigating"
  },
  {
    id: "inc-03",
    timestamp: "2026-06-10 11:45 UTC",
    resource: "eks-cluster-core",
    severity: "Critical",
    finding: "Attempted Kubernetes Privilege Escalation payload on kube-system proxy namespace",
    status: "Contained"
  },
  {
    id: "inc-04",
    timestamp: "2026-06-10 09:20 UTC",
    resource: "prod-rds-payment",
    severity: "High",
    finding: "SQL port 5432 exposed to external egress gateway following config rollbacks",
    status: "Resolved"
  },
  {
    id: "inc-05",
    timestamp: "2026-06-10 07:15 UTC",
    resource: "dev-billing-archive",
    severity: "Medium",
    finding: "Storage bucket detected with SSE-S3 default fallback instead of customer KMS",
    status: "Resolved"
  }
];
