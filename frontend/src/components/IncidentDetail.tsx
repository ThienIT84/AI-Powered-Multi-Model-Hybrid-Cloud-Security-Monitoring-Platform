import React from "react";
import { ShieldAlert, X, Copy, ExternalLink, Zap, Terminal, Globe, Search, Lock, UserX, Cpu, Eye } from "lucide-react";
import { Alert, Severity } from "../types";
import { cn } from "../lib/utils";
import { useAttackTheme } from "../hooks/useAttackTheme";

function getAttackIcon(name: string) {
  switch (name) {
    case "DDoS": return Zap;
    case "SQL Injection": return Terminal;
    case "XSS": return Globe;
    case "Port Scan": return Search;
    case "Brute Force": return Lock;
    case "Unauthorized Access": return UserX;
    case "Malware": return Cpu;
    case "Phishing": return Eye;
    case "Ransomware": return ShieldAlert;
    case "Insider Threat": return UserX;
    default: return ShieldAlert;
  }
}

interface IncidentDetailProps {
  alert: Alert | null;
  onClose?: () => void;
}

export function IncidentDetail({ alert, onClose }: IncidentDetailProps) {
  if (!alert) return null;

  const theme = useAttackTheme(alert.attackType, true);
  const AttackIcon = getAttackIcon(alert.attackType);
  const hasWebEvidence = Boolean(alert.zeekData.uri || alert.zeekData.method || alert.rawPayload);

  return (
    <div
      className="h-full rounded-sm flex flex-col relative overflow-hidden group select-none transition-colors duration-300 shadow-sm bg-card border border-border"
      style={{
        boxShadow: `inset 0 0 30px ${alert.severity === Severity.CRITICAL ? "rgba(239, 68, 68, 0.05)" : "transparent"}`,
        borderTopColor: theme.primary,
        borderTopWidth: "3px",
      }}
    >
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black uppercase tracking-[0.15em] transition-colors flex items-center gap-2" style={{ color: theme.primary, filter: `drop-shadow(0 0 8px ${theme.glow})` }}>
            <AttackIcon size={14} />
            {alert.severity} {alert.attackType.toUpperCase()} DETECTED
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all text-foreground group"
            >
              <X className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">INCIDENT ID:</span>
            <span className="text-[10px] font-mono font-black text-foreground">{alert.id}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className={cn("px-2 py-0.5 rounded-sm border", alert.severity === Severity.CRITICAL ? "bg-red-500/10 border-red-500/30" : "bg-muted border-border")}>
              <span className={cn("text-[7px] font-black uppercase tracking-widest leading-none", alert.severity === Severity.CRITICAL ? "text-red-500" : "text-muted-foreground")}>{alert.severity}</span>
            </div>
            <span className="text-[7px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">Status: {alert.status}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border text-[8px] font-black uppercase tracking-[0.15em]">
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">Overview</div>
        <div className="px-5 py-3 cursor-pointer transition-all border-b-2" style={{ borderColor: theme.primary, color: theme.primary }}>Evidence</div>
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">AI Analysis</div>
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">Timeline</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border-y border-dashed border-border relative overflow-hidden group/vector">
          <div
            className="absolute inset-0 opacity-0 group-hover/vector:opacity-10 transition-opacity pointer-events-none"
            style={{ background: theme.gradient }}
          />
          <div
            className="p-5 rounded-3xl mb-4 shadow-xl transition-transform group-hover/vector:scale-110"
            style={{
              backgroundColor: theme.muted,
              color: theme.primary,
              boxShadow: `0 10px 25px -5px ${theme.glow}`,
              border: `1px solid ${theme.border}`,
            }}
          >
            <AttackIcon size={40} />
          </div>
          <span className="text-[16px] font-black tracking-[0.2em] text-foreground uppercase">{alert.attackType}</span>
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2 opacity-60">Risk score::{alert.riskScore}</span>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">RAW PAYLOAD BUFFER</h3>
            <div className="flex items-center gap-1 cursor-pointer group/copy">
              <Copy className="w-2.5 h-2.5 text-muted-foreground/50 group-hover/copy:text-foreground transition-colors" />
              <span className="text-[8px] text-muted-foreground font-black group-hover/copy:text-foreground transition-colors uppercase">Copy</span>
            </div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4 font-mono text-[9px] leading-relaxed relative overflow-hidden group/code">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/code:opacity-30 transition-opacity">
              <Terminal size={48} />
            </div>
            {alert.rawPayload ? (
              <pre className="text-muted-foreground/80 whitespace-pre-wrap break-words relative z-10">{alert.rawPayload}</pre>
            ) : (
              <p className="text-muted-foreground/60 uppercase tracking-widest font-black relative z-10">No raw payload captured for this event</p>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">SECURITY ANALYST INTERPRETATION</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-3 pl-4 py-1" style={{ borderColor: theme.primary }}>
            {alert.description} Confidence is <span className="font-bold" style={{ color: theme.primary }}>{(alert.confidenceScore * 100).toFixed(1)}%</span>.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">ZEEK EVIDENCE</h3>
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
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">MITRE ATT&CK</h3>
          <a
            href={alert.mitre.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-muted/30 p-2 rounded-sm border border-border hover:border-red-500/30 transition-colors"
          >
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{alert.mitre.tactic ?? "Mapped"}</span>
            <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 text-[8px] font-black tracking-widest">{alert.mitre.techniqueId}</span>
            <span className="text-[9px] text-muted-foreground font-black tracking-tight flex-1 ml-1">{alert.mitre.techniqueName}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </section>

        <section className="space-y-3">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">IOC DATA POINTS</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <InfoItem label="Source IP" value={alert.sourceIp} accent />
            <InfoItem label="Source Port" value={alert.sourcePort ?? "unknown"} />
            <InfoItem label="Destination IP" value={alert.destinationIp} />
            <InfoItem label="Destination Port" value={alert.destinationPort} />
            <InfoItem label="Protocol" value={alert.protocol} />
            <InfoItem label="Direction" value={alert.direction} />
          </div>
        </section>

        <section className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">AI ANALYSIS</h3>
          <AIProgressItem label="AI1" value={alert.aiDecision.ai1?.anomalyScore} desc={alert.aiDecision.ai1?.verdict ?? "No signal"} color="bg-blue-500" />
          <AIProgressItem label="AI2A" value={alert.aiDecision.ai2a?.confidenceScore} desc={alert.aiDecision.ai2a?.attackType ?? "No signal"} color="bg-purple-500" />
          <AIProgressItem label="AI2B" value={alert.aiDecision.ai2b?.confidenceScore} desc={alert.aiDecision.ai2b?.webAttackType ?? "No signal"} color="bg-red-500" />
          <AIProgressItem label="Fusion" value={alert.aiDecision.fusion?.confidenceScore ?? alert.confidenceScore} desc={alert.aiDecision.fusion?.reason ?? "Final decision"} color="bg-green-500" />
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">DECISION FLOW</h3>
          <div className="space-y-2">
            {alert.decisionFlow.map((step, index) => (
              <div key={`${step.stage}-${index}`} className="bg-muted/30 border border-border rounded-sm p-2">
                <div className="flex justify-between gap-3">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{step.stage}</span>
                  {step.confidence !== undefined && <span className="text-[8px] font-mono font-black text-cyan-500">{Math.round(step.confidence * 100)}%</span>}
                </div>
                <p className="text-[9px] text-foreground/80 mt-1 leading-relaxed">{step.output}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">SURICATA EVIDENCE</h3>
          {alert.suricataData.signature || alert.suricataData.signatureId ? (
            <div className="bg-muted/30 border border-border rounded-sm p-2 space-y-1">
              <EvidenceLine label="Signature ID" value={alert.suricataData.signatureId} />
              <EvidenceLine label="Signature" value={alert.suricataData.signature} />
              <EvidenceLine label="Category" value={alert.suricataData.category} />
            </div>
          ) : (
            <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">No matching Suricata signature</p>
          )}
        </section>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border flex gap-2">
        <ActionButton label="BLOCK IP" />
        <ActionButton label="EXPORT REPORT" />
        <ActionButton label="CREATE CASE" />
        <button
          onClick={onClose}
          className="flex-1 py-3 px-1 bg-muted border border-border text-[8px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-muted/80 transition-all rounded-sm"
        >
          CLOSE
        </button>
      </div>

      <div className="absolute -top-24 -left-24 w-64 h-64 opacity-5 blur-[100px] pointer-events-none rounded-full" style={{ backgroundColor: theme.primary }} />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 opacity-5 blur-[100px] pointer-events-none rounded-full" style={{ backgroundColor: theme.primary }} />
    </div>
  );
}

function InfoItem({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{label}</span>
      <span className={cn(
        "text-[10px] font-black font-mono tracking-tight",
        accent ? "text-cyan-500" : "text-foreground"
      )}>{value}</span>
    </div>
  );
}

function EvidenceItem({ label, value, wide }: { label: string; value?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("bg-muted/30 border border-border rounded-sm p-2", wide && "col-span-2")}>
      <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-[9px] font-mono text-foreground/80 break-words">{value ?? "N/A"}</span>
    </div>
  );
}

function EvidenceLine({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-mono text-foreground/80 text-right">{value ?? "N/A"}</span>
    </div>
  );
}

function AIProgressItem({ label, value, desc, color }: { label: string; value?: number; desc: string; color: string }) {
  const safeValue = value ?? 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-1.5">
          <span className="text-[8.5px] font-black bg-muted border border-border text-foreground px-1 py-0.5 rounded tracking-tighter uppercase leading-none">{label}</span>
          <span className="text-[8.5px] text-muted-foreground truncate max-w-[180px] leading-none tracking-tight">{desc}</span>
        </div>
        <span className={cn("text-[9px] font-black font-mono", safeValue > 0.9 ? "text-red-500" : "text-yellow-500")}>{Math.round(safeValue * 100)}%</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${safeValue * 100}%` }} />
      </div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="flex-1 py-3 px-1 border border-border text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-sm">
      {label}
    </button>
  );
}
