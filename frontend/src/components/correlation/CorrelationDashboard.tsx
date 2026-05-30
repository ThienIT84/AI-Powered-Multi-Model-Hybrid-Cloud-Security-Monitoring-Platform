import React from "react";
import { IncidentClusterView } from "./IncidentClusterView";
import { IncidentTimeline } from "./IncidentTimeline";
import { AttackCampaignGraph } from "./AttackCampaignGraph";
import { MultiStageAttackFlow } from "./MultiStageAttackFlow";
import { Network, Activity, HelpCircle } from "lucide-react";

export function CorrelationDashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm select-none">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Network size={16} className="text-cyan-500 animate-pulse" />
            Security Incident Correlation Engine
          </h2>
          <p className="text-[9.5px] font-black text-muted-foreground uppercase tracking-wider mt-1">
            ADVANCED SYSTEMIC RECONSTRUCTION, ATTRIBUTION, AND TARGET CHAIN GROUPING
          </p>
        </div>

        <span className="text-[7.5px] font-black text-cyan-400 bg-cyan-400/5 px-2 py-1 rounded border border-cyan-400/15 uppercase tracking-widest">
           Engine Status: Correlating live
        </span>
      </div>

      {/* 2. Top row: Multi-stage Attack Flow sequential charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full">
          <MultiStageAttackFlow />
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full">
          <AttackCampaignGraph />
        </div>
      </div>

      {/* 3. Middle Timeline visualizer row */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <IncidentTimeline />
      </div>

      {/* 4. Bottom group list list indicators */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <IncidentClusterView />
      </div>
    </div>
  );
}
export default CorrelationDashboard;
