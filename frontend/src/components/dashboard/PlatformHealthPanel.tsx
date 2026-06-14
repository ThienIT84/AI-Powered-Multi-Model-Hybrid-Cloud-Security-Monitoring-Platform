import React from "react";
import { Activity, ShieldCheck, HelpCircle, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { PlatformHealthStatus } from "./types/dashboard.types";

interface PlatformHealthPanelProps {
  health: PlatformHealthStatus;
}

export const PlatformHealthPanel: React.FC<PlatformHealthPanelProps> = React.memo(({ health }) => {
  const getBadgeStyle = (status: "Healthy" | "Warning" | "Offline") => {
    switch (status) {
      case "Healthy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Offline":
        return "bg-red-500/15 text-red-500 border-red-500/25";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-border";
    }
  };

  const getIcon = (status: "Healthy" | "Warning" | "Offline") => {
    switch (status) {
      case "Healthy":
        return <CheckCircle2 size={11} className="text-emerald-500" />;
      case "Warning":
        return <AlertTriangle size={11} className="text-amber-500" />;
      case "Offline":
        return <AlertCircle size={11} className="text-red-500" />;
    }
  };

  const services = [
    { id: "zeek", label: "Zeek Ingress Engine", status: health.Zeek, desc: "Network protocol parser" },
    { id: "suricata", label: "Suricata Signature IDS", status: health.Suricata, desc: "Passive alert stream" },
    { id: "fusion", label: "Neural Fusion Core", status: health.Fusion, desc: "Decisions voting layer" },
    { id: "database", label: "ScyllaDB Core SQL", status: health.Database, desc: "Unified cases database" },
    { id: "ws", label: "Node Socket Proxy Gateway", status: health.WebSocket, desc: "Frontend socket frame" },
    { id: "aws", label: "AWS Security Hub Sync", status: health.AWS, desc: "Cloud audit log channel" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="platform-health-panel">
      <div>
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
          <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Platform Engine Integration Health
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono select-none">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-secondary/15 border border-border/40 hover:border-emerald-500/10 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold text-foreground tracking-tight block truncate">
                  {svc.label}
                </span>
                <span className="text-[7.5px] text-zinc-500 block truncate" title={svc.desc}>
                  {svc.desc}
                </span>
              </div>

              {/* Status Indicator Pill */}
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border flex items-center gap-1 shrink-0 ${getBadgeStyle(svc.status)}`}>
                {getIcon(svc.status)}
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono mt-4 uppercase select-none border-t border-border/10 pt-2 flex items-center justify-between leading-none font-bold">
        <span>Framework health sync: OK</span>
        <span className="text-emerald-500">All Core Systems Live</span>
      </div>
    </div>
  );
});
