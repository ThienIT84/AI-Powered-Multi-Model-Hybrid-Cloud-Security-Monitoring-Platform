import { appConfig, DataMode } from "../config";
import { Alert, AlertStatus } from "../types";

export type AlertActionState = "idle" | "pending" | "success" | "failed";

export interface AnalystActionResult {
  alertId: string;
  updates: Partial<Alert>;
  auditEventId?: string;
}

export interface AnalystNotePayload {
  note: string;
}

export interface FalsePositivePayload {
  reason: string;
}

export type AlertRulePayload = Record<string, unknown>;

const DEMO_ACTION_STORAGE_KEY = "soc_demo_alert_action_overrides";

function readDemoOverrides(): Record<string, Partial<Alert>> {
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_ACTION_STORAGE_KEY) ?? "{}") as Record<string, Partial<Alert>>;
  } catch {
    return {};
  }
}

function writeDemoOverride(alertId: string, updates: Partial<Alert>) {
  const current = readDemoOverrides();
  window.localStorage.setItem(
    DEMO_ACTION_STORAGE_KEY,
    JSON.stringify({
      ...current,
      [alertId]: {
        ...(current[alertId] ?? {}),
        ...updates,
      },
    })
  );
}

async function requestLiveAction(
  alertId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<AnalystActionResult> {
  const response = await fetch(`${appConfig.apiBaseUrl}/api/alerts/${encodeURIComponent(alertId)}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Alert action failed with HTTP ${response.status}`);
  }

  const result = (await response.json()) as Partial<AnalystActionResult>;
  return {
    alertId,
    updates: result.updates ?? ((payload.updates as Partial<Alert> | undefined) ?? {}),
    auditEventId: result.auditEventId,
  };
}

function requestDemoAction(alertId: string, updates: Partial<Alert>): Promise<AnalystActionResult> {
  writeDemoOverride(alertId, updates);
  return Promise.resolve({
    alertId,
    updates,
    auditEventId: `demo-audit-${Date.now()}`,
  });
}

function actionAdapter(dataMode: DataMode, alertId: string, action: string, updates: Partial<Alert>, payload: Record<string, unknown> = {}) {
  if (dataMode === "live") {
    return requestLiveAction(alertId, action, {
      ...payload,
      updates,
    });
  }
  return requestDemoAction(alertId, updates);
}

export const alertActionService = {
  getStoredDemoOverrides: readDemoOverrides,

  acknowledgeAlert(alertId: string, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "acknowledgeAlert", { status: AlertStatus.INVESTIGATING });
  },

  assignAlert(alertId: string, analystId: string, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "assignAlert", { assignedAnalyst: analystId }, { analystId });
  },

  updateAlertStatus(alertId: string, status: AlertStatus, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "updateAlertStatus", { status }, { status });
  },

  createCaseFromAlert(alertId: string, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "createCaseFromAlert", {}, { requestedAt: new Date().toISOString() });
  },

  markFalsePositive(alertId: string, reason: string, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "markFalsePositive", { status: AlertStatus.FALSE_POSITIVE }, { reason });
  },

  addAnalystNote(alertId: string, note: string, dataMode: DataMode) {
    return actionAdapter(dataMode, alertId, "addAnalystNote", {}, { note });
  },

  async createRule(ruleData: AlertRulePayload, dataMode: DataMode) {
    if (dataMode === "live") {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/alert-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ruleData,
          audit: {
            action: "createAlertRule",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!response.ok) throw new Error(`Rule creation failed with HTTP ${response.status}`);
      return response.json() as Promise<{ id?: string; status?: string }>;
    }
    return {
      id: `demo-rule-${Date.now()}`,
      status: "simulated",
    };
  },

  async testRule(ruleData: AlertRulePayload, dataMode: DataMode) {
    if (dataMode === "live") {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/alert-rules/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ruleData,
          audit: {
            action: "testAlertRule",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!response.ok) throw new Error(`Rule test failed with HTTP ${response.status}`);
      return response.json() as Promise<{ matchedEvents?: number; status?: string }>;
    }
    return {
      matchedEvents: 0,
      status: "simulated",
    };
  },
};
