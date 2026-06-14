import React from "react";
import { 
  Activity,
  ShieldAlert,
  Flame,
  CheckCircle,
  Gauge
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";

export function AlertStats({ alerts }: { alerts: Alert[] }) {
  const totalFusionAlerts = alerts.length;

  const criticalAlerts = alerts.filter(a => 
    a.severity === Severity.CRITICAL || String(a.severity).toLowerCase() === "critical"
  ).length;

  const highAlerts = alerts.filter(a => 
    a.severity === Severity.HIGH || String(a.severity).toLowerCase() === "high"
  ).length;

  const mediumAlerts = alerts.filter(a => 
    a.severity === Severity.MEDIUM || String(a.severity).toLowerCase() === "medium"
  ).length;

  const avgConfidence = alerts.length > 0
    ? Math.round(
        (alerts.reduce((sum, a) => sum + (a.confidenceScore !== undefined ? a.confidenceScore : 0.8), 0) / alerts.length) * 100
      )
    : 86;

  const blockedOrResolved = alerts.filter(a => 
    a.status === AlertStatus.RESOLVED || 
    a.status === AlertStatus.MITIGATED ||
    String(a.status).toLowerCase() === "resolved" ||
    String(a.status).toLowerCase() === "blocked" ||
    String(a.status).toLowerCase() === "mitigated"
  ).length;

  return (
    <div id="alert-summary-kpis" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      
      {/* 1. Total Fusion Alerts */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Alerts</span>
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div>
          <div className="text-lg font-black text-foreground font-mono leading-none">{totalFusionAlerts}</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">Fusion Queue (24h)</div>
        </div>
      </div>

      {/* 2. Critical Alerts */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Critical</span>
          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        </div>
        <div>
          <div className="text-lg font-black text-red-500 font-mono leading-none">{criticalAlerts}</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">Immediate Action</div>
        </div>
      </div>

      {/* 3. High Alerts */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">High</span>
          <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
        </div>
        <div>
          <div className="text-lg font-black text-orange-400 font-mono leading-none">{highAlerts}</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">High Severity Items</div>
        </div>
      </div>

      {/* 4. Medium Alerts */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Medium</span>
          <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
        </div>
        <div>
          <div className="text-lg font-black text-yellow-500 font-mono leading-none">{mediumAlerts}</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">Medium Severity Items</div>
        </div>
      </div>

      {/* 5. Average Fusion Confidence */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Avg Confidence</span>
          <Gauge className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div>
          <div className="text-lg font-black text-emerald-500 font-mono leading-none">{avgConfidence}%</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">Consensus Rating</div>
        </div>
      </div>

      {/* 6. Blocked / Resolved Alerts */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Resolved</span>
          <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
        </div>
        <div>
          <div className="text-lg font-black text-cyan-400 font-mono leading-none">{blockedOrResolved}</div>
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-none">Mitigated Incidents</div>
        </div>
      </div>

    </div>
  );
}

export default AlertStats;
