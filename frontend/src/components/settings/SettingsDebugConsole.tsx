import React from "react";
import { PlaySquare, Terminal } from "lucide-react";

interface SettingsDebugConsoleProps {
  developerMode: boolean;
  debugConsole: boolean;
  consoleLogs: string[];
  consoleBottomRef: React.RefObject<HTMLDivElement | null>;
  onClearLogs: () => void;
  onSimulate: (type: "alerts" | "attacks" | "traffic") => void;
}

export function SettingsDebugConsole({
  developerMode,
  debugConsole,
  consoleLogs,
  consoleBottomRef,
  onClearLogs,
  onSimulate
}: SettingsDebugConsoleProps) {
  if (!developerMode) return null;

  return (
    <div className="border-t border-border bg-card dark:bg-zinc-950/95 text-[10px] font-mono tracking-wide shadow-2xl z-20 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border w-full shrink-0">
      {/* Simulation controls panel */}
      <div className="p-4 sm:w-80 space-y-3.5 bg-muted/10 dark:bg-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <PlaySquare className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="font-extrabold uppercase text-foreground">Mock Incident Generator</span>
        </div>
        <p className="text-[8px] text-muted-foreground uppercase leading-relaxed">
          Trigger simulated flows across Zeek & AI models to review downstream alerts in realtime.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSimulate("traffic")}
            className="py-1.5 bg-muted hover:bg-muted/80 border border-border text-[8px] font-black uppercase text-foreground rounded cursor-pointer transition-colors"
          >
            Traffic
          </button>
          <button
            onClick={() => onSimulate("attacks")}
            className="py-1.5 bg-muted hover:bg-muted/80 border border-border text-[8px] font-black uppercase text-foreground rounded cursor-pointer transition-colors"
          >
            Spikes
          </button>
          <button
            onClick={() => onSimulate("alerts")}
            className="py-1.5 bg-muted hover:bg-muted/80 border border-border text-[8px] font-black uppercase text-foreground rounded cursor-pointer transition-colors"
          >
            Alarms
          </button>
        </div>
        
        <div className="flex items-center justify-between text-[8px] uppercase pt-1 border-t border-border/40 text-muted-foreground">
          <span>Console logging: Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
        </div>
      </div>

      {/* scrolling log buffer */}
      {debugConsole && (
        <div className="flex-1 p-3.5 bg-slate-100 dark:bg-black/95 relative flex flex-col h-28 max-h-28 overflow-hidden border-t sm:border-t-0 sm:border-l border-border/40">
          <div className="flex justify-between items-center text-zinc-600 dark:text-muted-foreground text-[8px] uppercase font-black tracking-widest border-b border-border/30 pb-1.5 mb-1 bg-slate-200/50 dark:bg-black/40 relative z-10 select-none">
            <span className="flex items-center gap-1 text-zinc-800 dark:text-foreground">
              <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
              SOC Platform Terminal Logs Trace
            </span>
            <button 
              onClick={onClearLogs} 
              className="hover:text-cyan-600 dark:hover:text-foreground uppercase transition-colors"
            >
              Clear trace
            </button>
          </div>

          <div className="flex-1 overflow-y-auto text-[8.5px] text-emerald-700 dark:text-emerald-400 font-mono space-y-0.5 custom-scrollbar pr-2 py-1 select-text">
            {consoleLogs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-550 opacity-45 shrink-0 select-none">──</span>
                <span className="font-semibold dark:font-normal">{log}</span>
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
export default SettingsDebugConsole;
