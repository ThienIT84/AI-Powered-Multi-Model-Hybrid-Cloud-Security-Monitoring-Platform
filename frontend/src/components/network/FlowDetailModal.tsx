import React from "react";
import { 
  X, 
  ShieldAlert, 
  Terminal, 
  Server, 
  Binary, 
  Activity, 
  Database, 
  SlidersHorizontal,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";
import { ExplainabilityCenter } from "./ExplainabilityCenter";

interface FlowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: NetworkLog | null;
  onActionFeedback?: (message: { type: "success" | "warning"; text: string } | null) => void;
}

export const FlowDetailModal: React.FC<FlowDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  log,
  onActionFeedback
}) => {
  if (!isOpen || !log) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="flow-detail-modal-root">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-10 overflow-hidden text-slate-100 font-mono">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block">SIEM FORENSIC CORE</span>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">
                INSPECTING FLOW STATE: <span className="text-emerald-450">{log.id}</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-5 custom-scrollbar">
          {/* SEC 1: Connection Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>1. CONNECTION SUMMARY</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/40">
                <span className="text-[10px] text-slate-500 font-bold block">SOURCE ENDPOINT:</span>
                <span className="font-bold text-emerald-400 block">{log.srcIp}</span>
                <span className="text-[10px] text-slate-400 font-semibold block">Port: {log.srcPort}</span>
                <span className="text-[9px] text-slate-500 font-bold ml-px">Country: {log.country || "NL"}</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/40">
                <span className="text-[10px] text-slate-500 font-bold block">DESTINATION TARGET:</span>
                <span className="font-bold text-cyan-400 block">{log.destIp}</span>
                <span className="text-[10px] text-slate-400 font-semibold block">Port: {log.destPort}</span>
                <span className="text-[9px] text-slate-500 font-bold inline-block mt-1 bg-slate-800 px-1 py-0.2 rounded">
                  Service: {log.destPort === 80 ? "HTTP" : log.destPort === 443 ? "HTTPS" : log.destPort === 22 ? "SSH" : log.destPort === 53 ? "DNS" : "Unknown"}
                </span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">PROTOCOL & RUN:</span>
                  <span className="text-purple-400 font-extrabold">{log.protocol} protocol</span>
                </div>
                <div className="text-[10px]">
                  Duration: <strong className="text-slate-200">{(log.duration / 1000).toFixed(3)}s</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SEC 2: Zeek Evidence log details */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>2. ZEEK CONN.LOG EVIDENCE METADATA</span>
            </div>

            <div className="bg-slate-900/20 rounded border border-slate-800/70 p-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-[10px]">
              <div>
                <span className="text-slate-500 block">duration</span>
                <span className="text-slate-200 font-bold">{(log.duration / 1000).toFixed(4)}s</span>
              </div>
              <div>
                <span className="text-slate-500 block">orig_bytes</span>
                <span className="text-slate-200 font-bold">{(log.origBytes).toLocaleString()} B</span>
              </div>
              <div>
                <span className="text-slate-500 block">resp_bytes</span>
                <span className="text-slate-200 font-bold">{respBytes.toLocaleString()} B</span>
              </div>
              <div>
                <span className="text-slate-500 block">conn_state</span>
                <span className="text-indigo-400 font-black">{connectionState}</span>
              </div>
              <div>
                <span className="text-slate-500 block">orig_pkts</span>
                <span className="text-slate-200 font-bold">{origPackets}</span>
              </div>
              <div>
                <span className="text-slate-500 block">resp_pkts</span>
                <span className="text-slate-200 font-bold">{log.respPkts}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block font-bold">handshake_history</span>
                <span className="text-amber-500 font-mono text-[9px]">
                  {log.verdict === "ANOMALY" ? "ShAdDfrf" : "ShADdFf"} (Mapped Connection Sequence)
                </span>
                <span className="text-[8px] text-slate-600 block leading-tight mt-0.5">{getConnStateDesc(connectionState)}</span>
              </div>
            </div>
          </div>

          {/* SEC 3: AI1 & AI2A Parallel Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI1 Anomaly Scores */}
            <div className="bg-slate-900/30 p-3.5 border border-slate-800/60 rounded">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2.5 flex justify-between items-center">
                <span>AI1 HEURISTIC VERDICT</span>
                <span className={`text-[9px] px-1 rounded font-black ${log.verdict === "ANOMALY" ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-400"}`}>
                  {log.verdict}
                </span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Anomaly Index:</span>
                  <span className={`font-black ${log.verdict === "ANOMALY" ? "text-red-400" : "text-emerald-400"}`}>
                    {log.threatScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heuristic Threshold limit:</span>
                  <span className="text-slate-400 font-bold">65/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dynamic Decision:</span>
                  <span className={log.verdict === "ANOMALY" ? "text-red-400 font-extrabold" : "text-emerald-400"}>
                    {log.verdict === "ANOMALY" ? "ABNORMAL FOOTPRINT CH" : "COMPLIANT HANDSHAKE"}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-950 h-2 border border-slate-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${log.verdict === "ANOMALY" ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${log.threatScore}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase font-bold mt-1 block">Anomaly probability relative distribution</span>
                </div>
              </div>
            </div>

            {/* AI2D attack classifier */}
            <div className="bg-slate-900/30 p-3.5 border border-slate-800/60 rounded">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2.5">
                AI2A MULTICLASS THREAT CLASSIFICATION
              </div>

              <div className="space-y-2 text-xs">
                {multiclassClasses.map((cl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-extrabold text-slate-330 flex items-center gap-1">
                        {idx === 0 && <Zap className="w-2.5 h-2.5 text-amber-500 animate-bounce" />}
                        {cl.name}
                      </span>
                      <span className="font-bold text-slate-200">{cl.confidence}%</span>
                    </div>
                    {/* Progress Fill */}
                    <div className="w-full bg-slate-950 h-1 rounded-sm overflow-hidden">
                      <div 
                        className={`h-full rounded-sm ${idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-700" : "bg-slate-800"}`}
                        style={{ width: `${cl.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fusion Scale Explainability Section */}
          <div className="space-y-2">
            <ExplainabilityCenter log={log} />
          </div>

          {/* SEC 4: Fusion Layer Decisions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>4. FUSION DECISION & MITIGATION PATH</span>
            </div>

            <div className="p-3 bg-slate-900/50 rounded border border-slate-800/70 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Incident Severity Matrix:</span>
                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border ${
                    log.severity === "CRITICAL" || log.severity === "HIGH" 
                      ? "bg-red-950/40 text-red-400 border-red-500/20" 
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {log.severity}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  Final Weighted Threat Index: <span className="text-amber-500">{log.threatScore}/100</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded text-xs border border-slate-900 leading-relaxed font-sans text-slate-300">
                <span className="text-[9px] font-black font-mono text-slate-500 block mb-0.5 tracking-wider">COG_DECISION_FLOW REASON_LOG:</span>
                {log.reason}
              </div>

              {/* Forensic Hex Dump inline */}
              {log.hexDump && (
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-500 tracking-wider">HEXADECIMAL PACKET HEURISTIC STREAM</div>
                  <pre className="p-2 bg-black/80 text-emerald-450 border border-slate-800 rounded text-[9.5px] leading-tight select-all overflow-x-auto max-h-35 custom-scrollbar">
                    {log.hexDump}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* SEC 5: Incident Correlation alert linkage */}
          <div className="bg-amber-950/15 border border-amber-500/20 p-3 rounded flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-amber-500 uppercase tracking-wider text-[10px]">INCIDENT CORRELATION LINK</div>
              <p className="text-slate-300 font-sans leading-relaxed">
                This stream packet shares similarities with active alert cluster <strong className="text-amber-400 font-mono">Incident #42 ("Simulated multi-stage exfiltration attack")</strong>. Automated playbooks recommended for execution immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Action button triggers footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 flex justify-end gap-2 text-xs">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-800 rounded text-slate-400 hover:text-slate-100 uppercase font-black tracking-widest cursor-pointer hover:bg-slate-900"
          >
            DISMISS
          </button>
          
          <button 
            onClick={handleForwardAlert}
            className="px-3 py-1.5 bg-background border border-slate-800 rounded hover:bg-slate-900 text-slate-200 uppercase font-black tracking-widest cursor-pointer transition-all"
          >
            FORWARD ALERT
          </button>
          
          <button 
            onClick={handleBlockSource}
            className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-500/25 rounded uppercase font-black tracking-widest cursor-pointer transition-all"
          >
            BLOCKLIST SOURCE IP
          </button>
        </div>
      </div>
    </div>
  );
};
