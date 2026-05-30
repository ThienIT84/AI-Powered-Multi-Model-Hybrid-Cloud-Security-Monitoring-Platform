import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Sparkles, Play, ShieldAlert, CheckCircle, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function MultiStageAttackFlow() {
  const [activeStep, setActiveStep] = useState(2); // Default highlight to step 2 (XSS expl)

  const steps = [
    { 
      label: "Port Scan", 
      status: "COMPLETED", 
      desc: "Scanned 14 VLAN gateways for responsive sockets",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgBorder: "border-emerald-500/30 bg-emerald-500/[0.01]" 
    },
    { 
      label: "Brute Force", 
      status: "COMPLETED", 
      desc: "Discovered default configuration credentials on asset node",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgBorder: "border-emerald-500/30 bg-emerald-500/[0.01]" 
    },
    { 
      label: "XSS Exploit", 
      status: "ACTIVE EXPL", 
      desc: "Injecting script bounds via client HTTP parameters",
      icon: Activity,
      color: "text-red-500 animate-pulse",
      bgBorder: "border-red-500/60 bg-red-500/[0.02] shadow-[0_0_12px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30" 
    },
    { 
      label: "Data Exfil", 
      status: "QUEUED/GUARDED", 
      desc: "Attempting automated egress file copying to block origins",
      icon: ShieldAlert,
      color: "text-muted-foreground",
      bgBorder: "border-border/60 bg-muted/10 opacity-40" 
    }
  ];

  // Cyclic auto-flicker or step highlights to make the UI animated
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev === 2 ? 3 : 2));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            MULTI-STEP THREAT RECONSTRUCTION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active Multi-Stage Attack Paths
          </span>
        </div>
        <Play size={13} className="text-cyan-500" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-3.5 relative overflow-hidden select-none">
        
        {/* Step-by-Step Flow columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 relative z-10">
          {steps.map((st, idx) => {
            const isActive = activeStep === idx;
            const Icon = st.icon;

            return (
              <div key={idx} className="relative flex flex-col justify-between">
                {/* Visual Step Card */}
                <div 
                  className={cn(
                    "border rounded-xl p-3 h-27.5 flex flex-col justify-between transition-all leading-none relative group",
                    st.bgBorder,
                    isActive ? "animate-glowing" : ""
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wide">
                      STEP 0{idx + 1}
                    </span>
                    <span className={cn(
                      "text-[6.5px] font-black px-1 rounded uppercase tracking-wider font-mono",
                      idx < activeStep ? "text-emerald-500" : isActive ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
                    )}>
                      {st.status}
                    </span>
                  </div>

                  <div className="space-y-1 mt-3">
                    <h4 className="text-[9.5px] font-black uppercase text-foreground flex items-center gap-1">
                      <Icon size={12} className={cn("shrink-0", st.color)} />
                      {st.label}
                    </h4>
                    <p className="text-[7.2px] text-muted-foreground leading-normal font-semibold tracking-tight">
                      {st.desc}
                    </p>
                  </div>
                </div>

                {/* Lateral linking caret (hidden on mobile and last item) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 h-4 w-4 bg-background border border-border rounded-full items-center justify-center -translate-y-1/2 z-20">
                    <ChevronRight size={10} className="text-muted-foreground/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Informative advice strip */}
        <div className="p-2.5 bg-cyan-500/1 border border-cyan-500/15 rounded-lg text-[7.5px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 leading-normal">
          <Sparkles size={12} className="text-cyan-500 shrink-0" />
          <span>Automatic Threat Guard actively monitoring step 03. Gateways rate-limiters will trigger if exfiltration targets execute.</span>
        </div>
      </div>
    </div>
  );
}
