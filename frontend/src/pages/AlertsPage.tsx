import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronDown,
  Bell,
  X,
  List
} from "lucide-react";
import { AlertStats } from "../components/alerts/AlertStats";
import { AlertFilters } from "../components/alerts/AlertFilters";
import { AlertTable } from "../components/alerts/AlertTable";
import { AlertDetailDrawer } from "../components/alerts/AlertDetailDrawer";
import { CreateRuleDrawer } from "../components/alerts/CreateRuleDrawer";
import { Alert, Severity, AlertStatus } from "../types";
import { cn } from "../lib/utils";
import { createDetectionRule, DetectionRuleDraft, testDetectionRule } from "../services/rules.service";
import { getAlertDetail } from "../services/alerts.service";
import { useAuth } from "../hooks/useAuth";
import { ErrorState } from "../components/common/DataState";

interface AlertsPageProps {
  alerts: Alert[];
  isConnected: boolean;
}

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

export function AlertsPage({ alerts, isConnected }: AlertsPageProps) {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loadedDetailAlert, setLoadedDetailAlert] = useState<Alert | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  
  // Sliding drawer for policy creation state
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

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

  const [savedFilters, setSavedFilters] = useState<string[]>([
    "CRITICAL AWS US-EAST-1",
    "SQLI ALERTS",
    "NEW THREAT ALARMS"
  ]);

  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [ruleActionState, setRuleActionState] = useState<"idle" | "pending" | "success" | "failed">("idle");

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

  const handleUpdateAlert = async (
    alertId: string,
    updates: Partial<Alert>,
    persist?: () => Promise<unknown>
  ) => {
    const previousOverride = localOverrides[alertId];
    setLocalOverrides(prev => ({
      ...prev,
      [alertId]: {
        ...(prev[alertId] || {}),
        ...updates
      }
    }));

    if (!persist) return;

    try {
      await persist();
      setToastNotification("Alert action synced");
      setTimeout(() => setToastNotification(null), 2500);
    } catch (error) {
      setLocalOverrides(prev => {
        const next = { ...prev };
        if (previousOverride) {
          next[alertId] = previousOverride;
        } else {
          delete next[alertId];
        }
        return next;
      });
      setToastNotification(error instanceof Error ? `Action failed: ${error.message}` : "Action failed");
      setTimeout(() => setToastNotification(null), 3500);
      throw error;
    }
  };

  // Pre-mapping alerts with analyst modifications overrides
  const updatedAlerts = useMemo(() => {
    const base = alerts.map(alert => ({
      ...alert,
      ...(localOverrides[alert.id] || {})
    }));
    if (loadedDetailAlert && !base.some((alert) => alert.id === loadedDetailAlert.id)) {
      return [{ ...loadedDetailAlert, ...(localOverrides[loadedDetailAlert.id] || {}) }, ...base];
    }
    return base;
  }, [alerts, localOverrides, loadedDetailAlert]);

  // Combined active view of the selected alert
  const activeSelectedAlert = useMemo(() => {
    if (!selectedAlert) return null;
    const mapped = updatedAlerts.find(a => a.id === selectedAlert.id);
    return mapped || selectedAlert;
  }, [selectedAlert, updatedAlerts]);

  useEffect(() => {
    if (!params.id) {
      setLoadedDetailAlert(null);
      setDetailError(null);
      return;
    }
    const match = updatedAlerts.find((alert) => alert.id === params.id || `THR-${alert.id}` === params.id);
    if (match) {
      setSelectedAlert(match);
      setDetailError(null);
      return;
    }

    let cancelled = false;
    setDetailError(null);
    getAlertDetail(params.id, updatedAlerts)
      .then((detail) => {
        if (cancelled) return;
        if (detail) {
          setLoadedDetailAlert(detail);
          setSelectedAlert(detail);
        } else {
          setDetailError("Alert detail not found.");
        }
      })
      .catch((error) => {
        if (!cancelled) setDetailError(error instanceof Error ? error.message : "Alert detail unavailable.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id, updatedAlerts]);

  const handleSelectAlert = (alert: Alert | null) => {
    setSelectedAlert(alert);
    navigate(alert ? `/alerts/${encodeURIComponent(alert.id)}` : "/alerts", { replace: false });
  };

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

      return true;
    });
  }, [updatedAlerts, searchQuery, severityFilter, statusFilter, sourceIpFilter, cloudProviders, minConfidence]);

  // Preset Filters
  const handleApplySavedFilter = (filterName: string) => {
    if (filterName === "CRITICAL AWS US-EAST-1") {
      setSeverityFilter("CRITICAL");
      setStatusFilter("ALL");
      setCloudProviders(["AWS"]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("");
      setToastNotification("Preset Applied: CRITICAL AWS incidents in US-EAST-1");
    } else if (filterName === "SQLI ALERTS") {
      setSeverityFilter("ALL");
      setStatusFilter("ALL");
      setCloudProviders([]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("sql");
      setToastNotification("Preset Applied: SQL Injection attack footprints");
    } else if (filterName === "NEW THREAT ALARMS") {
      setSeverityFilter("ALL");
      setStatusFilter("NEW");
      setCloudProviders([]);
      setSourceIpFilter("");
      setMinConfidence(0);
      setSearchVal("");
      setToastNotification("Preset Applied: Unresolved threat alarms");
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

  const handleSaveRule = async (ruleData: DetectionRuleDraft) => {
    setRuleActionState("pending");
    try {
      const rule = await createDetectionRule(ruleData);
      setRuleActionState("success");
      setToastNotification(`Rule saved: ${rule.id}`);
      setIsCreateRuleOpen(false);
    } catch (error) {
      setRuleActionState("failed");
      setToastNotification(error instanceof Error ? `Rule save failed: ${error.message}` : "Rule save failed");
      throw error;
    } finally {
      setTimeout(() => setToastNotification(null), 4500);
    }
  };

  const handleTestRule = async (ruleData: DetectionRuleDraft) => {
    setRuleActionState("pending");
    try {
      const result = await testDetectionRule(ruleData);
      setRuleActionState("success");
      setToastNotification(`Rule test ${result.status}: ${result.matches} matches`);
    } catch (error) {
      setRuleActionState("failed");
      setToastNotification(error instanceof Error ? `Rule test failed: ${error.message}` : "Rule test failed");
      throw error;
    } finally {
      setTimeout(() => setToastNotification(null), 4500);
    }
  };

  return (
    <motion.div
      key="alerts"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6 pb-20 select-none relative"
    >
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

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-[0.2em] leading-none">
            SOC Fusion Alert Management Console
          </h1>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1.5 leading-none">
            Zeek-first Decision Output Layer (Real-time Fusion Decision Stream)
          </p>
        </div>
        
        {/* TOOLBAR ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "px-2.5 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest font-mono",
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
              : "bg-red-500/10 border-red-500/25 text-red-500"
          )}>
            {isConnected ? "Stream Live" : "Stream Offline"}
          </span>

          {/* ADVANCED SEARCH INPUT */}
          <div className="relative w-48 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input 
              type="text"
              placeholder="Search by event, IP, signature..."
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
          
          {/* FILTER TOGGLE BUTTON */}
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
          
          {/* CREATE RULE BUTTON */}
          <button 
            onClick={handleCreateRule}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[9.5px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer leading-none"
          >
            <Plus size={13} />
            Create Rule
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS CARDS (Top Header) */}
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
              savedFilters={savedFilters}
              onApplySavedFilter={handleApplySavedFilter}
              onRemoveSavedFilter={handleRemoveSavedFilter}
              onResetFilters={handleResetFilters}
              onSaveCurrentFilter={handleSaveCurrentFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 & 5. REAL-TIME FUSION STREAM TABLE & DETAIL SIDEBAR CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full relative min-h-0">
        
        {/* CENTER PANEL (PRIMARY): Real-time Fusion Alert Stream Table */}
        <div className={cn(
          "transition-all duration-300 w-full overflow-hidden self-start flex flex-col gap-4",
          activeSelectedAlert ? "lg:w-[65%]" : "lg:w-full"
        )}>
          <AlertTable 
            alerts={filteredAlerts}
            onSelectAlert={handleSelectAlert}
            selectedAlertId={activeSelectedAlert?.id}
            onUpdateAlert={handleUpdateAlert}
            userRole={user?.role}
          />
          {detailError && <ErrorState label={detailError} />}
        </div>

        {/* RIGHT PANEL: Alert Detail / Evidence Viewer */}
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
                onClose={() => handleSelectAlert(null)}
                onUpdateAlert={handleUpdateAlert}
                userRole={user?.role}
               />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* policy creation overlay */}
      <AnimatePresence>
        {isCreateRuleOpen && (
          <CreateRuleDrawer 
            isOpen={isCreateRuleOpen}
            onClose={() => setIsCreateRuleOpen(false)}
            onSaveRule={handleSaveRule}
            onTestRule={handleTestRule}
            actionState={ruleActionState}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AlertsPage;
