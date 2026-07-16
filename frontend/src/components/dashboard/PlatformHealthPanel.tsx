import React from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { PlatformStatus } from "../../types";

function statusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (["healthy", "connected", "completed", "real"].includes(normalized)) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (["warning", "reconnecting", "connecting", "unavailable", "not_available"].includes(normalized)) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (["offline", "error", "failed", "disconnected"].includes(normalized)) return "bg-red-500/15 text-red-500 border-red-500/25";
  return "bg-zinc-500/10 text-zinc-400 border-border";
}

export const PlatformHealthPanel: React.FC<{ platformStatus: PlatformStatus }> = React.memo(({ platformStatus }) => {
  const services = [
    { id: "websocket", label: "WebSocket", status: platformStatus.socketStatus, description: platformStatus.lastError ?? "Realtime alert channel" },
    { id: "database", label: "Database", status: platformStatus.databaseStatus ?? "unknown", description: "Backend persistence" },
    ...(platformStatus.dataSources ?? []).map((source) => ({ id: `source-${source.id}`, label: source.name, status: source.status, description: source.message ?? `Events: ${source.eventCount ?? "—"}` })),
    ...(platformStatus.models ?? []).map((model) => ({ id: `model-${model.name}`, label: model.name, status: model.status || "unknown", description: model.message ?? `${model.source || "unknown"} · ${model.modelVersion || "version unavailable"}` })),
  ];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 md:p-5" id="platform-health-panel">
      <div>
        <div className="mb-4 flex items-center gap-2 border-b border-border/20 pb-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Backend platform health</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-secondary/15 p-3">
              <div className="min-w-0"><p className="truncate text-[10px] font-black text-foreground">{service.label}</p><p className="mt-1 truncate text-[8px] text-muted-foreground" title={service.description}>{service.description}</p></div>
              <span className={`flex shrink-0 items-center gap-1 rounded border px-2 py-1 text-[8px] font-black uppercase ${statusStyle(service.status)}`}>
                {statusStyle(service.status).includes("emerald") ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{service.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-border/10 pt-2 text-[8px] font-bold uppercase text-muted-foreground">
        Last ingest: {platformStatus.lastIngestAt ? new Date(platformStatus.lastIngestAt).toLocaleString() : "not reported"}
      </div>
    </div>
  );
});
