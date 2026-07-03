import { appConfig } from "../config";
import { Case, CaseStatus } from "../components/caseManagement/caseTypes";
import { INITIAL_CASES } from "../components/caseManagement/caseDataMock";
import { apiFetch } from "./http";

const CASE_STORAGE_KEY = "hybrid_soc_cases";

function readStoredCases(): Case[] {
  try {
    const raw = localStorage.getItem(CASE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Case[]) : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
}

function writeStoredCases(cases: Case[]) {
  localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(cases));
}

export async function listCases(): Promise<Case[]> {
  if (appConfig.dataMode === "live") return apiFetch<Case[]>("/api/cases");
  return readStoredCases();
}

export async function getCaseDetail(caseId: string): Promise<Case | null> {
  if (appConfig.dataMode === "live") return apiFetch<Case>(`/api/cases/${caseId}`);
  return readStoredCases().find((item) => item.id === caseId) ?? null;
}

export async function updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
  if (appConfig.dataMode === "live") {
    return apiFetch<Case>(`/api/cases/${caseId}`, { method: "PATCH", body: JSON.stringify(updates) });
  }
  const cases = readStoredCases();
  const next = cases.map((item) => (item.id === caseId ? { ...item, ...updates } : item));
  writeStoredCases(next);
  const updated = next.find((item) => item.id === caseId);
  if (!updated) throw new Error("Case not found.");
  return updated;
}

export async function assignCase(caseId: string, analyst: string) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Case>(`/api/cases/${encodeURIComponent(caseId)}/assign`, {
      method: "POST",
      body: JSON.stringify({ analyst }),
    });
  }
  return updateCase(caseId, { assignedTo: analyst });
}

export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  return updateCase(caseId, { status });
}

export async function addCaseTimelineEvent(caseId: string, event: string) {
  const current = await getCaseDetail(caseId);
  if (!current) throw new Error("Case not found.");
  return updateCase(caseId, {
    timeline: { events: [...current.timeline.events, event] },
  });
}

export async function addCaseNote(caseId: string, note: string, author = "SOC Analyst") {
  if (appConfig.dataMode === "live") {
    return apiFetch<Case>(`/api/cases/${encodeURIComponent(caseId)}/notes`, {
      method: "POST",
      body: JSON.stringify({ note, author }),
    });
  }
  const current = await getCaseDetail(caseId);
  if (!current) throw new Error("Case not found.");
  const timestamp = new Date().toISOString();
  return updateCase(caseId, {
    comments: [
      ...(current.comments ?? []),
      { id: `comm-${Date.now()}`, author, timestamp, text: note },
    ],
    timeline: {
      events: [...current.timeline.events, `${timestamp} - Analyst note added.`],
    },
  });
}

export async function closeCase(caseId: string, resolution: string) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Case>(`/api/cases/${encodeURIComponent(caseId)}/close`, {
      method: "POST",
      body: JSON.stringify({ resolution }),
    });
  }
  const current = await getCaseDetail(caseId);
  if (!current) throw new Error("Case not found.");
  const timestamp = new Date().toISOString();
  return updateCase(caseId, {
    status: "Resolved",
    timeline: {
      events: [...current.timeline.events, `${timestamp} - Case closed: ${resolution}.`],
    },
    notes: current.notes ? `${current.notes}\n\nResolution: ${resolution}` : `Resolution: ${resolution}`,
  });
}

export async function createCaseFromAlertRecord(caseRecord: Case) {
  if (appConfig.dataMode === "live") {
    return apiFetch<Case>("/api/cases", { method: "POST", body: JSON.stringify(caseRecord) });
  }
  const cases = readStoredCases();
  if (!cases.some((item) => item.id === caseRecord.id)) {
    writeStoredCases([caseRecord, ...cases].slice(0, 100));
  }
  return caseRecord;
}
