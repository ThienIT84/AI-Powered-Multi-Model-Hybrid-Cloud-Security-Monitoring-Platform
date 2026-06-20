import React from "react";
import { 
  Database, 
  Brain, 
  Flame, 
  ArrowRight,
  Shield,
  Activity
} from "lucide-react";
import { Alert } from "../../types";
import { cn } from "../../lib/utils";

interface FusionDecisionFlowProps {
  alert: Alert;
}

export function FusionDecisionFlow({ alert }: FusionDecisionFlowProps) {
  const steps = [
    {
      id: "zeek",
      title: "Zeek Ingestion",
      desc: "Raw L3/L4 flows (conn.log) and application payloads (http.log) parsed from tap interface.",
      icon: Database,
      badge: "Traffic Origin",
      colorClass: "border-cyan-500/15 bg-cyan-500/[0.03] text-cyan-500"
    },
    {
      id: "ai",
      title: "AI Model Inference",
      desc: "Deep isolation behavior forests & neural features classification run asynchronously.",
      icon: Brain,
      badge: "Anomalous Sign",
      colorClass: "border-purple-500/15 bg-purple-500/[0.03] text-purple-400"
    },
    {
      id: "fusion",
      title: "Consolidated Fusion",
      desc: "Consensus analysis aggregates telemetry inputs and scores incident integrity.",
      icon: Flame,
      badge: "Consensus Synthesis",
      colorClass: "border-orange-500/15 bg-orange-500/[0.03] text-orange-400"
    },
    {
      id: "final",
      title: "Final Correlated Threat",
      desc: "Actionable alert dispatched with exact MITRE tactics and Suricata static signatures.",
      icon: Shield,
      badge: "SOC Queue Dispatched",
      colorClass: "border-red-500/15 bg-red-500/[0.03] text-red-400"
    }
  ];

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* Trace Header */}
      <div className="flex items-center justify-between border-b border-borderpb-2 mb-2">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            DECISION ENGINE FLOW TRACE
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Ingestion-to-Alert Simplified Path
          </h3>
        </div>
        <Activity size={12} className="text-cyan-500 animate-pulse" />
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-3 relative">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col">
              {/* Graphic Connector line */}
              {index > 0 && (
                <div className="absolute left-6 -top-3 h-3 w-px bg-border/80" />
              )}

              {/* Step Card block */}
              <div className={cn(
                "border rounded-xl p-3 flex items-start gap-3 relative z-10",
                step.colorClass
              )}>
                <div className="bg-background/80 border p-2 rounded-lg border-inherit shrink-0 flex items-center justify-center">
                  <StepIcon size={14} className="animate-pulse" />
                </div>
                
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 leading-none">
                    <span className="text-[9.5px] font-black text-foreground uppercase tracking-widest">{step.title}</span>
                    <span className="font-mono text-[6.5px] font-black uppercase tracking-wider px-1.5 py-px bg-secondary border border-border/60 rounded text-muted-foreground">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-[8.5px] text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FusionDecisionFlow;
