/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { KPIOverview } from "./components/KPIOverview";
import { AnalyticsZone } from "./components/AnalyticsZone";
import { AlertTable } from "./components/AlertTable";
import { BottomWidgets } from "./components/BottomWidgets";
import { IncidentDetail } from "./components/IncidentDetail";
import { useSocket } from "./useSocket";
import { Alert } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const { isConnected, alerts, traffic } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex h-screen bg-[#06070a] text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          isConnected={isConnected} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
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
              />
              <AlertTable 
                alerts={filteredAlerts} 
                onSelectAlert={setSelectedAlert} 
                selectedAlertId={selectedAlert?.id}
              />
            </motion.div>
            
            <AnimatePresence mode="popLayout">
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
        </div>
      </main>
    </div>
  );
}
