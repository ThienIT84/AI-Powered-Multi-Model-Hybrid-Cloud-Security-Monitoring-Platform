import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Play, 
  Pause, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Layers, 
  Globe, 
  Flame, 
  Binary, 
  AlertTriangle,
  Server,
  Activity,
  Sliders,
  Sparkles,
  TrendingUp,
  Search,
  RefreshCw
} from "lucide-react";

// Import Custom Sub-components for 100% Core Requirements
import { TopologyMap } from "../components/network/TopologyMap";
import { FlowDetailModal } from "../components/network/FlowDetailModal";
import { AIAnalyticsPanel } from "../components/network/AIAnalyticsPanel";
import { ThreatHuntingPanel } from "../components/network/ThreatHuntingPanel";

// New Custom SOC Components
import { ExplainabilityCenter } from "../components/network/ExplainabilityCenter";
import { SuricataCenter } from "../components/network/SuricataCenter";
import { AIHealthPipelinePanel } from "../components/network/AIHealthPipelinePanel";
import { AttackReplayCampaignPanel } from "../components/network/AttackReplayCampaignPanel";
import { AssetInventory } from "../components/network/AssetInventory";

// Recharts components
import { 
  LineChart as BaseLineChart, 
  Line as BaseLine, 
  XAxis as BaseXAxis, 
  YAxis as BaseYAxis, 
  CartesianGrid as BaseCartesianGrid, 
  Tooltip as BaseTooltip, 
  Legend as BaseLegend, 
  ResponsiveContainer as BaseResponsiveContainer 
} from "recharts";

