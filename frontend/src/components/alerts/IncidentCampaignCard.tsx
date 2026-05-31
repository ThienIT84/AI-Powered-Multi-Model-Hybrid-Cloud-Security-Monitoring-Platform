import React from "react";
import { CampaignSummaryPanel } from "./CampaignSummaryPanel";
import { Zap, Clock, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface IncidentCampaign {
  id: string;
  name: string;
  riskScore: number;
  affectedAssets: string[];
  duration: string;
  alertCount: number;
  stages: {
    stage: string;
    subtext: string;
    status: "pending" | "current" | "completed";
  }[];
  operator?: string;
  timelineEvents: {
    time: string;
    event: string;
    technique: string;
    severity: "Critical" | "High" | "Medium" | "Low";
  }[];
}

interface IncidentCampaignCardProps {
  key?: any;
  campaign: IncidentCampaign;
  isSelected: boolean;
  onSelect: () => void;
}

export function IncidentCampaignCard({ campaign, isSelected, onSelect }: IncidentCampaignCardProps) {
  const currentStage = campaign.stages.find(s => s.status === "current")?.stage || "Monitored";

  return (
    <div 
      onClick={onSelect}
      className={cn(
        "cursor-pointer p-4 border rounded-xl bg-card transition-all relative overflow-hidden select-none",
        isSelected 
          ? "border-cyan-500 bg-cyan-950/4 shadow-[0_0_12px_rgba(6,182,212,0.1)]" 
          : "border-border hover:border-border/80"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest font-mono">INCIDENT GROUP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <h4 className="text-[11px] font-black text-foreground uppercase tracking-wide">{campaign.name}</h4>
          <span className="text-[7.5px] text-muted-foreground uppercase font-semibold leading-none flex items-center gap-1">
            <Clock size={10} className="text-muted-foreground/60" /> {campaign.duration}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[7.5px] font-black text-muted-foreground block leading-none">RISK INDEX</span>
          <span className={cn(
            "text-xs font-mono font-black",
            campaign.riskScore > 75 ? "text-red-500" : "text-cyan-500"
          )}>{campaign.riskScore}/100</span>
        </div>
      </div>

      {/* Target 4: Attack Stages progression */}
      <div className="mt-4 pt-3 border-t border-border/35 space-y-2">
        <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block">ATTACK FLOW PROGRESSION</span>
        <div className="flex items-center justify-between gap-1">
          {campaign.stages.map((stg, i) => (
            <React.Fragment key={stg.stage}>
              <div 
                className={cn(
                  "flex-1 text-center p-1.5 rounded border border-dashed transition-colors",
                  stg.status === "completed" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                    : stg.status === "current"
                      ? "bg-red-500/15 border-red-500/50 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.1)] font-bold animate-pulse"
                      : "bg-muted/40 border-border/40 text-muted-foreground/50"
                )}
              >
                <div className="text-[7.5px] uppercase font-black tracking-tight truncate leading-none">{stg.stage}</div>
                <div className="font-mono text-[6px] tracking-normal uppercase truncate mt-0.5 leading-none opacity-80">{stg.subtext}</div>
              </div>
              {i < campaign.stages.length - 1 && (
                <ChevronRight size={10} className="text-muted-foreground/30 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Campaign Metadata Footer summary */}
      <div className="mt-3 flex items-center justify-between text-[7px] font-mono text-muted-foreground uppercase bg-secondary/30 p-1.5 rounded leading-none">
        <span>Alert Count: {campaign.alertCount} traces</span>
        <span>Assets: {campaign.affectedAssets.join(", ")}</span>
      </div>
    </div>
  );
}

export default IncidentCampaignCard;
