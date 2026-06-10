import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Shield, Play, Layers, Sparkles } from "lucide-react";

interface SOCOperationalOverviewProps {
  networkStatus: "Healthy" | "Warning" | "Critical" | "Offline";
  endpointStatus: "Healthy" | "Warning" | "Critical" | "Offline";
  cloudStatus: "Healthy" | "Warning" | "Critical" | "Offline";
  aiDetectionStatus: "Healthy" | "Warning" | "Critical" | "Offline";
}

export const SOCOperationalOverview: React.FC<SOCOperationalOverviewProps> = React.memo(({
  networkStatus = "Healthy",
  endpointStatus = "Healthy",
  cloudStatus = "Warning",
  aiDetectionStatus = "Healthy"
}) => {
  const statusConfig = {
    Healthy: {
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      icon: <CheckCircle2 size={16} />
    },
    Warning: {
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: <AlertTriangle size={16} />
    },
    Critical: {
      colorClass: "text-red-500 bg-red-500/10 border-red-500/25 animate-pulse",
      icon: <XCircle size={16} />
    },
    Offline: {
      colorClass: "text-red-500 bg-red-500/15 border-red-500/25",
      icon: <XCircle size={16} />
    }
  };

  const domains = [
    {
      id: "network",
      name: "Network Status Overview",
      status: networkStatus,
      description: "Passive intrusion logging and live raw flow parser"
    },
    {
      id: "endpoint",
      name: "Endpoint EDR Shield Status",
      status: endpointStatus,
      description: "Asset compliance checks and privilege boundary agent"
    },
    {
      id: "cloud",
      name: "Cloud Integration Status",
      status: cloudStatus,
      description: "GuardDuty telemetry pipelines and S3 asset scanners"
    },
    {
      id: "ai",
      name: "Neural Detection Engine",
      status: aiDetectionStatus,
      description: "Multi-stage fusion voting and cluster anomaly models"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4" id="soc-operational-overview">
      <div className="flex items-center justify-between border-b border-border/20 pb-2 select-none">
        <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono flex items-center gap-1.5">
          <Layers size={13} className="text-red-500" />
          SOC Security Enclave States
        </h3>
        <span className="text-[7.5px] font-mono text-muted-foreground uppercase">
          Continuous Perimeter Evaluation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {domains.map((domain) => {
          const config = statusConfig[domain.status] || statusConfig.Offline;

          return (
            <div
              key={domain.id}
              className="bg-secondary/20 border border-border/50 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-secondary/35"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-foreground/90 font-mono block">
                  {domain.name}
                </span>
                <p className="text-[9.5px] text-muted-foreground font-sans leading-normal">
                  {domain.description}
                </p>
              </div>

              {/* Aggregated Status Badge */}
              <div className="mt-4 flex items-center justify-between font-mono">
                <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">
                  Status State:
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border flex items-center gap-1 leading-normal ${config.colorClass}`}>
                  {config.icon}
                  {domain.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
