import React from "react";
import { Server, GitFork } from "lucide-react";
import { cn } from "../../lib/utils";
import { EndpointFCAJItem } from "./endpointFCAJData";

interface EndpointDetailDrawerProps {
  selectedEndpointObj: EndpointFCAJItem | undefined;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

export const EndpointDetailDrawer: React.FC<EndpointDetailDrawerProps> = ({
  selectedEndpointObj,
  isDrawerOpen,
  setIsDrawerOpen,
}) => {
  if (!selectedEndpointObj || !isDrawerOpen) return null;

  return (
    <div 
      id="endpoint-detail-drawer"
      className="lg:col-span-4 bg-card border border-border p-5 rounded-xl shadow-xs font-mono text-[10px] space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Server size={15} className="text-indigo-650" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider">{selectedEndpointObj.hostname}</span>
            <span className="text-[8px] text-muted-foreground font-black">{selectedEndpointObj.id}</span>
          </div>
        </div>
        <button 
          id="close-endpoint-drawer-btn"
          onClick={() => setIsDrawerOpen(false)}
          className="p-1 px-2.5 hover:bg-muted border border-border text-[9px] font-black rounded uppercase cursor-pointer text-foreground"
        >
          Close
        </button>
      </div>

      {/* ASSET INFORMATION */}
      <div className="space-y-2 border-b border-border pb-3">
        <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5 font-black">Asset Information</h3>
        <div className="grid grid-cols-2 gap-2 text-[9.5px]">
          <div><span className="text-slate-400">Hostname:</span> <p className="font-bold">{selectedEndpointObj.hostname}</p></div>
          <div><span className="text-slate-400">IP Address:</span> <p className="font-bold">{selectedEndpointObj.ip}</p></div>
          <div><span className="text-slate-400">MAC Address:</span> <p className="font-bold">{selectedEndpointObj.mac}</p></div>
          <div><span className="text-slate-400">OS Module:</span> <p className="font-bold">{selectedEndpointObj.os}</p></div>
          <div><span className="text-slate-400">Role Assign:</span> <p className="font-bold text-foreground">{selectedEndpointObj.role}</p></div>
          <div><span className="text-slate-400">Telemetry Register:</span> <p className="font-bold">{selectedEndpointObj.firstSeen}</p></div>
        </div>
      </div>

      {/* NETWORK STATS ACTIVITY */}
      <div className="space-y-2 border-b border-border pb-3">
        <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5 font-black">Network Analytics Spectrum</h3>
        <div className="grid grid-cols-2 gap-2 text-[9.5px]">
          <div><span className="text-slate-400">Connections (Zeek):</span> <p className="font-bold text-amber-500">{selectedEndpointObj.totalConnections} Flows</p></div>
          <div><span className="text-slate-400">Dispatched Payload:</span> <p className="font-bold text-indigo-500">{(selectedEndpointObj.totalBytes / (1024 * 1024)).toFixed(2)} MB</p></div>
        </div>
        <div className="pt-2">
          <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold block mb-1">Port Service Distribution Bounds</span>
          <div className="grid grid-cols-5 gap-1 text-[8.5px] text-center">
            <div className="bg-secondary/40 border border-border rounded p-1">
              <span className="text-slate-400 block h-3">HTTP</span>
              <span className="font-black text-foreground">{selectedEndpointObj.services.HTTP}</span>
            </div>
            <div className="bg-secondary/40 border border-border rounded p-1">
              <span className="text-slate-400 block h-3">DNS</span>
              <span className="font-black text-foreground">{selectedEndpointObj.services.DNS}</span>
            </div>
            <div className="bg-secondary/40 border border-border rounded p-1">
              <span className="text-slate-400 block h-3">SSH</span>
              <span className="font-black text-foreground">{selectedEndpointObj.services.SSH}</span>
            </div>
            <div className="bg-secondary/40 border border-border rounded p-1">
              <span className="text-slate-400 block h-3">HTTPS</span>
              <span className="font-black text-foreground">{selectedEndpointObj.services.HTTPS}</span>
            </div>
            <div className="bg-secondary/40 border border-border rounded p-1">
              <span className="text-slate-400 block h-3">OTHER</span>
              <span className="font-black text-foreground">{selectedEndpointObj.services.OTHER}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS MODULE DEEP RESEARCH */}
      <div className="space-y-4 border-b border-border pb-3">
        <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5 font-black">AI Models Cognition Insights</h3>
        
        <div className="space-y-2.5 font-sans">
          <div className="bg-muted/40 border border-border p-2.5 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
              <span className="text-indigo-600 dark:text-cyan-400 font-bold">AI1 Anomaly Estimator</span>
              <span className={cn(
                "px-1 rounded",
                selectedEndpointObj.ai1.prediction === "ANOMALOUS" ? "bg-red-500/10 text-red-500" : "bg-neutral-500/10 text-neutral-400"
              )}>{selectedEndpointObj.ai1.prediction}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">Anomaly Prediction Index</span>
              <span className="font-mono font-extrabold text-foreground">{selectedEndpointObj.ai1.anomalyScore}%</span>
            </div>
          </div>

          <div className="bg-muted/40 border border-border p-2.5 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
              <span className="text-indigo-600 dark:text-cyan-400 font-bold">AI2A Attack Classifier</span>
              <span className="text-amber-500">{selectedEndpointObj.ai2a.attackType !== "None" ? "ATTACK TRIGGERED" : "CLEAR"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">Attack Classification: {selectedEndpointObj.ai2a.attackType}</span>
              <span className="font-mono font-extrabold text-foreground">{selectedEndpointObj.ai2a.confidence}% Confidence</span>
            </div>
          </div>

          <div className="bg-muted/40 border border-border p-2.5 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
              <span className="text-indigo-600 dark:text-cyan-400 font-bold">AI2B HTTP API Web Parser</span>
              <span className="text-blue-400">{selectedEndpointObj.ai2b.webAttack !== "None" ? "PROBE SEEN" : "CLEAR"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">API Web payload probe: {selectedEndpointObj.ai2b.webAttack}</span>
              <span className="font-mono font-extrabold text-foreground">{selectedEndpointObj.ai2b.confidence}% Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* SURICATA RULE EVIDENCE */}
      <div className="space-y-2 border-b border-border pb-3">
        <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5 font-black">Suricata IDS Evidence</h3>
        {selectedEndpointObj.alertCount > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded text-[9.5px] space-y-1">
            <div className="flex justify-between font-black">
              <span>SIGNATURE TRIGGERED</span>
              <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded uppercase font-bold">{selectedEndpointObj.suricata.severity}</span>
            </div>
            <p className="font-extrabold text-foreground dark:text-amber-400 italic">"{selectedEndpointObj.suricata.signature}"</p>
            <p className="text-slate-400 text-[8.5px] uppercase font-bold">Category: {selectedEndpointObj.suricata.category}</p>
          </div>
        ) : (
          <p className="text-[9.5px] text-slate-400 font-mono">No active Suricata signatures compiled for this target machine assets.</p>
        )}
      </div>

      {/* FUSION CORE DECISION AND MITRE MAP */}
      <div className="space-y-3 bg-secondary/40 pb-3 pt-2.5 px-3 rounded-lg border border-border">
        <h3 className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
          <GitFork size={11} /> Fusion Layer Decision
        </h3>
        {selectedEndpointObj.riskScore > 40 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-black">
              <span className="text-red-500 uppercase">{selectedEndpointObj.fusion.finalAttackType}</span>
              <span className="text-slate-400">{selectedEndpointObj.fusion.riskScore}% Fusion Score</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">MITRE ATT&CK Mitigation Action Match:</span>
              <p className="text-[10px] font-mono font-extrabold text-foreground dark:text-emerald-400 uppercase">{selectedEndpointObj.fusion.mitreMapping}</p>
            </div>
          </div>
        ) : (
          <p className="text-[9.5px] text-slate-400 font-mono">System is behaving normally under fusion audit checks.</p>
        )}
      </div>
    </div>
  );
};
