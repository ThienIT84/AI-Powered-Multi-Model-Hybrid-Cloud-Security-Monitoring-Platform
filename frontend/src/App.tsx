/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { IncidentDetail } from "./components/alerts/IncidentDetail";
import { AlertsPage } from "./pages/AlertsPage";
import { NetworkMonitoringPage } from "./pages/NetworkMonitoringPage";
import { EndpointPage } from "./pages/EndpointPage";
import { CloudPage } from "./pages/CloudPage";
import { ThreatIntelPage } from "./pages/ThreatIntelPage";
import { AIThreatDetectionPage } from "./pages/AIThreatDetectionPage";
import { AttackSurfacePage } from "./pages/AttackSurfacePage";
import { MitreAttackPage } from "./pages/MitreAttackPage";
import { CaseManagementPage } from "./pages/CaseManagementPage";
import {IntegrationsPage} from "./pages/IntegrationsPage";
import { PlaybooksPage } from "./pages/PlaybooksPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

// Hybrid SOC Command Center Unified Components
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { ExecutiveKPIBar } from "./components/dashboard/ExecutiveKPIBar";
import { SOCOperationalOverview } from "./components/dashboard/SOCOperationalOverview";
import { RealtimeIncidentStream } from "./components/dashboard/RealtimeIncidentStream";
import { FusionOverviewPanel } from "./components/dashboard/FusionOverviewPanel";
import { SecurityPostureSummary } from "./components/dashboard/SecurityPostureSummary";
import { AlertDistributionChart } from "./components/dashboard/AlertDistributionChart";
import { OpenCasesSummary } from "./components/dashboard/OpenCasesSummary";
import { PlatformHealthPanel } from "./components/dashboard/PlatformHealthPanel";
import { SOCSituationSnapshot } from "./components/dashboard/SOCSituationSnapshot";
import { SOCQuickActions } from "./components/dashboard/SOCQuickActions";

// Hooks
import { useDashboardMetrics } from "./components/dashboard/hooks/useDashboardMetrics";
import { usePlatformHealth } from "./components/dashboard/hooks/usePlatformHealth";

<<<<<<< HEAD
=======
import { AIThreatDetectionPage } from "./pages/AIThreatDetectionPage";
import { AttackSurfacePage } from "./pages/AttackSurfacePage";
import { MitreAttackPage } from "./pages/MitreAttackPage";
import { CaseManagementPage } from "./pages/CaseManagementPage";
import { CloudPage } from "./pages/CloudPage";
import { ThreatIntelPage } from "./pages/ThreatIntelPage";
>>>>>>> 924c5840903931e63161b08042c285e0145de18e
import { useSocket } from "./useSocket";
import { usePanelState } from "./hooks/usePanelState";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { mockDataSourceHealth, mockModelStatus, mockSummary } from "./mocks/securityData";
import { AppView } from "./types/views";

