import React, { useMemo } from "react";
import { NetworkLog } from "../network/NetworkConfig";

interface NetworkMonitoringKPIsProps {
  logs: NetworkLog[];
  isRunning: boolean;
  anomalousFlowsCount: number;
}

export const NetworkMonitoringKPIs: React.FC<NetworkMonitoringKPIsProps> = ({
  logs,
  isRunning,
  anomalousFlowsCount,
}) => {
  const totalFlows24h = useMemo(() => {
    return logs.length;
  }, [logs]);

  const activeConnectionsCount = useMemo(() => {
    if (!isRunning) return 0;
    return new Set(logs.map((log) => `${log.srcIp ?? log.sourceIp}-${log.destIp}-${log.destPort}`)).size;
  }, [logs, isRunning]);

  const throughputRate = useMemo(() => {
    if (!isRunning) return "0.0 Mbps";
    const totalBytes = logs.reduce((sum, log) => sum + log.origBytes + (log.respBytes ?? 0), 0);
    return ((totalBytes * 8) / 1_000_000).toFixed(2) + " Mbps";
  }, [logs, isRunning]);

  const attackRatio = useMemo(() => {
    if (logs.length === 0) return "0.0";
    return ((anomalousFlowsCount / logs.length) * 100).toFixed(1);
  }, [logs, anomalousFlowsCount]);

  // Basic latency indicator (UI only)
  const averageLatency = useMemo(() => {
    if (!isRunning) return "0.0 ms";
    if (logs.length === 0) return "Unavailable";
    const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length;
    return `${avgDuration.toFixed(1)} ms`;
  }, [logs, isRunning]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5" id="kpi-panel-matrix">
      {/* KPI 1: Total Flows */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Total Flows (24h)</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-foreground">{totalFlows24h.toLocaleString()}</span>
          <span className="text-[8.5px] font-bold text-muted-foreground">Observed</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Zeek conn.log feeds</span>
      </div>

      {/* KPI 2: Active Connections */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Active Connections</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-foreground">{activeConnectionsCount}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse self-center" />
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Sockets Established</span>
      </div>

      {/* KPI 3: AI Anomalies */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">AI1 Anomalies</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-red-500 dark:text-red-400">{anomalousFlowsCount}</span>
          <span className="text-[8.5px] font-bold text-muted-foreground">of {logs.length} flows</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none font-mono">Anomaly Score &gt; 70%</span>
      </div>

      {/* KPI 4: Throughput */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Throughput</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-cyan-500">{throughputRate}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none font-mono">Live bandwidth rate</span>
      </div>

      {/* KPI 5: Attack ratio */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Attack Ratio</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-rose-600 dark:text-rose-450">{attackRatio}%</span>
        </div>
        <span className="text-[8px] mt-1 uppercase block leading-none text-rose-500/80">Anomaly proportion</span>
      </div>

      {/* KPI 6: Basic latency indicator */}
      <div className="bg-card border border-border p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Network Latency</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-indigo-500">{averageLatency}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none font-mono">UI agent response</span>
      </div>
    </div>
  );
};
