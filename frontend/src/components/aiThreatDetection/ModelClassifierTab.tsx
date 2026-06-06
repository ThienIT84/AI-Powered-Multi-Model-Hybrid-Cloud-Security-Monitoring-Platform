import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis
} from "recharts";
import { GraphColors } from "./types";
import {
  getAi2aDistribution,
  ai2aConfidenceDist,
  labelsList,
  matrixData
} from "./constants";

export interface ModelClassifierTabProps {
  graphColors: GraphColors;
}

export function ModelClassifierTab({ graphColors }: ModelClassifierTabProps) {
  const ai2aDistribution = getAi2aDistribution(graphColors);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase">
            AI2A: Network Attack Multi-Classifier Overview (XGBoost)
          </h3>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide mt-1">
            Multi-class vector classifier matching anomalous traffic to core threat profiles (Port Scan, DoS, Botnet, Brute Force)
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
            Total Predictions: 49,112
          </span>
        </div>
      </div>

      {/* Stats card indicators */}
      <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border/60">
        <div className="font-mono">
          <span className="text-[8px] text-muted-foreground block uppercase">Total Classified</span>
          <span className="text-sm font-black text-slate-800 dark:text-zinc-105">49,112 Calls</span>
        </div>
        <div className="font-mono">
          <span className="text-[8px] text-muted-foreground block uppercase">Average Confidence</span>
          <span className="text-sm font-black text-emerald-500">91.4% Rate</span>
        </div>
        <div className="font-mono">
          <span className="text-[8px] text-muted-foreground block uppercase">Classification Accuracy</span>
          <span className="text-sm font-black text-cyan-510 dark:text-cyan-310 font-mono">96.84% Overall</span>
        </div>
      </div>

      {/* Classification dashboard layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* 1. Attack distribution pie */}
        <div className="lg:col-span-4 border border-border/60 rounded-xl p-3 bg-background space-y-2 flex flex-col justify-between">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
            Predicted Threat Label Ratio
          </span>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ai2aDistribution}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ai2aDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                  itemStyle={{ color: graphColors.tooltipText }}
                  labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                  formatter={(value) => `${Number(value).toLocaleString()} samples`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] font-black tracking-tighter">49K</span>
              <span className="text-[7.5px] text-muted-foreground font-mono uppercase">Vectors</span>
            </div>
          </div>
          
          {/* Legend list */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 text-[8px] font-mono text-muted-foreground">
            {ai2aDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name} ({entry.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Confidence histogram */}
        <div className="lg:col-span-4 border border-border/60 rounded-xl p-3 bg-background space-y-2 flex flex-col justify-between">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
            Prediction Confidence Distribution
          </span>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ai2aConfidenceDist} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={graphColors.grid} />
                <XAxis dataKey="bucket" stroke={graphColors.text} tick={{ fontSize: 7, fontFamily: "monospace" }} />
                <YAxis stroke={graphColors.text} tick={{ fontSize: 7, fontFamily: "monospace" }} />
                <Tooltip 
                  contentStyle={{ fontSize: "7.5px", fontFamily: "monospace", backgroundColor: graphColors.tooltipBg, borderColor: graphColors.tooltipBorder, color: graphColors.tooltipText, borderRadius: "6px" }}
                  itemStyle={{ color: graphColors.tooltipText }}
                  labelStyle={{ color: graphColors.tooltipText, fontWeight: "bold" }}
                />
                <Bar dataKey="count" fill={graphColors.cyan} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Confusion matrix (glorious grid!) */}
        <div className="lg:col-span-4 border border-border/60 rounded-xl p-3 bg-background flex flex-col justify-between">
          <div>
            <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block mb-2">
              XGBoost Model Matrix (%)
            </span>
            <div className="space-y-1">
              
              {/* Matrix headers */}
              <div className="grid grid-cols-6 gap-1 text-[7px] font-mono text-center text-muted-foreground uppercase font-black tracking-widest pb-1 border-b border-border/50">
                <div>True \ Pred</div>
                {labelsList.map((lbl) => (
                  <div key={lbl} className="truncate">{lbl}</div>
                ))}
              </div>

              {/* Rows */}
              {labelsList.map((trueLbl, rIdx) => (
                <div key={trueLbl} className="grid grid-cols-6 gap-1 items-center">
                  <div className="text-[7.5px] font-mono text-left font-black text-muted-foreground truncate">{trueLbl}</div>
                  {matrixData[rIdx].map((val, cIdx) => (
                    <div
                      key={cIdx} 
                      className="text-[8px] font-mono font-black text-center py-2.5 rounded transition-all"
                      style={{
                        color: val > 90 ? "#22c55e" : val > 1 ? "#ef4444" : "rgba(148, 163, 184, 0.4)",
                        backgroundColor: val > 90 
                          ? "rgba(34, 197, 94, 0.1)" 
                          : val > 1.5 
                          ? "rgba(239, 68, 68, 0.12)" 
                          : "transparent",
                        border: val > 90 ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid transparent"
                      }}
                      title={`True: ${trueLbl}, Predicted: ${labelsList[cIdx]} => ${val}%`}
                    >
                      {val}%
                    </div>
                  ))}
                </div>
              ))}

            </div>
          </div>
          <p className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-wider mt-2 pt-2 border-t border-border/50">
            Matrix displays average model validation benchmarks across the test split.
          </p>
        </div>

      </div>
    </div>
  );
}
