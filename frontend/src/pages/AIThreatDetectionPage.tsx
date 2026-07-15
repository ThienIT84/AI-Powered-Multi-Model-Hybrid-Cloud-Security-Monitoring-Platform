import { useMemo, useState } from "react";
import { Activity, BrainCircuit, Cpu, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { Alert, PlatformStatus, Severity } from "../types";
import {
  AiAlertRecord,
  average,
  deriveAiRecords,
  displayValue,
  EMPTY_VALUE,
  formatTimestamp,
  severityClass,
} from "../data/derive";

interface AIThreatDetectionPageProps {
  alerts: Alert[];
  platformStatus?: PlatformStatus;
}

type AiRecordFilter = "all" | "high_critical" | "anomaly" | "dos";

const AI_RECORD_FILTERS: Array<{ value: AiRecordFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "high_critical", label: "High / Critical" },
  { value: "anomaly", label: "AI1 Anomalies" },
  { value: "dos", label: "DoS / DDoS" },
];

function matchesAiRecordFilter(record: AiAlertRecord, filter: AiRecordFilter): boolean {
  if (filter === "high_critical") {
    return record.severity === Severity.HIGH || record.severity === Severity.CRITICAL;
  }
  if (filter === "anomaly") {
    return record.ai1Verdict.trim().toUpperCase() === "ANOMALY";
  }
  if (filter === "dos") {
    const evidence = `${record.attackType} ${record.ai2aType} ${record.fusionReason}`.toLowerCase();
    return /(^|[_\s-])d?dos([_\s-]|$)|denial of service/.test(evidence);
  }
  return true;
}

function percent(value: number | null): string {
  if (value === null) return EMPTY_VALUE;
  const normalized = Math.abs(value) <= 1 ? value * 100 : value;
  return `${normalized.toFixed(1)}%`;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-[8px] uppercase text-muted-foreground">{detail}</p>
    </div>
  );
}

function isKnown(value: string): boolean {
  return value !== "Unknown" && value !== EMPTY_VALUE;
}

