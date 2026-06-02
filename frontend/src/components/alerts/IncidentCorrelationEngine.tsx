import React, { useState } from "react";
import { IncidentCampaignCard, IncidentCampaign } from "./IncidentCampaignCard";
import { AttackTimeline } from "./AttackTimeline";
import { CampaignSummaryPanel } from "./CampaignSummaryPanel";
import { Network, Zap, ShieldAlert, Cpu, ArrowRight, Share2, Activity, Database, Server } from "lucide-react";
import { cn } from "../../lib/utils";

const CAMPAIGNS_SEED: IncidentCampaign[] = [
  {
    id: "145",
    name: "APT Campaign: Data Exfiltration Tunneling",
    riskScore: 92,
    affectedAssets: ["AWS-DB-PROD-01", "GCP-APP-GATEWAY"],
    duration: "45 mins active",
    alertCount: 15,
    stages: [
      { stage: "Recon", subtext: "Port Scan", status: "completed" },
      { stage: "Access", subtext: "Brute Force", status: "completed" },
      { stage: "Execution", subtext: "XSS payload", status: "completed" },
      { stage: "Exfil", subtext: "Data Upload", status: "current" }
    ],
    timelineEvents: [
      { time: "09:10:05", event: "TCP Syn Port Scan Detection", technique: "T1046 Network Service Scanning", severity: "Low" },
      { time: "09:12:30", event: "Active Host Port Sweep Ingress", technique: "T1046 Network Service Scanning", severity: "Medium" },
      { time: "09:15:12", event: "SSH Repetitive Brute Force", technique: "T1110 Brute Force", severity: "High" },
      { time: "09:17:40", event: "Successful Administrative Shell Login", technique: "T1110 Brute Force", severity: "Critical" },
      { time: "09:20:22", event: "Cross-Site Scripting Injection Payload", technique: "T1190 Exploit Public Web App", severity: "High" },
      { time: "09:25:50", event: "Unusual outbound egress data exfiltration", technique: "T1119 Exploit Exfiltration", severity: "Critical" }
    ]
  },
  {
    id: "149",
    name: "Automated Botnet Brute Force Wave",
    riskScore: 78,
    affectedAssets: ["AZURE-WEB-INGRESS"],
    duration: "3 hours active",
    alertCount: 420,
    stages: [
      { stage: "Recon", subtext: "Passive sweep", status: "completed" },
      { stage: "Access", subtext: "Brute Force", status: "current" },
      { stage: "Execution", subtext: "SQLi Inject", status: "pending" },
      { stage: "Exfil", subtext: "DB Dump", status: "pending" }
    ],
    timelineEvents: [
      { time: "06:05:12", event: "Rapid IP Sweep Discovery", technique: "T1046 Service Scanning", severity: "Low" },
      { time: "06:12:00", event: "Login Credentials Spraying Attack", technique: "T1110 Brute Force Access", severity: "High" },
      { time: "06:15:30", event: "Distributed Auth Failure Burst", technique: "T1110 Brute Force Access", severity: "High" }
    ]
  },
  {
    id: "152",
    name: "Web Application SQLi Campaign",
    riskScore: 86,
    affectedAssets: ["GCP-MYSQL-PROD"],
    duration: "18 mins active",
    alertCount: 8,
    stages: [
      { stage: "Recon", subtext: "API fuzzing", status: "completed" },
      { stage: "Access", subtext: "Token Spray", status: "completed" },
      { stage: "Execution", subtext: "SQL injection", status: "current" },
      { stage: "Exfil", subtext: "Exfiltration", status: "pending" }
    ],
    timelineEvents: [
      { time: "08:30:10", event: "API Fuzzing Footprint Detected", technique: "T1046 Network service scanning", severity: "Low" },
      { time: "08:34:22", event: "Malicious Authentication Bypass Attempt", technique: "T1190 Exploit Public-Facing App", severity: "High" },
      { time: "08:42:01", event: "SQL Injection Probe of Admin query", technique: "T1119 DB Query Fuzzing", severity: "Critical" }
    ]
  }
];

