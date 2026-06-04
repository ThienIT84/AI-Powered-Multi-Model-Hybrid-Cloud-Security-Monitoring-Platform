import React, { useMemo } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  MapPin, 
  Layers, 
  BookOpen 
} from "lucide-react";
import { 
  mockCampaigns, 
  effectivenessMetrics, 
  kbLibrary 
} from "./playbookMockData";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit = "" }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/80 p-2.5 rounded-lg font-mono text-[10px] shadow-lg max-w-xs uppercase font-black tracking-wider text-foreground">
        <p className="border-b border-border/80 pb-1 mb-1 font-extrabold text-foreground">{label}</p>
        <div className="space-y-1">
          {payload.map((pld: any, index: number) => {
            const labelColor = pld.color || pld.fill;
            return (
              <p key={index} className="flex justify-between gap-4 font-black">
                <span style={{ color: labelColor }}>{pld.name || pld.dataKey}:</span>
                <span className="text-foreground">{pld.value}{unit}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export interface AnalyticsTabProps {
  campaignId: string;
  setCampaignId: (campaignId: string) => void;
}

export function AnalyticsTab({ campaignId, setCampaignId }: AnalyticsTabProps) {

  const activeCampaign = useMemo(() => {
    return mockCampaigns.find(c => c.id === campaignId) || mockCampaigns[0];
  }, [campaignId]);

  return (
    <div className="space-y-6" id="playbooks-analytics-tab">
      {/* ROW 1: ATTACK CAMPAIGN RECONSTRUCTION NODE GRAPH (ITEM 14 & ITEM 13) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
        <div className="xl:col-span-8 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" /> Attack Campaign Reconstruction Node Graph
              </h3>
              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                Visualize active multi-stage attack scenarios reconstructed across various system network sectors.
              </p>
            </div>

            {/* Campaign selector buttons */}
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              {mockCampaigns.map(camp => (
                <button
                  type="button"
                  key={camp.id}
                  onClick={() => setCampaignId(camp.id)}
                  className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase transition ${campaignId === camp.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {camp.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/45 border border-border rounded-xl space-y-4 font-mono select-none">
            <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2 text-[10px] text-foreground font-black">
              <span>SOCIALLY RECONSTRUCTED: {activeCampaign.name}</span>
              <span className={`px-1.5 py-0.5 text-[8px] rounded border ${activeCampaign.state === "MITIGATED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"}`}>
                STATUS: {activeCampaign.state}
              </span>
            </div>

            <p className="text-[9.5px] text-muted-foreground italic leading-normal">
              Pivot attacker points discovered within 24 hours. The graph below displays chronological tactical progression:
            </p>

            {/* CUSTOM GRAPH VISUALIZATION (ITEM 14) */}
            <div className="flex flex-col md:flex-row items-stretch justify-around gap-4 pt-2">
              {activeCampaign.stages.map((stg, sidx) => (
                <div key={stg.step} className="flex-1 bg-card border border-border p-3.5 rounded-xl hover:border-cyan-500/30 transition shadow-inner relative">
                  {/* Stepper badge */}
                  <span className="absolute -top-2.5 left-3.5 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[7.5px] font-bold font-mono">
                    PHASE 0{sidx+1}
                  </span>

                  <div className="text-[10px] text-foreground font-bold uppercase mt-1 mb-1.5">{stg.step}</div>
                  <p className="text-[8.5px] text-muted-foreground leading-snug lowercase tracking-wide first-letter:uppercase">{stg.desc}</p>
                  <div className="text-[8px] text-cyan-500 mt-2 font-bold flex items-center justify-between">
                    <span>DISPATCHED</span>
                    <span>{stg.epoch} UTC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FUSION DECISION REFERENCE GRID (ITEM 15) */}
        <div className="xl:col-span-4 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Layers className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> Fusion Decision Reference Matrix
            </span>
          </div>

          <div className="font-mono text-[9px] text-muted-foreground space-y-3 leading-relaxed">
            <p className="text-foreground font-black leading-snug">
              FCAJ v3.0 standard consensus logic matrix reference. Evaluates multiple raw score sources to determine threat priority:
            </p>

            <div className="space-y-1.5 bg-muted p-3 border border-border rounded-lg text-foreground">
              <div className="flex justify-between border-b border-border/80 pb-1">
                <span className="text-muted-foreground font-bold">AI High + IDS Alarm</span>
                <span className="text-rose-500 font-black">CRITICAL (Verd: 98%)</span>
              </div>
              <div className="flex justify-between border-b border-border/80 pb-1">
                <span className="text-muted-foreground font-bold">AI High + IDS None</span>
                <span className="text-orange-500 font-black">HIGH (Verd: 81%)</span>
              </div>
              <div className="flex justify-between border-b border-border/80 pb-1">
                <span className="text-muted-foreground font-bold">AI Low + IDS Alarm</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-black">MEDIUM (Verd: 64%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">AI None + IDS None</span>
                <span className="text-slate-500 font-black">CLEAN STATE</span>
              </div>
            </div>

            <p className="italic text-[8px] text-muted-foreground text-center">
              *Formula enforces dynamic weighting. False positives are filtered based on consensus protocol score tables.
            </p>
          </div>
        </div>
      </div>

      {/* EFFECTIVENESS METRICS RECHARTS TILES (ITEM 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-[9px]">
        {/* Chart 1: Playbooks Usage trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 hover:border-cyan-500/30 transition-all duration-300 group">
          <span className="text-xs font-black text-foreground/80 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 uppercase tracking-widest block border-b border-border pb-2 transition-colors duration-300">
            SOAR Active Weekly Usage Trends
          </span>
          
          <div className="h-44 w-full text-foreground/75 group-hover:text-foreground transition-colors duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessMetrics.usage}>
                <XAxis dataKey="name" stroke="currentColor" fontSize={10} fontWeight="bold" />
                <YAxis stroke="currentColor" fontSize={10} fontWeight="bold" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="XSS" fill="#22d3ee" stackId="a" />
                <Bar dataKey="Brute Force" fill="#f43f5e" stackId="a" />
                <Bar dataKey="Port Scan" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Time savings */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 hover:border-emerald-500/40 transition-all duration-300 group">
          <span className="text-xs font-black text-foreground/80 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 uppercase tracking-widest block border-b border-border pb-2 transition-colors duration-300">
            Hours Saved: Manual vs SOAR Dispatch
          </span>
          
          <div className="h-44 w-full text-foreground/75 group-hover:text-foreground transition-colors duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessMetrics.resolutionTimeHour} layout="vertical">
                <XAxis type="number" stroke="currentColor" fontSize={10} fontWeight="black" />
                <YAxis dataKey="type" type="category" stroke="currentColor" fontSize={10} width={65} fontWeight="black" />
                <Tooltip content={<CustomTooltip unit=" hrs" />} />
                <Bar dataKey="withSoar" fill="#10b981" name="FCAJ SOAR v3" />
                <Bar dataKey="withoutSoar" fill="#94a3b8" name="Manual Response" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: False positive rates */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3 hover:border-purple-500/30 transition-all duration-300 group">
          <span className="text-xs font-black text-foreground/80 group-hover:text-purple-500 dark:group-hover:text-purple-400 uppercase tracking-widest block border-b border-border pb-2 transition-colors duration-300">
            Playbook Alarm Target Precision (%)
          </span>
          
          <div className="h-44 w-full text-foreground/75 group-hover:text-foreground transition-colors duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={effectivenessMetrics.falsePositiveRate}>
                <XAxis dataKey="name" stroke="currentColor" fontSize={10} fontWeight="bold" />
                <YAxis stroke="currentColor" fontSize={10} fontWeight="bold" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area type="monotone" dataKey="rate" stroke="#a855f7" fill="#a855f7" fillOpacity={0.06} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SOC KNOWLEDGE BASE LIBRARY CARDS (ITEM 16) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-blue-500" /> SOC Analyst Knowledge Base & Threat Indicators Index
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kbLibrary.map(kb => (
            <div key={kb.attack} className="bg-muted p-4 rounded-xl border border-border space-y-2 font-mono text-[9px] hover:border-blue-500/20 transition">
              <div className="text-[10px] text-foreground font-bold uppercase tracking-tight border-b border-border/80 pb-1 mb-1 flex items-center justify-between">
                <span>{kb.attack}</span>
                <span className="text-[7.5px] font-mono text-cyan-500">{kb.mitre.split(" - ")[0]}</span>
              </div>

              <p className="text-[9.5px] text-muted-foreground leading-relaxed font-sans lowercase first-letter:uppercase">{kb.description}</p>
              
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Compromise Indicators</span>
                {kb.indicators.map((ind, idx) => (
                  <div key={idx} className="flex items-start gap-1 text-[8.5px] text-muted-foreground leading-snug">
                    <span className="text-rose-500">▪</span> <span>{ind}</span>
                  </div>
                ))}
              </div>

              <div className="text-[8px] text-muted-foreground pt-1.5">
                <strong className="text-foreground">Defends: </strong> {kb.detectionMethods}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
