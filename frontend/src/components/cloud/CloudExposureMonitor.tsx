import React, { useMemo } from "react";
import { CloudAsset } from "./types";
import { Eye, ShieldAlert, Globe, Server, CheckCircle2, AlertTriangle } from "lucide-react";

interface CloudExposureMonitorProps {
  assets: CloudAsset[];
}

export function CloudExposureMonitor({ assets }: CloudExposureMonitorProps) {
  // Filter exposed assets
  const exposedAssets = useMemo(() => {
    return assets.filter((a) => a.isInternetExposed);
  }, [assets]);

  // Derive average exposure score
  const avgExposureScore = useMemo(() => {
    if (exposedAssets.length === 0) return 0;
    return Math.round(
      exposedAssets.reduce((sum, a) => sum + a.exposureScore, 0) / exposedAssets.length
    );
  }, [exposedAssets]);

  // Group open ports
  const openPortsList = useMemo(() => {
    const ports = exposedAssets.flatMap((a) => a.openPorts || []);
    const frequency: Record<number, number> = {};
    ports.forEach((p) => {
      frequency[p] = (frequency[p] || 0) + 1;
    });
    return Object.entries(frequency)
      .map(([port, count]) => ({ port: parseInt(port), count }))
      .sort((a, b) => b.count - a.count);
  }, [exposedAssets]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="cloud-exposure-monitor">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-3 select-none">
        <div>
          <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono flex items-center gap-2">
            <Globe size={14} className="text-cyan-500 animate-pulse" />
            Internet Exposure Monitor
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Real-time public ingress mapping and perimeter port analysis
          </p>
        </div>
        <div className="text-[8.5px] font-mono bg-red-500/10 text-red-650 dark:text-red-400 px-2 py-0.5 rounded uppercase font-black w-fit">
          Exposed Nodes: {exposedAssets.length}
        </div>
      </div>

      {/* Aggregate Exposure Scores Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4 select-none">
        <div className="bg-muted/15 border border-border/60 rounded-lg p-2 flex flex-col justify-between font-mono">
          <span className="text-[7.5px] text-muted-foreground uppercase font-black leading-none">Overall Exposure Score</span>
          <div className="text-sm font-black text-red-600 dark:text-red-400 mt-1">
            {avgExposureScore} / 100
          </div>
        </div>

        <div className="bg-muted/15 border border-border/60 rounded-lg p-2 flex flex-col justify-between font-mono">
          <span className="text-[7.5px] text-muted-foreground uppercase font-black leading-none">Attack Surface Size</span>
          <div className="text-sm font-black text-foreground mt-1">
            {exposedAssets.length} Public Hosts
          </div>
        </div>

        <div className="bg-muted/15 border border-border/60 rounded-lg p-2 flex flex-col justify-between font-mono col-span-2 lg:col-span-1">
          <span className="text-[7.5px] text-muted-foreground uppercase font-black leading-none">Top Exposed Ingress Ports</span>
          <div className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 mt-1 flex gap-1 font-mono uppercase">
            {openPortsList.map((p) => p.port).slice(0, 3).join(", ") || "None"}
          </div>
        </div>
      </div>

      {/* Exposed Nodes List */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
        {exposedAssets.length === 0 ? (
          <p className="text-[10px] font-mono italic text-center p-4 text-muted-foreground">
            No internet facing assets mapped in current configuration.
          </p>
        ) : (
          exposedAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-muted/20 border border-border/50 rounded-lg p-2.5 font-mono text-[9px] hover:border-cyan-500/10 transition-all"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/20 pb-1.5 mb-1.5">
                <div>
                  <div className="font-extrabold text-foreground uppercase tracking-tight text-[9.5px]">
                    {asset.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[7.5px] text-slate-500 font-bold font-sans uppercase">
                    <span>Region: {asset.region}</span>
                    <span>•</span>
                    <span>Service: {asset.service}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[7px] text-zinc-400 block uppercase font-bold leading-none">Risk Rank</span>
                  <span className={`text-[10px] font-black uppercase ${
                    asset.riskScore >= 80 ? "text-red-600 dark:text-red-400" :
                    asset.riskScore >= 50 ? "text-amber-500" :
                    "text-emerald-500"
                  }`}>
                    {asset.riskScore >= 80 ? "Critical" : asset.riskScore >= 50 ? "High Risk" : "Medium"}
                  </span>
                </div>
              </div>

              {/* Endpoints & Ports */}
              <div className="space-y-1 mt-1 text-[8.5px] leading-relaxed">
                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[7.5px] font-mono">Public Endpoints:</span>
                  <div className="text-zinc-600 dark:text-zinc-300 font-semibold break-all mt-0.5">
                    {asset.publicEndpoints?.join(", ") || "No static entry"}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-muted-foreground uppercase font-bold text-[7.5px] font-mono">Open Inbound Ports:</span>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {asset.openPorts?.map((port) => (
                      <span
                        key={port}
                        className={`px-1.5 py-0.2 rounded font-black text-[7.5px] border ${
                          port === 22 || port === 80 ? "bg-red-500/10 text-red-500 border-red-500/25" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                        }`}
                      >
                        {port}
                      </span>
                    )) || <span className="text-zinc-400 italic">None</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default CloudExposureMonitor;
