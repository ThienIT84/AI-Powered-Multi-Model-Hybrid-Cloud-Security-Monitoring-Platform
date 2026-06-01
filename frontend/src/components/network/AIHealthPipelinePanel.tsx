import React, { useMemo, useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import { 
  Cpu, 
  Database, 
  Activity, 
  Workflow, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  GitFork, 
  Server, 
  PieChart as PieIcon, 
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles,
  RefreshCw,
  Scale
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface AIHealthPipelinePanelProps {
  logs: NetworkLog[];
}

export const AIHealthPipelinePanel: React.FC<AIHealthPipelinePanelProps> = ({ logs }) => {
  const [pipelineTicks, setPipelineTicks] = useState(0);

  // Tick generator for visual simulated live oscillation inside monitor dashboard
  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineTicks(prev => prev + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Compute live fluctuating statistics for AI / Pipeline
  const anomalousCount = useMemo(() => logs.filter(l => l.verdict === "ANOMALY").length, [logs]);

  // AI1 Model Metrics
  const ai1Metrics = useMemo(() => {
    const latencyOscillation = 3.4 + (Math.sin(pipelineTicks * 0.5) * 0.4);
    const predPerSec = 45.2 + (Math.cos(pipelineTicks) * 3.5);
    return {
      status: "Loaded & Active",
      runtime: "ONNX Native Container",
      latency: latencyOscillation.toFixed(2),
      predictionsSec: Math.round(predPerSec),
      queue: Math.abs(Math.round(Math.sin(pipelineTicks * 0.8) * 2)),
      errors: 0,
      cpu: Math.round(18 + (Math.sin(pipelineTicks * 0.2) * 2)),
      ram: "1.24 GB",
      version: "v3.0.4-production"
    };
  }, [pipelineTicks]);

  // AI2A Model Metrics
  const ai2aMetrics = useMemo(() => {
    const latencyOscillation = 8.12 + (Math.sin(pipelineTicks * 0.6) * 0.95);
    const predPerSec = 45.2 + (Math.cos(pipelineTicks) * 3.5);
    return {
      status: "Loaded & Active",
      runtime: "ONNX PyTorch Engine",
      latency: latencyOscillation.toFixed(2),
      predictionsSec: Math.round(predPerSec),
      queue: Math.abs(Math.round(Math.cos(pipelineTicks * 0.5) * 3)),
      errors: 0,
      cpu: Math.round(24 + (Math.cos(pipelineTicks * 0.3) * 3)),
      ram: "2.11 GB",
      version: "v2.8.2-multi"
    };
  }, [pipelineTicks]);

  // SQS Pipeline Health Trackers
  const sqsMetrics = useMemo(() => {
    const queueDepth = Math.max(0, 4 + Math.round(Math.sin(pipelineTicks) * 3));
    const msgSec = 142 + Math.round(Math.cos(pipelineTicks * 0.3) * 15);
    const latencyIn = 42 + Math.round(Math.sin(pipelineTicks) * 5);
    return {
      queueDepth,
      messagesSec: msgSec,
      batchSize: 10,
      failedCount: 0,
      retryCount: 0,
      consumerStatus: "Healthy (3 active threads)",
      e2eLatency: `${latencyIn}ms`
    };
  }, [pipelineTicks]);

  // Data Quality Metrics
  const qualityMetrics = useMemo(() => {
    // Service ratios
    const total = logs.length || 1;
    let https = 0, dns = 0, ssh = 0, other = 0;
    logs.forEach(l => {
      if (l.destPort === 443) https++;
      else if (l.destPort === 53 || l.srcPort === 5353) dns++;
      else if (l.destPort === 22) ssh++;
      else other++;
    });

    const httpsPct = Math.round((https / total) * 100);
    const dnsPct = Math.round((dns / total) * 100);
    const sshPct = Math.round((ssh / total) * 100);
    const otherPct = 100 - (httpsPct + dnsPct + sshPct);

    // User Agent diversity
    const userAgents = [
      { name: "Chrome/Webkit Client", percentage: 56 },
      { name: "Mozilla Firefox", percentage: 18 },
      { name: "Python-Requests Utility", percentage: 12 },
      { name: "Curl Recon scripts", percentage: 8 },
      { name: "Others (Edge/Opera)", percentage: 6 }
    ];

    return {
      serviceRatios: { HTTPS: httpsPct, DNS: dnsPct, SSH: sshPct, Other: otherPct },
      userAgents,
      attackDiversity: anomalousCount > 3 ? "HIGH (MultiClass Triggered)" : "LOW (Steady State)",
      freshness: "1.2s ping latency",
      threatRatio: total > 0 ? ((anomalousCount / total) * 100).toFixed(1) : "0.0"
    };
  }, [logs, anomalousCount]);

  // Custom distributions for feature analytics (Charts)
  const durationDistribution = useMemo(() => {
    return [
      { bin: "0-50ms", count: 85 },
      { bin: "50-200ms", count: 124 },
      { bin: "200-1000ms", count: 42 },
      { bin: "1-5s", count: 18 },
      { bin: "5s+", count: 8 }
    ];
  }, []);

  const bytesRateDistribution = useMemo(() => {
    return [
      { rateRange: "1-100 B/s", count: 34 },
      { rateRange: "100-1K B/s", count: 86 },
      { rateRange: "1K-10K B/s", count: 142 },
      { rateRange: "10K-100K B/s", count: 58 },
      { rateRange: "100K+", count: 12 }
    ];
  }, []);

  // Top 50 Outlier Flows
  const topOutlierLogs = useMemo(() => {
    return logs
      .filter(l => l.threatScore > 50)
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, 15); // Show first 15 for compactness
  }, [logs]);

  // SOC Performance metrics today
  const socMetrics = useMemo(() => {
    return {
      flowsProcessed: logs.length * 24 + 10482,
      predictionsMade: logs.length * 48 + 20964,
      fusionDecisions: logs.length + 420,
      avgLatency: "6.24ms",
      avgInvestTime: "24.5 mins",
      openIncidents: 1,
      closedIncidents: 42,
      fpReviewCount: anomalousCount + 12
    };
  }, [logs, anomalousCount]);

  return (
    <div className="space-y-6 text-slate-100 font-mono text-[11px]" id="ai-health-pipeline-panel-root">
      {/* SECTION ROW 1: SQS PIPELINE FLOW DIAGRAM */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5 mb-3">
          <Workflow className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">REAL-TIME TELEMETRY STREAM GRAPH</span>
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              AWS SQS PIPELINE MONITOR
            </h3>
          </div>
        </div>

        {/* Dynamic ASCII / SVG Pipeline workflow */}
        <div className="p-3.5 bg-slate-900/30 rounded border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-1 text-[10px] text-center select-none font-mono">
          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-slate-500 font-bold">ZEEK LOGS</div>
            <div className="text-emerald-400 font-extrabold font-mono mt-0.5">conn.log JSON</div>
            <div className="text-[8px] text-slate-450 mt-0.5">Throughput: {sqsMetrics.messagesSec} f/s</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-655 hidden md:block rotate-90 md:rotate-0" />
          
          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-indigo-400 font-bold">AWS SQS</div>
            <div className="text-slate-100 font-extrabold font-mono mt-0.5">Queue Buffer</div>
            <div className="text-[8px] text-indigo-400 font-bold mt-0.5">Depth: {sqsMetrics.queueDepth} logs</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-655 hidden md:block rotate-90 md:rotate-0" />

          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-amber-500 font-bold">BATCH CONSUMER</div>
            <div className="text-slate-100 font-extrabold font-mono mt-0.5">Feature Router</div>
            <div className="text-[8px] text-slate-450 mt-0.5">{sqsMetrics.consumerStatus}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-655 hidden md:block rotate-90 md:rotate-0" />

          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-cyan-405 font-bold">AI INFERENCE</div>
            <div className="text-cyan-400 font-extrabold mt-0.5">AI1 & AI2A ONNX</div>
            <div className="text-[8px] text-slate-450 mt-0.5">Latency: {ai1Metrics.latency}ms</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-655 hidden md:block rotate-90 md:rotate-0" />

          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-rose-500 font-bold">FUSION LAYER</div>
            <div className="text-pink-400 font-extrabold mt-0.5">Decision Router</div>
            <div className="text-[8px] text-slate-450 mt-0.5">End-to-End: {sqsMetrics.e2eLatency}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-655 hidden md:block rotate-90 md:rotate-0" />

          <div className="flex-1 px-2 py-1.5 border border-slate-800 rounded bg-slate-950">
            <div className="text-[8px] text-purple-400 font-bold">SIEM DATABASE</div>
            <div className="text-slate-100 font-extrabold mt-0.5">PostgreSQL</div>
            <div className="text-[8px] text-emerald-500 font-bold mt-0.5">Stored & Stream</div>
          </div>
        </div>
      </div>

      {/* GRID SECTION 2: AI METRICS & SQS METRICS SIDE BY SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Core AI1 Runtime Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2.5">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <h4 className="font-extrabold uppercase text-slate-200">AI1 ANOMALY ENGINE SUMMARY</h4>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Engine Status:</span>
                <span className="text-emerald-450 font-extrabold">{ai1Metrics.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Runtime:</span>
                <span className="text-slate-300">{ai1Metrics.runtime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Latency:</span>
                <span className="font-bold text-slate-100">{ai1Metrics.latency} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Throughput Speed:</span>
                <span className="text-slate-200">{ai1Metrics.predictionsSec} pred/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frame Backlog Queue:</span>
                <span className={`font-black ${ai1Metrics.queue > 0 ? "text-amber-500" : "text-slate-500"}`}>
                  {ai1Metrics.queue} packets
                </span>
              </div>
              <div className="flex justify-between animate-pulse">
                <span className="text-slate-500">Resource (CPU/RAM):</span>
                <span className="text-cyan-400 font-bold">{ai1Metrics.cpu}% CPU / {ai1Metrics.ram}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-[8.5px] text-slate-500 py-1 px-1.5 uppercase rounded mt-3">
            VERSION INDEX REFERENCE: {ai1Metrics.version}
          </div>
        </div>

        {/* Core AI2A Classifier Runtime Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2.5">
              <Cpu className="w-4 h-4 text-amber-500 animate-pulse" />
              <h4 className="font-extrabold uppercase text-slate-200">AI2A CLASSIFIER SUMMARY</h4>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Engine Status:</span>
                <span className="text-emerald-450 font-extrabold">{ai2aMetrics.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Runtime:</span>
                <span className="text-slate-300">{ai2aMetrics.runtime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Latency:</span>
                <span className="font-bold text-slate-100">{ai2aMetrics.latency} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Throughput Speed:</span>
                <span className="text-slate-200">{ai2aMetrics.predictionsSec} pred/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frame Backlog Queue:</span>
                <span className={`font-black ${ai2aMetrics.queue > 0 ? "text-amber-500" : "text-slate-500"}`}>
                  {ai2aMetrics.queue} packets
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resource (CPU/RAM):</span>
                <span className="text-cyan-400 font-bold">{ai2aMetrics.cpu}% CPU / {ai2aMetrics.ram}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-[8.5px] text-slate-500 py-1 px-1.5 uppercase rounded mt-3">
            VERSION INDEX REFERENCE: {ai2aMetrics.version}
          </div>
        </div>

        {/* SQS Buffer parameters */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2.5">
              <Radio className="w-4 h-4 text-indigo-400 animate-ping" style={{ animationDuration: "3s" }} />
              <h4 className="font-extrabold uppercase text-slate-200">SQS PIPELINE HEALTH</h4>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Queue Buffer Depth:</span>
                <span className={`font-black ${sqsMetrics.queueDepth > 4 ? "text-rose-450" : "text-slate-200"}`}>{sqsMetrics.queueDepth} feeds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Polled Messages rate:</span>
                <span className="text-slate-200 font-bold">{sqsMetrics.messagesSec} msgs/sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Batch Size:</span>
                <span className="text-slate-400">{sqsMetrics.batchSize} lines per transaction</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pipeline Retries count:</span>
                <span className="text-emerald-500 font-bold">{sqsMetrics.retryCount} failed attempts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Failed / Dead-Letters:</span>
                <span className="text-slate-500 font-extrabold">{sqsMetrics.failedCount} dumps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parallel Workers:</span>
                <span className="text-slate-100 font-bold">{sqsMetrics.consumerStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-905 p-1.5 rounded text-[8.5px] uppercase text-slate-550 border border-slate-900">
            Pipeline transport type: JSON stream over Websocket
          </div>
        </div>

      </div>

      {/* GRID SECTION 3: FEATURE ANALYTICS CHART & ZEEK FIRST QUALITY SCORECARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Flow Feature Analytics Histograms */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Sliders className="w-4 h-4 text-emerald-505" />
            <h4 className="font-extrabold uppercase text-slate-200">FLOW FEATURE DISTRIBUTION ANALYTICS</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 h-32.5">
            {/* Duration Bins Chart */}
            <div className="h-full">
              <span className="text-[8px] text-slate-500 font-bold uppercase text-center block mb-1">Duration Distribution</span>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={durationDistribution} margin={{ top: 0, right: 0, left: -42, bottom: 0 }}>
                  <XAxis dataKey="bin" stroke="#64748b" fontSize={7} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={7} tickLine={false} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bytes Rate Bins Chart */}
            <div className="h-full">
              <span className="text-[8px] text-slate-500 font-bold uppercase text-center block mb-1">Byte rate Distribution</span>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={bytesRateDistribution} margin={{ top: 0, right: 0, left: -42, bottom: 0 }}>
                  <XAxis dataKey="rateRange" stroke="#64748b" fontSize={7} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={7} tickLine={false} />
                  <Bar dataKey="count" fill="#a855f7" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[8px] text-slate-500 leading-none text-center">
            Multi-variate features evaluated on-premise within ONNX heuristic parameters
          </p>
        </div>

        {/* Telemetry and Freshness metrics scorecard */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h4 className="font-extrabold uppercase text-slate-200">TELEMETRY DATA FRESHNESS & QUALITY SCORE</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded border border-slate-900 leading-none">
                <span className="text-slate-500 font-bold text-[8.5px]">Service Diversity:</span>
                <span className="font-bold text-slate-200">HTTP/HTTPS/SSH/DNS</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded border border-slate-900 leading-none">
                <span className="text-slate-500 font-bold text-[8.5px]">Attack Varieties:</span>
                <span className="text-amber-500 font-bold">{qualityMetrics.attackDiversity}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded border border-slate-900 leading-none">
                <span className="text-slate-500 font-bold text-[8.5px]">Time Freshness:</span>
                <span className="text-cyan-450 font-extrabold">{qualityMetrics.freshness}</span>
              </div>
            </div>

            <div>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block leading-none mb-1">USER AGENT DIVERSITY SCORES</span>
              <div className="text-[8.5px] space-y-1">
                {qualityMetrics.userAgents.slice(0, 3).map((u, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-900/40 pb-0.5">
                    <span className="text-slate-400 truncate max-w-27.5">{u.name}</span>
                    <strong className="text-slate-200">{u.percentage}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 4: TOP 50 OUTLIER FLOWS TABLE */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <h4 className="font-extrabold uppercase text-slate-200">
              CROSS-CORRELATION: TOP OUTLIER ANOMALOUS FLOWS (RANKED BY RISK SCORE)
            </h4>
          </div>
          <span className="text-[8.5px] uppercase text-slate-550 italic font-black">Memory logs audit buffer</span>
        </div>

        <div className="overflow-x-auto max-h-40 border border-slate-905 rounded bg-slate-950/40 custom-scrollbar pr-1">
          <table className="w-full text-left font-mono">
            <thead className="bg-slate-900 sticky top-0 z-10 text-[8.5px] uppercase text-slate-500 border-b border-slate-900">
              <tr>
                <th className="px-3 py-1.5">Timestamp</th>
                <th className="px-3 py-1.5">UID Token</th>
                <th className="px-3 py-1.5">Source IP</th>
                <th className="px-3 py-1.5">Destination IP</th>
                <th className="px-3 py-1.5">Protocol</th>
                <th className="px-3 py-1.5 text-center">Threat Risk index</th>
                <th className="px-3 py-1.5 text-right">MITRE Category Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/30 text-[9px]">
              {topOutlierLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">
                    All telemetry feeds match base traffic profiles with 100% confidence. No outliers registered.
                  </td>
                </tr>
              ) : (
                topOutlierLogs.map((log) => {
                  const isCritical = log.threatScore > 85;
                  const mitreName = log.reason.toLowerCase().includes("scan") 
                    ? "T1046: Network Service Scanning" 
                    : log.reason.toLowerCase().includes("leak") || log.reason.toLowerCase().includes("exfil") 
                    ? "T1071: Automated Exfiltration C2" 
                    : log.destPort === 22 
                    ? "T1110: Remote Brute-Force guesswork" 
                    : "T1498: Denial of Service Flood";

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 duration-150">
                      <td className="px-3 py-1.5 font-bold text-slate-450">{log.timestamp}</td>
                      <td className="px-3 py-1.5 font-extrabold text-slate-350">{log.id}</td>
                      <td className="px-3 py-1.5 text-slate-205 font-bold">{log.srcIp}</td>
                      <td className="px-3 py-1.5 text-slate-205">{log.destIp}</td>
                      <td className="px-3 py-1.5"><span className="bg-slate-900/80 border border-slate-805 px-1 py-0.2 rounded font-extrabold">{log.protocol}</span></td>
                      <td className="px-3 py-1.5 text-center font-black">
                        <span className={isCritical ? "text-red-400 animate-pulse" : "text-amber-500"}>
                          {log.threatScore}/100
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-black text-slate-450">{mitreName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION ROW 5: SOC HISTORICAL PERFORMANCE METRICS */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3.5" id="soc-performance-metrics-submodule">
        <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
          <Activity className="w-5 h-5 text-emerald-450 animate-pulse" />
          <h4 className="font-extrabold uppercase text-slate-200">SOC SECURITY OPERATIONS EXECUTIVE REPORT CARD</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 font-mono text-center">
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">Total flows Processed</span>
            <strong className="text-sm font-black text-slate-100">{socMetrics.flowsProcessed.toLocaleString()}</strong>
          </div>
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">AI heuristic Predictions</span>
            <strong className="text-sm font-black text-slate-100">{socMetrics.predictionsMade.toLocaleString()}</strong>
          </div>
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">Fusion Layer decisions</span>
            <strong className="text-sm font-black text-emerald-405">{socMetrics.fusionDecisions.toLocaleString()}</strong>
          </div>
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">Average detection Latency</span>
            <strong className="text-sm font-black text-indigo-400">{socMetrics.avgLatency}</strong>
          </div>
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">Average triaging duration</span>
            <strong className="text-sm font-black text-cyan-400">{socMetrics.avgInvestTime}</strong>
          </div>
          <div className="bg-slate-900/60 p-2 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 uppercase block font-bold mb-1">False Positives reviewed</span>
            <strong className="text-sm font-black text-amber-500">{socMetrics.fpReviewCount} cases</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
