import React, { useState, useMemo, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

export function AttackTrendChart() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const trendData = useMemo(() => {
    // Generate logical mockup trends for each historical range
    const length = range === "7d" ? 7 : range === "30d" ? 15 : 20;
    return Array.from({ length }, (_, i) => {
      const idx = i + 1;
      const baseHour = range === "7d" ? `Day ${idx}` : range === "30d" ? `Wk ${Math.ceil(idx / 3)}` : `Month ${Math.ceil(idx / 5)}`;
      return {
        name: baseHour,
        critical: 4 + Math.max(0, Math.floor(Math.sin(idx / 2) * 3)),
        general: 12 + Math.max(0, Math.floor(Math.cos(idx / 1.5) * 7)),
        totalRate: 16 + Math.max(0, Math.floor(Math.cos(idx) * 9))
      };
    });
  }, [range]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-[0.15em]">
            ATTACK TREND ANALYTICS
          </h3>
        </div>

        {/* Historical comparison selector */}
        <div className="flex bg-muted border border-border/80 p-0.5 rounded-lg">
          {(["7d", "30d", "90d"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={cn(
                "px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded cursor-pointer transition-all",
                range === opt 
                  ? "bg-cyan-500 text-white shadow-xs" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"} vertical={false} />
            <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground/50 font-mono text-[7px]" tick={{ fontSize: 8, fontWeight: "bold" }} />
            <YAxis stroke="currentColor" className="text-muted-foreground/50 font-mono text-[7px]" tick={{ fontSize: 8, fontWeight: "bold" }} axisLine={false} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? "#0d1117" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
              }}
              labelStyle={{ fontSize: "9px", fontFamily: "monospace", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}
              itemStyle={{ fontSize: "10px", margin: 0, padding: "2px 0", fontWeight: "bold" }}
            />
            
            <Line 
              type="monotone" 
              dataKey="critical" 
              name="Critical Alerts" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />

            <Line 
              type="monotone" 
              dataKey="general" 
              name="General Threats" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />

            <Line 
              type="monotone" 
              dataKey="totalRate" 
              name="Aggregate Overflows" 
              stroke="#06b6d4" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-extrabold text-muted-foreground uppercase opacity-80 shrink-0 font-mono">
        <span className="flex items-center gap-1">
          <Clock size={10} className="text-cyan-600 dark:text-cyan-400" />
          ESTIMATED ESCALATIONS: 4.8%
        </span>
        <span>HISTORICAL COMPARISON GRAPH</span>
      </div>
    </div>
  );
}

export default AttackTrendChart;
