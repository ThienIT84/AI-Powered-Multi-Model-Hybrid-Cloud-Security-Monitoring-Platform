import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettingsStore } from "../store/useSettingsStore";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";

// Types and Mocks
import { SettingsStateData, Toast } from "../types/settings";
import { DEFAULT_COMPLETE_SETTINGS } from "../components/settings/settingsMocks";

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
const Integrations = lazy(() =>
  import("../components/settings/Integrations").then((m) => ({ default: m.Integrations }))
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
  const { activeCategory } = useSettingsStore();

  const [liveSettings, setLiveSettings] = useState<SettingsStateData>(DEFAULT_COMPLETE_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<SettingsStateData>(DEFAULT_COMPLETE_SETTINGS);
  
  // Custom confirmation modal trigger
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Custom Toast state
  const [toasts, setToasts] = useState<Array<Toast>>([]);
  const toastIdRef = useRef(0);

  // Sync state settings with isDarkMode coming from App context
  useEffect(() => {
    const activeTheme = isDarkMode ? "Dark" : "Light";
    setLiveSettings((prev) => ({ ...prev, theme: activeTheme }));
    setDraftSettings((prev) => ({ ...prev, theme: activeTheme }));
  }, [isDarkMode]);

  // Filter query keyword for search settings bar
  const [searchQuery, setSearchQuery] = useState("");

  const triggerToast = (message: string, type: "success" | "warning" | "info" = "success") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

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

  const saveLiveSettings = () => {
    setLiveSettings(draftSettings);
    triggerToast("PLATFORM ADMINISTRATOR PREFERENCES PERSISTED SUCCESSFULLY!", "success");
  };

  const discardDraftSettings = () => {
    setDraftSettings(liveSettings);
    setShowConfirmReset(false);
    triggerToast("DRAFT OVERRIDES DISCARDED SUCCESSFULLY.", "info");
  };

  const handleDownloadSettings = () => {
    triggerToast("SERIALIZING CORE v3 CONFIG STATE...", "info");
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(draftSettings, null, 2));
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
        return "INTEGRATIONS CONFIG";
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
          onShare={() => triggerToast("CONFIGURATION LINK CO-SHARED SUCCESSFULLY!", "success")}
        />

        {/* Dynamic Content Surface */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-24">
          <div className="w-full space-y-6">
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
                    <Integrations
                      data={{
                        zeekStatus: draftSettings.zeekStatus,
                        zeekEndpointUrl: draftSettings.zeekEndpointUrl,
                        suricataStatus: draftSettings.suricataStatus,
                        suricataRulesUrl: draftSettings.suricataRulesUrl,
                        suricataRulesSyncInterval: draftSettings.suricataRulesSyncInterval,
                        awsSqsUrl: draftSettings.awsSqsUrl,
                        awsSqsStatus: draftSettings.awsSqsStatus,
                        postgresHost: draftSettings.postgresHost,
                        postgresPort: draftSettings.postgresPort,
                        postgresDb: draftSettings.postgresDb,
                        postgresStatus: draftSettings.postgresStatus,
                        websocketUrl: draftSettings.websocketUrl,
                        websocketMaxRetry: draftSettings.websocketMaxRetry,
                      }}
                      onChange={updateDraft}
                      onToast={triggerToast}
                    />
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
          </div>
        </div>

        {/* Global Save Bar (Unsaved Changes Detection) */}
        <SettingsSaveBar
          isDirty={isDirty}
          onDiscard={() => setShowConfirmReset(true)}
          onSave={saveLiveSettings}
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
