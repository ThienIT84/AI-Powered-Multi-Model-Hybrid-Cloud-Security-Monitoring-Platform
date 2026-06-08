/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { KPIOverview } from "./components/dashboard/KPIOverview";
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

// Upgraded FCS v3.0 modular panels
import { SystemHealthPanel } from "./components/dashboard/SystemHealthPanel";
import { AIEngineStatusPanel } from "./components/dashboard/AIEngineStatusPanel";
import { RealtimeFlowChart } from "./components/dashboard/RealtimeFlowChart";
import { AttackDistributionChart } from "./components/dashboard/AttackDistributionChart";
import { AttackTrendChart } from "./components/dashboard/AttackTrendChart";
import { FusionLayerVisualization } from "./components/dashboard/FusionLayerVisualization";
import { AIConsensusPanel } from "./components/dashboard/AIConsensusPanel";
import { DatasetHealthPanel } from "./components/dashboard/DatasetHealthPanel";
import { PublicVsZeekComparison } from "./components/dashboard/PublicVsZeekComparison";
import { ModelPerformanceOverview } from "./components/dashboard/ModelPerformanceOverview";
import { RealtimeAlertFeed } from "./components/dashboard/RealtimeAlertFeed";
import { TopAttackersPanel } from "./components/dashboard/TopAttackersPanel";
import { TopTargetsPanel } from "./components/dashboard/TopTargetsPanel";
import { CampaignOverviewPanel } from "./components/dashboard/CampaignOverviewPanel";
import { MultiStageAttackGraph } from "./components/dashboard/MultiStageAttackGraph";
import { AttackTimelinePanel } from "./components/dashboard/AttackTimelinePanel";
import { SecurityActionCenter } from "./components/dashboard/SecurityActionCenter";
import { ReportExportPanel } from "./components/dashboard/ReportExportPanel";

// FCAJ Compliance Suite Additions
import { CloudPipelineMonitor } from "./components/dashboard/CloudPipelineMonitor";
import { BatchProcessingPanel } from "./components/dashboard/BatchProcessingPanel";
import { ONNXEnginePanel } from "./components/dashboard/ONNXEnginePanel";
import { FusionRiskAnalytics } from "./components/dashboard/FusionRiskAnalytics";
import { TelemetryHealthPanel } from "./components/dashboard/TelemetryHealthPanel";
import { DatasetGrowthPanel } from "./components/dashboard/DatasetGrowthPanel";
import { ServiceDiversityPanel } from "./components/dashboard/ServiceDiversityPanel";
import { BehaviorDiversityPanel } from "./components/dashboard/BehaviorDiversityPanel";
import { AttackCoveragePanel } from "./components/dashboard/AttackCoveragePanel";
import { AIEvaluationPanel } from "./components/dashboard/AIEvaluationPanel";
import { DatasetMismatchPanel } from "./components/dashboard/DatasetMismatchPanel";
import { AttackScenarioPanel } from "./components/dashboard/AttackScenarioPanel";
import { DemoModeWidget } from "./components/dashboard/DemoModeWidget";
import { SystemCompliancePanel } from "./components/dashboard/SystemCompliancePanel";

import { useSocket } from "./useSocket";
import { usePanelState } from "./hooks/usePanelState";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { mockDataSourceHealth, mockModelStatus, mockSummary } from "./mocks/securityData";
import { AppView } from "./types/views";

