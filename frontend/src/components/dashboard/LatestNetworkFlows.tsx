import React, { useMemo } from "react";
import { Activity, ArrowRight, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { NetworkFlow } from "../../types";

interface LatestNetworkFlowsProps {
  flows: NetworkFlow[];
  isConnected: boolean;
}

const MAX_VISIBLE_FLOWS = 20;

function endpoint(ip: string, port?: number | null): string {
  return port == null || port === 0 ? ip : `${ip}:${port}`;
}

function formatTimestamp(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp || "--";
  return parsed.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

export const LatestNetworkFlows: React.FC<LatestNetworkFlowsProps> = React.memo(({
  flows,
  isConnected,
}) => {
  const displayedFlows = useMemo(() => flows.slice(0, MAX_VISIBLE_FLOWS), [flows]);
  const counts = useMemo(() => ({
    normal: flows.filter((flow) => flow.verdict === "NORMAL").length,
    anomaly: flows.filter((flow) => flow.verdict === "ANOMALY").length,
  }), [flows]);

  return (
    <section className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4" id="latest-network-flows">
      <header className="flex flex-col gap-3 border-b border-border/20 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-500">
            <Activity size={14} />
          </div>
          <div>
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              Live Network Traffic (Latest 20)
            </h3>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Normal and anomalous flows observed by the real Zeek pipeline
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[8px] font-black uppercase tracking-wide">
          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-500">
            <CheckCircle2 size={10} /> Normal {counts.normal}
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-500">
            <ShieldAlert size={10} /> Anomaly {counts.anomaly}
          </span>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/5">
        <div className="overflow-x-auto">
          <table className="min-w-250 w-full border-collapse text-left font-mono text-[9px]">
            <thead>
              <tr className="select-none border-b border-border/40 bg-muted/40 text-[8px] font-black uppercase text-muted-foreground">
                <th className="w-42 p-3">Timestamp</th>
                <th className="p-3">Source</th>
                <th className="w-8 p-1" aria-label="Direction" />
                <th className="p-3">Destination</th>
                <th className="w-28 p-3">Protocol / Service</th>
                <th className="w-24 p-3 text-right">Volume</th>
                <th className="w-20 p-3 text-right">Packets</th>
                <th className="w-24 p-3 text-center">Verdict</th>
                <th className="w-24 p-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {displayedFlows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center italic text-muted-foreground">
                    No Zeek network flows have been ingested yet. This table only shows real backend telemetry.
                  </td>
                </tr>
              ) : displayedFlows.map((flow) => {
                const anomaly = flow.verdict === "ANOMALY";
                return (
                  <tr key={`${flow.id}:${flow.timestamp}`} className="transition-colors hover:bg-muted/10">
                    <td className="whitespace-nowrap p-3 text-[8.5px] font-medium text-muted-foreground" title={flow.timestamp}>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={11} className="text-zinc-500" />
                        {formatTimestamp(flow.timestamp)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 font-semibold text-foreground">
                      {endpoint(flow.srcIp, flow.srcPort)}
                    </td>
                    <td className="p-1 text-center text-cyan-500">
                      <ArrowRight size={12} />
                    </td>
                    <td className="whitespace-nowrap p-3 font-semibold text-foreground">
                      {endpoint(flow.dstIp, flow.dstPort)}
                    </td>
                    <td className="p-3 uppercase text-muted-foreground">
                      <span className="font-black text-foreground">{flow.protocol || "--"}</span>
                      <span className="ml-1 text-[8px]">/ {flow.service || flow.source}</span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-right font-semibold text-foreground">
                      {formatVolume(flow.bytes)}
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground">{flow.packets}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex min-w-18 items-center justify-center gap-1 rounded border px-2 py-0.5 text-[8px] font-black tracking-wide ${
                        anomaly
                          ? "border-red-500/25 bg-red-500/15 text-red-500"
                          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {anomaly ? <ShieldAlert size={9} /> : <CheckCircle2 size={9} />}
                        {flow.verdict}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-black ${anomaly ? "text-red-500" : "text-emerald-500"}`}>
                      {flow.anomalyScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border/10 pt-2.5 font-mono text-[7.5px] font-bold uppercase leading-none text-zinc-500">
        <span>{flows.length} retained backend flow{flows.length === 1 ? "" : "s"}</span>
        <span className={isConnected ? "text-emerald-500" : "text-amber-500"}>
          {isConnected ? "Live socket stream bound" : "Waiting for live socket"}
        </span>
      </footer>
    </section>
  );
});

LatestNetworkFlows.displayName = "LatestNetworkFlows";