export function IncidentCorrelationEngine() {
  const [selectedCampId, setSelectedCampId] = useState("145");
  const currentCampaign = CAMPAIGNS_SEED.find(c => c.id === selectedCampId) || CAMPAIGNS_SEED[0];

  return (
    <div className="space-y-6 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left list: campaigns listing */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Network size={14} className="text-cyan-500" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">
              Active Campaign Incidents ({CAMPAIGNS_SEED.length})
            </span>
          </div>

          <div className="space-y-3">
            {CAMPAIGNS_SEED.map(camp => (
              <IncidentCampaignCard
                key={camp.id}
                campaign={camp}
                isSelected={selectedCampId === camp.id}
                onSelect={() => setSelectedCampId(camp.id)}
              />
            ))}
          </div>
        </div>

        {/* Right dashboard cards: active selected detail summary + timeline */}
        <div className="lg:col-span-2 space-y-6">
          <CampaignSummaryPanel campaign={currentCampaign} />

          {/* Graphical Attack Flow visualization block (SECTION 6 Graphical attack flow requirements) */}
          <div className="bg-secondary/10 border border-border p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase font-black text-muted-foreground">
              <span>Decision path topology graph (XDR trace representation)</span>
              <span className="text-[#06b6d4] flex items-center gap-1 animate-pulse"><Activity size={10} /> Active Synthesis</span>
            </div>

            {/* Target 6 nodes chain representation */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-1 border border-border/40 bg-card rounded-lg p-4 relative overflow-hidden text-center text-[7.5px] font-mono uppercase">
              
              {/* Node 1: Attacker */}
              <div className="p-1 px-1.5 border border-red-500/30 bg-red-500/10 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Originator</span>
                Attacker IP
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 2: Zeek */}
              <div className="p-1 px-1.5 border border-cyan-500/20 bg-cyan-500/10 dark:bg-cyan-950/10 text-cyan-650 dark:text-cyan-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Sensor</span>
                Zeek conn.log
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 3: AI1 */}
              <div className="p-1 px-1.5 border border-red-500/30 bg-red-500/15 dark:bg-red-950/25 text-red-650 dark:text-red-500 rounded w-full md:w-auto font-bold animate-[pulse_2s_infinite]">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Model</span>
                AI1 Anomaly
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 4: AI2A */}
              <div className="p-1 px-1.5 border border-orange-500/25 bg-orange-500/10 dark:bg-orange-950/10 text-orange-650 dark:text-orange-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Model</span>
                AI2A Class
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 5: AI2B */}
              <div className="p-1 px-1.5 border border-purple-500/25 bg-purple-500/10 dark:bg-purple-950/10 text-purple-650 dark:text-purple-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Model</span>
                AI2B Payload
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 6: Suricata */}
              <div className="p-1 px-1.5 border border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Signature</span>
                Suricata Hits
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 7: Fusion Layer */}
              <div className="p-1.5 px-2 bg-linear-to-r from-red-600 to-rose-600 text-white rounded border border-red-500 font-extrabold w-full md:w-auto animate-pulse">
                <span className="text-[6px] text-white/70 block leading-none mb-0.5">Aggregator</span>
                Fusion Layer
              </div>
              <ArrowRight size={10} className="text-muted-foreground/30 md:block hidden shrink-0" />

              {/* Node 8: Database */}
              <div className="p-1 px-1.5 border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded w-full md:w-auto">
                <span className="text-[6.5px] text-muted-foreground/60 block leading-none mb-0.5">Storage</span>
                Database Log
              </div>

            </div>
          </div>

          <AttackTimeline campaign={currentCampaign} />
        </div>
      </div>
    </div>
  );
}

export default IncidentCorrelationEngine;
