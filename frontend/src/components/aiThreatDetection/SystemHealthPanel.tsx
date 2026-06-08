import React from "react";
import { Cpu, Heart, RefreshCw, Zap } from "lucide-react";

interface SystemHealthPanelProps {
  throughput: number;
  liveDetections: number;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  throughput,
  liveDetections,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 font-mono text-[11px]">
      {/* Title */}
      <div className="border-b border-border/70 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart size={14} className="text-rose-500 animate-[pulse_1.5s_infinite]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
            Multi-Model AI Pipeline Status &amp; Performance Layer (SOC level)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px]">
          <RefreshCw size={11} className="animate-spin text-cyan-400" />
          <span className="text-muted-foreground uppercase">Real-Time Syncing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Model 1: AI1 */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">AI1 - Forest Unsuper</span>
            <div className="font-bold text-foreground">Unsupervised Anomaly</div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              • Healthy
            </span>
          </div>
        </div>

        {/* Model 2: AI2A */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">AI2A - Attack Class</span>
            <div className="font-bold text-foreground">Deep Multi-Classifier</div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              • Healthy
            </span>
          </div>
        </div>

        {/* Model 3: AI2B */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">AI2B - HTTP Semantic</span>
            <div className="font-bold text-foreground">NLP Payload Parser</div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              • Healthy
            </span>
          </div>
        </div>

        {/* Model 4: Fusion Layer */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">Fusion Decisions</span>
            <div className="font-bold text-foreground">Consensus Optimizer</div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              ⚡ ACTIVE
            </span>
          </div>
        </div>

        {/* Event Throughput */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">Processing Speed</span>
            <div className="font-bold text-cyan-400 flex items-center gap-1">
              <Zap size={11} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
              {throughput.toLocaleString()} EPS
            </div>
          </div>
        </div>

        {/* Total Anomaly Triggered */}
        <div className="bg-muted/15 border border-border/50 p-3 rounded-lg flex items-center justify-between text-right sm:text-left">
          <div className="space-y-1 w-full flex flex-col justify-between items-end sm:items-start">
            <span className="text-[8.5px] uppercase text-muted-foreground font-black">Total Detections</span>
            <div className="font-semibold text-amber-500">
              {liveDetections.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
