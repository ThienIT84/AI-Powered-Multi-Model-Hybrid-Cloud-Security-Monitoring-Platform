import React from "react";
import { EndpointAsset } from "./endpointConfig";
import { cn } from "../../lib/utils";
import { ShieldCheck, AlertCircle, Cpu, HardDrive, Target, EyeOff } from "lucide-react";

interface EndpointOverviewTabProps {
  endpoint: EndpointAsset;
}

export function EndpointOverviewTab({ endpoint }: EndpointOverviewTabProps) {
  const isHealthy = endpoint.riskScore < 50;
  const isCritical = endpoint.riskScore >= 80;

  // Custom AI summary generator based on risk score & attributes
  const getAiSummary = () => {
    if (endpoint.status === "OFFLINE") {
      return `This asset is currently OFFLINE. Heartbeat transmissions timed out. Security audits cannot compile telemetry. Immediate network physical checking of the edge terminal is recommended to prevent unlogged blindspots.`;
    }
    if (isCritical) {
      return `CRITICAL ANOMALY ALERT: AI Engine detected multiple active compromises on host ${endpoint.hostname}. Suspicious processes have bypassed standard file integrity checking. Outbound sessions are connected to active command targets. Host physical or virtual partition isolation is advised immediately.`;
    }
    if (endpoint.riskScore >= 50) {
      return `WARNING STATUS: Elevated threat indicators observed on ${endpoint.hostname}. Activity logs contain a higher rate of authorization failures and service discovery requests. Continued real-time passive monitoring is active via defensive models.`;
    }
    return `SECURE PROFILE: Asset behavior is consistently verified healthy against global historical baselines. Deep neural models confirm no signatures of host lateral infiltration, hidden binaries, or memory dumping. Continuous telemetry tracking active.`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Dynamic AI Summary section */}
      <div className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest leading-none">
            AI Engine Forensic Synthesis
          </span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide leading-relaxed">
          {getAiSummary()}
        </p>
      </div>

      {/* Host Metrics (CPU / Mem) slider-style */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* CPU utilization */}
        <div className="p-3.5 bg-muted/30 border border-border rounded-xl font-mono">
          <div className="flex items-center justify-between text-[9px] mb-2 text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold">
              <Cpu size={12} className="text-cyan-500" /> CPU Core
            </span>
            <span className="font-extrabold text-foreground">{endpoint.status === "OFFLINE" ? "0%" : `${endpoint.cpuUsage}%`}</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500", 
                endpoint.cpuUsage > 80 ? "bg-red-500" : endpoint.cpuUsage > 50 ? "bg-amber-500" : "bg-cyan-500"
              )}
              style={{ width: `${endpoint.status === "OFFLINE" ? 0 : endpoint.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Memory utilization */}
        <div className="p-3.5 bg-muted/30 border border-border rounded-xl font-mono">
          <div className="flex items-center justify-between text-[9px] mb-2 text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold">
              <HardDrive size={12} className="text-cyan-500" /> RAM Buffers
            </span>
            <span className="font-extrabold text-foreground">{endpoint.status === "OFFLINE" ? "0%" : `${endpoint.memUsage}%`}</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500", 
                endpoint.memUsage > 80 ? "bg-red-500" : endpoint.memUsage > 50 ? "bg-amber-500" : "bg-cyan-500"
              )}
              style={{ width: `${endpoint.status === "OFFLINE" ? 0 : endpoint.memUsage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Anomalies listed */}
      <div className="space-y-2">
        <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block px-1">
          Suspicious Anomalies Found ({endpoint.anomalies.length})
        </span>
        {endpoint.anomalies.length === 0 ? (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-center">
            <p className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest leading-none">
              &bull; Zero anomalous indicators detected
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {endpoint.anomalies.map((an, i) => (
              <div key={i} className="p-3 bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-[9.5px] font-mono leading-relaxed text-muted-foreground uppercase">
                <span className="text-red-500 font-extrabold shrink-0 mt-0.5">&bull;</span>
                <span>{an}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MITRE ATTK mapping details */}
      <div className="space-y-2">
        <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block px-1">
          MITRE ATT&CK Adversary Map
        </span>
        {endpoint.mitreMapping.length === 0 ? (
          <div className="p-3 bg-muted/40 border border-border border-dashed rounded-xl text-center">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              No tactical adversary matches identified
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {endpoint.mitreMapping.map((mapPoint) => (
              <div 
                key={mapPoint.id} 
                className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3 font-mono"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-foreground uppercase tracking-wide leading-none">{mapPoint.name}</span>
                  <span className="text-[8px] text-muted-foreground uppercase mt-1 leading-none">PHASE: {mapPoint.phase}</span>
                </div>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest rounded shrink-0">
                  {mapPoint.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
