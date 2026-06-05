import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettingsStore } from "../store/useSettingsStore";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";

// Types and Mocks
import { SettingsStateData, Toast } from "../components/settings/settingsConfig";
import { DEFAULT_COMPLETE_SETTINGS } from "../components/settings/settingsMocks";

// Layout components
import { SettingsHeader } from "../components/settings/SettingsHeader";
import { SettingsDebugConsole } from "../components/settings/SettingsDebugConsole";
import { SettingsSaveBar } from "../components/settings/SettingsSaveBar";
import { SettingsDiscardModal } from "../components/settings/SettingsDiscardModal";
import { SettingsToastPanel } from "../components/settings/SettingsToastPanel";

// Tab Components
import { GeneralSettingsTab } from "../components/settings/GeneralSettingsTab";
import { AppearanceSettingsTab } from "../components/settings/AppearanceSettingsTab";
import { AiEngineSettingsTab } from "../components/settings/AiEngineSettingsTab";
import { FusionSettingsTab } from "../components/settings/FusionSettingsTab";
import { AlertSettingsTab } from "../components/settings/AlertSettingsTab";
import { AwsSettingsTab } from "../components/settings/AwsSettingsTab";
import { IntegrationSettingsTab } from "../components/settings/IntegrationSettingsTab";
import { DatasetSettingsTab } from "../components/settings/DatasetSettingsTab";
import { ReportSettingsTab } from "../components/settings/ReportSettingsTab";
import { UserManagementSettingsTab } from "../components/settings/UserManagementSettingsTab";
import { MonitoringSettingsTab } from "../components/settings/MonitoringSettingsTab";
import { BackupSettingsTab } from "../components/settings/BackupSettingsTab";

interface SettingsPageProps {
  key?: string;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onThemeChange?: (themeVal: "Dark" | "Light" | "System") => void;
}

