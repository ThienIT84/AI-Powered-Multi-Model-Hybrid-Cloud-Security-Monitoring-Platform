import React from "react";
import { Network, Server, Cloud, Globe, Shield, Activity } from "lucide-react";
import { Asset } from "./types";
import { cn } from "../../lib/utils";

interface InfrastructureMapProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAssetId: (id: string) => void;
}

export function InfrastructureMap({
  assets,
  selectedAssetId,
  onSelectAssetId,
}: InfrastructureMapProps) {
  // Group assets into the three defined tactical segments
  const onPremAssets = assets.filter((a) => a.zone === "On-Prem" || a.zone === "Internal Network");
  const dmzAssets = assets.filter((a) => a.zone === "DMZ");
  const awsAssets = assets.filter((a) => a.zone === "AWS Cloud");

  // Dot styles by resource status
  const statusStyles = {
    Normal: {
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      border: "border-emerald-500/30 bg-emerald-500/[0.03] hover:border-emerald-500/50",
      text: "text-emerald-600 dark:text-emerald-400"
    },
    Warning: {
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse",
      border: "border-amber-500/30 bg-amber-500/[0.03] hover:border-amber-500/50",
      text: "text-amber-600 dark:text-amber-400"
    },
    Critical: {
      dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-ping-custom",
      border: "border-red-500/30 bg-red-500/[0.03] hover:border-red-500/50",
      text: "text-red-650 dark:text-red-400"
    }
  };

  const renderNodeCell = (asset: Asset) => {
    const isSelected = selectedAssetId === asset.id;
    const style = statusStyles[asset.status] || statusStyles.Normal;

    return (
      <button
        key={asset.id}
        type="button"
        onClick={() => onSelectAssetId(asset.id)}
        className={cn(
          "w-full text-left p-2.5 rounded-lg border transition-all text-[9.5px] font-mono group relative overflow-hidden flex items-center justify-between",
          style.border,
          isSelected ? "border-cyan-500 bg-cyan-500/6 shadow-sm font-bold" : ""
        )}
      >
        <div className="space-y-0.5 truncate">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
            <span className="text-foreground tracking-wide font-black truncate text-[10px]">
              {asset.hostname}
            </span>
          </div>
          <p className="text-muted-foreground/80 font-bold tracking-wider text-[8px]">
            {asset.ip}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[7.5px] font-bold text-muted-foreground uppercase bg-muted/60 border border-border/60 px-1 py-0.5 rounded leading-none">
            {asset.type}
          </span>
          <span className={cn("block text-[8px] font-black mt-1", style.text)}>
            FUSION RISK {asset.riskScore}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col space-y-4 select-none h-95">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Network size={12} className="text-[#06b6d4]" />
          <div>
            <h4 className="text-[9.5px] font-black text-foreground uppercase tracking-[0.2em] leading-none">
              HYBRID INFRASTRUCTURE TOPO
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Zoned Asset Topology Discovery
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[7.5px] font-mono font-black text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>NORMAL</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span>WARNING</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span>CRITICAL</span>
          </div>
        </div>
      </div>

      {/* Grid segments representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-stretch">
        {/* On-Prem Segment */}
        <div className="border border-border/45 rounded-lg p-3 bg-muted/35 dark:bg-[#030712]/35 flex flex-col space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Server size={11} className="text-amber-500" />
            <span className="text-[8.5px] font-mono font-black tracking-widest text-[#f59e0b] uppercase">
              ON-PREM / INT LAN ({onPremAssets.length})
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-62.5 custom-scrollbar pr-1">
            {onPremAssets.map(renderNodeCell)}
          </div>
        </div>

        {/* DMZ Segment */}
        <div className="border border-border/45 rounded-lg p-3 bg-muted/35 dark:bg-[#030712]/35 flex flex-col space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Globe size={11} className="text-[#06b6d4]" />
            <span className="text-[8.5px] font-mono font-black tracking-widest text-[#06b6d4] uppercase">
              DMZ OUT-FACING ({dmzAssets.length})
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-62.5 custom-scrollbar pr-1">
            {dmzAssets.map(renderNodeCell)}
          </div>
        </div>

        {/* AWS Resources */}
        <div className="border border-border/45 rounded-lg p-3 bg-muted/35 dark:bg-[#030712]/35 flex flex-col space-y-2.5">
          <div className="flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Cloud size={11} className="text-blue-500 dark:text-blue-400" />
            <span className="text-[8.5px] font-mono font-black tracking-widest text-blue-500 dark:text-blue-400 uppercase">
              AWS EC2 / S3 / RDS ({awsAssets.length})
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-62.5 custom-scrollbar pr-1">
            {awsAssets.map(renderNodeCell)}
          </div>
        </div>
      </div>
    </div>
  );
}
