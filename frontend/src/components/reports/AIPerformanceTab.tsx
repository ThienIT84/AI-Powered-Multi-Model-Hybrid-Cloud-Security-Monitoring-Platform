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
import { 
  Brain, 
  CheckCircle2, 
  RefreshCw, 
  Activity, 
  ArrowUpRight, 
  Shield, 
  Sparkles,
  Search,
  ArrowUpDown,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, SHAP_EXPLAIN_DATA, MODEL_METRICS_DATA, ModelMetric } from "./reportsConfig";

interface AIPerformanceTabProps {
  timeframe: string;
}

type SortField = "name" | "accuracy" | "precision" | "recall" | "f1" | "status";
type SortOrder = "asc" | "desc";

export function AIPerformanceTab({ timeframe }: AIPerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("accuracy");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeframe]);

  // Adjust metrics based on timeframe filter to maintain realistic dynamic SOC numbers
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
        <div className="bg-card border border-border p-2.5 rounded-lg shadow-2xl text-[10px] font-mono">
          <span className="text-foreground font-black uppercase block border-b border-border pb-1 mb-1">{data.name}</span>
          <span className="text-cyan-655 dark:text-cyan-400 font-bold block">SHAP IMPACT SCORE: {data.score}</span>
          <span className="text-[7.5px] text-muted-foreground block mt-0.5">
            {data.name === "orig_bytes" && "Strong outbound exfiltration behavior indicator"}
            {data.name === "duration" && "Session persistence behavior identifier"}
            {data.name === "resp_pkts" && "Response anomaly pattern correlation"}
            {data.name === "orig_pkts" && "Outbound packet rate anomaly"}
            {data.name === "resp_bytes" && "Inbound download load anomaly"}
          </span>
        </div>
      );
    }
    return null;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Perform search filter and sort
  const filteredAndSortedModels = currentMetrics
    .filter(model => {
      const query = searchQuery.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.source.toLowerCase().includes(query) ||
        model.status.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      } else {
        const valA = parseFloat(a.metrics[sortField]);
        const valB = parseFloat(b.metrics[sortField]);
        comparison = valA - valB;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  return (
    <div className="space-y-6">
      {/* 3 Model Status blocks & Performance benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Model Benchmarking Table Board */}
        <div className="lg:col-span-3 space-y-4 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-cyan-500/20" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                INTEGRATED AI EVALUATION
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Model Benchmark Table
              </h3>
            </div>
            
            {/* Search filter input */}
            <div className="relative w-full sm:w-44">
              <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models or inputs..."
                className="w-full bg-muted/65 placeholder-muted-foreground/60 text-foreground text-[10px] font-mono pl-7 pr-3 py-1.5 rounded-lg border border-border focus:ring-1 focus:ring-cyan-500/20 outline-none leading-relaxed transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-border/80 rounded-lg bg-background/20 mt-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 space-y-3"
                >
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 bg-muted/40 rounded animate-pulse" />
                  ))}
                </motion.div>
              ) : filteredAndSortedModels.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-6 text-center"
                >
                  <Brain className="w-8 h-8 text-muted-foreground animate-pulse mb-2.5" />
                  <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO BENCHMARKS MATCHED
                  </span>
                </motion.div>
              ) : (
                <motion.table
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left font-mono border-collapse text-[10px]"
                >
                  <thead>
                    <tr className="bg-muted border-b border-border text-[8px] tracking-wider text-muted-foreground font-black uppercase sticky top-0 z-10">
                      <th 
                        className="py-2.5 px-3 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>MODEL NAME</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "name" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("accuracy")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>ACC</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "accuracy" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("precision")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>PRECISION</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "precision" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("recall")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>RECALL</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "recall" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("f1")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>F1-SCORE</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "f1" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none text-right pr-3"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center justify-end gap-1 py-1">
                          <span>STATUS</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "status" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedModels.map((md, idx) => {
                      const isRetraining = md.status === "Retraining";
                      return (
                        <tr key={idx} className="border-b border-border/40 hover:bg-muted/20 transition-colors leading-relaxed group/tr">
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-[10.5px] uppercase">{md.name}</span>
                              <span className="text-[7.5px] text-muted-foreground tracking-widest lowercase font-bold">{md.source}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-black text-foreground">{md.metrics.accuracy}</td>
                          <td className="py-3 px-2 font-bold text-muted-foreground/90">{md.metrics.precision}</td>
                          <td className="py-3 px-2 font-bold text-muted-foreground/90">{md.metrics.recall}</td>
                          <td className="py-3 px-2 font-black text-cyan-550 dark:text-cyan-400">{md.metrics.f1}</td>
                          <td className="py-3 px-2 text-right pr-3">
                            <span
                              className={`inline-block text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                                isRetraining
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/15"
                                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/15"
                              }`}
                            >
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isRetraining ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                              {md.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-4 text-[9px] font-mono text-muted-foreground flex items-center justify-between shrink-0">
            <span>SOC INTEGRATIVE ANALYSIS ACTIVE</span>
            <span>MODEL SCALE: 1.0x</span>
          </div>
        </div>

        {/* SHAP Explanatory Horizontal Bar Chart card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-purple-500/20" />
          <div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
              SHAP INTEGRATION EXPLAINABILITY
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              SHAP Feature Importance Chart
            </h3>
          </div>

          {/* Interactive Feature Ranking labels */}
          <div className="flex-1 w-full mt-4 text-[9px] font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col justify-between py-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex items-center gap-3 animate-pulse">
                      <div className="h-2 w-14 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded-full flex-1" style={{ maxWidth: `${90 - n * 12}%` }} />
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
                      margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.11} horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" tickLine={false} style={{ fontSize: "8px" }} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" tickLine={false} width={80} style={{ fontSize: "9px" }} />
                      <Tooltip content={customTooltip} cursor={{ fill: 'currentColor', opacity: 0.08 }} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {SHAP_EXPLAIN_DATA.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            style={{ filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.15))" }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-3 mt-1 flex items-center justify-between text-[9px] font-mono text-muted-foreground leading-none">
            <span className="uppercase">FEATURE ACTIVATION DENSITY</span>
            <span className="text-purple-655 dark:text-purple-400 font-bold">SPARSE//X</span>
          </div>
        </div>
      </div>
 
      {/* Dynamic Behavioral Insight & SHAP highlights */}
      <div className="bg-muted/40 p-4 border border-border rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-655 dark:text-purple-400 rounded-lg border border-purple-500/25 mt-1 sm:mt-0 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <span>SHAP FEATURE IMPORTANCE INSIGHTS</span>
              <span className="inline-block w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
            </h4>
            <div className="text-[9.5px] font-mono font-medium text-muted-foreground uppercase leading-relaxed max-w-4xl space-y-1">
              <div>
                • <strong className="text-foreground">orig_bytes</strong> → strongest indicator (outbound exfiltration behavior)
              </div>
              <div>
                • <strong className="text-foreground">duration</strong> → session persistence
              </div>
              <div>
                • <strong className="text-foreground">resp_pkts</strong> → response anomaly pattern
              </div>
              <p className="text-[9px] text-purple-655 dark:text-purple-400 font-black mt-2 leading-none uppercase">
                High orig_bytes strongly correlates with botnet / exfiltration behavior (~88% activation rate)
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border font-mono text-[9px] font-bold uppercase transition duration-200 shrink-0 cursor-pointer align-self-end md:align-self-center">
          <span>RUN FEATURE TUNER</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
