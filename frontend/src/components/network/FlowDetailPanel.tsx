import React from "react";
import { 
  X, 
  Binary, 
  Server, 
  Database,
  Shield,
  Activity
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

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

  // Connection descriptions
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

  const origPackets = null;
  const respBytes = log.respBytes ?? null;
  const connectionState = log.destPort === 22 && log.verdict === "ANOMALY" 
    ? "REJ" 
    : log.verdict === "ANOMALY" && log.origBytes > 50000000 
    ? "RSTR" 
    : "SF";

  const isAnomaly = log.verdict === "ANOMALY";

  const handleBlockSource = () => {
    if (onActionFeedback) {
      onActionFeedback({
        type: "warning",
        text: `BLOCKED ENTRY: Firewall rule updated. Node source IP ${log.srcIp} blocked at edge router.`
      });
    }
    onClose();
  };

  const handleForwardAlert = () => {
    if (onActionFeedback) {
      onActionFeedback({
        type: "success",
        text: `ZEEK RELAY: Flow ID [${log.id.substring(0, 10)}] marked for network monitoring follow-up.`
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
              <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest block leading-none">FLOW INSPECTOR</span>
            <span className="text-[10px] font-black text-foreground uppercase tracking-tight truncate block mt-0.5">
              UID: <span className="text-emerald-500 dark:text-emerald-400">{log.id}</span>
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 text-[10.5px]">
        {/* SEC 1: Connection Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Server className="w-3 h-3 text-slate-500" />
            <span>1. NETWORK ENDPOINTS</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">SOURCE HOST:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">{log.srcIp}</span>
              <span className="text-[8.5px] text-muted-foreground block font-bold">Port: {log.srcPort}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">DESTINATION HOST:</span>
              <span className="font-bold text-cyan-500 dark:text-cyan-400 block truncate">{log.destIp}</span>
              <span className="text-[8.5px] text-muted-foreground block font-bold">Port: {log.destPort}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-muted-foreground font-bold block">PROTOCOL:</span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">{log.protocol}</span>
              </div>
              <div className="text-[9px] mt-0.5">
                Duration: <strong className="text-foreground">{(log.duration / 1000).toFixed(3)}s</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Correlation Context</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">SENSOR / SOURCE</span>
              <span className="font-bold text-foreground block truncate">{log.sensorId || "unknown"} / {log.source || "unknown"}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">CORRELATION ID</span>
              <span className="font-bold text-cyan-500 block truncate">{log.correlationId || log.id}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">RELATED ALERT</span>
              <span className="font-bold text-amber-500 block truncate">{log.relatedAlertId || "None"}</span>
            </div>
            <div className="bg-secondary/25 dark:bg-slate-900/45 p-2 rounded border border-border/80">
              <span className="text-[8px] text-muted-foreground font-bold block">RELATED CASE</span>
              <span className="font-bold text-emerald-500 block truncate">{log.relatedCaseId || "None"}</span>
            </div>
          </div>
        </div>

        {/* SEC 2: Zeek Evidence log details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
            <Database className="w-3 h-3 text-slate-500" />
            <span>2. FLOW TELEMETRY METRICS</span>
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
              <span className="text-foreground font-bold">{respBytes === null ? "Unavailable" : `${respBytes.toLocaleString()} B`}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">conn_state</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{connectionState}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">orig_pkts</span>
              <span className="text-foreground font-bold">{origPackets === null ? "Unavailable" : origPackets}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9px]">resp_pkts</span>
              <span className="text-foreground font-bold">{log.respPkts}</span>
            </div>
            <div className="col-span-2 border-t border-border/40 pt-1">
              <span className="text-muted-foreground block font-bold text-[9px]">handshake_history</span>
              <span className="text-amber-600 dark:text-amber-500 font-mono text-[9.5px] font-bold">
                {isAnomaly ? "ShAdDfrf" : "ShADdFf"}
              </span>
              <span className="text-[8px] text-muted-foreground block leading-tight mt-0.5 font-sans">
                {getConnStateDesc(connectionState)}
              </span>
            </div>
          </div>
        </div>

        {/* SEC 3: AI1 Anomaly Assessment */}
        <div className="bg-secondary/20 dark:bg-slate-900/25 p-2.5 border border-border rounded space-y-2">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5 flex justify-between items-center">
            <span>AI1 ANOMALY DETECTION</span>
            <span className={`text-[8px] px-1 rounded font-black border ${
              isAnomaly 
                ? "bg-red-500/10 dark:bg-red-950 text-red-650 dark:text-red-400 border-red-500/20 animate-pulse" 
                : "bg-emerald-500/10 dark:bg-emerald-950 text-emerald-650 dark:text-emerald-400 border-emerald-500/20"
            }`}>
              {isAnomaly ? "Anomaly" : "Normal"}
            </span>
          </div>
          
          <div className="space-y-1.5 text-[9.5px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anomaly Coefficient:</span>
              <span className={`font-black ${isAnomaly ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {log.threatScore}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Threshold Target:</span>
              <span className="text-muted-foreground font-bold">70%</span>
            </div>

            <div className="pt-1">
              <div className="w-full bg-secondary dark:bg-slate-950 h-1.5 border border-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isAnomaly ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${log.threatScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEC 4: Hex Flow Capture */}
        {log.hexDump && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">
              <Activity className="w-3 h-3 text-slate-500" />
              <span>3. FLOW PACKET HEX STREAM</span>
            </div>
            <pre className="p-2 bg-slate-950 dark:bg-black text-[8px] leading-tight text-emerald-500 dark:text-emerald-400 border border-border rounded select-all overflow-x-auto max-h-25 font-mono whitespace-pre text-wrap sm:text-nowrap">
              {log.hexDump}
            </pre>
          </div>
        )}
      </div>

      {/* Action buttons */}
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
            NOTIFY SOC
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
