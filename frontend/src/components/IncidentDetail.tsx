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

  const isDarkMode = true; // Dashboard is primarily dark
  const theme = useAttackTheme(alert.attackType, isDarkMode);
  const AttackIcon = getAttackIcon(alert.attackType);

   return (
    <div className={cn(
      "h-full rounded-sm flex flex-col relative overflow-hidden group select-none transition-colors duration-300",
      "shadow-sm bg-card border border-border"
    )} style={{ 
      boxShadow: `inset 0 0 30px ${alert.severity === Severity.CRITICAL ? 'rgba(239, 68, 68, 0.05)' : 'transparent'}`,
      borderTopColor: theme.primary,
      borderTopWidth: '3px'
    }}>
      {/* HEADER SECTION */}
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
            <span className="text-[10px] font-mono font-black text-foreground">INC-{alert.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className={cn("px-2 py-0.5 rounded-sm border", alert.severity === Severity.CRITICAL ? "bg-red-500/10 border-red-500/30" : "bg-muted border-border")}>
              <span className={cn("text-[7px] font-black uppercase tracking-widest leading-none", alert.severity === Severity.CRITICAL ? "text-red-500" : "text-muted-foreground")}>{alert.severity}</span>
            </div>
            <span className="text-[7px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">Status: {alert.status}</span>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="flex border-b border-border text-[8px] font-black uppercase tracking-[0.15em]">
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">Overview</div>
        <div className="px-5 py-3 cursor-pointer transition-all border-b-2" style={{ borderColor: theme.primary, color: theme.primary }}>Payload</div>
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">AI Analysis</div>
        <div className="px-5 py-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-b-2 border-transparent">Timeline</div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* ATTACK TYPE ICON */}
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border-y border-dashed border-border relative overflow-hidden group/vector">
           <div 
             className="absolute inset-0 opacity-0 group-hover/vector:opacity-10 transition-opacity pointer-events-none" 
             style={{ background: theme.gradient }}
           />
           <div className="p-5 rounded-3xl mb-4 shadow-xl transition-transform group-hover/vector:scale-110" 
                style={{ 
                  backgroundColor: theme.muted, 
                  color: theme.primary, 
                  boxShadow: `0 10px 25px -5px ${theme.glow}`,
                  border: `1px solid ${theme.border}`
                }}>
              <AttackIcon size={40} />
           </div>
           <span className="text-[16px] font-black tracking-[0.2em] text-foreground uppercase">{alert.attackType}</span>
           <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2 opacity-60">Threat Vector Vector_ID::{(alert.id.charCodeAt(0) * 100).toString(16)}</span>
        </div>

        {/* RAW PAYLOAD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">RAW PAYLOAD BUFFER</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 cursor-pointer group/copy">
                <Copy className="w-2.5 h-2.5 text-muted-foreground/50 group-hover/copy:text-foreground transition-colors" />
                <span className="text-[8px] text-muted-foreground font-black group-hover/copy:text-foreground transition-colors uppercase">Copy HEX</span>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4 font-mono text-[9px] leading-relaxed relative overflow-hidden group/code">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/code:opacity-30 transition-opacity">
               <Terminal size={48} />
            </div>
            <div className="text-muted-foreground/80 relative z-10">
              POST /api/v1/internal/execute HTTP/1.1<br />
              Host: {alert.destIp}<br />
              X-Auth-Token: [REDACTED]<br />
              Content-Type: application/x-encoded-payload<br /><br />
              <span className="font-black" style={{ color: theme.primary }}>
                {alert.attackType.includes("Injection") 
                  ? '{"query": "SELECT * FROM users WHERE id = \'-1\' UNION SELECT 1,2,@@version,4--", "sig": "a7b2"}' 
                  : '{"data": "0x41414141414141417f454c46020101000000000000000000"}'}
              </span>
            </div>
          </div>
        </div>

        {/* DECODED & INTERPRETED */}
        <div className="space-y-2">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">SECURITY ANALYST INTERPRETATION</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-3 pl-4 py-1" style={{ borderColor: theme.primary }}>
            Deep packet inspection confirms a {alert.attackType} attempt originating from a known malicious IP sector. The payload structure suggests a high-level automated tool targeting specific backend vulnerabilities with a confidence of <span className="font-bold" style={{ color: theme.primary }}>{(alert.confidence * 100).toFixed(1)}%</span>.
          </p>
        </div>

        {/* SOURCE INFORMATION */}
        <div className="space-y-4">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">IOC DATA POINTS</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-1">
            <div className="group/field">
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1 opacity-50">Source IP</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black font-mono tracking-tight cursor-pointer group-hover/field:underline" style={{ color: theme.primary }}>{alert.sourceIp}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              </div>
            </div>
            <div className="group/field text-right">
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1 opacity-50">Source Port</span>
              <span className="text-[11px] font-black text-foreground font-mono tracking-tight">49152</span>
            </div>
            <div className="group/field">
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1 opacity-50">Destination IP</span>
              <span className="text-[11px] font-black text-foreground font-mono tracking-tight">{alert.destIp}</span>
            </div>
            <div className="group/field text-right">
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-1 opacity-50">Target Port</span>
              <span className="text-[11px] font-black text-foreground font-mono tracking-tight" style={{ color: theme.primary }}>{alert.destPort}</span>
            </div>
          </div>
        </div>

        {/* ADDITIONAL CONTEXT */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">DETECTION ENGINE METRICS</h3>
          
          <div className="grid grid-cols-1 gap-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Model Precision (NLP-{alert.attackType.substring(0, 4)})</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>98.2%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20">
                <div className="h-full transition-all duration-1000 rounded-full" style={{ width: '92%', backgroundColor: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Ensemble Confidence Score</span>
                <span className="text-[11px] font-mono font-black text-foreground">{(alert.confidence).toFixed(4)}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20">
                <div className="h-full transition-all duration-1000 rounded-full" style={{ width: `${alert.confidence * 100}%`, backgroundColor: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1">Threat Level</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: theme.primary }}>{alert.severity} RISK</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1">Analyst Status</span>
                  <span className="text-[10px] font-black text-foreground uppercase tracking-[0.1em]">{alert.status}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-muted/30 border-t border-border flex gap-2">
        <button className="flex-1 py-3 px-1 border border-border text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-sm">
          ISOLATE
        </button>
        <button className="flex-1 py-3 px-1 border border-border text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-sm">
          BLOCK
        </button>
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-1 bg-muted border border-border text-[8px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-muted/80 transition-all rounded-sm"
        >
          CLOSE
        </button>
      </div>

      {/* Ambient backgrounds */}
      <div className="absolute -top-24 -left-24 w-64 h-64 opacity-5 blur-[100px] pointer-events-none rounded-full" style={{ backgroundColor: theme.primary }} />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 opacity-5 blur-[100px] pointer-events-none rounded-full" style={{ backgroundColor: theme.primary }} />
    </div>
  );
}
