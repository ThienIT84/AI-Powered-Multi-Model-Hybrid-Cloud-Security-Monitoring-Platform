import React from "react";
import { 
  ShieldAlert, 
  ShieldX, 
  Eye, 
  Filter, 
  Download
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string | null;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId }: AlertTableProps) {
  return (
    <div className="bg-[#0f1115] dark:bg-[#0f1115] light:bg-white border border-white/5 dark:border-white/5 light:border-gray-200 rounded-xl overflow-hidden flex flex-col mb-4 shadow-2xl transition-colors duration-500">
      <div className="p-3 border-b border-white/5 dark:border-white/5 light:border-gray-100 flex items-center justify-between bg-black/20 light:bg-gray-50">
        <div className="flex items-center gap-2">
           <h3 className="text-[10px] font-black text-white dark:text-white light:text-gray-900 uppercase tracking-[0.2em]">REAL-TIME AI SECURITY EVENTS</h3>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-black/40 light:bg-white border border-white/5 dark:border-white/5 light:border-gray-200 px-2 py-0.5 rounded">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Auto Refresh</span>
              <div className="w-6 h-3 bg-green-900/40 border border-green-500/30 rounded-full relative">
                 <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              </div>
              <span className="text-[8px] font-black text-green-500 uppercase">ON</span>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 dark:border-white/5 light:border-gray-100">
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">TIMESTAMP</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">SEVERITY</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">SOURCE → DESTINATION</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">ATTACK TYPE</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">AI CONFIDENCE SCORE</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">DETECTED BY</th>
              <th className="px-5 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">MITRE ATT&CK</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShieldX className="w-10 h-10 text-gray-700" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No Events Found</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">Try adjusting your search filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                alerts.slice(0, 8).map((alert, idx) => {
                  const isSelected = selectedAlertId === alert.id;
                  return (
                    <motion.tr 
                      key={alert.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-b border-white/5 dark:border-white/5 light:border-gray-100 transition-all group cursor-pointer relative",
                        isSelected 
                          ? "bg-red-500/[0.08] shadow-[inset_4px_0_0_0_#ef4444]" 
                          : idx % 2 === 0 
                            ? "bg-white/[0.01] dark:bg-white/[0.01] light:bg-gray-50/30" 
                            : "hover:bg-white/[0.02] light:hover:bg-gray-50 transition-all"
                      )}
                      onClick={() => onSelectAlert(alert)}
                    >
                      <td className="px-5 py-2.5">
                        <span className={cn(
                          "text-[10px] font-mono font-bold whitespace-nowrap",
                          isSelected ? "text-red-400" : "text-gray-400 dark:text-gray-400 light:text-gray-600"
                        )}>
                          {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: true })}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex justify-center">
                          <SeverityBadge severity={alert.severity} />
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono font-bold tracking-tight", isSelected ? "text-white dark:text-white light:text-gray-900" : "text-gray-300 dark:text-gray-300 light:text-gray-700")}>{alert.sourceIp}</span>
                           <span className="text-gray-600 text-[10px]">→</span>
                           <span className="text-[10px] font-mono text-gray-400 dark:text-gray-400 light:text-gray-600 font-bold tracking-tight">{alert.destIp}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={cn("text-[10px] font-bold tracking-tight", isSelected ? "text-red-400" : "text-gray-200 dark:text-gray-200 light:text-gray-800")}>{alert.attackType}</span>
                      </td>
                      <td className="px-5 py-2.5">
                         <div className="flex items-center gap-2 max-w-[120px]">
                            <span className={cn("text-[10px] font-black font-mono w-8", isSelected ? "text-red-400" : "text-gray-100 dark:text-gray-100 light:text-gray-900")}>{alert.confidence}</span>
                            <div className="flex-1 h-1 bg-white/5 dark:bg-white/5 light:bg-gray-200 rounded-full overflow-hidden">
                               <div 
                                 className={cn("h-full", parseFloat(alert.confidence) > 0.9 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-orange-500")} 
                                 style={{ width: `${parseFloat(alert.confidence) * 100}%` }} 
                               />
                            </div>
                         </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-400 light:text-gray-500 italic">AI Model (NLP-SQLi)</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={cn(
                          "text-[9px] font-black bg-red-900/10 border px-2 py-0.5 rounded tracking-widest leading-none",
                          isSelected ? "text-red-400 border-red-500/30" : "text-red-500 border-red-900/20"
                        )}>
                          T1190
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-white/5 dark:border-white/5 light:border-gray-100 flex items-center justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest">
         <span>Showing 1 to 8 of 1,247 events</span>
         <div className="flex items-center gap-1">
            <button className="px-1.5 py-1 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">{'<'}</button>
            <button className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded">1</button>
            <button className="w-5 h-5 flex items-center justify-center hover:bg-white/5 light:hover:bg-gray-100 rounded transition-colors">2</button>
            <button className="w-5 h-5 flex items-center justify-center hover:bg-white/5 light:hover:bg-gray-100 rounded transition-colors">3</button>
            <span>...</span>
            <button className="px-1.5 py-1 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">{'>'}</button>
         </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const settings = {
    [Severity.CRITICAL]: { text: "CRITICAL", bg: "bg-red-900/20", color: "text-red-500", border: "border-red-500/30" },
    [Severity.HIGH]: { text: "HIGH", bg: "bg-orange-900/20", color: "text-orange-500", border: "border-orange-500/30" },
    [Severity.MEDIUM]: { text: "MEDIUM", bg: "bg-yellow-900/20", color: "text-yellow-500", border: "border-yellow-500/30" },
    [Severity.LOW]: { text: "LOW", bg: "bg-green-900/20", color: "text-green-500", border: "border-green-500/30" },
  };

  const config = settings[severity] || settings[Severity.LOW];

  return (
    <span className={cn(
      "text-[8px] font-black px-3 py-1 rounded border uppercase tracking-widest leading-none block w-fit shadow-sm",
      config.bg, config.color, config.border
    )}>
      {config.text}
    </span>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const styles = {
    [AlertStatus.BLOCKING]: "text-red-500",
    [AlertStatus.INVESTIGATING]: "text-purple-400",
    [AlertStatus.MONITORING]: "text-yellow-400",
    [AlertStatus.RESOLVED]: "text-green-500",
  };

  return (
    <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none", styles[status])}>
      {status}
    </span>
  );
}
