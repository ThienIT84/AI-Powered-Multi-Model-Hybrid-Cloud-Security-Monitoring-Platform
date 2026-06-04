import React from "react";
import { IncidentCampaign } from "./IncidentCampaignCard";
import { ShieldCheck, Flame, Server, ShieldX, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface CampaignSummaryPanelProps {
  campaign: IncidentCampaign;
}

export function CampaignSummaryPanel({ campaign }: CampaignSummaryPanelProps) {
  return (
    <div className="space-y-4">
      {/* Target 4 Header Summary */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-red-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
            Campaign #{campaign.id} Overview
          </h3>
        </div>
        <span className={cn(
          "font-mono text-[7px] font-black uppercase px-2 py-0.5 border rounded-full",
          campaign.riskScore > 75 
            ? "border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.1)]" 
            : "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
        )}>
          {campaign.riskScore > 75 ? "Active Outbreak" : "Under Watch"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/10 border border-border p-2.5 rounded-lg">
          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">CAMPAIGN RISK</span>
          <span className={cn(
            "text-base font-black font-mono block mt-1 leading-none",
            campaign.riskScore > 75 ? "text-red-500" : "text-cyan-500"
          )}>{campaign.riskScore}</span>
        </div>

        <div className="bg-secondary/10 border border-border p-2.5 rounded-lg">
          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">OUTBREAK SPAN</span>
          <span className="text-xs font-black text-foreground block mt-1 leading-none">{campaign.duration}</span>
        </div>

        <div className="bg-secondary/10 border border-border p-2.5 rounded-lg">
          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">SIGNALS CAPTURED</span>
          <span className="text-xs font-mono font-black text-foreground block mt-1 leading-none">{campaign.alertCount} events</span>
        </div>

        <div className="bg-secondary/10 border border-border p-2.5 rounded-lg">
          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">AFFECTED HOSTS</span>
          <span className="text-xs font-black text-cyan-500 block mt-1 leading-none truncate">{campaign.affectedAssets.join(", ")}</span>
        </div>
      </div>

      {// Attacked Hosts visualization
      }
      <div className="bg-background border border-border/80 p-3 rounded-xl space-y-2">
        <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block font-mono">CRITICAL PATHWAY DISCOVERIES</span>
        <div className="divide-y divide-border/25 leading-none">
          {campaign.affectedAssets.map((asset, i) => (
            <div key={asset} className="py-2 flex items-center justify-between text-[8.5px] leading-none">
              <div className="flex items-center gap-1.5 font-mono">
                <Server size={11} className="text-muted-foreground" />
                <span className="font-extrabold text-foreground">{asset}</span>
              </div>
              <span className="text-red-400 font-bold bg-red-400/5 px-2 py-0.5 rounded border border-red-500/10 text-[7px] font-mono tracking-wider">
                Exfiltrated Nodes Detected
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampaignSummaryPanel;
