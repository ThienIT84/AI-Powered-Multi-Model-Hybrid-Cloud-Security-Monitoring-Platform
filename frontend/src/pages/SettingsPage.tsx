import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useSettingsNavigationStore } from "../store/useSettingsNavigationStore";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";

// Types and backend persistence
import { SettingsStateData, Toast } from "../types/settings";
import {
  createDefaultSettings,
  EMPTY_RUNTIME_SETTINGS,
  extractPersistedPreferences,
  RuntimeSettingsStatus,
  settingsService,
} from "../services/settings.service";

// Layout components
import { SettingsHeader } from "../components/settings/SettingsHeader";
import { SettingsSaveBar } from "../components/settings/SettingsSaveBar";
import { SettingsDiscardModal } from "../components/settings/SettingsDiscardModal";
import { SettingsToastPanel } from "../components/settings/SettingsToastPanel";

// Lazy-loaded configuration panels for fast demand-based loading
const GeneralSettings = lazy(() =>
  import("../components/settings/GeneralSettings").then((m) => ({ default: m.GeneralSettings }))
);
const AppearanceSettings = lazy(() =>
  import("../components/settings/AppearanceSettings").then((m) => ({ default: m.AppearanceSettings }))
);
const DetectionPolicies = lazy(() =>
  import("../components/settings/DetectionPolicies").then((m) => ({ default: m.DetectionPolicies }))
);
const AlertManagement = lazy(() =>
  import("../components/settings/AlertManagement").then((m) => ({ default: m.AlertManagement }))
);
const RuntimeIntegrations = lazy(() =>
  import("../components/settings/RuntimeIntegrations").then((m) => ({ default: m.RuntimeIntegrations }))
);
const AccessControl = lazy(() =>
  import("../components/settings/AccessControl").then((m) => ({ default: m.AccessControl }))
);
const Reporting = lazy(() =>
  import("../components/settings/Reporting").then((m) => ({ default: m.Reporting }))
);
const BackupRecovery = lazy(() =>
  import("../components/settings/BackupRecovery").then((m) => ({ default: m.BackupRecovery }))
);
const AuditCompliance = lazy(() =>
  import("../components/settings/AuditCompliance").then((m) => ({ default: m.AuditCompliance }))
);

interface SettingsPageProps {
  key?: string;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onThemeChange?: (themeVal: "Dark" | "Light" | "System") => void;
}

