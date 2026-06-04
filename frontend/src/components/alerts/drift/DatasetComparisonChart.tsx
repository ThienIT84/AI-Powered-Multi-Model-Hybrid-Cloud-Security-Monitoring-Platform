import React, { useState } from "react";
import { FEATURE_DISTRIBUTIONS } from "./driftConfig";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TableProperties } from "lucide-react";

export function DatasetComparisonChart() {
  const [selectedFeature, setSelectedFeature] = useState<"duration" | "bytes" | "packetRate">("duration");
  const chartData = FEATURE_DISTRIBUTIONS[selectedFeature];

  return (
    <div className="space-y-4">
      {/* Selector and Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40 select-none leading-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            HISTOGRAM DISTRIBUTION DRIFT
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-widest block mt-0.5">
            Zeek-first distribution baseline vs Standard Public
          </span>
        </div>
        
        <div className="flex items-center gap-2 select-none">
          <span className="text-[8px] font-extrabold text-muted-foreground uppercase">CHOOSE TELEMETRIC:</span>
          <select 
            value={selectedFeature} 
            onChange={(e) => setSelectedFeature(e.target.value as any)}
            className="bg-muted px-2 py-1 rounded border border-border text-[9.5px] font-black uppercase text-foreground cursor-pointer focus:outline-none focus:border-cyan-500/40"
          >
            <option value="duration">Connection Duration</option>
            <option value="bytes">Ingressed Bytes Size</option>
            <option value="packetRate">Origination Packet Rate</option>
          </select>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-3">
        <div className="h-50 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
              <XAxis 
                dataKey="bin" 
                stroke="var(--muted-foreground)" 
                fontSize={8} 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={8} 
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  borderColor: "var(--border)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  borderRadius: "8px"
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={24}
                iconType="circle"
                wrapperStyle={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}
              />
              <Bar 
                name="Zeek Live Local Ingest" 
                dataKey="zeekLive" 
                fill="rgb(6, 182, 212)" 
                radius={[3, 3, 0, 0]} 
                fillOpacity={0.8}
              />
              <Bar 
                name="Public datasets Standard" 
                dataKey="publicStandard" 
                fill="var(--muted-foreground)" 
                radius={[3, 3, 0, 0]} 
                fillOpacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight annotation card */}
        <div className="mt-3 p-2 bg-secondary/10 border border-border/60 rounded-lg text-[7.5px] font-extrabold text-muted-foreground uppercase flex items-center gap-1.5 leading-none">
          <TableProperties size={12} className="text-cyan-500" />
          <span>Note: Divergence indices show local datacenter flows contain significantly more micro-transactions than standard static benchmarks.</span>
        </div>
      </div>
    </div>
  );
}
export default DatasetComparisonChart;
