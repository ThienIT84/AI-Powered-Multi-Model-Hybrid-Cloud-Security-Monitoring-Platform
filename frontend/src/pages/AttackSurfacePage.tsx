import { useMemo, useState } from "react";
import { Cloud, ExternalLink, Network, Search, Server, ShieldAlert, X } from "lucide-react";
import { Alert, Severity } from "../types";
import {
  deriveObservedAssets,
  displayValue,
  EMPTY_VALUE,
  formatTimestamp,
  highestSeverity,
  ObservedAsset,
  parseTimestamp,
  severityClass,
} from "../data/derive";

interface AttackSurfacePageProps {
  alerts: Alert[];
}

interface ObservedRelationship {
  id: string;
  source: string;
  destination: string;
  count: number;
  attacks: string[];
  protocols: string[];
  severity: Severity | null;
  maxRisk: number | null;
  lastSeen: string | null;
}

function deriveRelationships(alerts: Alert[]): ObservedRelationship[] {
  const groups = new Map<string, {
    source: string;
    destination: string;
    alertIds: Set<string>;
    attacks: Set<string>;
    protocols: Set<string>;
    severities: Severity[];
    risks: number[];
    lastSeen: string | null;
    lastEpoch: number | null;
  }>();

  alerts.forEach((alert) => {
    const source = displayValue(alert.sourceIp, "Unknown");
    const destination = displayValue(alert.destinationIp || alert.destIp, "Unknown");
    if (source === "Unknown" && destination === "Unknown") return;
    const key = `${source}\u0000${destination}`;
    const current = groups.get(key) ?? {
      source,
      destination,
      alertIds: new Set<string>(),
      attacks: new Set<string>(),
      protocols: new Set<string>(),
      severities: [],
      risks: [],
      lastSeen: null,
      lastEpoch: null,
    };
    current.alertIds.add(alert.id);
    if (alert.attackType?.trim()) current.attacks.add(alert.attackType);
    if (alert.protocol?.trim()) current.protocols.add(alert.protocol);
    current.severities.push(alert.severity);
    if (Number.isFinite(alert.riskScore)) current.risks.push(alert.riskScore);
    const epoch = parseTimestamp(alert.timestamp);
    if (epoch !== null && (current.lastEpoch === null || epoch > current.lastEpoch)) {
      current.lastEpoch = epoch;
      current.lastSeen = alert.timestamp;
    }
    groups.set(key, current);
  });

  return [...groups.entries()].map(([key, item]) => ({
    id: key,
    source: item.source,
    destination: item.destination,
    count: item.alertIds.size,
    attacks: [...item.attacks].sort(),
    protocols: [...item.protocols].sort(),
    severity: highestSeverity(item.severities),
    maxRisk: item.risks.length > 0 ? Math.max(...item.risks) : null,
    lastSeen: item.lastSeen,
  })).sort((left, right) => right.count - left.count || (right.maxRisk ?? -1) - (left.maxRisk ?? -1));
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      <p className="mt-1 text-[8px] uppercase text-muted-foreground">{detail}</p>
    </div>
  );
}

