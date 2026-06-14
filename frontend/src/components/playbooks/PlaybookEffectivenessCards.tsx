import React from "react";
import { Clock, ShieldAlert, HeartHandshake, CheckSquare, BadgeCheck, FileCheck, HelpCircle } from "lucide-react";

interface EffectivenessMetric {
  id: string;
  name: string;
  value: string;
  target: string;
  status: "optimal" | "warning" | "error";
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

export function PlaybookEffectivenessCards() {
  const metrics: EffectivenessMetric[] = [
    {
      id: "avg-response-time",
      name: "Average Response Time",
      value: "18.2m",
      target: "< 25m",
      status: "optimal",
      description: "Aggregated time elapsed between alert trigger and initial playbook execution log.",
      icon: Clock
    },
    {
      id: "mttc",
      name: "MTTC (Mean Time To Contain)",
      value: "24.5m",
      target: "< 35m",
      status: "optimal",
      description: "Average duration required to successfully apply containment procedures across target scopes.",
      icon: ShieldAlert
    },
    {
      id: "mttr",
      name: "MTTR (Mean Time To Recover)",
      value: "42.1m",
      target: "< 60m",
      status: "optimal",
      description: "Mean duration from initial containment lock to standard operating system clearance validation.",
      icon: HeartHandshake
    },
    {
      id: "completion-rate",
      name: "Procedure Completion Rate",
      value: "98.4%",
      target: "> 95%",
      status: "optimal",
      description: "Percentage of playbook checklist items fully confirmed and ticked by handling analysts.",
      icon: CheckSquare
    },
    {
      id: "compliance-rate",
      name: "Review Compliance Rate",
      value: "100%",
      target: "100%",
      status: "optimal",
      description: "Proportion of published procedures passing annual SecOps compliance and engineering audits.",
      icon: FileCheck
    }
  ];

  const statusStyles = {
    optimal: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    warning: "border-amber-500/20 text-amber-500 bg-amber-500/5",
    error: "border-rose-500/30 text-rose-450 bg-rose-500/5"
  };

  return (
    <div 
      id="playbook-effectiveness-metrics"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col gap-4 font-mono select-none"
    >
      {/* Header */}
      <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <BadgeCheck size={13} className="text-cyan-500 shrink-0" />
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Playbook Effectiveness Metrics
            </h2>
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
              SOP orchestration KPIs measuring response template execution performance
            </span>
          </div>
        </div>
        <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest leading-none w-fit self-start sm:self-center">
          AUDIT NOMINAL
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="bg-muted/10 border border-border rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-muted/15 transition-all text-left group"
            >
              {/* Header metrics details */}
              <div className="flex items-start justify-between gap-1">
                <span className="text-[7px] text-muted-foreground font-black uppercase tracking-wider leading-tight max-w-[80%]">
                  {m.name}
                </span>
                <Icon size={12} className="text-cyan-500 shrink-0 group-hover:scale-105 transition-transform" />
              </div>

              {/* Central Value */}
              <div className="mt-3">
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none block">
                  {m.value}
                </span>
                <span className="text-[7px] text-muted-foreground uppercase tracking-widest mt-1 block leading-none font-bold">
                  SLA Goal: <span className="text-foreground">{m.target}</span>
                </span>
              </div>

              {/* Status and summary */}
              <div className="border-t border-border/40 mt-2.5 pt-2 text-[7px] uppercase leading-relaxed font-semibold text-muted-foreground/80">
                {m.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
