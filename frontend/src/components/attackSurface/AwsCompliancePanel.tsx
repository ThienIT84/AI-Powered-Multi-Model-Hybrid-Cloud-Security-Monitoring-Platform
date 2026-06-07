import React from "react";
import { Cloud, Zap } from "lucide-react";
import { AwsServiceItem } from "./types";
import { cn } from "./utils";

interface AwsCompliancePanelProps {
  awsServices: AwsServiceItem[];
}

export function AwsCompliancePanel({ awsServices }: AwsCompliancePanelProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              AWS Exposure Compliance
            </h3>
            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              AWS Service Node Isolation Integrity Indices
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {awsServices.map((srv) => (
          <div
            key={srv.name}
            className="bg-slate-50/75 dark:bg-[#0B1220]/75 border border-slate-200 dark:border-gray-800 rounded-lg p-3 text-left"
            id={`aws-compliance-${srv.id}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-tight leading-none mb-1">
                  {srv.name}
                </h4>
                <span className="text-[9px] font-mono text-slate-450 dark:text-gray-400 block">
                  {srv.monitored}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "text-[9.5px] font-mono font-black py-0.5 px-2 rounded-full uppercase",
                    srv.exposureScore >= 90
                      ? "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20"
                      : "bg-orange-500/10 text-orange-605 dark:text-orange-400 border border-orange-500/20"
                  )}
                >
                  Score {srv.exposureScore}
                </span>
              </div>
            </div>

            {/* Horizontal gauge progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-gray-850 rounded overflow-hidden mb-2 border border-slate-200 dark:border-gray-800">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  srv.exposureScore >= 90
                    ? "bg-red-500 shadow-[0_0_10px_red]"
                    : "bg-orange-500 shadow-[0_0_10px_orange]"
                )}
                style={{ width: `${srv.pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-455 dark:text-gray-500 uppercase">
              <span>
                SEVERITY RISK:{" "}
                <strong className="text-red-500 dark:text-red-400 font-bold">{srv.riskLevel}</strong>
              </span>
              <span className="truncate max-w-42.5 text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{srv.recentAlerts}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
