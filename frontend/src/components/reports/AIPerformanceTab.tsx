import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Brain, CheckCircle2, RefreshCw, Activity, ArrowUpRight, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, SHAP_EXPLAIN_DATA, MODEL_METRICS_DATA } from "./reportsConfig";

interface AIPerformanceTabProps {
  timeframe: string;
}

export function AIPerformanceTab({ timeframe }: AIPerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeModelSelection, setActiveModelSelection] = useState<string>("AI1: Network Anomaly");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeframe]);

  // Dynamic ML performance parameters depending on timeframe to add immersive SOC realism
  const getSimulatedModelMetrics = () => {
    const base = MODEL_METRICS_DATA;
    let multiplier = 0;
    
    if (timeframe === "today") multiplier = -0.004;
    else if (timeframe === "7d") multiplier = -0.002;
    else if (timeframe === "custom") multiplier = 0.001;

    return base.map((m) => {
      const accuracyFloat = parseFloat(m.metrics.accuracy) + multiplier * 100;
      const precisionFloat = parseFloat(m.metrics.precision) + multiplier * 100;
      const recallFloat = parseFloat(m.metrics.recall) + multiplier * 100;
      const f1Float = parseFloat(m.metrics.f1) + multiplier * 100;

      return {
        ...m,
        metrics: {
          accuracy: `${accuracyFloat.toFixed(1)}%`,
          precision: `${precisionFloat.toFixed(1)}%`,
          recall: `${recallFloat.toFixed(1)}%`,
          f1: `${f1Float.toFixed(1)}%`,
        }
      };
    });
  };

  const currentMetrics = getSimulatedModelMetrics();

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-2xl text-[10px] font-mono">
          <span className="text-white font-black uppercase block border-b border-slate-900 pb-1 mb-1">{data.name}</span>
          <span className="text-cyan-400 font-bold block">SHAP RELEVANCE: {data.score}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 3 Model Status blocks & Performance benchmarks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase block mb-1">
                AI MODEL INTEGRATED VERIFICATION
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Machine Learning Validation Benchmarks
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="uppercase">ALL SENSORS ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Skeletons
                <>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-slate-900/40 p-5 rounded-xl border border-slate-900 h-[340px] animate-pulse flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-2 w-12 bg-slate-800 rounded" />
                        <div className="h-4 w-28 bg-slate-800 rounded" />
                      </div>
                      <div className="space-y-3.5 my-6">
                        <div className="h-1.5 w-full bg-slate-800 rounded" />
                        <div className="h-1.5 w-full bg-slate-800 rounded" />
                        <div className="h-1.5 w-full bg-slate-800 rounded" />
                      </div>
                      <div className="h-2.5 w-16 bg-slate-800 rounded" />
                    </div>
                  ))}
                </>
              ) : (
                currentMetrics.map((md, idx) => {
                  const isRetraining = md.status === "Retraining";
                  const isSelected = activeModelSelection === md.name;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      key={md.name}
                      onClick={() => setActiveModelSelection(md.name)}
                      className={`bg-slate-950/50 border rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between h-[345px] relative overflow-hidden cursor-pointer ${
                        isSelected 
                          ? "border-cyan-500/40 shadow-[0_4px_25px_rgba(6,182,212,0.06)] scale-[1.01]" 
                          : "border-slate-900 shadow-sm"
                      } ${md.glow}`}
                    >
                      {/* Interactive Selection ring */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 p-1 bg-cyan-500/10 border-b border-l border-cyan-500/20 text-[7px] font-mono font-black text-cyan-400 uppercase tracking-widest leading-none">
                          In focus
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-2.5">
                          <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                            {md.source.toUpperCase()}
                          </span>
                          <span
                            className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1.5 shadow-sm ${
                              isRetraining
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isRetraining ? (
                              <>
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Amber RETRAINING</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Emerald ACTIVE</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className={`text-xs font-black uppercase tracking-wider ${md.color}`}>
                          {md.name}
                        </h4>
                      </div>

                      {/* Animated Progress metric loops */}
                      <div className="space-y-3.5 my-6">
                        {Object.entries(md.metrics).map(([key, val]) => {
                          const widthFraction = val;
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider">
                                <span className="text-slate-400">{key === "f1" ? "F1-Score" : key}</span>
                                <span className="text-white">{val}</span>
                              </div>
                              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: widthFraction }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full ${md.lineColor} rounded-full`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">
                          VALIDATED: {timeframe.toUpperCase()} FEED
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SHAP Explanatory Horizontal Bar Chart card */}
        <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-lg h-[415px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-[1px] bg-purple-500/20" />
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase block mb-1">
              SHAP INTEGRATION EXPLAINABILITY
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Feature Relevance Weights
            </h3>
          </div>

          <div className="flex-1 w-full mt-4 text-[9px] font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col justify-between py-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex items-center gap-3 animate-pulse">
                      <div className="h-2 w-14 bg-slate-900 rounded" />
                      <div className="h-3 bg-slate-900 rounded-full flex-1" style={{ maxWidth: `${90 - n * 12}%` }} />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={SHAP_EXPLAIN_DATA}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} horizontal={false} />
                      <XAxis type="number" stroke="#475569" tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#475569" tickLine={false} width={80} />
                      <Tooltip content={customTooltip} cursor={{ fill: '#0f172a', opacity: 0.2 }} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {SHAP_EXPLAIN_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-900 pt-3 mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500 leading-none">
            <span className="uppercase">MODEL SEVERITY CONFIDENCE INDEX</span>
            <span className="text-purple-400 font-bold">SPARSE//X</span>
          </div>
        </div>
      </div>

      {/* Reusable Insight Card explaining feature importance */}
      <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
              SHAP INTERPRETABILITY HIGHLIGHT: <span className="text-cyan-400 font-bold">"orig_bytes"</span>
            </h4>
            <p className="text-[9.5px] font-medium text-slate-400 uppercase leading-relaxed max-w-2xl">
              Our explainable AI layer shows that outgoing connection byte values represent the single highest coefficient weight when flagging outbound Trojan bot beacons. Outbound spikes dictate 88% of Anomaly fuses.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-900 hover:border-slate-705 font-mono text-[9px] font-bold uppercase transition duration-200 shrink-0 cursor-pointer">
          <span>Explain models</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
