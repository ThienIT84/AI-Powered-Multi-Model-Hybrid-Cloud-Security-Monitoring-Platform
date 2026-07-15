import { DataMode } from "../config";
import { apiRequest } from "../api/client";
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

async function requestLiveAction(
  alertId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<AnalystActionResult> {
  const result = await apiRequest<Partial<AnalystActionResult>>(`/api/alerts/${encodeURIComponent(alertId)}/actions`, {
    method: "POST",
    body: {
      action,
      ...payload,
    },
  });
  return {
    alertId,
    updates: result.updates ?? ((payload.updates as Partial<Alert> | undefined) ?? {}),
    auditEventId: result.auditEventId,
  };
}

function actionAdapter(_dataMode: DataMode, alertId: string, action: string, updates: Partial<Alert>, payload: Record<string, unknown> = {}) {
  return requestLiveAction(alertId, action, { ...payload, updates });
}

export const alertActionService = {
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

  async createRule(ruleData: AlertRulePayload, _dataMode: DataMode) {
    return apiRequest<{ id?: string; status?: string }>("/api/alert-rules", {
      method: "POST",
      body: ruleData,
    });
  },

  async testRule(ruleData: AlertRulePayload, _dataMode: DataMode) {
    return apiRequest<{ matchedEvents?: number; status?: string }>("/api/alert-rules/test", {
      method: "POST",
      body: ruleData,
    });
  },
};
