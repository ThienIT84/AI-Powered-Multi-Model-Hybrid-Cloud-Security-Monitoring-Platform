import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Layers } from "lucide-react";
import { Asset } from "./types";

interface AssetTypeDistributionProps {
  assets: Asset[];
}

export function AssetTypeDistribution({ assets }: AssetTypeDistributionProps) {
  const distributionData = useMemo(() => {
    let webCount = 0;
    let dbCount = 0;
    let apiCount = 0;
    let endpointCount = 0;
    let cloudCount = 0;
    let networkCount = 0;

    assets.forEach((asset) => {
      const typeStr = asset.type.toLowerCase();
      const zoneStr = asset.zone.toLowerCase();

      if (typeStr.includes("web") || typeStr.includes("frontend")) {
        webCount++;
      } else if (typeStr.includes("database") || typeStr.includes("db") || typeStr.includes("rds") || typeStr.includes("sql")) {
        dbCount++;
      } else if (typeStr.includes("api") || typeStr.includes("gateway")) {
        apiCount++;
      } else if (typeStr.includes("endpoint") || typeStr.includes("user") || typeStr.includes("desktop")) {
        endpointCount++;
      } else if (zoneStr.includes("cloud") || typeStr.includes("s3") || typeStr.includes("sqs") || typeStr.includes("resource")) {
        cloudCount++;
      } else {
        networkCount++;
      }
    });

    return [
      { name: "Web Servers", value: webCount, color: "#06b6d4" },     // Cyan
      { name: "API Services", value: apiCount, color: "#f59e0b" },    // Amber
      { name: "Databases", value: dbCount, color: "#3b82f6" },        // Blue
      { name: "Endpoints", value: endpointCount, color: "#10b981" },    // Emerald
      { name: "Network Devices", value: networkCount, color: "#64748b" }, // Slate
      { name: "Cloud Resources", value: cloudCount, color: "#a855f7" }  // Purple
    ].filter(item => item.value > 0);
  }, [assets]);

  const totalCount = useMemo(() => {
    return distributionData.reduce((sum, item) => sum + item.value, 0);
  }, [distributionData]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-[280px]">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-cyan-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Asset Type Distribution
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Inventory breakdown by system type
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4 py-2 min-h-0">
        <div className="w-28 h-28 relative flex-shrink-0">
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
            <span className="text-[6px] font-mono font-black text-muted-foreground uppercase tracking-[0.15em]">TYPES</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[190px] custom-scrollbar space-y-1.5 pr-1 font-mono text-[9px]">
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
