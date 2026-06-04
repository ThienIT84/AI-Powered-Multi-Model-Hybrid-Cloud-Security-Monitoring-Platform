import React from "react";
import { Cpu, Sparkles, BrainCircuit, Activity, Server, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface AIEngineStatusPanelProps {
  alertsCount?: number;
}

export function AIEngineStatusPanel({ alertsCount = 0 }: AIEngineStatusPanelProps) {
  
  const models = [
    {
      id: "ai1",
      name: "AI1 - Isolation Forest",
      type: "Network Anomaly Detector",
      state: "Loaded",
      version: "v2.1",
      latency: "0.8ms",
      rpm: 1240,
      predictions: 145220 + (alertsCount * 8),
      errorRate: "0.01%",
      icon: Cpu,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/15"
    },
    {
      id: "ai2a",
      name: "AI2A - Heuristic Classifier",
      type: "Supervised Flow Attack Classifier",
      state: "Loaded",
      version: "v2.8",
      latency: "1.4ms",
      rpm: 720,
      predictions: 84102 + (alertsCount * 3),
      errorRate: "0.03%",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/15"
    },
    {
      id: "ai2b",
      name: "AI2B - Semantic Detector",
      type: "HTTP Text Pattern Scanner",
      state: "Loaded",
      version: "v3.1",
      latency: "14.2ms",
      rpm: 380,
      predictions: 45012 + alertsCount,
      errorRate: "0.02%",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/15"
    },
    {
      id: "fusion",
      name: "Correlation Fusion Layer",
      type: "Correlated Consensus Resolver",
      state: "Active",
      version: "v3.0",
      latency: "0.4ms",
      rpm: 1240,
      predictions: 12450 + alertsCount,
      errorRate: "0.00%",
      icon: Activity,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/15"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-3 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-cyan-500" />
          SOC AI ENGINES REAL-TIME RUNTIME
        </h3>
        <span className="text-[7.5px] font-bold text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          Inference Pipeline: ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <div 
            key={model.id} 
            className="bg-secondary/40 border border-border hover:border-border/80 p-3.5 rounded-xl transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg border", model.bg, model.color, model.border)}>
                  <model.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider">{model.name}</h4>
                  <p className="text-[7.5px] text-muted-foreground/60 leading-none mt-0.5 uppercase tracking-wide font-mono">{model.type}</p>
                </div>
              </div>
              <span className="px-1.5 py-px text-[7px] font-mono font-bold uppercase rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 animate-pulse">
                {model.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-1.5 border-t border-border/20 pt-2 text-[8.5px] font-mono leading-none">
              <div>
                <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">LATENCY</span>
                <span className="text-cyan-400 font-extrabold">{model.latency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">VERSION</span>
                <span className="text-foreground">{model.version}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">PRED COUNT</span>
                <span className="text-foreground font-black">{model.predictions.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">ERR RATE</span>
                <span className="text-red-500 font-extrabold">{model.errorRate}</span>
              </div>
            </div>

            {/* Performance index slider */}
            <div className="pt-1 select-none">
              <div className="flex justify-between text-[7px] font-black text-muted-foreground uppercase opacity-60 mb-1">
                <span>REQS PER MINUTE</span>
                <span>{model.rpm} RPM</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", model.id === "fusion" ? "bg-red-500" : "bg-cyan-500")} 
                  style={{ width: `${(model.rpm / 1500) * 100}%` }} 
                />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default AIEngineStatusPanel;
