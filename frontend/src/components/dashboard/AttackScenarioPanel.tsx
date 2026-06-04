import React, { useState } from "react";
import { Play, Pause, Square, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface Scenario {
  id: string;
  name: string;
  type: string;
  alerts: number;
  duration: string;
}

export function AttackScenarioPanel() {
  const [currentScenario, setCurrentScenario] = useState<string>("SQLi Database Ingress");
  const [status, setStatus] = useState<"Running" | "Paused" | "Completed">("Running");
  const [alertsCount, setAlertsCount] = useState<number>(142);
  const [campaignGenerated, setCampaignGenerated] = useState<string>("CAMP_SQL_098");

  const scenarios: Scenario[] = [
    { id: "1", name: "Port Scan Sweep", type: "Port Scan Sweep", alerts: 842, duration: "4 mins" },
    { id: "2", name: "Brute Force Hydra", type: "SSH Brute Force", alerts: 1420, duration: "12 mins" },
    { id: "3", name: "SYN Flood Exhaustion", type: "DoS Exhaustion", alerts: 8402, duration: "15 mins" },
    { id: "4", name: "SQLi Database Ingress", type: "SQL Injection", alerts: 142, duration: "3 mins" },
    { id: "5", name: "MITRE Exfiltration Base64", type: "Exfiltration SCP", alerts: 32, duration: "1 min" }
  ];

  const handleSelectScenario = (sc: Scenario) => {
    setCurrentScenario(sc.name);
    setStatus("Running");
    setAlertsCount(sc.alerts);
    setCampaignGenerated(`CAMP_${sc.id}_043`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          SECTION 38: SCENARIO SELECTION ENGINE & LIVE MALICIOUS TRAFFIC INJECTOR
        </h3>
        <span className="text-[7.2px] bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          INJECTION CAPABLE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        
        {/* Left Side: Select Scenario Row */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="text-[8px] font-black text-muted-foreground uppercase leading-none">
            AVAILABLE MALICIOUS SCENARIO EMBEDDINGS (CLICK TO TRIGGER)
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenarios.map((sc) => {
              const isSelected = currentScenario === sc.name;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left flex flex-col justify-between h-16.25 transition-all cursor-pointer leading-tight text-[8px]",
                    isSelected 
                      ? "bg-orange-500/15 border-orange-500 text-orange-700 dark:text-orange-400 font-extrabold" 
                      : "bg-secondary/40 border-border/70 hover:border-orange-500/30 text-foreground"
                  )}
                >
                  <span className="font-extrabold truncate w-full">{sc.name}</span>
                  <div className="flex items-center justify-between text-[6.5px] mt-1 uppercase text-muted-foreground font-black">
                    <span>{sc.type}</span>
                    <span>{sc.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Controller Actions and Status Monitor */}
        <div className="lg:col-span-6 bg-secondary/40 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border/10 pb-2">
            <div>
              <span className="text-[6.5px] text-muted-foreground uppercase block font-black leading-none">ACTIVE TEST SCENARIO</span>
              <span className="text-[10px] font-black text-foreground uppercase mt-1 block tracking-wider truncate max-w-70">
                {currentScenario}
              </span>
            </div>
            <span className={cn(
              "text-[7.5px] px-2 py-0.5 rounded uppercase font-black tracking-wider border shrink-0",
              status === "Running" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/15" :
              status === "Paused" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/15" :
              "bg-muted text-muted-foreground border-border"
            )}>
              {status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[8px] py-3.5 leading-none">
            <div className="flex justify-between border-b border-border/10 pb-1.5 font-black">
              <span className="text-muted-foreground">START LATITUDE:</span>
              <span className="text-foreground">10:48:02 UTC</span>
            </div>
            <div className="flex justify-between border-b border-border/10 pb-1.5 font-black">
              <span className="text-muted-foreground">END LATITUDE:</span>
              <span className="text-foreground">11:03:02 UTC</span>
            </div>
            <div className="flex justify-between border-b border-border/10 pb-1.5 font-black">
              <span className="text-muted-foreground font-mono">ALERTS EMITTED:</span>
              <span className="text-rose-600 dark:text-rose-500 font-extrabold">{alertsCount} alerts</span>
            </div>
            <div className="flex justify-between border-b border-border/10 pb-1.5 font-black">
              <span className="text-muted-foreground">CAMPAIGN CORR ID:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{campaignGenerated}</span>
            </div>
          </div>

          {/* Controller Interactive Buttons Row */}
          <div className="flex items-center gap-2 border-t border-border/10 pt-2 shrink-0">
            <button
              onClick={() => setStatus("Running")}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-[8px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer",
                status === "Running" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500" : "bg-transparent border-border hover:border-emerald-500/30 text-foreground"
              )}
            >
              <Play size={10} /> RUN
            </button>
            <button
              onClick={() => setStatus("Paused")}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-[8px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer",
                status === "Paused" ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500" : "bg-transparent border-border hover:border-amber-500/30 text-foreground"
              )}
            >
              <Pause size={10} /> PAUSE
            </button>
            <button
              onClick={() => { setStatus("Completed"); setAlertsCount(0); }}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-[8px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer",
                status === "Completed" ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-500" : "bg-transparent border-border hover:border-rose-500/30 text-foreground"
              )}
            >
              <Square size={10} /> TERMINATE
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AttackScenarioPanel;
