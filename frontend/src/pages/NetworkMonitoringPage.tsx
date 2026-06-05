import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Flame, 
  Activity,
  Sliders,
  Cpu
} from "lucide-react";

// Import Custom Sub-components for 100% Core Requirements
import { TopologyMap } from "../components/network/TopologyMap";
import { FlowDetailModal } from "../components/network/FlowDetailModal";
import { FlowDetailPanel } from "../components/network/FlowDetailPanel";
import { SuricataCenter } from "../components/network/SuricataCenter";
import { AIHealthPipelinePanel } from "../components/network/AIHealthPipelinePanel";
import { AttackReplayCampaignPanel } from "../components/network/AttackReplayCampaignPanel";
import { AssetInventory } from "../components/network/AssetInventory";
import { ThreatHuntingPanel } from "../components/network/ThreatHuntingPanel";

// Refactored Sub-components
import { NetworkMonitoringHeader } from "../components/network/NetworkMonitoringHeader";
import { NetworkMonitoringKPIs } from "../components/network/NetworkMonitoringKPIs";
import { NetworkMonitoringChart } from "../components/network/NetworkMonitoringChart";
import { NetworkSimulatorInjector } from "../components/network/NetworkSimulatorInjector";
import { NetworkWipeConfirm } from "../components/network/NetworkWipeConfirm";
import { NetworkFlowTable } from "../components/network/NetworkFlowTable";

// Custom hooks & type references
import { useNetworkStream } from "../hooks/useNetworkStream";
import { NetworkLog } from "../components/network/NetworkConfig";