// Custom hooks & type references
import { useNetworkStream } from "../hooks/useNetworkStream";
import { useThreatAnalytics } from "../hooks/useThreatAnalytics";
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
  const [searchText, setSearchText] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

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

  // Compute live threat metrics based on stream buffer
  const {
    suspiciousSessionsCount,
    avgPacketSize,
    avgThreatScore,
    uniqueIPCount,
    calculatedThreatLevel
  } = useThreatAnalytics(logs);

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

  // Dynamic split of flows count for green background normal and red background anomaly layers
  const parsedChartData = useMemo(() => {
    return chartHistory.map(pt => {
      const normal = pt.isAnomaly 
        ? Math.max(2, Math.round(pt.flows * 0.5 + Math.random() * 3)) 
        : pt.flows;
      const anomaly = pt.isAnomaly 
        ? Math.max(4, Math.round(pt.flows * 0.5 + Math.random() * 5)) 
        : 0;
      return {
        ...pt,
        normal,
        anomaly
      };
    });
  }, [chartHistory]);

  // MOCK STATS FOR KPI CARDS (Syncing with active simulator metrics)
  const totalFlows24h = useMemo(() => {
    return logs.length * 15 + 4182; // Dynamic increment
  }, [logs]);

  const activeConnectionsCount = useMemo(() => {
    return isRunning ? Math.round(logs.length * 0.45 + 23) : 0;
  }, [logs, isRunning]);

  const anomalousFlowsCount = useMemo(() => {
    return logs.filter(l => l.verdict === "ANOMALY").length;
  }, [logs]);

  const attackBreakdown = useMemo(() => {
    const counts = { scan: 0, dos: 0, brute: 0, botnet: 0 };
    logs.forEach(l => {
      if (l.verdict === "ANOMALY") {
        const r = l.reason.toLowerCase();
        if (r.includes("scan") || l.id.includes("scan")) counts.scan++;
        else if (r.includes("leak") || r.includes("exfil")) counts.botnet++;
        else if (l.destPort === 22) counts.brute++;
        else counts.dos++;
      }
    });
    return counts;
  }, [logs]);

  const attackRatio = useMemo(() => {
    if (logs.length === 0) return "0.0";
    return ((anomalousFlowsCount / logs.length) * 105).toFixed(1);
  }, [logs, anomalousFlowsCount]);

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

  // FILTERED LOGGER LOGS ARRAY (For the active Flow Table Explorer)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Check topology selection IP
      if (selectedTopologyIP && log.srcIp !== selectedTopologyIP && log.destIp !== selectedTopologyIP) {
        return false;
      }

      // 1.2 Check asset selection IP
      if (selectedAssetIP && log.srcIp !== selectedAssetIP && log.destIp !== selectedAssetIP) {
        return false;
      }
      
      // 2. Check search coordinates
      const term = searchText.trim().toLowerCase();
      if (term) {
        const srcMatch = log.srcIp.toLowerCase().includes(term);
        const destMatch = log.destIp.toLowerCase().includes(term);
        const uidMatch = log.id.toLowerCase().includes(term);
        const reasonMatch = log.reason.toLowerCase().includes(term);
        if (!srcMatch && !destMatch && !uidMatch && !reasonMatch) {
          return false;
        }
      }

      // 3. Check protocol selector
      if (protocolFilter !== "ALL" && log.protocol !== protocolFilter) {
        return false;
      }

      // 4. Check Service selector
      if (serviceFilter !== "ALL") {
        if (serviceFilter === "HTTP" && log.destPort !== 80) return false;
        if (serviceFilter === "HTTPS" && log.destPort !== 443) return false;
        if (serviceFilter === "SSH" && log.destPort !== 22) return false;
        if (serviceFilter === "DNS" && log.destPort !== 53 && log.srcPort !== 5353) return false;
        if (serviceFilter === "FTP" && log.destPort !== 21) return false;
        if (serviceFilter === "ICMP" && log.protocol !== "ICMP") return false;
      }

      // 5. Check risk score severity
      if (riskFilter !== "ALL") {
        if (riskFilter === "HIGH" && log.threatScore < 70) return false;
        if (riskFilter === "MEDIUM" && (log.threatScore < 30 || log.threatScore >= 70)) return false;
        if (riskFilter === "LOW" && log.threatScore >= 30) return false;
      }

      return true;
    });
  }, [logs, selectedTopologyIP, selectedAssetIP, searchText, protocolFilter, serviceFilter, riskFilter]);

  // Copy Reference Token helper
  const handleCopyReference = (logId: string) => {
    navigator.clipboard.writeText(logId);
    setActionFeedback({
      type: "success",
      message: `COPED REF ID: Flow token copied successfully [${logId.substring(0, 10)}]`
    });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 pt-2 select-none font-mono text-slate-100 pb-12" id="network-monitoring-page-layout">
      
      {/* 1. GLOBAL SOC HEADER TELEMETRY AND STATUS PANEL */}
      <div 
        id="soc-global-status-bar" 
        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[11px]"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-neutral-500"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? "bg-emerald-500" : "bg-neutral-500"}`}></span>
            </span>
            <span className="text-slate-500 font-bold">ZEEK_AGENT:</span>
            <span className={`font-black tracking-widest ${isRunning ? "text-emerald-400" : "text-neutral-500"}`}>
              {isRunning ? "STREAMING" : "OFFLINE_LOCKED"}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-900 pl-4">
            <Cpu className={`w-3.5 h-3.5 text-cyan-500 ${isRunning ? "animate-spin" : ""}`} style={{ animationDuration: "25s" }} />
            <span className="text-slate-500 font-bold">COGNITIVE_AI:</span>
            <span className="font-extrabold text-cyan-400">DECISION_HEURISTICS_A2</span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-900 pl-4">
            <Database className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-slate-500 font-bold">DATASTORE:</span>
            <span className="font-black text-indigo-400">SIEM_POSTGRES (ONLINE)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium font-sans">THROUGHPUT:</span>
            <span className="font-extrabold text-slate-100">
              {isRunning ? `${livePacketRate} pkts/s` : "0 pkts/s"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI MATRIX CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5" id="kpi-panel-matrix">
        {/* KPI 1: Active flows */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Total Flows (24h)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-slate-100">{totalFlows24h.toLocaleString()}</span>
            <span className="text-[8.5px] font-bold text-emerald-400">+12.4%</span>
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">Zeek conn.log feeds</span>
        </div>

        {/* KPI 2: Active Connection flows */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Active Connections</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-slate-100">{activeConnectionsCount}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse self-center" />
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">Sockets Established</span>
        </div>

        {/* KPI 3: Anomalous flows count */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">AI1 Anomalies</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-red-400">{anomalousFlowsCount}</span>
            <span className="text-[8.5px] font-bold text-slate-500">of {logs.length} flows</span>
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">Heuristic Footprints</span>
        </div>

        {/* KPI 4: Threat classification indicators */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Attacks Detected</span>
          <div className="mt-1 grid grid-cols-2 gap-x-1.5 text-[8.5px] leading-tight font-black uppercase text-slate-350">
            <span className={attackBreakdown.scan > 0 ? "text-red-400" : ""}>Scan: {attackBreakdown.scan}</span>
            <span className={attackBreakdown.brute > 0 ? "text-amber-500" : ""}>SSH: {attackBreakdown.brute}</span>
            <span className={attackBreakdown.dos > 0 ? "text-orange-500" : ""}>DoS: {attackBreakdown.dos}</span>
            <span className={attackBreakdown.botnet > 0 ? "text-blue-400" : ""}>Leakers: {attackBreakdown.botnet}</span>
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">MultiClass AI2A</span>
        </div>

        {/* KPI 5: Threat attack ratios */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Attack Ratio</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-rose-450">{attackRatio}%</span>
            <span className="text-[8px] font-bold text-rose-550">Ratio</span>
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">Attack / Total Flow</span>
        </div>

        {/* KPI 6: Weights metrics risk indices */}
        <div className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2.5 rounded-lg flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Avg Threat Score</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-amber-500">{averageRiskScore}/100</span>
            <span className="text-[8.5px] font-black text-yellow-600">HIGH</span>
          </div>
          <span className="text-[8px] text-slate-500 mt-1 uppercase block leading-none">Fusion Layer Result</span>
        </div>
      </div>

      {/* 3. SUB-PANEL SYSTEM NAVIGATION TAB HEADERS */}
      <div className="border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-1.5 rounded-lg border">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => { setActiveTab("flow"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "flow" 
                ? "bg-emerald-505/10 text-emerald-450 border border-emerald-500/20" 
                : "text-slate-400 hover:text-slate-100 bg-slate-900/40 border border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Core Flows & Graph
          </button>

          <button
            onClick={() => { setActiveTab("ai"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "ai" 
                ? "bg-emerald-505/10 text-emerald-450 border border-emerald-500/20" 
                : "text-slate-400 hover:text-slate-100 bg-slate-900/40 border border-transparent"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Cognitive AI Analytics
          </button>

          <button
            onClick={() => { setActiveTab("campaigns"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "campaigns" 
                ? "bg-emerald-505/10 text-emerald-450 border border-emerald-500/20" 
                : "text-slate-400 hover:text-slate-100 bg-slate-900/40 border border-transparent"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Threat Campaigns & Replays
          </button>

          <button
            onClick={() => { setActiveTab("hunt"); setActionFeedback(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === "hunt" 
                ? "bg-emerald-505/10 text-emerald-450 border border-emerald-500/20" 
                : "text-slate-400 hover:text-slate-100 bg-slate-900/40 border border-transparent"
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
                ? "bg-slate-900 hover:bg-slate-850 text-emerald-400 border-emerald-500/20" 
                : "bg-emerald-505 hover:bg-emerald-555 text-slate-950 border-transparent font-black"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3 text-emerald-450" /> Pause Sensor
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Initialize Sensor
              </>
            )}
          </button>

          <button
            onClick={() => setShowWipeConfirm(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-extrabold uppercase rounded cursor-pointer transition-colors"
          >
            Flush Buffer
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Banner Utility */}
      {showWipeConfirm && (
        <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-lg flex items-center justify-between text-[11px] animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
            <span className="text-red-400 font-extrabold">SIEM FLUSH WARNING: ARE YOU SURE YOU WANT TO FLUSH ALL ACTIVE STACK CONNECTION RAM FORENSICS?</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleWipeLogs}
              className="px-2.5 py-1 bg-red-500 hover:bg-red-650 text-white font-extrabold rounded text-[9px] cursor-pointer"
            >
              CONFIRM FLUSH
            </button>
            <button 
              onClick={() => setShowWipeConfirm(false)}
              className="px-2.5 py-1 bg-slate-905 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded text-[9px] cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>
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
          <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3" id="realtime-traffic-chart-container">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-505 animate-pulse" />
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  REAL-TIME NETWORK TRAFFIC SPECTROMETER
                </h3>
              </div>
              <span className="text-[8.5px] text-slate-500 uppercase font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live stream traffic rate metrics (1s Refresh)
              </span>
            </div>

            <div className="h-35 w-full select-none text-[8.5px]">
              <BaseResponsiveContainer width="100%" height="100%">
                <BaseLineChart 
                  data={parsedChartData} 
                  margin={{ top: 5, right: 10, left: -32, bottom: 0 }}
                >
                  <BaseCartesianGrid stroke="#1e293b" strokeDasharray="2 2" vertical={false} />
                  <BaseXAxis dataKey="timeLabel" stroke="#475569" tickLine={false} />
                  <BaseYAxis stroke="#475569" tickLine={false} />
                  <BaseTooltip 
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: 9, fontFamily: "monospace", borderRadius: 4 }}
                  />
                  <BaseLegend iconType="circle" iconSize={5} verticalAlign="top" align="right" height={20} />
                  <BaseLine 
                    name="Normal Traffic (green)" 
                    type="monotone" 
                    dataKey="normal" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <BaseLine 
                    name="Anomaly Traffic (red)" 
                    type="monotone" 
                    dataKey="anomaly" 
                    stroke="#ef4444" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </BaseLineChart>
              </BaseResponsiveContainer>
            </div>
          </div>

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
            <div className="xl:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-red-500/[0.003] to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                  <h2 className="text-[10px] font-black text-rose-455 tracking-widest uppercase">
                    ACTIVE SIEM SECURITY INJECTOR WIDGET
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-3">
                  Enterprise penetration testing utility. Inject port sweep scans, database exfiltrations, and command-and-control handshakes directly into active RAM arrays to validate classifier accuracy.
                </p>

                <div className="space-y-2">
                  {/* Sweep reconnais */}
                  <button
                    onClick={handleInjectPortScan}
                    disabled={isInjectingPortScan}
                    className="w-full text-left bg-slate-900/60 hover:bg-red-500/3 border border-slate-800/80 hover:border-red-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-extrabold text-slate-100 group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                        Port Scan Recon
                        {isInjectingPortScan && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                      </div>
                      <div className="text-[9px] text-slate-450 mt-0.5 font-sans leading-tight">Probing TCP ports 21-445 targets</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7.5px] font-black text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/15">MEDIUM RISK</span>
                      <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
                    </div>
                  </button>

                  {/* Bulk exfil */}
                  <button
                    onClick={handleInjectExfil}
                    disabled={isInjectingExfil}
                    className="w-full text-left bg-slate-900/60 hover:bg-red-500/3 border border-slate-800/80 hover:border-red-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-extrabold text-slate-100 group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                        Massive Exfiltration
                        {isInjectingExfil && <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping" />}
                      </div>
                      <div className="text-[9px] text-slate-450 mt-0.5 font-sans leading-tight">Leaking 156MB SQL database data dump</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7.5px] font-black text-red-500 bg-red-500/10 px-1 py-0.2 rounded border border-red-500/15">CRITICAL</span>
                      <Server className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
                    </div>
                  </button>

                  {/* Onion protocol */}
                  <button
                    onClick={handleInjectTor}
                    disabled={isInjectingTor}
                    className="w-full text-left bg-slate-900/60 hover:bg-rose-500/3 border border-slate-800/80 hover:border-rose-500/35 p-2 rounded-lg flex items-center justify-between group transition-all text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-extrabold text-slate-100 group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                        Tor Onion DNS Tunnel
                        {isInjectingTor && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                      </div>
                      <div className="text-[9px] text-slate-450 mt-0.5 font-sans leading-tight">C2 Shell tunneling on port 9001</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7.5px] font-black text-rose-450 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/15">HIGH THREAT</span>
                      <Globe className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-900 p-2 rounded text-[9px] text-slate-500 mt-3 flex justify-between uppercase">
                <span>Injected metrics affect all metrics tabs:</span>
                <span className="text-cyan-400 font-extrabold">Active system</span>
              </div>
            </div>

          </div>

          {/* 11. DEPLOYED LABORATORY ASSET INVENTORY */}
          <AssetInventory 
            logs={logs} 
            selectedAssetIP={selectedAssetIP} 
            onSelectAssetIP={setSelectedAssetIP} 
          />

          {/* FLUID FLOW EXPLORER WORKBENCH GRID AREA */}
          <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs space-y-4">
            
            {/* Real-time Explorer Filters Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  ADVANCED REAL-TIME ZEEK CONN.LOG FIELD EXPLORER
                </h3>
              </div>

              {/* Filters dropdown parameters row */}
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                {/* Search Text IP */}
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Search Node IP, UID, or Attack..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-7 pr-2 py-1 w-48 bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-emerald-505 text-slate-200"
                  />
                </div>

                {/* Protocol filter */}
                <select
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded py-1 px-1.5 text-slate-350 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="ALL">ALL PROTOCOLS (TCP/UDP/ICMP)</option>
                  <option value="TCP">TCP ONLY</option>
                  <option value="UDP">UDP ONLY</option>
                  <option value="ICMP">ICMP DETECTOR</option>
                </select>

                {/* Service type filter */}
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded py-1 px-1.5 text-slate-350 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="ALL">ALL SERVICES</option>
                  <option value="HTTP">HTTP (Port 80)</option>
                  <option value="HTTPS">HTTPS (Port 443)</option>
                  <option value="SSH">SSH SSH (Port 22)</option>
                  <option value="DNS">DNS DNS Resolver</option>
                  <option value="FTP">FTP File Relay</option>
                </select>

                {/* Risk category level filter */}
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded py-1 px-1.5 text-slate-350 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="ALL">ALL ACTIONS</option>
                  <option value="HIGH">CRITICAL / HIGH THREAT (&gt;70)</option>
                  <option value="MEDIUM">MEDIUM (30-70)</option>
                  <option value="LOW">LOW VERDICT STATUS (&lt;30)</option>
                </select>
              </div>
            </div>

            {/* FLUID FLOW EVENT GRID TABLE */}
            <div className="overflow-x-auto overflow-y-auto max-h-125 border border-slate-900 rounded custom-scrollbar pr-1 bg-slate-950/40">
              <table className="w-full text-left font-mono border-collapse divide-y divide-slate-900/40">
                <thead className="bg-slate-900/80 sticky top-0 z-10 text-[9px] uppercase font-black text-slate-500">
                  <tr className="border-b border-slate-900">
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">UID Identifier</th>
                    <th className="px-3 py-2">Source Host (IP:Port)</th>
                    <th className="px-3 py-2">Destination Host (IP:Port)</th>
                    <th className="px-3 py-2">Protocol</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Conn.State</th>
                    <th className="px-3 py-2 text-right">Size (Bytes)</th>
                    <th className="px-3 py-2 text-center">AI1 Anomal-Score</th>
                    <th className="px-3 py-2 text-center">AI2A Prediction</th>
                    <th className="px-3 py-2 text-center">Security Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/30 text-[10px]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-slate-500 italic">
                        No active flows match selected operational parameter filter arrays.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const isAnomaly = log.verdict === "ANOMALY";
                      const sizeFormatted = log.origBytes >= 1024 * 1024 
                        ? `${(log.origBytes / (1024 * 1024)).toFixed(1)} MB` 
                        : log.origBytes >= 1024 
                        ? `${(log.origBytes / 1024).toFixed(1)} KB` 
                        : `${log.origBytes} B`;

                      // Derive Service dynamically
                      let svc = "Unknown";
                      if (log.protocol === "ICMP") svc = "ICMP";
                      else if (log.destPort === 80) svc = "HTTP";
                      else if (log.destPort === 443) svc = "HTTPS";
                      else if (log.destPort === 22) svc = "SSH";
                      else if (log.destPort === 53 || log.srcPort === 5353) svc = "DNS";
                      else if (log.destPort === 21) svc = "FTP";

                      // Derive Connection State dynamically
                      const state = log.destPort === 22 && isAnomaly
                        ? "REJ"
                        : isAnomaly && log.origBytes > 50000000
                        ? "RSTR"
                        : "SF";

                      // Derive AI2A multiclass prediction name
                      const ai2aPred = isAnomaly
                        ? log.reason.toLowerCase().includes("scan") || log.id.includes("scan")
                          ? "Port Scan"
                          : log.reason.toLowerCase().includes("leak") || log.reason.toLowerCase().includes("exfil")
                          ? "Botnet"
                          : log.destPort === 22
                          ? "Brute Force"
                          : "DoS"
                        : "Normal";

                      return (
                        <tr 
                          key={log.id}
                          className={`hover:bg-slate-900/50 group h-8 transition-colors cursor-pointer border-b border-slate-900/30 ${
                            isAnomaly ? "bg-red-950/5 hover:bg-red-950/10" : ""
                          }`}
                          onClick={() => { setSelectedLog(log); setIsModalOpen(true); }}
                        >
                          <td className="px-3 py-1 text-slate-400 font-extrabold whitespace-nowrap">{log.timestamp}</td>
                          <td className="px-3 py-1 text-slate-350 font-black whitespace-nowrap">{log.id}</td>
                          <td className="px-3 py-1 font-bold text-slate-200 whitespace-nowrap">{log.srcIp}:{log.srcPort}</td>
                          <td className="px-3 py-1 font-bold text-slate-200 whitespace-nowrap">{log.destIp}:{log.destPort}</td>
                          <td className="px-3 py-1 font-bold whitespace-nowrap">
                            <span className={`px-1 rounded text-[8.5px] font-black border uppercase ${
                              log.protocol === "TCP" ? "bg-blue-950 text-blue-400 border-blue-500/10" : "bg-purple-950 text-purple-400 border-purple-500/10"
                            }`}>
                              {log.protocol}
                            </span>
                          </td>
                          <td className="px-3 py-1 font-bold text-slate-400 whitespace-nowrap">{svc}</td>
                          <td className="px-3 py-1 font-bold text-slate-300 whitespace-nowrap">{state}</td>
                          <td className="px-3 py-1 text-right text-slate-200 font-bold whitespace-nowrap">{sizeFormatted}</td>
                          <td className="px-3 py-1 text-center font-bold whitespace-nowrap">
                            <span className={isAnomaly ? "text-red-400 animate-pulse" : "text-emerald-500"}>
                              {log.threatScore}%
                            </span>
                          </td>
                          <td className="px-3 py-1 text-center font-extrabold whitespace-nowrap">
                            <span className={isAnomaly ? "text-amber-400" : "text-slate-400"}>{ai2aPred}</span>
                          </td>
                          <td className="px-3 py-1 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[8.5px] font-black tracking-widest rounded border ${
                              isAnomaly 
                                ? "bg-red-950 text-red-400 border-red-500/20" 
                                : "bg-emerald-950 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {log.verdict}
                            </span>
                          </td>
                          <td className="px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleCopyReference(log.id)}
                              className="opacity-0 group-hover:opacity-100 px-1 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-200 rounded text-[8px] font-extrabold uppercase border border-slate-805 transition-all"
                              title="Copy Reference Token"
                            >
                              Copy ID
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-[9px] text-slate-500 uppercase flex flex-col md:flex-row justify-between items-center gap-2">
              <span>Selected parameters matched {filteredLogs.length} of {logs.length} flows loaded inside active SIEM memory.</span>
              <span>Double click any flow row to decode hexadecimal payload frame captures.</span>
            </div>
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

    </div>
  );
};
export default NetworkMonitoringPage;
