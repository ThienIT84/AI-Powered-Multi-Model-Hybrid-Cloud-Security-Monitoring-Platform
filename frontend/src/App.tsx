/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { KPIOverview } from "./components/dashboard/KPIOverview";
import { AnalyticsZone } from "./components/dashboard/AnalyticsZone";
import { AlertTable } from "./components/alerts/AlertTable";
import { BottomWidgets } from "./components/dashboard/BottomWidgets";
import { IncidentDetail } from "./components/alerts/IncidentDetail";
import { AlertsPage } from "./pages/AlertsPage";
import { NetworkMonitoringPage } from "./pages/NetworkMonitoringPage";
import {IntegrationsPage} from "./pages/IntegrationsPage";
import { PlaybooksPage } from "./pages/PlaybooksPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useSocket } from "./useSocket";
import { usePanelState } from "./hooks/usePanelState";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { mockDataSourceHealth, mockModelStatus, mockSummary } from "./mocks/securityData";

export default function App() {
  const { isConnected, alerts, traffic, error, dataMode } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"dashboard" | "alerts" | "network" | "integrations" | "playbooks" | "reports" | "settings">("dashboard");
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
          socketError={error}
          dataMode={dataMode}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <AnimatePresence mode="wait">
            {currentView === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <KPIOverview alerts={alerts} traffic={traffic} />
                
                <AnalyticsZone 
                  traffic={traffic} 
                  alerts={alerts} 
                  selectedAlert={selectedAlert}
                  onSelectAlert={setSelectedAlert}
                  isDarkMode={isDarkMode}
                  disabledAttackTypes={disabledAttackTypes}
                  onToggleAttackType={toggleAttackType}
                />

                <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full overflow-hidden">
                  <div className={cn(
                    "transition-all duration-300 ease-in-out min-w-0 flex-1",
                    selectedAlert ? "lg:w-[62%]" : "w-full"
                  )}>
                    <AlertTable 
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
                
                <BottomWidgets />
              </motion.div>
            ) : currentView === "alerts" ? (
              <AlertsPage key="alerts" />
            ) : currentView === "network" ? (
              <NetworkMonitoringPage key="network" />
            ) : currentView === "integrations" ? (
              <IntegrationsPage key="integrations" />
            ) : currentView === "playbooks" ? (
              <PlaybooksPage key="playbooks" />
            ) : currentView === "reports" ? (
              <ReportsPage key="reports" />
            ) : (
              <SettingsPage key="settings" />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
