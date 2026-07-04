import { AppView } from "../types/views";

export const VIEW_ROUTE_MAP: Record<AppView, string> = {
  dashboard: "/dashboard",
  alerts: "/alerts",
  network: "/network",
  endpoints: "/endpoints",
  cloud: "/cloud",
  "threat-intel": "/threat-intel",
  integrations: "/integrations",
  playbooks: "/playbooks",
  reports: "/reports",
  settings: "/settings",
  "ai-threat-detection": "/ai-threat-detection",
  "attack-surface": "/attack-surface",
  "mitre-attack": "/mitre",
  "case-management": "/cases",
};

export interface RouteState {
  view: AppView;
  alertId: string | null;
  caseId: string | null;
}

export function parseRoute(pathname: string): RouteState {
  const parts = pathname.split("/").filter(Boolean);
  const [section, id] = parts;

  if (section === "alerts") return { view: "alerts", alertId: id ?? null, caseId: null };
  if (section === "cases") return { view: "case-management", alertId: null, caseId: id ?? null };
  if (section === "network") return { view: "network", alertId: null, caseId: null };
  if (section === "endpoints") return { view: "endpoints", alertId: null, caseId: null };
  if (section === "cloud") return { view: "cloud", alertId: null, caseId: null };
  if (section === "threat-intel") return { view: "threat-intel", alertId: null, caseId: null };
  if (section === "integrations") return { view: "integrations", alertId: null, caseId: null };
  if (section === "playbooks") return { view: "playbooks", alertId: null, caseId: null };
  if (section === "reports") return { view: "reports", alertId: null, caseId: null };
  if (section === "settings") return { view: "settings", alertId: null, caseId: null };
  if (section === "ai-threat-detection") return { view: "ai-threat-detection", alertId: null, caseId: null };
  if (section === "attack-surface") return { view: "attack-surface", alertId: null, caseId: null };
  if (section === "mitre") return { view: "mitre-attack", alertId: null, caseId: null };
  return { view: "dashboard", alertId: null, caseId: null };
}

export function buildViewPath(view: AppView, id?: string | null) {
  if (view === "alerts" && id) return `/alerts/${encodeURIComponent(id)}`;
  if (view === "case-management" && id) return `/cases/${encodeURIComponent(id)}`;
  return VIEW_ROUTE_MAP[view];
}
