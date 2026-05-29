import React from "react";
import { cn } from "../../lib/utils";
import { EndpointAsset } from "./endpointConfig";
import { Monitor, AlertTriangle, BrainCircuit, WifiOff, Activity, ShieldAlert, Cpu, Heart } from "lucide-react";

interface EndpointStatsProps {
  endpoints: EndpointAsset[];
}

export function EndpointStats({ endpoints }: EndpointStatsProps) {
  // Compute metrics from dataset
  const total = endpoints.length;
  const activeCount = endpoints.filter(e => e.status !== "OFFLINE").length;
  const compromisedCount = endpoints.filter(e => e.status === "CRITICAL").length;
  const warningCount = endpoints.filter(e => e.status === "WARNING").length;
  const aiMonitored = endpoints.filter(e => e.agentStatus === "INSTALLED").length;
  const offlineCount = endpoints.filter(e => e.status === "OFFLINE").length;
  
  // Averages/aggregates
  const totalCpuActive = endpoints.reduce((acc, curr) => acc + (curr.status !== "OFFLINE" ? curr.cpuUsage : 0), 0);
  const avgCpu = activeCount > 0 ? Math.round(totalCpuActive / activeCount) : 0;
  
  // Latency simulation (e.g. higher risk/critical leads to slightly higher latency anomalies)
  const avgLatency = 38; 
  // Exposure Score calculation bases on risk score average
  const avgRiskScore = Math.round(endpoints.reduce((acc, curr) => acc + curr.riskScore, 0) / total);

  // Region metrics summary
  const regionsSummary = { US: 0, EU: 0, APAC: 0 };
  endpoints.forEach(e => {
    if (e.region.includes("US")) regionsSummary.US++;
    else if (e.region.includes("EU")) regionsSummary.EU++;
    else regionsSummary.APAC++;
  });

  // Simple clean SVG Sparkline component
  const Sparkline = ({ values, colorClass = "stroke-cyan-500" }: { values: number[]; colorClass?: string }) => {
    if (values.length === 0) return null;
    const max = Math.max(...values, 10);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={colorClass}
          points={points}
        />
      </svg>
    );
  };

  const statCards = [
    {
      title: "Active Endpoints",
      value: `${activeCount}/${total}`,
      label: "Live assets handshake active",
      icon: Monitor,
      color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5",
      iconColor: "text-emerald-500",
      sparkline: [3, 22, 23, 24, 23, 24, 24, 24, 23, 24],
      sparklineColor: "stroke-emerald-500",
    },
    {
      title: "Compromised Nodes",
      value: compromisedCount,
      label: "Active incident isolation needed",
      icon: AlertTriangle,
      color: compromisedCount > 0 
        ? "text-red-500 border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]" 
        : "text-zinc-400 border-zinc-500/10 bg-card",
      iconColor: compromisedCount > 0 ? "text-red-500 animate-pulse" : "text-muted-foreground",
      sparkline: [0, 1, 0, 2, 3, 2, 3, 3, 2, compromisedCount],
      sparklineColor: "stroke-red-500",
    },
    {
      title: "AI Monitored Nodes",
      value: aiMonitored,
      label: "Security agent actively telemetry",
      icon: BrainCircuit,
      color: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5",
      iconColor: "text-cyan-500",
      sparkline: [18, 19, 19, 21, 20, 21, 21, 22, 21, aiMonitored],
      sparklineColor: "stroke-cyan-500",
    },
    {
      title: "Offline Nodes",
      value: offlineCount,
      label: "Heartbeats timeout breached",
      icon: WifiOff,
      color: "text-zinc-500 border-zinc-500/10 bg-card",
      iconColor: "text-zinc-500",
      sparkline: [3, 3, 2, 2, 3, 3, 4, 3, 3, offlineCount],
      sparklineColor: "stroke-zinc-400",
    },
    {
      title: "Avg Latency",
      value: `${avgLatency} ms`,
      label: "Node ping jitter standard deviation",
      icon: Activity,
      color: "text-indigo-400 border-indigo-500/10 bg-indigo-505/5 bg-indigo-500/5",
      iconColor: "text-indigo-500",
      sparkline: [38, 41, 37, 39, 42, 36, 35, 38, 40, 38],
      sparklineColor: "stroke-indigo-500",
    },
    {
      title: "Packet Throughput",
      value: "4.8 Gbps",
      label: "VPC mirror network log ingest speed",
      icon: Cpu,
      color: "text-blue-400 border-blue-500/10 bg-blue-500/5",
      iconColor: "text-blue-500",
      sparkline: [40, 42, 48, 55, 60, 48, 52, 58, 62, 48],
      sparklineColor: "stroke-blue-500",
    },
    {
      title: "Threat Exposure Score",
      value: `${avgRiskScore}%`,
      label: "Aggregate environment risk index",
      icon: ShieldAlert,
      color: avgRiskScore > 40 
        ? "text-amber-500 border-amber-500/10 bg-amber-500/5" 
        : "text-cyan-400 border-cyan-500/10 bg-cyan-500/5",
      iconColor: avgRiskScore > 40 ? "text-amber-500" : "text-cyan-500",
      sparkline: [31, 35, 33, 40, 38, 32, 29, 34, 33, avgRiskScore],
      sparklineColor: avgRiskScore > 40 ? "stroke-amber-500" : "stroke-cyan-500",
    },
    {
      title: "Regional Distribution",
      value: `${regionsSummary.APAC}/${regionsSummary.US}/${regionsSummary.EU}`,
      label: "APAC / US / EU deployments",
      icon: Heart,
      color: "text-teal-400 border-teal-500/10 bg-teal-500/5",
      iconColor: "text-teal-500",
      sparkline: [10, 11, 10, 12, 11, 11, 12, 11, 10, regionsSummary.US + regionsSummary.EU],
      sparklineColor: "stroke-teal-500",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => {
        const IconComponent = stat.icon;
        return (
          <div
            id={`stat-card-${i}`}
            key={stat.title}
            className={cn(
              "p-4 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden group select-none hover:shadow-[0_0_12px_rgba(6,182,212,0.05)]",
              stat.color
            )}
          >
            {/* Tech line indicator in card */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/5 group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest block leading-none">
                  {stat.title}
                </span>
                <span className="text-2xl font-black tracking-tight block font-mono">
                  {stat.value}
                </span>
              </div>
              
              <div className={cn("p-2 rounded-lg border border-border bg-card/40 shrink-0", stat.iconColor)}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-border/40 font-mono text-[9px] text-muted-foreground">
              <span className="uppercase tracking-wide leading-none truncate block max-w-32.5">
                {stat.label}
              </span>
              <div className="shrink-0">
                <Sparkline values={stat.sparkline} colorClass={stat.sparklineColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
