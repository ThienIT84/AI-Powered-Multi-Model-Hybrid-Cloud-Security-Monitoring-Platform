import React from "react";
import { Boxes } from "lucide-react";
import { SettingsStateData } from "./settingsConfig";

interface IntegrationSettingsTabProps {
  data: SettingsStateData;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function IntegrationSettingsTab({ data, onToast }: IntegrationSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-500" />
          Ingress Integrations & Data Ingestion
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Toggle connection status configurations and inspect loaded rule libraries for active collectors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-[10px]">
        {/* Zeek Log Collector */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              Zeek Network Broker
            </span>
            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              {data.zeekStatus}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">ACTIVE TELEMETRY STREAM LOGS</span>
            <div className="flex flex-wrap gap-2">
              {data.zeekLogs.map((log) => (
                <span key={log} className="text-[9px] font-semibold text-foreground bg-muted border border-border px-2 py-1 rounded">
                  {log}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Suricata rule engine */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              Suricata Intrusion Signatures
            </span>
            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              {data.suricataStatus}
            </span>
          </div>

          <div className="flex justify-between items-center bg-muted/40 p-3.5 border border-border/60 rounded-xl">
            <span className="text-muted-foreground text-[8px] uppercase font-black">LOADED SIGNATURE THREAT RULES</span>
            <span className="text-[12px] font-black text-foreground font-mono">{data.suricataRules} RULES</span>
          </div>
        </div>

        {/* Filebeat status */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              Filebeat Elastic Shipper
            </span>
            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              {data.filebeatStatus}
            </span>
          </div>

          <p className="text-[9px] text-muted-foreground uppercase leading-relaxed">
            Supplements incoming high frequency log shipments, formatting logs comfortably into matching Elasticsearch formats.
          </p>
        </div>

        {/* WebSocket Stream latency */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/10 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border/20">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              Local WebSocket Gateway
            </span>
            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              {data.websocketStatus}
            </span>
          </div>

          <div className="flex justify-between items-center bg-muted/40 p-3.5 border border-border/60 rounded-xl">
            <span className="text-muted-foreground text-[8px] uppercase font-black">BROKER RESPONSE LATENCY</span>
            <span className="text-[12px] font-black text-cyan-400 font-mono">{data.websocketLatency} MS</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => {
            onToast("DIAGNOSING INTEGRATION CHANNELS...", "info");
            setTimeout(() => {
              onToast("ALL CHANNELS ONLINE & SYNCED!", "success");
            }, 1000);
          }}
          className="w-full py-3 bg-muted hover:bg-muted/80 text-[10px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border rounded-xl transition-all"
        >
          RE-RUN SOC DIAGNOSTICS FOR ALL INGESTEES
        </button>
      </div>
    </div>
  );
}
