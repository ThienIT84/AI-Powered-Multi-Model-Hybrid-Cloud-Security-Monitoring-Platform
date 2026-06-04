import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { HardDrive } from "lucide-react";
import { cn } from "../../lib/utils";

interface SqsHistoryItem {
  time: string;
  depth: number;
  throughput: number;
}

interface SqsBufferMonitoringProps {
  isDarkMode: boolean;
  simulatedFailures: Record<string, boolean>;
  sqsHistory: SqsHistoryItem[];
}

export function SqsBufferMonitoring({ isDarkMode, simulatedFailures, sqsHistory }: SqsBufferMonitoringProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-border/60 mb-4">
        <div className="flex items-center gap-1.5">
          <HardDrive size={13} className="text-cyan-400" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">AWS SQS Buffering Monitor (FIFO Queue)</h3>
        </div>
        <span className="text-[8px] tracking-widest text-[#94a3b8] font-bold">Inbound Queuing Channel</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3 text-[9px]">
        <div className="p-2.5 bg-muted/65 dark:bg-slate-950/40 rounded border border-border dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-400 block mb-0.5 uppercase text-[7.5px]">Queue Depth</p>
          <span className={cn(
            "font-black text-xs block",
            simulatedFailures.sqsOverflow ? "text-red-500 animate-pulse" : "text-slate-800 dark:text-white"
          )}>
            {simulatedFailures.sqsOverflow ? "8,521" : "1,120"} msgs
          </span>
        </div>
        
        <div className="p-2.5 bg-muted/65 dark:bg-slate-950/40 rounded border border-border dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-400 block mb-0.5 uppercase text-[7.5px]">In Flight</p>
          <span className="font-black text-xs text-cyan-600 dark:text-cyan-400 block">320 msgs</span>
        </div>

        <div className="p-2.5 bg-muted/65 dark:bg-slate-950/40 rounded border border-border dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-400 block mb-0.5 uppercase text-[7.5px]">Rate / Sec</p>
          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 block">
            {simulatedFailures.sqsOverflow ? "12 / s" : "248 / s"}
          </span>
        </div>
      </div>

      {/* Micro simple spark charts */}
      <div className="h-22.5 w-full text-[8px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sqsHistory}>
            <Area type="monotone" name="Queue Depth" dataKey="depth" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.06} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
