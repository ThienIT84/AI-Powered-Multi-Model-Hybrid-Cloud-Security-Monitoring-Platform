import { DataMode } from "../config";
import { apiRequest } from "../api/client";
import { Alert } from "../types";
import { Case, CaseSeverity, CaseStatus } from "../components/caseManagement/caseTypes";

function normalizeCaseSeverity(value?: string): CaseSeverity {
  if (value === "Critical" || value === "High" || value === "Medium" || value === "Low") return value;
  return "Medium";
}

function normalizeCaseStatus(value?: string): CaseStatus {
  if (value === "Open" || value === "In Progress" || value === "Resolved" || value === "Pending Review") return value;
  return "Open";
}

export function mapAlertToCase(alert: Alert): Case {
  const timestamp = alert.timestamp || new Date().toISOString();
  const origPkts = alert.zeekData?.origPkts ?? 0;
  const respPkts = alert.zeekData?.respPkts ?? 0;

  return {
    id: `CASE-${alert.id}`,
    title: alert.description || `${alert.attackType} investigation`,
    severity: normalizeCaseSeverity(alert.severity),
    status: normalizeCaseStatus(alert.status === "resolved" ? "Resolved" : "Open"),
    assignedTo: alert.assignedAnalyst,
    timestamp,
    source_ip: alert.sourceIp,
    destination_ip: alert.destinationIp,
    attack_type: alert.attackType,
    zeek: {
      conn_log: [
        `${timestamp} - sensor: ${alert.zeekData?.sensorId ?? "unknown"}, conn_state: ${alert.zeekData?.connState ?? "unknown"}, orig_bytes: ${alert.zeekData?.origBytes ?? 0}`,
      ],
      http_log: alert.zeekData?.uri ? [`${alert.zeekData.method ?? "GET"} ${alert.zeekData.uri}`] : undefined,
      flows: origPkts + respPkts,
    },
    detection: {
      ai1: {
        label: alert.aiDecision.ai1?.verdict ?? "UNKNOWN",
        score: alert.aiDecision.ai1?.anomalyScore ?? alert.confidenceScore,
      },
      ai2a: {
        class: alert.aiDecision.ai2a?.attackType ?? alert.attackType,
        confidence: Math.round((alert.aiDecision.ai2a?.confidenceScore ?? alert.confidenceScore) * 100),
      },
      ai2b: alert.aiDecision.ai2b
        ? {
            class: alert.aiDecision.ai2b.webAttackType,
            confidence: Math.round(alert.aiDecision.ai2b.confidenceScore * 100),
          }
        : undefined,
    },
    suricata: {
      signatures: alert.suricataData.signatureId
        ? [`${alert.suricataData.signatureId} - ${alert.suricataData.signature ?? "Suricata evidence"}`]
        : [],
    },
    timeline: {
      events: [
        `${timestamp} - Case created from alert ${alert.id}`,
        ...alert.timeline.map((event) => `${event.timestamp} - ${event.description}`),
      ],
    },
    comments: [],
    isIpBlocked: false,
    notes: "Created through SOC case adapter.",
  };
}

export const casesService = {
  async listCases(_dataMode: DataMode): Promise<Case[]> {
    return apiRequest<Case[]>("/api/cases");
  },

  async getCase(caseId: string, _dataMode: DataMode): Promise<Case | null> {
    return apiRequest<Case>(`/api/cases/${encodeURIComponent(caseId)}`);
  },

  async createCaseFromAlert(alert: Alert, _dataMode: DataMode): Promise<Case> {
    return apiRequest<Case>("/api/cases", {
      method: "POST",
      body: { source: "alert", alertId: alert.id, evidence: mapAlertToCase(alert) },
    });
  },

  async updateCase(caseId: string, updates: Partial<Case>, _dataMode: DataMode): Promise<Case> {
    return apiRequest<Case>(`/api/cases/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      body: { updates },
    });
  },
};