export default function App() {
  const { isConnected, alerts, traffic, error, dataMode } = useSocket();
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
    if (disabledAttackTypes.includes(alert.attackType)) {
      return false;
    }
    
    return (
      alert.sourceIp.toLowerCase().includes(q) ||
      alert.destinationIp.toLowerCase().includes(q) ||
      alert.attackType.toLowerCase().includes(q) ||
      alert.rawPayload?.toLowerCase().includes(q) ||
      alert.severity.toLowerCase().includes(q)
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
                {/* ZONE A: SOC Header & System Health */}
                <SystemHealthPanel isConnected={isConnected} />

                {/* ZONE B: Executive Security KPIs */}
                <KPIOverview alerts={alerts} traffic={traffic} />

                {/* PRESENTATION HUB: Demo Mode & Interactive Injector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                   <div className="lg:col-span-7">
                      <DemoModeWidget />
                   </div>
                   <div className="lg:col-span-5">
                      <AttackScenarioPanel />
                   </div>
                </div>

                {/* INGESTION & PIPELINE HUBS: AWS Integration, Telemetry Sources, and Queue Buffer Logs */}
                <div className="space-y-6">
                   <CloudPipelineMonitor />
                   
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8">
                         <TelemetryHealthPanel />
                      </div>
                      <div className="lg:col-span-4">
                         <BatchProcessingPanel />
                      </div>
                   </div>
                </div>
                
                {/* ZONE C: Realtime Security Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                     <RealtimeFlowChart traffic={traffic} />
                  </div>
                  <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-fit self-start">
                     <div className="flex items-center justify-between border-b border-border/20 pb-2">
                        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">NETWORK TELEMETRY PANEL</h3>
                        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">LIVE FLOWS</span>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-3 font-mono text-[8.5px] leading-tight py-3">
                        <div className="p-3 bg-secondary/25 border border-border/20 rounded-lg">
                           <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">TOTAL DATA SECTOR INGRESS</span>
                           <span className="text-foreground text-sm font-black">1.12 Gbps</span>
                        </div>
                        <div className="p-3 bg-secondary/25 border border-border/20 rounded-lg">
                           <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">ACTIVE ESTABLISHED CONNS</span>
                           <span className="text-cyan-400 text-sm font-black">12,482 Active Sessions</span>
                        </div>
                        <div className="p-3 bg-secondary/25 border border-border/20 rounded-lg">
                           <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">AGGREGATE INBOUND/OUTBOUND RATIO</span>
                           <span className="text-foreground text-sm font-black">74.2% Inbound / 25.8% Outbound</span>
                        </div>
                     </div>
                     <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 font-mono">
                        <span>Zeek log session telemetry</span>
                     </div>
                  </div>
                </div>

                {/* ZONE D: Fusion Intelligence Center & Evaluative Analytics */}
                <div className="space-y-6">
                   <FusionRiskAnalytics />

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AttackDistributionChart alerts={alerts} />
                      <AttackTrendChart />
                      <AIConsensusPanel />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DatasetHealthPanel />
                      <PublicVsZeekComparison />
                      <ModelPerformanceOverview />
                   </div>

                   {/* DATASET STABILITY, MISMATCH & DIVERSITY PROFILER */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <DatasetGrowthPanel />
                      <DatasetMismatchPanel />
                      <AttackCoveragePanel />
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5">
                         <ServiceDiversityPanel />
                      </div>
                      <div className="lg:col-span-7">
                         <BehaviorDiversityPanel />
                      </div>
                   </div>

                   <FusionLayerVisualization alertsCount={alerts.length} />
                   <AIEngineStatusPanel alertsCount={alerts.length} />

                   {/* AI EVALUATIONS & CERTIFICATION COMPLIANCE LIST */}
                   <AIEvaluationPanel />
                   <ONNXEnginePanel />
                   <SystemCompliancePanel />
                </div>

                {/* ZONE E: Realtime Alert Feed */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full overflow-hidden">
                  <div className={cn(
                    "transition-all duration-300 ease-in-out min-w-0 flex-1",
                    selectedAlert ? "lg:w-[62%]" : "w-full"
                  )}>
                    <RealtimeAlertFeed 
                      alerts={filteredAlerts} 
                      onSelectAlert={setSelectedAlert} 
                      selectedAlertId={selectedAlert?.id}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {selectedAlert && (
                      <motion.div
                        initial={{ opacity: 0, x: 120, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "38%", minWidth: "370px" }}
                        exit={{ opacity: 0, x: 120, width: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="select-none flex flex-col h-full shrink-0"
                      >
                        <IncidentDetail 
                          alert={selectedAlert} 
                          onClose={() => setSelectedAlert(null)} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ZONE F: Attack Campaign & Incident Overview */}
                <div className="space-y-6">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TopAttackersPanel />
                      <TopTargetsPanel />
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <CampaignOverviewPanel />
                      <AttackTimelinePanel />
                   </div>

                   <MultiStageAttackGraph />
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <SecurityActionCenter />
                      <ReportExportPanel />
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
