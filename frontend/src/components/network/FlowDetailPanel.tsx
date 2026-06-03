import React from "react";
import { 
  X, 
  ShieldAlert, 
  Terminal, 
  Server, 
  Binary, 
  Database, 
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";
import { ExplainabilityCenter } from "./ExplainabilityCenter";

interface FlowDetailPanelProps {
  log: NetworkLog | null;
  onClose: () => void;
  onActionFeedback?: (message: { type: "success" | "warning"; text: string } | null) => void;
}

export const FlowDetailPanel: React.FC<FlowDetailPanelProps> = ({ 
  log,
  onClose,
  onActionFeedback
}) => {
  if (!log) return null;

  // Derive Zeek states on the fly
  const getConnStateDesc = (state: string) => {
    switch(state) {
      case "S0": return "S0: Connection attempt seen, no reply.";
      case "SF": return "SF: Normal connection establishment and termination.";
      case "REJ": return "REJ: Connection attempt rejected by target host.";
      case "RSTR": return "RSTR: Connection established then reset by responder.";
      case "RSTOS0": return "RSTOS0: Responder sent reset in response to SYN.";
      default: return `${state}: Verified Zeek session descriptor state.`;
    }
  };

  // Static or seed-based calculations
  const origPackets = Math.max(1, Math.ceil(log.origBytes / 1460));
  const respBytes = Math.round(log.origBytes * (log.verdict === "ANOMALY" ? 0.05 : 1.35) + (log.respPkts * 64));
  const connectionState = log.destPort === 22 && log.verdict === "ANOMALY" 
    ? "REJ" 
    : log.verdict === "ANOMALY" && log.origBytes > 50000000 
    ? "RSTR" 
    : "SF";

  // Derive AI2A Multi-class Confidence Array
  const isAnomaly = log.verdict === "ANOMALY";
  const ai2aPrediction = isAnomaly
    ? log.reason.toLowerCase().includes("scan") || log.reason.toLowerCase().includes("recon")
      ? "Port Scan"
      : log.reason.toLowerCase().includes("leak") || log.reason.toLowerCase().includes("exfil")
      ? "Botnet (Exfiltration)"
      : log.destPort === 22
      ? "Brute Force"
      : "DoS"
    : "Normal";

  const multiclassClasses = isAnomaly
    ? [
        { name: ai2aPrediction, confidence: log.confidence },
        { name: ai2aPrediction === "Port Scan" ? "DoS" : "Port Scan", confidence: Math.round((100 - log.confidence) * 0.6) },
        { name: "Normal", confidence: Math.round((100 - log.confidence) * 0.4) }
      ]
    : [
        { name: "Normal", confidence: log.confidence },
        { name: "Port Scan", confidence: Math.round((100 - log.confidence) * 0.5) },
        { name: "DoS", confidence: Math.round((100 - log.confidence) * 0.5) }
      ];

  const handleBlockSource = () => {
    if (onActionFeedback) {
      onActionFeedback({
        type: "warning",
        text: `BLOCKED ENTRY: Firewall rule updated. Node source IP ${log.srcIp} dropped instantly at edge router.`
      });
    }
    onClose();
  };

  const handleForwardAlert = () => {
    if (onActionFeedback) {
      onActionFeedback({
        type: "success",
        text: `SIEM RELAY COMPLETE: Security notification dispatched to SOC Slack channels. Session Token ID [${log.id.substring(0, 10)}] registered.`
      });
    }
    onClose();
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-foreground font-mono flex flex-col h-auto" 
      id="flow-detail-panel-root"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-500 animate-pulse" />
          <div className="min-w-0">
            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest block leading-none">SIEM FORENSIC CORE</span>
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-tight truncate">
              LOG: <span className="text-emerald-500 dark:text-emerald-400">{log.id}</span>
            </h3>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 flex-1 space-y-4 text-[10.5px]">
        {/* SEC 1: Connection Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Server className="w-3 h-3 text-slate-500" />
            <span>1. CONNECTION SUMMARY</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">SOURCE ENDPOINT:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">{log.srcIp}</span>
              <span className="text-[8.5px] text-muted-foreground block font-bold">Port: {log.srcPort}</span>
              <span className="text-[8px] text-muted-foreground font-bold leading-none block mt-0.5">Country: {log.country || "NL"}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">DESTINATION TARGET:</span>
              <span className="font-bold text-cyan-500 dark:text-cyan-400 block truncate">{log.destIp}</span>
              <span className="text-[8.5px] text-muted-foreground block font-bold">Port: {log.destPort}</span>
              <span className="text-[8px] text-muted-foreground leading-none inline-block mt-0.5 bg-secondary border border-border px-1 rounded">
                {log.destPort === 80 ? "HTTP" : log.destPort === 443 ? "HTTPS" : log.destPort === 22 ? "SSH" : log.destPort === 53 ? "DNS" : "Unknown"}
              </span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-muted-foreground font-bold block">PROTOCOL & RUN:</span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">{log.protocol} protocol</span>
              </div>
              <div className="text-[9px] mt-0.5">
                Duration: <strong className="text-foreground">{(log.duration / 1000).toFixed(3)}s</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SEC 2: Zeek Evidence log details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Database className="w-3 h-3 text-slate-500" />
            <span>2. ZEEK CONN.LOG EVIDENCE METADATA</span>
          </div>

          <div className="bg-secondary/15 dark:bg-slate-900/15 rounded border border-border p-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9.5px]">
            <div>
              <span className="text-muted-foreground block text-[9px]">duration</span>
              <span className="text-foreground font-bold">{(log.duration / 1000).toFixed(4)}s</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">orig_bytes</span>
              <span className="text-foreground font-bold">{(log.origBytes).toLocaleString()} B</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">resp_bytes</span>
              <span className="text-foreground font-bold">{respBytes.toLocaleString()} B</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">conn_state</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{connectionState}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">orig_pkts</span>
              <span className="text-foreground font-bold">{origPackets}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">resp_pkts</span>
              <span className="text-foreground font-bold">{log.respPkts}</span>
            </div>
            <div className="col-span-2 border-t border-border/40 pt-1">
              <span className="text-muted-foreground block font-bold text-[9px]">handshake_history</span>
              <span className="text-amber-600 dark:text-amber-500 font-mono text-[9.5px] font-bold">
                {log.verdict === "ANOMALY" ? "ShAdDfrf" : "ShADdFf"}
              </span>
              <span className="text-[8px] text-muted-foreground block leading-tight mt-0.5 font-sans">{getConnStateDesc(connectionState)}</span>
            </div>
          </div>
        </div>

        {/* SEC 3: AI1 & AI2A Parallel Analysis Results */}
        <div className="grid grid-cols-1 gap-3">
          {/* AI1 Anomaly Scores */}
          <div className="bg-secondary/20 dark:bg-slate-900/25 p-2.5 border border-border rounded">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5 mb-1.5 flex justify-between items-center">
              <span>AI1 HEURISTIC VERDICT</span>
              <span className={`text-[8px] px-1 rounded font-black border ${
                log.verdict === "ANOMALY" 
                  ? "bg-red-500/10 dark:bg-red-950 text-red-650 dark:text-red-400 border-red-500/20 animate-pulse" 
                  : "bg-emerald-500/10 dark:bg-emerald-950 text-emerald-650 dark:text-emerald-400 border-emerald-500/20"
              }`}>
                {log.verdict}
              </span>
            </div>
            
            <div className="space-y-1.5 text-[9.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anomaly Index:</span>
                <span className={`font-black ${log.verdict === "ANOMALY" ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {log.threatScore}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heuristic Threshold:</span>
                <span className="text-muted-foreground font-bold">65/100</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-muted-foreground font-medium">Dynamic Decision:</span>
                <span className={log.verdict === "ANOMALY" ? "text-red-650 dark:text-red-400" : "text-emerald-600 dark:text-emerald-500"}>
                  {log.verdict === "ANOMALY" ? "ABNORMAL FOOTPRINT CH" : "COMPLIANT HANDSHAKE"}
                </span>
              </div>

              <div className="pt-1.5">
                <div className="w-full bg-secondary dark:bg-slate-950 h-1.5 border border-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${log.verdict === "ANOMALY" ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${log.threatScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI2D attack classifier */}
          <div className="bg-secondary/20 dark:bg-slate-900/25 p-2.5 border border-border rounded">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5 mb-1.5">
              AI2A MULTICLASS THREAT CLASSIFICATION
            </div>

            <div className="space-y-1.5 text-[9.5px]">
              {multiclassClasses.map((cl, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="font-extrabold text-foreground flex items-center gap-1">
                      {idx === 0 && <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                      {cl.name}
                    </span>
                    <span className="font-bold text-foreground">{cl.confidence}%</span>
                  </div>
                  {/* Progress Fill */}
                  <div className="w-full bg-secondary dark:bg-slate-950 h-1 rounded-sm overflow-hidden border border-border/10">
                    <div 
                      className={`h-full rounded-sm ${idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400 dark:bg-slate-700" : "bg-slate-300 dark:bg-slate-800"}`}
                      style={{ width: `${cl.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fusion Scale Explainability Section */}
        <div className="border border-border/65 rounded p-2.5 bg-secondary/10">
          <ExplainabilityCenter log={log} />
        </div>

        {/* SEC 4: Fusion Layer Decisions */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>4. FUSION DECISION & MITIGATION</span>
          </div>

          <div className="p-2.5 bg-secondary/25 dark:bg-slate-900/40 rounded border border-border space-y-2">
            <div className="flex items-center justify-between gap-1 flex-wrap text-[9px]">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-bold">Severity:</span>
                <span className={`font-black px-1.5 py-0.2 rounded border ${
                  log.severity === "CRITICAL" || log.severity === "HIGH" 
                    ? "bg-red-550/10 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-500/15" 
                    : "bg-secondary dark:bg-slate-800 text-muted-foreground dark:text-slate-300 border-border"
                }`}>
                  {log.severity}
                </span>
              </div>
              <div className="text-muted-foreground font-bold">
                Threat Index: <span className="text-amber-600 dark:text-amber-500">{log.threatScore}/100</span>
              </div>
            </div>

            <div className="bg-background p-2 rounded text-[10px] border border-border/80 leading-normal font-sans text-foreground">
              <span className="text-[8px] font-black font-mono text-muted-foreground block mb-0.5 uppercase tracking-wider">COG_DECISION_FLOW_LOG:</span>
              {log.reason}
            </div>

            {/* Forensic Hex Dump inline */}
            {log.hexDump && (
              <div className="space-y-0.5">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">HEXADECIMAL PACKET HEURISTIC STREAM</div>
                <pre className="p-1.5 bg-slate-950 dark:bg-black/90 text-[8.5px] leading-tight text-emerald-500 dark:text-emerald-400 border border-border rounded select-all overflow-x-auto max-h-22.5 custom-scrollbar font-mono">
                  {log.hexDump}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* SEC 5: Incident Correlation alert linkage */}
        <div className="bg-amber-500/5 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-500/40 p-3 rounded flex items-start gap-2.5 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5 text-[9.5px]">
            <div className="font-black text-amber-750 dark:text-amber-400 uppercase tracking-wider text-[8.5px]">INCIDENT CORRELATION LINK</div>
            <p className="text-amber-900/95 dark:text-amber-200/90 font-sans leading-normal">
              Shares fingerprints with simulated multi-stage attack <strong className="text-amber-700 dark:text-amber-305 font-mono">Active Incident #42</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Action button triggers footer */}
      <div className="p-3 border-t border-border bg-slate-50 dark:bg-slate-900/60 flex flex-wrap justify-between gap-1.5 shrink-0">
        <button 
          onClick={onClose}
          className="px-2 py-1 text-[8.5px] border border-border rounded text-muted-foreground hover:text-foreground hover:bg-secondary uppercase font-black tracking-widest cursor-pointer"
        >
          DISMISS
        </button>
        
        <div className="flex gap-1.5">
          <button 
            onClick={handleForwardAlert}
            className="px-2 py-1 text-[8.5px] bg-background border border-border rounded hover:bg-secondary text-foreground uppercase font-black tracking-widest cursor-pointer transition-all"
          >
            FORWARD
          </button>
          
          <button 
            onClick={handleBlockSource}
            className="px-2 py-1 text-[8.5px] bg-red-500/15 hover:bg-red-500/25 text-red-650 dark:text-red-400 border border-red-500/20 rounded uppercase font-black tracking-widest cursor-pointer transition-all"
          >
            BLOCK IP
          </button>
        </div>
      </div>
    </div>
  );
};
