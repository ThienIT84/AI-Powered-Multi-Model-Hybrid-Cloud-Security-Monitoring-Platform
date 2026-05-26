export interface PlaybookAction {
  id: string;
  step: number;
  name: string;
  description: string;
  type: "slack" | "jira" | "firewall" | "aws_iam" | "isolate" | "webhook" | "email";
  status: "idle" | "running" | "completed" | "failed";
  target?: string;
  severity?: "critical" | "high" | "medium" | "low";
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  triggerType: "automated" | "manual";
  triggerCondition: string;
  executions: number;
  updatedAt: string;
  severity: "critical" | "high" | "medium" | "low";
  actions: PlaybookAction[];
  avgDurationMs?: number;
  confidenceThreshold?: number;
  riskScoreThreshold?: number;
  lastExecutedTime?: string;
  lastExecutionStatus?: "success" | "failed" | "running" | "warning";
}
