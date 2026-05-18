/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { KPIOverview } from "./components/KPIOverview";
import { AnalyticsZone } from "./components/AnalyticsZone";
import { AlertTable } from "./components/AlertTable";
import { BottomWidgets } from "./components/BottomWidgets";
import { IncidentDetail } from "./components/IncidentDetail";
import { SettingsPage } from "./pages/SettingsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { useSocket } from "./useSocket";
import { usePanelState } from "./hooks/usePanelState";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const { isConnected, alerts, traffic } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"dashboard" | "settings" | "alerts">("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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

  // No auto-selection to keep detail panel hidden by default per user request
  React.useEffect(() => {
    // Empty per user instructions to hide detail panel by default
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const q = searchQuery.toLowerCase();
    return (
      alert.sourceIp.toLowerCase().includes(q) ||
      alert.destIp.toLowerCase().includes(q) ||
      alert.attackType.toLowerCase().includes(q) ||
      alert.payload?.toLowerCase().includes(q) ||
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
                <KPIOverview />
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  <motion.div 
                    layout
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={cn(
                      "space-y-4",
                      selectedAlert ? "xl:col-span-9" : "xl:col-span-12"
                    )}
                  >
                    <AnalyticsZone 
                      traffic={traffic} 
                      alerts={alerts} 
                      onSelectAlert={setSelectedAlert}
                      isDarkMode={isDarkMode}
                    />
                    <AlertTable 
                      alerts={filteredAlerts} 
                      onSelectAlert={setSelectedAlert} 
                      selectedAlertId={selectedAlert?.id}
                    />
                  </motion.div>
                  
                  < AnimatePresence mode="popLayout">
                    {selectedAlert && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: 10, width: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="xl:col-span-3 h-full overflow-hidden"
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
            ) : (
              <SettingsPage key="settings" />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
