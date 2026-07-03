import React, { useMemo, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Settings, 
  Activity, 
  Database, 
  ShieldCheck, 
  Zap,
  RotateCcw
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface AIAnalyticsPanelProps {
  logs: NetworkLog[];
}

export const AIAnalyticsPanel: React.FC<AIAnalyticsPanelProps> = ({ logs }) => {
  // Local False Positive database state: allows analyst to mark anomalous flows as reviewed
  const [reviewedFalsePositives, setReviewedFalsePositives] = useState<Record<string, "TRUE_POSITIVE" | "FALSE_POSITIVE">>({});

  // 1. COMPUTE SERVICE DIVERSITY STACKED DISTRIBUTION
  const serviceDiversityData = useMemo(() => {
    const services = {
      HTTP: 0,
      HTTPS: 0,
      SSH: 0,
      DNS: 0,
      FTP: 0,
      ICMP: 0,
      Unknown: 0
    };

    logs.forEach(l => {
      if (l.protocol === "ICMP") services.ICMP++;
      else if (l.destPort === 80) services.HTTP++;
      else if (l.destPort === 443) services.HTTPS++;
      else if (l.destPort === 22) services.SSH++;
      else if (l.destPort === 53 || l.srcPort === 5353) services.DNS++;
      else if (l.destPort === 21) services.FTP++;
      else services.Unknown++;
    });

    return Object.entries(services).map(([name, value]) => ({
      name,
      count: value,
      trainingCount: Math.round(value * 0.95 + 10) // Mock training baseline comparison
    }));
  }, [logs]);

  // 2. COMPUTE AI2A ATTACK RATIOS FOR PIE CHART
  const attackDistribution = useMemo(() => {
    const counts = {
      "Port Scan": 0,
      "DoS / Exploit": 0,
      "Brute Force": 0,
      "Botnet Proxy": 0,
      "Normal Traffic": 0
    };

    logs.forEach(l => {
      if (l.verdict === "NORMAL") {
        counts["Normal Traffic"]++;
      } else {
        const r = l.reason.toLowerCase();
        if (r.includes("scan") || l.id.includes("scan")) counts["Port Scan"]++;
        else if (r.includes("leak") || r.includes("exfil")) counts["Botnet Proxy"]++;
        else if (l.destPort === 22) counts["Brute Force"]++;
        else counts["DoS / Exploit"]++;
      }
    });

    const colors = {
      "Port Scan": "#ef4444",
      "DoS / Exploit": "#f97316",
      "Brute Force": "#fbbf24",
      "Botnet Proxy": "#3b82f6",
      "Normal Traffic": "#10b981"
    };

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name as keyof typeof colors] || "#64748b"
      }));
  }, [logs]);

  // 3. AI1 ANOMALY HISTOGRAM DISTRIBUTION (0 - 100 in 5 ranges)
  const scoreBins = useMemo(() => {
    const bins = [
      { range: "0 - 20", label: "Clean", count: 0 },
      { range: "20 - 40", label: "Low", count: 0 },
      { range: "40 - 60", label: "Heuristic", count: 0 },
      { range: "60 - 80", label: "Anomaly Alert", count: 0 },
      { range: "80 - 100", label: "Critical Threat", count: 0 }
    ];

    logs.forEach(l => {
      const score = l.threatScore;
      if (score <= 20) bins[0].count++;
      else if (score <= 40) bins[1].count++;
      else if (score <= 60) bins[2].count++;
      else if (score <= 80) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [logs]);

  // 4. CONFIDENCE BINS HISTOGRAM (0-20% to 80-100%)
  const confidenceBins = useMemo(() => {
    const bins = [
      { min: 0, max: 20, name: "0-20%", count: 0 },
      { min: 20, max: 40, name: "20-40%", count: 0 },
      { min: 40, max: 60, name: "40-60%", count: 0 },
      { min: 60, max: 80, name: "60-80%", count: 0 },
      { min: 80, max: 100, name: "80-100%", count: 0 }
    ];

    logs.forEach(l => {
      const confidence = l.confidence;
      const match = bins.find(b => confidence >= b.min && confidence <= b.max);
      if (match) match.count++;
    });

    return bins;
  }, [logs]);

  // 5. DATASET DRIFT MONITOR (Population Stability Index - PSI)
  // PSI formula: Sum( (Current% - Reference%) * ln(Current% / Reference%) )
  const datasetDriftMetric = useMemo(() => {
    // Generate simulated PSI index dynamically based on log characteristics
    const anomaliesCount = logs.filter(l => l.verdict === "ANOMALY").length;
    // Massive spikes shift PSI higher:
    const basePSI = anomaliesCount > 8 ? 0.28 : anomaliesCount > 4 ? 0.14 : 0.04;
    const psiScore = parseFloat((basePSI + Math.min(0.015, logs.length * 0.0005)).toFixed(3));

    let status: "HEALTHY" | "WARNING" | "CRITICAL_DRIFT" = "HEALTHY";
    let color = "text-emerald-450 bg-emerald-950/30 border-emerald-500/30";
    if (psiScore >= 0.25) {
      status = "CRITICAL_DRIFT";
      color = "text-red-400 bg-red-950/40 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse";
    } else if (psiScore >= 0.10) {
      status = "WARNING";
      color = "text-amber-400 bg-amber-950/20 border-amber-500/20";
    }

    return {
      psiScore,
      status,
      color,
      mismatchPercent: Math.round(psiScore * 100 + 4),
      domainSimilarity: Math.round(98 - (psiScore * 40))
    };
  }, [logs]);

  // 6. TOP ATTACK SOURCES & TARGET VISUALS
  const threatTargets = useMemo(() => {
    const sources: Record<string, { count: number; country: string }> = {};
    const targets: Record<string, number> = {};

    logs.forEach(l => {
      if (l.verdict === "ANOMALY") {
        sources[l.srcIp] = {
          count: (sources[l.srcIp]?.count || 0) + 1,
          country: l.country
        };
        targets[l.destIp] = (targets[l.destIp] || 0) + 1;
      }
    });

    const topSrc = Object.entries(sources)
      .map(([ip, data]) => ({ ip, count: data.count, country: data.country }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const topDest = Object.entries(targets)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return { topSrc, topDest };
  }, [logs]);

  // 7. GET HIGHEST ANOMALOULY RATED WORKBOOKS (TOP SUSPICIOUS FLOWS)
  const topSuspiciousFlows = useMemo(() => {
    return logs
      .filter(l => l.verdict === "ANOMALY")
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, 5);
  }, [logs]);

  const toggleFalsePositive = (id: string, classification: "TRUE_POSITIVE" | "FALSE_POSITIVE") => {
    setReviewedFalsePositives(prev => ({
      ...prev,
      [id]: prev[id] === classification ? undefined as any : classification
    }));
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono" id="ai-analytics-panel-root">
      
      {/* ROW 1: AI KPI GRID STATUS & PSI DRIFT COOPERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Dataset Drift Monitor Widget */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 flex flex-col justify-between shadow-xs relative">
          <div>
            <div className="flex items-center gap-1.5 mb-2 border-b border-slate-900 pb-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                DATASET DRIFT MONITOR (PSI)
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              Population Stability Index computes discrepancies between real-time inference profiles and models training dataset vectors.
            </p>

            <div className="mt-4 space-y-3">
              {/* PSI Circle / Metric Display */}
              <div className="flex items-center gap-4">
                <div className={`text-center px-4 py-2 rounded-lg border font-black text-lg ${datasetDriftMetric.color}`}>
                  {datasetDriftMetric.psiScore}
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 font-extrabold uppercase">DRIFT VERDICT STATUS:</div>
                  <div className="text-xs font-black uppercase text-slate-100">{datasetDriftMetric.status}</div>
                  <span className="text-[9px] text-slate-400 leading-none">
                    {datasetDriftMetric.psiScore < 0.10 ? "Optimal system stability." : datasetDriftMetric.psiScore < 0.25 ? "Caution: Low validation divergence." : "Model retrain recommended!"}
                  </span>
                </div>
              </div>

              {/* Progress and semantic statistics */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900/40 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mismatched Feature Weight:</span>
                  <span className="text-slate-200 font-bold">{datasetDriftMetric.mismatchPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validation Domain Similarity:</span>
                  <span className="text-emerald-400 font-bold">{datasetDriftMetric.domainSimilarity}% Match</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded text-[8px] text-slate-500 mt-2">
            Baseline models parameters: Zeek conn.log v3-A.
          </div>
        </div>

        {/* Attack Pie Distribution Chart */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-3 border-b border-slate-900 pb-1.5">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              AI2A ATTACK CLASSIFICATION
            </h3>
          </div>

          <div className="h-45 w-full flex items-center justify-center relative">
            {attackDistribution.length === 0 ? (
              <span className="text-[10px] text-slate-500">No anomalous classifications available.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attackDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontFamily: "monospace", fontSize: 9 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Color Legend inline style */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8px] font-bold text-slate-400 mt-1 uppercase justify-center">
            {attackDistribution.map((item, id) => (
              <div key={id} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution Histogram */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-3 border-b border-slate-900 pb-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              MODEL CONFIDENCE SPECTRUM
            </h3>
          </div>

          <div className="h-45 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceBins} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(148,163,184,0.02)" }}
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontFamily: "monospace", fontSize: 9 }}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[2, 2, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[8.5px] text-slate-500 uppercase text-center mt-2.5">
            Confidence percentage of classification outputs
          </p>
        </div>
      </div>

      {/* ROW 2: AI1 ANOMALY HISTOGRAMS AND SERVICE DIVERSITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* AI1 Score Frequency Histogram */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 border-b border-slate-900 pb-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              AI1 ANOMALY SCORE FREQUENCY HISTOGRAM
            </h3>
          </div>

          <div className="h-52.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBins} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.02)" vertical={false} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={8} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(16,185,129,0.01)" }}
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontFamily: "monospace", fontSize: 9 }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[8.5px] text-slate-500 uppercase flex justify-between px-2 pt-1">
            <span>0-20 (Optimal)</span>
            <span>60-100 (Suspicious/Anomalon)</span>
          </div>
        </div>

        {/* Dataset Quality / Service Diversity Model */}
        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 border-b border-slate-900 pb-1.5">
            <Database className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              SERVICE DIVERSITY MONITOR (SYSTEM VS DRYSET)
            </h3>
          </div>

          <div className="h-52.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDiversityData} margin={{ top: 10, right: 5, left: -32, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.02)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontFamily: "monospace", fontSize: 9 }}
                />
                <Bar dataKey="count" name="Current Real-time" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={15} />
                <Bar dataKey="trainingCount" name="Training Baseline" fill="#1e293b" radius={[2, 2, 0, 0]} maxBarSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[8px] text-slate-500 uppercase flex justify-center gap-6 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-xs" /> Real-time Streams
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-800 rounded-xs" /> Training References
            </span>
          </div>
        </div>
      </div>

      {/* ROW 3: RECTIFIED FALSE POSITIVES ANALYST LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Top Suspicious Log flows and False positive marker */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                AI1 TOP CRITICAL HEURISTICS & FP WORKBENCH REVIEW
              </h3>
            </div>
            <span className="text-[8px] text-slate-500 border border-slate-800 px-1.5 rounded">Actionable Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-slate-905 text-slate-500 font-extrabold pb-1">
                  <th className="py-1">Flow UID</th>
                  <th className="py-1">Source IP</th>
                  <th className="py-1">Dest IP</th>
                  <th className="py-1 text-center">Threat Score</th>
                  <th className="py-1 text-right">Analyst Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {topSuspiciousFlows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 italic text-[9px]">
                      No anomalous streams available inside current workbench memory.
                    </td>
                  </tr>
                ) : (
                  topSuspiciousFlows.map((log) => {
                    const status = reviewedFalsePositives[log.id];

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/30">
                        <td className="py-1.5 text-slate-400 font-extrabold">{log.id}</td>
                        <td className="py-1.5 font-bold text-slate-200">{log.srcIp}</td>
                        <td className="py-1.5 text-slate-400">{log.destIp}</td>
                        <td className="py-1.5 text-center font-bold text-red-400">{log.threatScore}/100</td>
                        <td className="py-1.5 text-right space-x-1">
                          <button
                            onClick={() => toggleFalsePositive(log.id, "TRUE_POSITIVE")}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer border uppercase tracking-wider ${
                              status === "TRUE_POSITIVE"
                                ? "bg-red-950 text-red-400 border-red-500/20"
                                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-red-400"
                            }`}
                          >
                            True Positive
                          </button>
                          <button
                            onClick={() => toggleFalsePositive(log.id, "FALSE_POSITIVE")}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer border uppercase tracking-wider ${
                              status === "FALSE_POSITIVE"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-emerald-400"
                            }`}
                          >
                            False Positive
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Attack Sources and targets list */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs text-xs space-y-4">
          {/* Top Sources */}
          <div>
            <div className="text-[9px] font-black text-slate-500 tracking-widest border-b border-slate-900 pb-1 mb-2">
              TOP ATTACK SOURCE ENDPOINTS
            </div>
            <div className="space-y-1.5">
              {threatTargets.topSrc.length === 0 ? (
                <span className="text-[10px] text-slate-500 block">Waiting on intrusion telemetry...</span>
              ) : (
                threatTargets.topSrc.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-1 h-2 bg-red-500 block" /> {item.ip}
                    </span>
                    <span className="text-slate-500 font-bold">{item.count} attacks ({item.country})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Targets */}
          <div>
            <div className="text-[9px] font-black text-slate-500 tracking-widest border-b border-slate-900 pb-1 mb-2">
              TOP ATTACK DEST TARGETS (VICTIM NODES)
            </div>
            <div className="space-y-1.5">
              {threatTargets.topDest.length === 0 ? (
                <span className="text-[10px] text-slate-500 block">No targeted compromise files registered.</span>
              ) : (
                threatTargets.topDest.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <span className="w-1 h-2 bg-blue-500 block" /> {item.ip}
                    </span>
                    <span className="text-slate-500 font-bold">{item.count} payloads intercepted</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
