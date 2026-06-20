import React from "react";
import { EndpointFCAJItem } from "./endpointFCAJData";
import { ShieldCheck, Cpu, HardDrive, Network, Sparkles, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface EndpointOverviewTabProps {
  endpoint: EndpointFCAJItem | null;
}

export const EndpointOverviewTab: React.FC<EndpointOverviewTabProps> = ({ endpoint }) => {
  if (!endpoint) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-100 text-muted-foreground select-none relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="w-12 h-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground mb-4">
          <Activity size={20} className="text-muted-foreground" />
        </div>
        <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest mb-1.5">
          NO INSTANCE SELECTED
        </h4>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider max-w-52.5 leading-relaxed">
          Select an endpoint from the catalog index to view immediate runtime summary metrics and cognitive AI detection signals.
        </p>
      </div>
    );
  }

  // Custom AI summary generator based on risk score and device characteristics
  const getAiSynthesisText = () => {
    if (endpoint.status === "Offline") {
      return `HEARTBEAT LOGOUT: The EDR telemetry pipeline lost connection to this endpoint. Last seen timestamp was ${endpoint.lastSeen}. Network isolation rules remain active to prevent unmonitored blindspots.`;
    }
    if (endpoint.riskScore >= 75) {
      return `CRITICAL INTRUSION PROFILE: Local AI engines have flagged host behavior as anomalous. Outbound connections mapping closely to adversary campaign behaviors. Action is required.`;
    }
    if (endpoint.riskScore >= 40) {
      return `ELEVATED SUSPICION: Security models detected unauthorized port queries and internal scan profiles. Passive surveillance is active on this asset's system binary directory.`;
    }
    return `STATUS SAFE: Continual learning classifiers confirm asset behavior matches normal enterprise baseline thresholds. Active endpoint logs indicate secure operations.`;
  };

  const isHealthy = endpoint.status === "Healthy";
  const isCritical = endpoint.status === "Critical";
  const isWarning = endpoint.status === "Warning";

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-mono" id="endpoint-overview-center-panel">
      {/* 1. Header AI Summary Section */}
      <div className="p-4 rounded-xl border border-indigo-500/10 dark:border-cyan-500/10 bg-indigo-500/5 dark:bg-cyan-500/5 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 dark:bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-600 dark:text-cyan-400 uppercase tracking-widest leading-none">
            AI Endpoint Forensic Cognitive Audit
          </span>
        </div>
        <p className="text-[9.5px] text-muted-foreground uppercase tracking-wide leading-relaxed">
          {getAiSynthesisText()}
        </p>
      </div>

      {/* 2. Key Summary cards (Risk, Flows, Total payload MB, service chart) */}
      <div className="grid grid-cols-2 gap-3" id="overview-summary-cards">
        {/* Risk card */}
        <div className="p-3 bg-muted/30 border border-border rounded-xl">
          <span className="text-[8.5px] text-muted-foreground uppercase tracking-wider block font-bold mb-1">
            Risk Profile
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-lg font-black tracking-tight",
              endpoint.riskScore >= 75 ? "text-red-500" : endpoint.riskScore >= 40 ? "text-amber-500" : "text-emerald-500"
            )}>
              {endpoint.riskScore}
            </span>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase">/ 100</span>
          </div>
          <p className="text-[7.5px] text-muted-foreground uppercase font-semibold mt-1">
            Status: <span className={cn(
              "font-bold",
              isCritical && "text-red-500",
              isWarning && "text-amber-500",
              isHealthy && "text-emerald-500",
              endpoint.status === "Offline" && "text-slate-500"
            )}>{endpoint.status}</span>
          </p>
        </div>

        {/* Connections card */}
        <div className="p-3 bg-muted/30 border border-border rounded-xl">
          <span className="text-[8.5px] text-muted-foreground uppercase tracking-wider block font-bold mb-1">
            Active Flows
          </span>
          <div className="text-lg font-black tracking-tight text-indigo-550 dark:text-cyan-404">
            {endpoint.status === "Offline" ? 0 : endpoint.totalConnections}
          </div>
          <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest block mt-1.5">
            Zeek Logged Sessions
          </span>
        </div>

        {/* Payload Bytes card */}
        <div className="p-3 bg-muted/30 border border-border rounded-xl">
          <span className="text-[8.5px] text-muted-foreground uppercase tracking-wider block font-bold mb-1">
            Payload Transferred
          </span>
          <div className="text-lg font-black tracking-tight text-indigo-550 dark:text-cyan-404">
            {endpoint.status === "Offline" ? "0.00" : (endpoint.totalBytes / (1024 * 1024)).toFixed(2)}
          </div>
          <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest block mt-1.5">
            Megabytes
          </span>
        </div>

        {/* MAC Addr/Machine specs */}
        <div className="p-3 bg-muted/30 border border-border rounded-xl">
          <span className="text-[8.5px] text-muted-foreground uppercase tracking-wider block font-bold mb-1">
            Agent Status
          </span>
          <div className="text-[11px] font-black uppercase text-foreground truncate mt-1">
            {endpoint.status === "Offline" ? (
              <span className="text-muted-foreground">DISCONNECTED</span>
            ) : (
              <span className="text-emerald-550 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                SEC-ACTIVE
              </span>
            )}
          </div>
          <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest block mt-1">
            MAC: {endpoint.mac}
          </span>
        </div>
      </div>

      {/* 3. Zeek Network Services Port Distribution Bounds */}
      <div className="space-y-2">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block px-1">
          Port Service Distribution Bounds
        </span>
        <div className="grid grid-cols-5 gap-1.5 text-center">
          <div className="bg-secondary/40 border border-border rounded p-1.5">
            <span className="text-slate-400 block text-[8px] h-3 uppercase font-semibold">HTTP</span>
            <span className="font-black text-foreground text-[10px]">{endpoint.services.HTTP}</span>
          </div>
          <div className="bg-secondary/40 border border-border rounded p-1.5">
            <span className="text-slate-400 block text-[8px] h-3 uppercase font-semibold">DNS</span>
            <span className="font-black text-foreground text-[10px]">{endpoint.services.DNS}</span>
          </div>
          <div className="bg-secondary/40 border border-border rounded p-1.5">
            <span className="text-slate-400 block text-[8px] h-3 uppercase font-semibold">SSH</span>
            <span className="font-black text-foreground text-[10px]">{endpoint.services.SSH}</span>
          </div>
          <div className="bg-secondary/40 border border-border rounded p-1.5">
            <span className="text-slate-400 block text-[8px] h-3 uppercase font-semibold">HTTPS</span>
            <span className="font-black text-foreground text-[10px]">{endpoint.services.HTTPS}</span>
          </div>
          <div className="bg-secondary/40 border border-border rounded p-1.5">
            <span className="text-slate-400 block text-[8px] h-3 uppercase font-semibold">OTHER</span>
            <span className="font-black text-foreground text-[10px]">{endpoint.services.OTHER}</span>
          </div>
        </div>
      </div>

      {/* 4. LOCAL HOST ONLY AI COGNITION INSIGHTS */}
      <div className="space-y-3 pt-1 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-indigo-550 dark:text-cyan-404" />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
            AI Cognitive Coprocessors (Host-Local)
          </span>
        </div>

        <div className="space-y-2.5">
          {/* AI1 Model Anomaly Detector */}
          <div className="bg-secondary/20 border border-border p-2.5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider uppercase">
              <span className="text-indigo-600 dark:text-cyan-400">AI1 ANOMALY ESTIMATOR</span>
              <span className={cn(
                "px-1 rounded text-[8px]",
                endpoint.ai1.prediction === "ANOMALOUS" && "bg-red-500/15 text-red-500",
                endpoint.ai1.prediction === "SUSPICIOUS" && "bg-amber-500/15 text-amber-500",
                endpoint.ai1.prediction === "NORMAL" && "bg-emerald-500/15 text-emerald-500"
              )}>
                {endpoint.ai1.prediction}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">Anomaly Prediction Index</span>
                <span className="font-extrabold text-foreground">{endpoint.ai1.anomalyScore}%</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    endpoint.ai1.prediction === "ANOMALOUS" ? "bg-red-500" : endpoint.ai1.prediction === "SUSPICIOUS" ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${endpoint.ai1.anomalyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI2A Attack Classifier */}
          <div className="bg-secondary/20 border border-border p-2.5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider uppercase">
              <span className="text-indigo-600 dark:text-cyan-400">AI2A MULTI-CLASS ATTACK CLASSIFIER</span>
              <span className={cn(
                "text-[8px] font-extrabold",
                endpoint.ai2a.attackType !== "None" ? "text-red-500 animate-pulse" : "text-emerald-550"
              )}>
                {endpoint.ai2a.attackType !== "None" ? "TRIGGERED" : "CLEAR"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground truncate max-w-50" title={endpoint.ai2a.attackType}>
                  Prediction Class: <span className="font-extrabold text-foreground">{endpoint.ai2a.attackType}</span>
                </span>
                <span className="font-extrabold text-foreground">{endpoint.ai2a.confidence}%</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-505 dark:bg-cyan-505 rounded-full"
                  style={{ width: `${endpoint.ai2a.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI2B HTTP Web Detector (shown optionally) */}
          <div className="bg-secondary/20 border border-border p-2.5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider uppercase">
              <span className="text-indigo-600 dark:text-cyan-400">AI2B HTTP WEB PAYLOAD DETECTOR</span>
              <span className={cn(
                "text-[8px] font-extrabold",
                endpoint.ai2b.webAttack !== "None" ? "text-amber-500" : "text-emerald-555"
              )}>
                {endpoint.ai2b.webAttack !== "None" ? "PROBE SEEN" : "CLEAR"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground truncate max-w-50" title={endpoint.ai2b.webAttack}>
                  Payload Attack Vector: <span className="font-extrabold text-foreground">{endpoint.ai2b.webAttack}</span>
                </span>
                <span className="font-extrabold text-foreground">{endpoint.ai2b.confidence}%</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${endpoint.ai2b.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
