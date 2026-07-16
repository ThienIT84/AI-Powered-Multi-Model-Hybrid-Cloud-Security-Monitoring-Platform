import { useMemo, useState } from "react";
import { ExternalLink, Search, Shield, Target, X } from "lucide-react";
import { Alert, Severity } from "../types";
import {
  average,
  deriveMitreTechniques,
  displayValue,
  EMPTY_VALUE,
  formatTimestamp,
  hasValue,
  MitreTechniqueAggregate,
  severityClass,
  sortAlertsNewest,
} from "../data/derive";

interface MitreAttackPageProps {
  alerts: Alert[];
}

function percent(value: number | null): string {
  if (value === null) return EMPTY_VALUE;
  const normalized = Math.abs(value) <= 1 ? value * 100 : value;
  return `${normalized.toFixed(1)}%`;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-[8px] uppercase text-muted-foreground">{detail}</p></div>;
}

function hasMitre(alert: Alert): boolean {
  return hasValue(alert.mitre?.techniqueId) || hasValue(alert.mitre?.techniqueName);
}

export function MitreAttackPage({ alerts }: MitreAttackPageProps) {
  const [query, setQuery] = useState("");
  const [tactic, setTactic] = useState("ALL");
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);

  const techniques = useMemo(() => deriveMitreTechniques(alerts), [alerts]);
  const mappedAlerts = useMemo(() => sortAlertsNewest(alerts.filter(hasMitre)), [alerts]);
  const tactics = useMemo(() => [...new Set(techniques.map((item) => item.tactic).filter((item) => item !== "Unknown"))].sort(), [techniques]);
  const filteredTechniques = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return techniques.filter((item) => {
      if (tactic !== "ALL" && item.tactic !== tactic) return false;
      if (!normalized) return true;
      return [item.techniqueId, item.techniqueName, item.tactic, ...item.alertIds]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [query, tactic, techniques]);
  const selected = techniques.find((item) => item.techniqueId === selectedTechniqueId) ?? null;
  const mappedConfidence = average(mappedAlerts.map((alert) => alert.confidenceScore));
  const criticalMappings = mappedAlerts.filter((alert) => alert.severity === Severity.CRITICAL).length;

  return (
    <div className="space-y-6 pb-16 font-mono text-foreground" id="mitre-attack-page">
      <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-500"><Target size={18} /><span className="text-[9px] font-black uppercase tracking-[0.24em]">Backend mappings only</span></div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight">MITRE ATT&CK Mapping</h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Techniques and tactics attached to loaded alerts</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"><Search size={12} className="text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search technique, tactic, alert..." className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted-foreground sm:w-72" /></label>
          <select value={tactic} onChange={(event) => setTactic(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-[9px] font-black uppercase outline-none"><option value="ALL">All tactics</option>{tactics.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Mapped alerts" value={mappedAlerts.length.toLocaleString()} detail={`${alerts.length - mappedAlerts.length} alerts unmapped`} />
        <Metric label="Techniques" value={techniques.length.toLocaleString()} detail="Unique backend technique IDs" />
        <Metric label="Tactics" value={tactics.length.toLocaleString()} detail="Unique reported tactics" />
        <Metric label="Critical mappings" value={criticalMappings.toLocaleString()} detail="Critical mapped alerts" />
        <Metric label="Avg confidence" value={percent(mappedConfidence)} detail="Across mapped alerts" />
      </section>

      {techniques.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center"><Target size={28} className="text-muted-foreground" /><p className="mt-3 text-[11px] font-black uppercase">No MITRE mappings available</p><p className="mt-1 max-w-lg text-[9px] text-muted-foreground">The view remains empty until backend alerts provide a MITRE technique ID or technique name.</p></section>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="rounded-xl border border-border bg-card p-4 xl:col-span-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3"><div className="flex items-center gap-2"><Shield size={14} className="text-cyan-500" /><h2 className="text-[10px] font-black uppercase tracking-widest">Technique summary</h2></div><span className="text-[8px] text-muted-foreground">{filteredTechniques.length} displayed</span></div>
            {filteredTechniques.length === 0 ? <div className="p-10 text-center text-[9px] uppercase text-muted-foreground">No techniques match the filters.</div> : (
              <div className="mt-3 space-y-2">
                {filteredTechniques.map((item) => (
                  <button key={item.techniqueId} onClick={() => setSelectedTechniqueId(item.techniqueId)} className="w-full rounded-xl border border-border/70 bg-muted/5 p-3 text-left transition-colors hover:bg-muted/20">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black text-cyan-500">{item.techniqueId}</p><p className="mt-1 truncate text-[9px] font-black" title={item.techniqueName}>{item.techniqueName}</p><p className="mt-1 text-[8px] text-muted-foreground">{item.tactic}</p></div><span className="rounded border border-border bg-background px-2 py-1 text-[8px] font-black">{item.alertCount} alerts</span></div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-[8px] text-muted-foreground"><span>Max risk: <b className="text-foreground">{item.maxRiskScore?.toFixed(0) ?? EMPTY_VALUE}</b></span><span>Confidence: <b className="text-foreground">{percent(item.averageConfidence)}</b></span><span>{formatTimestamp(item.lastSeen ?? undefined)}</span></div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 xl:col-span-7">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3"><Target size={14} className="text-cyan-500" /><h2 className="text-[10px] font-black uppercase tracking-widest">Alert-to-technique records</h2></div>
            <div className="mt-3 max-h-170 overflow-auto rounded-lg border border-border/70">
              <table className="w-full min-w-200 text-left text-[9px]">
                <thead className="sticky top-0 bg-muted text-[8px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-3 py-3">Alert</th><th className="px-3 py-3">Technique</th><th className="px-3 py-3">Tactic</th><th className="px-3 py-3">Detection</th><th className="px-3 py-3">Risk / confidence</th></tr></thead>
                <tbody className="divide-y divide-border/40">
                  {mappedAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-muted/10"><td className="px-3 py-3"><span className="block break-all font-black">{alert.id}</span><span className="text-muted-foreground">{formatTimestamp(alert.timestamp)}</span></td><td className="px-3 py-3"><span className="block font-black text-cyan-500">{displayValue(alert.mitre?.techniqueId, "Unknown")}</span><span>{displayValue(alert.mitre?.techniqueName, "Unknown")}</span></td><td className="px-3 py-3">{displayValue(alert.mitre?.tactic, "Unknown")}</td><td className="px-3 py-3"><span className="block font-black">{displayValue(alert.attackType, "Unknown")}</span><span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(alert.severity)}`}>{alert.severity}</span></td><td className="px-3 py-3">{Number.isFinite(alert.riskScore) ? alert.riskScore : EMPTY_VALUE} / {percent(Number.isFinite(alert.confidenceScore) ? alert.confidenceScore : null)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {selected && <TechniqueDrawer technique={selected} alerts={mappedAlerts.filter((alert) => alert.mitre?.techniqueId === selected.techniqueId)} onClose={() => setSelectedTechniqueId(null)} />}
    </div>
  );
}

function TechniqueDrawer({ technique, alerts, onClose }: { technique: MitreTechniqueAggregate; alerts: Alert[]; onClose: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-border bg-background p-5 shadow-2xl">
      <div className="flex items-start justify-between border-b border-border pb-4"><div><p className="text-[9px] font-black text-cyan-500">{technique.techniqueId}</p><h2 className="mt-2 text-base font-black">{technique.techniqueName}</h2><p className="mt-1 text-[9px] text-muted-foreground">Tactic: {technique.tactic}</p></div><button onClick={onClose} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close technique"><X size={14} /></button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-[9px]">{[["Alert count", String(technique.alertCount)], ["Maximum risk", technique.maxRiskScore?.toFixed(0) ?? EMPTY_VALUE], ["Average confidence", percent(technique.averageConfidence)], ["Last seen", formatTimestamp(technique.lastSeen ?? undefined)]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-card p-3"><p className="text-[7px] font-black uppercase text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}</div>
      {technique.url && <a href={technique.url} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[9px] font-black text-cyan-500"><ExternalLink size={12} />Open backend-provided MITRE URL</a>}
      <section className="mt-4 rounded-xl border border-border p-4"><h3 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Related alerts</h3><div className="mt-3 space-y-2">{alerts.map((alert) => <div key={alert.id} className="rounded-lg border border-border/60 bg-muted/10 p-3 text-[9px]"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{displayValue(alert.attackType, "Unknown")}</p><p className="mt-1 break-all text-muted-foreground">{alert.id} · {formatTimestamp(alert.timestamp)}</p></div><span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(alert.severity)}`}>{alert.severity}</span></div></div>)}</div></section>
    </aside>
  );
}

export default MitreAttackPage;
