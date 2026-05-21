import React, { useState } from "react";
import { ReportStats } from "../components/reports/ReportStats";
import { ReportFilters, ReportType } from "../components/reports/ReportFilters";
import { ExecutiveSummaryTab } from "../components/reports/ExecutiveSummaryTab";
import { ThreatIntelTab } from "../components/reports/ThreatIntelTab";
import { AIPerformanceTab } from "../components/reports/AIPerformanceTab";
import { InfrastructureTab } from "../components/reports/InfrastructureTab";
import { FileText, Shield, Brain, Cpu, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("executive");
  const [timeframe, setTimeframe] = useState<string>("30d");
  const [startDate, setStartDate] = useState<string>("2026-05-16");
  const [endDate, setEndDate] = useState<string>("2026-05-20");

  const renderActiveTab = () => {
    switch (reportType) {
      case "executive":
        return <ExecutiveSummaryTab timeframe={timeframe} />;
      case "threat":
        return <ThreatIntelTab timeframe={timeframe} />;
      case "ai":
        return <AIPerformanceTab timeframe={timeframe} />;
      case "infrastructure":
        return <InfrastructureTab timeframe={timeframe} />;
      default:
        return <ExecutiveSummaryTab timeframe={timeframe} />;
    }
  };

  const getTabTitleAndDesc = () => {
    switch (reportType) {
      case "executive":
        return {
          title: "Executive Summary & Asset Risk Analysis",
          desc: "Executive management snapshot, threat intensity patterns, and critical overview of compromised cloud infrastructure assets.",
          icon: FileText,
          iconColor: "text-cyan-500",
          borderColor: "border-cyan-500/20",
          glowColor: "rgba(6, 182, 212, 0.05)"
        };
      case "threat":
        return {
          title: "Threat Intelligence & IP Source Assessment",
          desc: "Distribution breakdown of attack vectors, SIEM threat diversification log metrics, and threat-intel on offending IP nodes.",
          icon: Shield,
          iconColor: "text-red-500",
          borderColor: "border-red-500/20",
          glowColor: "rgba(239, 68, 68, 0.05)"
        };
      case "ai":
        return {
          title: "AI Models Performance & Feature Importance",
          desc: "Benchmarking precision analytics across machine learning engines (AI1, AI2A, AI2B) and SHAP explainability.",
          icon: Brain,
          iconColor: "text-purple-500",
          borderColor: "border-purple-500/20",
          glowColor: "rgba(168, 85, 247, 0.05)"
        };
      case "infrastructure":
        return {
          title: "Data Ingestion Pipeline & Queue Bottlenecks",
          desc: "Aggregate volumetric packet traffic rates from Zeek/Suricata collectors along with real-time queues monitoring on AWS SQS pipelines.",
          icon: Cpu,
          iconColor: "text-emerald-500",
          borderColor: "border-emerald-500/20",
          glowColor: "rgba(16, 185, 129, 0.05)"
        };
    }
  };

  const currentHeader = getTabTitleAndDesc();
  const HeaderIcon = currentHeader.icon;

  return (
    <div className="space-y-6">
      {/* Decorative cyber line decoration */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-500 uppercase">
              SECURE MANAGEMENT HUB
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-none">
            Cyber Threat Reports & SOC Analytics
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block h-5 bg-slate-800 w-px" />
          <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest bg-slate-950 border border-slate-900 px-2.5 py-1 rounded">
            DB_REPORTS_V5.0_PRO
          </span>
        </div>
      </div>

      {/* Top 4 executive score stats cards (Updated with glowing and pulse indicators) */}
      <ReportStats />

      {/* Filters Hub Selector */}
      <ReportFilters 
        currentType={reportType} 
        onReportTypeChange={setReportType}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Dynamic Tab Description */}
      <div 
        className={`bg-slate-950/50 rounded-xl border p-4 flex items-start gap-4 transition-all duration-500 shadow-md backdrop-blur-md ${currentHeader.borderColor}`}
        style={{ 
          boxShadow: `inset 0 1px 2px rgba(255,255,255,0.01), 0 4px 20px ${currentHeader.glowColor}`
        }}
      >
        <div className={`p-2.5 bg-slate-950 border border-slate-800 rounded-lg ${currentHeader.iconColor} shadow-inner`}>
          <HeaderIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span>{currentHeader.title}</span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-500 bg-slate-900 uppercase">
              {reportType} ACTIVE
            </span>
          </h3>
          <p className="text-[10px] font-medium text-slate-400 uppercase leading-normal tracking-wide">
            {currentHeader.desc}
          </p>
        </div>
      </div>

      {/* Dynamic Tab Element utilizing framer-motion AnimatePresence for smooth transitions */}
      <div className="relative overflow-hidden min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={reportType + timeframe + startDate + endDate}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
