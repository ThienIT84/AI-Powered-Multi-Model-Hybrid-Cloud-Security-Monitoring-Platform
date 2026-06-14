import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Globe } from "lucide-react";
import { Asset } from "./types";

interface AssetZoneDistributionProps {
  assets: Asset[];
}

export function AssetZoneDistribution({ assets }: AssetZoneDistributionProps) {
  const distributionData = useMemo(() => {
    let dmzCount = 0;
    let internalCount = 0;
    let cloudCount = 0;
    let externalCount = 0;

    assets.forEach((asset) => {
      const zoneStr = asset.zone.toLowerCase();
      if (zoneStr.includes("dmz")) {
        dmzCount++;
      } else if (zoneStr.includes("internal") || zoneStr.includes("prem")) {
        internalCount++;
      } else if (zoneStr.includes("cloud") || zoneStr.includes("aws")) {
        cloudCount++;
      } else {
        externalCount++;
      }
    });

    return [
      { name: "DMZ Zone", value: dmzCount, color: "#06b6d4" },           // Cyan
      { name: "Internal LAN", value: internalCount, color: "#f59e0b" },   // Amber
      { name: "Cloud (AWS)", value: cloudCount, color: "#3b82f6" },       // Blue
      { name: "External", value: externalCount, color: "#ef4444" }        // Red
    ].filter(item => item.value > 0);
  }, [assets]);

  const totalCount = useMemo(() => {
    return distributionData.reduce((sum, item) => sum + item.value, 0);
  }, [distributionData]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-70">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <Globe size={12} className="text-blue-500 dark:text-blue-400" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Asset Zone Distribution
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Infrastructure asset layout by network sector
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4 py-2 min-h-0">
        <div className="w-28 h-28 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  fontSize: "9px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  borderRadius: "6px"
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-mono font-black text-foreground">{totalCount}</span>
            <span className="text-[6px] font-mono font-black text-muted-foreground uppercase tracking-[0.15em]">ZONES</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-47.5 custom-scrollbar space-y-1.5 pr-1 font-mono text-[9px]">
          {distributionData.map((item) => {
            const pct = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-1 rounded bg-muted/25 border border-border/20"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground uppercase truncate tracking-wider">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-right font-bold shrink-0">
                  <span className="text-foreground">{item.value}</span>
                  <span className="text-[7.5px] text-muted-foreground/50">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
