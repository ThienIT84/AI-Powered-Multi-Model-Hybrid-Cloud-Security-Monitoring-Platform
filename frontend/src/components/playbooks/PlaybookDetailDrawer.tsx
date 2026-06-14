import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  Info, 
  Radio, 
  Search, 
  ShieldAlert, 
  Wrench, 
  RotateCcw, 
  Lightbulb, 
  BookOpen,
  Calendar,
  Layers,
  Compass,
  ArrowRight
} from "lucide-react";
import { Playbook } from "./types";
import { cn } from "../../lib/utils";

interface PlaybookDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playbook: Playbook | null;
}

export function PlaybookDetailDrawer({ isOpen, onClose, playbook }: PlaybookDetailDrawerProps) {
  if (!playbook) return null;

  const severityStyles = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20 font-black",
    high: "bg-rose-500/10 text-rose-450 border-rose-500/20 font-black",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20 font-black",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black"
  };

  const statusStyles = {
    Published: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20 font-extrabold",
    Draft: "bg-amber-500/15 text-amber-500 border-amber-500/15 font-bold"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 transition-all duration-150 cursor-pointer"
            id="drawer-backdrop-overlay"
          />

          {/* Lateral Drawer Content Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full bg-card border-l border-border shadow-2xl z-55 flex flex-col justify-between overflow-hidden select-none font-mono"
            style={{ width: "95vw", maxWidth: "560px" }}
            id="playbook-detail-drawer"
          >
            {/* Header section */}
            <div className="p-4 md:p-5 border-b border-border flex flex-col gap-3 shrink-0 bg-muted/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/25 rounded-md text-cyan-500 shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest block leading-none">
                      STANDARD OPERATING PROCEDURE DOCUMENTATION
                    </span>
                    <span className="text-[10px] text-foreground font-black uppercase mt-1 block leading-none tracking-tight">
                      SOP REF: {playbook.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 bg-muted rounded-lg border border-border/60 hover:text-rose-500 cursor-pointer hover:border-rose-500/30 transition-all"
                  aria-label="CLOSE DRAWER"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-base md:text-lg font-black text-foreground uppercase tracking-tight leading-tight">
                  {playbook.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[7px] md:text-[7.5px]">
                <span className={cn(
                  "px-1.5 py-0.5 rounded border leading-none uppercase",
                  severityStyles[playbook.severity]
                )}>
                  {playbook.severity}
                </span>

                <span className="bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded leading-none uppercase font-extrabold">
                  Published
                </span>

                <span className="bg-muted px-1.5 py-0.5 border border-border/50 text-muted-foreground font-black rounded uppercase">
                  {playbook.version || "v2.1"}
                </span>

                <span className="flex items-center gap-1 text-muted-foreground font-black uppercase">
                  <Calendar size={10} />
                  <span>{playbook.lastUpdated}</span>
                </span>
              </div>
            </div>

            {/* Scrollable document contents */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 text-[9px] select-text">
              
              {/* SECTION A: Purpose */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <Info size={11} className="text-cyan-500 shrink-0" />
                  <span>A. Purpose</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block mb-1">
                    Why this playbook exists:
                  </span>
                  <p className="text-muted-foreground leading-relaxed uppercase text-[8px] font-black">
                    {playbook.purpose || "Define the critical response operations for the active attack vector to preserve corporate data and server network boundaries."}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/25 grid grid-cols-2 gap-2 text-[7.5px] uppercase font-bold text-muted-foreground">
                  <div>
                    <span>ESTIMATED SLA TIME</span>
                    <span className="text-foreground font-black block mt-0.5">{playbook.estimatedTime || "25m"}</span>
                  </div>
                  <div>
                    <span>PROCEDURE OWNER</span>
                    <span className="text-foreground font-black block mt-0.5">{playbook.owner || "SOC Core Team"}</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Detection Sources */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <Radio size={11} className="text-cyan-500" />
                  <span>B. Detection Sources</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest select-none leading-none mb-1">
                  Primary system hooks/telemetry that flag this attack vector:
                </p>
                <div className="space-y-1">
                  {(playbook.detectionSources && playbook.detectionSources.length > 0 ? playbook.detectionSources : ["Zeek Logs", "Suricata Alerts", "Fusion Alert Trigger", "WAF Logs", "Authentication Logs"]).map((src, i) => (
                    <div key={src + i} className="flex items-center gap-2 bg-card border border-border/30 rounded-lg py-1.5 px-2.5 text-foreground font-semibold uppercase text-[8px]">
                      <span className="text-cyan-500 font-extrabold shrink-0">[{i+1}]</span>
                      <span>{src}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: Investigation Steps */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <Search size={11} className="text-cyan-500" />
                  <span>C. Investigation Steps</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest select-none leading-none mb-1">
                  Step-by-step diagnostic checklist to analyze scope of compromise:
                </p>
                <div className="space-y-1.5">
                  {(playbook.investigationSteps && playbook.investigationSteps.length > 0 ? playbook.investigationSteps : [
                    "Query log database records to map the attacker's path and request methods.",
                    "Verify raw packet captures inside Zeek or Suricata sensor archives.",
                    "Examine server exception stack traces or unusual database query logs.",
                    "Audit affected endpoint file trees and active service configurations."
                  ]).map((step, i) => (
                    <div key={i} className="flex gap-2 bg-card border border-border/30 rounded-lg p-2.5 text-foreground leading-relaxed uppercase text-[8px] font-semibold">
                      <span className="text-cyan-500 font-black shrink-0">STEP {i+1}:</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: Containment Actions */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <ShieldAlert size={11} className="text-cyan-500" />
                  <span>D. Containment Actions</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest select-none leading-none mb-1">
                  Clearly separated response steps mapped for immediate quarantine:
                </p>
                <div className="space-y-1.5">
                  {(playbook.containmentProcedures && playbook.containmentProcedures.length > 0 ? playbook.containmentProcedures : [
                    "Block malicious source IP address on WAF and perimeter gateways.",
                    "Isolate affected server endpoints from the internal network segments.",
                    "Disable compromised access logins and administrative credentials."
                  ]).map((proc, i) => (
                    <div key={i} className="flex gap-2 bg-card border border-border/30 rounded-lg p-2.5 text-foreground leading-relaxed uppercase text-[8px] font-bold border-l-2">
                      <span className="bg-rose-50 border border-rose-500/30 text-rose-600 dark:text-rose-400 dark:bg-rose-950/40 px-1.5 py-0.5 rounded text-[6.5px] font-black shrink-0 leading-none">ACTION {i+1}</span>
                      <span>{proc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION E: Recovery Actions */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <RotateCcw size={11} className="text-cyan-500" />
                  <span>E. Recovery Actions</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest select-none leading-none mb-1">
                  Service restoration and clearance verification procedures:
                </p>
                <div className="space-y-1.5">
                  {(playbook.recoveryProcedures && playbook.recoveryProcedures.length > 0 ? playbook.recoveryProcedures : [
                    "Restore databases or application files from last-known clean golden snapshot backups.",
                    "Conduct automated dependency vulnerability scans over the patched services.",
                    "Gradually re-allow gateway ingress channels while holding high-resolution monitoring tags."
                  ]).map((proc, i) => (
                    <div key={i} className="flex gap-2 bg-card border border-border/30 rounded-lg p-2.5 text-foreground leading-relaxed uppercase text-[8px] font-semibold border-l-2">
                      <span className="text-emerald-400 font-black shrink-0">RECOVERY {i+1}:</span>
                      <span>{proc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION F: Lessons Learned Template */}
              <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                <div className="flex items-center gap-1.5 text-foreground font-black uppercase tracking-widest text-[8.5px] border-b border-border/20 pb-1.5 shrink-0 select-none">
                  <Lightbulb size={11} className="text-cyan-500" />
                  <span>F. Lessons Learned Template</span>
                </div>
                
                <p className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest select-none leading-none mb-2">
                  Post-incident audit retrospective templates:
                </p>

                <div className="space-y-2 bg-card/65 border border-border/60 rounded-lg p-3 text-[7.5px] uppercase">
                  {/* Root Cause Field */}
                  <div className="space-y-1">
                    <span className="text-[6.5px] text-muted-foreground font-black tracking-widest block leading-none">
                      [1] Root Cause Analysis Field:
                    </span>
                    <div className="p-2 bg-muted/30 border border-dashed border-border rounded-md text-muted-foreground/60 select-all">
                      &lt;DESCRIBE SPECIFIC SOFTWARE CONFIGURATION EXPLOITED OR CREDIENTIAL FAILURE PATHWAYS&gt;
                    </div>
                  </div>

                  {/* Impact Summary Field */}
                  <div className="space-y-1">
                    <span className="text-[6.5px] text-muted-foreground font-black tracking-widest block leading-none">
                      [2] Impact Summary:
                    </span>
                    <div className="p-2 bg-muted/30 border border-dashed border-border rounded-md text-muted-foreground/60 select-all">
                      &lt;CALCULATE TOTAL COMPROMISED RECORD COUNTS, SYSTEM DOWNTIME METRICS, AND SLA EXCURSIONS&gt;
                    </div>
                  </div>

                  {/* Control Gaps Field */}
                  <div className="space-y-1">
                    <span className="text-[6.5px] text-muted-foreground font-black tracking-widest block leading-none">
                      [3] Control Gaps Identified:
                    </span>
                    <div className="p-2 bg-muted/30 border border-dashed border-border rounded-md text-muted-foreground/60 select-all">
                      &lt;LIST SENSORS WHICH FAILED TO TRIGGER AND ABSENT ACCESS LIMIT CONTROLS ON INTERNET EDGE&gt;
                    </div>
                  </div>

                  {/* Recommendations Field */}
                  <div className="space-y-1">
                    <span className="text-[6.5px] text-muted-foreground font-black tracking-widest block leading-none">
                      [4] Recommendations:
                    </span>
                    <div className="p-2 bg-muted/30 border border-dashed border-border rounded-md text-muted-foreground/60 select-all">
                      &lt;PROPOSE INFRASTRUCTURE REFACTORINGS, ACCESS LEAST-PRIVILEGE AUDITS, AND AUTOMATION RULES&gt;
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer metadata stamp */}
            <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between text-[7px] font-mono text-muted-foreground uppercase tracking-widest truncate select-none shrink-0">
              <span className="flex items-center gap-1 leading-none">
                <ShieldCheck size={10} className="text-emerald-400" />
                <span>SIGNED OFF IN CORE ARCHIVE</span>
              </span>
              <span>VERIFIED LIFE-SEC v3.0</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
