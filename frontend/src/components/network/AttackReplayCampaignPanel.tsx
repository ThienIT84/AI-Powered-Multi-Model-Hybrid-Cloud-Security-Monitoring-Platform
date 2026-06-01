import React, { useState, useMemo, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Activity, 
  Flame, 
  Layers, 
  Fingerprint, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  Network, 
  FileCode,
  ShieldCheck,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { NetworkLog, Severity } from "../network/NetworkConfig";

interface AttackReplayCampaignPanelProps {
  logs: NetworkLog[];
  onSelectFlow?: (log: NetworkLog) => void;
  onInjectLog?: (log: NetworkLog) => void;
}

interface AttackCampaign {
  id: string;
  name: string;
  risk: number;
  duration: string;
  stagesCount: number;
  relatedFlowCount: number;
  stages: {
    stageIndex: number;
    time: string;
    title: string;
    description: string;
    severity: Severity;
    mitigationPlaybook: string;
  }[];
}

interface ReplayPlaybook {
  id: string;
  name: string;
  description: string;
  triggerCount: number;
  steps: {
    timeOffsetMs: number;
    mockLog: {
        id: string;
        srcIp: string;
        srcPort: number;
        destIp: string;
        destPort: number;
        protocol: "TCP" | "UDP" | "ICMP";
        origBytes: number;
        respPkts: number;
        verdict: "NORMAL" | "ANOMALY";
        severity: Severity;
        threatScore: number;
        confidence: number;
        reason: string;
        country: string;
        duration: number;
        hexDump?: string;
    };
  }[];
}

export const AttackReplayCampaignPanel: React.FC<AttackReplayCampaignPanelProps> = ({ 
  logs, 
  onSelectFlow,
  onInjectLog 
}) => {
  // Connection state filtering selection
  const [selectedConnState, setSelectedConnState] = useState<string | null>(null);

  // Replay Controller states
  const [activeReplayId, setActiveReplayId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 4 | 8>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [replayHistory, setReplayHistory] = useState<any[]>([]);

  // Selected Campaign Details State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>("camp-1");

  // 1. CONNECTION STATE ANALYTICS (SF, S0, RSTO, REJ, SH, OTH)
  const connectionStateData = useMemo(() => {
    const states = {
      SF: 0,
      S0: 0,
      RSTO: 0,
      REJ: 0,
      SH: 0,
      OTH: 0
    };

    // Calculate from current logs
    logs.forEach(l => {
      const state = l.destPort === 22 && l.verdict === "ANOMALY"
        ? "REJ"
        : l.verdict === "ANOMALY" && l.origBytes > 50000000
        ? "RSTO"
        : l.verdict === "ANOMALY" && l.origBytes < 100
        ? "S0"
        : "SF";
      
      states[state as keyof typeof states] = (states[state as keyof typeof states] || 0) + 1;
    });

    // Seed some base values for realism if logs is low
    if (logs.length < 15) {
      states.OTH = 2;
      states.SH = 1;
      states.S0 += 3;
    }

    const stateColors = {
      SF: "#10b981", // Teal Normal
      S0: "#3b82f6", // Blue SYN probe
      RSTO: "#f97316", // Orange Reset
      REJ: "#ef4444", // Red Rej Portscan
      SH: "#8b5cf6", // Purple Handshake
      OTH: "#64748b" // Gray Others
    };

    return Object.entries(states).map(([name, value]) => ({
      name,
      value: Math.max(0, value),
      color: stateColors[name as keyof typeof stateColors] || "#64748b"
    }));
  }, [logs]);

  // Filter logs locally that match clicked connection state
  const connectionStateLogs = useMemo(() => {
    if (!selectedConnState) return [];

    return logs.filter(l => {
      const state = l.destPort === 22 && l.verdict === "ANOMALY"
        ? "REJ"
        : l.verdict === "ANOMALY" && l.origBytes > 50000000
        ? "RSTO"
        : l.verdict === "ANOMALY" && l.origBytes < 100
        ? "S0"
        : "SF";
      return state === selectedConnState;
    });
  }, [logs, selectedConnState]);

  // 2. ATTACK CAMPAIGN DETECTION (MULTI-HOP ATTACKS)
  const campaigns: AttackCampaign[] = useMemo(() => {
    return [
      {
        id: "camp-1",
        name: "APT Database Exfiltration Campaign",
        risk: 98,
        duration: "24m 12s",
        stagesCount: 4,
        relatedFlowCount: logs.filter(l => l.verdict === "ANOMALY" && l.srcIp === "185.190.240.8").length + 6,
        stages: [
          {
            stageIndex: 1,
            time: "18:00:12",
            title: "Reconnaissance: Port Sweep Scan",
            description: "External attacker ip 185.190.240.8 sweep-probes home server ports (21, 22, 23, 25, 80, 443) targeting responsive core routers.",
            severity: "MEDIUM",
            mitigationPlaybook: "Firewall-Policy-Restrict-Probe"
          },
          {
            stageIndex: 2,
            time: "18:05:44",
            title: "Credential Access: SSH Brute Force Guesswork",
            description: "Attacker attempts root password guess sweeps targeting core SQL server (10.0.12.3) on responsive authentication Port 22.",
            severity: "HIGH",
            mitigationPlaybook: "SSH-Key-Reinforce-Active-Block"
          },
          {
            stageIndex: 3,
            time: "18:15:30",
            title: "Command and Control (C2): UDP Tor DNS Tunneling",
            description: "Compromised host sets up hidden reverse onion tunnels dispatching system shell commands on known proxy exit peer port 9001.",
            severity: "HIGH",
            mitigationPlaybook: "Proxy-Route-Teal-Blacklist"
          },
          {
            stageIndex: 4,
            time: "18:32:15",
            title: "Exfiltration: Massive Postgres SQL Data Leak",
            description: "Attacker initiates bulk compressed database bucket exfiltration upload, leaking 156MB file payload dump to external offshore bucket 45.227.254.12.",
            severity: "CRITICAL",
            mitigationPlaybook: "Data-Loss-Prevention-Active-Drop"
          }
        ]
      },
      {
        id: "camp-2",
        name: "Direct SYN-Flood denial probe",
        risk: 75,
        duration: "3 mins",
        stagesCount: 2,
        relatedFlowCount: logs.filter(l => l.verdict === "ANOMALY" && l.protocol === "UDP").length + 2,
        stages: [
          {
            stageIndex: 1,
            time: "14:15:22",
            title: "Reconnaissance sweep",
            description: "Targeted subnets scans dispatched to test responsive bandwidth levels.",
            severity: "MEDIUM",
            mitigationPlaybook: "Decoy-Honeypot-Redirect"
          },
          {
            stageIndex: 2,
            time: "14:18:01",
            title: "Flooding Denial of Service",
            description: "Intruder launches SYN spoofed flood to overload home server buffers, shutting down web proxies.",
            severity: "HIGH",
            mitigationPlaybook: "DDoS-Hardware-Buffer-Scrubbing"
          }
        ]
      }
    ];
  }, [logs]);

  const activeCampaignDetails = useMemo(() => {
    return campaigns.find(c => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  // 3. ATTACK HISTORICAL PLAYBOOKS AND REPLAYS ENGINE
  const playbooks: ReplayPlaybook[] = [
    {
      id: "play-scan",
      name: "Playbook Scenario A: Massive Port Scan Storm",
      description: "Replays a 10-port quick sweep probe reconnaissance scenario from external VPN source target host.",
      triggerCount: 9,
      steps: [
        { timeOffsetMs: 0, mockLog: {id: "rep-scan-1", srcIp: "193.56.28.14", srcPort: 54231, destIp: "10.0.1.18", destPort: 21, protocol: "TCP", origBytes: 44, respPkts: 0, verdict: "ANOMALY", severity: "MEDIUM", threatScore: 72, confidence: 91, reason: "RECON: FTP sweep reconnaissance probed under replay test.", country: "RU", duration: 120} },
        { timeOffsetMs: 500, mockLog: { id: "rep-scan-2", srcIp: "193.56.28.14", srcPort: 54232, destIp: "10.0.1.18", destPort: 22, protocol: "TCP", origBytes: 44, respPkts: 0, verdict: "ANOMALY", severity: "HIGH", threatScore: 78, confidence: 93, reason: "RECON: SSH port scanner. Dictionary guess prerequisites.", country: "RU", duration: 140} },
        { timeOffsetMs: 1000, mockLog: { id: "rep-scan-3", srcIp: "193.56.28.14", srcPort: 54233, destIp: "10.0.1.18", destPort: 80, protocol: "TCP", origBytes: 60, respPkts: 0, verdict: "ANOMALY", severity: "MEDIUM", threatScore: 82, confidence: 94, reason: "RECON: Web frontend scan. Index mapping.", country: "RU", duration: 160 } },
        { timeOffsetMs: 1500, mockLog: { id: "rep-scan-4", srcIp: "193.56.28.14", srcPort: 54234, destIp: "10.0.1.18", destPort: 443, protocol: "TCP", origBytes: 64, respPkts: 0, verdict: "ANOMALY", severity: "MEDIUM", threatScore: 82, confidence: 94, reason: "RECON: Secured HTTP scan. Cert analysis.", country: "RU", duration: 170 } }
      ]
    },
    {
      id: "play-exfil",
      name: "Playbook Scenario B: SQLi Database Exfil Spill",
      description: "Replays unauthorized SQL dump compression leak triggered on postgresql DB out to offshore nodes.",
      triggerCount: 1,
      steps: [
        { timeOffsetMs: 0, mockLog: { id: "rep-exf-1", srcIp: "10.0.1.18", srcPort: 5432, destIp: "45.112.55.2", destPort: 443, protocol: "TCP", origBytes: 85200000, respPkts: 35000, verdict: "ANOMALY", severity: "CRITICAL", threatScore: 98, confidence: 99, reason: "EXFIL: High-volume dataset exfiltration backup dump triggers.", country: "VN", duration: 18500 } }
      ]
    }
  ];

  const activePlaybook = useMemo(() => {
    return playbooks.find(p => p.id === activeReplayId) || null;
  }, [activeReplayId]);

  // Replay Core Loop Manager
  useEffect(() => {
    let timer: any = null;

    if (isPlaying && activePlaybook) {
      const step = activePlaybook.steps[currentStepIndex];
      if (step) {
        timer = setTimeout(() => {
          // Inject actual log into stream via parent hook
          if (onInjectLog) {
            const time = new Date();
            const timeLabel = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}.${time.getMilliseconds().toString().padStart(3, "0")}`;
            
            const injectedLog: NetworkLog = {
              ...step.mockLog,
              timestamp: timeLabel,
              id: `${step.mockLog.id}_${Math.random().toString(36).substring(2, 5)}`
            };

            onInjectLog(injectedLog);
            setReplayHistory(prev => [
              {
                time: timeLabel,
                uid: injectedLog.id,
                payload: `${injectedLog.srcIp} ➔ ${injectedLog.destIp}:${injectedLog.destPort} [${injectedLog.protocol}]`,
                verdict: injectedLog.verdict,
                score: injectedLog.threatScore,
                reason: injectedLog.reason
              },
              ...prev
            ]);
          }

          // Advance
          if (currentStepIndex + 1 < activePlaybook.steps.length) {
            setCurrentStepIndex(prev => prev + 1);
          } else {
            // End of steps
            setIsPlaying(false);
          }

        }, step.timeOffsetMs / replaySpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, activePlaybook, replaySpeed, onInjectLog]);

  const handleStartReplay = (playbookId: string) => {
    setActiveReplayId(playbookId);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setReplayHistory([]);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setReplayHistory([]);
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono text-[11px]" id="attack-replay-campaign-panel-root">
      
      {/* SECTION ROW 1: CONNECTION STATE ANALYTICS & PIE DISPATCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* State counts pie chart */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              ZEEK CONN_STATE ANALYTICS
            </h3>
          </div>

          <p className="text-[9.5px] text-slate-400 font-sans leading-normal">
            Distribution of connection flags mapping standard TCP states: <strong>SF (Normal)</strong>, <strong>S0 (SYN Probe)</strong>, <strong>REJ (Scanning)</strong>, <strong>RSTO (Reset)</strong>. Click a slice to isolate logs.
          </p>

          <div className="h-37.5 w-full flex items-center justify-center relative select-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={connectionStateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(data) => {
                    const stateName = data.payload.name;
                    setSelectedConnState(selectedConnState === stateName ? null : stateName);
                  }}
                >
                  {connectionStateData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.color} 
                      stroke={entry.name === selectedConnState ? "#ffffff" : "transparent"}
                      strokeWidth={entry.name === selectedConnState ? 2 : 0}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontFamily: "monospace", fontSize: 9 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Index grid */}
          <div className="grid grid-cols-3 gap-y-1.5 text-[8.5px] font-bold text-slate-500 uppercase pb-1 justify-center max-w-sm mx-auto border-t border-slate-900/40 pt-2 text-center">
            {connectionStateData.map((st, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-1.5 justify-center cursor-pointer py-0.5 rounded ${st.name === selectedConnState ? "bg-slate-900 text-slate-200" : ""}`}
                onClick={() => setSelectedConnState(selectedConnState === st.name ? null : st.name)}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.name}: {st.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Connected isolated Logs tables */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <span className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-405" />
                Isolated State logs Explorer: <strong className="text-cyan-400 font-mono">{selectedConnState || "ALL STACK"}</strong>
              </span>
              <span className="text-[8.5px] uppercase font-bold text-slate-500">Live Workspace Filters</span>
            </div>

            <div className="overflow-x-auto max-h-42.5 border border-slate-900 rounded bg-slate-950/40 custom-scrollbar pr-1">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 sticky top-0 z-10 text-[8px] uppercase font-bold text-slate-500 border-b border-slate-900">
                  <tr>
                    <th className="px-3 py-1.5">UID</th>
                    <th className="px-3 py-1.5">Timestamp</th>
                    <th className="px-3 py-1.5">Source Node</th>
                    <th className="px-3 py-1.5">Destination Node</th>
                    <th className="px-3 py-1.5">Protocol</th>
                    <th className="px-3 py-1.5 text-center">Threat Risk</th>
                    <th className="px-3 py-1.5 text-right">Security Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/35 text-[9px]">
                  {(!selectedConnState ? logs.slice(0, 10) : connectionStateLogs).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500 italic">
                        No active flows stored under selected connection state. Move slider or inject packets.
                      </td>
                    </tr>
                  ) : (
                    (!selectedConnState ? logs.slice(0, 10) : connectionStateLogs).map((l) => (
                      <tr 
                        key={l.id} 
                        onClick={() => onSelectFlow && onSelectFlow(l)}
                        className="hover:bg-slate-900/40 cursor-pointer text-slate-350"
                      >
                        <td className="px-3 py-1.5 font-extrabold text-slate-400">{l.id}</td>
                        <td className="px-3 py-1.5">{l.timestamp}</td>
                        <td className="px-3 py-1.5 font-bold text-slate-200">{l.srcIp}:{l.srcPort}</td>
                        <td className="px-3 py-1.5 text-slate-200">{l.destIp}:{l.destPort}</td>
                        <td className="px-3 py-1.5">
                          <span className="bg-slate-900 border border-slate-800 px-1 py-0.2 rounded font-black text-[8px]">
                            {l.protocol}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-center font-bold text-slate-100">{l.threatScore}%</td>
                        <td className="px-3 py-1.5 text-right font-extrabold">
                          <span className={l.verdict === "ANOMALY" ? "text-red-400 border border-red-500/10 px-1 py-0.2 rounded" : "text-emerald-500"}>
                            {l.verdict}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[8.5px] text-slate-500 uppercase flex justify-between pt-2 border-t border-slate-900/40 mt-2">
            <span>Displaying {(!selectedConnState ? logs.slice(0, 10) : connectionStateLogs).length} logs</span>
            <span>Click slice in left diagram to toggle isolating state triggers</span>
          </div>
        </div>

      </div>

      {/* SECTION ROW 2: ATTACK CAMPAIGN DETECTION */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3.5" id="campaign-detection-subpanel">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">MULTI-HOP ALERT CORRELATION SUMMARY</span>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                ATTACK CAMPAIGN DETECTOR
              </h3>
            </div>
          </div>
          <span className="text-[8.5px] text-slate-550 italic uppercase font-black">Zeek ➔ AI ➔ Suricata Fusion map</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Campaigns lists columns */}
          <div className="lg:col-span-5 space-y-1.5">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase pr-1 block leading-none mb-1">REGISTERED ATTACK CAMPAIGNS</span>
            
            {campaigns.map((camp) => {
              const isSelected = camp.id === selectedCampaignId;

              return (
                <div 
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(isSelected ? null : camp.id)}
                  className={`p-3 border rounded-lg hover:border-red-500/35 cursor-pointer transition-all flex justify-between items-center group ${
                    isSelected 
                      ? "bg-red-500/3 border-red-500/40 text-red-400 shadow-sm" 
                      : "bg-slate-900/40 border-slate-900 text-slate-350"
                  }`}
                >
                  <div>
                    <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider">Campaign ID: {camp.id}</span>
                    <h4 className="font-extrabold uppercase text-slate-200 group-hover:text-red-400 mt-0.5 leading-snug">{camp.name}</h4>
                    <span className="text-[8px] text-slate-450 mt-1 block">Stages: {camp.stagesCount} • Active for: {camp.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-450 text-[11px] block">{camp.risk}/100</span>
                    <span className="text-[8.5px] text-slate-500 font-bold">{camp.relatedFlowCount} mapped logs</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chronological reconstruction visualizer */}
          <div className="lg:col-span-7">
            {activeCampaignDetails ? (
              <div className="bg-slate-900/25 border border-slate-850 p-4 rounded-lg space-y-3.5 animate-fade-in line-clamp-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1.5 text-[9px] uppercase font-bold text-slate-500">
                  <span>CHRONOLOGICAL CAMPAIGN STAGES RECONSTRUCTION</span>
                  <span className="text-red-450 font-black">RISK SCORE: {activeCampaignDetails.risk}%</span>
                </div>

                <div className="relative border-l-2 border-slate-800 ml-3 pl-5 space-y-3.5 pt-1 pb-1">
                  {activeCampaignDetails.stages.map((st) => (
                    <div key={st.stageIndex} className="relative text-[10px]">
                      {/* Stage marker bullet */}
                      <span className={`absolute -left-6.5 top-1.5 w-2 h-2 rounded-full border border-slate-900 ${
                        st.severity === "CRITICAL" ? "bg-red-500 ring-2 ring-red-500/10" : st.severity === "HIGH" ? "bg-amber-500" : "bg-cyan-500"
                      }`} />

                      <div className="flex flex-wrap items-baseline gap-2 leading-none">
                        <span className="text-slate-550 font-bold text-[8.5px]">{st.time}</span>
                        <span className={`text-[7.5px] font-black uppercase px-0.8 rounded ${
                          st.severity === "CRITICAL" ? "bg-red-950 text-red-400" : st.severity === "HIGH" ? "bg-amber-950/20 text-amber-500" : "bg-cyan-950 text-cyan-400"
                        }`}>{st.severity}</span>
                        <strong className="text-slate-200 font-extrabold font-mono text-[10.5px]">{st.title}</strong>
                      </div>
                      
                      <p className="text-[10px] font-sans text-slate-450 mt-1 leading-normal max-w-125">
                        {st.description}
                      </p>

                      <div className="text-[8px] text-slate-550 mt-1 uppercase font-bold">
                        Playbook Action: <span className="text-cyan-455 font-mono">{st.mitigationPlaybook}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-lg p-10 text-center text-slate-600 flex flex-col items-center justify-center gap-2 h-full min-h-52.5">
                <Layers size={22} className="text-slate-800 animate-pulse" />
                <span>SELECT AN ATTACK CAMPAIGN TO DECONSTRUCT ITS MULTI-STAGE RECONSTRUCTION MAP & ASSOCIATED ZEEK CORRELATIONS.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION ROW 3: SANBOXED ATTACK REPLAY PLAYBACK CONTROLLER */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 shadow-sm space-y-3.5" id="sandbox-attack-replay-panel">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-1.5 ">
            <SkipForward className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">FORENSIC DRILLS INTRUDER SANDBOX COCKPIT</span>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                ATTACK REPLAY CENTER
              </h3>
            </div>
          </div>
          <span className="text-[8.5px] text-slate-550 font-bold uppercase">Incident Playback console</span>
        </div>

        {/* Dashboard control selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Select scenarios columns */}
          <div className="lg:col-span-1 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-1.5">REPLAY SCENARIO CHANNELS</span>
              <div className="space-y-1.5 text-[10px]">
                {playbooks.map((p) => {
                  const isCur = p.id === activeReplayId;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => handleStartReplay(p.id)}
                      className={`p-2 rounded border border-slate-900 hover:border-slate-800 cursor-pointer text-slate-350 hover:bg-slate-900/60 transition-colors ${
                        isCur ? "bg-slate-900/80 border-indigo-500/30 text-indigo-400" : ""
                      }`}
                    >
                      <strong className="block text-slate-200 text-[10.5px] truncate">{p.name}</strong>
                      <span className="text-[8px] text-slate-500 uppercase block mt-0.5">{p.steps.length} sequential steps</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Playback parameters console */}
            {activePlaybook && (
              <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded text-[10px] space-y-2 mt-2">
                <span className="text-[8.5px] font-black text-slate-450 uppercase block tracking-wider leading-none">Console dashboard</span>
                
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-slate-500">Play/Pause:</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={handleTogglePlay}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-900 text-indigo-400 border border-slate-800 cursor-pointer transition-colors"
                      title={isPlaying ? "Pause scenario" : "Proceed scenario"}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
                    </button>
                    <button 
                      onClick={handleResetReplay}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-900 text-slate-450 border border-slate-800 cursor-pointer transition-colors"
                      title="Reset scenario tracker"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Playback Speed:</span>
                  <div className="flex gap-1 text-[8px] font-extrabold uppercase text-slate-450 bg-slate-950 p-0.5 rounded border border-slate-900">
                    {([1, 2, 4, 8] as const).map((spd) => (
                      <button 
                        key={spd}
                        onClick={() => setReplaySpeed(spd)}
                        className={`px-1 py-0.2 rounded cursor-pointer ${replaySpeed === spd ? "bg-indigo-950 text-indigo-400" : "hover:text-slate-200"}`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[8.5px] text-slate-500 text-center leading-none uppercase pt-1 border-t border-slate-9d0/30">
                  Step {currentStepIndex + 1} of {activePlaybook.steps.length} loaded
                </div>
              </div>
            )}
          </div>

          {/* Active play step output timeline logs */}
          <div className="lg:col-span-3 bg-slate-900/32 border border-slate-900 p-3.5 rounded-lg flex flex-col justify-between h-47.5">
            <div>
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between">
                <span>REPLAY OUTPUT INJECTION TIMELINE LOG</span>
                {isPlaying && <span className="text-indigo-400 animate-pulse font-black uppercase">🌟 STREAM_REPLAYING ACTIVE ({replaySpeed}x)</span>}
              </div>

              <div className="space-y-1.5 max-h-30 overflow-y-auto custom-scrollbar pr-1">
                {replayHistory.length === 0 ? (
                  <div className="text-slate-500 italic text-[9px] py-8 text-center">
                    Cockpit idle. Select a playbook scenario channel to left to launch dry-run simulation testing.
                  </div>
                ) : (
                  replayHistory.map((h, id) => (
                    <div key={id} className="bg-slate-950/70 p-1.5 rounded border border-slate-900 flex items-center justify-between text-[9px] font-mono leading-none">
                      <div>
                        <span className="font-bold text-indigo-400">{h.time}</span>
                        <span className="text-slate-500 ml-2 font-black">{h.uid}</span>
                        <span className="text-slate-200 ml-2">{h.payload}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-405 font-black">{h.score}% Risk</span>
                        <span className="bg-red-955 text-red-400 border border-red-500/10 px-1 py-0.2 rounded font-black text-[7.5px]">{h.verdict}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-950 text-[8px] text-slate-500 py-1.5 px-2 border border-slate-900 rounded uppercase flex justify-between leading-none items-center mt-2">
              <span>Simulated telemetry packets bypass network pipes and inject straight into AI1 models memory</span>
              <span className="text-cyan-405 font-extrabold font-mono">Sandbox Testbed</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
