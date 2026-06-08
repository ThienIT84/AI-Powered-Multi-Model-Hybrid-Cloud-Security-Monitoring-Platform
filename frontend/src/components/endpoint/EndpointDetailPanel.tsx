import React from "react";
import { EndpointFCAJItem, ZeekConnLog } from "./endpointFCAJData";
import { 
  Server, 
  GitFork, 
  History, 
  AlertTriangle, 
  ShieldAlert, 
  FileCode, 
  Ban, 
  ZapOff,
  X
} from "lucide-react";
import { cn } from "../../lib/utils";

interface EndpointDetailPanelProps {
  endpoint: EndpointFCAJItem | null;
  onIsolate: (ep: EndpointFCAJItem) => void;
  onBlockIp: (ep: EndpointFCAJItem) => void;
  onClose?: () => void;
}

export const EndpointDetailPanel: React.FC<EndpointDetailPanelProps> = ({ 
  endpoint,
  onIsolate,
  onBlockIp,
  onClose
}) => {
  if (!endpoint) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-125 text-muted-foreground select-none relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping duration-3000" />
          <div className="w-12 h-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground">
            <ShieldAlert size={20} className="text-muted-foreground" />
          </div>
        </div>
        <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest mb-1.5 animate-pulse">
          AWAITING SELECT ROW
        </h4>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider max-w-52.5 leading-relaxed">
          Select any system row in the left-side index to compile forensic logs, raw packet digests, and mitigation profiles.
        </p>
      </div>
    );
  }

  const isOffline = endpoint.status === "Offline";

  return (
    <div id="endpoint-detail-panel" className="bg-card border border-border rounded-xl flex flex-col justify-between overflow-hidden select-none shadow-sm relative h-fit max-h-[85vh] font-mono text-[10px]">
      
      {/* 1. Header Area Info */}
      <div className="p-4 border-b border-border bg-muted/10 space-y-3">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground">{endpoint.hostname}</span>
              <span className="text-[8.5px] text-muted-foreground">{endpoint.id} | IP: {endpoint.ip}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn(
              "py-0.5 px-2 rounded-full text-[8px] font-black uppercase tracking-wider border shrink-0",
              endpoint.status === "Healthy" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
              endpoint.status === "Warning" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
              endpoint.status === "Critical" && "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
              endpoint.status === "Offline" && "bg-slate-500/10 text-slate-500 border-slate-500/20"
            )}>
              {endpoint.status}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Dismiss panel"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Basic Asset info list */}
        <div className="grid grid-cols-2 gap-2 text-[9px] bg-secondary/30 p-2.5 rounded-lg border border-border/60">
          <div>
            <span className="text-slate-400 block pb-0.5">MAC ADDRESS:</span>
            <span className="font-extrabold text-foreground">{endpoint.mac}</span>
          </div>
          <div>
            <span className="text-slate-400 block pb-0.5">OPERATING SYSTEM:</span>
            <span className="font-extrabold text-foreground">{endpoint.os}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-border/40">
            <span className="text-slate-400 block pb-0.5">ROLE ASSIGN:</span>
            <span className="font-black text-foreground dark:text-indigo-404">{endpoint.role}</span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Evidence Panels */}
      <div className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Zeek Evidence */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FileCode size={13} className="text-indigo-505 dark:text-cyan-404" />
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
              Zeek Network Evidence (conn.log)
            </span>
          </div>
          
          {isOffline ? (
            <div className="bg-secondary/20 p-2.5 border border-border border-dashed text-center text-muted-foreground uppercase text-[8.5px]">
              Terminal offline &bull; Telemetry socket detached
            </div>
          ) : endpoint.zeekConnLogs.length === 0 ? (
            <span className="text-slate-500 text-center block py-2">NO RECENT PACKETS CAPTURED</span>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[8.5px] border-collapse font-mono bg-card">
                <thead>
                  <tr className="bg-muted/40 uppercase text-slate-400 border-b border-border/60 font-black">
                    <th className="p-1.5">Proto</th>
                    <th className="p-1.5">Service</th>
                    <th className="p-1.5">Dst IP</th>
                    <th className="p-1.5">Bytes</th>
                    <th className="p-1.5 text-right">Packets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground uppercase">
                  {endpoint.zeekConnLogs.slice(0, 4).map((log: ZeekConnLog) => (
                    <tr key={log.id} className="hover:bg-secondary/40 font-mono">
                      <td className="p-1.5 text-foreground font-black">{log.proto}</td>
                      <td className="p-1.5">
                        <span className={cn(
                          "px-1 py-0.5 rounded text-[7.5px]",
                          log.service === "HTTPS" && "text-emerald-500 bg-emerald-500/10",
                          log.service === "HTTP" && "text-indigo-500 bg-indigo-500/10",
                          log.service === "DNS" && "text-amber-500 bg-amber-500/10",
                          log.service === "SSH" && "text-red-500 bg-red-500/10"
                        )}>
                          {log.service}
                        </span>
                      </td>
                      <td className="p-1.5 select-all truncate max-w-20" title={log.dest_ip}>{log.dest_ip}</td>
                      <td className="p-1.5 font-bold text-foreground">{(log.bytes / 1024).toFixed(1)}K</td>
                      <td className="p-1.5 text-right font-black">{log.packets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-2 py-1 bg-muted/65 text-[7.5px] border-t border-border/60 flex justify-between font-bold text-slate-400">
                <span>ACTIVE LISTENERS: TCP / UDP</span>
                <span>SHA-256 CHECK: PASSED</span>
              </div>
            </div>
          )}
        </div>

        {/* Suricata Alert signatures */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-500" />
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
              Suricata Signature Alerts (IDS-Evidence)
            </span>
          </div>

          {endpoint.alertCount > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[9px] space-y-1.5">
              <div className="flex justify-between font-black uppercase text-amber-500">
                <span>Alert Signature Triggered</span>
                <span className="text-[7.5px] bg-amber-500/20 px-1.5 rounded font-black tracking-widest">{endpoint.suricata.severity}</span>
              </div>
              <p className="font-extrabold text-foreground dark:text-amber-400 italic">
                "{endpoint.suricata.signature}"
              </p>
              <div className="text-[8px] text-slate-400 font-extrabold uppercase">
                Category: {endpoint.suricata.category}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/20 p-2.5 border border-border/60 border-dashed text-center text-muted-foreground uppercase text-[8.5px]">
              No active suricata matches registered
            </div>
          )}
        </div>

        {/* Fusion decision */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <GitFork size={13} className="text-red-500" />
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
              Fusion Layer Decision Engine
            </span>
          </div>

          {endpoint.riskScore >= 40 ? (
            <div className="bg-secondary/40 border border-border p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-red-500 uppercase">{endpoint.fusion.finalAttackType}</span>
                <span className="text-foreground">{endpoint.fusion.riskScore}% Threat Risk</span>
              </div>
              <div className="pt-1.5 border-t border-border/40 space-y-1">
                <span className="text-slate-400 block text-[7.5px] uppercase tracking-wider font-extrabold pb-0.5">MITRE Technique Match:</span>
                <p className="text-[9.5px] font-mono font-black text-emerald-500 uppercase leading-snug">
                  {endpoint.fusion.mitreMapping}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/20 p-2.5 border border-border/60 border-dashed text-center text-muted-foreground uppercase text-[8.5px]">
              Normal system state &bull; Fusion consensus clean
            </div>
          )}
        </div>

        {/* Host Investigative Timeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <History size={13} className="text-indigo-505 dark:text-cyan-404" />
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
              Host Forensic Investigative Timeline
            </span>
          </div>

          <div className="pl-2.5 border-l border-border relative space-y-4 py-1" id="forensic-timeline-container">
            {endpoint.timeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Visual marker dot */}
                <div className={cn(
                  "absolute left-[-14.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card",
                  item.severity === "Critical" && "bg-red-500",
                  item.severity === "High" && "bg-orange-500",
                  item.severity === "Medium" && "bg-amber-500",
                  item.severity === "Low" && "bg-indigo-550 dark:bg-cyan-405"
                )} />

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-black font-mono text-slate-400 uppercase">
                    <span>{item.time}</span>
                    <span className={cn(
                      "font-black tracking-widest",
                      item.severity === "Critical" && "text-red-500",
                      item.severity === "High" && "text-orange-500",
                      item.severity === "Medium" && "text-amber-500",
                      item.severity === "Low" && "text-indigo-650 dark:text-cyan-400"
                    )}>{item.severity} severity</span>
                  </div>
                  <p className="text-[9.5px] font-semibold text-foreground uppercase tracking-wide leading-relaxed pr-1">
                    {item.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Action Buttons & Mitigation Controllers */}
      <div className="p-3 border-t border-border bg-muted/20 flex gap-2">
        <button
          onClick={() => onBlockIp(endpoint)}
          disabled={isOffline}
          className={cn(
            "flex-1 p-2 border rounded-lg text-[8.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-colors border-border bg-card",
            isOffline ? "opacity-35 cursor-not-allowed text-muted-foreground" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20"
          )}
          title="Dropping dynamic router routing bindings"
        >
          <Ban size={11} /> Drop Router IP
        </button>

        <button
          onClick={() => onIsolate(endpoint)}
          disabled={isOffline}
          className={cn(
            "flex-1 p-2 border rounded-lg text-[8.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-all",
            isOffline 
              ? "opacity-35 cursor-not-allowed border-border bg-card text-muted-foreground" 
              : endpoint.riskScore >= 75
              ? "bg-red-500 hover:bg-red-650 text-white border-red-650 font-black"
              : "bg-indigo-600 dark:bg-cyan-600 hover:bg-indigo-500 dark:hover:bg-cyan-500 text-white border-transparent"
          )}
          title="Dispatching immediate VPC endpoint containment"
        >
          <ZapOff size={11} /> Isolate HOST VPC
        </button>
      </div>

    </div>
  );
};
