import { useMemo, useState } from "react";
import { Activity, Database, Network, Radio, Search, ShieldAlert, X } from "lucide-react";
import { Alert, Severity } from "../types";
import {
  deriveNetworkRows,
  deriveNetworkSummary,
  displayValue,
  EMPTY_VALUE,
  formatTimestamp,
  NetworkAlertRow,
  severityClass,
} from "../data/derive";

interface NetworkMonitoringPageProps {
  alerts: Alert[];
}

function formatBytes(value: number | null): string {
  if (value === null) return EMPTY_VALUE;
  if (value < 1024) return `${value.toLocaleString()} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}

function formatPercent(value: number | null): string {
  if (value === null) return EMPTY_VALUE;
  const normalized = Math.abs(value) <= 1 ? value * 100 : value;
  return `${normalized.toFixed(1)}%`;
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">{detail}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-mono text-[11px] font-bold text-foreground">{value}</p>
    </div>
  );
}

export function NetworkMonitoringPage({ alerts }: NetworkMonitoringPageProps) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"ALL" | Severity>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => deriveNetworkRows(alerts), [alerts]);
  const summary = useMemo(() => deriveNetworkSummary(rows), [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (severity !== "ALL" && row.severity !== severity) return false;
      if (!normalizedQuery) return true;
      return [
        row.id,
        row.sourceIp,
        row.destinationIp,
        row.protocol,
        row.service,
        row.attackType,
        row.sensorId,
        row.signatureId,
        row.correlationId,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, rows, severity]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  return (
    <div className="space-y-6 pb-16 font-mono text-foreground" id="network-monitoring-page">
      <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <Network size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.24em]">Backend evidence view</span>
          </div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight">Network Observability</h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Network facts attached to the currently loaded backend alerts
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[9px] uppercase text-muted-foreground">
          <Radio size={12} className="text-cyan-500" />
          {rows.length > 0 ? `${rows.length} evidence records loaded` : "No network evidence loaded"}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricCard label="Alert records" value={summary.records.toLocaleString()} detail="Loaded from backend" />
        <MetricCard label="Unique sources" value={summary.uniqueSources.toLocaleString()} detail="Known source addresses" />
        <MetricCard label="Unique targets" value={summary.uniqueDestinations.toLocaleString()} detail="Known destination addresses" />
        <MetricCard label="Observed bytes" value={formatBytes(summary.bytes)} detail="Only attached Zeek evidence" />
        <MetricCard label="Zeek evidence" value={summary.zeekEvidence.toLocaleString()} detail="Sensor or correlation ID" />
        <MetricCard label="Suricata evidence" value={summary.suricataEvidence.toLocaleString()} detail="Signature ID present" />
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-500" />
            <h2 className="text-[11px] font-black uppercase tracking-widest">Observed alert flows</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
              <Search size={12} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search IP, alert, protocol, evidence..."
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

        {rows.length === 0 ? (
          <div className="mt-4 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 text-center">
            <Database size={24} className="text-muted-foreground" />
            <p className="mt-3 text-[11px] font-black uppercase">No backend network evidence</p>
            <p className="mt-1 max-w-md text-[9px] text-muted-foreground">
              This view stays empty until alerts containing source, destination, Zeek, or Suricata evidence are loaded.
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center text-[10px] uppercase text-muted-foreground">
            No records match the active filters.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-275 text-left text-[9px]">
              <thead className="bg-muted/30 text-[8px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Destination</th>
                  <th className="px-3 py-3">Protocol / service</th>
                  <th className="px-3 py-3">Detection</th>
                  <th className="px-3 py-3">Risk</th>
                  <th className="px-3 py-3">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/20"
                  >
                    <td className="px-3 py-3 text-muted-foreground">{formatTimestamp(row.timestamp)}</td>
                    <td className="px-3 py-3 font-bold">{row.sourceIp}:{row.sourcePort ?? EMPTY_VALUE}</td>
                    <td className="px-3 py-3 font-bold">{row.destinationIp}:{row.destinationPort ?? EMPTY_VALUE}</td>
                    <td className="px-3 py-3">
                      <span className="block font-black">{row.protocol}</span>
                      <span className="text-muted-foreground">{row.service}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block font-black">{row.attackType}</span>
                      <span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(row.severity)}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block">Risk: {row.riskScore ?? EMPTY_VALUE}</span>
                      <span className="text-muted-foreground">Confidence: {formatPercent(row.confidenceScore)}</span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="block">Sensor: {row.sensorId}</span>
                      <span className="block">Signature: {row.signatureId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && <NetworkEvidenceDrawer row={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function NetworkEvidenceDrawer({ row, onClose }: { row: NetworkAlertRow; onClose: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-border bg-background/98 p-5 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <ShieldAlert size={15} />
            <span className="text-[8px] font-black uppercase tracking-widest">Backend evidence</span>
          </div>
          <h2 className="mt-2 break-all text-sm font-black">{row.id}</h2>
          <p className="mt-1 text-[9px] text-muted-foreground">{formatTimestamp(row.timestamp)}</p>
        </div>
        <button onClick={onClose} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close evidence">
          <X size={14} />
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <DetailField label="Source" value={`${row.sourceIp}:${row.sourcePort ?? EMPTY_VALUE}`} />
        <DetailField label="Destination" value={`${row.destinationIp}:${row.destinationPort ?? EMPTY_VALUE}`} />
        <DetailField label="Protocol" value={row.protocol} />
        <DetailField label="Direction" value={row.direction} />
        <DetailField label="Service" value={row.service} />
        <DetailField label="Observed bytes" value={formatBytes(row.bytes)} />
        <DetailField label="Observed packets" value={row.packets?.toLocaleString() ?? EMPTY_VALUE} />
        <DetailField label="Risk / confidence" value={`${row.riskScore ?? EMPTY_VALUE} / ${formatPercent(row.confidenceScore)}`} />
        <DetailField label="Zeek sensor" value={displayValue(row.sensorId, "Unknown")} />
        <DetailField label="Correlation ID" value={displayValue(row.correlationId, "Unknown")} />
        <DetailField label="Suricata signature" value={displayValue(row.signatureId, "Unknown")} />
        <DetailField label="Detection" value={`${row.severity} · ${row.attackType}`} />
      </div>
    </aside>
  );
}

export default NetworkMonitoringPage;
