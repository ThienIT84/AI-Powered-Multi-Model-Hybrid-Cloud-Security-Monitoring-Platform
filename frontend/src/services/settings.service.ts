import { z } from "zod";
import { apiRequest } from "../api/client";
import { SettingsStateData } from "../types/settings";

const operatorSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.enum(["Admin", "SOC Analyst", "Security Engineer", "Viewer"]),
  status: z.enum(["Active", "Suspended"]),
  lastLogin: z.string(),
});

const persistedPreferencesSchema = z.object({
  systemName: z.string(),
  version: z.string(),
  environment: z.enum(["Development", "Staging", "Production"]),
  timezone: z.enum(["UTC", "UTC+7", "UTC+8", "UTC-5"]),
  language: z.enum(["en", "vi", "es", "ja"]),
  refreshInterval: z.number(),
  organization: z.string(),
  theme: z.enum(["Dark", "Light", "System"]),
  density: z.enum(["Compact", "Comfortable"]),
  sidebarMode: z.enum(["Expanded", "Collapsed"]),
  animations: z.enum(["Enable", "Disable"]),
  severityColorCritical: z.string(),
  severityColorHigh: z.string(),
  severityColorMedium: z.string(),
  severityColorLow: z.string(),
  ai1Threshold: z.number(),
  ai2aConfidence: z.number(),
  ai2bThreshold: z.number(),
  consensusThreshold: z.number(),
  thresholdCritical: z.number(),
  thresholdHigh: z.number(),
  thresholdMedium: z.number(),
  thresholdLow: z.number(),
  alertRetention: z.enum(["7 Days", "30 Days", "90 Days", "180 Days", "365 Days"]),
  alertAutoClose: z.boolean(),
  alertAutoCloseDuration: z.enum(["1h", "6h", "24h"]),
  soundCritical: z.boolean(),
  soundHigh: z.boolean(),
  soundMedium: z.boolean(),
  soundLow: z.boolean(),
  channelEmail: z.boolean(),
  channelSlack: z.boolean(),
  channelTeams: z.boolean(),
  escalateDelayCritical: z.number(),
  escalateDelayHigh: z.number(),
  escalateDelayMedium: z.number(),
  sessionTimeout: z.number(),
  mfaRequired: z.boolean(),
  passwordRotationValue: z.enum(["30 Days", "60 Days", "90 Days", "None"]),
  operatorUsers: z.array(operatorSchema),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
  reportFormat: z.enum(["PDF", "CSV", "XLSX"]),
  reportSchedule: z.enum(["Daily", "Weekly", "Monthly"]),
  reportAutoGenerate: z.boolean(),
  reportRetentionMonths: z.number(),
  reportStoragePath: z.enum(["Local Secure Vault", "AWS S3 Glacier", "Enterprise Database"]),
  emailSubscribers: z.string(),
  auditLogRetention: z.number(),
  trackConfigChanges: z.boolean(),
  complianceMapping: z.enum(["NIST SP 800-53", "ISO 27001", "SOC2 Type II", "CIS Controls"]),
  mitreTrackingEnabled: z.boolean(),
  enableDailyPolicyValidation: z.boolean(),
}).partial();

const runtimeSchema = z.object({
  deploymentTarget: z.enum(["local", "aws"]).optional(),
  awsRegion: z.string().optional(),
  sqsConfigured: z.boolean().optional(),
  s3DataBucketConfigured: z.boolean().optional(),
  rdsConfigured: z.boolean().optional(),
  ingestHmacConfigured: z.boolean().optional(),
  predictorModes: z.record(z.string(), z.string()).optional(),
  workspacePersistence: z.enum(["process_local"]).optional(),
  workspaceSharedAcrossInstances: z.boolean().optional(),
  workspaceSurvivesRestart: z.boolean().optional(),
}).optional();

const backendSettingsSchema = z.object({
  preferences: persistedPreferencesSchema.optional(),
  runtime: runtimeSchema,
  updatedAt: z.string().nullable().optional(),
}).passthrough();

