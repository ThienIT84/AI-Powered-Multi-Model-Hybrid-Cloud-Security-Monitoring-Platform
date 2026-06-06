import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis
} from "recharts";
import { Binary } from "lucide-react";
import { GraphColors } from "./types";
import { fusionSources, ai2aSHAP, ai2bSHAP } from "./constants";

export interface FusionTabProps {
  graphColors: GraphColors;
}

export function FusionTab({ graphColors }: FusionTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* BAYESIAN FUSION DATA BLOCK */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase">
              Multi-Sensor Bayesian Fusion Layer Consensus Section
            </h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide mt-1">
              Weighs prediction probabilities from AI1, AI2A, and AI2B alongside Suricata alerts to construct a final alert consensus
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
              Consensus Decisions: 5,412 Events
            </span>
          </div>
        </div>

        {/* Mini counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border/60">
          <div className="font-mono">
            <span className="text-[8px] text-muted-foreground block uppercase">Fusion Decisions</span>
            <span className="text-md sm:text-lg font-black text-slate-805 dark:text-zinc-150">5,412 Outcomes</span>
          </div>
          <div className="font-mono">
            <span className="text-[8px] text-muted-foreground block uppercase">Critical Alerts</span>
            <span className="text-md sm:text-lg font-black text-red-500">1,104 Incidents</span>
          </div>
          <div className="font-mono">
            <span className="text-[8px] text-muted-foreground block uppercase">Average Risk Index</span>
            <span className="text-md sm:text-lg font-black text-amber-500">72.4% Probability</span>
          </div>
          <div className="font-mono">
            <span className="text-[8px] text-muted-foreground block uppercase">Average Consensus Confidence</span>
            <span className="text-md sm:text-lg font-black text-cyan-500">94.2% Rate</span>
          </div>
        </div>

        {/* Fusion Layer Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-sans">
          
          {/* 1. Risk distribution donut */}
          <div className="border border-border/60 rounded-xl p-4 bg-background space-y-3">
            <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
              Consequent Alert Severity Risk Distribution (Fusion Layer)
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 h-40 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Critical", value: 32, color: graphColors.red },
                        { name: "High", value: 41, color: graphColors.amber },
                        { name: "Medium", value: 20, color: graphColors.cyan },
                        { name: "Low", value: 7, color: graphColors.emerald }
                      ]}
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill={graphColors.red} />
                      <Cell fill={graphColors.amber} />
                      <Cell fill={graphColors.cyan} />
                      <Cell fill={graphColors.emerald} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[13px] font-black text-red-500">72.4%</span>
                  <span className="text-[7.5px] text-muted-foreground font-mono uppercase">Risk average</span>
                </div>
              </div>

              <div className="sm:col-span-5 space-y-2 font-mono text-[8.5px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-red-500 uppercase font-black">Critical:</span>
                  <span className="font-bold text-foreground">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 uppercase font-black">High:</span>
                  <span className="font-bold text-foreground">41%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 uppercase font-black">Medium:</span>
                  <span className="font-bold text-foreground">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-500 uppercase font-black">Low:</span>
                  <span className="font-bold text-foreground">7%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Stacked Bar Chart of Decision triggers */}
          <div className="border border-border/60 rounded-xl p-4 bg-background space-y-3">
            <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
              Telemetry Trigger Sources Distribution
            </span>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fusionSources} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={graphColors.grid} />
                  <XAxis type="number" stroke={graphColors.text} tick={{ fontSize: 7, fontFamily: "monospace" }} />
                  <YAxis dataKey="name" type="category" stroke={graphColors.text} tick={{ fontSize: 7, fontFamily: "monospace" }} width={120} />
                  <Tooltip 
                    contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                    itemStyle={{ color: graphColors.tooltipText }}
                    labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                  />
                  <Bar dataKey="count" fill={graphColors.violet} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* 10. EXPLAINABILITY SECTION */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Binary className="text-amber-500" size={16} />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              AI Explainability (SHAP / Feature Importances Matrix)
            </h3>
          </div>
          <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-2 py-0.5 rounded uppercase">
            Global Shapley values
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* SHAP left: Network attributes */}
          <div className="border border-border/60 rounded-lg p-3 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
            <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest block">
              AI2A Traffic Classifier Feature Importances
            </span>
            <div className="space-y-2">
              {ai2aSHAP.map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono">
                    <span className="font-bold uppercase text-foreground/80">{f.feature}</span>
                    <span className="text-zinc-500">Weight: +{f.weight}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${f.weight * 250}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHAP right: HTTP variables */}
          <div className="border border-border/60 rounded-lg p-3 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
            <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest block">
              AI2B HTTP Semantic Feature Importances
            </span>
            <div className="space-y-2">
              {ai2bSHAP.map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono">
                    <span className="font-bold uppercase text-foreground/80">{f.feature}</span>
                    <span className="text-zinc-500">Weight: +{f.weight}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${f.weight * 200}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
