import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { Playbook } from "./playbooksConfig";

export interface InspectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlaybook: Playbook | null;
  modalActiveTab: "general" | "detection" | "steps" | "history";
  setModalActiveTab: (tab: "general" | "detection" | "steps" | "history") => void;
}

export function InspectorDialog({
  isOpen,
  onClose,
  selectedPlaybook,
  modalActiveTab,
  setModalActiveTab
}: InspectorDialogProps) {
  if (!isOpen || !selectedPlaybook) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4" id="playbook-inspector-dialog">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden font-mono text-[10px] text-foreground relative"
        >
          {/* Decorative top border glow */}
          <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-purple-500" />

          {/* Close Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-border cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Core Contents */}
          <div className="p-6 space-y-5">
            {/* Header metadata */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8.5px] font-bold tracking-widest bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded">
                  {selectedPlaybook.id}
                </span>
                <span className="text-[8.5px] font-black tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                  {selectedPlaybook.severity} severity
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">{selectedPlaybook.name}</h3>
              <p className="text-muted-foreground text-[10px] leading-relaxed lowercase first-letter:uppercase mt-1 max-w-xl">
                {selectedPlaybook.description}
              </p>
            </div>

            {/* Sub-tabs controller in Modal popup */}
            <div className="flex border-b border-border gap-1.5">
              {[
                { id: "general", label: "General & Theory" },
                { id: "detection", label: "Detection Sensors" },
                { id: "steps", label: "Defensive Steps" },
                { id: "history", label: "Metrics & Logs" }
              ].map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setModalActiveTab(tab.id as any)}
                  className={`pb-2 px-3 relative font-bold text-[9.5px] uppercase transition cursor-pointer ${modalActiveTab === tab.id ? "text-foreground border-b-2 border-cyan-500" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content areas */}
            <div className="min-h-40 bg-muted/30 p-4 rounded-xl border border-border">
              {/* TAB 1: General Info */}
              {modalActiveTab === "general" && (
                <div className="space-y-3">
                  <div className="font-black text-foreground uppercase">Playbook Strategy Overview</div>
                  <p className="text-muted-foreground leading-relaxed lowercase first-letter:uppercase">
                    This playbook establishes unified multi-sensor consensus mitigation coordinates under the standard FCAJ v3.0 SIEM framework. Upon trigger matching, isolates coordinates inside production virtual clusters.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-card border border-border p-3 rounded text-center">
                      <span className="text-[8px] text-muted-foreground uppercase font-black block">TRIGGER TYPE</span>
                      <span className="text-foreground uppercase font-bold text-[10.5px]">{selectedPlaybook.triggerType}</span>
                    </div>
                    <div className="bg-card border border-border p-3 rounded text-center font-mono">
                      <span className="text-[8px] text-muted-foreground uppercase font-black block">CONFIDENCE THRESHOLD</span>
                      <span className="text-foreground uppercase font-bold text-[10.5px]">{(selectedPlaybook.confidenceThreshold || 90)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Detection Sensors rule */}
              {modalActiveTab === "detection" && (
                <div className="space-y-3">
                  <div className="font-semibold text-foreground uppercase">FCAJ Alert Trigger Condition Rule</div>
                  <div className="p-3 bg-slate-950 text-amber-400 rounded-lg select-all">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold mr-1.5 text-[8.5px]">IF</span>
                    {selectedPlaybook.triggerCondition}
                  </div>
                  <p className="text-muted-foreground text-[9px] italic leading-normal text-center">
                    *Rule parsed instantly inside local Zeek ingress aggregators. Feeds into active consensus weights logic.
                  </p>
                </div>
              )}

              {/* TAB 3: Action steps layout */}
              {modalActiveTab === "steps" && (
                <div className="space-y-3">
                  <div className="font-semibold text-foreground uppercase">Remediation Action Steps Sequential List</div>
                  <div className="space-y-2">
                    {selectedPlaybook.actions && selectedPlaybook.actions.length > 0 ? (
                      selectedPlaybook.actions.map(act => (
                        <div key={act.id} className="flex items-start gap-2.5 p-2 bg-card border border-border rounded-lg">
                          <span className="p-1 px-1.5 bg-muted text-foreground rounded text-[8px] font-bold font-mono">STEP-{act.step}</span>
                          <div className="flex-1 space-y-0.5">
                            <div className="text-[10px] font-bold uppercase text-foreground">{act.name}</div>
                            <p className="text-muted-foreground text-[8.5px] leading-relaxed uppercase">{act.description}</p>
                          </div>
                          <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            COMPLETED
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-center py-4">No specific sequential action steps configured for this custom playbook.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: History & Usage count statistics */}
              {modalActiveTab === "history" && (
                <div className="space-y-3">
                  <div className="font-semibold text-foreground uppercase">Playbook Performance Metrics</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card border border-border p-3 rounded text-center">
                      <span className="text-[8px] text-muted-foreground uppercase font-black block">TOTAL LIFE DISPATCHES</span>
                      <span className="text-cyan-500 font-black text-[12px]">{selectedPlaybook.executions} Runs</span>
                    </div>
                    <div className="bg-card border border-border p-3 rounded text-center">
                      <span className="text-[8px] text-muted-foreground uppercase font-black block">LATENCY PERFORMANCE</span>
                      <span className="text-foreground font-black text-[12px]">{(selectedPlaybook.avgDurationMs || 120)} ms</span>
                    </div>
                    <div className="bg-card border border-border p-3 rounded text-center">
                      <span className="text-[8px] text-muted-foreground uppercase font-black block">SUCCESS RESOLUTION</span>
                      <span className="text-emerald-500 font-black text-[12px]">100% Rate</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer closing controllers */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-muted hover:bg-muted-foreground/10 text-muted-foreground cursor-pointer transition font-bold"
              >
                Close Inspector
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer transition font-bold"
              >
                Commit Active Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
