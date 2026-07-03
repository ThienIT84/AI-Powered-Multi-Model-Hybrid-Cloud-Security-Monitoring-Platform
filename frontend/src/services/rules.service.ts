import { appConfig } from "../config";
import { apiFetch } from "./http";

export interface DetectionRuleDraft {
  ruleName: string;
  description: string;
  ruleType: string;
  conditions: {
    severity: string;
    attackType: string;
    protocol: string;
    sourceIp: string;
    destPort: string;
    cloudProvider: string;
    confidence: number;
  };
  mitreId: string;
  actions: Record<string, boolean>;
  isActive: boolean;
}

export interface DetectionRule extends DetectionRuleDraft {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface RuleTestResult {
  status: string;
  matches: number;
  tested_at: string;
}

const RULE_STORAGE_KEY = "hybrid_soc_detection_rules";

function readRules(): DetectionRule[] {
  try {
    return JSON.parse(localStorage.getItem(RULE_STORAGE_KEY) ?? "[]") as DetectionRule[];
  } catch {
    return [];
  }
}

function writeRules(rules: DetectionRule[]) {
  localStorage.setItem(RULE_STORAGE_KEY, JSON.stringify(rules));
}

export async function createDetectionRule(rule: DetectionRuleDraft): Promise<DetectionRule> {
  if (appConfig.dataMode === "live") {
    return apiFetch<DetectionRule>("/api/rules", { method: "POST", body: JSON.stringify(rule) });
  }
  const now = new Date().toISOString();
  const next: DetectionRule = {
    ...rule,
    id: `RULE-${Date.now()}`,
    created_at: now,
    updated_at: now,
  };
  writeRules([next, ...readRules()]);
  return next;
}

export async function testDetectionRule(rule: DetectionRuleDraft): Promise<RuleTestResult> {
  if (appConfig.dataMode === "live") {
    return apiFetch<RuleTestResult>("/api/rules/test", { method: "POST", body: JSON.stringify(rule) });
  }
  return {
    status: "success",
    matches: 0,
    tested_at: new Date().toISOString(),
  };
}
