import { useMemo, useState } from "react";
import { Check, Copy, FileCode, Search } from "lucide-react";
import { Alert } from "../../types";

type EvidenceTab = "conn" | "http" | "suricata" | "payload";

export function RawLogViewer({ alert }: { alert: Alert }) {
  const [activeTab, setActiveTab] = useState<EvidenceTab>("conn");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const evidence = useMemo<Record<EvidenceTab, string>>(() => ({
    conn: JSON.stringify({
      timestamp: alert.timestamp,
      source_ip: alert.sourceIp,
      source_port: alert.sourcePort ?? null,
      destination_ip: alert.destinationIp,
      destination_port: alert.destinationPort,
      protocol: alert.protocol,
      sensor_id: alert.zeekData.sensorId ?? null,
      correlation_id: alert.zeekData.correlationId ?? null,
      duration: alert.zeekData.duration ?? null,
      orig_bytes: alert.zeekData.origBytes ?? null,
      resp_bytes: alert.zeekData.respBytes ?? null,
      orig_pkts: alert.zeekData.origPkts ?? null,
      resp_pkts: alert.zeekData.respPkts ?? null,
      conn_state: alert.zeekData.connState ?? null,
      service: alert.zeekData.service ?? null,
    }, null, 2),
    http: JSON.stringify({
      timestamp: alert.timestamp,
      method: alert.zeekData.method ?? null,
      uri: alert.zeekData.uri ?? null,
      user_agent: alert.zeekData.userAgent ?? null,
    }, null, 2),
    suricata: JSON.stringify({
      timestamp: alert.timestamp,
      signature_id: alert.suricataData.signatureId ?? null,
      signature: alert.suricataData.signature ?? null,
      category: alert.suricataData.category ?? null,
      severity: alert.suricataData.severity ?? null,
    }, null, 2),
    payload: alert.rawPayload ?? alert.payload ?? "No raw payload supplied by backend.",
  }), [alert]);

  const activeContent = evidence[activeTab];
  const lines = activeContent.split("\n");
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const copy = async () => {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><span className="block text-[8px] font-black uppercase tracking-widest text-muted-foreground">Backend evidence</span><h3 className="mt-1 text-[10px] font-black uppercase text-cyan-500">Raw fields received for this alert</h3></div>
        <FileCode size={14} className="text-cyan-500" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-secondary/15">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 p-2">
          <div className="flex gap-1 rounded border border-border bg-background p-1">
            {(["conn", "http", "suricata", "payload"] as EvidenceTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded px-2 py-1 text-[8px] font-black uppercase ${activeTab === tab ? "bg-card text-cyan-500" : "text-muted-foreground"}`}>{tab}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 rounded border border-border bg-background px-2 py-1"><Search size={10} className="text-muted-foreground" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Find" className="w-28 bg-transparent text-[8px] outline-none" /></label>
            <button type="button" onClick={copy} className="rounded border border-border p-1.5 text-muted-foreground">{copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}</button>
          </div>
        </div>
        <div className="max-h-80 overflow-auto bg-zinc-950 p-4 font-mono text-[9px] leading-relaxed text-emerald-400">
          {lines.map((line, index) => <div key={`${index}-${line}`} className={normalizedSearch && line.toLowerCase().includes(normalizedSearch) ? "border-l-2 border-yellow-500 bg-yellow-500/20 pl-1" : ""}>{line}</div>)}
        </div>
      </div>
    </div>
  );
}

export default RawLogViewer;
