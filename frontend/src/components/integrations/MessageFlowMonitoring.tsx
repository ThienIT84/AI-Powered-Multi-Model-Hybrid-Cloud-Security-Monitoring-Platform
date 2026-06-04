import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from "recharts";
import { Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChartHistoryItem {
  label: string;
  received: number;
  processed: number;
  failed: number;
  queued: number;
  dropped: number;
}

interface MessageFlowMonitoringProps {
  chartHistory: ChartHistoryItem[];
  isDarkMode: boolean;
}

export function MessageFlowMonitoring({ chartHistory, isDarkMode }: MessageFlowMonitoringProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-border/60 gap-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-wider">WebSocket Flow Streams Monitoring</h3>
        </div>
        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Realtime Ingest Chart (Updates every 3s)</span>
      </div>

      <div className="h-55 w-full text-[9px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartHistory}>
            <defs>
              <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#888" tickLine={false} />
            <YAxis stroke="#888" tickLine={false} />
            <RechartsTooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-2.5 rounded-lg border border-border bg-card font-mono text-[9px] shadow-lg space-y-1.5 text-foreground">
                      <p className="font-black border-b border-border pb-1 mb-1.5 text-foreground uppercase tracking-wider">
                        Time: {label}
                      </p>
                      <div className="space-y-1">
                        {payload.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span 
                                className="w-2 h-2 rounded-sm" 
                                style={{ backgroundColor: item.stroke || item.color }} 
                              />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-black text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" name="Inbound Received" dataKey="received" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRec)" strokeWidth={1.5} />
            <Area type="monotone" name="Successfully Processed" dataKey="processed" stroke="#10b981" fillOpacity={1} fill="url(#colorProc)" strokeWidth={1.5} />
            <Line type="monotone" name="Failed Frame Drops" dataKey="failed" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            <Line type="monotone" name="Buffer Queued" dataKey="queued" stroke="#f59e0b" strokeWidth={1} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-4 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 justify-center flex-wrap">
        <div className="flex items-center gap-1.5 text-[9px] uppercase">
          <span className="w-2 h-2 rounded bg-blue-500" />
          <span className="text-slate-400">Received Flows</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase">
          <span className="w-2 h-2 rounded bg-emerald-500" />
          <span className="text-slate-400">Processed Ok</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase">
          <span className="w-2 h-2 rounded bg-red-500" />
          <span className="text-slate-400">Failures</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase">
          <span className="w-2 h-2 rounded bg-amber-500" />
          <span className="text-slate-400">SQS Wait Buffer</span>
        </div>
      </div>
    </div>
  );
}
