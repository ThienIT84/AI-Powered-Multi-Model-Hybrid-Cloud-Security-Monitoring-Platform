/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
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
import { LatestNetworkFlows } from "./components/dashboard/LatestNetworkFlows";
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
import { Loader2 } from "lucide-react";
import { buildViewPath, parseRoute } from "./lib/routes";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Track deep auth pathway
  const [authScreen, setAuthScreen] = useState<"login" | "register">(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/register") return "register";
    }
    return "login";
  });

  // Keep routing synced to popstate events
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/register") {
        setAuthScreen("register");
      } else if (path === "/login") {
        setAuthScreen("login");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Enforce unauthorized redirection
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.history.pushState({}, "", "/login");
        setAuthScreen("login");
      }
    }
  }, [isAuthenticated, loading]);

  // Push main page URLs if already authorized
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const path = window.location.pathname;
      if (path === "/login" || path === "/register") {
        const dashboardPath = buildViewPath("dashboard");
        window.history.pushState({}, "", dashboardPath);
        const nextRoute = parseRoute(dashboardPath);
        setRouteState(nextRoute);
        setCurrentView(nextRoute.view);
      }
    }
  }, [isAuthenticated, loading]);

  const handleNavigateToAuth = (screen: "login" | "register") => {
    setAuthScreen(screen);
    window.history.pushState({}, "", `/${screen}`);
  };

  const handleAuthSuccess = () => {
    const dashboardPath = buildViewPath("dashboard");
    window.history.pushState({}, "", dashboardPath);
    const nextRoute = parseRoute(dashboardPath);
    setRouteState(nextRoute);
    setCurrentView(nextRoute.view);
    setAuthScreen("login");
  };

  const {
    isConnected,
    socketStatus,
    alerts,
    traffic,
    networkFlows,
    error: socketError,
    dataMode,
    platformStatus,
    reconnect,
  } = useSocket(isAuthenticated);

  // Call unified SOC command center dashboard hooks
  const {
    metrics,
    fusionOverview,
    securityPosture,
    severityDistribution,
    openCasesSummary
  } = useDashboardMetrics(alerts, traffic);

  const platformHealth = usePlatformHealth(platformStatus);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefresh = React.useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  }, []);

  const [routeState, setRouteState] = useState(() => parseRoute(window.location.pathname));
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<AppView>(routeState.view);
  const { theme, isDarkMode, setTheme } = useTheme();
  const [disabledAttackTypes, setDisabledAttackTypes] = useState<string[]>([]);
  
  const { 
    isAlertsOpen, 
    isSettingsOpen, 
    openPanel, 
    closePanel 
  } = usePanelState();

  const navigateToView = React.useCallback((view: AppView, id?: string | null) => {
    const path = buildViewPath(view, id);
    window.history.pushState({}, "", path);
    const nextRoute = parseRoute(path);
    setRouteState(nextRoute);
    setCurrentView(nextRoute.view);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = parseRoute(window.location.pathname);
      setRouteState(nextRoute);
      setCurrentView(nextRoute.view);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const nextRoute = parseRoute(window.location.pathname);
    setRouteState(nextRoute);
    setCurrentView(nextRoute.view);
  }, [isAuthenticated]);

  useEffect(() => {
    if (routeState.alertId) {
      const match = alerts.find((alert) => alert.id === routeState.alertId);
      if (match) setSelectedAlert(match);
    }
  }, [alerts, routeState.alertId]);

  const handleSelectAlert = React.useCallback((alert: Alert | null) => {
    setSelectedAlert(alert);
    if (alert) {
      navigateToView("alerts", alert.id);
    }
  }, [navigateToView]);

  const handleHeaderSearchSubmit = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const alertMatch = alerts.find((alert) => alert.id.toLowerCase() === trimmed.toLowerCase());
    if (alertMatch) {
      handleSelectAlert(alertMatch);
      return;
    }
    if (trimmed.toUpperCase().startsWith("CASE-")) {
      navigateToView("case-management", trimmed);
    }
  }, [alerts, handleSelectAlert, navigateToView]);

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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#030303] text-cyan-500 font-mono flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
        <span className="text-xs uppercase tracking-widest text-zinc-400">Loading Secure SOC Workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authScreen === "register") {
      return (
        <RegisterPage
          onNavigateToLogin={() => handleNavigateToAuth("login")}
          onSuccess={handleAuthSuccess}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToRegister={() => handleNavigateToAuth("register")}
        onSuccess={handleAuthSuccess}
      />
    );
  }

   return (
    <div className="flex h-screen font-sans overflow-hidden transition-colors duration-500 bg-background text-foreground">
      <Sidebar currentView={currentView} onViewChange={navigateToView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          isConnected={isConnected} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setTheme(isDarkMode ? "Light" : "Dark")}
          currentView={currentView}
          onViewChange={navigateToView}
          alerts={alerts}
          onSelectAlert={handleSelectAlert}
          isAlertsOpen={isAlertsOpen}
          isSettingsOpen={isSettingsOpen}
          onToggleAlerts={() => openPanel('alerts')}
          onToggleSettings={() => openPanel('settings')}
          onClosePanels={closePanel}
          socketError={socketError}
          dataMode={dataMode}
          socketStatus={socketStatus}
          platformStatus={platformStatus}
          onReconnect={reconnect}
          onSearchSubmit={handleHeaderSearchSubmit}
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
                {dataMode !== "live" && (
                  <div className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-purple-400">
                    {dataMode === "demo" ? "Simulated data mode" : "Replay data mode"} - not live telemetry
                  </div>
                )}
                {/* SECTION A - HEADER */}
                <DashboardHeader 
                  isConnected={isConnected} 
                  onRefresh={handleRefresh} 
                  isSyncing={isSyncing} 
                  platformStatus={platformStatus}
                />

                {/* SECTION B - EXECUTIVE KPI BAR */}
                <ExecutiveKPIBar metrics={metrics} />

                {/* SECTION C - SOC SITUATION SNAPSHOT */}
                <SOCSituationSnapshot alerts={alerts} />

                {/* SECTION D - REAL-TIME INCIDENT STREAM (WITH DETAILS ON THE RIGHT ON DESKTOP) */}
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
                    onViewAlertsClick={() => navigateToView("alerts")}
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
                          onClose={() => {
                            setSelectedAlert(null);
                            navigateToView("dashboard");
                          }} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* LIVE NETWORK TRAFFIC - NORMAL AND ANOMALOUS FLOWS */}
                <LatestNetworkFlows flows={networkFlows} isConnected={isConnected} />

                {/* SECTIONS E, F - OPERATIONAL SUMMARIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FUSION OVERVIEW */}
                  <FusionOverviewPanel metrics={fusionOverview} />
                  
                  {/* OPEN CASES SUMMARY */}
                  <OpenCasesSummary metrics={openCasesSummary} />
                </div>

                {/* SECTIONS G, H - POSTURE SUMMARIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SECURITY POSTURE SUMMARY */}
                  <SecurityPostureSummary metrics={securityPosture} />

                  {/* THREAT SEVERITY DISTRIBUTION */}
                  <AlertDistributionChart data={severityDistribution} />
                </div>

                {/* SECTIONS I, J - HEALTH & ACTION PATHS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex flex-col h-full">
                    {/* PLATFORM HEALTH */}
                    <PlatformHealthPanel platformStatus={platformHealth} />
                  </div>
                  
                  <div className="lg:col-span-4 flex flex-col h-full justify-between">
                    {/* SOC QUICK ACTIONS */}
                    <SOCQuickActions onNavigate={(v) => navigateToView(v)} />
                  </div>
                </div>
              </motion.div>

            ) : currentView === "alerts" ? (
              <AlertsPage
                key="alerts"
                alerts={alerts}
                isConnected={isConnected}
                dataMode={dataMode}
                routeAlertId={routeState.alertId}
                onRouteAlertChange={(alertId) => navigateToView("alerts", alertId)}
              />
            ) : currentView === "network" ? (
              <NetworkMonitoringPage key="network" alerts={alerts} />
            ) : currentView === "endpoints" ? (
              <EndpointPage key="endpoints" alerts={alerts} />
            ) : currentView === "cloud" ? (
              <CloudPage key="cloud" alerts={alerts} />
            ) : currentView === "threat-intel" ? (
              <ThreatIntelPage key="threat-intel" alerts={alerts} />
            ) : currentView === "ai-threat-detection" ? (
              <AIThreatDetectionPage key="ai-threat-detection" alerts={alerts} platformStatus={platformStatus} />
            ) : currentView === "attack-surface" ? (
              <AttackSurfacePage key="attack-surface" alerts={alerts} />
            ) : currentView === "mitre-attack" ? (
              <MitreAttackPage key="mitre-attack" alerts={alerts} />
            ) : currentView === "case-management" ? (
              <CaseManagementPage key="case-management" dataMode={dataMode} routeCaseId={routeState.caseId} onRouteCaseChange={(caseId) => navigateToView("case-management", caseId)} />
            ) : currentView === "integrations" ? (
              <IntegrationsPage key="integrations" platformStatus={platformStatus} />
            ) : currentView === "playbooks" ? (
              <PlaybooksPage key="playbooks" />
            ) : currentView === "reports" ? (
              <ReportsPage key="reports" alerts={alerts} />
            ) : (
              <SettingsPage 
                key="settings" 
                isDarkMode={isDarkMode} 
                onThemeToggle={() => setTheme(isDarkMode ? "Light" : "Dark")} 
                onThemeChange={(themeVal) => {
                  setTheme(themeVal);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
