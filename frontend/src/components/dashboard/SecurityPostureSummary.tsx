import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, Cloud, HeartHandshake } from "lucide-react";
import { SecurityPostureMetrics } from "./types/dashboard.types";

interface SecurityPostureSummaryProps {
  metrics: SecurityPostureMetrics;
}

export const SecurityPostureSummary: React.FC<SecurityPostureSummaryProps> = React.memo(({ metrics }) => {
  const getProgressColor = (val: number | null) => {
    if (val === null) return "bg-zinc-600";
    if (val >= 75) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
    if (val >= 45) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  };

  const getTextColor = (val: number | null) => {
    if (val === null) return "text-muted-foreground";
    if (val >= 75) return "text-red-500 font-extrabold";
    if (val >= 45) return "text-amber-500 font-bold";
    return "text-emerald-500 font-bold";
  };

  const factors = [
    {
      id: "overall",
      name: "Overall Security Risk",
      value: metrics.overallRisk,
      icon: <ShieldCheck size={12} className="text-emerald-400" />,
      sub: "Weighted aggregate of active organizational threat vectors"
    },
    {
      id: "network",
      name: "Network Threat Ingress Risk",
      value: metrics.networkRisk,
      icon: <Cpu size={12} className="text-cyan-500" />,
      sub: "Active network flow anomalies & protocol scan telemetry"
    },
    {
      id: "endpoint",
      name: "Endpoint EDR Compromise Risk",
      value: metrics.endpointRisk,
      icon: <ShieldAlert size={12} className="text-indigo-400" />,
      sub: "Device compliance ratios & local privilege escalation events"
    },
    {
      id: "cloud",
      name: "Cloud Configuration Drift Risk",
      value: metrics.cloudRisk,
      icon: <Cloud size={12} className="text-purple-400" />,
      sub: "Bucket exposures and unauthorized IAM management logs"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="security-posture-summary">
      <div>
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
          <HeartHandshake size={14} className="text-red-500" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Security Posture Risk Index
          </h3>
        </div>

        <div className="space-y-4 font-mono select-none">
          {factors.map((factor) => (
            <div key={factor.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-zinc-400">
                <span className="flex items-center gap-1.5">
                  {factor.icon}
                  {factor.name}
                </span>
                <span className={getTextColor(factor.value)}>{factor.value === null ? "—" : `${factor.value}% Risk`}</span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(factor.value)}`}
                  style={{ width: `${factor.value ?? 0}%` }}
                ></div>
              </div>
              <span className="text-[7.5px] text-zinc-500 block leading-tight mt-0.5">
                {factor.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono mt-4 uppercase select-none border-t border-border/10 pt-2 flex items-center justify-between leading-none font-bold">
        <span>Posture Score status: Mapped</span>
        <span>Perimeter Evaluated: Realtime</span>
      </div>
    </div>
  );
});

