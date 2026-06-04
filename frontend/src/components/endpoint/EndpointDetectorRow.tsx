import React from "react";
import { Activity, Flame } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "../../lib/utils";
import { EndpointFCAJItem } from "./endpointFCAJData";
import { RISK_CATEGORIES } from "./EndpointConstants";

interface EndpointDetectorRowProps {
  matrixEndPoints: EndpointFCAJItem[];
  topRiskyData: { hostname: string; riskScore: number }[];
  setSelectedId: (id: string | null) => void;
  setIsDrawerOpen: (open: boolean) => void;
}

export const EndpointDetectorRow: React.FC<EndpointDetectorRowProps> = ({
  matrixEndPoints,
  topRiskyData,
  setSelectedId,
  setIsDrawerOpen,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" id="endpoint-detector-row">
      {/* 3. ENDPOINT RISK MATRIX HEATMAP */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
        <div className="flex gap-2 items-center mb-3 border-b border-border pb-2">
          <Activity size={13} className="text-cyan-405" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Detection Spectrum Heatmatrix</h3>
        </div>
        <div className="overflow-x-auto select-none">
          <div className="min-w-[320px] space-y-1.5 font-mono text-[9px]">
            <div className="grid grid-cols-6 border-b border-border pb-1 text-muted-foreground">
              <div className="col-span-2">Endpoint</div>
              {RISK_CATEGORIES.map((c, i) => (
                <div key={i} className="text-center text-[8px] truncate uppercase font-mono font-bold" title={c}>
                  {c.split(' ')[0]}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {matrixEndPoints.map(ep => {
                return (
                  <div key={ep.id} className="grid grid-cols-6 items-center hover:bg-muted p-0.5 rounded transition-all">
                    <div 
                      onClick={() => { setSelectedId(ep.id); setIsDrawerOpen(true); }}
                      className="col-span-2 truncate font-bold text-foreground cursor-pointer"
                      title={ep.hostname}
                    >
                      {ep.hostname}
                    </div>
                    {RISK_CATEGORIES.map((cat, i) => {
                      // Assign risk score ranges based on factors
                      let val = 10;
                      if (cat.includes("AI1") && ep.ai1.prediction !== "NORMAL") val = ep.ai1.anomalyScore;
                      if (cat.includes("AI2A") && ep.ai2a.attackType !== "None") val = ep.ai2a.confidence;
                      if (cat.includes("AI2B") && ep.ai2b.webAttack !== "None") val = ep.ai2b.confidence;
                      if (cat.includes("Suricata") && ep.alertCount > 0) val = Math.min(99, ep.alertCount * 25);

                      const bgClass = 
                        val >= 80 ? "bg-red-500 border border-red-600 shadow-[0_0_4px_rgba(239,68,68,0.2)]" :
                        val >= 55 ? "bg-orange-500 border border-orange-600 shadow-[0_0_4px_rgba(249,115,22,0.15)]" :
                        val >= 30 ? "bg-amber-400 border border-amber-500 animate-pulse" :
                        "bg-emerald-500/15 border border-emerald-500/30 dark:bg-emerald-400/20 dark:border-emerald-400/40 shadow-[0_0_2px_rgba(16,185,129,0.15)] text-emerald-600 dark:text-emerald-400";

                      return (
                        <div 
                          key={i}
                          onClick={() => { setSelectedId(ep.id); setIsDrawerOpen(true); }}
                          className={cn("h-4 rounded mx-1.5 cursor-pointer transition-transform hover:scale-105", bgClass)}
                          title={`${cat} metric: ${val}% rating`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. TOP RISKY ENDPOINTS */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
        <div className="flex gap-2 items-center mb-3 border-b border-border pb-2">
          <Flame size={13} className="text-red-505" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Top 10 Risky Systems Profiler</h3>
        </div>
        <div className="h-44 text-[9px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topRiskyData} layout="vertical" margin={{ top: 5, right: 15, left: -5, bottom: 5 }}>
              <XAxis type="number" stroke="rgba(156, 163, 175, 0.3)" fontSize={8} tickLine={false} tick={{ fill: "currentColor" }} className="text-muted-foreground/80 font-bold" />
              <YAxis dataKey="hostname" type="category" stroke="rgba(156, 163, 175, 0.3)" fontSize={8.5} tickLine={false} width={90} tick={{ fill: "currentColor" }} className="text-foreground font-black tracking-tight" />
              <Tooltip 
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.1)" }}
                labelClassName="text-white uppercase font-black"
                itemStyle={{ color: "#ef4444", fontSize: "10px" }}
              />
              <Bar dataKey="riskScore" radius={[0, 4, 4, 0]} barSize={10}>
                {topRiskyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.riskScore > 75 ? "#ef4444" : entry.riskScore > 40 ? "#f59e0b" : "#10b981"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
