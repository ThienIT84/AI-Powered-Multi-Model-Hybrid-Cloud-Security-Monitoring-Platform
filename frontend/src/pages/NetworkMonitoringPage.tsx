import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  Database, 
  Terminal, 
  Cpu, 
  Layers, 
  Download, 
  Globe, 
  Flame, 
  Binary, 
  AlertTriangle,
  Radio,
  Server,
  Activity,
  UserCheck
} from "lucide-react";

// modular components imports
import { NetworkStats } from "../components/network/NetworkStats";
import { NetworkChart } from "../components/network/NetworkChart";
import { NetworkStreamTable } from "../components/network/NetworkStreamTable";

// custom hooks imports
import { useNetworkStream } from "../hooks/useNetworkStream";
import { useThreatAnalytics } from "../hooks/useThreatAnalytics";
import { NetworkLog } from "../components/network/NetworkConfig";

export const NetworkMonitoringPage: React.FC = () => {
  // Use custom socket simulation engine
  const {
    isRunning,
    setIsRunning,
    logs,
    chartHistory,
    injectPortScan,
    injectMassiveExfiltration,
    injectTorDnsTunnel,
    clearLogs
  } = useNetworkStream();

  // Selected Log for inspection
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);

  // Sync selected log if it gets updated inside current logs list or keep it stable
  useEffect(() => {
    if (selectedLog) {
      const match = logs.find(l => l.id === selectedLog.id);
      if (match) {
        setSelectedLog(match);
      }
    }
  }, [logs, selectedLog]);

  // Compute live threat analytics
  const {
    suspiciousSessionsCount,
    avgPacketSize,
    avgThreatScore,
    activeCountriesCount,
    uniqueIPCount,
    calculatedThreatLevel
  } = useThreatAnalytics(logs);

  // Simple global escape keyboard shortcut listener to clear selected inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLog(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Format clean speed telemetry rate relative to logs size
  const livePacketRate = useMemo(() => {
    if (!isRunning) return 0;
    return Math.round(Math.min(185, logs.length * 0.45 + Math.random() * 8));
  }, [logs, isRunning]);

  return (
    <div className="space-y-6 pt-2 select-none font-sans pb-12" id="network-monitoring-layout">
      {/* GLOBAL ENTERPRISE SOC STATUS HEADER */}
      <div 
        id="soc-global-status-bar" 
        className="w-full bg-card border border-border rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm font-mono text-[11px]"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Status 1: Connection */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-muted-foreground"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? "bg-emerald-500" : "bg-muted-foreground"}`}></span>
            </span>
            <span className="text-muted-foreground font-bold">ZEEK_SENSOR:</span>
            <span className={`font-black ${isRunning ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {isRunning ? "STREAMING" : "OFFLINE"}
            </span>
          </div>

          {/* Status 2: AI Engine */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <Cpu className={`w-3.5 h-3.5 ${isRunning ? "text-cyan-600 dark:text-cyan-400 animate-spin" : "text-muted-foreground"}`} style={{ animationDuration: '40s' }} />
            <span className="text-muted-foreground font-bold">AI_COGNITIVE_ENGINE:</span>
            <span className="font-black text-cyan-600 dark:text-cyan-400">HEURISTIC_ACTIVE</span>
          </div>

          {/* Status 3: Database health */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <Database className="w-3.5 h-3.5 text-indigo-505" />
            <span className="text-muted-foreground font-bold">SIEM_POSTGRES:</span>
            <span className="font-black text-indigo-550 dark:text-indigo-400">HEALTHY (99ms)</span>
          </div>
        </div>

        {/* Live Packets/sec Rates and Sensors throughput */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">THROUGHPUT:</span>
            <span className="font-bold text-foreground">
              {isRunning ? `${livePacketRate} pkts/s` : "0 pkts/s"}
            </span>
          </div>
        </div>
      </div>

      {/* 8 TELEMETRY INTERACTIVE TILE STATS */}
      <NetworkStats
        liveBandwidth={chartHistory[chartHistory.length - 1]?.bandwidth || 1450}
        totalActiveConnections={chartHistory[chartHistory.length - 1]?.flows * 12 + 1540}
        threatLevel={calculatedThreatLevel}
        activeEndpointsCount={uniqueIPCount}
        suspiciousSessions={suspiciousSessionsCount}
        avgPacketSize={avgPacketSize}
        threatScore={avgThreatScore}
        activeCountries={activeCountriesCount}
      />

      {/* MIDDLE ZONE GRID: Dynamic Flow Area Chart + Simulated Lab triggers */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="middle-network-zone">
        
        {/* Unified telechart streams */}
        <div className="xl:col-span-8 flex flex-col h-full">
          <NetworkChart data={chartHistory} />
        </div>

        {/* Advanced attack simulation lab */}
        <div 
          id="simulation-lab-card" 
          className="xl:col-span-4 bg-card border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm relative overflow-hidden"
        >
          {/* Subtle grid patterns overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-red-500/0.5 to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
              <h2 className="text-xs font-black text-foreground dark:text-cyan-400 tracking-widest uppercase font-mono">
                SIEM SECURITY INJECTOR WIDGET
              </h2>
            </div>
            
            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed font-sans font-medium">
              Enterprise security testing suite to queue multi-port packets, exfiltration routines, and Onion routing sequences directly into active memory arrays.
            </p>

            <div className="space-y-2.5 font-sans">
              {/* Button 1: Probe Recon Scan */}
              <button
                onClick={injectPortScan}
                className="w-full text-left bg-secondary/30 hover:bg-red-500/5 border border-border hover:border-red-500/40 p-3 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-red-650 dark:group-hover:text-red-400">Inject Port Scan Recon</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Rapid TCP multi-port system diagnostics scanning</div>
                </div>
                <Layers className="w-4 h-4 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:rotate-12 transition-all" />
              </button>

              {/* Button 2: Exfiltration Dump */}
              <button
                onClick={injectMassiveExfiltration}
                className="w-full text-left bg-secondary/30 hover:bg-red-500/5 border border-border hover:border-red-500/40 p-3 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-red-650 dark:group-hover:text-red-400">Inject Massive Exfiltration</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">DB file leakage sequence outbound to malicious host</div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Button 3: DNS Tor tunnel */}
              <button
                onClick={injectTorDnsTunnel}
                className="w-full text-left bg-secondary/30 hover:bg-red-500/5 border border-border hover:border-red-500/40 p-3 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-red-650 dark:group-hover:text-red-400">Inbound Tor DNS Tunnel</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Suspicious Onion routed UDP proxy exchange relay</div>
                </div>
                <Globe className="w-4 h-4 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center font-mono">
            {/* Play Pause Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 cursor-pointer transition-all border shadow-xs ${
                  isRunning 
                    ? "bg-slate-200 dark:bg-secondary text-cyan-700 dark:text-cyan-400 border-slate-300 dark:border-slate-850 hover:bg-slate-300 dark:hover:bg-slate-900" 
                    : "bg-cyan-500 text-white dark:text-slate-950 hover:bg-cyan-400 font-black border-cyan-600"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    PAUSE SENSOR
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-white dark:text-slate-950" />
                    START SENSOR
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  clearLogs();
                  setSelectedLog(null);
                }}
                className="px-2.5 py-1.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 cursor-pointer border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                WIPE LOGS
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isRunning ? "Active" : "Locked"}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM ZONE LAYOUT: Filtering stream logs + right detail panel Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="bottom-network-zone">
        
        {/* Left Side: Syslog stream workspace list */}
        <div className="xl:col-span-8 flex flex-col h-full">
          <NetworkStreamTable
            logs={logs}
            selectedLogId={selectedLog?.id}
            onSelectLog={setSelectedLog}
          />
        </div>

        {/* Right Side: Packet inspector panel metrics list */}
        <div id="packet-inspector-block" className="xl:col-span-4 h-full">
          {selectedLog ? (
            <div 
              className="bg-card border border-border rounded-lg p-5 h-full flex flex-col justify-between shadow-sm relative overflow-hidden" 
              id="inspector-card-active"
            >
              {/* Scanline pattern mask effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-cyan-400/20 pointer-events-none animate-scanline" />
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Binary className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <h2 className="text-xs font-black text-foreground dark:text-slate-250 tracking-widest uppercase">
                        REAL-TIME INSPECTOR
                      </h2>
                      <p className="text-[9px] text-muted-foreground font-semibold tracking-wider">PACKET HEX INTEGRATION</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold font-mono"
                  >
                    Clear [ESC]
                  </button>
                </div>
 
                {/* Packet identities list */}
                <div className="space-y-2 text-xs mb-4 font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">FLOW_ID:</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedLog.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">TIMESTAMP:</span>
                    <span className="text-foreground font-medium">{selectedLog.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">SRC_ADDRESS:</span>
                    <span className="text-emerald-600 dark:text-emerald-450 font-bold">{selectedLog.srcIp}:{selectedLog.srcPort}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">DEST_ADDRESS:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedLog.destIp}:{selectedLog.destPort}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">ORIGIN_BYTES:</span>
                    <span className="text-foreground font-extrabold font-mono">{(selectedLog.origBytes).toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">RESPONSE_FLOWS:</span>
                    <span className="text-foreground font-mono">{selectedLog.respPkts} Packets</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">COMM_PROTOCOL:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{selectedLog.protocol}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground font-medium font-mono text-[10px]">AI DETECT RATIO:</span>
                    <span className={`font-black tracking-wide ${selectedLog.verdict === "ANOMALY" ? "text-red-505 animate-pulse" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {selectedLog.verdict} ({selectedLog.confidence.toFixed(0)}% Conf)
                    </span>
                  </div>
                </div>
 
                {/* Threat warning analysis block if ANOMALY */}
                {selectedLog.verdict === "ANOMALY" && (
                  <div className="mb-4 p-3 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 rounded-lg flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-550 dark:text-red-550 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <div className="text-[10px] font-black text-red-650 dark:text-red-500 uppercase tracking-widest font-mono">SIEM Attack Signature Lock</div>
                      <div className="text-[11px] text-red-650 dark:text-red-400 font-sans mt-0.5 leading-relaxed font-medium">
                        Heuristic alert signature matched blacklist patterns. This source IP represents a flagged threat actor. Firewall intervention is recommended first.
                      </div>
                    </div>
                  </div>
                )}
 
                {/* Cognitive Descriptive Summary */}
                <div className="p-3 bg-background border border-border rounded-lg mb-4">
                  <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5 font-mono">Cognitive Threat Analyzer</div>
                  <p className="text-[11px] font-sans text-foreground dark:text-cyan-200/90 leading-relaxed font-medium">
                    {selectedLog.reason}
                  </p>
                </div>
 
                {/* HEX DUMP PRESENTATION */}
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-widest mb-1.5 font-mono">FLOW PACKET HEX MEMORY DUMP</div>
                  <pre className="p-2 sm:p-2.5 bg-black/90 dark:bg-black/95 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono rounded border border-border overflow-x-auto select-all leading-tight">
                    {selectedLog.hexDump}
                  </pre>
                </div>
              </div>
 
              {/* Action utilities */}
              <div className="mt-5 pt-3 border-t border-border flex justify-end gap-2 text-[10px] font-black tracking-widest font-mono">
                <button 
                  onClick={() => alert(`Packet logs relayed to standard SIEM audit database. Token: ${btoa(selectedLog.id).substring(0, 12)}`)}
                  className="px-3 py-1.5 bg-background hover:bg-secondary dark:bg-secondary dark:hover:bg-muted border border-border rounded text-foreground transition-colors uppercase cursor-pointer"
                >
                  Forward Alert
                </button>
                <button 
                  onClick={() => alert(`Source IP address ${selectedLog.srcIp} has been temporarily dropped from routing rules via cloud egress firewall.`)}
                  className="px-3 py-1.5 bg-red-550/10 dark:bg-red-950/40 hover:bg-red-500/20 dark:hover:bg-red-900/30 text-red-650 dark:text-red-400 border border-red-500/20 rounded transition-colors uppercase cursor-pointer"
                >
                  Blocklist Source
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-secondary/20 rounded-lg border border-dashed border-border min-h-87.5" id="inspector-card-empty">
              <Terminal className="w-10 h-10 text-muted-foreground/30 dark:text-cyan-500/20 mb-3 animate-pulse" />
              <p className="text-xs font-black text-muted-foreground tracking-widest uppercase font-mono">INSPECTION WORKSTATION IDLE</p>
              <p className="text-[11px] text-muted-foreground mt-2.5 max-w-65 leading-relaxed font-mono">
                [ZEEK_READY] Select any execution row from the SIEM log grid above to execute high-precision hex analysis and decrypt cryptographic signatures.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
