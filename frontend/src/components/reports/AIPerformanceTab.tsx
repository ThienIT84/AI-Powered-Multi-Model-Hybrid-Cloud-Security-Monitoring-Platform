import React from "react";
import { 
  ResponsiveContainer, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { Brain, Cpu, Layers, Settings, Activity, RefreshCw } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";
import { 
  ANOMALY_SCORE_HISTOGRAM, 
  CONFUSION_MATRIX 
} from "./reportsMockData";

export function AIPerformanceTab() {
  return (
    <div className="space-y-6" id="ai-performance-view">
      
      {/* AI1: Network Anomaly */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded font-mono text-[8px] font-black uppercase">
              AI1 Network Anomaly Engine (Isolation Forest Pipeline)
            </span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block mt-1">
              Unsupervised Anomaly Score Density distribution
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono select-none">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">F1 Accuracy: 98.4%</span>
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">Isolation tree depth: 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-[9.5px]">
          
          {/* Histogram bar chart */}
          <div className="lg:col-span-2 space-y-2">
            <span className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest block">Anomaly Score histogram density index</span>
            <div className="h-56 w-full text-slate-500 dark:text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ANOMALY_SCORE_HISTOGRAM}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="scoreRange" stroke="currentColor" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="currentColor" fontSize={10} fontWeight="bold" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Log Count">
                    {ANOMALY_SCORE_HISTOGRAM.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model telemetry calibration */}
          <div className="space-y-3.5 bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4.5 rounded-xl font-mono text-[9.5px]">
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-wider block border-b border-border dark:border-slate-850 pb-2">Forest calibration metrics</span>
            
            <div className="space-y-2.5 uppercase leading-none">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[8px] font-bold block">Current threshold index</span>
                <span className="text-slate-800 dark:text-slate-205 text-xs font-black block mt-1">0.62 (Anomalous above)</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[8px] font-bold block">Contamination factor</span>
                <span className="text-slate-800 dark:text-slate-205 text-xs font-black block mt-1">0.035 (3.5% ratio expected)</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[8px] font-bold block">Active estimator states</span>
                <span className="text-slate-800 dark:text-slate-205 text-xs font-black block mt-1">100 Trees in Parallel</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[8px] font-bold block">Consensus verification</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 dark:bg-emerald-500 animate-ping" /> AUTO SYNC ACTIVE
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI2: Net Attack Classifier Confusion matrix */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded font-mono text-[8px] font-black uppercase">
              AI2 Network Attack Classifier (Convolutional Neural Net Pipeline)
            </span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block mt-1">
              Active Convolutional Classifier Confusion matrix (%)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono select-none">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">Model Batch size: 64</span>
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">Epoch state: 1250 (Full)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9.5px]">
          
          <div className="lg:col-span-8 space-y-3">
            <span className="text-[9px] uppercase font-black text-slate-505 dark:text-slate-400 tracking-widest block border-b border-border dark:border-slate-900 pb-1">Matrix representation grid percentages</span>
            
            <div className="overflow-x-auto select-none">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 uppercase font-black text-[8px] border-b border-border">
                    <th className="pb-3 text-left">ACTUAL \ PRED</th>
                    <th className="pb-3">NORMAL</th>
                    <th className="pb-3">PORT SCAN</th>
                    <th className="pb-3">DoS</th>
                    <th className="pb-3">BRUTE FORCE</th>
                    <th className="pb-3">BOTNET</th>
                  </tr>
                </thead>
                <tbody className="font-extrabold text-slate-800 dark:text-slate-200">
                  {CONFUSION_MATRIX.map((row, idx) => {
                    const cellColor = (val: number) => {
                      if (val > 90) return "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/35";
                      if (val > 1) return "bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-505 border border-rose-100 dark:border-rose-500/10";
                      return "bg-slate-100 dark:bg-slate-950/20 text-slate-550 dark:text-slate-600";
                    };
                    return (
                      <tr key={idx} className="border-b border-border dark:border-slate-900">
                        <td className="py-3 text-left text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[8.5px] tracking-wider">{row.actual}</td>
                        <td className={`py-4 ${cellColor(row.predNormal)}`}>{row.predNormal}%</td>
                        <td className={`py-4 ${cellColor(row.predPortScan)}`}>{row.predPortScan}%</td>
                        <td className={`py-4 ${cellColor(row.predDoS)}`}>{row.predDoS}%</td>
                        <td className={`py-4 ${cellColor(row.predBruteForce)}`}>{row.predBruteForce}%</td>
                        <td className={`py-4 ${cellColor(row.predBotnet)}`}>{row.predBotnet}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-fuchsia-500/5 border border-fuchsia-400/20 rounded-lg text-[9px] uppercase leading-relaxed text-slate-600 dark:text-slate-400 font-extrabold">
              Confusion indicators confirm zero critical overlap failures between DoS and Brute Force flows. Portscan sweep patterns register minor confusion with normal routes (1.2% false-positive density), satisfying strict SOC standards.
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4.5 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider block border-b border-border dark:border-slate-850 pb-2">Neural Net layers state</span>
              
              <div className="space-y-3 text-[9px] uppercase font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-purple-700 dark:text-[#c084fc] text-[9.5px]">Input Convolution Layer</p>
                    <p className="text-[8px] text-slate-500 mt-1">42 Features extracted from Zeek flows</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-purple-700 dark:text-[#c084fc] text-[9.5px]">Hidden Dense Feed-Forward layers</p>
                    <p className="text-[8px] text-slate-500 mt-1">3 Hidden Dense stacks (128 - 64 - 32 Neurons API)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 bg-[#1e1b4b] border border-[#3b0764] text-[#c084fc] dark:text-purple-400 rounded">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-[9.5px]">Softmax Classification Engine</p>
                    <p className="text-[8px] text-slate-500 mt-1">Provides final probabilistic attack output</p>
                  </div>
                </div>
              </div>
            </div>
 
            <div className="flex items-center justify-between border-t border-border dark:border-slate-850 pt-3 text-[8px] uppercase font-extrabold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-1 h-1 bg-emerald-500 rounded-full" /> WEIGHTS CONVERGED</span>
              <span>GPU core temp: 48°C</span>
            </div>
          </div>
 
        </div>
 
      </div>
 
      {/* Feature contribution (SHAP Explainability) */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-[#0284c7]/15 text-sky-600 dark:text-[#38bdf8] border border-[#0284c7]/20 rounded font-mono text-[8px] font-black uppercase">
              Explainable AI (SHAP Explainer Consensus Layer)
            </span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block mt-1">
              Active Feature Importance weights (Inference calculations)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono select-none">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">Background background base: 10,000</span>
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#090d16] border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8.5px] font-black uppercase">Kernel SHAP active</span>
          </div>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9.5px]">
          
          <div className="lg:col-span-8 space-y-2">
            <span className="text-[9px] uppercase font-black text-slate-505 dark:text-slate-400 tracking-widest block pb-1 border-b border-border dark:border-slate-900">SHAP absolute feature weights output values</span>
            <div className="h-56 w-full text-slate-500 dark:text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "orig_bytes", score: 0.88, fill: "#3b82f6" },
                  { name: "duration", score: 0.76, fill: "#06b6d4" },
                  { name: "resp_pkts", score: 0.65, fill: "#8b5cf6" },
                  { name: "orig_pkts", score: 0.54, fill: "#8b5cf6" },
                  { name: "resp_bytes", score: 0.49, fill: "#ec4899" },
                  { name: "orig_ip_bytes", score: 0.38, fill: "#f43f5e" },
                  { name: "resp_ip_bytes", score: 0.29, fill: "#f97316" },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="currentColor" fontSize={10} fontWeight="bold" />
                  <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={10} fontWeight="bold" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} name="SHAP Abs weight" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
 
          <div className="lg:col-span-4 bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-855 p-4.5 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-sky-600 dark:text-[#38bdf8] font-black uppercase tracking-wider block border-b border-border dark:border-slate-850 pb-2">Feature definitions glossary</span>
              
              <div className="space-y-3.5 leading-tight font-extrabold uppercase text-[8.5px] text-slate-700 dark:text-slate-350">
                <div>
                  <span className="text-slate-900 dark:text-white font-black">1. orig_bytes</span>
                  <p className="text-[8px] text-slate-500 mt-1">Total bytes dispatched from the connection origin node</p>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-black">2. duration</span>
                  <p className="text-[8px] text-slate-500 mt-1">Aggregate flow active connection time in seconds</p>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-black">3. resp_pkts</span>
                  <p className="text-[8px] text-slate-500 mt-1">Core packet counts observed from flow targets</p>
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-black">4. orig_pkts</span>
                  <p className="text-[8px] text-slate-500 mt-1">Packet counts dispatched from original host initiator</p>
                </div>
              </div>
            </div>
 
            <div className="text-[8px] uppercase font-extrabold text-slate-500 border-t border-border dark:border-slate-850 pt-3 block">
               Explainer engine satisfies NIST cybersecurity explainability standard.
            </div>
          </div>
 
        </div>
 
      </div>
 
    </div>
  );
}
