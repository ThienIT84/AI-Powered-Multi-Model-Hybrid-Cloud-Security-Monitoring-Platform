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
  CheckCircle2,
  Flame,
  Check,
  Workflow,
  CheckCircle,
  AlertTriangle,
  GitCommit,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, Severity, AlertStatus, getAlertFusionMeta } from "../../types";
import { cn } from "../../lib/utils";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { FusionFlowDiagram } from "./fusion/FusionFlowDiagram";
import { DecisionVotingPanel } from "./fusion/DecisionVotingPanel";
import { AlertExplainabilityPanel } from "./fusion/AlertExplainabilityPanel";
import { RiskScoreBreakdown } from "./fusion/RiskScoreBreakdown";
import { MitreTechniqueCard } from "./mitre/MitreTechniqueCard";
import { AssetContextCard } from "./assets/AssetContextCard";
import { AlertActionPanel } from "./actions/AlertActionPanel";

interface AlertDetailDrawerProps {
  alert: Alert;
  onClose: () => void;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

export function AlertDetailDrawer({ alert, onClose, onUpdateAlert }: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "radar" | "logs" | "timeline">("pipeline");
  const [copied, setCopied] = useState(false);

  const meta = getAlertFusionMeta(alert);

  // Math components for Risk Scoring Formula breakdown
  const finalRisk = alert.riskScore || 75;
  const isSuricataMatch = meta.suricataEvidence !== "NO MATCH";
  const suricataWeight = isSuricataMatch ? 20 : 0;
  const baseZeekRiskValue = 15;
  const aiContributionValue = finalRisk - baseZeekRiskValue - suricataWeight;

  const radarData = [
    { subject: 'Impact', A: alert.riskScore, fullMark: 100 },
    { subject: 'Velocity', A: Math.min(100, Math.floor(alert.riskScore * 1.1)), fullMark: 100 },
    { subject: 'Persistence', A: Math.max(20, Math.floor(alert.riskScore * 0.9)), fullMark: 100 },
    { subject: 'Sophistication', A: Math.max(15, Math.floor((alert.confidenceScore || 0.8) * 100)), fullMark: 100 },
    { subject: 'Evasion', A: Math.min(100, Math.floor(alert.riskScore * 0.8)), fullMark: 100 },
  ];

  const handleCopyLogs = () => {
    const rawText = `
[FUSION_INTELLIGENCE_REPORT]
ID: CYH-${alert.id.replace("THR-", "")}
Timestamp: ${alert.timestamp}
Source: ${alert.sourceIp}:${alert.sourcePort || 49152}
Destination: ${alert.destinationIp || alert.destIp || '10.0.12.15'}:${alert.destinationPort}
AI1 Verdict: ${meta.ai1Result}
AI2A network Class: ${meta.ai2aClass}
AI2B Web Payload: ${meta.ai2bWeb}
Suricata Evidence: ${meta.suricataEvidence}
Consolidated Severity: ${alert.severity}
Risk Score: ${alert.riskScore}/100
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
    : `#CYH-${alert.id.substring(0, 4).toUpperCase()}`;

  return (
    <div className="w-full bg-card h-full flex flex-col overflow-hidden relative border-l border-border select-none">
      
      {/* Drawer Header Block */}
      <div className="p-4 border-b border-border bg-muted/20 space-y-3 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/15">
              <Workflow className="w-4 h-4 text-cyan-500 animate-pulse" />
            </div>
            <div className="leading-none">
              <h2 className="text-[10.5px] font-black text-foreground uppercase tracking-widest">{alert.attackType}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                <span>INDEX: {displayId}</span>
                <span>•</span>
                <span className="text-cyan-500 font-extrabold flex items-center gap-0.5">
                  <Activity size={10} className="text-cyan-500" />
                  CORRELATED
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 px-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-[9px] uppercase font-black tracking-widest flex items-center gap-1 leading-none"
          >
            <X size={11} />
            Close
          </button>
        </div>

        {/* Dynamic Risk Score Overview */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-background/70 p-2 rounded-lg border border-border/60">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wider block mb-0.5">CORRELATED SRC IP</span>
            <div className="flex items-center justify-between font-mono text-[9px] leading-none">
              <span className="font-extrabold text-cyan-500">{alert.sourceIp}</span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50 cursor-pointer hover:text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-background/70 p-2 rounded-lg border border-border/60">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wider block mb-0.5">RISK BALANCE INDEX</span>
            <div className="flex items-center justify-between leading-none">
              <span className={cn(
                "text-[9px] font-mono font-black",
                alert.riskScore > 75 ? "text-red-500" : "text-cyan-500"
              )}>{alert.riskScore}/100</span>
              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden ml-1">
                <div 
                  className={cn("h-full rounded-full transition-all duration-300", alert.riskScore > 75 ? "bg-red-500" : "bg-cyan-500")} 
                  style={{ width: `${alert.riskScore}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-border bg-muted/30 shrink-0">
        {(['pipeline', 'radar', 'logs', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-[8px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer text-center",
              activeTab === tab 
                ? "text-cyan-500 border-cyan-500 bg-cyan-500/4" 
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab === "pipeline" ? "DECISION TRACE" : tab === "radar" ? "DIAGNOSTICS" : tab}
          </button>
        ))}
      </div>

      {/* Pane scroll area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-4 bg-card">
               {/* TAB 1: Pipeline Flow Visualization & Result Breakdown */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <FusionFlowDiagram alert={alert} />
            <DecisionVotingPanel alert={alert} />
            <RiskScoreBreakdown alert={alert} />
            <MitreTechniqueCard alert={alert} />
            <AssetContextCard alert={alert} />
            <AlertExplainabilityPanel alert={alert} />
            <AlertActionPanel alert={alert} />
          </div>
        )}

        {/* TAB 2: Diagnostics/Behavior Radar map */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="text-[8.5px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-1">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Behavioral Fingerprint Map
              </h3>
              <div className="h-50 w-full bg-muted/20 rounded-xl flex items-center justify-center border border-border/60 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeWidth={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 'bold', fill: 'var(--muted-foreground)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Threat Vector Analysis"
                      dataKey="A"
                      stroke="rgb(6, 182, 212)"
                      fill="rgb(6, 182, 212)"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="space-y-1.5 bg-muted/10 p-2.5 rounded-lg border border-border">
              <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block">Anomaly Diagnostic Tags</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-500 font-mono text-[7px] font-bold">OUTBOUND_BEACON</span>
                <span className="px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/25 text-orange-500 font-mono text-[7px] font-bold">SUSPICIOUS_DNS</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-500 font-mono text-[7px] font-bold">RAT_HEURISTIC</span>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: Raw Logs Decoded */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h3 className="text-[8.5px] font-black text-foreground uppercase tracking-widest">Decoded Frame Segments</h3>
              <button 
                onClick={handleCopyLogs}
                className="flex items-center gap-1 text-[8px] font-black text-cyan-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 leading-none"
              >
                {copied ? (
                  <>
                    <Check size={11} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={11} /> Copy Diagnostics
                  </>
                )}
              </button>
            </div>

            <div className="bg-muted/80 border border-border p-3 rounded-xl font-mono text-[8.5px] leading-relaxed relative overflow-x-auto max-w-full">
              <div className="text-muted-foreground/85 space-y-1">
                <p className="text-cyan-500 font-bold"># Cyber Fusion Center Decoder</p>
                <p>Ingest: {new Date(alert.timestamp).getTime() / 1000} (Epoch)</p>
                <p>Node_ID: CYH-ANTIGRAVITY-01</p>
                <p>Source_Origin: {alert.sourceIp} port {alert.sourcePort || "49152"}</p>
                <p>Destination: {alert.destinationIp || alert.destIp || "10.0.12.15"} port {alert.destinationPort}</p>
                <p>Protocol: {alert.protocol} service {alert.protocol === 'HTTPS' ? 'ssl' : 'http'}</p>
                <p className="text-red-400 font-semibold pt-2"># Decoded Base64 Frame Buffer Payload:</p>
                <p className="text-red-400 bg-red-950/20 px-2 py-1 border border-red-950/25 rounded mt-1 break-all">
                  {alert.rawPayload || alert.payload || "GET /api/v1/user/auth HTTP/1.1\\r\\nUser-Agent: Go-client-X"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Timeline Audit */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <h4 className="text-[8.5px] font-black text-foreground uppercase tracking-widest flex items-center gap-1 border-b border-border pb-1">
              <History className="w-3.5 h-3.5 text-cyan-500" />
              SOC Incident Audit History
            </h4>

            <div className="relative pl-4 space-y-4">
              <div className="absolute left-0.75 top-1.5 bottom-1.5 w-px bg-border border-l border-dashed border-border" />
              
              {alert.timeline && alert.timeline.length > 0 ? (
                alert.timeline.map((event, i) => (
                  <div key={event.id || i} className="relative text-[8.5px]">
                    <div className="absolute left-[-18.5px] top-1 w-2 h-2 rounded-full bg-cyan-500 border border-card" />
                    <div className="flex flex-col gap-0.5 leading-none">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground uppercase tracking-wide">{event.type}</span>
                        <span className="font-mono text-[7px] text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-muted-foreground/90 font-medium leading-relaxed mt-1">{event.description}</p>
                      {event.actor && (
                        <span className="text-[7px] text-muted-foreground uppercase font-black tracking-widest mt-1">OPERATOR: {event.actor}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative text-[8.5px]">
                  <div className="absolute left-[-18.5px] top-1 w-2 h-2 rounded-full bg-cyan-500 border border-card" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-foreground uppercase">Threat Detected</span>
                    <p className="text-muted-foreground/90 leading-tight">Event was ingested and aggregated inside SOC real-time thread.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Quick Actions Panel */}
      <div className="p-3 bg-muted/30 border-t border-border space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleIsolate}
            className="flex items-center justify-center gap-1.5 py-2 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer leading-none"
          >
            <Lock size={11} /> Isolate Host
          </button>
          
          <button 
            onClick={handleBlockDomain}
            className="flex items-center justify-center gap-1.5 py-2 bg-muted border border-border hover:bg-border text-foreground text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer leading-none"
          >
            <UserX size={11} /> Block Gateway
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center">
          <button className="flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-all border border-transparent hover:border-border cursor-pointer text-[7.5px] font-extrabold uppercase">
            <Share2 size={11} /> Share
          </button>
          <button className="flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-all border border-transparent hover:border-border cursor-pointer text-[7.5px] font-extrabold uppercase">
            <MessageCircle size={11} /> Slack
          </button>
          <button 
            onClick={handleDiscard}
            className="flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-muted text-muted-foreground hover:text-red-500 rounded-md transition-all border border-transparent hover:border-border cursor-pointer text-[7.5px] font-extrabold uppercase"
          >
            <Trash2 size={11} /> Discard
          </button>
        </div>

        <button 
          onClick={handleResolve}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-none"
        >
          <CheckCircle2 size={12} /> Mark as Resolved
        </button>
      </div>

    </div>
  );
}
