import React from "react";
import { Terminal, Shield, Clock, Hourglass, BarChart3, TrendingUp, Users, Cpu } from "lucide-react";

interface SOCPerformanceMetricsProps {
  meanTimeToDetect?: string;
  meanTimeToRespond?: string;
  meanTimeToResolve?: string;
  resolutionRate?: number;
}

export const SOCPerformanceMetrics: React.FC<SOCPerformanceMetricsProps> = React.memo(({
  meanTimeToDetect = "1.8 mins",
  meanTimeToRespond = "12.4 mins",
  meanTimeToResolve = "42.5 mins",
  resolutionRate = 96.8
}) => {
  const opMetrics = [
    { label: "Mean Time To Detect (MTTD)", value: meanTimeToDetect, icon: <Clock className="w-4 h-4 text-cyan-500" />, desc: "From ingress trigger to security alarm consensus" },
    { label: "Mean Time To Respond (MTTR)", value: meanTimeToRespond, icon: <Hourglass className="w-4 h-4 text-purple-500" />, desc: "From consensus alarm state to active analyst triaging" },
    { label: "Mean Time To Resolve (MTTS)", value: meanTimeToResolve, icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, desc: "From analyst triaging to incident closure sign-off" },
    { label: "Case Resolution Rate", value: `${resolutionRate}%`, icon: <BarChart3 className="w-4 h-4 text-yellow-500" />, desc: "Proportion of cases marked completed vs opened" }
  ];

  const productivityKPIs = [
    { label: "Cases Handled", value: "312", desc: "Total cases routed to active SOC analyst bins" },
    { label: "Cases Resolved", value: "302", desc: "Successfully mitigated and structured with sign-offs" },
    { label: "Escalations Issued", value: "34", desc: "Tier 1 to Tier 3 or DevOps operations transition" },
    { label: "Backlog In Queue", value: "10 Cases", desc: "Pending automated or manual priority sign-off" }
  ];

  const fusionMetrics = [
    { label: "Consensus-Classified Alerts", value: "12,543", desc: "Alert items evaluated by Bayesian logic" },
    { label: "False Positive Reduction", value: "-89.4%", desc: "Noise suppression rate achieved via AI models" },
    { label: "Consensus Agreement Rate", value: "98.9%", desc: "Inference level alignment across model layers" }
  ];

  return (
    <div className="space-y-6" id="soc-performance-metrics">
      
      {/* 4 Cards Row: SOC Operational Metrics */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 font-mono select-none">
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
          <Clock size={15} className="text-cyan-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase text-foreground tracking-widest leading-none">
            SOC Operational Performance Metrics
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opMetrics.map((item, idx) => (
            <div key={idx} className="bg-secondary/15 hover:bg-secondary/35 border border-border/40 p-4.5 rounded-xl transition duration-150 flex items-start gap-3">
              <div className="p-2 bg-background border border-border/20 rounded-lg shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[7.5px] uppercase font-black tracking-wider text-muted-foreground block leading-none mb-1">
                  {item.label}
                </span>
                <span className="text-lg font-black text-foreground block truncate leading-tight">
                  {item.value}
                </span>
                <span className="text-[7px] text-zinc-500 block leading-normal mt-1 uppercase font-semibold">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Analyst Productivity VS Fusion Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-[9px] select-none">
        
        {/* Unit A: Analyst Productivity */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
            <Users size={14} className="text-purple-500" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest leading-none">
              SOC Security Analyst Productivity
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {productivityKPIs.map((kpi, idx) => (
              <div key={idx} className="p-3 bg-secondary/10 hover:bg-secondary/20 border border-border/30 rounded-lg transition duration-150">
                <span className="text-[8px] uppercase font-bold text-zinc-500 block leading-tight">
                  {kpi.label}
                </span>
                <span className="text-lg font-black text-zinc-100 block mt-1">
                  {kpi.value}
                </span>
                <span className="text-[7px] text-zinc-500 uppercase block mt-1 font-semibold leading-relaxed">
                  {kpi.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unit B: Fusion Detection Performance (Aggregated only, no model internals) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
            <Cpu size={14} className="text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest leading-none">
              Fusion Consensus Filtering Performance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {fusionMetrics.map((kpi, idx) => (
              <div key={idx} className="p-3 bg-secondary/10 hover:bg-secondary/20 border border-border/30 rounded-lg transition duration-150 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] uppercase font-bold text-zinc-500 block leading-tight">
                    {kpi.label}
                  </span>
                  <span className="text-lg font-black text-emerald-500 block mt-1">
                    {kpi.value}
                  </span>
                </div>
                <span className="text-[7px] text-zinc-500 uppercase block mt-2 font-semibold leading-relaxed">
                  {kpi.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
});
