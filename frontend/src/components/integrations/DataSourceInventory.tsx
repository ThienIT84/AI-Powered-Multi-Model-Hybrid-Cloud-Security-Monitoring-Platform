import React from "react";
import { cn } from "../../lib/utils";
import { DataSourceItem } from "./integrationFCAJData";

interface DataSourceInventoryProps {
  dataSources: DataSourceItem[];
  isDarkMode: boolean;
}

export function DataSourceInventory({ dataSources, isDarkMode }: DataSourceInventoryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
        Ingested System Data Sources Inventory List
      </h3>
      
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[10px] min-w-150">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 text-[8.5px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2.5">Source File Name</th>
                <th className="px-4 py-2.5">Ingestion Channel Type</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Eps Volume Today</th>
                <th className="px-4 py-2.5 text-center">Last Telemetry Sync</th>
                <th className="px-4 py-2.5">Json Payload Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {dataSources.map(ds => {
                const st = 
                  ds.status === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                  "bg-red-500/10 text-red-505 text-red-500 border border-red-500/30 animate-pulse";

                return (
                  <tr key={ds.name} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-slate-800 dark:text-slate-200">{ds.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 uppercase font-sans text-[9px]">{ds.type}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("px-1.5 py-0.5 rounded uppercase font-black text-[7.5px]", st)}>
                        {ds.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{ds.recordsToday.toLocaleString()} recs</td>
                    <td className="px-4 py-3 text-center text-slate-400 font-sans text-[9px]">{ds.lastReceived}</td>
                    <td className="px-4 py-3 text-slate-500 select-all truncate max-w-50" title={ds.schema}>{ds.schema}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
