import React from "react";
import { Flame, PowerOff, Database, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface FailureSimulationCockpitProps {
  isDarkMode?: boolean;
  simulatedFailures: Record<string, boolean>;
  onToggleFailure: (key: string) => void;
}

export function FailureSimulationCockpit({ isDarkMode, simulatedFailures, onToggleFailure }: FailureSimulationCockpitProps) {
  return (
    <div className="p-5 rounded-xl border relative font-mono bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-500/20">
      <div className="flex gap-2 items-center mb-3 text-red-500 pb-2 border-b border-border/60">
        <Flame size={14} className="animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-wider">FCAJ Outage Simulations Cockpit</h3>
      </div>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-4">
        Force hardware disconnections to test threat response routing matrices:
      </p>

      <div className="grid grid-cols-2 gap-2 text-[8.5px] uppercase font-black tracking-widest">
        <button 
          onClick={() => onToggleFailure("zeek")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.zeek ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Sever Zeek</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("suricata")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.suricata ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Sever Suricata</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("ai1")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.ai1 ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Kill AI1 Model</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("ai2a")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.ai2a ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Kill AI2A Model</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("ai2b")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.ai2b ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Kill AI2B Web</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("websocket")}
          className={cn(
            "p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer",
            simulatedFailures.websocket ? "bg-red-500 text-white border-red-600" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Break Sockets</span>
          <PowerOff size={11} />
        </button>

        <button 
          onClick={() => onToggleFailure("sqsOverflow")}
          className={cn(
            "p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer col-span-2",
            simulatedFailures.sqsOverflow ? "bg-orange-500 text-white border-orange-600 animate-pulse" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>Simulate AWS SQS Payload Backlog Overflow</span>
          <Activity size={11} className="animate-spin" />
        </button>

        <button 
          onClick={() => onToggleFailure("database")}
          className={cn(
            "p-2 rounded-lg border flex items-center justify-between transition-colors cursor-pointer col-span-2",
            simulatedFailures.database ? "bg-red-600 text-white border-red-700 animate-pulse" : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <span>PostgreSQL DB Connection Failure</span>
          <Database size={11} />
        </button>
      </div>
    </div>
  );
}
