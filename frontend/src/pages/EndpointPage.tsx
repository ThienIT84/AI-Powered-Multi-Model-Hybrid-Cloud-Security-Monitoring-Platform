import { useMemo, useState } from "react";
import { Cloud, Laptop, Search, Server, ShieldAlert, X } from "lucide-react";
import { Alert, Severity } from "../types";
import {
  deriveObservedAssets,
  displayValue,
  EMPTY_VALUE,
  formatTimestamp,
  ObservedAsset,
  severityClass,
  sortAlertsNewest,
} from "../data/derive";

interface EndpointPageProps {
  alerts: Alert[];
}

function Metric({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-[8px] uppercase text-muted-foreground">{description}</p>
    </div>
  );
}

function formatRisk(value: number | null): string {
  return value === null ? EMPTY_VALUE : value.toFixed(0);
}

function alertTouchesAsset(alert: Alert, asset: ObservedAsset): boolean {
  if (asset.id.startsWith("ip:")) {
    return alert.sourceIp === asset.address || alert.destinationIp === asset.address || alert.destIp === asset.address;
  }
  return alert.resourceId === asset.address;
}

export function EndpointPage({ alerts }: EndpointPageProps) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"ALL" | Severity>("ALL");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const assets = useMemo(() => deriveObservedAssets(alerts), [alerts]);
  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (severity !== "ALL" && asset.severity !== severity) return false;
      if (!normalized) return true;
      return [
        asset.label,
        asset.kind,
        ...asset.observedAs,
        ...asset.attackTypes,
        ...asset.protocols,
        ...asset.providers,
        ...asset.regions,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [assets, query, severity]);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? null;
  const selectedAlerts = useMemo(
    () => selectedAsset ? sortAlertsNewest(alerts.filter((alert) => alertTouchesAsset(alert, selectedAsset))) : [],
    [alerts, selectedAsset],
  );

  const sourceAssets = assets.filter((asset) => asset.observedAs.includes("Source")).length;
  const destinationAssets = assets.filter((asset) => asset.observedAs.includes("Destination")).length;
  const publicAddresses = assets.filter((asset) => asset.internetFacing === true).length;
  const cloudResources = assets.filter((asset) => asset.observedAs.includes("Resource")).length;
  const criticalAssets = assets.filter((asset) => asset.severity === Severity.CRITICAL).length;

  return (
    <div className="space-y-6 pb-16 font-mono text-foreground" id="endpoint-page">
      <header className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <Laptop size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.24em]">Observed asset inventory</span>
          </div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight">Endpoint & Asset Evidence</h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Hosts and resources derived from backend alert endpoints only
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-[9px] uppercase text-muted-foreground">
          {assets.length > 0 ? `${assets.length} observed assets` : "No observed assets"}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Observed assets" value={assets.length.toLocaleString()} description="Unique backend identifiers" />
        <Metric label="Seen as source" value={sourceAssets.toLocaleString()} description="Alert source addresses" />
        <Metric label="Seen as target" value={destinationAssets.toLocaleString()} description="Alert destination addresses" />
        <Metric label="Public IPv4" value={publicAddresses.toLocaleString()} description="Derived from observed IP ranges" />
        <Metric label="Critical assets" value={criticalAssets.toLocaleString()} description={`${cloudResources} linked cloud resources`} />
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-cyan-500" />
            <h2 className="text-[11px] font-black uppercase tracking-widest">Asset catalog</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
              <Search size={12} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search address, type, attack, region..."
                className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted-foreground sm:w-72"
              />
            </label>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as "ALL" | Severity)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-[9px] font-black uppercase outline-none"
            >
              <option value="ALL">All severities</option>
              {Object.values(Severity).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="mt-4 flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 px-6 text-center">
            <Server size={24} className="text-muted-foreground" />
            <p className="mt-3 text-[11px] font-black uppercase">No endpoint data available</p>
            <p className="mt-1 max-w-lg text-[9px] text-muted-foreground">
              Source IPs, destination IPs, and cloud resource IDs will appear here when the backend returns alerts containing them.
            </p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center text-[10px] uppercase text-muted-foreground">
            No assets match the active filters.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-250 text-left text-[9px]">
              <thead className="bg-muted/30 text-[8px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Asset</th>
                  <th className="px-3 py-3">Observed role</th>
                  <th className="px-3 py-3">Alerts</th>
                  <th className="px-3 py-3">Highest severity</th>
                  <th className="px-3 py-3">Risk</th>
                  <th className="px-3 py-3">Protocols</th>
                  <th className="px-3 py-3">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/20"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {asset.observedAs.includes("Resource") ? <Cloud size={12} className="text-blue-500" /> : <Server size={12} className="text-cyan-500" />}
                        <div>
                          <span className="block font-black">{asset.label}</span>
                          <span className="text-muted-foreground">{asset.kind}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{asset.observedAs.join(" · ") || "Unknown"}</td>
                    <td className="px-3 py-3 font-black">{asset.alertCount}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded border px-2 py-0.5 text-[7px] font-black uppercase ${severityClass(asset.severity)}`}>
                        {asset.severity ?? "Unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block font-black">Max: {formatRisk(asset.maxRiskScore)}</span>
                      <span className="text-muted-foreground">Avg: {formatRisk(asset.averageRiskScore)}</span>
                    </td>
                    <td className="px-3 py-3">{asset.protocols.join(", ") || "Unknown"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatTimestamp(asset.lastSeen ?? undefined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedAsset && (
        <AssetDrawer asset={selectedAsset} alerts={selectedAlerts} onClose={() => setSelectedAssetId(null)} />
      )}
    </div>
  );
}

function AssetDrawer({ asset, alerts, onClose }: { asset: ObservedAsset; alerts: Alert[]; onClose: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-border bg-background p-5 shadow-2xl">
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <ShieldAlert size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">Observed asset</span>
          </div>
          <h2 className="mt-2 break-all text-base font-black">{asset.label}</h2>
          <p className="mt-1 text-[9px] text-muted-foreground">{asset.kind}</p>
        </div>
        <button onClick={onClose} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close asset details">
          <X size={14} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-[9px]">
        {[
          ["Observed as", asset.observedAs.join(" · ") || "Unknown"],
          ["Highest severity", asset.severity ?? "Unknown"],
          ["Maximum risk", formatRisk(asset.maxRiskScore)],
          ["Average risk", formatRisk(asset.averageRiskScore)],
          ["Internet-facing", asset.internetFacing === null ? "Unknown" : asset.internetFacing ? "Yes (public IPv4)" : "No (private IPv4)"],
          ["Last seen", formatTimestamp(asset.lastSeen ?? undefined)],
          ["Protocols", asset.protocols.join(", ") || "Unknown"],
          ["Providers / regions", [...asset.providers, ...asset.regions].join(" · ") || "Unknown"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-1 break-words font-bold">{displayValue(value, "Unknown")}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border p-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Observed attack types</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {asset.attackTypes.length > 0 ? asset.attackTypes.map((attack) => (
            <span key={attack} className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-500">{attack}</span>
          )) : <span className="text-[9px] text-muted-foreground">Unknown</span>}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border p-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Related backend alerts</h3>
        {alerts.length === 0 ? (
          <p className="mt-3 text-[9px] text-muted-foreground">No related alert records.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-border/60 bg-muted/10 p-3 text-[9px]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{displayValue(alert.attackType, "Unknown")}</p>
                    <p className="mt-1 text-muted-foreground">{alert.id} · {formatTimestamp(alert.timestamp)}</p>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(alert.severity)}`}>{alert.severity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default EndpointPage;
