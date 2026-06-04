import React from "react";
import { Sliders, Flame } from "lucide-react";
import { cn } from "../../lib/utils";

interface DynamicRouterLogicProps {
  isDarkMode: boolean;
  hoveredRoutingNode: string | null;
  onHoverNode: (node: string | null) => void;
}

export function DynamicRouterLogic({ isDarkMode, hoveredRoutingNode, onHoverNode }: DynamicRouterLogicProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-[10px]">
      <div className="mb-4 pb-2 border-b border-border/60 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sliders size={13} className="text-indigo-400" />
          <h3 className="text-xs font-black uppercase tracking-wider">Dynamic Router Logic Schema</h3>
        </div>
        <span className="text-[8px] text-slate-400 uppercase font-black">Hover any input node to trace logic path</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch relative">
        {/* Box 1: Sources */}
        <div className="space-y-3">
          <p className="text-[8px] font-black uppercase text-slate-400">1. Data file Log Ingestion</p>
          
          <div 
            onMouseEnter={() => onHoverNode("conn")}
            onMouseLeave={() => onHoverNode(null)}
            className={cn(
              "p-3 rounded-lg border font-mono text-center cursor-help transition-all",
              hoveredRoutingNode === "conn" ? "bg-blue-500/20 border-blue-500 scale-[1.03]" : "bg-slate-100 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="font-black uppercase">conn.log</p>
            <span className="text-[8px] opacity-80 uppercase block mt-1">Network flows</span>
          </div>

          <div 
            onMouseEnter={() => onHoverNode("http")}
            onMouseLeave={() => onHoverNode(null)}
            className={cn(
              "p-3 rounded-lg border font-mono text-center cursor-help transition-all",
              hoveredRoutingNode === "http" ? "bg-amber-400/20 border-amber-500 scale-[1.03]" : "bg-slate-100 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="font-black uppercase">http.log</p>
            <span className="text-[8px] opacity-80 uppercase block mt-1">Web queries</span>
          </div>
        </div>

        {/* Box 2: Middle processing models (AI) */}
        <div className="flex flex-col justify-around gap-2 bg-slate-100/60 dark:bg-slate-900/30 border border-transparent p-2.5 rounded-xl">
          <div 
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all",
              hoveredRoutingNode === "conn" ? "bg-blue-500/15 border-blue-400" : "bg-white dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="font-black uppercase text-[9px] text-cyan-600 dark:text-cyan-400">AI1 Anomaly</p>
            <span className="text-[7.5px] opacity-70">UNSUPERVISED PIPELINES</span>
          </div>

          <div 
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all",
              hoveredRoutingNode === "conn" ? "bg-blue-500/15 border-blue-400" : "bg-white dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="font-black uppercase text-[9px] text-emerald-600 dark:text-emerald-400">AI2A Attack Classifier</p>
            <span className="text-[7.5px] opacity-70">SUPERVISED THREATS</span>
          </div>

          <div 
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all",
              hoveredRoutingNode === "http" ? "bg-amber-400/15 border-amber-400 animate-pulse" : "bg-white dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="font-black uppercase text-[9px] text-indigo-600 dark:text-indigo-400">AI2B Web Attack Classifier</p>
            <span className="text-[7.5px] opacity-70">URI INJECTION DETECTOR</span>
          </div>
        </div>

        {/* Box 3: Fusion and Alert consolidation output */}
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-[8px] font-black uppercase text-slate-400">2. Fusion Synapse Process</p>
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/15 text-center relative group">
            <Flame size={18} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-1.5 animate-pulse" />
            <p className="font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">Fusion Core Layer</p>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase mt-1">
              Combines AI Scores + Suricata alert profiles → Verdicts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
