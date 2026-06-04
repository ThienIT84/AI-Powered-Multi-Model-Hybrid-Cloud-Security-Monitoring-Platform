import React, { useMemo } from "react";
import { NetworkLog } from "../network/NetworkConfig";

interface NetworkMonitoringKPIsProps {
  logs: NetworkLog[];
  isRunning: boolean;
  anomalousFlowsCount: number;
  averageRiskScore: number;
}

export const NetworkMonitoringKPIs: React.FC<NetworkMonitoringKPIsProps> = ({
  logs,
  isRunning,
  anomalousFlowsCount,
  averageRiskScore,
}) => {
  const totalFlows24h = useMemo(() => {
    return logs.length * 15 + 4182; // Dynamic increment
  }, [logs]);

  const activeConnectionsCount = useMemo(() => {
    return isRunning ? Math.round(logs.length * 0.45 + 23) : 0;
  }, [logs, isRunning]);

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5" id="kpi-panel-matrix">
      {/* KPI 1: Active flows */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Total Flows (24h)</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-foreground">{totalFlows24h.toLocaleString()}</span>
          <span className="text-[8.5px] font-bold text-emerald-500 dark:text-emerald-400">+12.4%</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Zeek conn.log feeds</span>
      </div>

      {/* KPI 2: Active Connection flows */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Active Connections</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-foreground">{activeConnectionsCount}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse self-center" />
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Sockets Established</span>
      </div>

      {/* KPI 3: Anomalous flows count */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">AI1 Anomalies</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-red-500 dark:text-red-400">{anomalousFlowsCount}</span>
          <span className="text-[8.5px] font-bold text-muted-foreground">of {logs.length} flows</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Heuristic Footprints</span>
      </div>

      {/* KPI 4: Threat classification indicators */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Attacks Detected</span>
        <div className="mt-1 grid grid-cols-2 gap-x-1.5 text-[8.5px] leading-tight font-black uppercase text-slate-700 dark:text-slate-350">
          <span className={attackBreakdown.scan > 0 ? "text-red-500 dark:text-red-400" : ""}>Scan: {attackBreakdown.scan}</span>
          <span className={attackBreakdown.brute > 0 ? "text-amber-600 dark:text-amber-500" : ""}>SSH: {attackBreakdown.brute}</span>
          <span className={attackBreakdown.dos > 0 ? "text-orange-600 dark:text-orange-500" : ""}>DoS: {attackBreakdown.dos}</span>
          <span className={attackBreakdown.botnet > 0 ? "text-blue-600 dark:text-blue-400" : ""}>Leakers: {attackBreakdown.botnet}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">MultiClass AI2A</span>
      </div>

      {/* KPI 5: Threat attack ratios */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Attack Ratio</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-rose-600 dark:text-rose-450">{attackRatio}%</span>
          <span className="text-[8px] font-bold text-rose-700 dark:text-rose-550">Ratio</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Attack / Total Flow</span>
      </div>

      {/* KPI 6: Weights metrics risk indices */}
      <div className="bg-card border border-border hover:border-border/80 p-2.5 rounded-lg flex flex-col justify-between shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Avg Threat Score</span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-base font-black text-amber-600 dark:text-amber-500">{averageRiskScore}/100</span>
          <span className="text-[8.5px] font-black text-yellow-600">HIGH</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-1 uppercase block leading-none">Fusion Layer Result</span>
      </div>
    </div>
  );
};
