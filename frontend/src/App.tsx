/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
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

import { useSocket } from "./useSocket";
import { useAuth } from "./hooks/useAuth";
import { usePanelState } from "./hooks/usePanelState";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { AppView } from "./types/views";
import { useTheme } from "./context/ThemeContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { usePlatformStatus } from "./hooks/usePlatformStatus";
import { appConfig } from "./config";

function viewFromPath(pathname: string): AppView {
  if (pathname.startsWith("/alerts")) return "alerts";
  if (pathname.startsWith("/network")) return "network";
  if (pathname.startsWith("/endpoints")) return "endpoints";
  if (pathname.startsWith("/cloud")) return "cloud";
  if (pathname.startsWith("/threat-intel")) return "threat-intel";
  if (pathname.startsWith("/ai-threat-detection")) return "ai-threat-detection";
  if (pathname.startsWith("/attack-surface")) return "attack-surface";
  if (pathname.startsWith("/mitre")) return "mitre-attack";
  if (pathname.startsWith("/cases")) return "case-management";
  if (pathname.startsWith("/integrations")) return "integrations";
  if (pathname.startsWith("/playbooks")) return "playbooks";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

function pathForView(view: AppView): string {
  const paths: Record<AppView, string> = {
    dashboard: "/dashboard",
    alerts: "/alerts",
    network: "/network",
    endpoints: "/endpoints/default",
    cloud: "/cloud/assets/default",
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
  return paths[view];
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Enforce unauthorized redirection
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const path = location.pathname;
      if (path !== "/login" && path !== "/register") {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Push main page URLs if already authorized
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const path = location.pathname;
      if (path === "/login" || path === "/register") {
        navigate("/dashboard", { replace: true });
      } else if (path === "/") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  const handleNavigateToAuth = (screen: "login" | "register") => {
    navigate(`/${screen}`);
  };

  const handleAuthSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  const { isConnected, socketStatus, alerts, traffic, error: socketError, reconnect } = useSocket();
  const { status: platformStatus, refresh: refreshPlatformStatus } = usePlatformStatus(socketStatus);

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
    refreshPlatformStatus().finally(() => {
      setIsSyncing(false);
    });
  }, [refreshPlatformStatus]);

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const currentView = viewFromPath(location.pathname);
  const setCurrentView = React.useCallback((view: AppView) => {
    navigate(pathForView(view));
  }, [navigate]);
  const { theme, isDarkMode, setTheme } = useTheme();
  const [disabledAttackTypes, setDisabledAttackTypes] = useState<string[]>([]);
  
  const { 
    isAlertsOpen, 
    isSettingsOpen, 
    openPanel, 
    closePanel 
  } = usePanelState();

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

  const handleSearchSubmit = React.useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    if (/^case[-_\w]*/i.test(q)) {
      navigate(`/cases/${encodeURIComponent(q)}`);
    } else if (/^(asset|host|endpoint|10\.|192\.|172\.)/i.test(q)) {
      navigate(`/endpoints/${encodeURIComponent(q)}`);
    } else {
      navigate(`/alerts?query=${encodeURIComponent(q)}`);
    }
  }, [navigate, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#030303] text-cyan-500 font-mono flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
        <span className="text-xs uppercase tracking-widest text-zinc-400">Loading Secure SOC Workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/register"
          element={<RegisterPage onNavigateToLogin={() => handleNavigateToAuth("login")} onSuccess={handleAuthSuccess} />}
        />
        <Route
          path="*"
          element={<LoginPage onNavigateToRegister={() => handleNavigateToAuth("register")} onSuccess={handleAuthSuccess} />}
        />
      </Routes>
    );
  }

  if (appConfig.configurationError) {
    return (
      <div className="min-h-screen w-full bg-[#030303] text-red-400 font-mono flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <ShieldAlert size={36} className="text-red-500" />
        <div className="space-y-2 max-w-xl">
          <h1 className="text-sm font-black uppercase tracking-widest text-red-300">Configuration Error</h1>
          <p className="text-xs text-zinc-300 leading-relaxed">{appConfig.configurationError}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Set VITE_DATA_MODE before starting the frontend.
          </p>
        </div>
      </div>
    );
  }

   return (
    <div className="flex h-screen font-sans overflow-hidden transition-colors duration-500 bg-background text-foreground">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          isConnected={isConnected} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setTheme(isDarkMode ? "Light" : "Dark")}
          currentView={currentView}
          onViewChange={setCurrentView}
          alerts={alerts}
          onSelectAlert={setSelectedAlert}
          isAlertsOpen={isAlertsOpen}
          isSettingsOpen={isSettingsOpen}
          onToggleAlerts={() => openPanel('alerts')}
          onToggleSettings={() => openPanel('settings')}
          onClosePanels={closePanel}
          socketError={socketError || platformStatus.lastError}
          platformStatus={platformStatus}
          socketStatus={socketStatus}
          onReconnect={reconnect}
          onSearchSubmit={handleSearchSubmit}
        />
        
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          currentView === "settings" ? "p-0 overflow-hidden flex flex-col" : "p-4 space-y-4"
        )}>
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={(
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
                  platformStatus={platformStatus}
                  socketStatus={socketStatus}
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
              )} />
              <Route path="/alerts" element={<AlertsPage key="alerts" alerts={alerts} isConnected={isConnected} />} />
              <Route path="/alerts/:id" element={<AlertsPage key="alert-detail" alerts={alerts} isConnected={isConnected} />} />
              <Route path="/network" element={<NetworkMonitoringPage key="network" />} />
              <Route path="/network/flows/:flowId" element={<NetworkMonitoringPage key="network-flow" />} />
              <Route path="/endpoints/:id" element={<EndpointPage key="endpoints" />} />
              <Route path="/cloud/assets/:id" element={<CloudPage key="cloud" />} />
              <Route path="/threat-intel" element={<ThreatIntelPage key="threat-intel" />} />
              <Route path="/ai-threat-detection" element={<AIThreatDetectionPage key="ai-threat-detection" />} />
              <Route path="/attack-surface" element={<AttackSurfacePage key="attack-surface" />} />
              <Route path="/mitre" element={<MitreAttackPage key="mitre-attack" />} />
              <Route path="/mitre/:techniqueId" element={<MitreAttackPage key="mitre-technique" />} />
              <Route path="/cases" element={<CaseManagementPage key="case-management" />} />
              <Route path="/cases/:id" element={<CaseManagementPage key="case-detail" />} />
              <Route path="/integrations" element={<IntegrationsPage key="integrations" />} />
              <Route path="/playbooks" element={<PlaybooksPage key="playbooks" />} />
              <Route path="/reports" element={<ReportsPage key="reports" />} />
              <Route path="/reports/:id" element={<ReportsPage key="report-detail" />} />
              <Route path="/settings" element={(
                <SettingsPage 
                key="settings" 
                isDarkMode={isDarkMode} 
                onThemeToggle={() => setTheme(isDarkMode ? "Light" : "Dark")} 
                onThemeChange={(themeVal) => {
                  setTheme(themeVal);
                }}
              />
              )} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
