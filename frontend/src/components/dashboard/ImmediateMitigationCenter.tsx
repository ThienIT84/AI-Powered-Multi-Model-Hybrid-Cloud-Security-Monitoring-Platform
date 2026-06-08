import React, { useState } from "react";
import { ShieldAlert, Radio, Eye, Network, FileClock, ShieldX, CheckCircle, Database } from "lucide-react";
import { cn } from "../../lib/utils";

export function ImmediateMitigationCenter() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Response mitigation controller online.",
    "[STATUS] Waiting for threat validation triggers..."
  ]);

  const executeAction = (actionName: string, desc: string) => {
    setActiveAction(actionName);
    setLogs(prev => [
      `[EXEC] Initialized ${actionName.toUpperCase()}: ${desc}`,
      `[OK] Action propagated across security fabric successfully.`,
      ...prev
    ]);
    setTimeout(() => {
      setActiveAction(null);
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-70 select-none font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          SECURITY OPERATIONS IMMEDIATE MITIGATION CENTER
        </h3>
        <span className="text-[7.5px] bg-rose-500/10 text-rose-500 border border-rose-500/15 px-2.5 py-0.5 rounded uppercase font-black">
          ENGAGED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* Buttons Column */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-2 py-1 select-none font-bold text-[9px] leading-none">
          
          <button
            onClick={() => executeAction("View Alerts", "Polling active alert feeds... Transitioning to alerts workspace.")}
            disabled={activeAction !== null}
            className="flex-1 bg-secondary/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-border/80 px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Eye size={12} className="text-cyan-400" />
            <span>View Alerts Workspace</span>
          </button>

          <button
            onClick={() => executeAction("Investigate Campaign", "Correlating multi-stage MITRE indicators for campaigns...")}
            disabled={activeAction !== null}
            className="flex-1 bg-secondary/40 hover:bg-purple-500/10 hover:border-purple-500/30 border border-border/80 px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Network size={12} className="text-purple-400" />
            <span>Investigate Campaigns</span>
          </button>

          <button
            onClick={() => executeAction("Generate AI Summary", "Calling server side Gemini API summarizing the incidents...")}
            disabled={activeAction !== null}
            className="flex-1 bg-secondary/40 hover:bg-[#06b6d4]/10 hover:border-[#06b6d4]/30 border border-border/80 px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <Database size={12} className="text-cyan-400 animate-bounce" />
            <span>Generate AI Incident Summary</span>
          </button>

          <button
            onClick={() => executeAction("Block Source IP", "Propagating firewall rules to drop incoming packets from threat actors...")}
            disabled={activeAction !== null}
            className="flex-1 bg-red-955/20 hover:bg-rose-500/10 hover:border-rose-500/30 border border-border/80 px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <ShieldX size={12} className="text-rose-500" />
            <span className="text-rose-500">Block Malicious Source IPs</span>
          </button>

          <button
            onClick={() => executeAction("Export Incident", "Packaging incident timeline, metrics and ONNX decisions...")}
            disabled={activeAction !== null}
            className="flex-1 bg-secondary/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-border/80 px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            <FileClock size={12} className="text-emerald-500" />
            <span>Export Incident Log Audit</span>
          </button>

        </div>

        {/* Live Feedback Feed / Console logs box */}
        <div className="lg:col-span-6 bg-secondary/25 border border-border/40 p-3 rounded-lg flex flex-col justify-between font-mono text-[8px] leading-relaxed">
          <div className="flex items-center justify-between border-b border-border/10 pb-1.5 mb-1.5 opacity-70">
             <span>RAPID RESPONSE LOG BUFFER</span>
             <span className="animate-pulse">● FEED ACTIVE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5 max-h-35 text-muted-foreground/80 font-mono">
             {logs.map((log, idx) => (
                <div key={idx} className={cn(
                   "whitespace-pre-wrap font-mono",
                   log.startsWith("[EXEC]") ? "text-cyan-400 font-extrabold" :
                   log.startsWith("[OK]") ? "text-emerald-500 font-extrabold" : ""
                )}>
                   {log}
                </div>
             ))}
          </div>
          
          <div className="border-t border-border/10 pt-1.5 mt-2 flex justify-between items-center text-[7px] font-black text-muted-foreground/50 uppercase leading-none">
             <span>FABRIC SYNAPSE SYSTEM OK</span>
             <span>RULE_ID: 104-FAST</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ImmediateMitigationCenter;
