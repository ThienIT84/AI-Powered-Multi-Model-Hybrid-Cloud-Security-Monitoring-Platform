import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Search, 
  FileCode, 
  Layers, 
  Link2, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  RefreshCw,
  ExternalLink,
  TableProperties
} from "lucide-react";
import { NetworkLog, Severity } from "../network/NetworkConfig";

interface SuricataCenterProps {
  logs: NetworkLog[];
  onSelectFlow?: (log: NetworkLog) => void;
}

interface SuricataRule {
  sigId: string;
  ruleName: string;
  category: string;
  severity: Severity;
  firstSeen: string;
  lastSeen: string;
  matchedCount: number;
  description: string;
  linkedInicident: string;
  ruleSyntax: string;
}

export const SuricataCenter: React.FC<SuricataCenterProps> = ({ logs, onSelectFlow }) => {
  const [searchText, setSearchText] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Core structured Suricata dynamic database list
  const preloadedRules: SuricataRule[] = useMemo(() => {
    // Count exact matches from current live stream logs
    let scanCount = 0;
    let exfilCount = 0;
    let bruteCount = 0;
    let dosCount = 0;

    logs.forEach(l => {
      if (l.verdict === "ANOMALY") {
        const r = l.reason.toLowerCase();
        if (r.includes("scan") || l.id.includes("scan")) scanCount++;
        else if (r.includes("leak") || r.includes("exfil")) exfilCount++;
        else if (l.destPort === 22) bruteCount++;
        else dosCount++;
      }
    });

    return [
      {
        sigId: "2011042",
        ruleName: "SURICATA PORT SCAN / Sweep Probe recon",
        category: "Reconnaissance",
        severity: "MEDIUM",
        firstSeen: "12:14:03",
        lastSeen: logs.length > 0 ? logs[0].timestamp : "Just Now",
        matchedCount: scanCount + 4,
        description: "Detects multi-port reconnaissance sweep scans. Signature triggers when multiple TCP SYN requests are dispatched from a single IP to unique target host ports under 1.5 seconds.",
        linkedInicident: "Incident #42 (APT multi-stage exfiltration)",
        ruleSyntax: "alert tcp $EXTERNAL_NET any -> $HOME_NET [21,22,23,25,80,443] (msg:\"SURICATA TCP PORT SCAN DETECT\"; flags:S; threshold:type threshold, track by_src, count 8, seconds 2; sid:2011042; rev:3;)"
      },
      {
        sigId: "2408990",
        ruleName: "SURICATA PROMPT OUTBOUND DATA exfiltration postgres spill",
        category: "Data Exfiltration",
        severity: "CRITICAL",
        firstSeen: "18:32:15",
        lastSeen: logs.find(l => l.reason.toLowerCase().includes("leak") || l.reason.toLowerCase().includes("exfil"))?.timestamp || "18:32:15",
        matchedCount: exfilCount + 1,
        description: "Detects anomalous large volume byte transfer dispatches over unexpected encrypted channels. Triggers when outbound TCP packets exceed normal transfer baseline ratios on unusual destination IPs.",
        linkedInicident: "Incident #42 (APT multi-stage exfiltration)",
        ruleSyntax: "alert tcp $HOME_NET any -> $EXTERNAL_NET 443 (msg:\"SURICATA MULTIVALUATE LARGE OUTBOUND EXFIL\"; content:\"|1f 8b 08|\"; dsize:>5000000; sid:2408990; rev:1;)"
      },
      {
        sigId: "2022411",
        ruleName: "SURICATA SSH BRUTEFORCE auth multi-fail root login",
        category: "Credential Access",
        severity: "HIGH",
        firstSeen: "18:05:40",
        lastSeen: logs.find(l => l.destPort === 22 && l.verdict === "ANOMALY")?.timestamp || "18:05:44",
        matchedCount: bruteCount + 11,
        description: "Detects extreme continuous authorization failures matching aggressive SSH root automated brute force script behaviors. Designed to catch rapid credential dictionary guesses.",
        linkedInicident: "Incident #42 (APT multi-stage exfiltration)",
        ruleSyntax: "alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:\"SURICATA SSH BRUTE FORCE ATTENT\"; flow:established,to_server; content:\"Failed password\"; threshold:type threshold, track by_src, count 10, seconds 20; sid:2022411; rev:5;)"
      },
      {
        sigId: "2019844",
        ruleName: "SURICATA TCP SYN FLOOD attack volume overflow",
        category: "Denial of Service",
        severity: "HIGH",
        firstSeen: "14:15:22",
        lastSeen: logs.length > 0 ? logs[logs.length - 1].timestamp : "Earlier Today",
        matchedCount: dosCount + 2,
        description: "Detects severe high-volume flood attacks overflowing target server connection queues via synthetic TCP/IP handshakes, rendering web frontends unstable.",
        linkedInicident: "Unassigned Event Alert",
        ruleSyntax: "alert ip any any -> $HOME_NET any (msg:\"SURICATA TCP FLOOD REQ OVERFLOW\"; flow:stateless; threshold:type rate, track by_dst, count 1000, seconds 1; sid:2019844; rev:2;)"
      }
    ];
  }, [logs]);

  // Handle Search and Filter Rules
  const filteredRules = useMemo(() => {
    return preloadedRules.filter(r => {
      // 1. Search text
      const nameMatch = r.ruleName.toLowerCase().includes(searchText.toLowerCase()) || 
                        r.sigId.includes(searchText) || 
                        r.category.toLowerCase().includes(searchText.toLowerCase());
      if (!nameMatch) return false;

      // 2. Severity Filter
      if (severityFilter !== "ALL" && r.severity !== severityFilter) return false;

      // 3. Category Filter
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;

      return true;
    });
  }, [preloadedRules, searchText, severityFilter, categoryFilter]);

  // Find Selected Rule DETAILS
  const activeRuleDetails = useMemo(() => {
    return preloadedRules.find(r => r.sigId === selectedRuleId) || null;
  }, [preloadedRules, selectedRuleId]);

  // Find flows matching active rule
  const matchedFlows = useMemo(() => {
    if (!selectedRuleId) return [];

    return logs.filter(l => {
      if (l.verdict !== "ANOMALY") return false;
      const rName = activeRuleDetails?.ruleName.toLowerCase() || "";
      const reason = l.reason.toLowerCase();

      if (rName.includes("scan") && (reason.includes("scan") || l.id.includes("scan"))) return true;
      if (rName.includes("exfil") && (reason.includes("leak") || reason.includes("exfil"))) return true;
      if (rName.includes("bruteforce") && l.destPort === 22) return true;
      if (rName.includes("flood") && !reason.includes("scan") && !reason.includes("leak") && l.destPort !== 22) return true;

      return false;
    });
  }, [selectedRuleId, logs, activeRuleDetails]);

  return (
    <div className="bg-card dark:bg-slate-950 border border-border dark:border-slate-900 rounded-lg p-4 shadow-sm text-foreground dark:text-slate-100 font-mono space-y-4 text-[11px]" id="suricata-center-root">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border dark:border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <span className="text-[9px] text-muted-foreground dark:text-slate-500 font-bold block uppercase tracking-widest leading-none">SIGNATURE IDS CORRELATION SYSTEM</span>
            <h3 className="text-xs font-black text-foreground dark:text-slate-200 uppercase tracking-widest">
              SURICATA EVIDENCE ANALYSIS CENTER
            </h3>
          </div>
        </div>
        <div className="text-[9.5px] text-muted-foreground dark:text-slate-500 leading-none">
          Rule-database references checked on <span className="text-rose-600 dark:text-rose-450 font-black">Zeek feeds</span>
        </div>
      </div>

      {/* Filter Toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/40 dark:bg-slate-900/40 p-2 rounded border border-border dark:border-slate-900 text-[10px]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground dark:text-slate-600" />
          <input 
            type="text" 
            placeholder="Search Signature IP, Rules, Cate..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-7 pr-2 py-1.5 bg-background dark:bg-slate-950 border border-border dark:border-slate-800 rounded focus:outline-none focus:border-rose-500 text-foreground dark:text-slate-300 w-52 text-[10px]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Seve Selection */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background dark:bg-slate-955 border border-border dark:border-slate-800 rounded py-1.5 px-2 text-foreground dark:text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer text-[10px]"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>

          {/* Cate Selection */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background dark:bg-slate-955 border border-border dark:border-slate-800 rounded py-1.5 px-2 text-foreground dark:text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer text-[10px]"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="Reconnaissance">Reconnaissance</option>
            <option value="Credential Access">Credential Access</option>
            <option value="Data Exfiltration">Exfiltration</option>
            <option value="Denial of Service">Denial of Service (DoS)</option>
          </select>
        </div>
      </div>

      {/* TABLE GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Signatures List Column */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-[9px] font-bold text-muted-foreground dark:text-slate-500 uppercase tracking-widest pl-1">
            DEPLOYED SIGNATURE ALERTS ({filteredRules.length} MATCHES)
          </div>

          <div className="overflow-x-auto border border-border dark:border-slate-900 rounded bg-muted/20 dark:bg-slate-955/40 custom-scrollbar max-h-72.5">
            <table className="w-full text-left border-collapse truncate">
              <thead className="bg-secondary dark:bg-slate-900 text-[8.5px] uppercase font-bold text-muted-foreground dark:text-slate-500 border-b border-border dark:border-slate-900">
                <tr>
                  <th className="px-3 py-2">Signature ID</th>
                  <th className="px-3 py-2">Rule Shorthand Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-center">Severity</th>
                  <th className="px-3 py-2 text-right">Inferences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 dark:divide-slate-900/40 text-[9.5px]">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground dark:text-slate-500 italic">
                      No matching Suricata rules discovered.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((r) => {
                    const isSelected = r.sigId === selectedRuleId;

                    return (
                      <tr 
                        key={r.sigId}
                        onClick={() => setSelectedRuleId(isSelected ? null : r.sigId)}
                        className={`hover:bg-secondary/40 dark:hover:bg-slate-900/60 cursor-pointer transition-colors ${
                          isSelected ? "bg-red-500/5 dark:bg-red-950/15" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 text-muted-foreground dark:text-slate-400 font-extrabold">{r.sigId}</td>
                        <td className="px-3 py-2.5 font-bold text-foreground dark:text-slate-200 block max-w-52.5 truncate" title={r.ruleName}>
                          {r.ruleName.replace("SURICATA ", "")}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground/80 dark:text-slate-400">{r.category}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-1 rounded text-[8.5px] font-black ${
                            r.severity === "CRITICAL" 
                              ? "bg-red-500/10 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-500/20 dark:border-red-500/10 animate-pulse" 
                              : r.severity === "HIGH" 
                              ? "bg-orange-500/10 dark:bg-orange-950 text-orange-600 dark:text-orange-400" 
                              : "bg-blue-500/10 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          }`}>
                            {r.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-black text-rose-600 dark:text-rose-450">{r.matchedCount} triggers</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Details expansion Column */}
        <div className="lg:col-span-5">
          {activeRuleDetails ? (
            <div className="bg-secondary/15 dark:bg-slate-900/35 border border-border dark:border-slate-850 p-3.5 rounded-lg space-y-3.5 animate-fade-in text-[10.5px]">
              <div>
                <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-1.5 mb-1 text-[9px] uppercase font-bold text-muted-foreground dark:text-slate-500">
                  <span>SURICATA RULE DEFINITION</span>
                  <span className="text-rose-600 dark:text-red-450">SIG# {activeRuleDetails.sigId}</span>
                </div>
                <h4 className="font-extrabold text-foreground dark:text-slate-100 uppercase mt-1 leading-snug">{activeRuleDetails.ruleName}</h4>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-slate-500">Security Category:</span>
                  <span className="font-bold text-foreground dark:text-slate-200">{activeRuleDetails.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-slate-500">Linked Incident:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-500">{activeRuleDetails.linkedInicident}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-slate-500">First / Last Seen:</span>
                  <span className="font-mono text-muted-foreground dark:text-slate-400">{activeRuleDetails.firstSeen} / {activeRuleDetails.lastSeen}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-muted-foreground dark:text-slate-500 uppercase tracking-widest block">Signature Description:</span>
                <p className="bg-background/80 dark:bg-slate-950/90 p-2 border border-border dark:border-slate-900 rounded font-sans leading-normal text-muted-foreground dark:text-slate-300 text-[10.5px]">
                  {activeRuleDetails.description}
                </p>
              </div>

              {/* Rule Syntax Syntax */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-muted-foreground dark:text-slate-500 uppercase tracking-widest block">Snort/Suricata Rule Code:</span>
                <pre className="p-2 bg-muted dark:bg-black/80 rounded border border-border dark:border-slate-800 text-emerald-650 dark:text-emerald-455 text-[9px] leading-tight select-all overflow-x-auto font-mono">
                  {activeRuleDetails.ruleSyntax}
                </pre>
              </div>

              {/* MATCHED FLOWS DIRECT LIST */}
              <div className="space-y-1.5 border-t border-border dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between text-[8px] font-bold text-muted-foreground dark:text-slate-500 uppercase">
                  <span>Matched Flows ({matchedFlows.length})</span>
                  <span>Click flow to Audit</span>
                </div>

                <div className="space-y-1 max-h-25 overflow-y-auto custom-scrollbar pr-1">
                  {matchedFlows.length === 0 ? (
                    <span className="text-[9px] text-muted-foreground dark:text-slate-500 italic block text-center py-2">
                      Injected parameters triggered signatures are not captured in active workspace logs.
                    </span>
                  ) : (
                    matchedFlows.map((flow) => (
                      <div 
                        key={flow.id} 
                        onClick={() => onSelectFlow && onSelectFlow(flow)}
                        className="bg-background/80 dark:bg-slate-955/80 p-1.5 rounded border border-border dark:border-slate-900 flex justify-between items-center text-[9.5px] hover:border-red-500/30 cursor-pointer transition-colors"
                      >
                        <span className="font-extrabold text-muted-foreground dark:text-slate-400 font-mono text-[9px] truncate max-w-30">{flow.id}</span>
                        <span className="text-foreground/90 dark:text-slate-200 font-bold">{flow.srcIp} -> {flow.destIp}</span>
                        <span className="text-red-650 dark:text-red-400 font-bold font-mono">{flow.threatScore}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/15 dark:bg-slate-900/10 border border-border dark:border-slate-900 border-dashed rounded-lg p-10 text-center text-muted-foreground/80 dark:text-slate-550 flex flex-col items-center justify-center gap-2 h-full min-h-72.5" id="suricata-center-fallback">
              <TableProperties size={24} className="text-muted-foreground/60 dark:text-slate-800 animate-pulse" />
              <span>SELECT A SURICATA SIGNATURE RULE ROW IN THE LEFT TABLE TO AUDIT ITS INTERNAL DETAILS AND MATCHED TELEMETRY FLOWS.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
