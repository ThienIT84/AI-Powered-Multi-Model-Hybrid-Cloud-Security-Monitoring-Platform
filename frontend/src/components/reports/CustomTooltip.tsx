import React from "react";

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

export function CustomTooltip({ active, payload, label, unit = "" }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#090d16] border border-border/80 p-2.5 rounded-lg font-mono text-[10px] shadow-xl max-w-xs uppercase font-black tracking-wider text-slate-200">
        <p className="border-b border-border/50 pb-1 mb-1 font-black text-cyan-400">{label}</p>
        <div className="space-y-1">
          {payload.map((pld: any, index: number) => {
            const labelColor = pld.color || pld.fill || "#22d3ee";
            return (
              <p key={index} className="flex justify-between gap-4 font-black">
                <span style={{ color: labelColor }}>{pld.name || pld.dataKey}:</span>
                <span className="text-white">{pld.value}{unit}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
