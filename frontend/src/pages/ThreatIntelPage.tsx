import { useMemo, useState } from "react";
import { Radar, Search, ShieldCheck } from "lucide-react";
import { Alert, Severity } from "../types";
import { BackendEmptyState } from "../components/common/BackendEmptyState";

interface ObservedIndicator {
  value: string;
  firstSeen: string;
  lastSeen: string;
  alertCount: number;
  maxConfidence: number;
  maxRisk: number;
  severities: Set<string>;
  attackTypes: Set<string>;
  alertIds: string[];
}

function buildIndicators(alerts: Alert[]): ObservedIndicator[] {
  const byIp = new Map<string, ObservedIndicator>();
  for (const alert of alerts) {
    if (!alert.sourceIp || alert.sourceIp === "0.0.0.0") continue;
    const existing = byIp.get(alert.sourceIp);
    if (!existing) {
      byIp.set(alert.sourceIp, {
        value: alert.sourceIp,
        firstSeen: alert.timestamp,
        lastSeen: alert.timestamp,
        alertCount: 1,
        maxConfidence: alert.confidenceScore,
        maxRisk: alert.riskScore,
        severities: new Set([alert.severity]),
        attackTypes: new Set([alert.attackType]),
        alertIds: [alert.id],
      });
      continue;
    }
    existing.alertCount += 1;
    existing.maxConfidence = Math.max(existing.maxConfidence, alert.confidenceScore);
    existing.maxRisk = Math.max(existing.maxRisk, alert.riskScore);
    existing.severities.add(alert.severity);
    existing.attackTypes.add(alert.attackType);
    existing.alertIds.push(alert.id);
    if (Date.parse(alert.timestamp) < Date.parse(existing.firstSeen)) existing.firstSeen = alert.timestamp;
    if (Date.parse(alert.timestamp) > Date.parse(existing.lastSeen)) existing.lastSeen = alert.timestamp;
  }
  return [...byIp.values()].sort((left, right) => right.maxRisk - left.maxRisk || right.alertCount - left.alertCount);
}

export function ThreatIntelPage({ alerts }: { alerts: Alert[] }) {
  const [query, setQuery] = useState("");
  const indicators = useMemo(() => buildIndicators(alerts), [alerts]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return indicators;
    return indicators.filter((indicator) =>
      indicator.value.toLowerCase().includes(normalized) ||
      [...indicator.attackTypes].some((type) => type.toLowerCase().includes(normalized)) ||
      indicator.alertIds.some((id) => id.toLowerCase().includes(normalized))
    );
  }, [indicators, query]);
  const critical = indicators.filter((indicator) => indicator.severities.has(Severity.CRITICAL)).length;

  return (
    <div className="space-y-6 pb-12 text-foreground">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Observed security indicators</h1>
            <p className="mt-1 text-xs text-muted-foreground">Source IPs observed in backend alerts. No reputation, actor, or feed attribution is inferred.</p>
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <Search size={13} className="text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search IP, attack, alert ID" className="w-56 bg-transparent text-xs outline-none" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[["Observed IPs", indicators.length], ["Critical-linked IPs", critical], ["Backend alerts", alerts.length]].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {indicators.length === 0 ? (
        <BackendEmptyState title="No observed indicators" description="The backend has not returned any alerts with a source IP. External IOC feeds and threat-actor data are not configured." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"><Radar size={13} /> {filtered.length} indicator(s)</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-xs">
              <thead className="bg-muted/40 text-[9px] uppercase tracking-widest text-muted-foreground"><tr><th className="p-3">Source IP</th><th className="p-3">Alerts</th><th className="p-3">Observed attacks</th><th className="p-3">Max confidence</th><th className="p-3">Max risk</th><th className="p-3">Last seen</th></tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((indicator) => (
                  <tr key={indicator.value}>
                    <td className="p-3 font-mono font-bold">{indicator.value}</td>
                    <td className="p-3">{indicator.alertCount}</td>
                    <td className="max-w-75 p-3 text-muted-foreground">{[...indicator.attackTypes].join(", ")}</td>
                    <td className="p-3">{Math.round(indicator.maxConfidence * 100)}%</td>
                    <td className="p-3 font-bold">{indicator.maxRisk}</td>
                    <td className="p-3 font-mono text-muted-foreground">{new Date(indicator.lastSeen).toLocaleString()}</td>
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

export default ThreatIntelPage;
