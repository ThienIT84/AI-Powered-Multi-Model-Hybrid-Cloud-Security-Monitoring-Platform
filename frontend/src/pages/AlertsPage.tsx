import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Plus, 
  LayoutGrid, 
  List,
  ChevronDown
} from "lucide-react";
import { useSocket } from "../useSocket";
import { AlertStats } from "../components/alerts/AlertStats";
import { AlertFilters } from "../components/alerts/AlertFilters";
import { AlertDetailedList } from "../components/alerts/AlertDetailedList";
import { AlertDetailDrawer } from "../components/alerts/AlertDetailDrawer";
import { Alert } from "../types";
import { cn } from "../lib/utils";

export function AlertsPage() {
  const { alerts, isConnected } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filtering logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const q = searchQuery.toLowerCase();
      return (
        alert.id.toLowerCase().includes(q) ||
        alert.sourceIp.toLowerCase().includes(q) ||
        alert.destIp.toLowerCase().includes(q) ||
        alert.attackType.toLowerCase().includes(q) ||
        alert.severity.toLowerCase().includes(q)
      );
    });
  }, [alerts, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-[0.2em]">Security Alerts</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
            Realtime threat detection and incident monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group focus-within:w-64 transition-all duration-300 w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="SEARCH ALERTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg border transition-all",
              showFilters ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500" : "bg-muted border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter size={18} />
          </button>
          
          <div className="h-8 w-px bg-border mx-1" />
          
          <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
            <Download size={14} />
            Export
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all">
            <Plus size={14} />
            Create Rule
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <AlertStats alerts={alerts} />

      {/* Filters (Expandable) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <AlertFilters />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-widest">
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              {isConnected ? "Real-time Stream Active" : "Disconnected"}
            </div>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">•</span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              Showing {filteredAlerts.length} of {alerts.length} events
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'table' ? "bg-card text-cyan-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'grid' ? "bg-card text-cyan-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        <AlertDetailedList 
          alerts={filteredAlerts} 
          viewMode={viewMode}
          onSelectAlert={setSelectedAlert}
          selectedAlertId={selectedAlert?.id}
        />
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertDetailDrawer 
            alert={selectedAlert} 
            onClose={() => setSelectedAlert(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
