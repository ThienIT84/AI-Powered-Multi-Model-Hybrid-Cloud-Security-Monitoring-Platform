import React from "react";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CorrelationItem } from "./types";
import { cn } from "./utils";

interface LiveCorrelationFeedProps {
  correlations: CorrelationItem[];
}

export function LiveCorrelationFeed({ correlations }: LiveCorrelationFeedProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              Zeek &amp; AI Framework Threat to Exposure Correlation Feed
            </h3>
            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              Chaining Telemetry with AI1/AI2A/AI2B Bayesian Fusion Layers
            </span>
          </div>
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
          Correlation Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-175 border-collapse text-left text-xs font-mono bg-slate-50/50 dark:bg-[#0B1220]/40 rounded-lg overflow-hidden border border-slate-200 dark:border-gray-800/60" id="live-correlation-table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[9px] tracking-wider bg-slate-100/50 dark:bg-gray-900/50">
              <td className="py-2.5 px-3">Time</td>
              <td className="py-2.5 px-3">Asset Name</td>
              <td className="py-2.5 px-3">Exposure Context</td>
              <td className="py-2.5 px-3 text-cyan-600 dark:text-[#38BDF8]">AI Evidence Model</td>
              <td className="py-2.5 px-3 text-orange-500 dark:text-orange-400">Suricata Evidence</td>
              <td className="py-2.5 px-3 text-rose-500 dark:text-rose-400 font-bold">Bayesian Fusion</td>
              <td className="py-2.5 px-3 text-right">Severity</td>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-800/50">
            <AnimatePresence initial={false}>
              {correlations.map((row) => {
                const isHigh = row.severity === "High" || row.severity === "Critical";
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="hover:bg-slate-50/70 dark:hover:bg-gray-800/15 uppercase text-[10.5px]"
                    id={`corr-row-${row.id}`}
                  >
                    <td className="py-2.5 px-3 text-slate-450 dark:text-gray-550 font-mono">
                      {row.time}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white font-bold font-mono">
                      {row.asset}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-gray-400 font-mono">
                      {row.exposure}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-600 dark:text-[#38BDF8] font-bold font-mono">
                      {row.aiEvidence || "Normal"}
                    </td>
                    <td className="py-2.5 px-3 text-orange-500 dark:text-orange-400 font-mono">
                      {row.suricata || "No Alert"}
                    </td>
                    <td className="py-2.5 px-3 text-rose-500 dark:text-rose-400 font-black font-mono">
                      {row.fusionResult}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-widest",
                        isHigh ? "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/25" : "bg-yellow-500/10 text-yellow-605 border border-yellow-500/20"
                      )}>
                        {row.severity}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
