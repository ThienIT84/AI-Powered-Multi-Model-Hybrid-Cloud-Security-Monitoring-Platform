import React from "react";
import { Flame, ShieldAlert, Cpu, AlertTriangle, TrendingUp, Layers } from "lucide-react";

interface ThreatActivitySummaryProps {
  topThreatType?: string;
  affectedAssetsCount?: number;
  criticalIncidentsCount?: number;
  threatTrend?: string;
}

export const ThreatActivitySummary: React.FC<ThreatActivitySummaryProps> = React.memo(({
  topThreatType = "SQL Injection Probe (SQLi)",
  affectedAssetsCount = 14,
  criticalIncidentsCount = 5,
  threatTrend = "Increasing (+12.4% over 24h)"
}) => {
  const summaryKpis = [
    {
      label: "Top Recipient Vector",
      value: topThreatType,
      desc: "Highest recurring malicious payload vector",
      icon: <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
    },
    {
      label: "Affected Cloud Assets",
      value: `${affectedAssetsCount} Nodes`,
      desc: "Unique server hosts under active alert logs",
      icon: <Layers className="w-4 h-4 text-purple-500" />
    },
    {
      label: "Critical Incidents",
      value: `${criticalIncidentsCount} Cases`,
      desc: "Actionable items routed to Tier 3 response",
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />
    },
    {
      label: "Strategic Vector Trend",
      value: threatTrend,
      desc: "Egress/ingress coefficient direction",
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4" id="threat-activity-summary">
      <div className="flex items-center gap-2 border-b border-border/20 pb-2.5">
        <Flame size={15} className="text-rose-500" />
        <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
          Executive Threat & Attack Vector Summary
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-[9px] select-none">
        {summaryKpis.map((kpi, idx) => (
          <div key={idx} className="bg-secondary/15 hover:bg-secondary/35 border border-border/40 p-4 rounded-xl transition duration-150 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="p-1.5 bg-background border border-border/25 rounded-lg shrink-0">
                {kpi.icon}
              </div>
              <span className="text-[7.5px] uppercase font-black tracking-widest text-[#64748b] leading-none">
                KPI
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <span className="text-[8px] uppercase font-black tracking-wider text-muted-foreground block leading-none">
                {kpi.label}
              </span>
              <span className="text-xs font-black text-foreground block truncate leading-tight mt-0.5">
                {kpi.value}
              </span>
              <p className="text-[7px] text-zinc-500 uppercase leading-relaxed font-semibold mt-1">
                {kpi.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