export default function App() {
  const { isConnected, alerts, traffic } = useSocket();

  // Call unified SOC command center dashboard hooks
  const {
    metrics,
    fusionOverview,
    securityPosture,
    severityDistribution,
    openCasesSummary
  } = useDashboardMetrics(alerts, traffic);

  const platformHealth = usePlatformHealth(isConnected);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefresh = React.useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  }, []);

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [disabledAttackTypes, setDisabledAttackTypes] = useState<string[]>([]);
  
  const { 
    isAlertsOpen, 
    isSettingsOpen, 
    openPanel, 
    closePanel 
  } = usePanelState();

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleAttackType = (typeName: string) => {
    setDisabledAttackTypes(prev => 
      prev.includes(typeName) 
        ? prev.filter(t => t !== typeName) 
        : [...prev, typeName]
    );
  };

  // Restricts selected alert from displaying if its type gets disabled/toggled off
  useEffect(() => {
    if (selectedAlert && disabledAttackTypes.includes(selectedAlert.attackType)) {
      setSelectedAlert(null);
    }
  }, [disabledAttackTypes, selectedAlert]);

  const filteredAlerts = alerts.filter(alert => {
    const q = searchQuery.toLowerCase();
    
    // Toggle attack type filtering from Donut Chart Legend
    if (alert.attackType && disabledAttackTypes.includes(alert.attackType)) {
      return false;
    }
    
    return (
      alert.sourceIp?.toLowerCase().includes(q) ||
      alert.destinationIp?.toLowerCase().includes(q) ||
      alert.attackType?.toLowerCase().includes(q) ||
      alert.rawPayload?.toLowerCase().includes(q) ||
      alert.severity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen font-sans overflow-hidden transition-colors duration-500 bg-background text-foreground">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          isConnected={isConnected} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          currentView={currentView}
          onViewChange={setCurrentView}
          alerts={alerts}
          onSelectAlert={setSelectedAlert}
          isAlertsOpen={isAlertsOpen}
          isSettingsOpen={isSettingsOpen}
          onToggleAlerts={() => openPanel('alerts')}
          onToggleSettings={() => openPanel('settings')}
          onClosePanels={closePanel}
        />
        
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          currentView === "settings" ? "p-0 overflow-hidden flex flex-col" : "p-4 space-y-4"
        )}>
          <AnimatePresence mode="wait">
            {currentView === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 pb-12"
              >
                {/* SECTION A — HEADER */}
                <DashboardHeader 
                  isConnected={isConnected} 
                  onRefresh={handleRefresh} 
                  isSyncing={isSyncing} 
                />

                {/* SECTION B — EXECUTIVE KPI BAR */}
                <ExecutiveKPIBar metrics={metrics} />

                {/* SECTION C — SOC SITUATION SNAPSHOT */}
                <SOCSituationSnapshot alerts={alerts} />

                {/* SECTION D — REAL-TIME INCIDENT STREAM (WITH DETAILS ON THE RIGHT ON DESKTOP) */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
                  <div className={cn(
                    "transition-all duration-300 min-w-0 flex-1",
                    selectedAlert ? "lg:w-[62%]" : "w-full"
                  )}>
                    <RealtimeIncidentStream 
                      alerts={filteredAlerts} 
                      onSelectAlert={setSelectedAlert} 
                      selectedAlertId={selectedAlert?.id}
                      searchQuery={searchQuery}
                      onViewAlertsClick={() => setCurrentView("alerts")}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {selectedAlert && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="lg:w-[38%] shrink-0 flex flex-col min-w-85"
                      >
                        <IncidentDetail 
                          alert={selectedAlert} 
                          onClose={() => setSelectedAlert(null)} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SECTIONS E, F — OPERATIONAL SUMMARIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FUSION OVERVIEW */}
                  <FusionOverviewPanel metrics={fusionOverview} />
                  
                  {/* OPEN CASES SUMMARY */}
                  <OpenCasesSummary metrics={openCasesSummary} />
                </div>

                {/* SECTIONS G, H — POSTURE SUMMARIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SECURITY POSTURE SUMMARY */}
                  <SecurityPostureSummary metrics={securityPosture} />

                  {/* THREAT SEVERITY DISTRIBUTION */}
                  <AlertDistributionChart data={severityDistribution} />
                </div>

                {/* SECTIONS I, J — HEALTH & ACTION PATHS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex flex-col h-full">
                    {/* PLATFORM HEALTH */}
                    <PlatformHealthPanel health={platformHealth} />
                  </div>
                  
                  <div className="lg:col-span-4 flex flex-col h-full justify-between">
                    {/* SOC QUICK ACTIONS */}
                    <SOCQuickActions onNavigate={(v) => setCurrentView(v)} />
                  </div>
                </div>
              </motion.div>
            ) : currentView === "alerts" ? (
              <AlertsPage key="alerts" />
            ) : currentView === "network" ? (
              <NetworkMonitoringPage key="network" />
            ) : currentView === "endpoints" ? (
              <EndpointPage key="endpoints" />
            ) : currentView === "cloud" ? (
              <CloudPage key="cloud" />
            ) : currentView === "threat-intel" ? (
              <ThreatIntelPage key="threat-intel" />
            ) : currentView === "ai-threat-detection" ? (
              <AIThreatDetectionPage key="ai-threat-detection" />
            ) : currentView === "attack-surface" ? (
              <AttackSurfacePage key="attack-surface" />
            ) : currentView === "mitre-attack" ? (
              <MitreAttackPage key="mitre-attack" />
            ) : currentView === "case-management" ? (
              <CaseManagementPage key="case-management" />
            ) : currentView === "integrations" ? (
              <IntegrationsPage key="integrations" />
            ) : currentView === "playbooks" ? (
              <PlaybooksPage key="playbooks" />
            ) : currentView === "reports" ? (
              <ReportsPage key="reports" />
            ) : currentView === "cloud" ? (
              <CloudPage key="cloud" />
            ) : currentView === "threat-intel" ? (
              <ThreatIntelPage key="threat-intel" />
            ) : (
              <SettingsPage 
                key="settings" 
                isDarkMode={isDarkMode} 
                onThemeToggle={() => setIsDarkMode(!isDarkMode)} 
                onThemeChange={(themeVal) => {
                  if (themeVal === "Light") {
                    setIsDarkMode(false);
                  } else if (themeVal === "Dark") {
                    setIsDarkMode(true);
                  } else {
                    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    setIsDarkMode(systemPrefersDark);
                  }
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
