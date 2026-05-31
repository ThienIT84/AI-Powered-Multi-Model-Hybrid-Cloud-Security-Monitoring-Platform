import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Plus, 
  LayoutGrid, 
  List,
  ChevronDown,
  Bell,
  X
} from "lucide-react";
import { useSocket } from "../useSocket";
import { AlertStats } from "../components/alerts/AlertStats";
import { AlertFilters } from "../components/alerts/AlertFilters";
import { AlertDetailedList } from "../components/alerts/AlertDetailedList";
import { AlertTable } from "../components/alerts/AlertTable";
import { AlertDetailDrawer } from "../components/alerts/AlertDetailDrawer";
import { CreateRuleDrawer } from "../components/alerts/CreateRuleDrawer";
import { DatasetDriftPanel } from "../components/alerts/DatasetDriftPanel";
import { ModelPerformancePanel } from "../components/alerts/ModelPerformancePanel";
import { FusionAnalyticsPanel } from "../components/alerts/FusionAnalyticsPanel";
import { IncidentCorrelationEngine } from "../components/alerts/IncidentCorrelationEngine";
import { Alert, Severity, AlertStatus, getAlertFusionMeta } from "../types";
import { cn } from "../lib/utils";

// IP filtering logic (CIDR & prefixes)
function matchesIpFilter(ip: string, filterVal: string) {
  if (!filterVal) return true;
  const val = filterVal.toLowerCase().trim();
  if (val.includes('/')) {
    const [subnet, bitsStr] = val.split('/');
    const bits = parseInt(bitsStr, 10);
    if (!isNaN(bits)) {
      const subParts = subnet.split('.');
      const ipParts = ip.split('.');
      const bytesToCheck = Math.min(4, Math.floor(bits / 8));
      for (let i = 0; i < bytesToCheck; i++) {
        if (subParts[i] !== ipParts[i]) return false;
      }
      return true;
    }
  }
  return ip.toLowerCase().includes(val);
}

