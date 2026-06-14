import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Eye, 
  ShieldCheck, 
  Search, 
  Lock, 
  Trash2, 
  RotateCcw, 
  BookOpen, 
  CheckCircle,
  Clock,
  Check
} from "lucide-react";

interface WorkflowStage {
  id: string;
  name: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  duration: string;
  description: string;
  checklist: string[];
}

export function IncidentResponseWorkflow() {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(3); // Default high-light to "Containment" stage
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({
    "Detection": true,
    "Triage": true,
    "Investigation": true,
    "Containment": false,
    "Eradication": false,
    "Recovery": false,
    "Lessons Learned": false
  });

  const stages: WorkflowStage[] = [
    {
      id: "Detection",
      name: "Detection",
      icon: Eye,
      duration: "10 mins",
      description: "Automated aggregation and initial sensor flag match logging.",
      checklist: [
        "Ingest WAF, Zeek, or Suricata signatures",
        "Correlate event frames in SIEM/Fusion console",
        "Generate raw alert payload descriptor block"
      ]
    },
    {
      id: "Triage",
      name: "Triage",
      icon: ShieldCheck,
      duration: "15 mins",
      description: "Reputation confirmation and suppression of benign indicators.",
      checklist: [
        "Cross-reference source IPs against IP reputation tables",
        "Inspect response headers status size anomalies",
        "Identify alert severity level and scope baseline"
      ]
    },
    {
      id: "Investigation",
      name: "Investigation",
      icon: Search,
      duration: "30 mins",
      description: "Active digital trace tracking and pathway analysis.",
      checklist: [
        "Audit database query trees for active injection bypasses",
        "Map lateral RDP, SSH, or administrative hops",
        "Check account credentials login failure rates"
      ]
    },
    {
      id: "Containment",
      name: "Containment",
      icon: Lock,
      duration: "20 mins",
      description: "Immediate isolation of compromise zones to limit blast areas.",
      checklist: [
        "Block malicious source IP addresses on perimeter edge WAFs",
        "Quarantine affected host workloads via EDR endpoint isolation",
        "Deauthorize exposed active session keys and tokens"
      ]
    },
    {
      id: "Eradication",
      name: "Eradication",
      icon: Trash2,
      duration: "45 mins",
      description: "Absolute clearance of attacker backdoors and implants.",
      checklist: [
        "Purge rogue scripts, system cron tasks, or implants",
        "Patch software security vulnerabilities on target workloads",
        "Trigger administrative domain-wide password resets"
      ]
    },
    {
      id: "Recovery",
      name: "Recovery",
      icon: RotateCcw,
      duration: "60 mins",
      description: "Restoration of secure operations and telemetry tracking.",
      checklist: [
        "Redeploy clean application modules from gold templates",
        "Restore database snapshots and compare health flags",
        "Increase active logging resolution on target gateways"
      ]
    },
    {
      id: "Lessons Learned",
      name: "Lessons Learned",
      icon: BookOpen,
      duration: "120 mins",
      description: "Post-incident reporting, retrospective review, and gap alignment.",
      checklist: [
        "Draft complete Incident Retrospective Summary report",
        "Map specific control gaps to mitigation priorities",
        "Conduct post-mortem workshop with core SecOps personnel"
      ]
    }
  ];

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedStages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedStage = stages[selectedStageIndex];

  return (
    <div 
      id="incident-response-workflow"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col gap-4 font-mono select-none"
    >
      {/* Header */}
      <div className="border-b border-border/40 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-cyan-500 shrink-0" />
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Incident Response Workflow Template
            </h2>
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
              NIST-aligned response procedures pipeline configuration
            </span>
          </div>
        </div>
        <span className="text-[7px] bg-cyan-50/70 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest w-fit self-start">
          SOP Template standard
        </span>
      </div>

      {/* Workflow horizontal/vertical steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isSelected = index === selectedStageIndex;
          const isCompleted = completedStages[stage.id];

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStageIndex(index)}
              className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                isSelected 
                  ? "bg-cyan-500/10 border-cyan-500 text-foreground shadow-xs"
                  : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                    : "bg-muted/10 border-border/60 text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[7.5px] text-muted-foreground/80 font-black tracking-wide">
                  PHASE 0{index + 1}
                </span>
                
                {/* Completion Check Indicator */}
                <button
                  type="button"
                  onClick={(e) => handleToggleComplete(stage.id, e)}
                  title="Toggle Completion Status"
                  className={`p-0.5 rounded border flex items-center justify-center transition-colors hover:scale-105 shrink-0 ${
                    isCompleted 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                      : "bg-muted border-border text-muted-foreground/60 hover:text-cyan-400 hover:border-cyan-500"
                  }`}
                  style={{ width: "13px", height: "13px" }}
                >
                  {isCompleted && <Check size={8} strokeWidth={4} />}
                </button>
              </div>

              {/* Icon & Title */}
              <div className="mt-1">
                <Icon size={12} className={isSelected ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-muted-foreground/80"} />
                <h3 className="text-[9px] font-black uppercase mt-1 leading-snug tracking-tight">
                  {stage.name}
                </h3>
              </div>

              {/* Stage duration */}
              <div className="mt-2 text-[7px] flex items-center gap-1 font-bold text-muted-foreground/80 uppercase">
                <Clock size={8} className="shrink-0" />
                <span>{stage.duration}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      {selectedStage && (
        <div className="bg-muted/30 border border-border/80 rounded-xl p-3 text-[9px] flex flex-col md:flex-row md:items-stretch gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-black uppercase text-[10px]">
                {selectedStage.name} Phase Configuration guidelines
              </span>
              <span className="text-[7px] text-muted-foreground uppercase border border-border/80 px-1 py-0.5 rounded font-black">
                SLA SLA-0{selectedStageIndex + 1}
              </span>
            </div>
            <p className="text-muted-foreground uppercase leading-relaxed text-[8px] font-semibold border-l-2 border-cyan-500/50 pl-2">
              {selectedStage.description}
            </p>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4 min-w-60 flex flex-col gap-2">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider">
              Required SOP Steps Matrix Checklist:
            </span>
            <ul className="space-y-1.5">
              {selectedStage.checklist.map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-foreground leading-relaxed uppercase text-[8px] font-bold">
                  <span className="text-cyan-500 shrink-0 font-black">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