export function AIThreatDetectionPage({ alerts, platformStatus }: AIThreatDetectionPageProps) {
  const [query, setQuery] = useState("");
  const [recordFilter, setRecordFilter] = useState<AiRecordFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const records = useMemo(() => deriveAiRecords(alerts), [alerts]);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      if (!matchesAiRecordFilter(record, recordFilter)) return false;
      if (!normalized) return true;
      return [
        record.id,
        record.attackType,
        record.sourceIp,
        record.destinationIp,
        record.ai1Verdict,
        record.ai2aType,
        record.ai2bType,
        record.fusionReason,
        record.fusionMode,
        ...record.contributors,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [query, recordFilter, records]);

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const ai1Outputs = records.filter((record) => isKnown(record.ai1Verdict) || record.ai1Score !== null).length;
  const ai2aOutputs = records.filter((record) => isKnown(record.ai2aType) || record.ai2aConfidence !== null).length;
  const ai2bOutputs = records.filter((record) => isKnown(record.ai2bType) || record.ai2bConfidence !== null).length;
  const fusionOutputs = records.filter((record) => isKnown(record.fusionReason) || record.contributors.length > 0).length;
  const averageRisk = average(records.map((record) => record.riskScore));
  const averageConfidence = average(records.map((record) => record.confidenceScore));

  const modelRows = useMemo(() => [
    {
      name: "AI1 anomaly model",
      outputs: ai1Outputs,
      statuses: [...new Set(records.map((record) => record.ai1Status).filter(isKnown))],
      versions: [...new Set(records.map((record) => record.ai1Model).filter(isKnown))],
    },
    {
      name: "AI2A attack classifier",
      outputs: ai2aOutputs,
      statuses: [...new Set(records.map((record) => record.ai2aStatus).filter(isKnown))],
      versions: [...new Set(records.map((record) => record.ai2aModel).filter(isKnown))],
    },
    {
      name: "AI2B web classifier",
      outputs: ai2bOutputs,
      statuses: [...new Set(records.map((record) => record.ai2bStatus).filter(isKnown))],
      versions: [...new Set(records.map((record) => record.ai2bModel).filter(isKnown))],
    },
  ], [ai1Outputs, ai2aOutputs, ai2bOutputs, records]);

  return (
    <div className="space-y-6 pb-16 font-mono text-foreground" id="ai-threat-detection-page">
      <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <BrainCircuit size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.24em]">Backend model evidence</span>
          </div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight">AI Threat Detection</h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Model outputs and fusion decisions present in loaded alerts
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[8px] uppercase">
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <span className="block text-muted-foreground">Models healthy</span>
            <span className="mt-1 block font-black text-foreground">
              {platformStatus?.modelHealthy ?? EMPTY_VALUE}/{platformStatus?.modelTotal ?? EMPTY_VALUE}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <span className="block text-muted-foreground">Backend event rate</span>
            <span className="mt-1 block font-black text-foreground">
              {platformStatus?.eventRatePerSecond === null || platformStatus?.eventRatePerSecond === undefined
                ? EMPTY_VALUE
                : `${platformStatus.eventRatePerSecond.toLocaleString()} events/s`}
            </span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Metric label="Loaded alerts" value={records.length.toLocaleString()} detail="Backend alert records" />
        <Metric label="AI1 outputs" value={ai1Outputs.toLocaleString()} detail="Verdict or score present" />
        <Metric label="AI2A outputs" value={ai2aOutputs.toLocaleString()} detail="Class or confidence present" />
        <Metric label="AI2B outputs" value={ai2bOutputs.toLocaleString()} detail="Web model result present" />
        <Metric label="Fusion outputs" value={fusionOutputs.toLocaleString()} detail="Reason or contributor present" />
        <Metric label="Average confidence" value={percent(averageConfidence)} detail={`Average risk ${averageRisk === null ? EMPTY_VALUE : averageRisk.toFixed(1)}`} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {modelRows.map((model) => (
          <div key={model.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-cyan-500" />
                <h2 className="text-[9px] font-black uppercase tracking-widest">{model.name}</h2>
              </div>
              <span className="text-lg font-black">{model.outputs}</span>
            </div>
            <div className="mt-3 space-y-2 text-[8px]">
              <div className="flex justify-between gap-3"><span className="uppercase text-muted-foreground">Reported statuses</span><span className="text-right font-bold">{model.statuses.join(", ") || "Unknown"}</span></div>
              <div className="flex justify-between gap-3"><span className="uppercase text-muted-foreground">Model versions</span><span className="text-right font-bold">{model.versions.join(", ") || "Unknown"}</span></div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-500" />
            <h2 className="text-[11px] font-black uppercase tracking-widest">AI decision stream</h2>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <Search size={12} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts and model outputs..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted-foreground sm:w-80"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
          {AI_RECORD_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={recordFilter === filter.value}
              onClick={() => setRecordFilter(filter.value)}
              className={`rounded border px-2 py-1 text-[7.5px] font-black uppercase tracking-wider transition-colors ${
                recordFilter === filter.value
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-500"
                  : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
          <span className="ml-auto text-[7.5px] uppercase text-muted-foreground">
            Showing {filteredRecords.length} of {records.length}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="mt-4 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 px-6 text-center">
            <BrainCircuit size={26} className="text-muted-foreground" />
            <p className="mt-3 text-[11px] font-black uppercase">No AI inference records</p>
            <p className="mt-1 max-w-lg text-[9px] text-muted-foreground">
              This screen remains empty until backend alerts include AI analysis or fusion evidence.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center text-[10px] uppercase text-muted-foreground">No records match the active filters.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedId(record.id)}
                className="grid w-full grid-cols-1 gap-3 rounded-xl border border-border/70 bg-muted/5 p-3 text-left transition-colors hover:bg-muted/20 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-2">
                  <span className="block text-[8px] text-muted-foreground">{formatTimestamp(record.timestamp)}</span>
                  <span className="mt-1 block break-all text-[9px] font-black">{record.id}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block font-black">{record.attackType}</span>
                  <span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[7px] font-black uppercase ${severityClass(record.severity)}`}>{record.severity}</span>
                </div>
                <div className="text-[8px] md:col-span-2"><span className="block text-muted-foreground">AI1</span><span className="font-bold">{record.ai1Verdict} · {percent(record.ai1Score)}</span></div>
                <div className="text-[8px] md:col-span-2"><span className="block text-muted-foreground">AI2A</span><span className="font-bold">{record.ai2aType} · {percent(record.ai2aConfidence)}</span></div>
                <div className="text-[8px] md:col-span-2"><span className="block text-muted-foreground">AI2B</span><span className="font-bold">{record.ai2bType} · {percent(record.ai2bConfidence)}</span></div>
                <div className="text-[8px] md:col-span-2"><span className="block text-muted-foreground">Fusion</span><span className="line-clamp-2 font-bold">{record.fusionReason}</span></div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && <AiDetail record={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function AiDetail({ record, onClose }: { record: AiAlertRecord; onClose: () => void }) {
  const groups = [
    { name: "AI1", fields: [["Verdict", record.ai1Verdict], ["Anomaly score", percent(record.ai1Score)], ["Status", record.ai1Status], ["Model", record.ai1Model]] },
    { name: "AI2A", fields: [["Attack class", record.ai2aType], ["Confidence", percent(record.ai2aConfidence)], ["Status", record.ai2aStatus], ["Model", record.ai2aModel]] },
    { name: "AI2B", fields: [["Web class", record.ai2bType], ["Confidence", percent(record.ai2bConfidence)], ["Status", record.ai2bStatus], ["Model", record.ai2bModel]] },
  ];

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-border bg-background p-5 shadow-2xl">
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-500"><Sparkles size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Recorded inference</span></div>
          <h2 className="mt-2 break-all text-base font-black">{record.id}</h2>
          <p className="mt-1 text-[9px] text-muted-foreground">{formatTimestamp(record.timestamp)}</p>
        </div>
        <button onClick={onClose} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close AI details"><X size={14} /></button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {groups.map((group) => (
          <section key={group.name} className="rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 border-b border-border/50 pb-2 text-[9px] font-black uppercase tracking-widest"><Cpu size={11} className="text-cyan-500" />{group.name}</h3>
            <div className="mt-3 space-y-3">
              {group.fields.map(([label, value]) => (
                <div key={label}><p className="text-[7px] font-black uppercase text-muted-foreground">{label}</p><p className="mt-1 break-words text-[9px] font-bold">{displayValue(value, "Unknown")}</p></div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><ShieldCheck size={12} className="text-emerald-500" />Fusion decision</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-[9px]">
          <div><dt className="text-[7px] uppercase text-muted-foreground">Mode</dt><dd className="mt-1 font-bold">{record.fusionMode}</dd></div>
          <div><dt className="text-[7px] uppercase text-muted-foreground">Risk / confidence</dt><dd className="mt-1 font-bold">{record.riskScore ?? EMPTY_VALUE} / {percent(record.confidenceScore)}</dd></div>
          <div className="col-span-2"><dt className="text-[7px] uppercase text-muted-foreground">Contributors</dt><dd className="mt-1 font-bold">{record.contributors.join(", ") || "Unknown"}</dd></div>
          <div className="col-span-2"><dt className="text-[7px] uppercase text-muted-foreground">Reason</dt><dd className="mt-1 whitespace-pre-wrap font-bold leading-relaxed">{record.fusionReason}</dd></div>
        </dl>
      </section>
    </aside>
  );
}

export default AIThreatDetectionPage;
