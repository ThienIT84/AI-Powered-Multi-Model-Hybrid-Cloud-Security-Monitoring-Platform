import { useMemo, useState } from "react";
import { Cloud, Download, Search } from "lucide-react";
import { Alert, Severity } from "../types";
import { BackendEmptyState } from "../components/common/BackendEmptyState";

interface CloudPageProps {
  alerts: Alert[];
}

function downloadJson(alerts: Alert[]) {
  const blob = new Blob([JSON.stringify(alerts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `cloud-alerts-${new Date().toISOString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CloudPage({ alerts }: CloudPageProps) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");

  const cloudAlerts = useMemo(
    () => alerts.filter((alert) => Boolean(alert.cloudProvider || alert.resourceId || alert.resourceType)),
    [alerts]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return cloudAlerts.filter((alert) => {
      if (severity !== "ALL" && alert.severity !== severity) return false;
      if (!normalizedQuery) return true;
      return [
        alert.id,
        alert.attackType,
        alert.cloudProvider,
        alert.region,
        alert.resourceId,
        alert.resourceType,
        alert.sourceIp,
        alert.destinationIp,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [cloudAlerts, query, severity]);

  const resources = new Set(cloudAlerts.map((alert) => alert.resourceId).filter(Boolean));
  const critical = cloudAlerts.filter((alert) => alert.severity === Severity.CRITICAL).length;
  const providers = new Set(cloudAlerts.map((alert) => alert.cloudProvider).filter(Boolean));

  return (
    <div className="space-y-6 pb-12 text-foreground">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500"><Cloud size={20} /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Cloud security telemetry</h1>
            <p className="mt-1 text-xs text-muted-foreground">Only cloud metadata supplied by the backend alert contract is shown.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <Search size={13} className="text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search backend records" className="w-48 bg-transparent text-xs outline-none" />
          </label>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            <option value="ALL">All severities</option>
            {Object.values(Severity).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" disabled={cloudAlerts.length === 0} onClick={() => downloadJson(cloudAlerts)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-[10px] font-black uppercase disabled:opacity-40">
            <Download size={13} /> Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Cloud alerts", cloudAlerts.length],
          ["Observed resources", resources.size],
          ["Critical alerts", critical],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {cloudAlerts.length === 0 ? (
        <BackendEmptyState
          title="No cloud telemetry from backend"
          description="The current backend alert contract has not supplied cloud_provider, region, resource_id, or resource_type. No cloud inventory is fabricated on the client."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {providers.size} provider(s) · {filtered.length} matching record(s)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-xs">
              <thead className="bg-muted/40 text-[9px] uppercase tracking-widest text-muted-foreground">
                <tr><th className="p-3">Time</th><th className="p-3">Provider</th><th className="p-3">Resource</th><th className="p-3">Region</th><th className="p-3">Threat</th><th className="p-3">Severity</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((alert) => (
                  <tr key={alert.id}>
                    <td className="p-3 font-mono text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold">{alert.cloudProvider ?? "Unknown"}</td>
                    <td className="p-3"><div className="font-bold">{alert.resourceId ?? "Unknown"}</div><div className="text-[10px] text-muted-foreground">{alert.resourceType ?? "Unknown type"}</div></td>
                    <td className="p-3">{alert.region ?? "Unknown"}</td>
                    <td className="p-3">{alert.attackType}</td>
                    <td className="p-3 font-bold">{alert.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CloudPage;
