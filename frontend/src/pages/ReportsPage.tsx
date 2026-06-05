import React, { useState, useMemo, useEffect } from "react";
import { 
  FileText, Shield, Brain, Layers, Database, 
  Download, Filter, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Sub-domain Modules
import { AlertRecord } from "../components/reports/reportsConfig";
import { MOCK_IP_ALERTS } from "../components/reports/reportsMockData";
import { FilterSidepanel } from "../components/reports/FilterSidepanel";
import { ReportDetailsPanel } from "../components/reports/ReportDetailsPanel";
import { ExportProgressModal } from "../components/reports/ExportProgressModal";
import { ExecutiveSummaryTab } from "../components/reports/ExecutiveSummaryTab";
import { SecurityReportsTab } from "../components/reports/SecurityReportsTab";
import { AIPerformanceTab } from "../components/reports/AIPerformanceTab";
import { MitreAttackTab } from "../components/reports/MitreAttackTab";
import { DatasetTrainingTab } from "../components/reports/DatasetTrainingTab";
import { ExportCenterTab } from "../components/reports/ExportCenterTab";

export function ReportsPage() {
  // Navigation & Time range states
  const [activeSegment, setActiveSegment] = useState<string>("executive");
  const [timeframe, setTimeframe] = useState<string>("7d");
  
  // Custom Filters State
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["critical", "high", "medium", "low"]);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<string[]>(["XSS", "SQLi", "Port Scan", "DoS", "Brute Force", "Unknown Anomaly"]);
  const [selectedAISources, setSelectedAISources] = useState<string[]>(["AI1", "AI2A", "AI2B", "Fusion Layer"]);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [searchIP, setSearchIP] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Custom Detail Drawer Object State
  const [selectedReportDetail, setSelectedReportDetail] = useState<AlertRecord | null>(null);

  // Report Export Status Simulator
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportTitle, setExportTitle] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("");
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStep, setExportStep] = useState<string>("Queued");

  // Multipliers for filtering live values
  const filterMultiplier = useMemo(() => {
    let base = 1.0;
    if (timeframe === "24h") base = 0.15;
    if (timeframe === "30d") base = 2.4;
    
    // Scale based on selected severity items
    const sevRatio = selectedSeverities.length / 4;
    const typeRatio = selectedAttackTypes.length / 6;
    return base * sevRatio * typeRatio;
  }, [timeframe, selectedSeverities, selectedAttackTypes]);

  // Handle Dynamic Calculations across metrics based on multipliers
  const calculatedKPIs = useMemo(() => {
    const scale = filterMultiplier;
    return {
      totalAlerts: Math.floor(12543 * scale),
      criticalAlerts: Math.floor(543 * scale),
      highAlerts: Math.floor(1824 * scale),
      mediumAlerts: Math.floor(5129 * scale),
      lowAlerts: Math.floor(5047 * scale),
      topThreat: selectedAttackTypes[0] || "None Detected",
      averageRisk: Math.floor(Math.min(96, Math.max(12, 84 * (selectedSeverities.includes("critical") ? 1.0 : 0.6)))),
      meanLatency: parseFloat((1.8 * (selectedAISources.length / 4)).toFixed(1))
    };
  }, [filterMultiplier, selectedSeverities, selectedAISources, selectedAttackTypes]);

  // Render simulated export progress intervals
  useEffect(() => {
    let interval: any = null;
    if (exportModalOpen && exportProgress < 100) {
      interval = setInterval(() => {
        setExportProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 15) + 5;
          if (next >= 100) {
            setExportStep("Completed");
            clearInterval(interval);
            return 100;
          }
          if (next > 75) {
            setExportStep("Generating charts & graphs PDF modules");
          } else if (next > 40) {
            setExportStep("Evaluating Multi-Model Inference consensus nodes");
          } else if (next > 15) {
            setExportStep("Retrieving raw flows cache indexes from Zeek DB");
          }
          return next;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [exportModalOpen, exportProgress]);

  const triggerExportSimulation = (title: string, format: string) => {
    setExportTitle(title);
    setExportFormat(format);
    setExportProgress(0);
    setExportStep("Queued in background tasks pipeline");
    setExportModalOpen(true);
  };

  const toggleSeveritySelection = (sev: string) => {
    setSelectedSeverities(prev => 
      prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]
    );
  };

  const toggleAttackTypeSelection = (atk: string) => {
    setSelectedAttackTypes(prev => 
      prev.includes(atk) ? prev.filter(a => a !== atk) : [...prev, atk]
    );
  };

  const toggleAISourceSelection = (src: string) => {
    setSelectedAISources(prev => 
      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
    );
  };

  // Filter list of active IP Alerts for interactive data Table
  const filteredAlertRecords = useMemo(() => {
    return MOCK_IP_ALERTS.filter(item => {
      if (!selectedSeverities.includes(item.severity)) return false;
      if (!selectedAttackTypes.includes(item.attackType)) return false;
      if (selectedCountry !== "ALL" && item.country !== selectedCountry) return false;
      if (selectedService !== "ALL" && item.destinationService !== selectedService) return false;
      if (searchIP && !item.sourceIp.includes(searchIP)) return false;
      
      // AI Source checks: intersects item.aiSources with selectedAISources
      const matchesAI = item.aiSources.some(s => selectedAISources.includes(s));
      if (!matchesAI && selectedAISources.length > 0) return false;

      return true;
    });
  }, [selectedSeverities, selectedAttackTypes, selectedCountry, selectedService, searchIP, selectedAISources]);

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6 pb-20 select-none text-slate-800 dark:text-slate-100 min-h-screen animate-fadeIn"
      id="hybrid-cloud-reports-root"
    >
      
      {/* 1. SECURE SOC HEADERS PANEL */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-border gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-black tracking-[0.3em] text-cyan-500 dark:text-cyan-400 uppercase">
              Consensus Analytics & Threat Assessment Centers v3.1
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            AI-Powered Hybrid Cloud Security Reports
          </h2>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            Multi-Model Intrusion classification funnel: Zeek / Suricata → AI1 Anomaly → AI2 Classifiers → Bayesian consensus Fusion
          </p>
        </div>

        {/* Global Select Options */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all duration-200 border ${isSidebarOpen ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : "bg-card text-slate-500 dark:text-slate-400 border-border hover:text-black dark:hover:text-white"}`}
          >
            <Filter className="w-3 h-3" />
            <span>Filters Sidepanel ({isSidebarOpen ? "On" : "Off"})</span>
          </button>
          
          <div className="bg-slate-100 dark:bg-[#0b0f19] border border-border rounded flex p-0.5">
            {[
              { id: "24h", label: "Last 24 Hours" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "custom", label: "Custom Range" }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded text-[9px] uppercase font-black tracking-wider transition ${timeframe === tf.id ? "bg-cyan-500 text-slate-950 shadow border-none" : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border-none"}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Datepicker inputs if "custom" range is chosen */}
      {timeframe === "custom" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs tracking-wider uppercase font-mono"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">Start Frame Target</span>
            <input type="date" defaultValue="2026-05-16" className="bg-slate-50 dark:bg-[#090c15] border border-border rounded px-2.5 py-1.5 text-foreground active:border-cyan-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">End Frame Target</span>
            <input type="date" defaultValue="2026-06-04" className="bg-slate-50 dark:bg-[#090c15] border border-border rounded px-2.5 py-1.5 text-foreground" />
          </div>
          <div className="flex items-end">
            <button className="bg-cyan-500 text-slate-950 font-black rounded px-4 py-1.5 w-full uppercase hover:opacity-90">
              Apply Date Window
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Structural Area */}
      <div className="flex gap-6 items-start relative">
        
        {/* ==========================================
            8. COLLAPSIBLE ADVANCED FILTERS SIDEPANEL
            ========================================== */}
        <AnimatePresence>
          {isSidebarOpen && (
            <FilterSidepanel
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchIP={searchIP}
              setSearchIP={setSearchIP}
              selectedSeverities={selectedSeverities}
              toggleSeveritySelection={toggleSeveritySelection}
              selectedAttackTypes={selectedAttackTypes}
              toggleAttackTypeSelection={toggleAttackTypeSelection}
              selectedAISources={selectedAISources}
              toggleAISourceSelection={toggleAISourceSelection}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              filteredAlertRecordsLength={filteredAlertRecords.length}
            />
          )}
        </AnimatePresence>

        {/* Central Visualization Sub-hub Pages */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* Tab Selection Strip */}
          <div className="bg-slate-100 dark:bg-[#0b0f19] border border-border p-1.5 rounded-xl flex flex-wrap gap-1 font-mono">
            {[
              { id: "executive", label: "Executive Summary", icon: FileText },
              { id: "security", label: "Security Reports", icon: Shield },
              { id: "ai", label: "AI Performance Reports", icon: Brain },
              { id: "mitre", label: "MITRE ATT&CK Matrix", icon: Layers },
              { id: "dataset", label: "Dataset & Training Reports", icon: Database },
              { id: "export", label: "Export Center", icon: Download }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSegment(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10.5px] uppercase font-black tracking-widest transition-all ${activeSegment === tab.id ? "bg-cyan-500 text-slate-950 shadow-md translate-y-[-0.5px] border-none" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-900 border-none"}`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ==========================================
              INTERACTIVE TABS MODULE DISPLAY WRAPPER
              ========================================== */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSegment}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              
              {activeSegment === "executive" && (
                <ExecutiveSummaryTab
                  calculatedKPIs={calculatedKPIs}
                  selectedAttackTypes={selectedAttackTypes}
                />
              )}

              {activeSegment === "security" && (
                <SecurityReportsTab
                  filteredAlertRecords={filteredAlertRecords}
                  onSelectDetail={setSelectedReportDetail}
                />
              )}

              {activeSegment === "ai" && (
                <AIPerformanceTab />
              )}

              {activeSegment === "mitre" && (
                <MitreAttackTab />
              )}

              {activeSegment === "dataset" && (
                <DatasetTrainingTab />
              )}

              {activeSegment === "export" && (
                <ExportCenterTab
                  triggerExportSimulation={triggerExportSimulation}
                  timeframe={timeframe}
                />
              )}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* ==========================================
            9. DYNAMIC REPORTS AND INCIDENT RECORD DRAWER PANEL (Adjacent)
            ========================================== */}
        <ReportDetailsPanel
          selectedReportDetail={selectedReportDetail}
          onClose={() => setSelectedReportDetail(null)}
          triggerExportSimulation={triggerExportSimulation}
        />

      </div>

      {/* ==========================================
          10. EXPORT PROGRESS MODAL SIMULATOR
          ========================================== */}
      <ExportProgressModal
        exportModalOpen={exportModalOpen}
        setExportModalOpen={setExportModalOpen}
        exportTitle={exportTitle}
        exportFormat={exportFormat}
        exportProgress={exportProgress}
        exportStep={exportStep}
      />

    </motion.div>
  );
}
