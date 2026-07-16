import React from "react";
import { Alert } from "../../../types";
import { Server, Database, Cloud } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AssetContextCardProps {
  alert: Alert;
}

export function AssetContextCard({ alert }: AssetContextCardProps) {
  const assetName = (alert as any).affectedAsset || `EC2-PROD-PAYMENT-${alert.destinationPort === 80 || alert.destinationPort === 443 ? "GW01" : "API02"}`;
  const criticality = alert.riskScore > 75 ? "CRITICAL" : "HIGH";

  return (
    <div className="space-y-4 select-none leading-none">
      <div className="flex items-center justify-between select-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            VULNERABLE ASSET INFORMATION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Asset Context and Priority
          </span>
        </div>
        <Server size={13} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-3.5 select-none text-[8.5px]">
        <div className="flex justify-between items-start leading-none select-none">
          <div className="flex items-center gap-2">
            <Cloud size={13} className="text-cyan-400" />
            <span className="font-mono font-black text-foreground uppercase tracking-tight truncate max-w-37.5">
              {assetName}
            </span>
          </div>

          <span className={cn(
            "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono",
            criticality === "CRITICAL" 
              ? "bg-red-500/10 border-red-500/25 text-red-400" 
              : "bg-orange-500/10 border-orange-500/25 text-orange-400"
          )}>
            {criticality} criticality
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-border/30">
          <div className="space-y-0.5">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase">Cloud Provider</span>
            <p className="text-[10px] font-mono font-black text-foreground uppercase">{alert.cloudProvider || "Unknown"}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase">Operating Region</span>
            <p className="text-[10px] font-mono font-black text-foreground uppercase">{alert.region || "Unknown"}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase">Target Host IP</span>
            <p className="text-[10px] font-mono font-black text-[#06b6d4] uppercase truncate">{alert.destinationIp}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase">Business Domain</span>
            <p className="text-[10px] font-black text-foreground uppercase">Finance - Gateway API</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AssetContextCard;
