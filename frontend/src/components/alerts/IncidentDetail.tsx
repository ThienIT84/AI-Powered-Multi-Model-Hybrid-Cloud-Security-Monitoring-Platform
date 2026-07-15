import { X } from "lucide-react";
import { Alert } from "../../types";

export function IncidentDetail({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const rows: Array<[string, string | number | undefined]> = [
    ["Alert ID", alert.id],
    ["Timestamp", alert.timestamp],
    ["Severity", alert.severity],
    ["Risk score", alert.riskScore],
    ["Confidence", `${Math.round(alert.confidenceScore * 100)}%`],
    ["Source", `${alert.sourceIp}${alert.sourcePort !== undefined ? `:${alert.sourcePort}` : ""}`],
    ["Destination", `${alert.destinationIp}:${alert.destinationPort}`],
    ["Protocol", alert.protocol],
    ["MITRE", alert.mitre?.techniqueId ? `${alert.mitre.techniqueId} · ${alert.mitre.techniqueName}` : undefined],
    ["Sensor", alert.zeekData.sensorId],
    ["Correlation", alert.zeekData.correlationId],
    ["Fusion mode", alert.aiDecision.fusion?.mode],
  ];

  return (
    <aside className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Backend alert detail</p><h3 className="mt-1 text-sm font-black text-foreground">{alert.attackType}</h3></div>
        <button type="button" onClick={onClose} className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground"><X size={13} /></button>
      </div>
      <dl className="mt-3 divide-y divide-border/50 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-5 gap-2 py-2"><dt className="col-span-2 text-[9px] font-black uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="col-span-3 break-all font-mono text-foreground">{value ?? "—"}</dd></div>
        ))}
      </dl>
      <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3"><p className="text-[9px] font-black uppercase text-muted-foreground">Raw payload</p><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[9px] text-foreground">{alert.rawPayload || "No raw payload supplied by backend."}</pre></div>
    </aside>
  );
}

export default IncidentDetail;
