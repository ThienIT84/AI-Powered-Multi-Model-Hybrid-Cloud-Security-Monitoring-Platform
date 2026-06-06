import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { GraphColors } from "./types";
import {
  anomalyTimeline,
  anomalyScoreDistribution,
  anomalousServices
} from "./constants";

export interface ModelAnomalyTabProps {
  liveNormalFlows: number;
  liveAnomalyFlows: number;
  graphColors: GraphColors;
}

export function ModelAnomalyTab({
  liveNormalFlows,
  liveAnomalyFlows,
  graphColors
}: ModelAnomalyTabProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase">
            AI1: Network Anomaly Engine (Isolation Forest)
          </h3>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide mt-1">
            Anomalous stream rate &amp; duration timeline analyses on conn.log
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
            Total Inferences: 52,347
          </span>
        </div>
      </div>

      {/* Stats metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border/60">
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">Normal Flows</span>
          <span className="text-md sm:text-lg font-black text-slate-805 dark:text-zinc-105">{liveNormalFlows.toLocaleString()}</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">Anomaly Flows</span>
          <span className="text-md sm:text-lg font-black text-red-500">{liveAnomalyFlows.toLocaleString()}</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">Avg Anomaly Score</span>
          <span className="text-md sm:text-lg font-black text-amber-500">0.34</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">Detection Rate</span>
          <span className="text-md sm:text-lg font-black text-cyan-500 font-mono">9.6%</span>
        </div>
      </div>

      {/* Layout for anomaly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Chart 1: Timeline */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
            Anomaly Timeline (Last 24h)
          </span>
          <div className="h-44 border border-border/60 rounded-lg p-2 bg-background">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyTimeline} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={graphColors.grid} />
                <XAxis dataKey="hour" stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <YAxis stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                  itemStyle={{ color: graphColors.tooltipText }}
                  labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="anomalies" stroke={graphColors.cyan} fill={`${graphColors.cyan}1A`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribution Histogram */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
            Anomaly Score Distribution Count
          </span>
          <div className="h-44 border border-border/60 rounded-lg p-2 bg-background">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyScoreDistribution} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={graphColors.grid} />
                <XAxis dataKey="score" stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <YAxis stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                  itemStyle={{ color: graphColors.tooltipText }}
                  labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                />
                <Bar dataKey="count" fill={graphColors.emerald} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Anomalous services */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
            Top Anomalous Services
          </span>
          <div className="h-44 border border-border/60 rounded-lg p-2 bg-background">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalousServices} layout="vertical" margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={graphColors.grid} />
                <XAxis type="number" stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <YAxis dataKey="service" type="category" stroke={graphColors.text} tick={{ fontSize: 7.5, fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                  itemStyle={{ color: graphColors.tooltipText }}
                  labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                />
                <Bar dataKey="anomalies" fill={graphColors.amber} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
