import React, { useState, useMemo } from "react";
import { Alert, getAlertFusionMeta } from "../../types";
import { Copy, Check, Search, FileCode } from "lucide-react";

interface RawLogViewerProps {
  alert: Alert;
}

export function RawLogViewer({ alert }: RawLogViewerProps) {
  const meta = getAlertFusionMeta(alert);
  const [activeSubTab, setActiveSubTab] = useState<"conn" | "http" | "suricata">("conn");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const timestampEpoch = useMemo(() => {
    return Math.floor(new Date(alert.timestamp).getTime() / 1000);
  }, [alert.timestamp]);

  // Construct realistic raw contents
  const rawLogs = useMemo(() => {
    const origBytes = alert.zeekData?.origBytes || 320;
    const respBytes = alert.zeekData?.respBytes || 750;
    const origPkts = alert.zeekData?.origPkts || 8;
    const respPkts = alert.zeekData?.respPkts || 6;
    const uid = `Chs7${Math.random().toString(36).substring(2, 10)}`;

    const connLog = `{
  "ts": ${timestampEpoch}.0234,
  "uid": "${uid}",
  "id.orig_h": "${alert.sourceIp}",
  "id.orig_p": ${alert.sourcePort || 49152},
  "id.resp_h": "${alert.destinationIp || "10.0.12.15"}",
  "id.resp_p": ${alert.destinationPort},
  "proto": "${alert.protocol}",
  "service": "${alert.zeekData?.service || "http"}",
  "duration": "${alert.zeekData?.duration || "1.24s"}",
  "orig_bytes": ${origBytes},
  "resp_bytes": ${respBytes},
  "conn_state": "${alert.zeekData?.connState || "SF"}",
  "local_orig": true,
  "local_resp": false,
  "missed_bytes": 0,
  "history": "ShADadfF",
  "orig_pkts": ${origPkts},
  "orig_ip_bytes": ${origBytes + 160},
  "resp_pkts": ${respPkts},
  "resp_ip_bytes": ${respBytes + 120},
  "tunnel_parents": []
}`;

    const httpLog = `{
  "ts": ${timestampEpoch}.0456,
  "uid": "${uid}",
  "id.orig_h": "${alert.sourceIp}",
  "id.orig_p": ${alert.sourcePort || 41200},
  "id.resp_h": "${alert.destinationIp || "10.0.12.15"}",
  "id.resp_p": ${alert.destinationPort},
  "trans_depth": 1,
  "method": "${alert.zeekData?.method || "POST"}",
  "host": "${alert.destinationIp || "10.0.12.15"}",
  "uri": "${alert.zeekData?.uri || "/api/v1/auth/gateway"}",
  "referrer": "-",
  "version": "1.1",
  "user_agent": "${alert.zeekData?.userAgent || "Mozilla/5.0 (PentestBot/1.0; CLI)"}",
  "request_body_len": ${origBytes},
  "response_body_len": ${respBytes},
  "status_code": 200,
  "status_msg": "OK",
  "tags": ["anomalous_payload", "high_entropy"]
}`;

    const suricataEve = `{
  "timestamp": "${alert.timestamp}",
  "flow_id": 105230912440156,
  "in_iface": "eth0",
  "event_type": "alert",
  "src_ip": "${alert.sourceIp}",
  "src_port": ${alert.sourcePort || 49152},
  "dest_ip": "${alert.destinationIp || "10.0.12.15"}",
  "dest_port": ${alert.destinationPort},
  "proto": "${alert.protocol}",
  "alert": {
    "action": "allowed",
    "gid": 1,
    "signature_id": ${meta.suricataEvidence.replace(/[^0-9]/g, "") || "2010915"},
    "rev": 3,
    "signature": "${alert.suricataData?.signature || alert.attackType + " Attempt Detected (FCAJ Fusion Rule)"}",
    "category": "${alert.suricataData?.category || "Detection Mechanism Bypass Attempt"}",
    "severity": ${alert.severity === "Critical" ? 1 : alert.severity === "High" ? 2 : 3}
  },
  "payload_printable": "${alert.rawPayload || alert.payload || "GET /api/v1/user/auth HTTP/1.1\\r\\nUser-Agent: Go-client-X"}"
}`;

    return {
      conn: connLog,
      http: httpLog,
      suricata: suricataEve
    };
  }, [alert, timestampEpoch, meta.suricataEvidence]);

  const activeContent = rawLogs[activeSubTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlighting matching text simply in CSS/HTML render
  const renderedLines = useMemo(() => {
    const lines = activeContent.split("\n");
    if (!searchTerm.trim()) {
      return lines.map((l, i) => <div key={i}>{l}</div>);
    }
    const term = searchTerm.toLowerCase();
    return lines.map((l, i) => {
      if (l.toLowerCase().includes(term)) {
        return (
          <div key={i} className="bg-yellow-500/25 border-l-2 border-yellow-500 pl-1">
            {l}
          </div>
        );
      }
      return <div key={i}>{l}</div>;
    });
  }, [activeContent, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Target 15 Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            RAW LOG FORENSIC AUDIT
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Ingestion Stage Decoded Raw JSON Streams
          </h3>
        </div>
        <FileCode size={12} className="text-cyan-500 animate-pulse" />
      </div>

      {/* Tabs list inside Raw Code viewer */}
      <div className="bg-secondary/15 border border-border/50 rounded-xl overflow-hidden flex flex-col">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between bg-muted/40 p-2 border-b border-border select-none">
          <div className="flex bg-background border border-border/60 rounded p-0.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveSubTab("conn")}
              className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeSubTab === "conn" ? "bg-card text-cyan-500 border border-border/40 font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              conn.log
            </button>
            <button
              onClick={() => setActiveSubTab("http")}
              className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeSubTab === "http" ? "bg-card text-cyan-500 border border-border/40 font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              http.log
            </button>
            <button
              onClick={() => setActiveSubTab("suricata")}
              className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeSubTab === "suricata" ? "bg-card text-cyan-500 border border-border/40 font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              eve.json
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Local Search input */}
            <div className="relative leading-none">
              <input
                type="text"
                placeholder="Find in log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border border-border rounded pl-5 pr-1.5 py-0.5 text-[7.5px] font-mono text-foreground focus:outline-none focus:border-cyan-500/30"
              />
              <Search className="w-2.5 h-2.5 text-muted-foreground/50 absolute left-1.5 top-1.5" />
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1 cursor-pointer rounded border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
              title="Copy log payload"
            >
              {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
          </div>
        </div>

        {/* Scrollable code layout */}
        <div className="bg-zinc-950 p-3.5 font-mono text-[9px] text-[#22c55e] leading-relaxed max-h-65 overflow-y-auto custom-scrollbar select-text">
          {renderedLines}
        </div>
      </div>
    </div>
  );
}

export default RawLogViewer;