export function SettingsPage({
  isDarkMode = true,
  onThemeToggle,
  onThemeChange,
}: SettingsPageProps) {
  const { activeCategory } = useSettingsNavigationStore();
  const initialThemeRef = useRef<SettingsStateData["theme"]>(isDarkMode ? "Dark" : "Light");
  const [liveSettings, setLiveSettings] = useState<SettingsStateData>(() => createDefaultSettings(initialThemeRef.current));
  const [draftSettings, setDraftSettings] = useState<SettingsStateData>(() => createDefaultSettings(initialThemeRef.current));
  const [runtimeSettings, setRuntimeSettings] = useState<RuntimeSettingsStatus>(EMPTY_RUNTIME_SETTINGS);
  const [settingsUpdatedAt, setSettingsUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Custom confirmation modal trigger
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Custom Toast state
  const [toasts, setToasts] = useState<Array<Toast>>([]);
  const toastIdRef = useRef(0);

  const triggerToast = useCallback((message: string, type: "success" | "warning" | "info" = "success") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const snapshot = await settingsService.load(initialThemeRef.current);
      setLiveSettings(snapshot.settings);
      setDraftSettings(snapshot.settings);
      setRuntimeSettings(snapshot.runtime);
      setSettingsUpdatedAt(snapshot.updatedAt);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Settings endpoint unavailable";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Sync state settings with isDarkMode coming from App context
  useEffect(() => {
    const activeTheme = isDarkMode ? "Dark" : "Light";
    setLiveSettings((prev) => ({ ...prev, theme: activeTheme }));
    setDraftSettings((prev) => ({ ...prev, theme: activeTheme }));
  }, [isDarkMode]);

  // Filter query keyword for search settings bar
  const [searchQuery, setSearchQuery] = useState("");

  const updateDraft = (path: string, value: any) => {
    setDraftSettings((prev) => {
      const copy = { ...prev };
      const parts = path.split(".");
      
      if (parts[0] === "general") {
        const field = parts[1];
        if (field === "platformName") {
          copy.systemName = value;
        } else {
          (copy as any)[field] = value;
        }
      } else if (parts[0] === "users" && parts[1] === "permissions") {
        const page = parts[2];
        const role = parts[3];
        if (!copy.permissions) {
          copy.permissions = {};
        }
        if (!copy.permissions[page]) {
          copy.permissions[page] = {};
        }
        copy.permissions[page][role] = value;
      } else if (parts.length === 2) {
        const field = parts[1];
        (copy as any)[field] = value;
      } else {
        (copy as any)[path] = value;
      }
      return copy;
    });

    if (path === "appearance.theme" && onThemeChange) {
      onThemeChange(value);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(liveSettings) !== JSON.stringify(draftSettings);
  }, [liveSettings, draftSettings]);

  const saveLiveSettings = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const snapshot = await settingsService.save(draftSettings);
      setLiveSettings(snapshot.settings);
      setDraftSettings(snapshot.settings);
      setRuntimeSettings(snapshot.runtime);
      setSettingsUpdatedAt(snapshot.updatedAt);
      triggerToast("SETTINGS APPLIED TO THE CURRENT BACKEND PROCESS.", "success");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Settings update failed";
      triggerToast(`BACKEND DID NOT SAVE SETTINGS: ${message}`, "warning");
    } finally {
      setIsSaving(false);
    }
  };

  const discardDraftSettings = () => {
    setDraftSettings(liveSettings);
    setShowConfirmReset(false);
    triggerToast("DRAFT OVERRIDES DISCARDED SUCCESSFULLY.", "info");
  };

  const handleDownloadSettings = () => {
    triggerToast("EXPORTING BACKEND-SYNCED PREFERENCES...", "info");
    try {
      const preferences = extractPersistedPreferences(draftSettings);
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(preferences, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `hybrid_cloud_soc_config_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("PLATFORM CONFIGURATIONS EXPORTED SUCCESSFULLY!", "success");
    } catch (err) {
      triggerToast("FAILED TO SERIALIZE SETTINGS STORAGE DATA", "warning");
    }
  };

  const activeCategoryLabel = useMemo(() => {
    switch (activeCategory) {
      case "general":
        return "GENERAL SYSTEM";
      case "appearance":
        return "APPEARANCE";
      case "detection":
        return "DETECTION POLICIES";
      case "alerts":
        return "ALERT MANAGEMENT";
      case "integrations":
        return "RUNTIME INTEGRATIONS";
      case "access":
        return "USERS & ACCESS CONTROL";
      case "reporting":
        return "REPORTING CONFIG";
      case "backup":
        return "BACKUP & RECOVERY";
      case "compliance":
        return "AUDIT & COMPLIANCE";
      default:
        return activeCategory.toUpperCase();
    }
  }, [activeCategory]);

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex bg-background h-full overflow-hidden select-none w-full font-sans settings-page-container"
    >
      {/* Settings Side Nav */}
      <SettingsSidebar />

      {/* Main Settings Portal */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Sticky Header / Breadcrumbs */}
        <SettingsHeader
          activeCategoryLabel={activeCategoryLabel}
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            if (val) {
              triggerToast(`FILTERING MODULES FOR KEYWORD: "${val.toUpperCase()}"`, "info");
            }
          }}
          onDownload={handleDownloadSettings}
          onShare={() => triggerToast("SETTINGS SHARING IS NOT CONFIGURED.", "warning")}
        />

        {/* Dynamic Content Surface */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-24">
          <div className="w-full space-y-6">
            {!isLoading && !loadError && runtimeSettings.workspacePersistence === "process_local" && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500">
                Settings and case workspace state are process-local: they are not shared across EC2 instances and disappear when this backend process restarts. Final Alerts are persisted separately in RDS.
              </div>
            )}
            {isLoading ? (
              <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-muted-foreground">
                <Loader2 size={24} className="animate-spin text-cyan-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Loading settings from backend</p>
              </div>
            ) : loadError ? (
              <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-red-500/25 bg-red-500/5 p-6 text-center">
                <AlertCircle size={24} className="text-red-500" />
                <div><p className="text-sm font-black uppercase text-foreground">Settings unavailable</p><p className="mt-2 max-w-xl text-xs text-muted-foreground">{loadError}</p></div>
                <button type="button" onClick={() => void loadSettings()} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-[9px] font-black uppercase tracking-widest text-foreground hover:border-cyan-500/40">
                  <RefreshCw size={12} /> Retry backend
                </button>
              </div>
            ) : (
              <Suspense
              fallback={
                /* LOADING MODULE SKELETON */
                <div className="space-y-6 animate-pulse p-4">
                  <div className="h-6 w-1/3 bg-muted rounded-md mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded-md mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-45 bg-muted/65 rounded-xl border border-border" />
                    <div className="h-45 bg-muted/65 rounded-xl border border-border" />
                    <div className="h-45 bg-muted/65 rounded-xl border border-border md:col-span-2" />
                  </div>
                </div>
              }
              >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeCategory === "general" && (
                    <GeneralSettings
                      data={{
                        platformName: draftSettings.systemName,
                        organization: draftSettings.organization,
                        environment: draftSettings.environment,
                        timezone: draftSettings.timezone,
                        language: draftSettings.language,
                        refreshInterval: draftSettings.refreshInterval,
                      }}
                      onChange={updateDraft}
                    />
                  )}

                  {activeCategory === "appearance" && (
                    <AppearanceSettings
                      data={{
                        theme: draftSettings.theme,
                        density: draftSettings.density,
                        sidebarMode: draftSettings.sidebarMode,
                        animations: draftSettings.animations,
                        severityColorCritical: draftSettings.severityColorCritical,
                        severityColorHigh: draftSettings.severityColorHigh,
                        severityColorMedium: draftSettings.severityColorMedium,
                        severityColorLow: draftSettings.severityColorLow,
                      }}
                      onChange={updateDraft}
                    />
                  )}

                  {activeCategory === "detection" && (
                    <DetectionPolicies
                      data={{
                        ai1Threshold: draftSettings.ai1Threshold,
                        ai2aConfidence: draftSettings.ai2aConfidence,
                        ai2bThreshold: draftSettings.ai2bThreshold,
                        consensusThreshold: draftSettings.consensusThreshold,
                        thresholdCritical: draftSettings.thresholdCritical,
                        thresholdHigh: draftSettings.thresholdHigh,
                        thresholdMedium: draftSettings.thresholdMedium,
                        thresholdLow: draftSettings.thresholdLow,
                      }}
                      onChange={updateDraft}
                    />
                  )}

                  {activeCategory === "alerts" && (
                    <AlertManagement
                      data={{
                        alertRetention: draftSettings.alertRetention,
                        alertAutoClose: draftSettings.alertAutoClose,
                        alertAutoCloseDuration: draftSettings.alertAutoCloseDuration,
                        soundCritical: draftSettings.soundCritical,
                        soundHigh: draftSettings.soundHigh,
                        soundMedium: draftSettings.soundMedium,
                        soundLow: draftSettings.soundLow,
                        channelEmail: draftSettings.channelEmail,
                        channelSlack: draftSettings.channelSlack,
                        channelTeams: draftSettings.channelTeams,
                        escalateDelayCritical: draftSettings.escalateDelayCritical,
                        escalateDelayHigh: draftSettings.escalateDelayHigh,
                        escalateDelayMedium: draftSettings.escalateDelayMedium,
                      }}
                      onChange={updateDraft}
                      onToast={triggerToast}
                    />
                  )}

                  {activeCategory === "integrations" && (
                    <RuntimeIntegrations runtime={runtimeSettings} updatedAt={settingsUpdatedAt} />
                  )}

                  {activeCategory === "access" && (
                    <AccessControl
                      data={{
                        sessionTimeout: draftSettings.sessionTimeout,
                        mfaRequired: draftSettings.mfaRequired,
                        passwordRotationValue: draftSettings.passwordRotationValue,
                        operatorUsers: draftSettings.operatorUsers,
                        permissions: draftSettings.permissions,
                      }}
                      onChange={updateDraft}
                      onToast={triggerToast}
                    />
                  )}

                  {activeCategory === "reporting" && (
                    <Reporting
                      data={{
                        reportFormat: draftSettings.reportFormat,
                        reportSchedule: draftSettings.reportSchedule,
                        reportAutoGenerate: draftSettings.reportAutoGenerate,
                        reportRetentionMonths: draftSettings.reportRetentionMonths,
                        reportStoragePath: draftSettings.reportStoragePath,
                        emailSubscribers: draftSettings.emailSubscribers,
                      }}
                      onChange={updateDraft}
                      onToast={triggerToast}
                    />
                  )}

                  {activeCategory === "backup" && (
                    <BackupRecovery
                      onToast={triggerToast}
                    />
                  )}

                  {activeCategory === "compliance" && (
                    <AuditCompliance
                      data={{
                        auditLogRetention: draftSettings.auditLogRetention,
                        trackConfigChanges: draftSettings.trackConfigChanges,
                        complianceMapping: draftSettings.complianceMapping,
                        mitreTrackingEnabled: draftSettings.mitreTrackingEnabled,
                        enableDailyPolicyValidation: draftSettings.enableDailyPolicyValidation,
                      }}
                      onChange={updateDraft}
                      onToast={triggerToast}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              </Suspense>
            )}
          </div>
        </div>

        {/* Global Save Bar (Unsaved Changes Detection) */}
        <SettingsSaveBar
          isDirty={!isLoading && !loadError && isDirty}
          isSaving={isSaving}
          onDiscard={() => setShowConfirmReset(true)}
          onSave={() => void saveLiveSettings()}
        />

        {/* TOAST PANEL WRAPPER */}
        <SettingsToastPanel toasts={toasts} />

        {/* CONFIRMATION DISCARD MODAL */}
        <SettingsDiscardModal
          isOpen={showConfirmReset}
          onClose={() => setShowConfirmReset(false)}
          onConfirm={discardDraftSettings}
        />
      </main>
    </motion.div>
  );
}

export default SettingsPage;
