import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Database, 
  Cpu, 
  AlertTriangle, 
  ArrowUpDown, 
  ShieldCheck, 
  HardDrive, 
  Info,
  Server,
  Activity,
  Network,
  TrendingUp,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, PIPELINE_DATASETS } from "./reportsConfig";

interface InfrastructureTabProps {
  timeframe: string;
}

export function InfrastructureTab({ timeframe }: InfrastructureTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const activePipelineData = PIPELINE_DATASETS[timeframe] || PIPELINE_DATASETS["30d"];

  // Precise Core Metrics mapping based on selected timeframe
  // Default (30d) features the exact prompt values:
  // - Kafka Throughput: 727,500 EPS
  // - Elasticsearch Indexing: 691,125 EPS
  // - Packet Latency: 31 ms (Optimal)
  // - Dropped Logs: 564 EPS (Warning)
  const getFidelityMetrics = () => {
    switch (timeframe) {
      case "today":
        return {
          kafka: "715,200",
          elastic: "688,400",
          latency: "28 ms",
          latencyStatus: "Optimal",
          dropped: "185",
          droppedStatus: "Safe"
        };
      case "7d":
        return {
          kafka: "722,800",
          elastic: "690,150",
          latency: "30 ms",
          latencyStatus: "Optimal",
          dropped: "342",
          droppedStatus: "Safe"
        };
      case "custom":
        return {
          kafka: "732,900",
          elastic: "694,200",
          latency: "33 ms",
          latencyStatus: "Optimal",
          dropped: "610",
          droppedStatus: "Warning"
        };
      case "30d":
      default:
        return {
          kafka: "727,500",
          elastic: "691,125",
          latency: "31 ms",
          latencyStatus: "Optimal",
          dropped: "564",
          droppedStatus: "Warning"
        };
    }
  };

  const metrics = getFidelityMetrics();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-2xl text-[10px] font-mono text-left leading-relaxed">
          <div className="border-b border-border pb-1 mb-1.5 flex justify-between gap-4 font-bold text-muted-foreground">
            <span>PIPELINE_TICK: {label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground font-bold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="text-foreground font-bold">{item.value.toLocaleString()} EPS</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 4 Core Data Ingestion Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Kafka Throughput */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-purple-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/25 shrink-0">
              <Network className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                KAFKA THROUGHPUT
              </span>
              <span className="text-base font-black font-mono text-foreground leading-none">
                {metrics.kafka} <span className="text-[10px] text-muted-foreground font-sans">EPS</span>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              ONLINE
            </span>
          </div>
        </div>

        {/* Card 2: Elasticsearch Indexing */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-cyan-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/25 shrink-0">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                ELASTICSEARCH INDEXING
              </span>
              <span className="text-base font-black font-mono text-foreground leading-none">
                {metrics.elastic} <span className="text-[10px] text-muted-foreground font-sans">EPS</span>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              INDEXING
            </span>
          </div>
        </div>

        {/* Card 3: Packet Latency */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-emerald-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/25 shrink-0">
              <Cpu className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                PACKET LATENCY
              </span>
              <span className="text-base font-black font-mono text-emerald-500 leading-none">
                {metrics.latency}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              OPTIMAL
            </span>
          </div>
        </div>

        {/* Card 4: Dropped Logs */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-red-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/25 shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                DROPPED LOGS
              </span>
              <span className="text-base font-black font-mono text-red-555 dark:text-red-400 leading-none">
                {metrics.dropped} <span className="text-[10px] text-muted-foreground font-sans">EPS</span>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-black border tracking-wider ${
              metrics.droppedStatus === "Warning" 
                ? "bg-red-500/10 text-red-500 border-red-500/20" 
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {metrics.droppedStatus}
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AWS SQS Queue & Pipeline Load Diagnostics Panel */}
        <div className="space-y-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
              AWS CONTRACT TELEMETRY
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Queue & Pipeline Monitoring
            </h3>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-md h-90">
            <div className="space-y-4 flex-1 overflow-auto custom-scrollbar pr-1">
              
              <div className="space-y-1.5 text-left bg-muted/40 p-3 border border-border/80 rounded-lg">
                <span className="text-[8px] font-mono font-black text-purple-400 uppercase tracking-widest block">
                  AWS SQS LOAD METRIC
                </span>
                
                {/* List conforming explicitly to prompt items */}
                <div className="space-y-2 mt-2 font-mono text-[10px]">
                  <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground uppercase font-bold">Incoming Queue:</span>
                    <span className="text-foreground font-black">18.4K messages</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground uppercase font-bold shrink-0">Processed Rate:</span>
                    <span className="text-foreground font-bold text-right pl-4">stable but slightly lagging peak bursts</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-muted-foreground uppercase font-bold">Backlog status:</span>
                    <span className="text-red-400 font-extrabold uppercase animate-pulse">detected intermittent congestion</span>
                  </div>
                </div>
              </div>

              {/* Graphical Queue progress indicators */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                    <span className="text-muted-foreground">FIFO Queue message saturation</span>
                    <span className="text-foreground">89% saturation</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                    <div className="w-[89%] h-full bg-purple-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                    <span className="text-muted-foreground">Kafka Partition usage</span>
                    <span className="text-foreground">73% load</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                    <div className="w-[73%] h-full bg-cyan-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 mt-2">
              <span className="text-[8px] font-mono text-muted-foreground uppercase block leading-normal">
                * Real-time partition streams allow auto-scaler triggers to safely dump backlogs into secondary AWS endpoints on peak load gaps.
              </span>
            </div>
          </div>
        </div>

        {/* Ingress vs Processing Area Chart Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-107.5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-purple-500/20" />
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                INGRESS VS PROCESSING RATE FLOW
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Ingress vs Processing Chart
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm shrink-0">
              <AlertCircle className="w-3 h-3" />
              <span>Backlog congestion detected</span>
            </div>
          </div>

          {/* Interactive Area Chart */}
          <div className="flex-1 w-full mt-6 text-[10px] font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col justify-end space-y-4 pb-2 bg-transparent">
                  <div className="flex justify-between items-end h-45 px-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className="w-full bg-muted rounded-md animate-pulse"
                        style={{ height: `${25 + n * 8}%` }}
                      />
                    ))}
                  </div>
                  <div className="h-4 bg-muted/40 rounded-md w-full animate-pulse" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activePipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.purpleAccent} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CYBER_COLORS.purpleAccent} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.low} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CYBER_COLORS.low} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.11} />
                      <XAxis dataKey="hour" stroke="#94a3b8" tickLine={false} style={{ fontSize: "8px" }} />
                      <YAxis stroke="#94a3b8" tickLine={false} style={{ fontSize: "8px" }} />
                      <Tooltip content={customTooltip} />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle" 
                        iconSize={7}
                        wrapperStyle={{ 
                          paddingBottom: '10px', 
                          fontSize: '8px', 
                          fontFamily: 'monospace', 
                          fontWeight: '800' 
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="RawEvents"
                        stroke={CYBER_COLORS.purpleAccent}
                        fillOpacity={1}
                        fill="url(#colorRaw)"
                        name="Raw Inbound EPS"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="BackendResolved"
                        stroke={CYBER_COLORS.low}
                        fillOpacity={1}
                        fill="url(#colorProcessed)"
                        name="Processed EPS"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Descriptive caption directly matching required insight text */}
          <div className="border-t border-border pt-3 mt-1 text-[9px] font-mono text-muted-foreground flex items-center justify-between">
            <span className="uppercase text-[8px] font-black mr-2 leading-tight">
              Week 1–4 behavior: near overlap. Slight divergence indicates transient backlog spikes, buffer saturation events.
            </span>
            <span className="text-purple-400 font-extrabold shrink-0">DIAGNOSTIC SNAPSHOT</span>
          </div>
        </div>

      </div>

      {/* System Insight block exactly matching requested outputs */}
      <div className="bg-muted/45 p-4 border border-border rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/25 shrink-0 flex items-center justify-center">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span>🚨 INGESTION ENGINE STATE INSIGHT</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[7.5px] bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                MILD CONGESTION (non-critical)
              </span>
            </h4>
            <div className="text-[9.5px] font-mono font-medium text-muted-foreground uppercase leading-relaxed max-w-4xl flex flex-wrap gap-x-6 gap-y-1">
              <div>
                • CPU Load: <span className="text-yellow-500 font-bold">42%</span> (Warning threshold approaching)
              </div>
              <div>
                • Ingest Engine: <span className="text-cyan-400 font-bold">68%</span> capacity
              </div>
              <div>
                • Bottleneck status: <span className="text-red-400 font-black">MILD CONGESTION (non-critical)</span>
              </div>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border font-mono text-[9px] font-bold uppercase transition duration-200 shrink-0 cursor-pointer align-self-end md:align-self-center">
          <span>TUNE BUFFERS</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
