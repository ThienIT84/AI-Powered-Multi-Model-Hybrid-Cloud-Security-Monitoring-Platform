import React from "react";
import { Shield, Check, FileCode, Radio } from "lucide-react";
import { Integration } from "./types";
import { cn } from "../../lib/utils";

interface TelemetrySourcesPanelProps {
  integrations: Integration[];
  onSelect: (id: string) => void;
}

export function TelemetrySourcesPanel({ integrations, onSelect }: TelemetrySourcesPanelProps) {
  // Find Zeek, Suricata, and Filebeat
  const zeek = integrations.find(i => i.id === "zeek");
  const suricata = integrations.find(i => i.id === "suricata");
  const filebeat = integrations.find(i => i.id === "filebeat");

  const sources = [
    {
      id: "zeek",
      name: "Zeek Network Intrusion Sensor",
      logData: zeek || { status: "Connected", lastSync: "Just Now", health: "Healthy" },
      dataTypes: ["conn.log", "http.log", "dns.log"],
      icon: Radio,
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
    },
    {
      id: "suricata",
      name: "Suricata Signature IDS",
      logData: suricata || { status: "Connected", lastSync: "Just Now", health: "Healthy" },
      dataTypes: ["eve.json", "alerts"],
      icon: Shield,
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    },
    {
      id: "filebeat",
      name: "Filebeat Log Forwarder",
      logData: filebeat || { status: "Connected", lastSync: "10s ago", health: "Healthy" },
      dataTypes: ["forwarding active"],
      icon: FileCode,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-95">
      <div className="border-b border-border/40 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-indigo-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Security Telemetry Sources
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Core Security Sensors Monitoring Perimeter Boundaries
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 my-3 space-y-3">
        {sources.map((src) => {
          const Icon = src.icon;
          const isWarning = src.logData.status === "Warning" || src.logData.health === "Warning";
          const isCritical = src.logData.status === "Disconnected" || src.logData.health === "Critical";

          return (
            <div
              key={src.id}
              onClick={() => onSelect(src.id)}
              className="p-3 bg-muted/20 hover:bg-muted/45 border border-border/60 rounded-lg transition-colors cursor-pointer group flex flex-col justify-between h-22.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-background border border-border rounded text-muted-foreground group-hover:text-cyan-500 group-hover:border-cyan-500/30 transition-colors">
                    <Icon size={11} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-foreground group-hover:text-cyan-500 transition-colors block">
                      {src.name}
                    </span>
                    <span className="text-[7px] font-mono text-muted-foreground uppercase">
                      Last Sync: {src.logData.lastSync}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn(
                    "text-[7.5px] font-black px-1.5 py-0.5 rounded border tracking-wider",
                    isCritical
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : isWarning
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  )}>
                    {src.logData.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[7px] font-mono text-muted-foreground uppercase select-none">
                  INTEGRATED LOG DATA TYPES:
                </span>
                {src.dataTypes.map((dt) => (
                  <span
                    key={dt}
                    className="text-[7px] font-mono font-bold tracking-tight bg-background border border-border/80 px-1.5 py-0.5 rounded text-foreground/80"
                  >
                    {dt}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5 text-center leading-none select-none">
        Secure continuous log ingestion pipeline active
      </div>
    </div>
  );
}