export function SettingsPage({
  isDarkMode = true,
  onThemeToggle,
  onThemeChange
}: SettingsPageProps) {
  const { activeCategory } = useSettingsStore();

  const [liveSettings, setLiveSettings] = useState<SettingsStateData>(DEFAULT_COMPLETE_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<SettingsStateData>(DEFAULT_COMPLETE_SETTINGS);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  
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

  // Debug Console stream log states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM - INIT] Zeek log listener initialized.",
    "[SYSTEM - INFO] Isolation Forest model weighting online (w=20%).",
    "[SYSTEM - SUCCESS] Connected with AWS services comfortably.",
    "[SYSTEM - ACTIVE] WebSocket consumer is receiving packets indices live..."
  ]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

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
      let current: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });

    if (path === "theme" && onThemeChange) {
      onThemeChange(value);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(liveSettings) !== JSON.stringify(draftSettings);
  }, [liveSettings, draftSettings]);

  const saveLiveSettings = () => {
    setLiveSettings(draftSettings);
    triggerToast("SOC PLATFORM CONFIGURATIONS COMMITTED SUCCESSFULLY!", "success");
    // Print logs to console
    appendConsoleLog(`[COMMIT - SUCCESS] Configurations committed to core state memory layer.`);
  };

  const discardDraftSettings = () => {
    setDraftSettings(liveSettings);
    setShowConfirmReset(false);
    triggerToast("DRAFT MODIFICATIONS PURGED.", "info");
  };

  const handleDownloadSettings = () => {
    triggerToast("SERIALIZING PLATFORM STATE ENGINE...", "info");
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftSettings, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `zeek_ai_soc_config_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("CONFIGURATION PROTOCOLS DOWNLOADED SUCCESSFULLY!", "success");
    } catch (err) {
      triggerToast("FAILED TO SERIALIZE SETTINGS STORAGE DATA", "warning");
    }
  };

  // Switch tabs with a micro loading skeleton to fulfill the UI/UX loading skeleton directive
  useEffect(() => {
    setIsLoadingTab(true);
    const handler = setTimeout(() => {
      setIsLoadingTab(false);
    }, 380);
    return () => clearTimeout(handler);
  }, [activeCategory]);

  const appendConsoleLog = (text: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${text}`]);
    setTimeout(() => {
      consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  // Continuous background logs simulation if Developer Mode & Debug console is active
  useEffect(() => {
    if (!draftSettings.developerMode || !draftSettings.debugConsole) return;
    const logInterval = setInterval(() => {
      const messages = [
        "Ingestion Rate: 1,424 packets/sec under SQS stream.",
        "XGBoost classification integrity validated (confidence: 96%).",
        "Duplicates Check evaluated: 0.12% redundancy found on conn.log.",
        "Suricata matched 1 rules under http.log payload validation. Scoring calculated.",
        "Fusion layer synthesized decision score: 42 (LOW THREAT). No action required.",
        "WebSocket peer listener index polled: 4 healthy client connections.",
        "System resources usage metrics dispatched. (CPU: 38% | RAM: 54%)"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      appendConsoleLog(`[MOCK ENGINE - POLLING] ${randomMsg}`);
    }, 6000);

    return () => clearInterval(logInterval);
  }, [draftSettings.developerMode, draftSettings.debugConsole]);

  const handleSimulateData = (type: "alerts" | "attacks" | "traffic") => {
    triggerToast(`SIMULATING CORE DATA: ${type.toUpperCase()} INGRESS LOOP STAGED...`, "info");
    appendConsoleLog(`[SIM PROTOCOL] Commencing high intensity ${type.toUpperCase()} injection scenario...`);
    
    setTimeout(() => {
      if (type === "alerts") {
        appendConsoleLog(`[MOCK ALERT - CRITICAL] AI2B discovered dynamic SQL Injection attempt! Threat synthesized in Fusion Layer.`);
        triggerToast("MOCK CRITICAL INCIDENT GENERATED!", "warning");
      } else if (type === "attacks") {
        appendConsoleLog(`[MOCK DETECT - WARNING] Port Scan pattern matched on AI1 Isolation Forest. Weight verified.`);
        triggerToast("SPIKE IN HOST SCAN ATTACKS SIMULATED", "info");
      } else {
        appendConsoleLog(`[MOCK TRAFFIC] Ingress bandwidth scaled to 5,000,000 Flows across Zeek nodes.`);
        triggerToast("GRID NETWORK TRAFFIC SYNCHRONIZED", "success");
      }
    }, 1200);
  };

  const activeCategoryLabel = useMemo(() => {
    switch (activeCategory) {
      case "general": return "GENERAL SYSTEM";
      case "appearance": return "APPEARANCE";
      case "ai-engine": return "AI Core Engine";
      case "fusion": return "FUSION CONTROLS";
      case "alerts": return "ALARM INTERCEPTS";
      case "aws": return "AWS CONNECTS";
      case "integrations": return "INGRESS PLUGS";
      case "dataset": return "DATABASES";
      case "reports": return "REPORTS FORMAT";
      case "users": return "OPERATORS Access";
      case "monitoring": return "HEALTH DIAGS";
      case "backup": return "BACKUP snapshot";
      default: return activeCategory.toUpperCase();
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-16">
           <div className="mx-auto w-full max-w-5xl space-y-6">

              {isLoadingTab ? (
                /* LOADING MODULE SKELETON SKELETONS */
                <div className="space-y-6 animate-pulse p-4">
                  <div className="h-6 w-1/3 bg-muted rounded-md mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded-md mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-45bg-muted/65 rounded-xl border border-border" />
                    <div className="h-45bg-muted/65 rounded-xl border border-border" />
                    <div className="h-45bg-muted/65 rounded-xl border border-border md:col-span-2" />
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                   <motion.div
                     key={activeCategory}
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -8 }}
                     transition={{ duration: 0.2 }}
                   >
                      {activeCategory === "general" && (
                        <GeneralSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                          onLog={appendConsoleLog}
                        />
                      )}
                      
                      {activeCategory === "appearance" && (
                        <AppearanceSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                        />
                      )}
                      
                      {activeCategory === "ai-engine" && (
                        <AiEngineSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "fusion" && (
                        <FusionSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "alerts" && (
                        <AlertSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "aws" && (
                        <AwsSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "integrations" && (
                        <IntegrationSettingsTab 
                          data={draftSettings}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "dataset" && (
                        <DatasetSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "reports" && (
                        <ReportSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                        />
                      )}

                      {activeCategory === "users" && (
                        <UserManagementSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "monitoring" && (
                        <MonitoringSettingsTab 
                          data={draftSettings}
                          onChange={updateDraft}
                          onToast={triggerToast}
                        />
                      )}

                      {activeCategory === "backup" && (
                        <BackupSettingsTab 
                          currentSettings={draftSettings}
                          onRestore={(parsed) => {
                            setDraftSettings({ ...draftSettings, ...parsed });
                          }}
                          onToast={triggerToast}
                        />
                      )}
                   </motion.div>
                </AnimatePresence>
              )}

           </div>
        </div>

        {/* DEVELOPER MODE MOCK GENERATORS & DEBUG CONSOLE */}
        <SettingsDebugConsole
          developerMode={draftSettings.developerMode}
          debugConsole={draftSettings.debugConsole}
          consoleLogs={consoleLogs}
          consoleBottomRef={consoleBottomRef}
          onClearLogs={() => {
            setConsoleLogs(["[CONSOLE] Clear committed logs initiated."]);
            triggerToast("DEBUG LOGS CLEARED", "info");
          }}
          onSimulate={handleSimulateData}
        />

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
