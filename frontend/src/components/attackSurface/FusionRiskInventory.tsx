import React, { useMemo } from "react";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Asset } from "./types";
import { cn } from "../../lib/utils";

interface FusionRiskInventoryProps {
  assets: Asset[];
  onSelectAssetId?: (id: string) => void;
}

export function FusionRiskInventory({ assets, onSelectAssetId }: FusionRiskInventoryProps) {
  // Filters out assets that possess Fusion Risk Score >= 80
  const highRiskAssets = useMemo(() => {
    return assets.filter((asset) => asset.riskScore >= 80);
  }, [assets]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-70">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertCircle size={12} className="text-red-500 shrink-0 animate-pulse" />
          <div className="truncate">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              High Fusion Risk Assets
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Fusion risk index score &gt;= 80
            </span>
          </div>
        </div>
        <span className="text-[8.5px] font-mono bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest shrink-0">
          {highRiskAssets.length} Critical
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar my-2 text-[9px] font-mono">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground/80 font-black uppercase text-[7.5px] tracking-wider sticky top-0 bg-card select-none">
              <th className="py-1.5 pr-2">Hostname</th>
              <th className="py-1.5 px-2">Zone</th>
              <th className="py-1.5 px-2 text-center">Fusion Risk</th>
              <th className="py-1.5 px-2 text-center">Open Alerts</th>
              <th className="py-1.5 pl-2 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {highRiskAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAssetId?.(asset.id)}
                className="hover:bg-muted/30 cursor-pointer transition-colors duration-100 group"
              >
                <td className="py-2 pr-2 font-bold text-foreground truncate max-w-27.5">
                  <span className="group-hover:text-red-500 group-hover:underline flex items-center gap-0.5">
                    {asset.hostname}
                    <ArrowUpRight size={8} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
                <td className="py-2 px-2 text-muted-foreground uppercase text-[8px] truncate max-w-22.5">
                  {asset.zone}
                </td>
                <td className="py-2 px-2 text-center font-black text-red-600 dark:text-red-450 text-xs">
                  {asset.riskScore}
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="text-red-650 dark:text-red-400 bg-red-500/10 px-1 py-0.5 rounded text-[8px] font-black border border-red-500/20">
                    {asset.openAlerts} ACT
                  </span>
                </td>
                <td className="py-2 pl-2 text-right text-muted-foreground/80 text-[7.8px]">
                  {asset.lastSeen}
                </td>
              </tr>
            ))}

            {highRiskAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted-foreground/60 uppercase tracking-widest text-[8px]">
                  All hybrid assets are below high risk levels
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5">
        Reflecting instant AI1 + AI2A + AI2B + Suricata aggregation
      </div>
    </div>
  );
}
