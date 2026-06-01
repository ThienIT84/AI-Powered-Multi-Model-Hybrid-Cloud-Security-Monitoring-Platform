import React, { useState, useMemo } from "react";
import { 
  Search, 
  Save, 
  Play, 
  Trash2, 
  ZoomIn, 
  Hourglass, 
  ShieldAlert, 
  Grid, 
  MapPin, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  Info,
  ChevronRight,
  HelpCircle,
  Clock
} from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface ThreatHuntingPanelProps {
  logs: NetworkLog[];
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
}

export const ThreatHuntingPanel: React.FC<ThreatHuntingPanelProps> = ({ logs }) => {
  // 1. THREAT HUNTING SPACE: Query states
  const [huntRuleIP, setHuntRuleIP] = useState("");
  const [huntRuleRisk, setHuntRuleRisk] = useState("50");
  const [huntRuleProto, setHuntRuleProto] = useState("ALL");
  const [huntRuleAttackType, setHuntRuleAttackType] = useState("ALL");
  const [searchResults, setSearchResults] = useState<NetworkLog[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([
    { id: "q-1", name: "High Risk SSH Recon", query: "SourceIP = 192.168.1.109 AND RiskScore >= 75 AND Port = 22" },
    { id: "q-2", name: "External China Exfiltration", query: "Country = CN AND RiskScore > 90 AND Protocol = TCP" },
    { id: "q-3", name: "Tor Socks Tunnel Sweeps", query: "Port = 9001 AND AnomalyState = TRUE" }
  ]);

  // 2. TIMELINE ZOOM STATE multiplier
  const [timelineZoom, setTimelineZoom] = useState(1.0);

  // 3. MITRE ATT&CK DRAWER
  const [selectedMitre, setSelectedMitre] = useState<string | null>(null);

  // MITRE attack mapped items
  const mitreMapping = [
    { code: "T1046", name: "Network Service Scanning", tier: "Reconnaissance", mappedAttack: "Port Scan", details: "Adversaries probe a host network subnet to determine service availability. Probes are identified via high-frequency syn-packets across unique dest ports.", mitigation: "Implement stateful edge firewalls, block rapid scanners, and deploy decoy port honey pots." },
    { code: "T1110", name: "Brute Force Auth Probes", tier: "Credential Access", mappedAttack: "Brute Force", details: "Attempts to guess auth logins on corporate SSH port 22. Multiple rapid authorization retries trigger automatic fail2ban edge sweeps.", mitigation: "Enforce SSH public-key authentication, limit connection rates, and implement active host blocking." },
    { code: "T1498", name: "Network Denial of Service (DoS)", tier: "Impact", mappedAttack: "DoS", details: "Flooding target servers with excessive synthetic packet headers. Overwhelms network pipe interfaces causing packet drops.", mitigation: "Deploy high-capacity hardware DDoS scrubbers, configure rate limits on internal routers, and use CDN proxying." },
    { code: "T1071", name: "Application Layer Protocols (C2)", tier: "Command and Control", mappedAttack: "Botnet Connection", details: "Tunneling encrypted remote access shell command payloads over known proxy endpoints or Tor Socks relays on destination port 9001.", mitigation: "Block all unauthorized outbound proxy networks (Tor exit relays directory) and enforce strict Deep Packet Inspection guidelines." }
  ];

  const activeMitreDetail = useMemo(() => {
    return mitreMapping.find(m => m.code === selectedMitre) || null;
  }, [selectedMitre]);

  // Execute Threat Hunt Query simulation
  const handleExecuteHunt = () => {
    const results = logs.filter(l => {
      const matchIP = !huntRuleIP || l.srcIp.includes(huntRuleIP) || l.destIp.includes(huntRuleIP);
      const matchRisk = l.threatScore >= parseInt(huntRuleRisk);
      const matchProto = huntRuleProto === "ALL" || l.protocol === huntRuleProto;
      
      let matchAttack = true;
      if (huntRuleAttackType !== "ALL") {
        const attackStr = huntRuleAttackType.toLowerCase();
        if (attackStr === "normal") {
          matchAttack = l.verdict === "NORMAL";
        } else {
          matchAttack = l.verdict === "ANOMALY" && l.reason.toLowerCase().includes(attackStr);
        }
      }

      return matchIP && matchRisk && matchProto && matchAttack;
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  // Copy Query helper
  const handleLoadSavedQuery = (q: SavedQuery) => {
    // Basic parser
    const ipMatch = q.query.match(/SourceIP = ([a-fA-F0-9.:]+)/);
    const riskMatch = q.query.match(/RiskScore >=* (\d+)/);
    const protoMatch = q.query.match(/Protocol = (\w+)/);
    const portMatch = q.query.match(/Port = (\d+)/);

    if (ipMatch) setHuntRuleIP(ipMatch[1]);
    if (riskMatch) setHuntRuleRisk(riskMatch[1]);
    if (protoMatch) setHuntRuleProto(protoMatch[1].toUpperCase());
    if (portMatch && portMatch[1] === "22") setHuntRuleAttackType("RECON");
    
    // Auto execute query simulator
    handleExecuteHunt();
  };

  const handleSaveQuery = () => {
    if (!saveName.trim()) return;
    const ruleStr = `SourceIP = ${huntRuleIP || "ANY"} AND RiskScore >= ${huntRuleRisk} AND Protocol = ${huntRuleProto} AND Class = ${huntRuleAttackType}`;
    const newQ: SavedQuery = {
      id: `q-${Date.now()}`,
      name: saveName,
      query: ruleStr
    };
    setSavedQueries(prev => [...prev, newQ]);
    setSaveName("");
  };

  const handleDeleteQuery = (id: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== id));
  };

  // 4. TIMELINE SEQUENCING DATA
  const attackSteps = [
    { time: "18:00:12", event: "Recon Sweep Detected", desc: "Suspicious port-scan probes triggered from source node 185.190.240.8 (Russia Proxy)", severity: "MEDIUM", type: "Port Scan" },
    { time: "18:05:44", event: "Brute Force Authentication Path", desc: "45 continuous rapid invalid authentication attempts logged on SSH target host 10.0.12.3 (PostgreSQL Core)", severity: "HIGH", type: "Brute Force" },
    { time: "18:15:30", event: "Tor Control Node Establishes Shell", desc: "UDP/DNS tunneling commands detected establishing C2 socket connections to Tor Proxy Exit Server 185.220.101.5", severity: "HIGH", type: "Botnet" },
    { time: "18:24:01", event: "Host Buffer Overflow Activity", desc: "Exploit attempt payload signature verified in raw payload hex maps.", severity: "CRITICAL", type: "DoS / Exploit" },
    { time: "18:32:15", event: "Mass Database Exfiltration Spill", desc: "Anomalous 156MB compressed database bucket traffic spill launched from local DB nodes out to external server IP 45.227.254.12", severity: "CRITICAL", type: "Botnet (Exfiltration)" }
  ];

  // 5. SERVICE HEATMAP (24h log activity density grid)
  // Mapping 6 hour slots vs Services
  const hourSlots = ["00:00 - 06:00 (Night)", "06:00 - 12:00 (Morning)", "12:00 - 18:00 (Afternoon)", "18:00 - 00:00 (Evening)"];
  const serviceHeatmapGrid = useMemo(() => {
    // Generate static values overlayed with active metrics depending on log sizes:
    const activeThreatsCount = logs.filter(l => l.verdict === "ANOMALY").length;
    return [
      { service: "HTTPS", slot0: 12, slot1: 85, slot2: 98, slot3: 74 },
      { service: "HTTP", slot0: 4, slot1: 42, slot2: 56, slot3: 31 },
      { service: "SSH (Port 22)", slot0: activeThreatsCount > 5 ? 45 : 2, slot1: 1, slot2: 12, slot3: activeThreatsCount > 4 ? 88 : 8 },
      { service: "DNS (Port 53)", slot0: 5, slot1: 104, slot2: 156, slot3: 90 },
      { service: "Botnet Proxy (9001)", slot0: activeThreatsCount > 6 ? 92 : 0, slot1: 0, slot2: 1, slot3: activeThreatsCount > 3 ? 41 : 2 },
      { service: "FTP Control", slot0: 0, slot1: 4, slot2: 14, slot3: 1 },
      { service: "ICMP Diagnostic", slot0: 1, slot1: 8, slot2: 10, slot3: 4 }
    ];
  }, [logs]);

  const getHeatmapColor = (volume: number) => {
    if (volume === 0) return "bg-slate-950 text-slate-700 hover:border-slate-800";
    if (volume < 5) return "bg-emerald-950/20 text-emerald-500 border-emerald-950/20";
    if (volume < 20) return "bg-emerald-950/50 text-emerald-400 border-emerald-800/40";
    if (volume < 50) return "bg-amber-950/30 text-amber-500 border-amber-800/20";
    if (volume < 85) return "bg-amber-950/60 text-amber-400 border-amber-500/30";
    return "bg-red-950/60 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)] ring-1 ring-red-500/20 animate-pulse";
  };

  // FORENSIC EXPORTS (Simulate actual downloads or copies)
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const triggerDownload = (format: "csv" | "json" | "pdf") => {
    let payload = "";
    if (format === "json") {
      payload = JSON.stringify(logs.slice(0, 15), null, 2);
    } else if (format === "csv") {
      payload = "Timestamp,UID,Protocol,Source IP,Dest IP,Orig Bytes,Verdict,Threat Score\n" + 
        logs.slice(0, 10).map(l => `${l.timestamp},${l.id},${l.protocol},${l.srcIp},${l.destIp},${l.origBytes},${l.verdict},${l.threatScore}`).join("\n");
    } else {
      payload = `=== SIEM EXECUTIVE FORENSICS SUM-TOTAL REPORT ===\nGenerated On: 2026-05-31\nTotal Flows Monitored: ${logs.length * 12 + 1044}\nAnomalous Incidents Captured: ${logs.filter(l => l.verdict === "ANOMALY").length}\nVerdict: Suspicious Recon Sequences observed in training dataset.`;
    }

    // copy to clipboard and notify
    navigator.clipboard.writeText(payload);
    setDownloadFeedback(`SUCCESS: Forensic dataset exported [${format.toUpperCase()} copied to clipboard]`);
    setTimeout(() => setDownloadFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono" id="threat-hunting-panel-root">
      
      {/* ROW 1: FORENSICS EXPORTS CONTROL AND INCIDENT CORRELATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Export & Forensic Hub */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                SIEM FORENSICS DISCOVERY & EXPORT HUB
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-sans mb-3">
              SOC compliant payload backup triggers. Download active filtered subnets, threat hunting metrics, or incident telemetry.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => triggerDownload("csv")}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/20 rounded flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">Export CSV</span>
              </button>
              
              <button 
                onClick={() => triggerDownload("json")}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/20 rounded flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group transition-colors"
              >
                <FileJson className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">JSON Stream</span>
              </button>

              <button 
                onClick={() => triggerDownload("pdf")}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/20 rounded flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group transition-colors"
              >
                <FileText className="w-4 h-4 text-rose-450 group-hover:scale-110 transition-transform" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">PDF Report</span>
              </button>
            </div>
          </div>

          <div className="mt-3">
            {downloadFeedback && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 p-2 text-[8px] uppercase font-black text-center rounded animate-fade-in">
                {downloadFeedback}
              </div>
            )}
            {!downloadFeedback && (
              <span className="text-[8.5px] text-slate-500 text-center block leading-none">
                Copy forensic JSON configurations for direct SIEM integration
              </span>
            )}
          </div>
        </div>

        {/* Incident Correlation Preview widget */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                INCIDENT CORRELATION ALERT LINK (INCIDENT #42)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-2 text-[10px]">
              <div className="md:col-span-8 space-y-1.5 font-sans">
                <p className="text-slate-300 leading-normal">
                  Our correlation engine identified a cluster of anomalous flows sharing high risk indices mapping directly to <strong className="text-amber-400 font-mono">Incident #42: "Multi-stage APT database raid."</strong>
                </p>
                <div className="text-[9px] font-mono text-slate-500 flex flex-wrap gap-2 uppercase">
                  <span>Owner: Analyst-09</span>
                  <span>•</span>
                  <span>Status: Active Investigation</span>
                  <span>•</span>
                  <span>Risk: Critical</span>
                </div>
              </div>

              <div className="md:col-span-4 bg-slate-900 border border-slate-850 p-2.5 rounded font-mono text-[9px] flex flex-col justify-between">
                <div>
                  <span className="text-slate-500 font-extrabold uppercase text-[8px] block">Triggering Flow limits:</span>
                  <span className="text-slate-200 font-bold block">156 MB Data Leak</span>
                  <span className="text-red-400 block font-bold">Heuristics Score 98%</span>
                </div>
                <button 
                  onClick={() => alert("Simulating link to Alert details: Incident #42 context has been marked priority.")}
                  className="mt-2 w-full py-1 text-center bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[8.5px] font-black uppercase rounded cursor-pointer"
                >
                  Inspect Incident #42
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/10 p-1.5 rounded text-[8px] text-amber-500 mt-2 flex justify-between items-center font-sans font-medium">
            <span>Playbooks executed: APT-Containment-SSH, Exfiltration-IP-Drop.</span>
            <span className="font-mono text-[8px] font-bold">Active</span>
          </div>
        </div>

      </div>

      {/* ROW 2: THREAT HUNTING LOUNGE (QUERY BUILDER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Query Builder */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <div className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                ZEEK CONN.LOG THREAT HUNTING LOGS BUILDER
              </h3>
            </div>
            <span className="text-[8.5px] text-slate-500 uppercase font-black">Interactive Heuristics Search</span>
          </div>

          {/* Query Filters row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            <div>
              <label className="text-slate-500 font-bold block mb-1">Target Endpoint / IP:</label>
              <input 
                type="text" 
                placeholder="e.g. 10.0.12.3"
                value={huntRuleIP}
                onChange={(e) => setHuntRuleIP(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 py-1.5 px-2 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">Risk Threshold Score: ({huntRuleRisk})</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={huntRuleRisk}
                onChange={(e) => setHuntRuleRisk(e.target.value)}
                className="w-full accent-emerald-500 mt-2 cursor-pointer h-1.5 bg-slate-900 rounded-full appearance-none"
              />
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">Protocol Identifier:</label>
              <select 
                value={huntRuleProto}
                onChange={(e) => setHuntRuleProto(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 py-1.5 px-2 rounded text-slate-200 focus:outline-none focus:border-emerald-505 cursor-pointer"
              >
                <option value="ALL">ALL PROTOCOLS</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-bold block mb-1">AI Classification Type:</label>
              <select 
                value={huntRuleAttackType}
                onChange={(e) => setHuntRuleAttackType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 py-1.5 px-2 rounded text-slate-200 focus:outline-none focus:border-emerald-505 cursor-pointer"
              >
                <option value="ALL">ALL (Anomalous & Clean)</option>
                <option value="NOMAL">Clean-Only (Normal)</option>
                <option value="SCAN">Port Scan / Recon</option>
                <option value="LEAK">Botnet (Exfiltration)</option>
                <option value="SSH">SSH Brute Force</option>
              </select>
            </div>
          </div>

          {/* Action Query and interactive input */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900/60">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Save current query name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="bg-slate-900 border border-slate-800 py-1 px-2 text-[10px] rounded text-slate-205 focus:outline-none focus:border-cyan-500 w-44"
              />
              <button 
                onClick={handleSaveQuery}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-820 border border-slate-800 rounded text-[9px] text-slate-300 hover:text-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Save className="w-3 h-3" /> Save Hunt
              </button>
            </div>

            <button 
              onClick={handleExecuteHunt}
              className="px-4 py-1.5 bg-emerald-505 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Execute Zeek Hunt
            </button>
          </div>

          {/* Results Display Pane */}
          {hasSearched && (
            <div className="bg-slate-950 rounded border border-slate-900 p-2 text-[10px] animate-fade-in space-y-2">
              <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex justify-between">
                <span>QueryResult Database Query Results</span>
                <span className="text-emerald-505">{searchResults.length} Match flows discovered</span>
              </div>

              <div className="max-h-35 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-slate-500 italic text-[9px] py-4 text-center">
                    No log packets matched search query. Broaden standard risk boundaries.
                  </div>
                ) : (
                  searchResults.slice(0, 10).map((res) => (
                    <div key={res.id} className="bg-slate-900/40 p-1.5 rounded border border-slate-900 flex items-center justify-between text-[9px]">
                      <div>
                        <span className="font-extrabold text-slate-400">{res.id}</span>
                        <span className="text-slate-500 ml-2">{res.srcIp} → {res.destIp}</span>
                        <span className="text-slate-000 ml-2 bg-slate-800 px-1 py-0.2 rounded font-black text-[8px]">{res.protocol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-black">Threat: {res.threatScore}</span>
                        <span className="text-slate-500">{res.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saved queries */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
              <span>SAVED HUNT QUERIES</span>
              <span className="text-[8px] text-slate-500 uppercase">{savedQueries.length} Registrations</span>
            </div>

            <div className="space-y-1.5">
              {savedQueries.map((q) => (
                <div 
                  key={q.id} 
                  className="bg-slate-900/60 p-2 rounded border border-slate-850 hover:border-emerald-505/30 hover:bg-slate-900 flex items-start justify-between gap-2 group transition-all"
                >
                  <div 
                    onClick={() => handleLoadSavedQuery(q)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="text-[10px] font-black text-slate-250 flex items-center gap-1 group-hover:text-emerald-450">
                      <ChevronRight className="w-3 h-3" />
                      {q.name}
                    </div>
                    <code className="text-[8px] text-slate-500 leading-normal block max-h-7.5 overflow-hidden truncate mt-0.5">
                      {q.query}
                    </code>
                  </div>

                  <button 
                    onClick={() => handleDeleteQuery(q.id)}
                    className="text-slate-600 hover:text-red-400 p-0.5 rounded cursor-pointer self-center"
                    title="Delete saved trigger"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8px] text-slate-500 mt-2 text-center uppercase">
            Click target query block to execute parameter presets
          </p>
        </div>

      </div>

      {/* ROW 3: RECONSTRUCTED TIMELINE AND HEATMAP GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Attack stages timeline */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  ATTACK TIMELINE RECONSTRUCTION & ZOOM MATRIX
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] text-slate-550 font-bold uppercase">Zoom Factor:</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.5" 
                  step="0.5" 
                  value={timelineZoom}
                  onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
                  className="w-16 accent-cyan-500 h-1 cursor-pointer bg-slate-900 rounded-full appearance-none"
                />
                <span className="text-[9px] text-cyan-400">{timelineZoom.toFixed(1)}x</span>
              </div>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 pl-4 space-y-4 pt-1 pb-1">
              {attackSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="relative group transition-all duration-300"
                  style={{ marginBottom: `${12 * timelineZoom}px` }}
                >
                  {/* Timeline bullet */}
                  <span className={`absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                    step.severity === "CRITICAL" ? "bg-red-500 ring-2 ring-red-500/10" : step.severity === "HIGH" ? "bg-amber-500" : "bg-cyan-500"
                  }`} />

                  <div className="text-[9.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-550 font-extrabold">{step.time}</span>
                      <span className={`text-[8px] font-black px-1 rounded ${
                        step.severity === "CRITICAL" ? "bg-red-950/40 text-red-400" : step.severity === "HIGH" ? "bg-amber-950/20 text-amber-500" : "bg-cyan-950 text-cyan-400"
                      }`}>{step.severity}</span>
                      <strong className="text-slate-100 uppercase tracking-tight font-black">{step.event}</strong>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400 mt-0.5 leading-normal max-w-120">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded text-[8.5px] text-slate-500 mt-2">
            Chronological stages mapped dynamically using multi-vector Zeek correlations.
          </div>
        </div>

        {/* Hour heatmap grid */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 border-b border-slate-900 pb-1.5">
            <Grid className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              SERVICE ACTIVITY HEATMAP (HOUR VS SERVICE)
            </h3>
          </div>
          <p className="text-[9.5px] text-slate-400 pb-2 leading-normal font-sans">
            Saturated boxes indicate heavy packet volume metrics over specific hour ranges. Uncovers midnight probes or sweep campaigns instantly.
          </p>

          <div className="grid grid-cols-5 gap-1 pt-1.5 font-mono text-[8.5px] font-bold">
            {/* Header row slots */}
            <div className="text-slate-500 uppercase font-black">Service</div>
            <div className="text-center text-slate-500">Night</div>
            <div className="text-center text-slate-500">Morn</div>
            <div className="text-center text-slate-500">After</div>
            <div className="text-center text-slate-500">Even</div>

            {/* Matrix Data */}
            {serviceHeatmapGrid.map((row, id) => (
              <React.Fragment key={id}>
                <div className="text-slate-400 py-1.5 border-b border-slate-900/40 truncate" title={row.service}>
                  {row.service}
                </div>
                <div className={`p-1 text-center font-bold border rounded-xs transition-colors ${getHeatmapColor(row.slot0)}`}>
                  {row.slot0} ch
                </div>
                <div className={`p-1 text-center font-bold border rounded-xs transition-colors ${getHeatmapColor(row.slot1)}`}>
                  {row.slot1} ch
                </div>
                <div className={`p-1 text-center font-bold border rounded-xs transition-colors ${getHeatmapColor(row.slot2)}`}>
                  {row.slot2} ch
                </div>
                <div className={`p-1 text-center font-bold border rounded-xs transition-colors ${getHeatmapColor(row.slot3)}`}>
                  {row.slot3} ch
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 4: MITRE ATT&CK NETWORK MAPPING */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-3">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
            MITRE ATT&CK MATRIX MAPPING REFERENCE BOARD
          </h3>
        </div>

        {/* Simple Matrix Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {mitreMapping.map((mitre) => {
            const isSelected = selectedMitre === mitre.code;

            return (
              <div 
                key={mitre.code}
                onClick={() => setSelectedMitre(isSelected ? null : mitre.code)}
                className={`p-3.5 rounded border text-[10px] cursor-pointer text-center flex flex-col justify-between transition-all select-none ${
                  isSelected 
                    ? "bg-red-500/10 border-red-500 text-red-400 shadow-md scale-[1.01]" 
                    : "bg-slate-900/45 border-slate-900 text-slate-350 hover:bg-slate-900 hover:border-slate-800"
                }`}
              >
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">{mitre.tier}</span>
                  <span className="font-extrabold uppercase text-slate-200 block mt-1 tracking-tight">{mitre.mappedAttack}</span>
                </div>
                <div className="mt-2 text-rose-450 font-black tracking-wider border-t border-slate-800 pt-1.5">
                  MITRE ID: {mitre.code}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Mapped Detail Drawer */}
        {activeMitreDetail && (
          <div className="mt-4 p-4 bg-slate-900 border border-slate-850 rounded text-[10px] space-y-2 animate-fade-in line-clamp-none font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-red-450 font-extrabold flex items-center gap-1">
                <Info size={13} /> {activeMitreDetail.code}: {activeMitreDetail.name} — ({activeMitreDetail.tier.toUpperCase()})
              </span>
              <button 
                onClick={() => setSelectedMitre(null)}
                className="text-[8.5px] text-slate-500 hover:text-slate-300 uppercase cursor-pointer"
              >
                Close Box
              </button>
            </div>
            
            <p className="text-slate-300 leading-relaxed font-sans mt-1">
              <strong>Technical Details:</strong> {activeMitreDetail.details}
            </p>
            <p className="text-emerald-400 font-sans leading-relaxed">
              <strong>Mitigation Playbook:</strong> {activeMitreDetail.mitigation}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
