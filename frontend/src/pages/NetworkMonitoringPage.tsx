import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RefreshCw,
  Activity
} from "lucide-react";

// Only import components strictly within the Network Observability scope
import { TopologyMap } from "../components/network/TopologyMap";
import { FlowDetailModal } from "../components/network/FlowDetailModal";
import { FlowDetailPanel } from "../components/network/FlowDetailPanel";
import { AssetInventory } from "../components/network/AssetInventory";

// Refactored Sub-components
import { NetworkMonitoringHeader } from "../components/network/NetworkMonitoringHeader";
import { NetworkMonitoringKPIs } from "../components/network/NetworkMonitoringKPIs";
import { NetworkMonitoringChart } from "../components/network/NetworkMonitoringChart";
import { NetworkWipeConfirm } from "../components/network/NetworkWipeConfirm";
import { NetworkFlowTable } from "../components/network/NetworkFlowTable";

// Custom hooks & type references
import { useNetworkStream } from "../hooks/useNetworkStream";
import { NetworkLog } from "../components/network/NetworkConfig";
import { getNetworkFlowById } from "../adapters/network.adapters";

export const NetworkMonitoringPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  // Load custom streaming logs and hook controllers
  const {
    isRunning,
    setIsRunning,
    logs,
    chartHistory,
    clearLogs,
    isLoading,
    error,
    isSimulated,
    dataMode,
    retry,
  } = useNetworkStream();

  // Selected Log for inspection inside modal/drawer
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);
  const [flowDetailError, setFlowDetailError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter for topology clicked IP or text filters
  const [selectedTopologyIP, setSelectedTopologyIP] = useState<string | null>(null);
  const [selectedAssetIP, setSelectedAssetIP] = useState<string | null>(null);

  // Inline Wipe Safety State
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Inspector action feedback triggers
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "warning";
    message: string;
  } | null>(null);

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Sync selected log if updated inside the logs buffer
  useEffect(() => {
    if (selectedLog) {
      const match = logs.find(l => l.id === selectedLog.id);
      if (match && match !== selectedLog) {
        setSelectedLog(match);
      }
    }
  }, [logs, selectedLog]);

  useEffect(() => {
    if (!params.flowId) {
      setFlowDetailError(null);
      return;
    }
    const match = logs.find((log) => log.id === params.flowId);
    if (match) {
      setSelectedLog(match);
      setFlowDetailError(null);
      return;
    }
    let cancelled = false;
    setFlowDetailError(null);
    getNetworkFlowById(params.flowId)
      .then((flow) => {
        if (cancelled) return;
        if (flow) setSelectedLog(flow);
        else setFlowDetailError("Network flow detail not found.");
      })
      .catch((err) => {
        if (!cancelled) setFlowDetailError(err instanceof Error ? err.message : "Network flow detail unavailable.");
      });
    return () => {
      cancelled = true;
    };
  }, [logs, params.flowId]);

  const handleSelectLog = useCallback((log: NetworkLog | null) => {
    setSelectedLog(log);
    navigate(log ? `/network/flows/${encodeURIComponent(log.id)}` : "/network");
  }, [navigate]);

  // Handle global escape key to clear drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSelectLog(null);
        setIsModalOpen(false);
        setActionFeedback(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectLog]);

  // Compute dynamic live packet throughput rates
  const livePacketRate = useMemo(() => {
    if (!isRunning) return 0;
    if (!isSimulated) return null;
    return Math.round(Math.min(185, logs.length * 0.45));
  }, [logs, isRunning, isSimulated]);

  const anomalousFlowsCount = useMemo(() => {
    return logs.filter(l => l.verdict === "ANOMALY").length;
  }, [logs]);

  const handleWipeLogs = useCallback(() => {
    clearLogs();
    handleSelectLog(null);
    setIsModalOpen(false);
    setShowWipeConfirm(false);
    setActionFeedback(null);
  }, [clearLogs, handleSelectLog]);

  return (
    <motion.div
      key="network-monitoring"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6 pt-2 select-none font-mono text-slate-800 dark:text-slate-100 pb-12"
      id="network-monitoring-page-layout"
    >
      
      {/* 1. GLOBAL SOC HEADER TELEMETRY AND STATUS PANEL */}
      <NetworkMonitoringHeader isRunning={isRunning} livePacketRate={livePacketRate} />

      {isSimulated && (
        <div className="border border-amber-500/20 bg-amber-500/10 text-amber-500 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest">
          {dataMode === "replay" ? "Replay Data" : "Simulated Demo Data"}
        </div>
      )}

      {isLoading && (
        <div className="border border-border bg-card rounded-lg p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading network telemetry...
        </div>
      )}

      {error && (
        <div className="border border-red-500/25 bg-red-500/10 rounded-lg p-4 flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</span>
          <button onClick={retry} className="px-3 py-1.5 border border-border rounded text-[9px] font-black uppercase">Retry</button>
        </div>
      )}

      {flowDetailError && (
        <div className="border border-red-500/25 bg-red-500/10 rounded-lg p-4 text-[10px] font-black uppercase tracking-widest text-red-400">
          {flowDetailError}
        </div>
      )}

      {/* 2. OPERATIONAL KPI MATRIX CARDS */}
      <NetworkMonitoringKPIs 
        logs={logs}
        isRunning={isRunning}
        anomalousFlowsCount={anomalousFlowsCount}
      />

      {/* 3. LIGHTWEIGHT SENSOR CONTROL BAR */}
      <div className="border border-border flex flex-wrap items-center justify-between gap-3 bg-card p-2.5 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            Zeek-First Network Observability Layer
          </span>
        </div>

        {/* Zeek Simulator controllers right-aligned */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded text-[9px] font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer border transition-colors ${
              isRunning 
                ? "bg-secondary hover:bg-secondary/80 text-emerald-600 dark:text-emerald-400 border-border" 
                : "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-505 dark:hover:bg-emerald-555 dark:text-slate-950 border-transparent font-black"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" /> Pause Sensor
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Initialize Sensor
              </>
            )}
          </button>

          <button
            onClick={() => setShowWipeConfirm(true)}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground text-[9px] font-extrabold uppercase rounded cursor-pointer transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Flush Buffer
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Banner Utility */}
      {showWipeConfirm && (
        <NetworkWipeConfirm onConfirm={handleWipeLogs} onCancel={() => setShowWipeConfirm(false)} />
      )}

      {/* Global Action Messages feedback drawer */}
      {actionFeedback && (
        <div className={`p-2.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-2 border shadow-xs animate-fade-in ${
          actionFeedback.type === "success" 
            ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
            : "bg-red-950/35 border-red-500/15 text-red-400"
        }`}>
          <span className="w-1.5 h-3 bg-current block" />
          {actionFeedback.message}
        </div>
      )}

      {/* 4. REALTIME NETWORK OBSERVED CHANNELS */}
      <div className="space-y-6">
        {/* REALTIME NETWORK TRAFFIC CHART (The primary layered line graph requested) */}
        <NetworkMonitoringChart chartHistory={chartHistory} isRunning={isRunning} isDark={isDark} />

        {/* MIDDLE ZONE GRID: Graph Map */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="middle-network-zone">
          
          {/* Dynamic Topology Chart SVG */}
          <div className="xl:col-span-12 h-full">
            <TopologyMap 
              logs={logs}
              selectedNodeIP={selectedTopologyIP}
              onSelectNodeIP={setSelectedTopologyIP}
            />
          </div>

        </div>

        {/* 5. DEPLOYED LABORATORY ASSET INVENTORY */}
        <AssetInventory 
          logs={logs} 
          selectedAssetIP={selectedAssetIP} 
          onSelectAssetIP={setSelectedAssetIP} 
        />

        {/* FLUID FLOW EXPLORER WORKBENCH GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: ZEEK EXPLORER FRAME */}
          <div 
            className={`${selectedLog ? "lg:col-span-7" : "lg:col-span-12"} bg-card border border-border rounded-lg p-4 shadow-sm space-y-4 transition-all duration-300`}
          >
            <NetworkFlowTable
              logs={logs}
              selectedLog={selectedLog}
              onSelectLog={handleSelectLog}
              onActionFeedback={(fb) => {
                if (fb) {
                  setActionFeedback(fb);
                  setTimeout(() => setActionFeedback(null), 3500);
                }
              }}
              selectedTopologyIP={selectedTopologyIP}
              selectedAssetIP={selectedAssetIP}
            />
          </div>

          {/* Right Column: Embedded SIEM Forensic Panel */}
          <AnimatePresence>
            {selectedLog && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "tween", duration: 0.3 }}
                className="lg:col-span-5 h-full w-full"
              >
                <FlowDetailPanel
                  log={selectedLog}
                  onClose={() => handleSelectLog(null)}
                  onActionFeedback={(msg) => {
                    if (msg) {
                      setActionFeedback({
                        type: msg.type,
                        message: msg.text
                      });
                      setTimeout(() => setActionFeedback(null), 4500);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 6. INSPECTION POPUP MODAL */}
      <FlowDetailModal
        isOpen={isModalOpen}
        onClose={() => { handleSelectLog(null); setIsModalOpen(false); }}
        log={selectedLog}
        onActionFeedback={(msg) => {
          if (msg) {
            setActionFeedback({
              type: msg.type,
              message: msg.text
            });
            setTimeout(() => setActionFeedback(null), 4500);
          }
        }}
      />

    </motion.div>
  );
};

export default NetworkMonitoringPage;
