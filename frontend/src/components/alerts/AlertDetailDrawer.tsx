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

// Custom imported modules from alerts directory
import { ConfidenceVotingPanel } from "./ConfidenceVotingPanel";
import { FusionDecisionFlow } from "./FusionDecisionFlow";
import { ExplainabilityPanel } from "./ExplainabilityPanel";
import { MitreAttackPanel } from "./MitreAttackPanel";
import { RawLogViewer } from "./RawLogViewer";

interface AlertDetailDrawerProps {
  alert: Alert;
  onClose: () => void;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

function ModelStatusRow({ name, label, status, source, scope }: { name: string; label: string; status: string; source: string; scope?: string }) {
  const isUnavailable = ["not_applicable", "not_available", "not_run"].includes((status || "").toLowerCase());
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/30 last:border-b-0">
      <div className="leading-none">
        <span className="text-[8px] font-black text-foreground uppercase tracking-widest block">{name}</span>
        <span className="text-[6.5px] text-muted-foreground uppercase tracking-wider">{scope || "scope not declared"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "px-1.5 py-[0.5px] rounded border font-mono text-[7px] font-black uppercase",
          isUnavailable
            ? "border-slate-500/15 bg-slate-500/5 text-muted-foreground"
            : source === "real"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : "border-purple-500/20 bg-purple-500/10 text-purple-400"
        )}>
          {source === "real" ? "REAL" : source?.toUpperCase() || "LEGACY"}
        </span>
        <span className="text-[7px] font-mono font-black text-cyan-500 uppercase max-w-30 truncate">{isUnavailable ? status : label}</span>
      </div>
    </div>
  );
}

