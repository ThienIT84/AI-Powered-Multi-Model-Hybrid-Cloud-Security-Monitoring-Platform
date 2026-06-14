import React from "react";
import { ShieldCheck, Cpu, AlertTriangle, Zap, Percent, RefreshCw } from "lucide-react";

interface SOCHeaderKPIProps {
  liveInferences: number;
  liveDetections: number;
  liveFusionAlerts: number;
  liveLatency: number;
  liveFpReduction: number;
}

export const SOCHeaderKPI: React.FC<SOCHeaderKPIProps> = ({
  liveInferences,
  liveDetections,
  liveFusionAlerts,
  liveLatency,
  liveFpReduction,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
      {/* KPI 1: Pipeline Health */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">Pipeline Health</span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-black text-emerald-500 flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            Healthy
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">Zeek &amp; AI Layer Active</p>
        </div>
      </div>

      {/* KPI 2: Total Inferences */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">Inferences (24h)</span>
          <Cpu className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="space-y-1">
          <div className="text-xl font-black text-foreground tracking-tight">
            {liveInferences.toLocaleString()}
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">Flows Evaluated</p>
        </div>
      </div>

      {/* KPI 3: Total Detections */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">Total Detections</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="space-y-1">
          <div className="text-xl font-black text-amber-500 tracking-tight">
            {liveDetections.toLocaleString()}
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">AI Anomaly Triggered</p>
        </div>
      </div>

      {/* KPI 4: Fusion Alerts */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">Fusion Alerts</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="space-y-1">
          <div className="text-xl font-black text-red-500 tracking-tight">
            {liveFusionAlerts.toLocaleString()}
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">Consensus Filtered</p>
        </div>
      </div>

      {/* KPI 5: Avg Latency */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">Avg Latency</span>
          <Zap className="w-4 h-4 text-violet-500" />
        </div>
        <div className="space-y-1">
          <div className="text-xl font-black text-foreground tracking-tight">
            {liveLatency}ms
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">End-to-End Inference</p>
        </div>
      </div>

      {/* KPI 6: FP Reduction */}
      <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider">FP Reduction</span>
          <Percent className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <div className="text-xl font-black text-emerald-400 tracking-tight">
            -{liveFpReduction}%
          </div>
          <p className="text-[9px] text-muted-foreground uppercase">vs Suricata Baseline</p>
        </div>
      </div>
    </div>
  );
};
