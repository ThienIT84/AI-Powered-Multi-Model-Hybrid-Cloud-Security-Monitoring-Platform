import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Download,
  FileJson,
  FileSpreadsheet,
  Fingerprint,
  Network,
  Radar,
  ShieldAlert,
  Target,
} from "lucide-react";
import {
  alertsToCsv,
  countBy,
  deriveReportSnapshot,
  displayValue,
  EMPTY_VALUE,
  filterAlertsByRange,
  formatTimestamp,
  hasValue,
  severityClass,
  type CountItem,
  type ReportRange,
} from "../data/derive";
import { Alert, Severity } from "../types";

interface ReportsPageProps {
  alerts: Alert[];
}

const rangeOptions: Array<{ value: ReportRange; label: string }> = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All loaded" },
];

function downloadFile(content: string, mimeType: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatScore(value: number | null): string {
  return value === null ? EMPTY_VALUE : value.toFixed(1);
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone = "text-cyan-500",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <span className={tone}>{icon}</span>
      </div>
      <div className={`text-2xl font-black tabular-nums ${tone}`}>{value}</div>
      <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function DistributionCard({
  title,
  subtitle,
  items,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  items: CountItem[];
  emptyLabel: string;
}) {
  const maxCount = items[0]?.count ?? 0;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.14em] text-foreground">{title}</h3>
        <p className="mt-1 text-[10px] text-muted-foreground">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 8).map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-start justify-between gap-3 text-[11px]">
                <span className="min-w-0 break-words font-semibold text-foreground">{item.name}</span>
                <span className="shrink-0 font-mono font-black tabular-nums text-cyan-500">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ReportsPage({ alerts }: ReportsPageProps) {
  const [range, setRange] = useState<ReportRange>("all");

  const filteredAlerts = useMemo(() => filterAlertsByRange(alerts, range), [alerts, range]);
  const snapshot = useMemo(() => deriveReportSnapshot(filteredAlerts), [filteredAlerts]);
  const detectorCounts = useMemo(
    () => countBy(filteredAlerts.flatMap((alert) => alert.detectedBy ?? [])),
    [filteredAlerts],
  );
  const tacticCounts = useMemo(
    () => countBy(filteredAlerts.map((alert) => alert.mitre?.tactic)),
    [filteredAlerts],
  );
  const protocolCounts = useMemo(
    () => countBy(filteredAlerts.map((alert) => alert.protocol)),
    [filteredAlerts],
  );
  const severityCounts = useMemo<CountItem[]>(
    () => [
      { name: Severity.CRITICAL, count: snapshot.critical },
      { name: Severity.HIGH, count: snapshot.high },
      { name: Severity.MEDIUM, count: snapshot.medium },
      { name: Severity.LOW, count: snapshot.low },
    ].filter((item) => item.count > 0),
    [snapshot],
  );

  const evidenceSummary = useMemo(() => {
    const withAi = filteredAlerts.filter((alert) =>
      Boolean(alert.aiDecision?.ai1 || alert.aiDecision?.ai2a || alert.aiDecision?.ai2b || alert.aiDecision?.fusion)
    ).length;
    const withNetworkEvidence = filteredAlerts.filter((alert) =>
      Boolean(
        alert.zeekData?.sensorId ||
        alert.zeekData?.correlationId ||
        alert.suricataData?.signatureId ||
        alert.suricataData?.signature,
      )
    ).length;
    const withMitre = filteredAlerts.filter((alert) =>
      hasValue(alert.mitre?.techniqueId) || hasValue(alert.mitre?.techniqueName)
    ).length;
    const cloudLinked = filteredAlerts.filter((alert) =>
      hasValue(alert.cloudProvider) || hasValue(alert.resourceId)
    ).length;
    return { withAi, withNetworkEvidence, withMitre, cloudLinked };
  }, [filteredAlerts]);

  const newestTimestamp = filteredAlerts[0]?.timestamp;
  const oldestTimestamp = filteredAlerts.at(-1)?.timestamp;
  const activeRangeLabel = rangeOptions.find((option) => option.value === range)?.label ?? range;

  const exportCsv = () => {
    downloadFile(
      alertsToCsv(filteredAlerts),
      "text/csv;charset=utf-8",
      `security-alerts-${range}.csv`,
    );
  };

  const exportJson = () => {
    downloadFile(
      JSON.stringify(filteredAlerts, null, 2),
      "application/json;charset=utf-8",
      `security-alerts-${range}.json`,
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-16 text-foreground">
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-500">
            <Activity className="h-3.5 w-3.5" />
            Backend alert reporting
          </div>
          <h1 className="text-2xl font-black tracking-tight">Security Reports</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Every metric and export below is calculated from the alerts currently loaded from the backend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-muted/30 p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition ${
                  range === option.value
                    ? "bg-cyan-500 text-slate-950"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredAlerts.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[10px] font-black uppercase tracking-wide transition hover:border-cyan-500/50 hover:text-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            type="button"
            onClick={exportJson}
            disabled={filteredAlerts.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileJson className="h-3.5 w-3.5" /> JSON
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-cyan-500" /> {activeRangeLabel}
        </span>
        <span>Oldest: {formatTimestamp(oldestTimestamp)}</span>
        <span>Newest: {formatTimestamp(newestTimestamp)}</span>
        {range !== "all" && (
          <span className="ml-auto">
            Range is anchored to the newest timestamp in the loaded backend data.
          </span>
        )}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-sm font-black uppercase tracking-wide">No backend alerts in this range</h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            {alerts.length === 0
              ? "The backend has not supplied any alerts yet. Reports will populate as soon as data is received."
              : "Choose another time range to include the timestamps available in the loaded alert set."}
          </p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<Radar className="h-4 w-4" />}
              label="Alerts"
              value={snapshot.alerts.toLocaleString()}
              detail={`${snapshot.uniqueSources.toLocaleString()} sources / ${snapshot.uniqueDestinations.toLocaleString()} destinations`}
            />
            <MetricCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Critical"
              value={snapshot.critical.toLocaleString()}
              detail={`${snapshot.high.toLocaleString()} high-severity alerts`}
              tone="text-red-500"
            />
            <MetricCard
              icon={<ShieldAlert className="h-4 w-4" />}
              label="Open"
              value={snapshot.openAlerts.toLocaleString()}
              detail={`${snapshot.resolvedAlerts.toLocaleString()} resolved, mitigated, or false-positive`}
              tone="text-amber-500"
            />
            <MetricCard
              icon={<Fingerprint className="h-4 w-4" />}
              label="Average risk"
              value={formatScore(snapshot.averageRiskScore)}
              detail={`Average confidence: ${formatScore(snapshot.averageConfidence)}`}
              tone="text-violet-500"
            />
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "AI analysis", value: evidenceSummary.withAi, icon: <Activity className="h-4 w-4" /> },
              { label: "Network evidence", value: evidenceSummary.withNetworkEvidence, icon: <Network className="h-4 w-4" /> },
              { label: "MITRE mapped", value: evidenceSummary.withMitre, icon: <Target className="h-4 w-4" /> },
              { label: "Cloud linked", value: evidenceSummary.cloudLinked, icon: <Cloud className="h-4 w-4" /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <span className="text-cyan-500">{item.icon}</span>
                <div>
                  <div className="font-mono text-lg font-black tabular-nums">{item.value.toLocaleString()}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <DistributionCard
              title="Severity distribution"
              subtitle="Backend alert severity values"
              items={severityCounts}
              emptyLabel="No severity values"
            />
            <DistributionCard
              title="Attack types"
              subtitle="Most frequently observed classifications"
              items={snapshot.attackTypes}
              emptyLabel="No attack classifications"
            />
            <DistributionCard
              title="Alert status"
              subtitle="Current workflow state of loaded alerts"
              items={snapshot.statuses}
              emptyLabel="No status values"
            />
            <DistributionCard
              title="Source addresses"
              subtitle="Top observed source IP addresses"
              items={snapshot.sources}
              emptyLabel="No source addresses"
            />
            <DistributionCard
              title="Destination addresses"
              subtitle="Top observed destination IP addresses"
              items={snapshot.destinations}
              emptyLabel="No destination addresses"
            />
            <DistributionCard
              title="MITRE techniques"
              subtitle="Techniques mapped by the backend"
              items={snapshot.mitreTechniques}
              emptyLabel="No MITRE mappings"
            />
            <DistributionCard
              title="Detection sources"
              subtitle="Sensors and models listed in detectedBy"
              items={detectorCounts}
              emptyLabel="No detector metadata"
            />
            <DistributionCard
              title="MITRE tactics"
              subtitle="Observed ATT&CK tactic names"
              items={tacticCounts}
              emptyLabel="No tactic metadata"
            />
            <DistributionCard
              title="Protocols"
              subtitle="Network protocols in backend alerts"
              items={protocolCounts}
              emptyLabel="No protocol metadata"
            />
            <DistributionCard
              title="Cloud providers"
              subtitle="Provider metadata attached to alerts"
              items={snapshot.providers}
              emptyLabel="No cloud provider metadata"
            />
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.14em]">Recent backend alerts</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Showing the newest {Math.min(filteredAlerts.length, 50).toLocaleString()} of {filteredAlerts.length.toLocaleString()} alerts in this report.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-cyan-500">
                <Download className="h-3 w-3" /> Exports include all {filteredAlerts.length.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-[11px]">
                <thead className="bg-muted/30 text-[9px] font-black uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Alert</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">MITRE</th>
                    <th className="px-4 py-3 text-right">Risk / Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAlerts.slice(0, 50).map((alert) => (
                    <tr key={alert.id} className="align-top hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </td>
                      <td className="max-w-[260px] px-4 py-3">
                        <div className="break-words font-bold">{displayValue(alert.attackType, "Unknown")}</div>
                        <div className="mt-1 break-all font-mono text-[9px] text-muted-foreground">{displayValue(alert.id)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded border px-2 py-1 text-[9px] font-black uppercase ${severityClass(alert.severity)}`}>
                          {displayValue(alert.severity, "Unknown")}
                        </span>
                        <div className="mt-1.5 text-[9px] text-muted-foreground">{displayValue(alert.status)}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{displayValue(alert.sourceIp, "Unknown")}</td>
                      <td className="px-4 py-3 font-mono">{displayValue(alert.destinationIp || alert.destIp, "Unknown")}</td>
                      <td className="max-w-[220px] px-4 py-3">
                        <div className="font-mono font-bold text-cyan-500">{displayValue(alert.mitre?.techniqueId)}</div>
                        <div className="mt-1 break-words text-[9px] text-muted-foreground">{displayValue(alert.mitre?.techniqueName)}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold tabular-nums">
                        {Number.isFinite(alert.riskScore) ? alert.riskScore.toFixed(1) : EMPTY_VALUE}
                        <span className="mx-1 text-muted-foreground">/</span>
                        {Number.isFinite(alert.confidenceScore) ? alert.confidenceScore.toFixed(1) : EMPTY_VALUE}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wide text-emerald-500">Export scope verified</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  CSV and JSON are generated directly from the {filteredAlerts.length.toLocaleString()} alerts in the selected range. No report archive, benchmark, SLA, trend, or compliance value is synthesized on this page.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
