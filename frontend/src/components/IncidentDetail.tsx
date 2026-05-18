import React from "react";
import { X, Copy, ExternalLink } from "lucide-react";
import { Alert } from "../types";
import { cn } from "../lib/utils";

interface IncidentDetailProps {
  alert: Alert | null;
  onClose?: () => void;
}

export function IncidentDetail({ alert, onClose }: IncidentDetailProps) {
  if (!alert) return null;

  const isCritical = alert.severity === "Critical";
  const hasWebEvidence = Boolean(alert.zeekData.uri || alert.zeekData.method || alert.rawPayload);

  return (
    <div className={cn(
      "h-full rounded-sm flex flex-col relative overflow-hidden group select-none transition-colors duration-500",
      isCritical ? "shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] shadow-2xl" : "shadow-[0_0_40px_rgba(0,0,0,0.5)] light:shadow-sm",
      "bg-[#06070a] dark:bg-[#06070a] light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200"
    )}>
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn(
            "text-xs font-black uppercase tracking-[0.15em] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
            isCritical ? "text-red-500" : "text-blue-500"
          )}>
            {alert.severity} {alert.attackType} Detected
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-5 h-5 rounded-full border border-gray-700 dark:border-gray-700 light:border-gray-300 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-all text-white group"
            >
              <X className="w-3 h-3 text-gray-400 dark:text-gray-400 light:text-gray-500 group-hover:text-white dark:group-hover:text-white light:group-hover:text-gray-900" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">INCIDENT ID:</span>
            <span className="text-[10px] font-mono font-black text-gray-300 dark:text-gray-300 light:text-gray-700">{alert.id}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-sm">
              <span className="text-[7px] font-black text-red-500 uppercase tracking-widest leading-none">{alert.severity}</span>
            </div>
            <span className="text-[7px] text-gray-600 font-bold uppercase mt-1 tracking-widest">Status: {alert.status}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-white/5 dark:border-white/5 light:border-gray-100 text-[8px] font-black uppercase tracking-[0.2em]">
        <div className="px-5 py-2.5 text-gray-600 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">Overview</div>
        <div className="px-5 py-2.5 cursor-pointer transition-all border-b-2 border-blue-500 text-blue-400">Evidence</div>
        <div className="px-5 py-2.5 text-gray-600 dark:text-gray-600 light:text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">AI Analysis</div>
        <div className="px-5 py-2.5 text-gray-600 dark:text-gray-600 light:text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">MITRE ATT&CK</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">RAW PAYLOAD</h3>
            <div className="flex items-center gap-1 cursor-pointer group/copy">
              <Copy className="w-2.5 h-2.5 text-gray-700 group-hover/copy:text-gray-400 dark:group-hover/copy:text-gray-400 light:group-hover/copy:text-gray-900" />
              <span className="text-[8px] text-gray-600 font-black group-hover/copy:text-gray-400 dark:group-hover/copy:text-gray-400 light:group-hover/copy:text-gray-900">COPY</span>
            </div>
          </div>
          <div className="bg-[#030408] dark:bg-[#030408] light:bg-gray-50 border border-white/5 dark:border-white/5 light:border-gray-200 rounded-sm p-3 font-mono text-[9px] leading-relaxed relative">
            {alert.rawPayload ? (
              <pre className="text-gray-400 dark:text-gray-400 light:text-gray-600 whitespace-pre-wrap break-words">{alert.rawPayload}</pre>
            ) : (
              <p className="text-gray-600 uppercase tracking-widest font-black">No raw payload captured for this event</p>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">ZEEK EVIDENCE</h3>
          <div className="grid grid-cols-2 gap-2">
            {hasWebEvidence ? (
              <>
                <EvidenceItem label="Method" value={alert.zeekData.method} />
                <EvidenceItem label="URI" value={alert.zeekData.uri} wide />
                <EvidenceItem label="User-Agent" value={alert.zeekData.userAgent} wide />
              </>
            ) : (
              <>
                <EvidenceItem label="Duration" value={alert.zeekData.duration} />
                <EvidenceItem label="Conn State" value={alert.zeekData.connState} />
                <EvidenceItem label="Orig Bytes" value={alert.zeekData.origBytes} />
                <EvidenceItem label="Resp Bytes" value={alert.zeekData.respBytes} />
              </>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">MITRE ATT&CK</h3>
          <a
            href={alert.mitre.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-sm border border-white/5 hover:border-red-500/30 transition-colors"
          >
            <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{alert.mitre.tactic ?? "Mapped"}</span>
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 text-[8px] font-black tracking-widest">{alert.mitre.techniqueId}</span>
            <span className="text-[9px] text-gray-400 font-black tracking-tight flex-1 ml-1">{alert.mitre.techniqueName}</span>
            <ExternalLink className="w-3 h-3 text-gray-600" />
          </a>
        </section>

        <section className="space-y-3">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">SOURCE INFORMATION</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <InfoItem label="Source IP" value={alert.sourceIp} accent />
            <InfoItem label="Source Port" value={alert.sourcePort ?? "unknown"} />
            <InfoItem label="Destination IP" value={alert.destinationIp} />
            <InfoItem label="Destination Port" value={alert.destinationPort} />
            <InfoItem label="Protocol" value={alert.protocol} />
            <InfoItem label="Direction" value={alert.direction} />
          </div>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5 dark:border-white/5 light:border-gray-100">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">AI ANALYSIS</h3>
          <AIProgressItem label="AI1" value={alert.aiDecision.ai1?.anomalyScore} desc={alert.aiDecision.ai1?.verdict ?? "No signal"} color="bg-blue-500" />
          <AIProgressItem label="AI2A" value={alert.aiDecision.ai2a?.confidenceScore} desc={alert.aiDecision.ai2a?.attackType ?? "No signal"} color="bg-purple-500" />
          <AIProgressItem label="AI2B" value={alert.aiDecision.ai2b?.confidenceScore} desc={alert.aiDecision.ai2b?.webAttackType ?? "No signal"} color="bg-red-500" />
          <AIProgressItem label="Fusion" value={alert.aiDecision.fusion?.confidenceScore ?? alert.confidenceScore} desc={alert.aiDecision.fusion?.reason ?? "Final decision"} color="bg-green-500" />
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">DECISION FLOW</h3>
          <div className="space-y-2">
            {alert.decisionFlow.map((step, index) => (
              <div key={`${step.stage}-${index}`} className="bg-white/[0.03] border border-white/5 rounded-sm p-2">
                <div className="flex justify-between gap-3">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{step.stage}</span>
                  {step.confidence !== undefined && <span className="text-[8px] font-mono font-black text-blue-400">{Math.round(step.confidence * 100)}%</span>}
                </div>
                <p className="text-[9px] text-gray-300 dark:text-gray-300 light:text-gray-700 mt-1 leading-relaxed">{step.output}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">SURICATA EVIDENCE</h3>
          {alert.suricataData.signature || alert.suricataData.signatureId ? (
            <div className="bg-white/[0.03] border border-white/5 rounded-sm p-2 space-y-1">
              <EvidenceLine label="Signature ID" value={alert.suricataData.signatureId} />
              <EvidenceLine label="Signature" value={alert.suricataData.signature} />
              <EvidenceLine label="Category" value={alert.suricataData.category} />
            </div>
          ) : (
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">No matching Suricata signature</p>
          )}
        </section>
      </div>

      <div className="p-4 bg-[#030408] dark:bg-[#030408] light:bg-gray-50 border-t border-white/5 dark:border-white/5 light:border-gray-200 flex gap-2">
        <ActionButton label="BLOCK IP" />
        <ActionButton label="EXPORT REPORT" />
        <ActionButton label="CREATE CASE" />
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-1 bg-red-600/10 border border-red-600/30 text-[8px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-600/20 transition-all rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">{label}</span>
      <span className={cn(
        "text-[10px] font-black font-mono tracking-tight",
        accent ? "text-blue-400" : "text-gray-300 dark:text-gray-300 light:text-gray-700"
      )}>{value}</span>
    </div>
  );
}

function EvidenceItem({ label, value, wide }: { label: string; value?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("bg-white/[0.03] border border-white/5 rounded-sm p-2", wide && "col-span-2")}>
      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-[9px] font-mono text-gray-300 dark:text-gray-300 light:text-gray-700 break-words">{value ?? "N/A"}</span>
    </div>
  );
}

function EvidenceLine({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-mono text-gray-300 text-right">{value ?? "N/A"}</span>
    </div>
  );
}

function AIProgressItem({ label, value, desc, color }: { label: string; value?: number; desc: string; color: string }) {
  const safeValue = value ?? 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-1.5">
          <span className="text-[8.5px] font-black bg-white/5 border border-white/10 text-gray-100 px-1 py-0.5 rounded tracking-tighter uppercase leading-none">{label}</span>
          <span className="text-[8.5px] text-gray-500 truncate max-w-[180px] leading-none tracking-tight">{desc}</span>
        </div>
        <span className={cn("text-[9px] font-black font-mono", safeValue > 0.9 ? "text-red-400" : "text-yellow-400")}>{Math.round(safeValue * 100)}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color, "shadow-[0_0_8px_rgba(255,255,255,0.1)]")} style={{ width: `${safeValue * 100}%` }} />
      </div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="flex-1 py-3 px-1 border border-white/10 dark:border-white/10 light:border-gray-300 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200 transition-all rounded-sm">
      {label}
    </button>
  );
}
