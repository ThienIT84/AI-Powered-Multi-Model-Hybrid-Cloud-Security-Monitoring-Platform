import React from "react";
import { ShieldAlert, X, Terminal, ArrowRight, Activity, Cpu } from "lucide-react";
import { cn } from "../../lib/utils";
import { IncidentFCAJ } from "./endpointFCAJData";

interface EndpointIncidentEvidenceModalProps {
  selectedIncident: IncidentFCAJ | null;
  isModalOpen: boolean;
  onClose: () => void;
}

export const EndpointIncidentEvidenceModal: React.FC<EndpointIncidentEvidenceModalProps> = ({
  selectedIncident,
  isModalOpen,
  onClose,
}) => {
  if (!selectedIncident || !isModalOpen) return null;

  return (
    <div 
      id="endpoint-incident-evidence-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
    >
      <div 
        id="endpoint-incident-evidence-modal-content"
        className="bg-card border border-border rounded-2xl w-full max-w-4xl p-6 font-mono text-[10px] space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">FORENSIC TELEMETRY EVIDENCE DOSSIER</span>
              <span className="text-[8px] text-muted-foreground uppercase font-semibold">Consensus ID: {selectedIncident.id} - Registered {selectedIncident.timestamp}</span>
            </div>
          </div>
          <button 
            id="close-endpoint-modal-btn"
            onClick={onClose}
            className="p-1 px-3 hover:bg-muted border border-border rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer text-foreground flex items-center gap-1"
          >
            <X size={10} /> Close Dialog
          </button>
        </div>

        {/* 11. FORENSIC INVESTIGATION LOGS DUAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1 & 2: Zeek Conn & Http Logs */}
          <div className="md:col-span-2 space-y-4">
            {/* Zeek Log Section */}
            <div className="space-y-2">
              <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest pl-2 border-l-2 border-indigo-405 flex items-center gap-1.5">
                <Terminal size={11} /> Zeek Network Log Evidence (conn.log & http.log)
              </h3>
              
              {selectedIncident.zeekLogs?.conn ? (
                <div className="bg-secondary/40 border border-border p-3.5 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                    <div><span className="text-slate-400">Duration:</span> <p className="font-extrabold text-foreground">{selectedIncident.zeekLogs.conn.duration.toFixed(3)}s</p></div>
                    <div><span className="text-slate-400">Total Payload:</span> <p className="font-extrabold text-indigo-500">{(selectedIncident.zeekLogs.conn.bytes / 1024).toFixed(2)} KB</p></div>
                    <div><span className="text-slate-400">Packet Volume:</span> <p className="font-extrabold text-amber-500">{selectedIncident.zeekLogs.conn.packets} Pkts</p></div>
                    <div><span className="text-slate-400">State Code:</span> <p className="font-extrabold text-emerald-500">SF (Established)</p></div>
                  </div>

                  <div className="border-t border-border/60 pt-2.5 space-y-1 bg-muted/30 p-2 rounded">
                    <p className="text-[8px] text-slate-400 uppercase font-black">Transport Connection Socket:</p>
                    <div className="flex items-center gap-1.5 font-bold text-[10.5px]">
                      <span className="text-red-400">{selectedIncident.zeekLogs.conn.src_ip}:{selectedIncident.zeekLogs.conn.src_port}</span>
                      <ArrowRight size={10} className="text-slate-500" />
                      <span className="text-blue-400">{selectedIncident.zeekLogs.conn.dest_ip}:{selectedIncident.zeekLogs.conn.dest_port}</span>
                      <span className="text-[8px] bg-secondary border border-border px-1.5 py-0.2 rounded uppercase font-bold text-foreground">
                        {selectedIncident.zeekLogs.conn.proto} - {selectedIncident.zeekLogs.conn.service}
                      </span>
                    </div>
                  </div>

                  {selectedIncident.zeekLogs?.http && (
                    <div className="border-t border-border/60 pt-2.5 space-y-1.5">
                      <p className="text-[8px] text-cyan-600 dark:text-cyan-400 uppercase font-mono font-black">Zeek http.log Request Payload Headers:</p>
                      <div className="p-2 border border-cyan-505/20 bg-cyan-500/10 rounded-lg text-[9.5px]">
                        <p><span className="text-slate-450 font-bold">URI:</span> <span className="text-cyan-600 dark:text-cyan-300 font-extrabold">{selectedIncident.zeekLogs.http.method} {selectedIncident.zeekLogs.http.uri}</span></p>
                        <p className="truncate"><span className="text-slate-450 font-bold">User-Agent:</span> <span className="text-slate-300 italic">{selectedIncident.zeekLogs.http.user_agent}</span></p>
                        <p><span className="text-slate-450 font-bold">Status Code:</span> <span className="font-bold text-emerald-500">{selectedIncident.zeekLogs.http.status_code} Success</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic">No packet analyzer records compiled.</p>
              )}
            </div>

            {/* Suricata Alert */}
            <div className="space-y-2">
              <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest pl-2 border-l-2 border-indigo-405 flex items-center gap-1.5">
                <Activity size={11} className="text-red-500 animate-pulse" /> Suricata IDS Compiled Signature Alerts
              </h3>
              {selectedIncident.suricataAlert ? (
                <div className="bg-red-500/10 border border-red-505/20 p-3 rounded-lg space-y-1 leading-snug">
                  <div className="flex justify-between items-center bg-red-950/40 p-1 rounded">
                    <span className="text-red-500 font-black">SIGNATURE ALIGN TRIGGERED</span>
                    <span className="px-1.5 py-0.2 bg-red-505/20 text-red-500 font-black tracking-widest text-[8.5px] uppercase rounded border border-red-500/30">
                      {selectedIncident.suricataAlert.severity}
                    </span>
                  </div>
                  <p className="font-bold text-foreground italic text-[11px] leading-tight pt-1">
                    "{selectedIncident.suricataAlert.signature}"
                  </p>
                  <p className="text-slate-400 text-[8.5px] uppercase font-black">CATEGORY: {selectedIncident.suricataAlert.category}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No matching Suricata network rules seen.</p>
              )}
            </div>
          </div>

          {/* Col 3: Fusion Pipeline and Mitre mapping */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest pl-2 border-l-2 border-red-550 flex items-center gap-1.5">
                <Cpu size={11} className="text-red-503" /> AI Fusion Consensus Pipeline
              </h3>
              <div className="bg-secondary/40 border border-border p-3 rounded-lg space-y-3 font-mono text-[9.5px]">
                <div>
                  <span className="text-slate-400 text-[8px] uppercase tracking-wide block mb-0.5">Affected Target Machine:</span>
                  <div className="p-1 px-1.5 bg-background border border-border text-foreground rounded font-bold uppercase truncate">
                    {selectedIncident.hostname}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[8px] uppercase tracking-wide block mb-0.5">Endpoint Routing IP Socket:</span>
                  <div className="p-1 px-1.5 bg-background border border-border text-foreground rounded font-bold uppercase truncate">
                    {selectedIncident.ip}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[8px] uppercase tracking-wide block mb-0.5">Fusion Risk Severity:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-black uppercase tracking-widest px-1.5 py-0.2 rounded border",
                      selectedIncident.severity === "Critical" ? "border-red-500/35 bg-red-500/10 text-red-500 animate-pulse" : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    )}>
                      {selectedIncident.severity}
                    </span>
                    <span className="font-black text-rose-500 text-[10px]">{selectedIncident.riskScore}% Factor</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-slate-450 block text-[8px] uppercase font-black tracking-wider text-indigo-650 dark:text-cyan-404">consensus matrix match:</span>
                  <p className="text-foreground text-[10px] uppercase font-extrabold leading-tight">{selectedIncident.aiSource}</p>
                </div>
              </div>
            </div>

            {/* MITRE Mapping block */}
            <div className="space-y-2 bg-secondary/50 border border-border p-3.5 rounded-xl">
              <p className="text-[8.5px] uppercase font-black text-red-500 tracking-wider flex items-center gap-">
                MITRE ATT&CK Matrix Mitigation
              </p>
              {selectedIncident.riskScore > 40 ? (
                <div className="space-y-1">
                  <div className="p-1 px-1.5 bg-red-500/10 text-red-500 border border-red-500/15 rounded text-[10.5px] font-black tracking-normal uppercase">
                    T1190 - Web Application exploit mitigation triggered
                  </div>
                  <p className="text-slate-400 leading-snug">
                    VPC routing boundaries drop incoming HTTP payloads targeting Drupal RPC parameters. Access rule drops applied.
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">Score below severe threshold triggers. System behaviour logged passively.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
