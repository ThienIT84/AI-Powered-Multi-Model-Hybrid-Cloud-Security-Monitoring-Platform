import { UserRole } from "../types/auth";

export type SocAction =
  | "alert:triage"
  | "alert:resolve"
  | "alert:create_case"
  | "alert:response"
  | "case:update"
  | "case:assign"
  | "case:close"
  | "case:respond"
  | "case:comment";

const permissions: Record<UserRole, SocAction[]> = {
  Admin: ["alert:triage", "alert:resolve", "alert:create_case", "alert:response", "case:update", "case:assign", "case:close", "case:respond", "case:comment"],
  "Security Engineer": ["alert:triage", "alert:resolve", "alert:create_case", "alert:response", "case:update", "case:assign", "case:close", "case:respond", "case:comment"],
  "SOC Analyst": ["alert:triage", "alert:resolve", "alert:create_case", "case:update", "case:assign", "case:comment"],
  Viewer: [],
};

export function canPerform(role: UserRole | undefined | null, action: SocAction): boolean {
  if (!role) return false;
  return permissions[role]?.includes(action) ?? false;
}

export function permissionTitle(allowed: boolean) {
  return allowed ? undefined : "Your role does not permit this action.";
}
