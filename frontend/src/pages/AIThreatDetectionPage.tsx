import React, { useState } from "react";
import { LayoutGrid, Activity, Scale, Database } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/utils";

// Domain specific component refactored modules
import { useThreatSimulation } from "../components/aiThreatDetection/useThreatSimulation";
import { TopKPIs } from "../components/aiThreatDetection/TopKPIs";
import { PipelineVisual } from "../components/aiThreatDetection/PipelineVisual";
import { RealtimeFeed } from "../components/aiThreatDetection/RealtimeFeed";
import { ModelHealthGrid } from "../components/aiThreatDetection/ModelHealthGrid";
import { ModelAnomalyTab } from "../components/aiThreatDetection/ModelAnomalyTab";
import { ModelClassifierTab } from "../components/aiThreatDetection/ModelClassifierTab";
import { ModelSemanticTab } from "../components/aiThreatDetection/ModelSemanticTab";
import { FusionTab } from "../components/aiThreatDetection/FusionTab";
import { DatasetsDriftTab } from "../components/aiThreatDetection/DatasetsDriftTab";
import { ThreatEventModal } from "../components/aiThreatDetection/ThreatEventModal";
import { ThreatEvent } from "../components/aiThreatDetection/types";

export function AIThreatDetectionPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "models" | "fusion" | "datasets">(
    "overview"
  );
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);

  // Destructure real-time simulation tickers and theme variables
  const {
    liveInferences,
    liveNormalFlows,
    liveAnomalyFlows,
    liveDetections,
    liveFusionAlerts,
    liveLatency,
    alertFeed,
    graphColors
  } = useThreatSimulation();

  return (
    <div className="space-y-6 pb-20 select-none text-foreground font-sans animate-fadeIn">
      {/* ── 1. HEADER & SYSTEM OVERVIEW TITLE ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border/85 gap-4">
        <div className="space-y-1.5 sm:max-w-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[10px] font-mono font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
              COGNITIVE DETECTION DOMAIN
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none text-slate-900 dark:text-slate-100">
            AI Threat Detection
          </h2>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal uppercase font-mono tracking-wider">
            AI-Powered Multi-Model Hybrid Cloud Security Monitoring Platform
          </p>
        </div>

        {/* WORKSPACE MODE NAVIGATION */}
        <div className="flex items-center flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 border border-border rounded-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-3 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all duration-200 border-none flex items-center gap-1.5 cursor-pointer",
              activeTab === "overview"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <LayoutGrid size={12} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={cn(
              "px-3 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all duration-200 border-none flex items-center gap-1.5 cursor-pointer",
              activeTab === "models"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Activity size={12} />
            Model Deep-Dives
          </button>
          <button
            onClick={() => setActiveTab("fusion")}
            className={cn(
              "px-3 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all duration-200 border-none flex items-center gap-1.5 cursor-pointer",
              activeTab === "fusion"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Scale size={12} />
            Fusion &amp; explain
          </button>
          <button
            onClick={() => setActiveTab("datasets")}
            className={cn(
              "px-3 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all duration-200 border-none flex items-center gap-1.5 cursor-pointer",
              activeTab === "datasets"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Database size={12} />
            Datasets &amp; Drift
          </button>
        </div>
      </div>

      {/* ── 2. TOP KPI SECTION ────────────────────────────────────────────────── */}
      <TopKPIs
        liveInferences={liveInferences}
        liveDetections={liveDetections}
        liveFusionAlerts={liveFusionAlerts}
        liveLatency={liveLatency}
      />

      {/* ── 3. INTUITIVE WORKSPACE TABS SWITCHER ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ── AI PIPELINE VISUALIZATION (MAIN FLOW DIAGRAM) ── */}
            <PipelineVisual setActiveTab={setActiveTab} graphColors={graphColors} />

            {/* ── REALTIME DETECTION FEED & SPEC DETAIL PANEL SPLIT ── */}
            <div className="flex flex-col lg:flex-row gap-5 items-stretch relative overflow-hidden">
              <motion.div 
                layout
                className={cn("transition-all duration-500", selectedEvent ? "w-full lg:w-[58%]" : "w-full")}
                transition={{ type: "spring", damping: 28, stiffness: 180 }}
              >
                <RealtimeFeed
                  alertFeed={alertFeed}
                  setSelectedEvent={setSelectedEvent}
                  selectedEventId={selectedEvent?.id}
                  graphColors={graphColors}
                />
              </motion.div>

              <AnimatePresence mode="popLayout">
                {selectedEvent && (
                  <motion.div
                    key="threat-details-panel"
                    layout
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 180 }}
                    className="w-full lg:w-[42%] shrink-0"
                  >
                    <ThreatEventModal
                      selectedEvent={selectedEvent}
                      onClose={() => setSelectedEvent(null)}
                      graphColors={graphColors}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── AI COMPILATION MODEL HEALTH (GRID) ── */}
            <ModelHealthGrid />
          </motion.div>
        )}

        {/* ── Tab 2: Models Detailed Analytics ── */}
        {activeTab === "models" && (
          <motion.div
            key="models-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* AI1: ISOLATION FOREST SECTION */}
            <ModelAnomalyTab
              liveNormalFlows={liveNormalFlows}
              liveAnomalyFlows={liveAnomalyFlows}
              graphColors={graphColors}
            />

            {/* AI2A: NETWORK ATTACK CLASSIFIER */}
            <ModelClassifierTab graphColors={graphColors} />

            {/* AI2B: HTTP SEMANTIC DETECTOR */}
            <ModelSemanticTab graphColors={graphColors} />
          </motion.div>
        )}

        {/* ── Tab 3: Fusion and Explainability ── */}
        {activeTab === "fusion" && (
          <motion.div
            key="fusion-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <FusionTab graphColors={graphColors} />
          </motion.div>
        )}

        {/* ── Tab 4: Datasets and stability indices ── */}
        {activeTab === "datasets" && (
          <motion.div
            key="datasets-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <DatasetsDriftTab />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details panel fully integrated side-by-side above */}
    </div>
  );
}
