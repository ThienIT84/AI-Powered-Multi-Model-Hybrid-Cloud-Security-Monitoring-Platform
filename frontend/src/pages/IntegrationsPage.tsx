import { Activity, Boxes, Cpu, Database } from "lucide-react";
import { BackendEmptyState } from "../components/common/BackendEmptyState";
import { PlatformStatus } from "../types";

const statusClass: Record<string, string> = {
  healthy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  real: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  unavailable: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  offline: "border-red-500/25 bg-red-500/10 text-red-500",
  unknown: "border-border bg-muted/30 text-muted-foreground",
};

function Badge({ value }: { value: string }) {
  return <span className={`rounded border px-2 py-1 text-[9px] font-black uppercase ${statusClass[value.toLowerCase()] ?? statusClass.unknown}`}>{value}</span>;
}

export function IntegrationsPage({ platformStatus }: { platformStatus: PlatformStatus }) {
  const sources = platformStatus.dataSources ?? [];
  const models = platformStatus.models ?? [];

  return (
    <div className="space-y-6 pb-12 text-foreground">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500"><Boxes size={20} /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Backend integrations</h1>
            <p className="mt-1 text-xs text-muted-foreground">Runtime health reported by the backend. Missing services remain Unknown.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Socket</p><div className="mt-2"><Badge value={platformStatus.socketStatus} /></div></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Database</p><div className="mt-2"><Badge value={platformStatus.databaseStatus ?? "unknown"} /></div></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Last ingest</p><p className="mt-2 text-sm font-bold">{platformStatus.lastIngestAt ? new Date(platformStatus.lastIngestAt).toLocaleString() : "—"}</p></div>
      </div>

      {sources.length === 0 && models.length === 0 ? (
        <BackendEmptyState title="No integration inventory reported" description="The backend did not return dataSources or models. The frontend does not assume Zeek, Suricata, AWS, SQS, or database connectivity." />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"><Activity size={13} /> Data sources</div>
            <div className="divide-y divide-border">
              {sources.length === 0 ? <p className="p-5 text-xs text-muted-foreground">No data sources reported.</p> : sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="text-sm font-bold">{source.name}</p><p className="mt-1 text-[10px] text-muted-foreground">Events: {source.eventCount ?? "—"} · Last seen: {source.lastSeenAt ? new Date(source.lastSeenAt).toLocaleString() : "—"}</p>{source.message && <p className="mt-1 text-[10px] text-amber-500">{source.message}</p>}</div>
                  <Badge value={source.status} />
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"><Cpu size={13} /> AI model adapters</div>
            <div className="divide-y divide-border">
              {models.length === 0 ? <p className="p-5 text-xs text-muted-foreground">No model status reported.</p> : models.map((model) => (
                <div key={model.name} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="text-sm font-bold">{model.name}</p><p className="mt-1 text-[10px] text-muted-foreground">Source: {model.source || "unknown"} · Version: {model.modelVersion || "—"}</p>{model.message && <p className="mt-1 text-[10px] text-amber-500">{model.message}</p>}</div>
                  <Badge value={model.status || "unknown"} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {platformStatus.lastError && <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-500"><Database size={15} />{platformStatus.lastError}</div>}
    </div>
  );
}

export default IntegrationsPage;
