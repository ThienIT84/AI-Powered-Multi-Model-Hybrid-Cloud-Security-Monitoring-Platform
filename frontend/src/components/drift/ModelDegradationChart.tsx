import React from "react";
import { PERFORMANCE_TIMELINE } from "./driftConfig";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { AlertCircle, TrendingDown, RefreshCcw } from "lucide-react";

export function ModelDegradationChart() {
  // Format numbers to percent for chart tooltip readability
  const formattedTimeline = PERFORMANCE_TIMELINE.map(item => ({
    ...item,
    ai1AccuracyPct: Math.round(item.ai1Accuracy * 100),
    ai2aAccuracyPct: Math.round(item.ai2aAccuracy * 100),
    ai2bAccuracyPct: Math.round(item.ai2bAccuracy * 100),
    fprPct: (item.falsePositiveRate * 100).toFixed(1),
  }));

  return (
    <div className="space-y-4">
      {/* Target Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            LONGITUDINAL ACCURACY DRIFT DEGRADATION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Accuracy decay over time & False Positive tracking
          </span>
        </div>

        <div className="flex items-center gap-2 bg-red-500/3 border border-red-500/20 px-2 py-1 rounded-lg">
          <TrendingDown size={12} className="text-red-500 animate-bounce" />
          <span className="text-[7.5px] font-black uppercase text-red-400">AI2B Degradation warning: -5.9% F1</span>
        </div>
      </div>

      {/* Degradation Line Chart */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-3.5">
        <div className="h-52.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedTimeline}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
              <XAxis 
                dataKey="epoch" 
                stroke="var(--muted-foreground)" 
                fontSize={8} 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={8} 
                tickLine={false}
                axisLine={false}
                domain={[80, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  borderColor: "var(--border)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: "8px"
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={24}
                iconType="circle"
                wrapperStyle={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}
              />
              <Line 
                name="AI1 Anomaly Accuracy" 
                type="monotone" 
                dataKey="ai1AccuracyPct" 
                stroke="rgb(16, 185, 129)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                name="AI2A Flow Accuracy" 
                type="monotone" 
                dataKey="ai2aAccuracyPct" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                name="AI2B Web accuracy (DRIVING)" 
                type="monotone" 
                dataKey="ai2bAccuracyPct" 
                stroke="rgb(168, 85, 247)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Action item insights with drift rationale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-border/40 select-none">
          <div className="bg-red-500/1 border border-red-500/10 p-2.5 rounded-lg flex items-start gap-2 leading-none">
            <AlertCircle size={13} className="text-red-500 shrink-0 mt-px" />
            <div className="space-y-1">
              <span className="text-[7.5px] font-black text-red-400 uppercase tracking-wider block">TRAINING DATA DISCREPANCY</span>
              <p className="text-[7.5px] text-muted-foreground leading-normal">
                AI2B has degraded following a regional shift in HTTP payloads due to updated proxy gateways. Re-indexing payload templates is suggested.
              </p>
            </div>
          </div>

          <div className="bg-cyan-500/1 border border-cyan-500/10 p-2.5 rounded-lg flex items-start gap-2 leading-none">
            <RefreshCcw size={13} className="text-cyan-500 shrink-0 mt-px" />
            <div className="space-y-1">
              <span className="text-[7.5px] font-black text-cyan-400 uppercase tracking-wider block">TRIGGER FEDERATED RE-TRAIN</span>
              <p className="text-[7.5px] text-muted-foreground leading-normal">
                SOC operators can schedule background weights synthesis to run federated learning nodes on the current local edge buffer logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
