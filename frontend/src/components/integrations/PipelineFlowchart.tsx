import React from "react";
import { GitFork, Flame } from "lucide-react";
import { cn } from "../../lib/utils";

interface PipelineFlowchartProps {
  simulatedFailures: Record<string, boolean>;
  isDarkMode: boolean;
}

export function PipelineFlowchart({ simulatedFailures, isDarkMode }: PipelineFlowchartProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex justify-between items-center mb-4 border-b pb-2 border-border/60">
        <div className="flex items-center gap-2">
          <GitFork size={15} className="text-cyan-405 text-cyan-400" />
          <h2 className="text-xs font-black uppercase tracking-wider font-mono">
            FCAJ v3.0 End-To-End Ingestion Data Routing Architecture Map
          </h2>
        </div>
        <span className="text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
          Live Stream View
        </span>
      </div>

      {/* Horizontal scrollable visual flowchart */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex items-center justify-between min-w-300 gap-2 py-2">
          
          {/* Stage 1: Lab */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.zeek && simulatedFailures.suricata 
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" 
                : "bg-slate-100 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
            )}>
              <p className="text-[9px] font-black uppercase">Local Lab</p>
              <div className="h-1 w-full bg-emerald-500 rounded" />
              <p className="text-[8px] opacity-80">100% Rate</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 2: Zeek */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.zeek 
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 animate-pulse" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">Zeek Sensor</p>
              <div className={cn("h-1 w-full rounded", simulatedFailures.zeek ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[8px] opacity-80">{simulatedFailures.zeek ? "OFFLINE" : "12ms / 340e"}</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 3: Suricata */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.suricata 
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 animate-pulse" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">Suricata IDS</p>
              <div className={cn("h-1 w-full rounded", simulatedFailures.suricata ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[8px] opacity-80">{simulatedFailures.suricata ? "OFFLINE" : "18ms / 12e"}</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 4: Filebeat */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.zeek && simulatedFailures.suricata 
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">Filebeat</p>
              <div className="h-1 w-full bg-emerald-500 rounded" />
              <p className="text-[8px] opacity-80">98% Flow</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 5: AWS SQS Buffer */}
          <div className="flex items-center">
            <div className={cn(
              "w-28 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.sqsOverflow 
                ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500 animate-pulse" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">AWS SQS FIFO</p>
              <div className={cn("h-1 w-full rounded", simulatedFailures.sqsOverflow ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[8px] opacity-80">{simulatedFailures.sqsOverflow ? "OVERFLOW" : "45ms | 1120 Q"}</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 6: Feature Router */}
          <div className="flex items-center">
            <div className="w-24 p-2 rounded-lg border border-slate-205 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/10 font-mono text-center space-y-1 hover:scale-105 transition-transform text-slate-600 dark:text-slate-300">
              <p className="text-[9px] font-black uppercase">Router</p>
              <div className="h-1 w-full bg-cyan-500 rounded" />
              <p className="text-[8px] opacity-80">Active Demux</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 7: AI Engines Composite */}
          <div className="flex items-center">
            <div className={cn(
              "w-36 p-1.5 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.ai1 || simulatedFailures.ai2a || simulatedFailures.ai2b 
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400" 
                : "bg-indigo-50 dark:bg-indigo-950/10 border-indigo-250 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400"
            )}>
              <p className="text-[8px] font-black uppercase text-indigo-650 dark:text-indigo-300">Models (AI1, 2A, 2B)</p>
              <div className="grid grid-cols-3 gap-0.5 text-[7px] font-sans pb-1">
                <span className={cn("rounded px-0.5 block", simulatedFailures.ai1 ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-405 text-red-405" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")}>AI1</span>
                <span className={cn("rounded px-0.5 block", simulatedFailures.ai2a ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-405 text-red-405" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")}>2A</span>
                <span className={cn("rounded px-0.5 block", simulatedFailures.ai2b ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-405 text-red-405" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")}>2B</span>
              </div>
              <p className="text-[8px] opacity-80">Avg Inference: 65ms</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 8: Fusion Layer */}
          <div className="flex items-center">
            <div className="w-24 p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 font-mono text-center space-y-1 hover:scale-105 transition-transform">
              <p className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-300">Fusion Sys</p>
              <div className="h-1 w-full bg-indigo-500 rounded" />
              <p className="text-[8px] text-indigo-600 dark:text-indigo-300">MITRE Sync</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 9: PostgreSQL */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.database 
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 animate-pulse" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">Postgres DB</p>
              <div className={cn("h-1 w-full rounded", simulatedFailures.database ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[8px] opacity-80">{simulatedFailures.database ? "CORRUPTED" : "8ms / Pools"}</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 10: WebSocket */}
          <div className="flex items-center">
            <div className={cn(
              "w-24 p-2 rounded-lg border font-mono text-center space-y-1 hover:scale-105 transition-transform",
              simulatedFailures.websocket 
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-650 dark:text-red-500 animate-pulse" 
                : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            )}>
              <p className="text-[9px] font-black uppercase">WebSockets</p>
              <div className={cn("h-1 w-full rounded", simulatedFailures.websocket ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[8px] opacity-80">{simulatedFailures.websocket ? "OFFLINE" : "Active"}</p>
            </div>
            <div className="w-6 border-t-2 border-dashed border-slate-400 dark:border-slate-800" />
          </div>

          {/* Stage 11: Realtime Dashboard Screen */}
          <div className="w-24 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/10 font-mono text-center space-y-1 text-slate-600 dark:text-slate-300">
            <p className="text-[9px] font-black uppercase">FC Dashboard</p>
            <div className="h-1 w-full bg-emerald-500 rounded" />
            <p className="text-[8px] opacity-80">Rendered (Static)</p>
          </div>

        </div>
      </div>
    </div>
  );
}
