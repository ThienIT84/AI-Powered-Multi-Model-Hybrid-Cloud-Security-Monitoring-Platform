import React, { useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function AttackTimelinePanel() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const timelineEvents = [
    {
      id: "ev1",
      time: "09:00:22",
      type: "PORT SCAN",
      desc: "Inbound sweeps detected across standard DMZ ports against DMZ-WEB-SVR-01",
      ai: "AI1 Verdict Anomaly",
      actor: "185.220.101.42",
      target: "10.0.1.15",
      status: "Investigated"
    },
    {
      id: "ev2",
      time: "09:05:45",
      type: "BRUTE FORCE",
      desc: "Massive SSH password attack patterns initiated on DMZ-WEB-SVR-01",
      ai: "AI2A Heuristic Class match",
      actor: "185.220.101.42",
      target: "10.0.1.15",
      status: "Investigating"
    },
    {
      id: "ev3",
      time: "09:10:12",
      type: "XSS INJECTION & SEMANTICS",
      desc: "Suspect script request payloads hit DMZ login portal, semantic warnings raised",
      ai: "AI2B Semantic Class: XSS",
      actor: "45.146.164.110",
      target: "10.0.1.15",
      status: "Investigating"
    },
    {
      id: "ev4",
      time: "09:20:00",
      type: "DATA EXFILTRATION ATTEMPT",
      desc: "Anomaly outbound spike detected, possible database schema dump transfer",
      ai: "Fusion Layer Combined verdict",
      actor: "185.220.101.42",
      target: "10.0.1.15",
      status: "Mitigated"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          CHRONOLOGICAL ATTACK TIMELINE OVERVIEW
        </h3>
        <span className="text-[7.5px] bg-cyan-500/10 dark:bg-[#06b6d4]/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 dark:border-cyan-500/15 px-2.5 py-0.5 rounded uppercase font-black font-mono">
          CHRONOS ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-2.5 py-1 select-none font-mono text-[8.5px] leading-none">
        {timelineEvents.map(ev => {
          const isSelected = activeSegment === ev.id;
          return (
            <div 
              key={ev.id}
              onClick={() => setActiveSegment(isSelected ? null : ev.id)}
              className={cn(
                "p-2 rounded-lg border border-l-[3.5px] leading-relaxed transition-all cursor-pointer flex items-center justify-between font-mono",
                isSelected 
                  ? "border-cyan-400 dark:border-cyan-500/35 bg-cyan-100/45 dark:bg-cyan-950/15 text-cyan-700 dark:text-cyan-400 font-extrabold" 
                  : "border-border/40 hover:bg-muted/15 hover:border-border/60 bg-background/50"
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span className="text-[8.5px] font-black text-muted-foreground shrink-0 mt-0.5">{ev.time}</span>
                <div className="truncate pr-1">
                  <div className="flex items-center gap-1.5 leading-none mb-1 text-[9.5px]">
                    <span className="font-black text-foreground uppercase">{ev.type}</span>
                    <span className="text-[6.5px] font-black text-muted-foreground">({ev.ai})</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground font-black line-clamp-1 leading-snug">{ev.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                <div className="text-[8px] leading-tight font-black text-muted-foreground">
                   <span>Actor: <strong className="text-foreground font-black">{ev.actor}</strong></span>
                   <span className="block text-[6.5px] text-muted-foreground/60 font-black">Target: {ev.target}</span>
                </div>
                <span className={cn(
                  "text-[6.8px] font-black px-1.5 py-0.75 rounded border uppercase tracking-wider leading-none block text-center min-w-13.75",
                  ev.status === "Mitigated" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-500 font-black" :
                  ev.status === "Investigating" ? "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-500 font-black animate-pulse" :
                  "bg-muted border-border text-muted-foreground font-black"
                )}>
                  {ev.status}
                </span>
                <ChevronRight size={12} className={cn("text-muted-foreground/45 transition-transform", isSelected && "transform rotate-90 text-cyan-600 dark:text-cyan-400")} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>INTERACTIVE EVENT BLOCKS TIMELINE</span>
        <span>Verified flow sequences</span>
      </div>
    </div>
  );
}

export default AttackTimelinePanel;
