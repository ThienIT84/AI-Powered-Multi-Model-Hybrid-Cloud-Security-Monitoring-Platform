import { Alert, AlertStatus } from "../types";
import { BackendAlertDTO } from "../types";
import { appConfig } from "../config";
import { apiFetch } from "./http";
import { mapBackendAlertToAlert } from "../lib/alertMapper";

export type AlertActionState = "idle" | "pending" | "success" | "failed";

export interface AnalystNote {
  id: string;
  alertId: string;
  analyst: string;
  note: string;
  timestamp: string;
}

const ALERT_STORAGE_KEY = "hybrid_soc_alert_action_state";

function readDemoState(): Record<string, Partial<Alert>> {
  try {
    return JSON.parse(localStorage.getItem(ALERT_STORAGE_KEY) ?? "{}") as Record<string, Partial<Alert>>;
  } catch {
    return {};
  }
}

function writeDemoState(state: Record<string, Partial<Alert>>) {
  localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(state));
}

async function persistDemo(alertId: string, update: Partial<Alert>) {
  const state = readDemoState();
  state[alertId] = { ...(state[alertId] ?? {}), ...update };
  writeDemoState(state);
  return state[alertId];
}

export function applyPersistedAlertActions(alerts: Alert[]): Alert[] {
  const state = readDemoState();
  return alerts.map((alert) => ({ ...alert, ...(state[alert.id] ?? {}) }));
}

export async function getAlertDetail(alertId: string, fallbackAlerts: Alert[] = []): Promise<Alert | null> {
  if (appConfig.dataMode === "live") {
    const dto = await apiFetch<BackendAlertDTO>(`/api/alerts/${encodeURIComponent(alertId)}`);
    return mapBackendAlertToAlert(dto);
  }
  const normalizedId = alertId.toLowerCase();
  const match = fallbackAlerts.find((alert) => alert.id.toLowerCase() === normalizedId || `thr-${alert.id.toLowerCase()}` === normalizedId);
  return match ? applyPersistedAlertActions([match])[0] : null;
}

export async function acknowledgeAlert(alertId: string) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Alert>(`/api/alerts/${alertId}/acknowledge`, { method: "POST" });
  }
  return persistDemo(alertId, { status: AlertStatus.INVESTIGATING });
}

export async function assignAlert(alertId: string, analyst: string) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Alert>(`/api/alerts/${alertId}/assign`, { method: "POST", body: JSON.stringify({ analyst }) });
  }
  return persistDemo(alertId, { assignedAnalyst: analyst });
}

export async function updateAlertStatus(alertId: string, status: AlertStatus) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Alert>(`/api/alerts/${alertId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  }
  return persistDemo(alertId, { status });
}

export async function createCaseFromAlert(alertId: string) {
  if (appConfig.dataMode === "live") {
    return apiFetch<{ caseId: string }>(`/api/alerts/${alertId}/case`, { method: "POST" });
  }
  const caseId = `CASE-${alertId}`;
  await persistDemo(alertId, { status: AlertStatus.ESCALATED });
  return { caseId };
}

export async function markFalsePositive(alertId: string, reason = "") {
  if (appConfig.dataMode === "live") {
    return apiFetch<Alert>(`/api/alerts/${alertId}/false-positive`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }
  return persistDemo(alertId, { status: AlertStatus.FALSE_POSITIVE });
}

export async function addAnalystNote(alertId: string, note: string, analyst = "SOC Analyst") {
  if (appConfig.dataMode === "live") {
    return apiFetch<AnalystNote>(`/api/alerts/${alertId}/notes`, { method: "POST", body: JSON.stringify({ note, analyst }) });
  }
  return {
    id: `note-${alertId}-${Date.now()}`,
    alertId,
    analyst,
    note,
    timestamp: new Date().toISOString(),
  };
}