export function AlertDetailDrawer({ alert, onClose, onUpdateAlert }: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "decision_flow" | "explainability" | "mitre" | "raw_logs">("overview");
  const [copied, setCopied] = useState(false);

  const meta = getAlertFusionMeta(alert);

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
    : `THR-${alert.id.substring(0, 4).toUpperCase()}`;

  const isWebUrl = alert.attackType.includes("XSS") || alert.attackType.includes("SQL") || alert.attackType.includes("Injection");

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
                  CORRELATED FUSION
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

      {/* TARGET 7: Tabs Rows matching: Overview, Evidence, Decision Flow, AI Explainability, MITRE, Raw Logs */}
      <div className="flex border-b border-border bg-muted/30 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          { key: "overview", label: "Overview" },
          { key: "evidence", label: "Evidence" },
          { key: "decision_flow", label: "Decision Flow" },
          { key: "explainability", label: "Explainability" },
          { key: "mitre", label: "MITRE" },
          { key: "raw_logs", label: "Raw Logs" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "whitespace-nowrap px-3 py-2.5 text-[8.2px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer text-center flex-1",
              activeTab === tab.key 
                ? "text-cyan-500 border-cyan-500 bg-cyan-500/4" 
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pane scroll area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 bg-card">
        
        {/* TAB 1: OVERVIEW TAB (SECTION 8 requirements) */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Metadata Table */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3">
              <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-1.5">
                CORRELATED META INFORMATIONS
              </span>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[8.5px] font-mono leading-none">
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Timestamp</span>
                  <span className="text-foreground">{alert.timestamp}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Protocol / Port</span>
                  <span className="text-foreground">{alert.protocol} / {alert.destinationPort}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Source Host</span>
                  <span className="text-cyan-400 font-extrabold">{alert.sourceIp}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Destination Host</span>
                  <span className="text-foreground">{alert.destinationIp || "10.0.12.15"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Severity / risk score</span>
                  <span className={cn(
                    "font-bold",
                    alert.severity === Severity.CRITICAL ? "text-red-500" : "text-cyan-500"
                  )}>{alert.severity} ({alert.riskScore})</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Fusion Confidence</span>
                  <span className="text-cyan-500 font-extrabold">{Math.round(alert.confidenceScore * 100)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Campaign ID</span>
                  <span className="text-foreground">CAMP-${alert.attackType.slice(0, 3).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">MITRE Technique</span>
                  <span className="text-foreground">{alert.mitre?.techniqueId} - {alert.mitre?.techniqueName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/30">
                <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Affected Asset context</span>
                <span className="text-[8.5px] text-muted-foreground/90 font-medium">AWS-DB-PROD-01 (Host Operating System: Ubuntu Linux 22.04 LTS)</span>
              </div>
            </div>

            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5">
              <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-1.5 mb-1.5">
                MULTI-MODEL ADAPTER STATUS
              </span>
              <ModelStatusRow
                name="AI1 Analysis"
                label={meta.ai1Result}
                status={meta.ai1Status}
                source={meta.ai1Source}
                scope={alert.aiDecision.ai1?.inputScope}
              />
              <ModelStatusRow
                name="AI2A Analysis"
                label={meta.ai2aClass}
                status={meta.ai2aStatus}
                source={meta.ai2aSource}
                scope={alert.aiDecision.ai2a?.inputScope}
              />
              <ModelStatusRow
                name="AI2B Analysis"
                label={meta.ai2bWeb}
                status={meta.ai2bStatus}
                source={meta.ai2bSource}
                scope={alert.aiDecision.ai2b?.inputScope}
              />
              <div className="pt-2 mt-1.5 border-t border-border/30 text-[7px] font-mono text-muted-foreground uppercase">
                Fusion Mode: <span className="text-cyan-500 font-black">{meta.fusionMode}</span>
              </div>
            </div>

            {/* Confidence Voting Panel nested inside Overview as required */}
            <ConfidenceVotingPanel alert={alert} />
          </div>
        )}

        {/* TAB 2: EVIDENCE TAB (SECTION 9 & 10 requirements) */}
        {activeTab === "evidence" && (
          <div className="space-y-4">
            
            {/* ZEEK EVIDENCE BLOCK */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-border/30 pb-1.5">
                <Database size={12} className="text-cyan-500" />
                <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest font-black leading-none">
                  ZEEK Connection telemetry evidence
                </span>
              </div>

              {!isWebUrl ? (
                // Network Ingress attributes
                <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Connection State</span>
                    <span className="text-foreground">{alert.zeekData?.connState || "SF (Successful Connection)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Duration</span>
                    <span className="text-foreground">{alert.zeekData?.duration || "1.24s"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Originator Packets</span>
                    <span className="text-foreground">{alert.zeekData?.origPkts || 14} pkts</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Responder Packets</span>
                    <span className="text-foreground">{alert.zeekData?.respPkts || 12} pkts</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Originator Bytes</span>
                    <span className="text-foreground">{alert.zeekData?.origBytes || 3824} bytes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Responder Bytes</span>
                    <span className="text-foreground">{alert.zeekData?.respBytes || 4512} bytes</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Connection State History</span>
                    <span className="text-cyan-500 font-extrabold font-mono">ShADadfF</span>
                  </div>
                </div>
              ) : (
                // Web Ingress attributes
                <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">HTTP Method</span>
                    <span className="text-foreground">{alert.zeekData?.method || "POST"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">HTTP URI</span>
                    <span className="text-foreground truncate block max-w-37.5">{alert.zeekData?.uri || "/api/v1/auth/gateway"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Response Code</span>
                    <span className="text-foreground">200 OK</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">User Agent Header</span>
                    <span className="text-foreground text-[8px] break-all leading-normal block">{alert.zeekData?.userAgent || "Mozilla/5.0 (PentestBot/1.0; CLI)"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Semantic Threat Indicators</span>
                    <span className="text-red-400 font-extrabold">SUSPICIOUS_TOKEN_MATCH_SQLI_INJECTION</span>
                  </div>
                </div>
              )}
            </div>

            {/* SURICATA EVIDENCE BLOCK (SECTION 10 requirements) */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-blue-500" />
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest font-black leading-none">
                    Suricata intrusion rule evidence
                  </span>
                </div>
                {alert.suricataData?.signatureId && (
                  <span className="text-[6.5px] font-mono bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-widest leading-none">
                    FUSION COMPATIBLE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                <div>
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Signature ID</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{alert.suricataData?.signatureId || "SID: 2010915"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Matched Category</span>
                  <span className="text-foreground truncate block max-w-37.5">{alert.suricataData?.category || "Detection Mechanism Bypass"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Intrusion Signature Rule Name</span>
                  <span className="text-foreground leading-normal block">{alert.suricataData?.signature || alert.attackType + " Attempt Detected (FCAJ Fusion Rule)"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Matched Signature Pattern</span>
                  <span className="text-red-600 dark:text-red-400 text-[8px] leading-normal break-all block py-1 bg-red-500/10 dark:bg-red-950/25 px-2 border border-red-500/15 dark:border-red-950/30 rounded mt-1">
                    {alert.rawPayload?.slice(0, 80) || alert.payload?.slice(0, 80) || "union select administrative credentials"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DECISION FLOW TAB (SECTION 11 requirements) */}
        {activeTab === "decision_flow" && (
          <FusionDecisionFlow alert={alert} />
        )}

        {/* TAB 4: EXPLAINABILITY TAB (SECTION 13 requirements) */}
        {activeTab === "explainability" && (
          <ExplainabilityPanel alert={alert} />
        )}

        {/* TAB 5: MITRE ATT&CK TAB (SECTION 14 requirements) */}
        {activeTab === "mitre" && (
          <MitreAttackPanel alert={alert} />
        )}

        {/* TAB 6: RAW LOGS TAB (SECTION 15 requirements) */}
        {activeTab === "raw_logs" && (
          <RawLogViewer alert={alert} />
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

export default AlertDetailDrawer;
