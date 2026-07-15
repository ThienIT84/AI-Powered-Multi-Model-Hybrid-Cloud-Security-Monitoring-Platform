import React, { useState } from "react";
import { 
  X, 
  ExternalLink, 
  Shield, 
  Database,
  Lock,
  UserX,
  Share2,
  Trash2,
  MessageCircle,
  Activity,
  CheckCircle2,
  Workflow,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Alert, Severity, AlertStatus, getAlertFusionMeta } from "../../types";
import { cn } from "../../lib/utils";
import { AlertActionState } from "../../services/alerts.service";

// Custom imported modules from alerts directory
import { FusionDecisionFlow } from "./FusionDecisionFlow";
import { MitreAttackPanel } from "./MitreAttackPanel";
import { RawLogViewer } from "./RawLogViewer";

interface AlertDetailDrawerProps {
  alert: Alert;
  onClose: () => void;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
  actionState?: AlertActionState;
  onCreateCase?: (alert: Alert) => void;
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
          {source === "real" ? "REAL" : source?.toUpperCase() || "UNKNOWN"}
        </span>
        <span className="text-[7px] font-mono font-black text-cyan-500 uppercase max-w-30 truncate">{isUnavailable ? status : label}</span>
      </div>
    </div>
  );
}

export function AlertDetailDrawer({ alert, onClose, onUpdateAlert, actionState = "idle", onCreateCase }: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "decision_flow" | "mitre" | "raw_logs">("overview");
  const meta = getAlertFusionMeta(alert);
  const rateFeatures = alert.zeekData.rateFeatures;
  const isActionPending = actionState === "pending";

  const handleResolve = () => {
    if (onUpdateAlert) {
      onUpdateAlert(alert.id, { status: AlertStatus.RESOLVED });
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

  const isWebUrl = alert.attackType.includes("XSS") || alert.attackType.includes("SQL") || alert.attackType.includes("Injection") || alert.attackType.includes("Web");

  return (
    <div className="w-full bg-card h-full flex flex-col overflow-hidden relative border-l border-border select-none animate-fade-in">
      
      {/* Drawer Header Block */}
      <div className="p-4 border-b border-border bg-muted/20 space-y-3 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/15">
              <Workflow className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="leading-none">
              <h2 className="text-[10.5px] font-black text-foreground uppercase tracking-widest">{alert.attackType}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[8px] text-muted-foreground font-black uppercase tracking-widest animate-pulse">
                <span>INDEX: {displayId}</span>
                <span>-</span>
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

        {/* Dynamic Overview Info */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-background/70 p-2 rounded-lg border border-border/60">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wider block mb-0.5">SRC IP</span>
            <div className="flex items-center justify-between font-mono text-[9px] leading-none">
              <span className="font-extrabold text-cyan-500">{alert.sourceIp}</span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50 cursor-pointer hover:text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-background/70 p-2 rounded-lg border border-border/60">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wider block mb-0.5">FUSION CONFIDENCE</span>
            <div className="flex items-center justify-between leading-none">
              <span className="text-[9px] font-mono font-black text-cyan-500">{Math.round(alert.confidenceScore * 100)}%</span>
              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden ml-1">
                <div 
                  className="h-full rounded-full bg-cyan-500 transition-all duration-300" 
                  style={{ width: `${alert.confidenceScore * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Rows: Overview, Evidence, Decision Flow, MITRE, Raw Logs */}
      <div className="flex border-b border-border bg-muted/30 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          { key: "overview", label: "Overview" },
          { key: "evidence", label: "Evidence" },
          { key: "decision_flow", label: "Decision Flow" },
          { key: "mitre", label: "MITRE" },
          { key: "raw_logs", label: "Raw Logs" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "whitespace-nowrap px-3 py-2.5 text-[8.2px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer text-center flex-1 animate-fade-in",
              activeTab === tab.key 
                ? "text-cyan-500 border-cyan-500 bg-cyan-500/4" 
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Detail sidebar container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 bg-card">
        
        {/* TAB 1: OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            {/* Metadata Table */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3">
              <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-1.5">
                ALERT DECISION SUMMARY
              </span>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[8.5px] font-mono leading-none">
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Attack Type</span>
                  <span className="text-foreground font-bold">{alert.attackType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Severity</span>
                  <span className={cn(
                    "font-bold",
                    alert.severity === Severity.CRITICAL ? "text-red-500" : "text-cyan-500"
                  )}>{alert.severity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Confidence Score</span>
                  <span className="text-cyan-500 font-extrabold">{Math.round(alert.confidenceScore * 100)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">MITRE ATT&CK ID</span>
                  <span className="text-foreground font-bold">{alert.mitre?.techniqueId || "Not available"}</span>
                </div>
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
                  <span className="text-foreground">{alert.destinationIp || "Not available"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/30">
                <span className="text-muted-foreground/60 block text-[7px] uppercase font-black mb-1">Affected Infrastructure</span>
                <span className="text-[8.5px] text-muted-foreground/90 font-medium">
                  {alert.cloudProvider || alert.region
                    ? `${alert.cloudProvider ?? "Unknown provider"} asset in ${alert.region ?? "unknown region"}`
                    : "Cloud metadata not supplied by backend"}
                </span>
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
          </div>
        )}

        {/* TAB 2: EVIDENCE TAB */}
        {activeTab === "evidence" && (
          <div className="space-y-4 animate-fade-in">
            {/* ZEEK EVIDENCE BLOCK */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-border/30 pb-1.5">
                <Database size={12} className="text-cyan-500" />
                <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  Zeek Log telemetry excerpt
                </span>
              </div>

              {isWebUrl ? (
                // Zeek http.log excerpt
                <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Log Source</span>
                    <span className="text-[#06b6d4] font-bold">zeek http.log</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">HTTP Method</span>
                    <span className="text-foreground">{alert.zeekData?.method || "Not available"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">HTTP URI Trigger</span>
                    <span className="text-foreground truncate block max-w-70 font-bold">{alert.zeekData?.uri || "Not available"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">User Agent Header</span>
                    <span className="text-foreground text-[8px] break-all leading-normal block">{alert.zeekData?.userAgent || "Not available"}</span>
                  </div>
                </div>
              ) : (
                // Zeek conn.log excerpt
                <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Log Source</span>
                    <span className="text-[#06b6d4] font-bold">zeek conn.log</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Connection State</span>
                    <span className="text-foreground">{alert.zeekData?.connState || "Not available"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Duration</span>
                    <span className="text-foreground">{alert.zeekData?.duration ?? "Not available"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Originator Bytes</span>
                    <span className="text-foreground">{alert.zeekData?.origBytes ?? "Not available"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Originator Packets</span>
                    <span className="text-foreground">{alert.zeekData?.origPkts ?? "Not available"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Responder Packets</span>
                    <span className="text-foreground">{alert.zeekData?.respPkts ?? "Not available"}</span>
                  </div>
                </div>
              )}
            </div>

            {rateFeatures && (
              <div className={cn(
                "bg-background/60 rounded-xl border p-3.5 space-y-3",
                rateFeatures.dosSuspected || rateFeatures.ddosSuspected
                  ? "border-red-500/35"
                  : "border-border/80"
              )}>
                <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} className={rateFeatures.dosSuspected || rateFeatures.ddosSuspected ? "text-red-500" : "text-cyan-500"} />
                    <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                      Traffic-rate window evidence
                    </span>
                  </div>
                  {(rateFeatures.dosSuspected !== undefined || rateFeatures.ddosSuspected !== undefined) && (
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-[7px] font-black uppercase",
                      rateFeatures.ddosSuspected
                        ? "border-red-500/30 bg-red-500/10 text-red-500"
                        : rateFeatures.dosSuspected
                          ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                    )}>
                      {rateFeatures.ddosSuspected
                        ? "DDoS suspected"
                        : rateFeatures.dosSuspected
                          ? "DoS suspected"
                          : "Below threshold"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[8.5px] leading-none">
                  {rateFeatures.windowSeconds !== undefined && (
                    <div>
                      <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Observation Window</span>
                      <span className="text-foreground font-bold">{rateFeatures.windowSeconds}s</span>
                    </div>
                  )}
                  {rateFeatures.sameSrcDstConnectionCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Same Source - Destination</span>
                      <span className="text-foreground font-bold">{rateFeatures.sameSrcDstConnectionCount} connections</span>
                    </div>
                  )}
                  {rateFeatures.destinationConnectionCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Destination Total</span>
                      <span className="text-foreground font-bold">{rateFeatures.destinationConnectionCount} connections</span>
                    </div>
                  )}
                  {rateFeatures.uniqueSourceCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Unique Sources</span>
                      <span className="text-foreground font-bold">{rateFeatures.uniqueSourceCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SURICATA EVIDENCE BLOCK */}
            <div className="bg-background/60 border border-border/80 rounded-xl p-3.5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-blue-500" />
                  <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                    Suricata Intrusion rule evidence
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono leading-none">
                <div>
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Signature ID</span>
                  <span className="text-blue-400 font-bold">{alert.suricataData?.signatureId || "Not available"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Category Category</span>
                  <span className="text-foreground truncate block max-w-37.5">{alert.suricataData?.category || "Not available"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground/60 text-[6.5px] block uppercase font-bold mb-1">Intrusion signature Rule matched</span>
                  <span className="text-foreground leading-normal block">{alert.suricataData?.signature || "Not available"}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DECISION FLOW TAB */}
        {activeTab === "decision_flow" && (
          <div className="animate-fade-in text-card-foreground">
            <FusionDecisionFlow alert={alert} />
          </div>
        )}

        {/* TAB 4: MITRE ATT&CK TAB */}
        {activeTab === "mitre" && (
          <div className="animate-fade-in">
            <MitreAttackPanel alert={alert} />
          </div>
        )}

        {/* TAB 5: RAW LOGS TAB */}
        {activeTab === "raw_logs" && (
          <div className="animate-fade-in">
            <RawLogViewer alert={alert} />
          </div>
        )}

      </div>

      {/* Quick Actions Panel */}
      <div className="p-3 bg-muted/30 border-t border-border space-y-2 shrink-0 select-none">
        {actionState !== "idle" && (
          <div className={cn(
            "rounded border px-2 py-1.5 text-[8px] font-black uppercase tracking-widest",
            actionState === "failed"
              ? "border-red-500/25 bg-red-500/10 text-red-500"
              : actionState === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                : "border-amber-500/25 bg-amber-500/10 text-amber-500"
          )}>
            Action {actionState}
          </div>
        )}
        <button
          onClick={() => onCreateCase?.(alert)}
          disabled={isActionPending}
          className="w-full py-2 border border-border bg-background hover:bg-muted text-foreground text-[9.5px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-none"
        >
          Create Case
        </button>

        <button 
          onClick={handleResolve}
          disabled={isActionPending}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-none"
        >
          <CheckCircle2 size={12} /> Mark as Resolved
        </button>
      </div>

    </div>
  );
}

export default AlertDetailDrawer;
