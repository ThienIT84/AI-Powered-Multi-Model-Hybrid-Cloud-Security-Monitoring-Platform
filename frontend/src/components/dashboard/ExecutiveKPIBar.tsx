import React from "react";
import { Activity, ShieldAlert, AlertOctagon, FolderKanban, Sliders, Cloud, Target } from "lucide-react";
import { DashboardMetrics } from "./types/dashboard.types";

interface ExecutiveKPIBarProps {
  metrics: DashboardMetrics;
}

export const ExecutiveKPIBar: React.FC<ExecutiveKPIBarProps> = React.memo(({ metrics }) => {
  const cards = [
    {
      id: "flows",
      label: "Total Network Flows",
      value: metrics.totalNetworkFlows.toLocaleString(),
      icon: <Activity size={14} />,
      colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/40",
      caption: "Zeek Ingress Stream"
    },
    {
      id: "fusion",
      label: "Total Fusion Alerts",
      value: metrics.totalFusionAlerts.toLocaleString(),
      icon: <ShieldAlert size={14} />,
      colorClass: "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:border-sky-500/40",
      caption: "Neural Evaluated"
    },
    {
      id: "critical",
      label: "Critical Alerts",
      value: metrics.criticalAlerts.toLocaleString(),
      icon: <AlertOctagon size={14} />,
      colorClass: "bg-red-500/10 text-red-500 border-red-500/25 hover:border-red-500/40",
      caption: "Execution Priority"
    },
    {
      id: "cases",
      label: "Open Cases",
      value: metrics.openCases.toLocaleString(),
      icon: <FolderKanban size={14} />,
      colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/40",
      caption: "SLA Active Enclaves"
    },
    {
      id: "endpoints",
      label: "Active Endpoints",
      value: metrics.activeEndpoints.toLocaleString(),
      icon: <Sliders size={14} />,
      colorClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/40",
      caption: "Connected Sentinel agents"
    },
    {
      id: "assets",
      label: "Cloud Assets",
      value: metrics.cloudAssets.toLocaleString(),
      icon: <Cloud size={14} />,
      colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40",
      caption: "Multi-tenant inventory"
    },
    {
      id: "threats",
      label: "Threat Intel Matches",
      value: metrics.threatIntelMatches.toLocaleString(),
      icon: <Target size={14} />,
      colorClass: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 hover:border-fuchsia-500/40",
      caption: "IOC Confidence Hits"
    }
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
      id="executive-kpi-bar"
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-card border rounded-xl p-3.5 flex flex-col justify-between transition-all select-none ${card.colorClass}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-wider font-mono">
              {card.label}
            </span>
            <div className="p-1 rounded-sm">
              {card.icon}
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xl md:text-2xl font-black block tracking-tight font-mono text-foreground leading-none">
              {card.value}
            </span>
            <span className="text-[7.5px] text-muted-foreground block mt-1 font-bold font-mono uppercase tracking-tight">
              {card.caption}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});