export function AttackSurfacePage({ alerts }: AttackSurfacePageProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const assets = useMemo(() => deriveObservedAssets(alerts), [alerts]);
  const relationships = useMemo(() => deriveRelationships(alerts), [alerts]);
  const selected = assets.find((asset) => asset.id === selectedId) ?? null;

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) => [
      asset.label,
      asset.kind,
      ...asset.observedAs,
      ...asset.attackTypes,
      ...asset.providers,
      ...asset.regions,
    ].some((value) => value.toLowerCase().includes(normalized)));
  }, [assets, query]);

  const publicAssets = assets.filter((asset) => asset.internetFacing === true).length;
  const privateAssets = assets.filter((asset) => asset.internetFacing === false).length;
  const unknownExposure = assets.filter((asset) => asset.internetFacing === null).length;
  const cloudResources = assets.filter((asset) => asset.observedAs.includes("Resource")).length;
  const criticalAssets = assets.filter((asset) => asset.severity === Severity.CRITICAL).length;

  return (
    <div className="space-y-6 pb-16 font-mono text-foreground" id="attack-surface-page">
      <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <ShieldAlert size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.24em]">Observed attack surface</span>
          </div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight">Asset Discovery & Exposure</h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Assets and communication paths observed in backend alerts
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={12} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assets, regions, attacks..."
            className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted-foreground sm:w-80"
          />
        </label>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Observed assets" value={assets.length.toLocaleString()} detail="Unique alert identifiers" />
        <Metric label="Public IPv4" value={publicAssets.toLocaleString()} detail="Deterministic address classification" />
        <Metric label="Private IPv4" value={privateAssets.toLocaleString()} detail={`${unknownExposure} exposure states unknown`} />
        <Metric label="Cloud resources" value={cloudResources.toLocaleString()} detail="Resource IDs attached to alerts" />
        <Metric label="Critical assets" value={criticalAssets.toLocaleString()} detail={`${relationships.length} observed communication paths`} />
      </section>

      {assets.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
          <Network size={28} className="text-muted-foreground" />
          <p className="mt-3 text-[11px] font-black uppercase">No attack-surface observations</p>
          <p className="mt-1 max-w-lg text-[9px] text-muted-foreground">
            Assets and relationships will appear after the backend returns alerts with network endpoints or cloud resource identifiers.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2"><Server size={14} className="text-cyan-500" /><h2 className="text-[10px] font-black uppercase tracking-widest">Observed assets</h2></div>
              <span className="text-[8px] uppercase text-muted-foreground">{filteredAssets.length} displayed</span>
            </div>
            {filteredAssets.length === 0 ? (
              <div className="p-10 text-center text-[9px] uppercase text-muted-foreground">No assets match the search.</div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedId(asset.id)}
                    className="rounded-xl border border-border/70 bg-muted/5 p-4 text-left transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {asset.observedAs.includes("Resource") ? <Cloud size={14} className="shrink-0 text-blue-500" /> : <Server size={14} className="shrink-0 text-cyan-500" />}
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-black" title={asset.label}>{asset.label}</p>
                          <p className="mt-0.5 text-[8px] text-muted-foreground">{asset.kind}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(asset.severity)}`}>{asset.severity ?? "Unknown"}</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-[8px]">
                      <div><dt className="uppercase text-muted-foreground">Alerts</dt><dd className="mt-1 font-black">{asset.alertCount}</dd></div>
                      <div><dt className="uppercase text-muted-foreground">Max risk</dt><dd className="mt-1 font-black">{asset.maxRiskScore?.toFixed(0) ?? EMPTY_VALUE}</dd></div>
                      <div><dt className="uppercase text-muted-foreground">Exposure</dt><dd className="mt-1 font-black">{asset.internetFacing === null ? "Unknown" : asset.internetFacing ? "Public IPv4" : "Private IPv4"}</dd></div>
                      <div><dt className="uppercase text-muted-foreground">Observed as</dt><dd className="mt-1 font-black">{asset.observedAs.join(" / ") || "Unknown"}</dd></div>
                    </dl>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3"><ExternalLink size={14} className="text-cyan-500" /><h2 className="text-[10px] font-black uppercase tracking-widest">Observed communication paths</h2></div>
            {relationships.length === 0 ? (
              <p className="p-10 text-center text-[9px] text-muted-foreground">No source-to-destination relationships available.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full min-w-225 text-left text-[9px]">
                  <thead className="bg-muted/30 text-[8px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-3 py-3">Source</th><th className="px-3 py-3">Destination</th><th className="px-3 py-3">Alerts</th><th className="px-3 py-3">Attacks</th><th className="px-3 py-3">Severity / risk</th><th className="px-3 py-3">Last seen</th></tr></thead>
                  <tbody className="divide-y divide-border/40">
                    {relationships.map((relationship) => (
                      <tr key={relationship.id} className="hover:bg-muted/10">
                        <td className="px-3 py-3 font-black">{relationship.source}</td>
                        <td className="px-3 py-3 font-black">{relationship.destination}</td>
                        <td className="px-3 py-3">{relationship.count}</td>
                        <td className="px-3 py-3"><span className="block font-bold">{relationship.attacks.join(", ") || "Unknown"}</span><span className="text-muted-foreground">{relationship.protocols.join(", ") || "Unknown protocol"}</span></td>
                        <td className="px-3 py-3"><span className={`inline-flex rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(relationship.severity)}`}>{relationship.severity ?? "Unknown"}</span><span className="ml-2">{relationship.maxRisk ?? EMPTY_VALUE}</span></td>
                        <td className="px-3 py-3 text-muted-foreground">{formatTimestamp(relationship.lastSeen ?? undefined)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {selected && <AssetDetail asset={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function AssetDetail({ asset, onClose }: { asset: ObservedAsset; onClose: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-border bg-background p-5 shadow-2xl">
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div><p className="text-[8px] font-black uppercase tracking-widest text-cyan-500">Observed asset evidence</p><h2 className="mt-2 break-all text-base font-black">{asset.label}</h2><p className="mt-1 text-[9px] text-muted-foreground">{asset.kind}</p></div>
        <button onClick={onClose} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close asset"><X size={14} /></button>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-[9px]">
        {[
          ["Observed as", asset.observedAs.join(" · ") || "Unknown"],
          ["Alert count", String(asset.alertCount)],
          ["Highest severity", asset.severity ?? "Unknown"],
          ["Risk max / average", `${asset.maxRiskScore?.toFixed(0) ?? EMPTY_VALUE} / ${asset.averageRiskScore?.toFixed(1) ?? EMPTY_VALUE}`],
          ["Exposure", asset.internetFacing === null ? "Unknown" : asset.internetFacing ? "Public IPv4" : "Private IPv4"],
          ["Last seen", formatTimestamp(asset.lastSeen ?? undefined)],
          ["Protocols", asset.protocols.join(", ") || "Unknown"],
          ["Provider / region", [...asset.providers, ...asset.regions].join(" · ") || "Unknown"],
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-border/60 bg-muted/10 p-3"><dt className="text-[7px] font-black uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-bold">{value}</dd></div>)}
      </dl>
      <section className="mt-4 rounded-xl border border-border p-4">
        <h3 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Attack types observed</h3>
        <div className="mt-3 flex flex-wrap gap-2">{asset.attackTypes.length > 0 ? asset.attackTypes.map((attack) => <span key={attack} className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-500">{attack}</span>) : <span className="text-[9px] text-muted-foreground">Unknown</span>}</div>
      </section>
    </aside>
  );
}

export default AttackSurfacePage;
