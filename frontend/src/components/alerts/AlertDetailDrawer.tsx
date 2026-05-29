import React, { useState } from "react";
import { 
  X, 
  Copy, 
  ExternalLink, 
  Shield, 
  Brain, 
  History, 
  Globe, 
  Database,
  Lock,
  UserX,
  Share2,
  Trash2,
  MessageCircle,
  FileSearch,
  Activity,
  Zap,
  Target,
  Server,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface AlertDetailDrawerProps {
  alert: Alert;
  onClose: () => void;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

export function AlertDetailDrawer({ alert, onClose, onUpdateAlert }: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "logs" | "timeline">("overview");
  const [copied, setCopied] = useState(false);

  const radarData = [
    { subject: 'Impact', A: alert.riskScore, fullMark: 100 },
    { subject: 'Velocity', A: Math.min(100, Math.floor(alert.riskScore * 1.1)), fullMark: 100 },
    { subject: 'Persistence', A: Math.max(20, Math.floor(alert.riskScore * 0.9)), fullMark: 100 },
    { subject: 'Sophistication', A: Math.max(15, Math.floor((alert.confidenceScore || 0.8) * 100)), fullMark: 100 },
    { subject: 'Evasion', A: Math.min(100, Math.floor(alert.riskScore * 0.8)), fullMark: 100 },
  ];

  const handleCopyLogs = () => {
    const rawText = `
Zeek Connection Log Segment
ts: ${alert.timestamp}
uid: THR-${alert.id}
id.orig_h: ${alert.sourceIp}
id.resp_h: ${alert.destinationIp}
proto: ${alert.protocol}
duration: ${alert.zeekData?.duration || "1.24"}s
orig_bytes: ${alert.zeekData?.origBytes || "450"}
resp_bytes: ${alert.zeekData?.respBytes || "1205"}
payload: ${alert.rawPayload || "N/A"}
`;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = () => {
    if (onUpdateAlert) {
      onUpdateAlert(alert.id, { status: AlertStatus.RESOLVED });
    }
  };

  const handleIsolate = () => {
    if (onUpdateAlert) {
      onUpdateAlert(alert.id, { 
        status: AlertStatus.MITIGATED, 
        description: alert.description + " [EMERGENCY ASSET ISOLATED BY ANALYST]" 
      });
    }
  };

  const handleBlockDomain = () => {
    if (onUpdateAlert) {
      onUpdateAlert(alert.id, { 
        description: alert.description + " [DESTINATION DOMAIN BLOCKED ON GATEWAY]" 
      });
    }
  };

  const handleDiscard = () => {
    if (onUpdateAlert) {
      onUpdateAlert(alert.id, { status: AlertStatus.FALSE_POSITIVE });
    }
  };

  const displayId = alert.id.toLowerCase().startsWith('thr-')
    ? alert.id.toUpperCase()
    : `#THR-${alert.id.substring(0, 4).toUpperCase()}`;

  return (
    <div className="w-full bg-card h-full flex flex-col overflow-hidden relative">
      {/* 5.1 PANEL HEADER */}
      <div className="p-5 border-b border-border space-y-4 bg-muted/10 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/15">
              <Shield className="w-4.5 h-4.5 text-red-500 animate-pulse" />
            </div>
            <div className="leading-none">
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider">{alert.attackType}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[8.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                <span>ID: {displayId}</span>
                <span>•</span>
                <span className="text-red-500 font-black flex items-center gap-0.5">
                  <Flame size={10} className="text-red-500" />
                  ACTIVE THREAT
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 px-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-[10px] uppercase font-black tracking-widest flex items-center gap-1"
          >
            <X size={12} />
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/80 p-2.5 rounded-xl border border-border/65">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Source Asset</span>
            <div className="flex items-center justify-between font-mono text-[9.5px]">
              <span className="font-extrabold text-cyan-500">{alert.sourceIp}</span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/55 cursor-pointer hover:text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-background/80 p-2.5 rounded-xl border border-border/65">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Risk Level Score</span>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-mono font-black",
                alert.riskScore > 75 ? "text-red-500" : "text-orange-500"
              )}>{alert.riskScore}/100</span>
              <div className="h-1 w-14 bg-muted rounded-full overflow-hidden ml-1">
                <div 
                  className={cn("h-full rounded-full transition-all duration-300", alert.riskScore > 75 ? "bg-red-500" : "bg-orange-500")} 
                  style={{ width: `${alert.riskScore}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5.2 ANALYSIS TABS */}
      <div className="flex border-b border-border bg-muted/35 shrink-0 select-none">
        {(['overview', 'analysis', 'logs', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-[8.5px] font-black uppercase tracking-[0.16em] transition-all border-b-2 cursor-pointer text-center",
              activeTab === tab 
                ? "text-cyan-500 border-cyan-500 bg-cyan-500/3" 
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents Pane */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 5.3 INCIDENT DESCRIPTION */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-cyan-500" />
                AI Security Interpretation
              </h3>
              <div className="bg-muted/40 border border-border/40 p-3 rounded-xl">
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  {alert.description || "Beaconing behavior detected between external source and internal asset with repeated C2 communication patterns."}
                </p>
                <div className="mt-2.5 pt-2 border-t border-border/30 text-[7.5px] font-mono text-cyan-500/80 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Brain className="w-3 h-3 text-cyan-500" />
                  CORRELATED BY SOC VIRTUAL AI AGENT • REASONING CONFIDENTIAL
                </div>
              </div>
            </section>

            {/* 5.4 MITRE ATT&CK MAPPING */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                MITRE ATT&CK Mapping matrix
              </h3>
              <div className="bg-orange-500/3 border border-orange-500/20 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-orange-500/15 text-orange-500 px-2 py-0.5 rounded text-[8px] font-mono font-black tracking-wider leading-none">
                    {alert.mitre?.techniqueId || "T1071"}
                  </span>
                  <span className="text-[9px] font-black text-foreground uppercase tracking-widest shrink-0">
                    {alert.mitre?.techniqueName || "Application Layer Protocol"}
                  </span>
                </div>
                <div className="text-[8px] text-muted-foreground/95 bg-orange-500/1 rounded border border-orange-500/10 p-2 font-medium">
                  <span className="font-bold text-orange-400 block uppercase tracking-widest text-[7px] mb-1">TACTIC CATEGORY:</span>
                  {alert.mitre?.tactic || "Command and Control / Execution stage"}
                </div>
              </div>
            </section>

            {/* 5.6 AI ANALYSIS SECTION (Top Contributing Indicators) */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                AI Explainability Indicators
              </h3>
              <div className="space-y-1.5 bg-purple-500/2 border border-purple-500/15 p-3 rounded-xl">
                <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Primary Anomaly Drivers:</p>
                {[
                  { name: "Unusual beacon interval", score: "99% contribution" },
                  { name: "Suspicious DNS pattern signature", score: "92% contribution" },
                  { name: "Repeated outbound TCP connection payload", score: "88% contribution" },
                  { name: "Global anomaly profile score spike", score: "85% contribution" }
                ].map((ind, i) => (
                  <div key={i} className="flex items-center justify-between text-[8.5px] py-1 border-b border-purple-500/5 last:border-0">
                    <span className="font-bold text-muted-foreground">• {ind.name}</span>
                    <span className="font-mono font-bold text-purple-500 bg-purple-500/5 px-1 py-0.2 rounded text-[7.5px] leading-none">{ind.score}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5.5 RELATED ASSETS */}
            <section className="space-y-2">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em]">Relational Network Assets</h3>
              <div className="space-y-1.5">
                {[
                  { type: 'Service Gateway', name: 'Web_Prod_Gateway_02', status: 'ONLINE', icon: Server, color: "text-green-500 bg-green-500/10" },
                  { type: 'App Database', name: 'RDS_Database_Primary', status: 'WARNING', icon: Database, color: "text-orange-500 bg-orange-500/10" },
                  { type: 'User Identity', name: `LDAP:_${alert.assignedAnalyst?.toLowerCase() || "johndoe_srv"}`, status: 'ACTIVE', icon: Lock, color: "text-cyan-500 bg-cyan-500/10" },
                ].map((asset, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-2.5 bg-muted/20 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <asset.icon className="w-3.5 h-3.5 text-muted-foreground/60" />
                      <div className="leading-none">
                        <span className="text-[9px] font-black text-foreground uppercase tracking-tight">{asset.name}</span>
                        <span className="text-[7px] text-muted-foreground font-black uppercase tracking-wider block mt-0.5">{asset.type}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-transparent leading-none",
                      asset.color
                    )}>
                      {asset.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Behavioral Fingerprint Map
              </h3>
              <div className="h-52.5 w-full bg-muted/30 rounded-xl flex items-center justify-center border border-border/80 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeWidth={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8.5, fontWeight: 'bold', fill: 'var(--muted-foreground)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Threat Vector Analysis"
                      dataKey="A"
                      stroke="rgb(168, 85, 247)"
                      fill="rgb(168, 85, 247)"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em]">SIEM Anomaly Analysis</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/20 border border-border p-3 rounded-xl space-y-1">
                  <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest">Base Anomaly score</span>
                  <div className="text-sm font-black text-foreground">
                    0.86 <span className="text-[8px] text-red-500 uppercase tracking-widest font-mono ml-1">UNSTABLE</span>
                  </div>
                </div>
                <div className="bg-muted/20 border border-border p-3 rounded-xl space-y-1">
                  <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest">Signature Repetition</span>
                  <div className="text-sm font-black text-foreground">
                    18/min <span className="text-[8px] text-orange-500 uppercase tracking-widest font-mono ml-1">ELEVATED</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em]">Raw Log Segment Buffer</h3>
              <button 
                onClick={handleCopyLogs}
                className="flex items-center gap-1 text-[8.5px] font-black text-cyan-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400"
              >
                {copied ? (
                  <>
                    <Check size={11} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={11} /> Copy Logs
                  </>
                )}
              </button>
            </div>
            <div className="bg-muted/80 border border-border p-3.5 rounded-xl font-mono text-[9px] leading-relaxed relative group overflow-x-auto max-w-full">
              <div className="text-muted-foreground/85 space-y-1">
                <p className="text-cyan-500 font-bold"># Zeek Connection Decoded Log Frame</p>
                <p>ts: {new Date(alert.timestamp).getTime() / 1000}</p>
                <p>uid: CYH-${alert.id}</p>
                <p>id.orig_h: {alert.sourceIp} port_p: {alert.sourcePort || "49152"}</p>
                <p>id.resp_h: {alert.destinationIp} port_p: {alert.destinationPort}</p>
                <p>proto: {alert.protocol}</p>
                <p>service: {alert.protocol === 'HTTPS' ? 'ssl' : 'http'}</p>
                <p>conn_state: {alert.zeekData?.connState || "SF"}</p>
                <p>orig_bytes: {alert.zeekData?.origBytes || "1,240"}</p>
                <p>resp_bytes: {alert.zeekData?.respBytes || "450"}</p>
                <p className="pt-2 text-red-500 font-bold"># Attack Payload Raw Payload Context:</p>
                <p className="text-red-400 font-semibold break-all bg-red-950/20 px-2 py-1.5 border border-red-950/40 rounded mt-1">
                  {alert.rawPayload || "GET /api/v1/auth/admin?shell_exec=id&cat+/etc/passwd HTTP/1.1\\r\\nHost: api.internal.srv\\r\\nUser-Agent: Go-http-client"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-500" />
              SOC Incident Audit Timeline
            </h3>
            <div className="relative pl-4 space-y-5">
              <div className="absolute left-0.75 top-1.5 bottom-1.5 w-px bg-border border-l border-dashed border-border" />
              
              {alert.timeline && alert.timeline.length > 0 ? (
                alert.timeline.map((event, i) => (
                  <div key={event.id} className="relative text-[9px]">
                    <div className="absolute left-[-18.5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-card" />
                    <div className="flex flex-col gap-0.5 leading-none">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground uppercase tracking-tight">{event.type}</span>
                        <span className="font-mono text-[7.5px] text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-muted-foreground/90 font-medium leading-relaxed mt-1">{event.description}</p>
                      {event.actor && (
                        <span className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest mt-1">OPERATOR: {event.actor}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative text-[9px]">
                  <div className="absolute left-[-18.5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-card" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-black text-foreground uppercase">Threat Detected</span>
                    <p className="text-muted-foreground/90">Event was ingested and aggregated inside SOC real-time thread.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5.7 QUICK ACTION TOOLBAR */}
      <div className="p-4 border-t border-border bg-muted/20 shrink-0 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleIsolate}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-600/25 text-red-500 hover:text-white text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer leading-none"
          >
            <Lock size={12} /> Isolate Asset
          </button>
          
          <button 
            onClick={handleBlockDomain}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-muted border border-border hover:bg-border text-foreground text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer leading-none"
          >
            <UserX size={12} /> Block Domain
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 py-0.5">
          <button className="flex flex-col items-center gap-1 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border cursor-pointer leading-none">
            <Share2 size={13} />
            <span className="text-[7.5px] font-black uppercase">Share</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border cursor-pointer leading-none">
            <MessageCircle size={13} />
            <span className="text-[7.5px] font-black uppercase">Slack</span>
          </button>
          
          <button 
            onClick={handleDiscard}
            className="flex flex-col items-center gap-1 py-1.5 hover:bg-muted/80 text-muted-foreground hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-border cursor-pointer leading-none"
          >
            <Trash2 size={13} />
            <span className="text-[7.5px] font-black uppercase">Discard</span>
          </button>
        </div>

        <button 
          onClick={handleResolve}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.16em] rounded-lg shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-none"
        >
          <CheckCircle2 size={14} /> Mark as Resolved
        </button>
      </div>
    </div>
  );
}
