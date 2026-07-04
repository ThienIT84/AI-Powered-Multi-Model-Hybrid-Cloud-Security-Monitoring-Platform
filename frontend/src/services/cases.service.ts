import { appConfig, DataMode } from "../config";
import { Alert } from "../types";
import { Case, CaseSeverity, CaseStatus } from "../components/caseManagement/caseTypes";
import { INITIAL_CASES } from "../components/caseManagement/caseDataMock";

const DEMO_CASES_STORAGE_KEY = "soc_demo_cases";

function readDemoCases(): Case[] {
  try {
    const stored = window.localStorage.getItem(DEMO_CASES_STORAGE_KEY);
    return stored ? JSON.parse(stored) as Case[] : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
}

function writeDemoCases(cases: Case[]) {
  window.localStorage.setItem(DEMO_CASES_STORAGE_KEY, JSON.stringify(cases));
}

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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Case API returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export const casesService = {
  async listCases(dataMode: DataMode): Promise<Case[]> {
    if (dataMode === "live") return requestJson<Case[]>("/api/cases");
    return readDemoCases();
  },

  async getCase(caseId: string, dataMode: DataMode): Promise<Case | null> {
    if (dataMode === "live") return requestJson<Case>(`/api/cases/${encodeURIComponent(caseId)}`);
    return readDemoCases().find((item) => item.id === caseId) ?? null;
  },

  async createCaseFromAlert(alert: Alert, dataMode: DataMode): Promise<Case> {
    if (dataMode === "live") {
      return requestJson<Case>("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          source: "alert",
          alertId: alert.id,
          evidence: mapAlertToCase(alert),
        }),
      });
    }
    const newCase = mapAlertToCase(alert);
    const cases = readDemoCases();
    if (!cases.some((item) => item.id === newCase.id)) {
      writeDemoCases([newCase, ...cases]);
    }
    return newCase;
  },

  async updateCase(caseId: string, updates: Partial<Case>, dataMode: DataMode): Promise<Case> {
    if (dataMode === "live") {
      return requestJson<Case>(`/api/cases/${encodeURIComponent(caseId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          updates,
          audit: {
            action: "updateCase",
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }
    const cases = readDemoCases();
    const updated = cases.map((item) => item.id === caseId ? { ...item, ...updates } : item);
    writeDemoCases(updated);
    const match = updated.find((item) => item.id === caseId);
    if (!match) throw new Error(`Case ${caseId} not found`);
    return match;
  },
};
