import React from "react";
import { ShieldAlert, Network, Server, Cloud } from "lucide-react";

interface ExecutiveRiskOverviewProps {
  networkRisk?: number;
  endpointRisk?: number;
  cloudRisk?: number;
}

export const ExecutiveRiskOverview: React.FC<ExecutiveRiskOverviewProps> = React.memo(({
  networkRisk = 24,
  endpointRisk = 18,
  cloudRisk = 32
}) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500 bg-red-500/10 border-red-500/20 bar-red";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20 bar-amber";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 bar-emerald";
  };

  const getRiskLevelStr = (score: number) => {
    if (score >= 70) return "CRITICAL THREAT";
    if (score >= 40) return "MODERATE ADVISORY";
    return "OMNIPRESENT STABLE";
  };

  const risks = [
    {
      title: "Network Perimeter Risk Index",
      score: networkRisk,
      desc: "Aggregates ingress packet scans, rogue port probes (Zeek metrics), and deep volume flow vectors.",
      threat: "SQL Injection Probes & SSH Cracking",
      activeThreats: 14,
      icon: <Network className="w-5 h-5 text-cyan-500" />,
      colorClass: "bg-cyan-500"
    },
    {
      title: "Endpoint Node Risk Index",
      score: endpointRisk,
      desc: "Aggregates localized processes monitoring, file system integrity deviations (Suricata & OSSEC logs).",
      threat: "Unsecured daemon listen flags",
      activeThreats: 3,
      icon: <Server className="w-5 h-5 text-purple-500" />,
      colorClass: "bg-purple-500"
    },
    {
      title: "Multi-Cloud Security Risk Index",
      score: cloudRisk,
      desc: "Aggregates AWS CloudTrail event loops, AWS IAM role permission warnings, and database vulnerability metrics.",
      threat: "Exposed S3 configuration permissions",
      activeThreats: 8,
      icon: <Cloud className="w-5 h-5 text-yellow-500" />,
      colorClass: "bg-yellow-500"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4" id="executive-risk-overview">
      <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
        <div className="flex items-center gap-2 select-none">
          <ShieldAlert size={15} className="text-rose-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground font-mono">
            Security Risk Assessment Landscape
          </h3>
        </div>
        <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold tracking-widest">
          3 Realtime Scans Linked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-[9px]">
        {risks.map((risk, index) => {
          const cStyle = getRiskColor(risk.score);
          const isCritical = risk.score >= 70;
          return (
            <div 
              key={index} 
              className="bg-secondary/10 border border-border/40 hover:border-border/80 transition-all p-4 rounded-xl flex flex-col justify-between space-y-4 select-none"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 bg-background border border-border/20 rounded-lg shrink-0">
                    {risk.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[8.5px] uppercase font-black tracking-tight ${cStyle}`}>
                    {getRiskLevelStr(risk.score)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-foreground leading-tight">
                    {risk.title}
                  </h4>
                  <p className="text-[8px] text-zinc-500 uppercase leading-relaxed font-semibold">
                    {risk.desc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">
                    System Vulnerability Risk
                  </span>
                  <span className="text-lg font-black text-foreground">{risk.score}%</span>
                </div>
                
                {/* Custom slider track */}
                <div className="w-full h-1.5 bg-secondary border border-border/10 rounded-full overflow-hidden block">
                  <div 
                    className={`h-full ${risk.colorClass} rounded-full transition-all duration-1000`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>

                <div className="border-t border-border/10 pt-2 flex items-center justify-between text-[7px] text-zinc-500 uppercase font-black">
                  <span>Top Vector: <b className="text-slate-300">{risk.threat}</b></span>
                  <span>{risk.activeThreats} Items</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
