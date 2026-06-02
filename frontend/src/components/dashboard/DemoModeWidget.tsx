import React, { useState, useEffect } from "react";
import { Radio, Shuffle, MonitorPlay } from "lucide-react";
import { cn } from "../../lib/utils";

interface DemoCycle {
  attack: string;
  mitre: string;
  ai1Decision: string;
  ai2Decision: string;
  fusionVerdict: string;
  riskScore: number;
  campaign: string;
}

export function DemoModeWidget() {
  const demoCycles: DemoCycle[] = [
    {
      attack: "TCP SYN port scan brute force sweep",
      mitre: "T1046 (Network Service Discovery)",
      ai1Decision: "ANOMALY (Confidence: 98.4%)",
      ai2Decision: "PORT_SCAN_EVENT (Confidence: 99.2%)",
      fusionVerdict: "CONFIRMED DISCOVERY CAMPAIGN",
      riskScore: 68,
      campaign: "CAMP_DISC_924"
    },
    {
      attack: "SSH credential stuffing database attack",
      mitre: "T1110 (Brute Force)",
      ai1Decision: "COMPASS_SPIKE (Confidence: 94.2%)",
      ai2Decision: "BRUTE_FORCE_AUTH (Confidence: 96.8%)",
      fusionVerdict: "ROOT SYSTEM EXHAUSTION MITIGATED",
      riskScore: 82,
      campaign: "CAMP_AUTH_012"
    },
    {
      attack: "XSS script token reflected injection",
      mitre: "T1190 (Exploit Public-Facing Application)",
      ai1Decision: "PAYLOAD_OUTLIER (Confidence: 89.1%)",
      ai2Decision: "XSS_WEB_ATTACK (Confidence: 92.4%)",
      fusionVerdict: "REFLECTED WEB EXPL TRACE FILTERED",
      riskScore: 74,
      campaign: "CAMP_WEB_403"
    },
    {
      attack: "Reverse shell beaconing periodic callback",
      mitre: "T1071.001 (Application Layer Protocol: Web Protocols)",
      ai1Decision: "BEACON_DRIFT (Confidence: 95.5%)",
      ai2Decision: "C2_BEACONING (Confidence: 97.4%)",
      fusionVerdict: "ACTIVE REVERSE BEACON DECOUPLED",
      riskScore: 92,
      campaign: "CAMP_C2_771"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticks, setTicks] = useState(0);

  // Auto cycle demos for live defense
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
      setCurrentIndex(prev => (prev + 1) % demoCycles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const active = demoCycles[currentIndex];

  return (
    <div className="bg-linear-to-r from-card to-secondary/30 border border-cyan-500/30 rounded-xl p-4 shadow-md select-none">
      
      {/* Header with active flashing indicator */}
      <div className="flex items-center justify-between mb-4 border-b border-cyan-500/10 pb-2">
        <h3 className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.15em] flex items-center gap-1.5 font-mono">
          <MonitorPlay className="w-4 h-4 text-cyan-650 dark:text-cyan-400 animate-pulse" />
          SECTION 39: LIVE DEFENSE INSTRUCTIONS & DEMONSTRATION GRAPHICS WRAPPER
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-ping" />
          <span className="text-[7px] bg-cyan-500/15 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-black font-mono">
            LIVE SIMULATION LOOPING
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        
        {/* Left column: Demonstration Control */}
        <div className="lg:col-span-5 space-y-3.5">
          <div>
            <span className="text-muted-foreground text-[7.5px] uppercase font-black block mb-1">LOOPING SCENE TITLE</span>
            <div className="text-sm font-black text-foreground capitalize tracking-wide flex items-center gap-1.5">
              <Radio size={13} className="text-cyan-600 dark:text-cyan-400 animate-pulse shrink-0" />
              {active.attack}
            </div>
          </div>

          <div className="bg-secondary/15 border border-border/80 p-3 rounded-lg leading-relaxed">
             <span className="text-muted-foreground block text-[7px] uppercase font-black mb-1">MITRE ATT&CK FRAMEWORK DECORATOR</span>
             <span className="text-amber-600 dark:text-amber-500 font-extrabold text-[10.5px]">{active.mitre}</span>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentIndex((prev) => (prev + 1) % demoCycles.length)}
               className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-405 font-black border border-cyan-500/20 hover:border-cyan-500/40 text-[7.5px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
             >
                <Shuffle size={10} /> FORCE SHIFT SCENE
             </button>
             <span className="text-[7px] text-muted-foreground font-black uppercase">
                SCENE {currentIndex + 1} OF {demoCycles.length}
             </span>
          </div>
        </div>

        {/* Right column: live system state reactions */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          
          <div className="bg-secondary/40 border border-border/70 p-3 rounded-xl flex flex-col justify-between h-20">
            <span className="text-muted-foreground text-[7px] uppercase font-black">AI1 OUTLIER FILTER VERDICT</span>
            <span className="text-foreground text-[8.5px] font-black truncate">{active.ai1Decision}</span>
            <span className="text-[6.5px] text-emerald-600 dark:text-emerald-500 font-black uppercase">CORRECT FILTRATION</span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-xl flex flex-col justify-between h-20">
            <span className="text-muted-foreground text-[7px] uppercase font-black">AI2 PROTOCOL ALGORITHM</span>
            <span className="text-foreground text-[8.5px] font-black truncate">{active.ai2Decision}</span>
            <span className="text-[6.5px] text-emerald-600 dark:text-emerald-500 font-black uppercase">METRIC ANCHOR SECTOR</span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-xl flex flex-col justify-between h-20">
            <span className="text-muted-foreground text-[7px] uppercase font-black text-cyan-650 dark:text-cyan-400">FUSION LAYER SYNAPSE</span>
            <span className="text-cyan-700 dark:text-cyan-400 text-[8.5px] font-black truncate">{active.fusionVerdict}</span>
            <span className="text-[6.5px] text-emerald-600 dark:text-emerald-500 font-black uppercase">THREAT LEVEL CORRELATED</span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-xl flex flex-col justify-between h-20">
            <span className="text-muted-foreground text-[7px] uppercase font-black">COGNITIVE FUSION RISK INDEX</span>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-600 dark:text-rose-500 text-lg font-black">{active.riskScore}</span>
              <span className="text-[7px] text-muted-foreground font-black">/100 Max</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-rose-500 rounded-full" style={{ width: `${active.riskScore}%` }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default DemoModeWidget;
