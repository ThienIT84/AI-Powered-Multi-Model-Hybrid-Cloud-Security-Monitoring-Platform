import React from "react";
import { 
  ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { LAB_VS_PUBLIC_DATASET } from "./reportsMockData";

export function DatasetTrainingTab() {
  return (
    <div className="space-y-6 animate-fadeIn" id="dataset-training-view">
      
      {/* Benchmark comparison layout */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded font-mono text-[8px] font-black uppercase">
              Benchmark validation datasets (UNSW-NB15 / CSE-CIC-IDS2018)
            </span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block mt-1">
              Performance disparity in lab vs wild public benchmark datasets
            </h3>
          </div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-[#38bdf8] font-bold text-right">
            Active benchmark validation state
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9.5px]">
          
          <div className="lg:col-span-8 space-y-2">
            <span className="text-[9px] uppercase font-black text-slate-505 dark:text-slate-400 tracking-widest block pb-1 border-b border-border dark:border-slate-900">Lab validation metrics vs public benchmark drift comparison</span>
            <div className="h-56 w-full text-slate-500 dark:text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LAB_VS_PUBLIC_DATASET}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="metric" stroke="currentColor" fontSize={9} fontWeight="bold" />
                  <YAxis stroke="currentColor" fontSize={10} fontWeight="bold" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="rect"
                    iconSize={10}
                    formatter={(value) => <span className="text-[8.5px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">{value === "lab" ? "Lab Grounding (F1)" : "Public-Drift (Recall)"}</span>}
                  />
                  <Bar dataKey="lab" fill="#10b981" radius={[4, 4, 0, 0]} name="Lab Grounding" />
                  <Bar dataKey="public" fill="#ef4444" radius={[4, 4, 0, 0]} name="Public-Drift" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4.5 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block border-b border-border dark:border-slate-850 pb-2 bg-clip-text">Dataset grounding status</span>
              
              <div className="space-y-3 uppercase font-extrabold text-[8.5px] text-slate-700 dark:text-slate-350 leading-tight">
                <div>
                  <span className="text-slate-900 dark:text-white block font-black">UNSW-NB15 Grounding</span>
                  <p className="text-[8px] text-slate-500 mt-1">Validated across 350,000 synthesized flows. Accuracy stable at 98.4%.</p>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white block font-black">CSE-CIC-IDS2018 Grounding</span>
                  <p className="text-[8px] text-slate-500 mt-1">Validated across 1.2-million raw HTTP scan entries. Zero FALSE-POSITIVE drift reported.</p>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white block font-black">Public-Drift Mitigation</span>
                  <p className="text-[8px] text-slate-500 mt-1">Auto-grounding consensus layer adjusts weights on-the-fly to limit drift error index below 0.05.</p>
                </div>
              </div>
            </div>

            <div className="text-[8px] uppercase font-bold text-slate-500 border-t border-border dark:border-slate-850 pt-3 block text-right">
              Validated on NVIDIA H100 Tensor cores
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
