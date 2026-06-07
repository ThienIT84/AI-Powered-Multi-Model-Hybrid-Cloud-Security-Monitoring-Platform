import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EXPOSURE_DONUT_DATA } from "./mockData";

interface ExposureDistributionChartProps {
  averageExposureMultiplier: number;
}

export function ExposureDistributionChart({
  averageExposureMultiplier
}: ExposureDistributionChartProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-0.5">
          EXPOSURE CATEGORY DENSITY
        </span>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Exposure Distribution Sector
        </h3>
      </div>

      {/* Recharts Pie Concentric Container */}
      <div className="flex flex-col items-center">
        <div className="w-full h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={EXPOSURE_DONUT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {EXPOSURE_DONUT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Badge Labels */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-slate-400 dark:text-gray-500 text-[8px] font-mono uppercase tracking-widest leading-none mb-0.5">
              AVERAGE Score
            </span>
            <span className="text-2xl font-black text-rose-500 font-mono leading-none">
              {averageExposureMultiplier}
            </span>
          </div>
        </div>

        {/* Multi-category breakdown side notes */}
        <div className="w-full space-y-2.5 mt-3 text-left">
          {EXPOSURE_DONUT_DATA.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs font-mono bg-slate-50/75 dark:bg-[#0B1220]/75 border border-slate-200/80 dark:border-gray-800/80 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-slate-800 dark:text-gray-300 font-bold truncate max-w-32.5">
                  {item.name}
                </span>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="text-slate-400 dark:text-gray-550 text-[9px]">({item.value} units)</span>
                <span className="text-cyan-600 dark:text-[#38BDF8] font-bold">Score {item.score}</span>
                <span className="text-slate-500 dark:text-gray-400 font-bold">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