export function AlertsPage() {
  const { alerts, isConnected } = useSocket();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [mainTab, setMainTab] = useState<"fusion" | "drift" | "correlation">("fusion");
  
  // Sliding drawer for policy creation state
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  // Pagination states for Grid Mode
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [baselineAlerts, setBaselineAlerts] = useState<Alert[] | null>(null);

  // Search state & Debounce search
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conditions
  const [showFilters, setShowFilters] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceIpFilter, setSourceIpFilter] = useState("");
  const [cloudProviders, setCloudProviders] = useState<string[]>([]);
  const [minConfidence, setMinConfidence] = useState<number>(0);

  // New specific model-level filters requested in Target 4
  const [ai1Filter, setAi1Filter] = useState("ALL");
  const [ai2aFilter, setAi2aFilter] = useState("ALL");
  const [ai2bFilter, setAi2bFilter] = useState("ALL");

  const [savedFilters, setSavedFilters] = useState<string[]>([
    "CRITICAL AWS US-EAST-1",
    "SQLI LAST 24H",
    "NEW RANSOMWARE ATTEMPTS"
  ]);

  // View state & export dropdown
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Local state overrides to show instant results of analyst quick actions
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Alert>>>({});

  // Trigger search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setQueryThrottled();
    }, 280);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const setQueryThrottled = () => {
    setSearchQuery(searchVal);
  };

  const handleUpdateAlert = (alertId: string, updates: Partial<Alert>) => {
    setLocalOverrides(prev => ({
      ...prev,
      [alertId] : {
        ...(prev[alertId] || {}),
        ...updates
      }
    }));
  };

  // Pre-mapping alerts with analyst modifications overrides
  const updatedAlerts = useMemo(() => {
    return alerts.map(alert => ({
      ...alert,
      ...(localOverrides[alert.id] || {})
    }));
  }, [alerts, localOverrides]);

  // Combined active view of the selected alert
  const activeSelectedAlert = useMemo(() => {
    if (!selectedAlert) return null;
    const mapped = updatedAlerts.find(a => a.id === selectedAlert.id);
    return mapped || selectedAlert;
  }, [selectedAlert, updatedAlerts]);

  // Debouncing & filter processing pipeline
  const filteredAlerts = useMemo(() => {
    return updatedAlerts.filter(alert => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const displayId = alert.id.toLowerCase().startsWith('thr-')
          ? alert.id.toLowerCase()
          : `thr-${alert.id.toLowerCase()}`;
        
        const match = 
          alert.attackType.toLowerCase().includes(q) ||
          alert.sourceIp.toLowerCase().includes(q) ||
          (alert.destinationIp && alert.destinationIp.toLowerCase().includes(q)) ||
          alert.id.toLowerCase().includes(q) ||
          displayId.includes(q) ||
          (alert.mitre && alert.mitre.techniqueId.toLowerCase().includes(q)) ||
          (alert.mitre && alert.mitre.techniqueName.toLowerCase().includes(q)) ||
          (alert.rawPayload && alert.rawPayload.toLowerCase().includes(q)) ||
          alert.rawPayload?.toLowerCase().includes(q);

        if (!match) return false;
      }

      // 2. Severity filter
      if (severityFilter !== "ALL") {
        if (alert.severity.toUpperCase() !== severityFilter) return false;
      }

      // 3. Status filter
      if (statusFilter !== "ALL") {
        if (alert.status.toUpperCase() !== statusFilter) return false;
      }

      // 4. Source IP CIDR filter
      if (sourceIpFilter.trim()) {
        if (!matchesIpFilter(alert.sourceIp, sourceIpFilter)) return false;
      }

      // 5. Cloud Platform providers
      if (cloudProviders.length > 0) {
        if (!cloudProviders.includes(alert.cloudProvider.toUpperCase())) return false;
      }

      // 6. AI Confidence Level
      if (minConfidence > 0) {
        const score = alert.confidenceScore * 100;
        if (score < minConfidence) return false;
      }

      // 7. Advanced AI Model Filters (Target 4 request)
      const meta = getAlertFusionMeta(alert);
      if (ai1Filter !== "ALL" && meta.ai1Result !== ai1Filter) {
        return false;
      }
      if (ai2aFilter !== "ALL" && meta.ai2aClass !== ai2aFilter) {
        return false;
      }
      if (ai2bFilter !== "ALL" && meta.ai2bWeb !== ai2bFilter) {
        return false;
      }

      return true;
    });
  }, [updatedAlerts, searchQuery, severityFilter, statusFilter, sourceIpFilter, cloudProviders, minConfidence, ai1Filter, ai2aFilter, ai2bFilter]);

  // Set baseline alerts when moving past page 1 to freeze list representation inside GRID mode
  useEffect(() => {
    if (currentPage === 1) {
      setBaselineAlerts(null);
    } else {
      if (!baselineAlerts) {
        setBaselineAlerts(filteredAlerts);
      }
    }
  }, [currentPage, baselineAlerts, filteredAlerts]);

  // Reset pagination to Page 1 when any search, filter or classification parameters change
  useEffect(() => {
    setCurrentPage(1);
    setBaselineAlerts(null);
  }, [
    searchQuery,
    severityFilter,
    statusFilter,
    sourceIpFilter,
    cloudProviders,
    minConfidence,
    ai1Filter,
    ai2aFilter,
    ai2bFilter
  ]);

  // Count incoming alerts that match criteria but are not in baseline snapshot
  const newAlertsCount = useMemo(() => {
    if (currentPage === 1 || !baselineAlerts || baselineAlerts.length === 0) return 0;
    const baselineIds = new Set(baselineAlerts.map(a => a.id));
    return filteredAlerts.filter(a => !baselineIds.has(a.id)).length;
  }, [currentPage, filteredAlerts, baselineAlerts]);

  const activeAlertsForDisplay = useMemo(() => {
    if (currentPage === 1 || !baselineAlerts) {
      return filteredAlerts;
    }
    return baselineAlerts;
  }, [currentPage, baselineAlerts, filteredAlerts]);

  // Paginated elements for Grid view rendering only
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return activeAlertsForDisplay.slice(startIndex, endIndex);
  }, [activeAlertsForDisplay, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(activeAlertsForDisplay.length / rowsPerPage));
  }, [activeAlertsForDisplay, rowsPerPage]);

  const handleLoadNewAlerts = () => {
    setCurrentPage(1);
    setBaselineAlerts(null);
  };

  // Preset Filters
  const handleApplySavedFilter = (filterName: string) => {
    if (filterName === "CRITICAL AWS US-EAST-1") {
      setSeverityFilter("CRITICAL");
      setStatusFilter("ALL");
      setCloudProviders(["AWS"]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("");
      setAi1Filter("ALL");
      setAi2aFilter("ALL");
      setAi2bFilter("ALL");
      setToastNotification("Preset Applied: CRITICAL AWS incidents in US-EAST-1");
    } else if (filterName === "SQLI LAST 24H") {
      setSeverityFilter("ALL");
      setStatusFilter("ALL");
      setCloudProviders([]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("sql");
      setAi1Filter("ALL");
      setAi2aFilter("ALL");
      setAi2bFilter("SQLi");
      setToastNotification("Preset Applied: SQL Injection attack footprints");
    } else if (filterName === "NEW RANSOMWARE ATTEMPTS") {
      setSeverityFilter("ALL");
      setStatusFilter("NEW");
      setCloudProviders([]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("ransomware");
      setAi1Filter("ANOMALY");
      setAi2aFilter("ALL");
      setAi2bFilter("ALL");
      setToastNotification("Preset Applied: Unresolved Ransomware alarms");
    } else {
      setToastNotification(`Preset Loaded: ${filterName}`);
    }
    setTimeout(() => setToastNotification(null), 3000);
  };

  const handleRemoveSavedFilter = (filterName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedFilters(prev => prev.filter(f => f !== filterName));
    setToastNotification(`Filter template deleted`);
    setTimeout(() => setToastNotification(null), 2500);
  };

  const handleResetFilters = () => {
    setSeverityFilter("ALL");
    setStatusFilter("ALL");
    setSourceIpFilter("");
    setCloudProviders([]);
    setMinConfidence(0);
    setSearchVal("");
    setAi1Filter("ALL");
    setAi2aFilter("ALL");
    setAi2bFilter("ALL");
    setToastNotification("All network inquiry and AI filters reset");
    setTimeout(() => setToastNotification(null), 2500);
  };

  const handleSaveCurrentFilter = () => {
    const parts: string[] = [];
    if (severityFilter !== "ALL") parts.push(severityFilter);
    if (cloudProviders.length > 0) parts.push(cloudProviders.join("+"));
    if (statusFilter !== "ALL") parts.push(statusFilter);
    if (sourceIpFilter) parts.push(`IP:${sourceIpFilter}`);
    if (minConfidence > 0) parts.push(`>${minConfidence}%`);
    if (ai1Filter !== "ALL") parts.push(ai1Filter);
    if (ai2aFilter !== "ALL") parts.push(ai2aFilter);
    if (ai2bFilter !== "ALL") parts.push(ai2bFilter);
    
    const tagName = parts.join(" ") || "CUSTOM QUERY";
    const dup = uppercaseWords(tagName);
    if (!savedFilters.includes(dup)) {
      setSavedFilters(prev => [...prev, dup]);
      setToastNotification("Current filter metrics persisted!");
    } else {
      setToastNotification("Preset already exists on SOC layout");
    }
    setTimeout(() => setToastNotification(null), 3500);
  };

  const uppercaseWords = (str: string) => {
    return str.split(" ").map(w => w.toUpperCase()).join(" ");
  };

  // Rule Creation Handler
  const handleCreateRule = () => {
    setIsCreateRuleOpen(true);
  };

  const handleSaveRule = (ruleData: any) => {
    setToastNotification(`Enterprise Rule Established: "${ruleData.ruleName}" successfully compiled to active SOC boundary!`);
    setIsCreateRuleOpen(false);
    setTimeout(() => setToastNotification(null), 4500);
  };

  const handleTestRule = (ruleData: any) => {
    setToastNotification(`Policy Dry-Run: Evaluated conditions for "${ruleData.ruleName}". Identified 0 anomalously matched packets in historic buffer logs.`);
    setTimeout(() => setToastNotification(null), 4500);
  };

  // Data Export functions
  const exportToCSV = (data: Alert[]) => {
    const headers = "ID,Timestamp,Severity,Attack Type,Source IP,Destination IP,Platform,Region,Confidence,Status\n";
    const rows = data.map(a => `"${a.id}","${a.timestamp}","${a.severity}","${a.attackType}","${a.sourceIp}","${a.destinationIp}","${a.cloudProvider}","${a.region}","${((a.confidenceScore || 0.8) * 100).toFixed(0)}%","${a.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `soc-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportToJSON = (data: Alert[]) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `soc-alerts-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const exportToPDF = (data: Alert[]) => {
    let summary = `SOC SECURITY ALERTS REPORT SUMMARY\n`;
    summary += `Generated: ${new Date().toLocaleString()}\n`;
    summary += `Total Filtered Logs: ${data.length}\n`;
    summary += `=======================================================\n\n`;
    summary += data.map(a => `ID: THR-${a.id.toUpperCase()} | TIME: ${a.timestamp} | SEV: ${a.severity.toUpperCase()} | ATTACK: ${a.attackType} | SRC: ${a.sourceIp} -> DST: ${a.destinationIp} | STATUS: ${a.status.toUpperCase()}`).join("\n");
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `soc-alerts-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-20 select-none relative">
      {/* Toast notification banner */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-200 max-w-sm border border-border text-[10px] font-black uppercase tracking-widest text-[#06b6d4] bg-[#020617]/95 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5"
          >
            <Bell size={14} className="text-cyan-500 animate-bounce" />
            <span>{toastNotification}</span>
            <button onClick={() => setToastNotification(null)}>
              <X size={12} className="text-muted-foreground/60 hover:text-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER SECTION (with Title as requested) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-[0.2em] leading-none">Security Alerts</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 leading-none">
            Realtime threat detection and incident monitoring
          </p>
        </div>
        
        {/* 1.1 TOOLBAR ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* A. ADVANCED SEARCH INPUT */}
          <div className="relative w-48 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input 
              type="text"
              placeholder="Search events, IPs, payloads..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-8 py-2 text-[10px] font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-500/40"
            />
            {searchVal && (
              <button 
                onClick={() => setSearchVal("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/45 hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          {/* B. FILTER TOGGLE BUTTON */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg border transition-all cursor-pointer",
              showFilters 
                ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-500 shadow-inner" 
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter size={15} />
          </button>
          
          <div className="h-7 w-px bg-border/80 mx-0.5" />
          
          {/* C. EXPORT BUTTON WITH DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-[9.5px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all cursor-pointer leading-none"
            >
              <Download size={13} />
              Export
              <ChevronDown size={10} className={cn("transition-transform duration-200 ml-0.5", showExportDropdown ? "rotate-180" : "")} />
            </button>
            
            <AnimatePresence>
              {showExportDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1.5 w-42 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-1 flex flex-col gap-0.5">
                      <button 
                        onClick={() => { exportToCSV(filteredAlerts); setShowExportDropdown(false); }}
                        className="w-full text-left px-3 py-1.5 text-[9.5px] font-bold text-foreground/80 hover:bg-cyan-500/10 hover:text-cyan-500 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        Export as CSV
                        <span className="font-mono text-[7px] text-muted-foreground uppercase bg-muted px-1 rounded">CSV</span>
                      </button>
                      <button 
                        onClick={() => { exportToJSON(filteredAlerts); setShowExportDropdown(false); }}
                        className="w-full text-left px-3 py-1.5 text-[9.5px] font-bold text-foreground/80 hover:bg-cyan-500/10 hover:text-cyan-500 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        Export as JSON
                        <span className="font-mono text-[7px] text-muted-foreground uppercase bg-muted px-1 rounded">JSON</span>
                      </button>
                      <button 
                        onClick={() => { exportToPDF(filteredAlerts); setShowExportDropdown(false); }}
                        className="w-full text-left px-3 py-1.5 text-[9.5px] font-bold text-foreground/80 hover:bg-cyan-500/10 hover:text-cyan-500 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        Export PDF Report
                        <span className="font-mono text-[7px] text-red-500/80 uppercase bg-red-500/5 px-1 rounded border border-red-500/10">Report</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* D. CREATE RULE BUTTON */}
          <button 
            onClick={handleCreateRule}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[9.5px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer leading-none"
          >
            <Plus size={13} />
            Create Rule
          </button>
        </div>
      </div>

      {/* Dynamic Main Navigation Tabs of the Platform */}
      <div className="flex border-b border-border bg-card rounded-xl p-1 gap-2 shrink-0">
        <button
          onClick={() => setMainTab("fusion")}
          className={cn(
            "flex-1 py-2.5 text-[9.5px] font-black uppercase tracking-widest transition-all rounded-lg cursor-pointer text-center flex items-center justify-center gap-2 border",
            mainTab === "fusion"
              ? "text-cyan-500 border-cyan-500/50 bg-cyan-500/6 shadow-sm font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
          )}
        >
          <span>[Fusion View]</span>
        </button>
        <button
          onClick={() => setMainTab("drift")}
          className={cn(
            "flex-1 py-2.5 text-[9.5px] font-black uppercase tracking-widest transition-all rounded-lg cursor-pointer text-center flex items-center justify-center gap-2 border",
            mainTab === "drift"
              ? "text-cyan-500 border-cyan-500/50 bg-cyan-500/6 shadow-sm font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
          )}
        >
          <span>[Drift Analysis]</span>
        </button>
        <button
          onClick={() => setMainTab("correlation")}
          className={cn(
            "flex-1 py-2.5 text-[9.5px] font-black uppercase tracking-widest transition-all rounded-lg cursor-pointer text-center flex items-center justify-center gap-2 border",
            mainTab === "correlation"
              ? "text-cyan-500 border-cyan-500/50 bg-cyan-500/6 shadow-sm font-extrabold"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
          )}
        >
          <span>[Incident Correlation]</span>
        </button>
      </div>

      {mainTab === "fusion" && (
        <>
          {/* 2. OVERVIEW METRICS CARDS */}
          <AlertStats alerts={updatedAlerts} />

      {/* 3. ADVANCED FILTERS PANEL */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <AlertFilters 
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sourceIpFilter={sourceIpFilter}
              setSourceIpFilter={setSourceIpFilter}
              cloudProviders={cloudProviders}
              setCloudProviders={setCloudProviders}
              minConfidence={minConfidence}
              setMinConfidence={setMinConfidence}
              ai1Filter={ai1Filter}
              setAi1Filter={setAi1Filter}
              ai2aFilter={ai2aFilter}
              setAi2aFilter={setAi2aFilter}
              ai2bFilter={ai2bFilter}
              setAi2bFilter={setAi2bFilter}
              savedFilters={savedFilters}
              onApplySavedFilter={handleApplySavedFilter}
              onRemoveSavedFilter={handleRemoveSavedFilter}
              onResetFilters={handleResetFilters}
              onSaveCurrentFilter={handleSaveCurrentFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab select option header for stream table */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40 select-none">
        <div className="flex items-center gap-2">
           <List size={14} className="text-cyan-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FUSION LAYERS VIEWPORTS</span>
        </div>
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <button 
            onClick={() => setViewMode('table')}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              viewMode === 'table' ? "bg-card text-cyan-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={13} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              viewMode === 'grid' ? "bg-card text-cyan-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* 4 & 5. ALERTS STREAM TABLE & INCIDENT SIDE PANEL */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full relative min-h-0">
        
        {/* 4. ALERTS STREAM VIEWPORT (Upgraded layout with visual triggers) */}
        <div className={cn(
          "transition-all duration-300 w-full overflow-hidden self-start flex flex-col gap-4",
          activeSelectedAlert ? "lg:w-[65%]" : "lg:w-full"
        )}>
          {viewMode === "table" ? (
            <AlertTable 
              alerts={activeAlertsForDisplay}
              onSelectAlert={setSelectedAlert}
              selectedAlertId={activeSelectedAlert?.id}
              onUpdateAlert={handleUpdateAlert}
            />
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col w-full overflow-hidden min-h-0">
               {/* Grid Header Info */}
               <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-widest select-none">
                    <div className={cn(
                      "w-2 h-2 rounded-full", 
                      isConnected 
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" 
                        : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    )} />
                    <span className={isConnected ? "text-green-500" : "text-red-500"}>
                      {isConnected ? "REAL-TIME STREAM ACTIVE" : "DISCONNECTED"}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                     Showing {paginatedAlerts.length} Grid Cards
                  </span>
               </div>

               {/* Grid Render */}
               <AlertDetailedList 
                 alerts={paginatedAlerts} 
                 viewMode={viewMode}
                 onSelectAlert={setSelectedAlert}
                 selectedAlertId={activeSelectedAlert?.id}
               />

               {/* Pagination Footer block (Grid Mode outer count) */}
               <div className="p-3.5 bg-muted/20 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 leading-none shrink-0">
                 <div className="flex items-center gap-4 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                   <div className="flex items-center gap-1.5">
                     <span>Show</span>
                     <select 
                       value={rowsPerPage} 
                       onChange={(e) => {
                         setRowsPerPage(Number(e.target.value));
                         setCurrentPage(1);
                       }}
                       className="bg-muted px-2 py-1 rounded border border-border text-[9.5px] font-bold text-foreground cursor-pointer focus:outline-none"
                     >
                       {[25, 50, 100].map(size => (
                         <option value={size} key={size}>{size}</option>
                       ))}
                     </select>
                     <span>per page</span>
                   </div>
                   <span className="opacity-25 font-normal">|</span>
                   <span>
                     Showing <span className="text-foreground">{activeAlertsForDisplay.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to <span className="text-foreground">{Math.min(currentPage * rowsPerPage, activeAlertsForDisplay.length)}</span> of <span className="text-foreground">{activeAlertsForDisplay.length}</span> entries
                   </span>
                 </div>

                 {/* Pagination buttons */}
                 <div className="flex items-center gap-1.5 self-center sm:self-auto">
                   <button
                     type="button"
                     disabled={currentPage === 1}
                     onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                     className="px-2.5 py-1.5 rounded-md bg-muted border border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed selection:bg-transparent cursor-pointer leading-none"
                   >
                     Prev
                   </button>
                   
                   {/* Visible Page Numbers */}
                   <div className="flex items-center gap-1">
                     {Array.from({ length: totalPages }, (_, i) => i + 1)
                       .filter(p => {
                         return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                       })
                       .map((p, idx, arr) => {
                         const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                         return (
                           <React.Fragment key={p}>
                             {showEllipsis && <span className="px-1 text-muted-foreground text-[8px] font-bold">...</span>}
                             <button
                               type="button"
                               onClick={() => setCurrentPage(p)}
                               className={cn(
                                 "w-6.5 h-6.5 text-[9px] font-black rounded-md flex items-center justify-center transition-all cursor-pointer leading-none",
                                 currentPage === p
                                   ? "bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/40 font-extrabold"
                                   : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                               )}
                             >
                               {p}
                             </button>
                           </React.Fragment>
                         );
                       })
                     }
                   </div>

                   <button
                     type="button"
                     disabled={currentPage === totalPages}
                     onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                     className="px-2.5 py-1.5 rounded-md bg-muted border border-border text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed selection:bg-transparent cursor-pointer leading-none"
                   >
                     Next
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* 5. INCIDENT SIDE PANEL (Occupies 35% of space, zero absolute blocking overlay) */}
        <AnimatePresence>
          {activeSelectedAlert && (
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full lg:w-[35%] bg-card border border-border rounded-xl shadow-md overflow-hidden self-start min-h-0 flex flex-col"
            >
              <AlertDetailDrawer 
                alert={activeSelectedAlert}
                onClose={() => setSelectedAlert(null)}
                onUpdateAlert={handleUpdateAlert}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      </>
      )}

      {mainTab === "drift" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatasetDriftPanel />
            <ModelPerformancePanel />
          </div>
          <FusionAnalyticsPanel />
        </div>
      )}

      {mainTab === "correlation" && (
        <div className="space-y-6">
          <IncidentCorrelationEngine />
        </div>
      )}

      {/* 6. CREATE DETECTION RULE OVERLAY SLIDE PANEL */}
      <AnimatePresence>
        {isCreateRuleOpen && (
          <CreateRuleDrawer 
            isOpen={isCreateRuleOpen}
            onClose={() => setIsCreateRuleOpen(false)}
            onSaveRule={handleSaveRule}
            onTestRule={handleTestRule}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
