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
import { Database, Cpu, AlertTriangle, ArrowUpDown, ShieldCheck, HardDrive, Info } from "lucide-react";
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

  // Aggregate stats across the current dataset for premium display cards
  const getAggregatedMetrics = () => {
    if (!activePipelineData.length) return { avgLatency: 12, maxQueue: 0, droppedTotal: 0, avgKafka: 0 };
    let totalLatency = 0;
    let maxQueue = 0;
    let droppedTotal = 0;
    let totalKafka = 0;

    activePipelineData.forEach((d) => {
      totalLatency += d.PacketLatency;
      totalKafka += d.KafkaThroughput;
      droppedTotal += d.DroppedLogs;
      if (d.AWSQueueDepth > maxQueue) maxQueue = d.AWSQueueDepth;
    });

    return {
      avgLatency: Math.ceil(totalLatency / activePipelineData.length),
      maxQueue,
      droppedTotal,
      avgKafka: Math.ceil(totalKafka / activePipelineData.length)
    };
  };

  const sums = getAggregatedMetrics();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl text-[10px] font-mono text-left leading-relaxed">
          <div className="border-b border-slate-900 pb-1 mb-1.5 flex justify-between gap-4 font-bold text-slate-400">
            <span>HOUR_TICK: {label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-6">
                <span className="text-slate-500 font-bold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="text-white font-bold">{item.value.toLocaleString()} eps</span>
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
      {/* Network Telemetry & Logs Observability Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kafka stream Ingestion */}
        <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4 shadow-md group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-800 group-hover:border-purple-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 transition duration-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                KAFKA THROUGHPUT (AVG)
              </span>
              <span className="text-lg font-black font-mono text-white leading-none">
                {sums.avgKafka.toLocaleString()} <span className="text-xs text-slate-500 font-sans">eps</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Broker cluster</span>
          </div>
        </div>

        {/* Card 2: ES Database Index rate */}
        <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4 shadow-md group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-800 group-hover:border-cyan-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 group-hover:bg-cyan-500/20 transition duration-300">
              <Database className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                ES INDEXING SPEED (AVG)
              </span>
              <span className="text-lg font-black font-mono text-white leading-none">
                {Math.ceil(sums.avgKafka * 0.95).toLocaleString()} <span className="text-xs text-slate-500 font-sans">eps</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Elasticsearch</span>
          </div>
        </div>

        {/* Card 3: Ingestion network latency */}
        <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4 shadow-md group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-800 group-hover:border-emerald-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition duration-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                PACKET INGEST LATENCY
              </span>
              <span className="text-lg font-black font-mono text-emerald-400 leading-none">
                {sums.avgLatency} <span className="text-xs text-slate-500 font-sans">ms</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase flex items-center gap-1 justify-end">
              <span className="w-1 h-3 rounded-full bg-emerald-400" />
              <span>Optimal</span>
            </span>
          </div>
        </div>

        {/* Card 4: Dropped log packets metrics */}
        <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4 shadow-md group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-800 group-hover:border-red-500/30 transition-colors" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 group-hover:bg-red-500/20 transition duration-300">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                DROPPED LOG PACKETS
              </span>
              <span className={`text-lg font-black font-mono leading-none ${sums.droppedTotal > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {sums.droppedTotal} <span className="text-xs text-slate-500 font-sans">eps</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[8.5px] font-mono font-bold uppercase truncate block px-1 rounded ${
              sums.droppedTotal > 10 ? 'bg-red-950/50 text-red-400 border border-red-900/30' : 'bg-transparent text-slate-500'
            }`}>
              {sums.droppedTotal > 10 ? 'BUFFER OVER' : 'SAFE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Informative diagnostic, AWS SQS capacities list */}
        <div className="space-y-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase block mb-1">
              DATA PIPELINE DIAGNOSTIC
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Ingress & Bottleneck Monitoring
            </h3>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-md h-[345px]">
            <div className="space-y-4 flex-1 overflow-auto custom-scrollbar pr-1">
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">INGEST PIPELINE TYPE</span>
                <p className="text-xs font-bold text-white uppercase font-mono">Suricata IP / Zeek connection stream</p>
              </div>

              {/* Ingestion progression visualizer */}
              <div className="space-y-3.5 border-t border-slate-900/60 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                    <span className="text-slate-400">AWS INCOMING QUEUE SATURATION</span>
                    <span className="text-white">{(sums.maxQueue > 1000 ? `${(sums.maxQueue/1000).toFixed(1)}k` : sums.maxQueue)} msg</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${sums.maxQueue > 5000 ? 'bg-red-500' : 'bg-purple-500'}`} 
                      style={{ width: `${Math.min((sums.maxQueue / 18400) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                    <span className="text-slate-400">INGEST ENGINE CAPACITY USED</span>
                    <span className="text-white">68%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[68%] h-full bg-cyan-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                    <span className="text-slate-400">CPU CLUSTERS OVERLOAD RATE</span>
                    <span className={`font-mono font-bold ${sums.maxQueue > 5000 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {sums.maxQueue > 5000 ? '42% (WARN)' : '14% (IDEAL)'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${sums.maxQueue > 5000 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                      style={{ width: sums.maxQueue > 5000 ? '42%' : '14%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block leading-relaxed uppercase">
                * AWS SQS FIFO queue isolates system spikes smoothly, ensuring backlog processing has ZERO buffer dropouts.
              </span>
            </div>
          </div>
        </div>

        {/* AWS SQS Queue Bottleneck Stacked Area Chart (Upgraded styles) */}
        <div className="xl:col-span-2 bg-slate-950/50 border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-lg h-[415px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-[1px] bg-purple-500/20" />
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase block mb-1">
                QUEUE INTAKE RATE FLOWS
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                SQS Queue Messages: Ingress vs Resolved rate
              </h3>
            </div>
            
            {sums.maxQueue > 5000 && (
              <div className="flex items-center gap-1.5 text-[8px] font-mono font-black uppercase text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded shadow-sm animate-pulse shrink-0">
                <AlertTriangle className="w-3 h-3" />
                <span>BACKLOG BOTTLENECK RECORDED</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full mt-6 text-[10px] font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Line Skeletons
                <div className="absolute inset-0 flex flex-col justify-end space-y-4 pb-2 bg-transparent">
                  <div className="flex justify-between items-end h-[180px] px-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className="w-full bg-slate-900 rounded-md animate-pulse"
                        style={{ height: `${25 + n * 8}%` }}
                      />
                    ))}
                  </div>
                  <div className="h-4 bg-slate-900/40 rounded-md w-full animate-pulse" />
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
                          <stop offset="5%" stopColor={CYBER_COLORS.purpleAccent} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CYBER_COLORS.purpleAccent} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.low} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CYBER_COLORS.low} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                      <XAxis dataKey="hour" stroke="#475569" tickLine={false} />
                      <YAxis stroke="#475569" tickLine={false} />
                      <Tooltip content={customTooltip} />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle" 
                        iconSize={7}
                        wrapperStyle={{ 
                          paddingBottom: '15px', 
                          fontSize: '9px', 
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
                        name="Raw Inbound EPS (Ingress Flow)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="BackendResolved"
                        stroke={CYBER_COLORS.low}
                        fillOpacity={1}
                        fill="url(#colorResolved)"
                        name="Backend Processed EPS (Output Flow)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
