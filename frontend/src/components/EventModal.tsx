import { Alert } from "../types";
import { cn } from "../lib/utils";
import { X, ShieldAlert, ExternalLink, Brain, ShieldX } from "lucide-react";
import { motion } from "motion/react";

interface EventModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export function EventModal({ alert, onClose }: EventModalProps) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
      />

      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-[400px] bg-card h-full border-l border-border relative z-10 flex flex-col shadow-2xl transition-colors duration-300"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                EVENT DETAIL <span className="text-cyan-500 font-mono">#{alert.id.substring(0, 7)}</span>
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <InfoLine label="SOURCE IP" value={alert.sourceIp} accent="text-red-500" />
              <InfoLine label="DESTINATION IP" value={alert.destinationIp} accent="text-cyan-500" />
              <InfoLine label="SERVICE" value={`${alert.protocol} (${alert.destinationPort})`} />
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-4 h-4 text-purple-500" />
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">AI ANALYSIS FLOW</h2>
            </div>
            <div className="space-y-3 relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border border-l border-dashed border-border" />
              <FlowStep label="Data Source: Zeek Sensor" status="completed" />
              <FlowStep label="AI1: Feature Extraction" value={`${Math.round((alert.aiDecision.ai1?.anomalyScore ?? 0) * 100)}%`} status="active" />
              <FlowStep label="AI2A: Attack Classifier" value={alert.aiDecision.ai2a?.attackType ?? alert.attackType} status="completed" />
              <FlowStep label="AI2B: HTTP Semantic" value={alert.aiDecision.ai2b?.webAttackType ?? "MATCHED"} status="completed" />
              <FlowStep label="Fusion Layer: Final Choice" value={`${alert.riskScore}%`} status="confirmed" />
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">MITRE ATT&CK MAPPING</h2>
            </div>
            <a
              href={alert.mitre.url}
              target="_blank"
              rel="noreferrer"
              className="block bg-orange-500/5 p-4 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-black text-xs text-orange-500 mb-1 tracking-tighter">{alert.mitre.techniqueId} - {alert.mitre.techniqueName}</div>
                <ExternalLink size={12} className="text-orange-500" />
              </div>
              <div className="text-[10px] text-muted-foreground font-medium leading-relaxed">{alert.mitre.tactic ?? "Mapped MITRE ATT&CK technique for this final Fusion alert."}</div>
            </a>
          </div>
        </div>

        <div className="p-6 border-t border-border space-y-3 bg-muted/20">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95">
            <ShieldX size={14} /> BLOCK SOURCE IP IMMEDIATELY
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground font-bold text-[10px] tracking-widest uppercase hover:text-foreground hover:bg-secondary transition-all">
              PDF REPORT
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground font-bold text-[10px] tracking-widest uppercase hover:text-foreground hover:bg-secondary transition-all">
              INVESTIGATE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoLine({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{label}:</span>
      <span className={cn("font-mono font-bold text-foreground", accent)}>{value}</span>
    </div>
  );
}

function FlowStep({ label, value, status }: { label: string, value?: string, status: "completed" | "active" | "confirmed" }) {
  return (
    <div className={cn(
      "relative bg-muted/40 border px-3 py-2.5 rounded-lg text-[10px] flex justify-between items-center transition-all",
      status === "active" ? "border-cyan-500/50 shadow-sm" : "border-border"
    )}>
      <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-border bg-card z-10" />
      <span className="font-bold text-muted-foreground uppercase tracking-tighter">{label}</span>
      {status === "active" && <span className="font-black text-cyan-500 font-mono">{value}</span>}
      {status === "completed" && <span className="text-emerald-500 bg-emerald-500/10 px-1 rounded">{value ?? "DECODED"}</span>}
      {status === "confirmed" && <span className="text-red-500 font-black">{value ?? "CRITICAL"}</span>}
    </div>
  );
}
