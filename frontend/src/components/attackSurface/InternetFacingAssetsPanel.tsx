import React, { useMemo } from "react";
import { ShieldAlert, Globe, ArrowUpRight } from "lucide-react";
import { Asset } from "./types";
import { cn } from "../../lib/utils";

interface InternetFacingAssetsPanelProps {
  assets: Asset[];
  onSelectAssetId?: (id: string) => void;
}

export function InternetFacingAssetsPanel({ assets, onSelectAssetId }: InternetFacingAssetsPanelProps) {
  // Filters out assets that reside in the DMZ (externally exposed / internet facing)
  const exposedAssets = useMemo(() => {
    return assets.filter((asset) => asset.zone === "DMZ");
  }, [assets]);

  const statusStyles = {
    Normal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20",
    Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse",
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400 font-extrabold";
    if (score >= 40) return "text-amber-600 dark:text-amber-450 font-bold";
    return "text-emerald-600 dark:text-emerald-450 font-semibold";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-70">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe size={12} className="text-amber-500 shrink-0" />
          <div className="truncate">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Internet Facing Assets
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Active external exposures (DMZ zone)
            </span>
          </div>
        </div>
        <span className="text-[8.5px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest shrink-0">
          {exposedAssets.length} Exposed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar my-2 text-[9px] font-mono">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground/80 font-black uppercase text-[7.5px] tracking-wider sticky top-0 bg-card select-none">
              <th className="py-1.5 pr-2">Hostname</th>
              <th className="py-1.5 px-2">Public IP</th>
              <th className="py-1.5 px-2">Service (Ports)</th>
              <th className="py-1.5 px-2 text-center">Status</th>
              <th className="py-1.5 pl-2 text-right">Fusion Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {exposedAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAssetId?.(asset.id)}
                className="hover:bg-muted/30 cursor-pointer transition-colors duration-100 group"
              >
                <td className="py-2 pr-2 font-bold text-foreground truncate max-w-22.5">
                  <span className="group-hover:text-cyan-500 group-hover:underline flex items-center gap-0.5">
                    {asset.hostname}
                    <ArrowUpRight size={8} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
                <td className="py-2 px-2 text-cyan-600 dark:text-cyan-400 font-bold">
                  {asset.ip}
                </td>
                <td className="py-2 px-2 text-muted-foreground truncate max-w-30">
                  {asset.services.slice(0, 1).join("")} ({asset.ports.join(", ")})
                </td>
                <td className="py-2 px-2 text-center">
                  <span className={cn("text-[7px] font-black uppercase tracking-wider px-1 py-0.2 rounded border leading-none inline-block", statusStyles[asset.status])}>
                    {asset.status}
                  </span>
                </td>
                <td className={cn("py-2 pl-2 text-right text-xs font-black", getRiskColor(asset.riskScore))}>
                  {asset.riskScore}
                </td>
              </tr>
            ))}

            {exposedAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted-foreground/60 uppercase tracking-widest text-[8px]">
                  No external DMZ assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5">
        DMZ networks scrutinized continuously
      </div>
    </div>
  );
}
