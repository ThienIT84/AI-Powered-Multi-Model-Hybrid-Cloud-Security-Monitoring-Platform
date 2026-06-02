import React, { useState, useEffect } from "react";
import { Database, TrendingUp, Sparkles, Filter, Archive } from "lucide-react";
import { cn } from "../../lib/utils";

export function DatasetGrowthPanel() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const connSize = 1248900 + ticks * 4;
  const httpSize = 845200 + ticks * 2;
  const attackSamples = 428010 + ticks * 3;
  const normalSamples = 1666090 + ticks * 3;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none h-fit self-start">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Database className="w-4 h-4 text-cyan-500 animate-pulse" />
          SECTION 32: FCAJ TELEMETRY DATASET GROWTH COMPILATION STATUS
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          AGGREGATOR ON
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        
        {/* Core Size Stats Tab */}
        <div className="space-y-3">
          <div className="bg-secondary/40 border border-border p-3 rounded-lg leading-relaxed">
            <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">CONN_DATASET TOTAL SEGMENTS</span>
            <span className="text-foreground text-lg font-black">{connSize.toLocaleString()} rows</span>
            <div className="text-[7px] text-cyan-400 mt-1 uppercase font-semibold">Active telemetry storage pool</div>
          </div>
          <div className="bg-secondary/40 border border-border p-3 rounded-lg leading-relaxed">
             <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">HTTP_DATASET RAW LOGS</span>
             <span className="text-foreground text-lg font-black">{httpSize.toLocaleString()} rows</span>
             <div className="text-[7px] text-cyan-400 mt-1 uppercase font-semibold">HTTP parsing cluster index</div>
          </div>
        </div>

        {/* Growth Statistics Block */}
        <div className="bg-secondary/15 border border-border rounded-xl p-3 flex flex-col justify-start space-y-3">
          <div className="text-[8px] font-black text-muted-foreground uppercase mb-2 border-b border-border/10 pb-1 flex justify-between">
            <span>PERIODIC LOG REVENUE RATE</span>
            <span className="text-cyan-400 flex items-center gap-0.5"><TrendingUp size={9} /> Live</span>
          </div>

          <div className="space-y-2 text-[8.5px] leading-tight">
            <div className="flex items-center justify-between border-b border-border/5 pb-1">
              <span className="text-muted-foreground font-semibold">DAILY AVERAGE LOG REVENUE:</span>
              <span className="text-foreground font-extrabold">+18,482 records</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/5 pb-1">
              <span className="text-muted-foreground font-semibold">WEEKLY ACCUMULATION RATE:</span>
              <span className="text-foreground font-extrabold">+129,374 records</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/5 pb-1">
              <span className="text-muted-foreground font-semibold">MONTHLY ACCUMULATION RATE:</span>
              <span className="text-foreground font-extrabold">+554,290 records</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">NEW DISCOVERED LABELS:</span>
              <span className="text-cyan-400 font-extrabold">+14 Distinct Vectors</span>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-auto font-black uppercase text-center">
             Synchronized with local storage database
          </div>
        </div>

        {/* Samples Distribution Block */}
        <div className="bg-secondary/15 border border-border rounded-xl p-3 flex flex-col justify-start space-y-3">
          <div className="text-[8px] font-black text-muted-foreground uppercase mb-2.5 border-b border-border/10 pb-1">
            DATASET SECTOR CLASSIFICATION PERCENT MIX
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-mono leading-none">
                <span className="text-rose-400 font-bold">ATTACK RECORDS:</span>
                <span className="text-foreground font-extrabold">{attackSamples.toLocaleString()} (20.4%)</span>
              </div>
              <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: "20.4%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-mono leading-none">
                <span className="text-emerald-400 font-bold">NORMAL STREAMS:</span>
                <span className="text-foreground font-extrabold">{normalSamples.toLocaleString()} (79.6%)</span>
              </div>
              <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: "79.6%" }} />
              </div>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-auto font-black uppercase flex items-center justify-between">
            <span>FCAJ CLUSTER RATIO</span>
            <span className="text-cyan-400">NORMAL STABLE</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DatasetGrowthPanel;