export interface RuntimeSettingsStatus {
  deploymentTarget: "local" | "aws" | "unknown";
  awsRegion: string | null;
  sqsConfigured: boolean | null;
  s3DataBucketConfigured: boolean | null;
  rdsConfigured: boolean | null;
  ingestHmacConfigured: boolean | null;
  predictorModes: Record<string, string>;
  workspacePersistence: "process_local" | "unknown";
  workspaceSharedAcrossInstances: boolean | null;
  workspaceSurvivesRestart: boolean | null;
}

export interface SettingsSnapshot {
  settings: SettingsStateData;
  runtime: RuntimeSettingsStatus;
  updatedAt: string | null;
}

export const EMPTY_RUNTIME_SETTINGS: RuntimeSettingsStatus = {
  deploymentTarget: "unknown",
  awsRegion: null,
  sqsConfigured: null,
  s3DataBucketConfigured: null,
  rdsConfigured: null,
  ingestHmacConfigured: null,
  predictorModes: {},
  workspacePersistence: "unknown",
  workspaceSharedAcrossInstances: null,
  workspaceSurvivesRestart: null,
};

export function createDefaultSettings(theme: SettingsStateData["theme"] = "Dark"): SettingsStateData {
  return {
    systemName: "Hybrid Cloud SOC",
    version: "unreported",
    environment: "Development",
    timezone: "UTC",
    language: "en",
    refreshInterval: 30,
    organization: "",
    theme,
    density: "Comfortable",
    sidebarMode: "Expanded",
    animations: "Enable",
    severityColorCritical: "#ef4444",
    severityColorHigh: "#f97316",
    severityColorMedium: "#eab308",
    severityColorLow: "#3b82f6",
    ai1Threshold: 0.65,
    ai2aConfidence: 75,
    ai2bThreshold: 82,
    consensusThreshold: 65,
    thresholdCritical: 90,
    thresholdHigh: 70,
    thresholdMedium: 40,
    thresholdLow: 15,
    alertRetention: "30 Days",
    alertAutoClose: false,
    alertAutoCloseDuration: "6h",
    soundCritical: false,
    soundHigh: false,
    soundMedium: false,
    soundLow: false,
    channelEmail: false,
    channelSlack: false,
    channelTeams: false,
    escalateDelayCritical: 5,
    escalateDelayHigh: 15,
    escalateDelayMedium: 60,
    zeekStatus: "Disconnected",
    zeekEndpointUrl: "",
    suricataStatus: "Disconnected",
    suricataRulesUrl: "",
    suricataRulesSyncInterval: 60,
    awsSqsUrl: "",
    awsSqsStatus: "Disconnected",
    postgresHost: "",
    postgresPort: 5432,
    postgresDb: "",
    postgresStatus: "Disconnected",
    websocketUrl: "",
    websocketMaxRetry: 5,
    sessionTimeout: 30,
    mfaRequired: false,
    passwordRotationValue: "None",
    operatorUsers: [],
    permissions: {},
    reportFormat: "PDF",
    reportSchedule: "Weekly",
    reportAutoGenerate: false,
    reportRetentionMonths: 12,
    reportStoragePath: "Enterprise Database",
    emailSubscribers: "",
    auditLogRetention: 1,
    trackConfigChanges: false,
    complianceMapping: "NIST SP 800-53",
    mitreTrackingEnabled: false,
    enableDailyPolicyValidation: false,
  };
}

