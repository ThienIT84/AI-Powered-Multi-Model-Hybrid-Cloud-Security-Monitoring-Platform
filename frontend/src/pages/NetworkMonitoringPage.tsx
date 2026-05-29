import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Play, 
  Pause, 
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
  Server,
  Activity,
  ArrowRight
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

  // States to represent interactive attack simulation state timers
  const [isInjectingPortScan, setIsInjectingPortScan] = useState(false);
  const [isInjectingExfil, setIsInjectingExfil] = useState(false);
  const [isInjectingTor, setIsInjectingTor] = useState(false);

  // Inline destructive confirmation toggle instead of window.confirm
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Inspector Action feedback messages
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "warning";
    message: string;
  } | null>(null);

  // Sync selected log if it gets updated inside current logs list
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
        setActionFeedback(null);
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

  // Handler wrapper to trigger simulation state flows
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

  // Safe handler for Wipe Logs click
  const handleWipeLogs = useCallback(() => {
    clearLogs();
    setSelectedLog(null);
    setShowWipeConfirm(false);
    setActionFeedback(null);
  }, [clearLogs]);

  // Format dynamic mocked MAC Addresses for endpoints forensic depth
  const computedMacs = useMemo(() => {
    if (!selectedLog) return { srcMac: "", descMac: "" };
    // Determinate stable MACs using source and destination IPs string length seeds
    const srcSeed = (selectedLog.srcIp.split(".").pop() || "8").padStart(2, "a");
    const destSeed = (selectedLog.destIp.split(".").pop() || "2").padStart(2, "d");
    return {
      srcMac: `00:50:56:C0:00:${srcSeed.toUpperCase()}`,
      destMac: `00:0C:29:FF:3E:${destSeed.toUpperCase()}`
    };
  }, [selectedLog]);

  return (
    <div className="space-y-6 pt-2 select-none font-sans pb-12" id="network-monitoring-layout">
      
      {/* GLOBAL ENTERPRISE SOC STATUS HEADER */}
      <div 
        id="soc-global-status-bar" 
        className="w-full bg-card border border-border rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs font-mono text-[11px]"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Status 1: Connection */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-neutral-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? "bg-emerald-500" : "bg-neutral-500"}`}></span>
            </span>
            <span className="text-muted-foreground font-bold">ZEEK_SENSOR:</span>
            <span className={`font-black ${isRunning ? "text-emerald-500" : "text-muted-foreground/60"}`}>
              {isRunning ? "STREAMING" : "OFFLINE"}
            </span>
          </div>

          {/* Status 2: AI Engine */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <Cpu className={`w-3.5 h-3.5 ${isRunning ? "text-cyan-500 animate-spin" : "text-muted-foreground/60"}`} style={{ animationDuration: '30s' }} />
            <span className="text-muted-foreground font-bold">AI_COGNITIVE_ENGINE:</span>
            <span className="font-black text-cyan-500">HEURISTIC_ACTIVE</span>
          </div>

          {/* Status 3: Database health */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-muted-foreground font-bold">SIEM_POSTGRES:</span>
            <span className="font-black text-indigo-400">HEALTHY (99ms)</span>
          </div>
        </div>

        {/* Live Packets/sec Rates and Sensors throughput */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">THROUGHPUT:</span>
            <span className="font-extrabold text-foreground">
              {isRunning ? `${livePacketRate} pkts/s` : "0 pkts/s"}
            </span>
          </div>
        </div>
      </div>

      {/* 8 TELEMETRY INTERACTIVE TILE STATS */}
      <NetworkStats
        liveBandwidth={chartHistory[chartHistory.length - 1]?.bandwidth || 1450}
        totalActiveConnections={(chartHistory[chartHistory.length - 1]?.flows || 14) * 12 + 1540}
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
          className="xl:col-span-4 bg-card border border-border rounded-lg p-4 flex flex-col justify-between shadow-xs relative overflow-hidden"
        >
          {/* Subtle grid patterns overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-red-500/[0.003] to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-red-500" />
              <h2 className="text-[10px] font-black text-foreground dark:text-cyan-400 tracking-widest uppercase font-mono">
                SIEM SECURITY INJECTOR WIDGET
              </h2>
            </div>
            
            <p className="text-[10px] text-muted-foreground mb-3 leading-normal font-medium">
              Enterprise testing controls to simulate anomalous packet sequences, exfiltrations, and TOR proxy handshakes directly into active stream arrays.
            </p>

            <div className="space-y-2 font-mono">
              {/* Button 1: Probe Recon Scan */}
              <button
                onClick={handleInjectPortScan}
                disabled={isInjectingPortScan}
                className="w-full text-left bg-muted/20 hover:bg-red-500/3 border border-border hover:border-red-500/30 p-2.5 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer text-xs"
              >
                <div>
                  <div className="font-extrabold text-foreground group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                    Port Scan Recon
                    {isInjectingPortScan && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans leading-snug">Simulates TCP reconnaissance port probes</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded">MEDIUM RISK</span>
                  <Layers className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400 group-hover:rotate-6 transition-all" />
                </div>
              </button>

              {/* Button 2: Exfiltration Dump */}
              <button
                onClick={handleInjectExfil}
                disabled={isInjectingExfil}
                className="w-full text-left bg-muted/20 hover:bg-red-500/3 border border-border hover:border-red-500/30 p-2.5 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer text-xs"
              >
                <div>
                  <div className="font-extrabold text-foreground group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                    Massive Exfiltration
                    {isInjectingExfil && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans leading-snug">Abnormal outbound bulk transfer</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-red-500 bg-red-500/10 px-1 py-0.2 rounded">CRITICAL</span>
                  <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400 group-hover:translate-y-0.5 transition-all" />
                </div>
              </button>

              {/* Button 3: DNS Tor tunnel */}
              <button
                onClick={handleInjectTor}
                disabled={isInjectingTor}
                className="w-full text-left bg-muted/20 hover:bg-red-500/3 border border-border hover:border-red-500/30 p-2.5 rounded flex items-center justify-between group transition-all duration-300 cursor-pointer text-xs"
              >
                <div>
                  <div className="font-extrabold text-foreground group-hover:text-red-400 flex items-center gap-1.5 leading-snug">
                    Tor DNS Tunnel
                    {isInjectingTor && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans leading-snug">Onion-routed UDP payload loop</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-1 py-0.2 rounded">HIGH</span>
                  <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400 transition-all" />
                </div>
              </button>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-border flex flex-col gap-2 font-mono">
            {/* Play Pause Controls and dynamic confirmations */}
            {showWipeConfirm ? (
              <div className="bg-red-500/10 border border-red-500/20 p-2 rounded flex items-center justify-between text-[10px] animate-fade-in">
                <span className="text-red-400 font-extrabold">CONFIRM LOG FLUSH?</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleWipeLogs}
                    className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded text-[9px] cursor-pointer"
                  >
                    WIPE ALL
                  </button>
                  <button 
                    onClick={() => setShowWipeConfirm(false)}
                    className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground font-extrabold rounded text-[9px] cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`px-2.5 py-1.5 rounded text-[9px] font-black tracking-widest uppercase flex items-center gap-1 transition-all border shadow-xs cursor-pointer ${
                      isRunning 
                        ? "bg-muted text-cyan-600 dark:text-cyan-400 border-border hover:bg-muted/80" 
                        : "bg-cyan-505 hover:bg-cyan-500 text-white font-black"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-3 h-3 text-cyan-500" />
                        PAUSE SENSOR
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-white" />
                        START SENSOR
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="px-2.5 py-1.5 rounded text-[9px] font-black tracking-widest uppercase flex items-center gap-1 cursor-pointer border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    WIPE LOGS
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-505 animate-pulse" : "bg-neutral-500"}`} />
                  {isRunning ? "Active" : "Locked"}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM ZONE LAYOUT: Filtering stream logs + right detail panel Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="bottom-network-zone">
        
        {/* Left Side: Syslog stream workspace list */}
        <div className="xl:col-span-8 flex flex-col h-full md:min-h-165">
          <NetworkStreamTable
            logs={logs}
            selectedLogId={selectedLog?.id}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setActionFeedback(null); // Clear feedback when switching logs
            }}
            isRunning={isRunning}
          />
        </div>

        {/* Right Side: Packet inspector panel metrics list */}
        <div id="packet-inspector-block" className="xl:col-span-4 h-full">
          {selectedLog ? (
            <div 
              className="bg-card border border-border rounded-lg p-4 h-full flex flex-col justify-between shadow-xs relative overflow-hidden font-mono" 
              id="inspector-card-active"
            >
              {/* Scanline pattern mask effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-cyan-500/10 pointer-events-none animate-pulse" />
              
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                  <div className="flex items-center gap-1.5">
                    <Binary className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h2 className="text-[10px] font-black text-foreground tracking-widest uppercase">
                        REAL-TIME INSPECTOR
                      </h2>
                      <p className="text-[8px] text-muted-foreground font-black tracking-wider uppercase">Forensic Decryption Node</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLog(null);
                      setActionFeedback(null);
                    }}
                    className="text-[9px] text-muted-foreground hover:text-foreground cursor-pointer font-extrabold pr-0.5"
                  >
                    ESC_CLEAR
                  </button>
                </div>

                {/* Packet identities list */}
                <div className="space-y-1.5 text-[10px] mb-3">
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">FLOW IDENTIFICATION:</span>
                    <span className="text-emerald-550 font-bold">{selectedLog.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">TIMESTAMP_UTC:</span>
                    <span className="text-foreground">{selectedLog.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">SRC_IP_ENDPOINT:</span>
                    <span className="text-emerald-505 font-bold flex items-center gap-0.5">
                      {selectedLog.srcIp}
                      <span className="text-muted-foreground/60">:{selectedLog.srcPort}</span>
                    </span>
                  </div>
                  
                  {/* Forensic Add-On: Source MAC endpoint */}
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40 text-[9px] text-muted-foreground/75">
                    <span className="font-extrabold text-[8px] uppercase">SRC_MAC_HARDWARE:</span>
                    <span className="font-semibold">{computedMacs.srcMac}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">DEST_IP_ENDPOINT:</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                      {selectedLog.destIp}
                      <span className="text-muted-foreground/60">:{selectedLog.destPort}</span>
                    </span>
                  </div>

                  {/* Forensic Add-On: Dest MAC endpoint */}
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40 text-[9px] text-muted-foreground/75">
                    <span className="font-extrabold text-[8px] uppercase">DEST_MAC_HARDWARE:</span>
                    <span className="font-semibold">{computedMacs.destMac}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">RAW_ORIGIN_VOLUME:</span>
                    <span className="text-foreground font-bold">{(selectedLog.origBytes).toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground font-extrabold text-[8.5px]">TRANSMITTED_PACKETS:</span>
                    <span className="text-foreground font-semibold">{selectedLog.respPkts} frames</span>
                  </div>
                </div>

                {/* AI INTACT MATRIX: Classification outputs */}
                <div className="mb-3 bg-muted/20 border border-border/35 p-2 rounded">
                  <div className="text-[8px] font-black text-muted-foreground tracking-widest uppercase border-b border-border/15 pb-0.5 mb-1.5 flex justify-between">
                    <span>AI INTACT MATRIX</span>
                    <span className="text-emerald-505">SYNCHRONIZED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground/80">VERDICT:</span>
                      <strong className={selectedLog.verdict === "ANOMALY" ? "text-red-500 animate-pulse" : "text-emerald-500"}>
                        {selectedLog.verdict}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground/80">CONFIDENCE:</span>
                      <strong className="text-foreground">{selectedLog.confidence.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground/80">SEVERITY:</span>
                      <strong className={selectedLog.severity === "CRITICAL" || selectedLog.severity === "HIGH" ? "text-red-400" : "text-muted-foreground"}>
                        {selectedLog.severity}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground/80">RISK INDEX:</span>
                      <strong className={selectedLog.threatScore > 50 ? "text-amber-500" : "text-emerald-500"}>
                        {selectedLog.threatScore}/100
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Threat alerts visual banner block if anomaly */}
                {selectedLog.verdict === "ANOMALY" && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="text-[8.5px] font-black text-red-500 uppercase tracking-widest leading-none">SIGNATURE DETECTED</div>
                      <div className="text-[9.5px] text-red-450 font-sans mt-0.5 leading-relaxed font-medium">
                        Packet sequences indicate behaviors matching target threat signatures. Outward connections monitored.
                      </div>
                    </div>
                  </div>
                )}

                {/* Cognitive интерпретатор */}
                <div className="p-2.5 bg-background border border-border rounded mb-3">
                  <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Cognitive Interpretation</div>
                  <p className="text-[10px] font-sans text-foreground/90 leading-relaxed font-medium">
                    {selectedLog.reason}
                  </p>
                </div>

                {/* HEX DUMP PRESENTATION */}
                <div>
                  <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">FLOW PACKET HEX MEMORY DUMP</div>
                  <pre className="p-2 bg-zinc/100 dark:text-emerald-400 text-[9px] font-mono rounded border border-border/80 overflow-x-auto select-all leading-tight max-h-35 custom-scrollbar">
                    {selectedLog.hexDump}
                  </pre>
                </div>
              </div>

              {/* Inspector Action Feedbacks with non-blocking styled indicators */}
              <div className="mt-4 pt-2.5 border-t border-border flex flex-col gap-2">
                {actionFeedback && (
                  <div className={`p-1.5 rounded text-[8px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                    actionFeedback.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-505 border border-emerald-500/15" 
                      : "bg-red-500/10 text-red-400 border border-red-500/15"
                  }`}>
                    <span className="w-1 h-2 bg-current block" />
                    {actionFeedback.message}
                  </div>
                )}

                <div className="flex justify-end gap-2 text-[9px] font-black tracking-widest font-mono">
                  <button 
                    onClick={() => {
                      setActionFeedback({
                        type: "success",
                        message: `RELAY COMPLETED: Flow packet logged in SIEM ledger (${btoa(selectedLog.id).substring(0, 10)})`
                      });
                    }}
                    className="px-2.5 py-1.5 bg-background hover:bg-muted border border-border rounded text-foreground transition-all uppercase cursor-pointer"
                  >
                    Forward Alert
                  </button>
                  <button 
                    onClick={() => {
                      setActionFeedback({
                        type: "warning",
                        message: `BLOCKED ENTRY: IP ${selectedLog.srcIp} added to active edge firewall rule table.`
                      });
                    }}
                    className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-500/25 rounded transition-all uppercase cursor-pointer"
                  >
                    Blocklist Source
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/5 rounded-lg border border-dashed border-border/70 min-h-125" 
              id="inspector-card-empty"
            >
              <Terminal className="w-8 h-8 text-muted-foreground/30 animate-pulse mb-2.5" />
              <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase mb-1">INSPECTION WORKSTATION IDLE</p>
              <p className="text-[10px] text-muted-foreground/80 max-w-60 leading-relaxed">
                [SYSTEM STATUS: READY] Select any log sequence from the Event Workbench grid to decode hexadecimal frames and evaluate AI intact matrices.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
