import React from "react";
import { Case, CaseSeverity, CaseStatus } from "./caseTypes";
import { 
  Terminal, 
  Cpu, 
  Network, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Activity,
  Award
} from "lucide-react";
import { cn } from "../../lib/utils";

interface CaseInvestigationPanelProps {
  activeCase: Case | null;
}

export function CaseInvestigationPanel({ activeCase }: CaseInvestigationPanelProps) {
  if (!activeCase) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center h-155 select-none">
        <ShieldAlert size={44} className="text-muted-foreground/20 mb-3 animate-pulse" />
        <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
          NO CASE RECORD SHOWN
        </h4>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 max-w-xs leading-relaxed font-mono">
          Select an incident from the SOC Queue on the left to review parsed network dumps, AI predictions, and active signatures.
        </p>
      </div>
    );
  }

  const getSeverityBadgeClass = (sev: CaseSeverity) => {
    switch (sev) {
      case "Critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Low":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  const getStatusBadge = (stat: CaseStatus) => {
    switch (stat) {
      case "Open":
        return "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse";
      case "In Progress":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      case "Resolved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
      case "Pending Review":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    }
  };

  return (
    <div className="space-y-4 select-none animate-fade-in w-full pb-6">
      {/* 1. CASE SUMMARY AREA */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3.5">
        <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5">
          <div className="space-y-1">
            <span className="font-mono text-[8px] font-black text-cyan-500 tracking-widest block">
              {activeCase.id} // DEEP FORENSIC TRIAGE
            </span>
            <h3 className="text-xs font-black text-foreground uppercase tracking-wide leading-tight">
              {activeCase.title}
            </h3>
          </div>
          <span className={cn(
            "text-[7.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 leading-none",
            getStatusBadge(activeCase.status)
          )}>
            {activeCase.status}
          </span>
        </div>

        {/* Detailed source to destination network diagram */}
        <div className="bg-muted/40 border border-border/60 rounded-xl p-3 flex items-center justify-between gap-2">
          {/* Source IP Block */}
          <div className="text-left space-y-0.5">
            <span className="text-[6.5px] font-black text-cyan-500 uppercase tracking-widest block font-mono">
              SOURCE IP (ATTACKER)
            </span>
            <span className="text-xs font-black text-foreground font-mono">
              {activeCase.source_ip}
            </span>
          </div>

          {/* Network Vector connection */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-1 px-2">
            <span className="text-[6px] font-black font-mono text-muted-foreground uppercase leading-none">
              L4 FLOWS: {activeCase.zeek.flows}
            </span>
            <div className="w-full flex items-center gap-1">
              <div className="h-px bg-cyan-500/25 flex-1 relative">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <Network size={10} className="text-cyan-500 shrink-0" />
              <div className="h-px bg-cyan-500/25 flex-1 relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>

          {/* Destination IP Block */}
          <div className="text-right space-y-0.5">
            <span className="text-[6.5px] font-black text-emerald-500 uppercase tracking-widest block font-mono">
              TARGET ENDPOINT
            </span>
            <span className="text-xs font-black text-foreground font-mono">
              {activeCase.destination_ip}
            </span>
          </div>
        </div>

        {/* Categories and Summary properties */}
        <div className="grid grid-cols-2 gap-3 pt-0.5 text-[8.5px] font-mono leading-tight">
          <div>
            <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-black mb-1">
              ATTACK INCIDENT TYPE
            </span>
            <span className="text-foreground font-black truncate block">
              {activeCase.attack_type}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-black mb-1">
              SEVERITY CATEGORY
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase leading-none border",
              getSeverityBadgeClass(activeCase.severity)
            )}>
              {activeCase.severity}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ZEEK EXPORT PANEL (CORE EVIDENCE TABLES) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <Terminal size={11} className="text-cyan-500" />
          ZEEK NETWORK EVIDENCE CAPTURES
        </h4>

        {/* Conn.log lines */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase text-[6.5px] font-black tracking-widest block font-mono">
              PARSED PORT STATISTICS (conn.log logs)
            </span>
            <span className="text-[6px] font-mono font-black text-cyan-400">STATE: INDEXED</span>
          </div>
          <div className="bg-muted/90 border border-border/50 rounded-lg p-2.5 font-mono text-[8px] leading-normal text-foreground space-y-1 overflow-x-auto  max-h-22.5 custom-scrollbar">
            {activeCase.zeek.conn_log.map((log, i) => (
              <div key={i} className="whitespace-pre py-0.5 border-b border-border/10 last:border-0 select-text">
                <span className="text-cyan-500/80 mr-1.5">[{i + 1}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Http.log records (conditional) */}
        {activeCase.zeek.http_log && activeCase.zeek.http_log.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/20">
            <span className="text-muted-foreground uppercase text-[6.5px] font-black tracking-widest block font-mono">
              L7 WEB REQUEST DECODE (http.log alerts)
            </span>
            <div className="bg-muted/95 border border-border/70 rounded-lg p-2.5 font-mono text-[8px] leading-normal text-orange-400 space-y-1 overflow-x-auto select-text">
              {activeCase.zeek.http_log.map((line, idx) => (
                <div key={idx} className="wrap-break-word font-semibold border-b border-border/10 last:border-0 pb-1 last:pb-0">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. DUAL AI DETECTION SUMMARY */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <Cpu size={12} className="text-cyan-500" />
          AI ENGINE DETECTION CRUNCH
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
          {/* AI-1: Unsupervised Anomaly Scoring */}
          <div className="border border-border/60 rounded-xl p-2.5 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground uppercase text-[6px] font-black tracking-widest">
                AI1 DEEP ANOMALY
              </span>
              <span className="text-[6.5px] font-black text-cyan-400 uppercase">ACTIVE</span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className={cn(
                "text-base font-black leading-none",
                activeCase.detection.ai1.label === "ANOMALY" ? "text-red-400" : "text-emerald-400"
              )}>
                {activeCase.detection.ai1.label}
              </span>
              <span className="text-[7.5px] text-muted-foreground">
                (SCORE: {activeCase.detection.ai1.score.toFixed(2)})
              </span>
            </div>
          </div>

          {/* AI-2a / AI-2b: Supervised Classification */}
          <div className="border border-border/60 rounded-xl p-2.5 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground uppercase text-[6px] font-black tracking-widest">
                AI2A CLASSIFIER RESULT
              </span>
              <span className="text-[6.5px] font-black text-amber-500">CONFIDENCE</span>
            </div>
            <div className="space-y-0.5 font-mono">
              <span className="text-[9.5px] font-extrabold text-white uppercase block leading-tight truncate">
                {activeCase.detection.ai2a.class}
              </span>
              <span className="text-[7.5px] font-black text-amber-500 block leading-none">
                {activeCase.detection.ai2a.confidence}% MATCH
              </span>
            </div>
          </div>
        </div>

        {/* Optional AI2B Web Parser layer */}
        {activeCase.detection.ai2b && (
          <div className="p-2 bg-[#020617] border border-[#06b6d4]/10 rounded-lg text-[8px] font-mono flex items-center justify-between">
            <span className="text-muted-foreground/80 uppercase">AI2B WEB PAYLOAD RESULT:</span>
            <span className="text-[#06b6d4] font-black uppercase text-[8.5px]">
              {activeCase.detection.ai2b.class} ({activeCase.detection.ai2b.confidence}%)
            </span>
          </div>
        )}
      </div>

      {/* 4. SURICATA SYSTEM MATCHES */}
      {activeCase.suricata.signatures && activeCase.suricata.signatures.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2.5">
          <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
            <AlertTriangle size={11} className="text-red-400 animate-pulse" />
            SURICATA SIGNATURE ALERTS
          </h4>
          <div className="space-y-1.5 select-text">
            {activeCase.suricata.signatures.map((sig, sIdx) => (
              <div 
                key={sIdx} 
                className="bg-red-500/2 border border-red-500/15 rounded-lg p-2 border-l-2 border-l-red-500 text-[8px] font-mono text-red-400 leading-normal"
              >
                {sig}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INCIDENT ACTIVITY TIMELINE (FORENSIC ONLY WITH ADHOC AUDIT LOGS) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3.5">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <Clock size={11} className="text-cyan-500" />
          INCIDENT TIMELINE & ACTIVITY RECORDER
        </h4>

        <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar pr-1 select-text">
          {activeCase.timeline.events.map((evt, idx) => (
            <div key={idx} className="flex gap-2.5 items-start text-[8.2px] leading-relaxed relative">
              {/* Micro Dot visual connection line */}
              <div className="flex flex-col items-center mt-1 shrink-0 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 border border-background shadow-xs z-10" />
                {idx !== activeCase.timeline.events.length - 1 && (
                  <div className="w-px bg-border absolute top-1.5 bottom-3.75" />
                )}
              </div>
              <p className="text-foreground/90 font-medium font-mono">
                {evt}
              </p>
            </div>
          ))}

          {/* Show a placeholder for clean list */}
          {activeCase.timeline.events.length === 0 && (
            <div className="text-center text-[7.5px] font-mono text-muted-foreground uppercase py-2">
              No historic timestamp entries recorded on incident.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