export const NetworkMonitoringPage: React.FC = () => {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<"flow" | "campaigns" | "ai" | "hunt">("flow");

  // Load custom streaming logs and attack simulation engines
  const {
    isRunning,
    setIsRunning,
    logs,
    chartHistory,
    injectPortScan,
    injectMassiveExfiltration,
    injectTorDnsTunnel,
    clearLogs,
    injectCustomLog
  } = useNetworkStream();

  // Selected Log for inspection inside modal/drawer
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter for topology clicked IP or text filters
  const [selectedTopologyIP, setSelectedTopologyIP] = useState<string | null>(null);
  const [selectedAssetIP, setSelectedAssetIP] = useState<string | null>(null);

  // Attack Injection state trackers
  const [isInjectingPortScan, setIsInjectingPortScan] = useState(false);
  const [isInjectingExfil, setIsInjectingExfil] = useState(false);
  const [isInjectingTor, setIsInjectingTor] = useState(false);

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

  // Handle global escape key to clear drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLog(null);
        setIsModalOpen(false);
        setActionFeedback(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute dynamic live packet throughput rates
  const livePacketRate = useMemo(() => {
    if (!isRunning) return 0;
    return Math.round(Math.min(185, logs.length * 0.45 + Math.random() * 8 + 12));
  }, [logs, isRunning]);

  const anomalousFlowsCount = useMemo(() => {
    return logs.filter(l => l.verdict === "ANOMALY").length;
  }, [logs]);

  const averageRiskScore = useMemo(() => {
    if (logs.length === 0) return 12;
    const total = logs.reduce((acc, log) => acc + log.threatScore, 0);
    return Math.round(total / logs.length);
  }, [logs]);

  // Injection wrappers
  const handleInjectPortScan = useCallback(() => {
    setIsInjectingPortScan(true);
    injectPortScan();
    setTimeout(() => setIsInjectingPortScan(false), 900);
  }, [injectPortScan]);

  const handleInjectExfil = useCallback(() => {
    setIsInjectingExfil(true);
    injectMassiveExfiltration();
    setTimeout(() => setIsInjectingExfil(false), 900);
  }, [injectMassiveExfiltration]);

  const handleInjectTor = useCallback(() => {
    setIsInjectingTor(true);
    injectTorDnsTunnel();
    setTimeout(() => setIsInjectingTor(false), 900);
  }, [injectTorDnsTunnel]);

  const handleWipeLogs = useCallback(() => {
    clearLogs();
    setSelectedLog(null);
    setIsModalOpen(false);
    setShowWipeConfirm(false);
    setActionFeedback(null);
  }, [clearLogs]);

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

      {/* 2. OPERATIONAL KPI MATRIX CARDS */}
      <NetworkMonitoringKPIs 
        logs={logs}
        isRunning={isRunning}
        anomalousFlowsCount={anomalousFlowsCount}
        averageRiskScore={averageRiskScore}
      />

      {/* 3. SUB-PANEL SYSTEM NAVIGATION TAB HEADERS */}
      <div className="border border-border flex flex-wrap items-center justify-between gap-3 bg-card p-1.5 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => { setActiveTab("flow"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "flow" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border border-emerald-500/20" 
                : "text-muted-foreground hover:text-foreground bg-secondary/40 dark:bg-slate-905/40 border border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Core Flows & Graph
          </button>

          <button
            onClick={() => { setActiveTab("ai"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "ai" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border border-emerald-500/20" 
                : "text-muted-foreground hover:text-foreground bg-secondary/40 dark:bg-slate-905/40 border border-transparent"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Cognitive AI Analytics
          </button>

          <button
            onClick={() => { setActiveTab("campaigns"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "campaigns" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border border-emerald-505/20" 
                : "text-muted-foreground hover:text-foreground bg-secondary/40 dark:bg-slate-905/40 border border-transparent"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Threat Campaigns & Replays
          </button>

          <button
            onClick={() => { setActiveTab("hunt"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "hunt" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border border-emerald-500/20" 
                : "text-muted-foreground hover:text-foreground bg-secondary/40 dark:bg-slate-905/40 border border-transparent"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> SIEM Hunting & Timelines
          </button>
        </div>

        {/* SIEM Simulator controllers right-aligned */}
        <div className="flex flex-wrap items-center gap-2 pr-1">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2 py-1 rounded text-[9px] font-black tracking-wider uppercase flex items-center gap-1 cursor-pointer border transition-colors ${
              isRunning 
                ? "bg-secondary hover:bg-secondary/80 text-emerald-600 dark:text-emerald-400 border-border" 
                : "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-505 dark:hover:bg-emerald-555 dark:text-slate-950 border-transparent font-black"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3 text-emerald-600 dark:text-emerald-450" /> Pause Sensor
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Initialize Sensor
              </>
            )}
          </button>

          <button
            onClick={() => setShowWipeConfirm(true)}
            className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground text-[9px] font-extrabold uppercase rounded cursor-pointer transition-colors"
          >
            Flush Buffer
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

      {/* 4. ACTIVE SUB-PANELS BODY ROUTER */}
      {activeTab === "flow" && (
        <div className="space-y-6">
          {/* REALTIME NETWORK TRAFFIC CHART (The primary layered line graph requested) */}
          <NetworkMonitoringChart chartHistory={chartHistory} isRunning={isRunning} isDark={isDark} />

          {/* MIDDLE ZONE GRID: Graph Map + Intruder Simulations Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="middle-network-zone">
            
            {/* Dynamic Topology Chart SVG */}
            <div className="xl:col-span-8 h-full">
              <TopologyMap 
                logs={logs}
                selectedNodeIP={selectedTopologyIP}
                onSelectNodeIP={setSelectedTopologyIP}
              />
            </div>

            {/* Simulators card widget */}
            <NetworkSimulatorInjector
              onInjectPortScan={handleInjectPortScan}
              onInjectExfil={handleInjectExfil}
              onInjectTor={handleInjectTor}
              isInjectingPortScan={isInjectingPortScan}
              isInjectingExfil={isInjectingExfil}
              isInjectingTor={isInjectingTor}
            />

          </div>

          {/* 11. DEPLOYED LABORATORY ASSET INVENTORY */}
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
                onSelectLog={setSelectedLog}
                onActionFeedback={(fb) => {
                  if (fb) {
                    setActionFeedback(fb);
                    // Standard timeout for general notifications
                    setTimeout(() => setActionFeedback(null), 3500);
                  }
                }}
                selectedTopologyIP={selectedTopologyIP}
                selectedAssetIP={selectedAssetIP}
              />
            </div>

            {/* Right Column: Embedded SIEM Forensic Panel (OUTSIDE ZEEK Frame) */}
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
                    onClose={() => setSelectedLog(null)}
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
      )}

      {activeTab === "ai" && (
        <AIHealthPipelinePanel logs={logs} />
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <AttackReplayCampaignPanel 
            logs={logs} 
            onSelectFlow={(flow) => { setSelectedLog(flow); setIsModalOpen(true); }}
            onInjectLog={injectCustomLog}
          />
          <SuricataCenter 
            logs={logs} 
            onSelectFlow={(flow) => { setSelectedLog(flow); setIsModalOpen(true); }}
          />
        </div>
      )}

      {activeTab === "hunt" && (
        <ThreatHuntingPanel logs={logs} />
      )}

      {/* 5. FORENSIC FLOW DETAIL INSPECTION POPUP MODAL */}
      <FlowDetailModal
        isOpen={isModalOpen}
        onClose={() => { setSelectedLog(null); setIsModalOpen(false); }}
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
