import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { GraphColors } from "./types";
import { getAi2bDistribution } from "./constants";

export interface ModelSemanticTabProps {
  graphColors: GraphColors;
}

export function ModelSemanticTab({ graphColors }: ModelSemanticTabProps) {
  const ai2bDistribution = getAi2bDistribution(graphColors);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase">
            AI2B: HTTP Semantic Query String Detector (XGBoost)
          </h3>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide mt-1">
            Evaluates entropy levels, parameter lengths, and token presence ratios on http.log
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">
            Analyzed Pages: 31,023 HTTP Requests
          </span>
        </div>
      </div>

      {/* Stats card indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border/60">
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase">HTTP Requests</span>
          <span className="text-md sm:text-lg font-extrabold text-slate-800 dark:text-zinc-100">31,023 URI</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase">XSS Classified</span>
          <span className="text-md sm:text-lg font-extrabold text-rose-500">1,120 Alerts</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase">SQLi Classified</span>
          <span className="text-md sm:text-lg font-extrabold text-cyan-500 dark:text-cyan-300">842 Alerts</span>
        </div>
        <div className="font-mono text-center sm:text-left">
          <span className="text-[8px] text-muted-foreground block uppercase">Average Confidence</span>
          <span className="text-md sm:text-lg font-extrabold text-emerald-500">93.8% score</span>
        </div>
      </div>

      {/* Distribution & Indicators table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 leading-normal">
        
        {/* Visual donut */}
        <div className="lg:col-span-4 border border-border/60 rounded-xl p-3 bg-background flex flex-col justify-between">
          <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
            HTTP Payload Categorization Donut
          </span>
          
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ai2bDistribution}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ai2bDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-black tracking-widest text-[#00f0ff]">31K</span>
              <span className="text-[7.5px] text-muted-foreground font-mono uppercase">Queries</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 text-[8px] text-muted-foreground font-mono">
            {ai2bDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HTTP Top indicators semantic table */}
        <div className="lg:col-span-8 border border-border/60 rounded-xl p-3 bg-background space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
              AI2B Top Feature Indicators Activation Coefficients
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[8.5px] leading-relaxed border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[7px] font-black tracking-widest">
                    <th className="py-2">Indicator Field</th>
                    <th className="py-2">Semantic Description Matrix</th>
                    <th className="py-2 text-right">Coefficient Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr>
                    <td className="py-2 font-black text-rose-500">has_script</td>
                    <td className="py-2 text-muted-foreground">Checks regex matches or tokens for javascript scripts / tags</td>
                    <td className="py-2 text-right font-black text-foreground">3.82</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black text-orange-400">has_alert</td>
                    <td className="py-2 text-muted-foreground">Scans URI for browser alert/document token hooks</td>
                    <td className="py-2 text-right font-black text-foreground">3.45</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black text-cyan-500">has_sql_keyword</td>
                    <td className="py-2 text-zinc-500">Matches SQL language parameters like UNION, SELECT, DROP, etc.</td>
                    <td className="py-2 text-right font-black text-foreground">3.24</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black text-amber-500">encoded_char_ratio</td>
                    <td className="py-2 text-muted-foreground">Calculates ratios of encoded variables in parameter queries</td>
                    <td className="py-2 text-right font-black text-foreground">1.94</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black text-violet-500">entropy</td>
                    <td className="py-2 text-muted-foreground">Measures character entropy values of strings to spot packing/binaries</td>
                    <td className="py-2 text-right font-black text-foreground">1.22</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[7.5px] text-muted-foreground uppercase tracking-wider font-mono">
            * Parameters derived on GPU preprocessing layer directly inside the http parser loop before prediction.
          </p>
        </div>

      </div>
    </div>
  );
}
