import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Globe, Award, ShieldAlert, Zap, Compass, HelpCircle } from "lucide-react";

interface CloudSecurityInsightsProps {
  onInteract?: (category: string) => void;
}

export function CloudSecurityInsights({ onInteract }: CloudSecurityInsightsProps) {
  // Proportional breakdown dataset of tenant risk distribution (Donut chart data)
  const riskDistributionData = [
    { name: "Critical", value: 3, color: "#EF4444" },
    { name: "High", value: 14, color: "#F59E0B" },
    { name: "Medium", value: 28, color: "#FBBF24" },
    { name: "Low", value: 58, color: "#10B981" }
  ];

  const totalRisks = useMemo(() => {
    return riskDistributionData.reduce((sum, item) => sum + item.value, 0);
  }, []);

  return (
    <div className="space-y-6" id="cloud-security-insights-container">
      
      {/* CARD 1: Internet Exposure Summary */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-cyan-500/10 transition-all select-none">
        <div>
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-3">
            <Globe size={14} className="text-cyan-500" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
              Internet Exposure Summary
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Row Item 1: Public EC2 instances */}
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase">
                <span>Public EC2 Instances</span>
                <span className="text-red-500 text-right font-black">4 Active Nodes</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            {/* Row Item 2: Public Load Balancers */}
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase">
                <span>Public Load Balancers</span>
                <span className="text-amber-500 text-right font-bold">2 Active Ports</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>

            {/* Row Item 3: Public S3 Buckets */}
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase">
                <span>Public S3 Buckets</span>
                <span className="text-red-500 text-right font-black">1 Exposed Bucket</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono mt-3 uppercase font-bold flex items-center justify-between">
          <span>Active Edge Ingress Mapped</span>
          <span>Perimeter Scanned: Instant</span>
        </div>
      </div>

      {/* CARD 2: Compliance Overview (Pass / Warning / Fail) */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-cyan-500/10 transition-all select-none">
        <div>
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-3">
            <Award size={14} className="text-purple-400" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
              Compliance Frameworks
            </h3>
          </div>

          <div className="divide-y divide-border/15 font-mono text-[9px]">
            {/* Framework 1: CIS AWS */}
            <div className="py-2 flex items-center justify-between gap-2 first:pt-0">
              <span className="font-extrabold text-foreground uppercase tracking-tight">CIS AWS Foundations</span>
              <div className="flex gap-1.5 text-[8px] font-bold uppercase">
                <span className="px-1.5 py-0.2 rounded bg-emerald-550/10 text-emerald-500 border border-emerald-555/20 font-black">Passed</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-550 border border-amber-500/15">8 Warn</span>
              </div>
            </div>

            {/* Framework 2: NIST SP 800-53 */}
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="font-extrabold text-foreground uppercase tracking-tight">NIST SP 800-53</span>
              <div className="flex gap-1.5 text-[8px] font-bold uppercase">
                <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 border border-red-500/15 font-black">Failed (2)</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-500/10 text-zinc-400">15 Warn</span>
              </div>
            </div>

            {/* Framework 3: ISO 27001 */}
            <div className="py-2 flex items-center justify-between gap-2 pb-0 last:border-0">
              <span className="font-extrabold text-foreground uppercase tracking-tight">ISO/IEC 27001</span>
              <div className="flex gap-1.5 text-[8px] font-bold uppercase">
                <span className="px-1.5 py-0.2 rounded bg-emerald-550/10 text-emerald-500 border border-emerald-555/20 font-black">Passed</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-500/10 text-zinc-400">4 Warn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono mt-3.5 uppercase font-bold flex items-center justify-between">
          <span>Regulation: Dec 2026 Ready</span>
          <span>Matched Standards: 3/4</span>
        </div>
      </div>

      {/* CARD 3: Cloud Risk Distribution Donut Chart */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 hover:border-cyan-500/10 transition-all">
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-3 select-none">
          <ShieldAlert size={14} className="text-amber-500" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Cloud Risk Distribution
          </h3>
        </div>

        <div className="flex items-center justify-between gap-4 font-mono select-none">
          
          {/* Sizing box for Pie chart donut */}
          <div className="h-26.25 w-26.25 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={34}
                  outerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    fontFamily: "monospace",
                    fontSize: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center absolute indicator layout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[14px] font-black tracking-tight text-foreground">{totalRisks}</span>
              <span className="text-[6.5px] uppercase text-zinc-500 font-black tracking-wider">Risks</span>
            </div>
          </div>

          {/* Side Legend Indicator with numbers */}
          <div className="flex-1 space-y-1.5 text-[8.5px] leading-none uppercase">
            {riskDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-1 border-b border-border/5 pb-1 max-w-32.5" onClick={() => onInteract?.(item.name)}>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-zinc-500 font-semibold">{item.name}</span>
                </div>
                <strong className="text-foreground text-right">{item.value}%</strong>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
export default CloudSecurityInsights;
