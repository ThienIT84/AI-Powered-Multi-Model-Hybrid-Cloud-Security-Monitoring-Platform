import React, { useState } from "react";
import { useThreatSimulation } from "../components/aiThreatDetection/useThreatSimulation";
import { SOCHeaderKPI } from "../components/aiThreatDetection/SOCHeaderKPI";
import { SOCThreatStream } from "../components/aiThreatDetection/SOCThreatStream";
import { FusionInsightPanel } from "../components/aiThreatDetection/FusionInsightPanel";
import { SystemHealthPanel } from "../components/aiThreatDetection/SystemHealthPanel";
import { SOCThreatDetailDrawer } from "../components/aiThreatDetection/SOCThreatDetailDrawer";
import { ThreatEvent } from "../components/aiThreatDetection/types";
import { Shield, Sparkles, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/utils";

export function AIThreatDetectionPage() {
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);

  // Consume our simulated SOC stream feed and metrics
  const {
    liveInferences,
    liveDetections,
    liveFusionAlerts,
    liveLatency,
    liveFpReduction,
    throughput,
    alertFeed,
  } = useThreatSimulation();

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6 space-y-6 flex flex-col font-mono text-slate-800 dark:text-slate-100 animate-in fade-in">
      {/* -- 1. Page Title Header Area -------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-border/80 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
              Consensus Security Operation (SOC) Domain
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            SOC AI Threat Detection Engine
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal uppercase tracking-wide">
            Real-Time Inference Consensus Validation Stream (Zeek-First Fusion Output)
          </p>
        </div>

        {/* Live Ticker Feed System Counter */}
        <div className="flex items-center gap-2.5 bg-secondary/35 border border-border/60 px-3 py-1.5 rounded-lg text-[9.5px]">
          <Terminal size={12} className="text-cyan-400 animate-pulse" />
          <span className="uppercase text-muted-foreground font-semibold">FEED RESOLVER STATUS:</span>
          <span className="font-bold text-emerald-400">ONLINE</span>
        </div>
      </div>

      {/* -- 2. Top KPI Metrics bar ---------------------------------- */}
      <SOCHeaderKPI
        liveInferences={liveInferences}
        liveDetections={liveDetections}
        liveFusionAlerts={liveFusionAlerts}
        liveLatency={liveLatency}
        liveFpReduction={liveFpReduction}
      />

      {/* -- 3. Main Center Layout (Grid containing Real-Time Stream + Forensic Detail / Slide-in Panel) ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left & Center: Real-Time stream + Insights Grid (takes up full width if no event is selected, or 8 columns if selected) */}
        <div className={cn(
          "space-y-5 transition-all duration-300 min-w-0 flex flex-col justify-start",
          selectedEvent ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          {/* Main threat stream list */}
          <SOCThreatStream
            alertFeed={alertFeed}
            selectedEventId={selectedEvent?.id}
            onSelectEvent={setSelectedEvent}
          />

          {/* Fusion Decision, Threat Distribution, and Drift Index directly underneath stream */}
          <FusionInsightPanel
            alertFeed={alertFeed}
            liveFusionAlerts={liveFusionAlerts}
            liveFpReduction={liveFpReduction}
          />
        </div>

        {/* Dynamic Detail slide-in if an incident is selected */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="lg:col-span-4 h-fit flex flex-col"
            >
              <SOCThreatDetailDrawer
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* -- 4. Bottom System Health Diagnostic panel ---------------- */}
      <SystemHealthPanel
        throughput={throughput}
        liveDetections={liveDetections}
      />

    </div>
  );
}
