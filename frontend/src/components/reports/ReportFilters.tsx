import React, { useState } from "react";
import { 
  Download, 
  Loader2, 
  Calendar, 
  FileText, 
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS } from "./reportsConfig";

export type ReportType = "executive" | "threat" | "ai" | "infrastructure";

interface ReportFiltersProps {
  currentType: ReportType;
  onReportTypeChange: (type: ReportType) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export function ReportFilters({ 
  currentType, 
  onReportTypeChange,
  timeframe,
  onTimeframeChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: ReportFiltersProps) {
  const [format, setFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportSuccess(false);
    
    // Simulate real-time progress increments for enterprise visual satisfaction
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
          }, 400);
          return 100;
        }
        const increment = Math.floor(Math.random() * 15) + 10;
        return Math.min(prev + increment, 100);
      });
    }, 200);
  };

  const reportTypes = [
    { value: "executive", label: "Executive Summary", desc: "Risk Index & Cloud Assets", glow: "rgba(6,182,212,0.6)" },
    { value: "threat", label: "Threat Intelligence", desc: "Offending IPs & Vectors", glow: "rgba(244,63,94,0.6)" },
    { value: "ai", label: "AI Models & SHAP", desc: "Analytics & Retrain Weights", glow: "rgba(168,85,247,0.6)" },
    { value: "infrastructure", label: "Pipeline & Queues", desc: "Network & SQS Observability", glow: "rgba(16,185,129,0.6)" },
  ];

  const timeframes = [
    { value: "today", label: "TODAY / 24 HOURS", info: "Real-time stream" },
    { value: "7d", label: "7 DAYS AGO", info: "Cohesive trend" },
    { value: "30d", label: "30 DAYS AGO", info: "Standard review" },
    { value: "custom", label: "CUSTOM RANGE", info: "Enterprise audit" },
  ];

  const selectedTimeframeObj = timeframes.find(t => t.value === timeframe) || timeframes[2];

  return (
    <div className="space-y-4">
      {/* Tab Navigation wrapper with horizontal scroll support and premium scroll mask */}
      <div className="relative border border-border bg-card/85 backdrop-blur-md rounded-xl p-2.5 overflow-hidden shadow-xl">
        {/* Glow accent band */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
        
        {/* Scrollable Container */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x">
          {reportTypes.map((type) => {
            const isActive = currentType === type.value;
            return (
              <button
                key={type.value}
                id={`tab-${type.value}`}
                onClick={() => onReportTypeChange(type.value as ReportType)}
                className={`relative px-5 py-3 rounded-lg text-left transition-all duration-300 min-w-42.5px lg:min-w-47.5px cursor-pointer snap-start overflow-hidden flex-1 ${
                  isActive 
                    ? "bg-background border border-border" 
                    : "bg-muted/30 border border-transparent hover:bg-muted hover:border-border"
                }`}
              >
                {/* Active Underline/Neon Border glow via framer-motion */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderglow"
                    className="absolute inset-0 bg-linear-to-b from-cyan-950/20 to-transparent pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBorderGlow"
                    className="absolute left-0 top-0 bottom-0 w-0.75px"
                    style={{ 
                      backgroundColor: currentType === "executive" ? CYBER_COLORS.low 
                                      : currentType === "threat" ? CYBER_COLORS.critical 
                                      : currentType === "ai" ? CYBER_COLORS.purpleAccent 
                                      : CYBER_COLORS.safe 
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="relative z-10 space-y-0.5">
                  <span className={`text-[10px] sm:text-xs font-black tracking-wider uppercase block transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {type.label}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono font-medium text-muted-foreground tracking-normal block whitespace-nowrap">
                    {type.desc}
                  </span>
                </div>

                {/* Cyber angle decorative detail */}
                <span className="absolute bottom-1 right-1 font-mono text-[7px] text-muted-foreground/35 tracking-normal select-none">
                  {type.value.substring(0, 3).toUpperCase()}//
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters & Dynamic Sizing Hub */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-xl">
        {/* Left indicators: Threat assessment level and configuration details */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-[9px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase">INGEST: STABLE (9.8k/s)</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            TIME_FILTER: <span className="text-foreground font-bold uppercase">{selectedTimeframeObj.label}</span>
          </div>
        </div>

        {/* Right configuration filters (Custom timeframe, export types, CSV/PDF) */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {/* Timeframe dropdown select */}
          <div className="relative">
            <button
              id="timeframe-dropdown"
              onClick={() => {
                setIsTimeDropdownOpen(!isTimeDropdownOpen);
                setIsFormatDropdownOpen(false);
              }}
              className={`flex items-center justify-between min-w-42.5px bg-background border rounded-lg px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:border-foreground/15 hover:text-foreground transition duration-200 cursor-pointer ${
                isTimeDropdownOpen ? "border-cyan-555 dark:border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{selectedTimeframeObj.label}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isTimeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTimeDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-1 w-55px bg-card border border-border rounded-lg shadow-xl z-50 p-1 divide-y divide-border"
                  >
                    {timeframes.map((tf) => (
                      <button
                        key={tf.value}
                        onClick={() => {
                          onTimeframeChange(tf.value);
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-mono font-bold tracking-wider rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                          timeframe === tf.value
                            ? "bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-800/30"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="uppercase">{tf.label}</span>
                        <span className="text-[8px] font-normal text-muted-foreground uppercase font-sans pr-1">
                          {tf.info}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Format selector */}
          <div className="relative">
            <button
              id="format-dropdown"
              onClick={() => {
                setIsFormatDropdownOpen(!isFormatDropdownOpen);
                setIsTimeDropdownOpen(false);
              }}
              className={`flex items-center justify-between min-w-30px bg-background border rounded-lg px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:border-foreground/15 hover:text-foreground transition duration-200 cursor-pointer ${
                isFormatDropdownOpen ? "border-cyan-500/50" : "border-border"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{format.toUpperCase()} FORMAT</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {isFormatDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFormatDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-1 w-32.5px bg-card border border-border rounded-lg shadow-xl z-50 p-1"
                  >
                    {["pdf", "csv", "json"].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFormat(f);
                          setIsFormatDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-mono font-bold tracking-wider rounded-md transition ${
                          format === f
                            ? "bg-cyan-950/40 text-cyan-400"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {f.toUpperCase()} FILE
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest border transition-all duration-300 min-w-37.5px relative overflow-hidden ${
              exportSuccess
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : isExporting
                ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                : "bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95"
            }`}
          >
            {isExporting && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-cyan-500/20 transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-405 dark:text-cyan-400" />
                  <span>COMPILING... {exportProgress}%</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>EXPORTED SUCCESS</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT REPORT</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Custom Date Range Selector (Collapses elegantly based on timeframe state) */}
      <AnimatePresence>
        {timeframe === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3 shadow-inner relative">
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono text-cyan-500/80 uppercase">
                <Clock className="w-2.5 h-2.5" />
                <span>Simulated Range Audit</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    SELECT START RANGE DATE_TIME
                  </span>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    SELECT END RANGE DATE_TIME
                  </span>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Informative range estimation */}
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-900/60 p-2 border border-slate-900/60 rounded-lg leading-normal">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="uppercase">
                  Selected Range: {startDate} to {endDate} • Estimating log intake of approximately{" "}
                  <strong className="text-cyan-400 font-mono">230,452,192 packets</strong> with{" "}
                  <strong className="text-red-400 font-mono">152 expected threat alerts</strong>.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