export function extractPersistedPreferences(settings: SettingsStateData) {
  return persistedPreferencesSchema.parse({
    systemName: settings.systemName,
    version: settings.version,
    environment: settings.environment,
    timezone: settings.timezone,
    language: settings.language,
    refreshInterval: settings.refreshInterval,
    organization: settings.organization,
    theme: settings.theme,
    density: settings.density,
    sidebarMode: settings.sidebarMode,
    animations: settings.animations,
    severityColorCritical: settings.severityColorCritical,
    severityColorHigh: settings.severityColorHigh,
    severityColorMedium: settings.severityColorMedium,
    severityColorLow: settings.severityColorLow,
    ai1Threshold: settings.ai1Threshold,
    ai2aConfidence: settings.ai2aConfidence,
    ai2bThreshold: settings.ai2bThreshold,
    consensusThreshold: settings.consensusThreshold,
    thresholdCritical: settings.thresholdCritical,
    thresholdHigh: settings.thresholdHigh,
    thresholdMedium: settings.thresholdMedium,
    thresholdLow: settings.thresholdLow,
    alertRetention: settings.alertRetention,
    alertAutoClose: settings.alertAutoClose,
    alertAutoCloseDuration: settings.alertAutoCloseDuration,
    soundCritical: settings.soundCritical,
    soundHigh: settings.soundHigh,
    soundMedium: settings.soundMedium,
    soundLow: settings.soundLow,
    channelEmail: settings.channelEmail,
    channelSlack: settings.channelSlack,
    channelTeams: settings.channelTeams,
    escalateDelayCritical: settings.escalateDelayCritical,
    escalateDelayHigh: settings.escalateDelayHigh,
    escalateDelayMedium: settings.escalateDelayMedium,
    sessionTimeout: settings.sessionTimeout,
    mfaRequired: settings.mfaRequired,
    passwordRotationValue: settings.passwordRotationValue,
    operatorUsers: settings.operatorUsers,
    permissions: settings.permissions,
    reportFormat: settings.reportFormat,
    reportSchedule: settings.reportSchedule,
    reportAutoGenerate: settings.reportAutoGenerate,
    reportRetentionMonths: settings.reportRetentionMonths,
    reportStoragePath: settings.reportStoragePath,
    emailSubscribers: settings.emailSubscribers,
    auditLogRetention: settings.auditLogRetention,
    trackConfigChanges: settings.trackConfigChanges,
    complianceMapping: settings.complianceMapping,
    mitreTrackingEnabled: settings.mitreTrackingEnabled,
    enableDailyPolicyValidation: settings.enableDailyPolicyValidation,
  });
}

function normalizeRuntime(runtime: z.infer<typeof runtimeSchema>): RuntimeSettingsStatus {
  return {
    deploymentTarget: runtime?.deploymentTarget ?? "unknown",
    awsRegion: runtime?.awsRegion ?? null,
    sqsConfigured: runtime?.sqsConfigured ?? null,
    s3DataBucketConfigured: runtime?.s3DataBucketConfigured ?? null,
    rdsConfigured: runtime?.rdsConfigured ?? null,
    ingestHmacConfigured: runtime?.ingestHmacConfigured ?? null,
    predictorModes: runtime?.predictorModes ?? {},
    workspacePersistence: runtime?.workspacePersistence ?? "unknown",
    workspaceSharedAcrossInstances: runtime?.workspaceSharedAcrossInstances ?? null,
    workspaceSurvivesRestart: runtime?.workspaceSurvivesRestart ?? null,
  };
}

function normalizeSnapshot(
  response: z.infer<typeof backendSettingsSchema>,
  fallbackTheme: SettingsStateData["theme"],
): SettingsSnapshot {
  const runtime = normalizeRuntime(response.runtime);
  const defaults = createDefaultSettings(fallbackTheme);
  if (!response.preferences?.environment && runtime.deploymentTarget === "aws") {
    defaults.environment = "Production";
  }

  return {
    settings: { ...defaults, ...(response.preferences ?? {}) },
    runtime,
    updatedAt: response.updatedAt ?? null,
  };
}

export const settingsService = {
  async load(fallbackTheme: SettingsStateData["theme"]): Promise<SettingsSnapshot> {
    const response = await apiRequest("/api/settings", { schema: backendSettingsSchema });
    return normalizeSnapshot(response, fallbackTheme);
  },

  async save(settings: SettingsStateData): Promise<SettingsSnapshot> {
    const preferences = extractPersistedPreferences(settings);
    const response = await apiRequest("/api/settings", {
      method: "PATCH",
      body: { updates: { preferences } },
      schema: backendSettingsSchema,
    });
    return normalizeSnapshot(response, settings.theme);
  },
};
