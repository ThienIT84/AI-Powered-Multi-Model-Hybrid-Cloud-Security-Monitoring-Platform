import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  FileText, Shield, Layers, Activity, Download, Filter, Calendar, Printer, 
  FileSpreadsheet, Sparkles, Clock, Hourglass, ShieldCheck, AlertTriangle, 
  XCircle, CheckCircle2, ChevronRight, Globe, Terminal, HardDrive, Info, 
  ShieldAlert, Database, BookOpen, Layers3, Check, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

// Mock Aggregated Datasets for Historical Reporting ONLY
const MOCK_REPORT_LOGS = [
  { id: "REP-9801", name: "Daily SOC Security Operations Briefing", author: "Automated SOC Pipeline", status: "SIGNED", date: "2026-06-10 23:59" },
  { id: "REP-9784", name: "Weekly Executive Posture & Mitigation Audit", author: "CISO Review Board", status: "SIGNED", date: "2026-06-08 08:00" },
  { id: "REP-9612", name: "NIST CSF Compliance Assessment Ledger", author: "Audit Risk Controller", status: "SIGNED", date: "2026-06-01 14:30" },
  { id: "REP-9550", name: "Incident Investigation Case-Log T1190 Trace", author: "Lead Incident Responder", status: "COMPILED", date: "2026-05-28 11:15" },
  { id: "REP-9410", name: "Monthly Executive Advisory & Threat Portfolio", author: "SOC Threat Intelligence Team", status: "ARCHIVED", date: "2026-05-01 09:00" },
  { id: "REP-9322", name: "Strategic Vector Trend & Protocol Exposure Brief", author: "Automated Analytics Hub", status: "SIGNED", date: "2026-04-30 18:45" }
];

export function ReportsPage() {
  // Navigation & Page Layout Settings
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [activeSection, setActiveSection] = useState<string>("executive-summary");

  // Interactive Export Center States
  const [exportFormat, setExportFormat] = useState<"PDF" | "CSV" | "XLSX">("PDF");
  const [exportSelections, setExportSelections] = useState({
    executive: true,
    secops: true,
    incident: true,
    compliance: true,
    fusion: true
  });

  // Simulator Progress Modal State
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStep, setExportStep] = useState<string>("Queued in secure compliance build pipeline");
  const [exportTitle, setExportTitle] = useState<string>("");

  // Refs for Scroll Jumping
  const sectionRefs = {
    "executive-summary": useRef<HTMLDivElement>(null),
    "secops-reporting": useRef<HTMLDivElement>(null),
    "incident-resolution": useRef<HTMLDivElement>(null),
    "asset-impact": useRef<HTMLDivElement>(null),
    "fusion-reporting": useRef<HTMLDivElement>(null),
    "mitre-summary": useRef<HTMLDivElement>(null),
    "compliance-reporting": useRef<HTMLDivElement>(null),
    "report-library": useRef<HTMLDivElement>(null),
    "export-center": useRef<HTMLDivElement>(null)
  };

  const scrollToSection = (id: keyof typeof sectionRefs) => {
    setActiveSection(id);
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Timeframe-specific multiplier system to dynamically scale aggregated metrics
  const multiplier = useMemo(() => {
    switch (timeframe) {
      case "24h": return 0.12;
      case "7d": return 1.0;
      case "30d": return 4.3;
      case "90d": return 12.8;
      default: return 1.0;
    }
  }, [timeframe]);

  // Dynamic calculated metrics based on timeframe selection
  const liveKPIs = useMemo(() => {
    return {
      totalAlerts: Math.floor(12543 * multiplier),
      criticalAlerts: Math.floor(543 * multiplier),
      highAlerts: Math.floor(1824 * multiplier),
      mediumAlerts: Math.floor(5129 * multiplier),
      lowAlerts: Math.floor(5047 * multiplier),
      meanTimeToRespond: timeframe === "24h" ? "10.5 mins" : "12.4 mins",
      meanTimeToResolve: timeframe === "24h" ? "38.2 mins" : "42.5 mins",
      slaCompliance: timeframe === "24h" ? "96.4%" : "94.2%",
      failedSlaCases: Math.max(1, Math.floor(3 * multiplier)),
      openCases: timeframe === "24h" ? 4 : timeframe === "7d" ? 12 : timeframe === "30d" ? 38 : 94,
      resolvedCases: Math.floor(302 * multiplier),
      escalatedCases: Math.floor(34 * multiplier),
      totalFusionAlerts: Math.floor(1489 * multiplier),
      criticalFusionAlerts: Math.floor(41 * multiplier),
    };
  }, [timeframe, multiplier]);

  // Trigger Report Compilation Simulator
  const triggerCompilation = (title: string, format: string) => {
    setExportTitle(title);
    setExportProgress(0);
    setExportStep("Registering signature and allocating secure buffers...");
    setExportModalOpen(true);
  };

  // Run the Export Simulation Progress loop
  useEffect(() => {
    let interval: any = null;
    if (exportModalOpen && exportProgress < 100) {
      interval = setInterval(() => {
        setExportProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 18) + 6;
          if (next >= 100) {
            setExportStep("Completed and SHA-256 cryptographically notarized!");
            clearInterval(interval);
            return 100;
          }
          if (next > 75) {
            setExportStep("Applying asymmetric keys and compiling security certificates...");
          } else if (next > 45) {
            setExportStep(`Extracting historical metrics maps matching ${timeframe} timeframe...`);
          } else if (next > 15) {
            setExportStep("Generating charts SVG assets and compiling PDF/XLSX layouts...");
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [exportModalOpen, exportProgress, timeframe]);

  // ==========================================
  // SEGMENTED DATA PRESETS
  // ==========================================

  // 1. Security Operations Charts
  const threatDistributionData = useMemo(() => [
    { name: "SQL Injection", count: Math.floor(3125 * multiplier), fill: "#22d3ee" },
    { name: "XSS Probe", count: Math.floor(2841 * multiplier), fill: "#3b82f6" },
    { name: "Brute Force", count: Math.floor(2102 * multiplier), fill: "#a855f7" },
    { name: "Port Scan", count: Math.floor(1895 * multiplier), fill: "#f43f5e" },
    { name: "DoS Flood", count: Math.floor(1420 * multiplier), fill: "#eab308" },
    { name: "Credential Stuffing", count: Math.floor(950 * multiplier), fill: "#10b981" },
    { name: "Lateral Movement", count: Math.floor(410 * multiplier), fill: "#f97316" }
  ], [multiplier]);

  const alertVolumeTrendData = useMemo(() => {
    // Generate beautiful trend ticks depending on timeframe
    if (timeframe === "24h") {
      return [
        { name: "00:00", alerts: 82, critical: 4 },
        { name: "04:00", alerts: 61, critical: 1 },
        { name: "08:00", alerts: 140, critical: 11 },
        { name: "12:00", alerts: 210, critical: 18 },
        { name: "16:00", alerts: 245, critical: 24 },
        { name: "20:00", alerts: 154, critical: 12 },
        { name: "24:00", alerts: 98, critical: 6 }
      ];
    }
    const days = timeframe === "90d" ? ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseVal = timeframe === "90d" ? 1800 : timeframe === "30d" ? 800 : 180;
    return days.map((day, idx) => ({
      name: day,
      alerts: Math.floor((baseVal + (idx * 34) + Math.sin(idx) * 45) * (multiplier * 0.95)),
      critical: Math.floor((baseVal * 0.05 + Math.cos(idx) * 8) * (multiplier * 0.95))
    }));
  }, [timeframe, multiplier]);

  const severityData = useMemo(() => [
    { name: "Critical", value: liveKPIs.criticalAlerts, color: "#f43f5e" },
    { name: "High", value: liveKPIs.highAlerts, color: "#f97316" },
    { name: "Medium", value: liveKPIs.mediumAlerts, color: "#eab308" },
    { name: "Low", value: liveKPIs.lowAlerts, color: "#3b82f6" }
  ], [liveKPIs]);

  // 2. Incident Statistics
  const resolutionPriorityData = useMemo(() => [
    { priority: "Critical", resolved: Math.floor(14 * multiplier), breaches: Math.floor(1 * (multiplier * 0.4)) },
    { priority: "High", resolved: Math.floor(45 * multiplier), breaches: Math.floor(2 * (multiplier * 0.4)) },
    { priority: "Medium", resolved: Math.floor(118 * multiplier), breaches: Math.floor(4 * (multiplier * 0.4)) },
    { priority: "Low", resolved: Math.floor(125 * multiplier), breaches: Math.floor(1 * (multiplier * 0.4)) }
  ], [multiplier]);

  // 3. Security Asset Impact
  const targetedAssets = [
    { hostname: "aws-prod-db-rds-01 (MySQL primary Customer Store)", type: "Relational Database Cluster", alerts: 419, riskScore: 94 },
    { hostname: "web-gateway-k8s-pod-x92 (Customer Router Proxy)", type: "Ingress Web Controller", alerts: 302, riskScore: 89 },
    { hostname: "aws-ec2-prod-bastion (Jump-host Secure Shell)", type: "Core Linux Bastion Vault", alerts: 245, riskScore: 81 },
    { hostname: "alb-external-ingress (Web Application Firewall)", type: "Network Ingress Load Balancer", alerts: 198, riskScore: 78 },
    { hostname: "dns-primary-bind9 (Recursive Domain Resolver)", type: "Active Directory DNS Service", alerts: 112, riskScore: 56 }
  ];

  const sourceAttackers = [
    { ip: "185.220.101.5", country: "RU", count: 312, severity: "Critical / High Vector" },
    { ip: "45.122.90.15", country: "DE", count: 188, severity: "High PortSweeps" },
    { ip: "109.231.42.110", country: "CN", count: 142, severity: "Medium DoS Trigger" },
    { ip: "85.203.45.18", country: "NL", count: 95, severity: "Medium Crawlers" },
    { ip: "198.51.100.42", country: "US", count: 81, severity: "Low SSH Probe" }
  ];

  // 4. Fusion Alert Reporting Charts
  const fusionTrendData = useMemo(() => {
    const steps = timeframe === "24h" ? ["00:00", "06:00", "12:00", "18:00", "24:00"] : ["W1", "W2", "W3", "W4"];
    return steps.map((step, idx) => ({
      name: step,
      fusionAlerts: Math.floor((120 + idx * 35 + Math.sin(idx) * 20) * multiplier * 0.15),
      confidence: 98 + parseFloat(Math.sin(idx).toFixed(1))
    }));
  }, [timeframe, multiplier]);

  // 5. MITRE Observed Tactics
  const mitreTactics = [
    { name: "Initial Access", percentage: 88, desc: "Exploit public-facing endpoints (T1190)" },
    { name: "Execution", percentage: 64, desc: "Process spawning of unprivileged commands" },
    { name: "Persistence", percentage: 45, desc: "Rogue systemd service installation" },
    { name: "Privilege Escalation", percentage: 32, desc: "Unauthorized sudo parameter requests" },
    { name: "Defense Evasion", percentage: 75, desc: "Clear command history & system log wiping" },
    { name: "Discovery", percentage: 60, desc: "Local service sweeps and daemon discovery" },
    { name: "Lateral Movement", percentage: 15, desc: "Administrative session copying attempts" },
    { name: "Exfiltration", percentage: 8, desc: "Encrypted payload stream routing" }
  ];

  const topMitreTechniques = [
    { id: "T1190", name: "Exploit Public-Facing Application", count: Math.floor(412 * multiplier) },
    { id: "T1046", name: "Network Service Scanning", count: Math.floor(302 * multiplier) },
    { id: "T1110", name: "Brute Force Authentication Probes", count: Math.floor(215 * multiplier) },
    { id: "T1498", name: "Network Denial of Service Floods", count: Math.floor(182 * multiplier) },
    { id: "T1083", name: "File and Directory Discovery Profiles", count: Math.floor(98 * multiplier) }
  ];

  // CISO Recommendations
  const executiveRecommendations = [
    { title: "Consolidate Public Web Gateway Filters", desc: "Enforce strict mitigation parameters against SQLi/XSS on port 443 endpoints.", impact: "HIGH IMPACT", regulatory: "NIST CSF PR.DS" },
    { title: "Review Multi-Cloud Tenant Admin Roles", desc: "Audit and remediate permissive IAM profiles assigned to container host deamons.", impact: "CRITICAL IMPACT", regulatory: "SOC2 Trust Criteria" },
    { title: "Establish SSH Gateways Session Controls", desc: "Mandate hardware key MFA and absolute session timeout parameters globally.", impact: "HIGH IMPACT", regulatory: "NIST CSF PR.AC" }
  ];

  return (
    <div className="space-y-6 pb-20 select-none text-slate-800 dark:text-slate-100 min-h-screen" id="hybrid-reporting-system">
      
      {/* ==========================================
          1. HEADER PANEL
          ========================================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-border/80 gap-4" id="reports-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase">
              Security Reporting & Executive Reporting Layer
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-sans">
            Executive Security Reports Hub
          </h2>
          <p className="text-[10.5px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider font-mono font-bold leading-normal">
            Operational compliance auditing and historical performance indices ledger
          </p>
        </div>

        {/* Timeframe Controls and Action Utilities */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <div className="bg-slate-100 dark:bg-slate-900 border border-border rounded-lg p-0.5 flex">
            {(["24h", "7d", "30d", "90d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-[9px] uppercase font-black tracking-wider transition ${timeframe === tf ? "bg-cyan-500 text-slate-950 font-black" : "text-slate-500 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white border-none cursor-pointer"}`}
              >
                {tf === "24h" ? "24 Hours" : tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <button
            onClick={() => triggerCompilation("Standard Compliance & SLA Packet", "PDF")}
            className="flex items-center gap-1.5 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-border px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-foreground cursor-pointer transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>

          <button
            onClick={() => triggerCompilation("SOC Historical Operations Database Dump", "XLSX")}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase text-slate-950 cursor-pointer transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export XLSX Ledger</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar Quick Links + Long Scrolling Report binder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        
        {/* Left Side Table of Contents Sidebar */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 bg-slate-50 dark:bg-slate-950/20 border border-border p-4.5 rounded-xl space-y-4" id="table-of-contents">
          <div className="border-b border-border/20 pb-2 flex items-center gap-2 select-none">
            <BookOpen size={13} className="text-cyan-500" />
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
              Report Binder Chapters
            </h3>
          </div>
          
          <div className="flex flex-col gap-1 font-mono text-[9px] font-bold uppercase tracking-wider">
            {[
              { id: "executive-summary", label: "1. Executive Summary" },
              { id: "secops-reporting", label: "2. Security Operations" },
              { id: "incident-resolution", label: "3. Incident Analytics" },
              { id: "asset-impact", label: "4. Asset Impact Report" },
              { id: "fusion-reporting", label: "5. Fusion Alert Metrics" },
              { id: "mitre-summary", label: "6. MITRE Tactic Summary" },
              { id: "compliance-reporting", label: "7. Compliance Summary" },
              { id: "report-library", label: "8. Report Library" },
              { id: "export-center", label: "9. Export Center" }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => scrollToSection(ch.id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between border-none cursor-pointer ${activeSection === ch.id ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"}`}
              >
                <span>{ch.label}</span>
                <ChevronRight size={10} className={`opacity-60 transition ${activeSection === ch.id ? "translate-x-0.5 text-cyan-500" : ""}`} />
              </button>
            ))}
          </div>

          <div className="p-3 bg-secondary/10 border border-border/20 rounded-lg text-[7.5px] uppercase font-mono tracking-normal leading-relaxed text-slate-500 select-none">
            <span>
              All data is generated from the continuous, offline compliance metric log files, matching time bounds perfectly.
            </span>
          </div>
        </div>

        {/* Central Long Scrolling Binder */}
        <div className="lg:col-span-9 space-y-8" id="scrolling-binder">
          
          {/* ==========================================
              2. EXECUTIVE KPI BAR
              ========================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 font-mono select-none" id="executive-kpi-bar">
            {[
              { label: "Security Incidents", value: liveKPIs.totalAlerts.toLocaleString(), sub: `Events in ${timeframe}`, color: "text-foreground" },
              { label: "Critical Risk Cases", value: liveKPIs.criticalAlerts.toLocaleString(), sub: "Immediate SLA focus", color: "text-rose-500" },
              { label: "Mean MTTR Logged", value: liveKPIs.meanTimeToResolve, sub: "High Priority Average", color: "text-purple-400" },
              { label: "SLA Commit Rate", value: liveKPIs.slaCompliance, sub: "90% Standard Target", color: "text-emerald-400" },
              { label: "Total Fusion Alerts", value: liveKPIs.totalFusionAlerts.toLocaleString(), sub: "Bayesian Consensus", color: "text-cyan-400" },
              { label: "Historical risk trend", value: timeframe === "24h" ? "-2.1%" : "-5.4%", sub: "Decreased vs last period", color: "text-emerald-500" }
            ].map((k, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3.5 hover:border-border/80 transition-all">
                <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-extrabold block">
                  {k.label}
                </span>
                <span className={`text-[15px] font-black block mt-2 ${k.color}`}>
                  {k.value}
                </span>
                <span className="text-[7px] text-zinc-500 font-medium block mt-1 uppercase">
                  {k.sub}
                </span>
              </div>
            ))}
          </div>

          {/* ==========================================
              3. EXECUTIVE SECURITY SUMMARY
              ========================================== */}
          <div ref={sectionRefs["executive-summary"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="executive-security-summary">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-cyan-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                  1. Executive Security Summary Briefing
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-mono text-[7px] font-black uppercase">
                ACTIVE MITIGATION STEADY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono text-[9px] leading-relaxed">
              <div className="md:col-span-7 space-y-3.5">
                <h4 className="text-[10px] font-black uppercase text-foreground">
                  Security Operations Assessment Executive Summary
                </h4>
                <p className="text-slate-500 uppercase font-semibold">
                  This report documents the security posture of the platform during the past {timeframe} window. 
                  The Bayesian model consensus has active intrusion filters monitoring and routing events 
                  automatically. Raw events aggregated in secondary data brokers confirm zero successful egress bypasses.
                </p>
                <div className="bg-secondary/15 p-3.5 border border-border/30 rounded-lg flex gap-3 text-slate-500">
                  <Info size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                  <p className="uppercase text-[8px] tracking-normal font-semibold">
                    Strategic threat trends verify that automated public gateway SQL injection probes represent our highest relative threat exposure. 
                    All perimeter networks conform strictly with continuous NIST compliance parameters.
                  </p>
                </div>
              </div>

              {/* Recommendations Column */}
              <div className="md:col-span-5 space-y-3">
                <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-widest block border-b border-border/10 pb-1">
                  CISO Strategic Mitigation Advice
                </span>
                
                <div className="space-y-2">
                  {executiveRecommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-border/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between font-black text-[7.5px]">
                        <span className="text-foreground uppercase">{rec.title}</span>
                        <span className="text-rose-500 uppercase font-black">{rec.impact}</span>
                      </div>
                      <p className="text-[7.5px] text-zinc-500 uppercase leading-normal font-semibold">
                        {rec.desc} - <b className="text-cyan-500 font-black">{rec.regulatory}</b>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              4. SECURITY OPERATIONS REPORTING
              ========================================== */}
          <div ref={sectionRefs["secops-reporting"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="security-operations-reporting">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <Terminal size={14} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                2. Security Operations Operations & Volumetrics
              </h3>
            </div>

            {/* Sub-grid of charts and statistics on attack classes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-[9px]">
              
              {/* Threat Distribution Bars (T1) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3">
                <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground block">
                  Threat Vector Distribution Matrix
                </span>
                <div className="h-48 w-full text-zinc-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={threatDistributionData} layout="vertical" margin={{ left: -15, right: 10, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                      <XAxis type="number" stroke="currentColor" fontSize={7} />
                      <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={8} fontWeight="bold" width={95} />
                      <Tooltip 
                        contentStyle={{ background: "#090d16", border: "1px solid #1e293b" }}
                        labelStyle={{ fontSize: "8px", fontWeight: "bold", color: "#64748b" }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {threatDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Distribution Donut / Stats (T2) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground block mb-3">
                    Aggregated Incident Severity Index
                  </span>
                  
                  <div className="h-32 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[7px] text-slate-500 uppercase font-black">Period</span>
                      <span className="text-[10px] font-black text-foreground">SLA Verified</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[8px] uppercase font-bold">
                  {severityData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1 bg-background/50 border border-border/20 rounded">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-500">{item.name}:</span>
                      <span className="text-foreground ml-auto">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Volume Trend Timeline */}
              <div className="lg:col-span-12 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground">
                    Chronological Alert Volumetric Flow Trend [{timeframe.toUpperCase()}]
                  </span>
                  <span className="text-[7px] text-cyan-500 font-extrabold uppercase">
                    Aggregated Metrics Stream Line Matching active timeline
                  </span>
                </div>

                <div className="h-36 w-full text-zinc-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={alertVolumeTrendData} margin={{ left: -15, right: 10, top: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                      <XAxis dataKey="name" stroke="currentColor" fontSize={7} fontWeight="bold" />
                      <YAxis stroke="currentColor" fontSize={7} />
                      <Tooltip contentStyle={{ background: "#090d16", border: "1px solid #1e293b" }} />
                      <Area type="monotone" dataKey="alerts" stroke="#22d3ee" fillOpacity={1} fill="url(#colorAlerts)" strokeWidth={2} name="Total Daily Scans" />
                      <Line type="monotone" dataKey="critical" stroke="#f43f5e" strokeWidth={1.5} name="SLA Escalations" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ==========================================
              5. INCIDENT RESOLUTION ANALYTICS
              ========================================== */}
          <div ref={sectionRefs["incident-resolution"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="incident-resolution-analytics">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                  3. Incident Resolution & SLA Performance Metrics
                </h3>
              </div>
              <span className="text-[7.5px] text-zinc-500 uppercase font-black tracking-widest font-mono">
                Data source: Case Management Database Only
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-[9px]">
              
              {/* Performance Indicator Cards */}
              <div className="lg:col-span-5 space-y-2.5">
                {[
                  { label: "Pending Open Group Cases", value: `${liveKPIs.openCases} Tickets`, desc: "Currently routed inside operations tier queues" },
                  { label: "Resolved Operations Sign-offs", value: `${liveKPIs.resolvedCases} Tickets`, desc: "Consensus sign-offs signed and completed successfully" },
                  { label: "Active Escalations Issued", value: `${liveKPIs.escalatedCases} Cases`, desc: "Transferred from Tier 1 triage to Tier 3 response groups" },
                  { label: "Average Metric resolution Time", value: liveKPIs.meanTimeToResolve, desc: "Log entry from analyst trigger bounds to closure" },
                  { label: "SLA Deadline Violations", value: `${liveKPIs.failedSlaCases} Breaches`, desc: "Failed to meet regulatory timeline bounds" }
                ].map((ind, idx) => (
                  <div key={idx} className="p-3 bg-secondary/10 border border-border/30 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-black uppercase text-foreground block">
                        {ind.label}
                      </span>
                      <span className="text-[7px] text-zinc-500 uppercase font-semibold">
                        {ind.desc}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-foreground shrink-0 px-2 py-0.5 bg-background border border-border/20 rounded">
                      {ind.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* T3: Chart of Resolution status by priority */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground block">
                    Operations Tickets Resolution Volume vs SLA Breaches
                  </span>
                  <span className="text-[7px] text-slate-500 uppercase block font-semibold">
                    Categorized resolution bounds mapped to incident priorities indices
                  </span>
                </div>

                <div className="h-48 w-full text-zinc-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resolutionPriorityData} margin={{ left: -15, right: 10, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                      <XAxis dataKey="priority" stroke="currentColor" fontSize={8} fontWeight="bold" />
                      <YAxis stroke="currentColor" fontSize={7} />
                      <Tooltip contentStyle={{ background: "#090d16", border: "1px solid #1e293b" }} />
                      <Legend formatter={(value) => <span className="text-[8px] uppercase font-bold text-zinc-400">{value}</span>} />
                      <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="SLA Resolved Closed" />
                      <Bar dataKey="breaches" fill="#f43f5e" radius={[4, 4, 0, 0]} name="SLA Limit Breached" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ==========================================
              6. SECURITY ASSET IMPACT REPORTING
              ========================================== */}
          <div ref={sectionRefs["asset-impact"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="security-asset-impact">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-purple-500" />
                <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                  4. Security Asset Impact & Attacker Attribution Reporting
                </h3>
              </div>
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-mono text-[7px] font-black uppercase">
                REPORTING ONLY - NO LIVE INVESTIGATION
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-[9px] leading-relaxed">
              
              {/* Assets List */}
              <div className="bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3">
                <span className="text-[9.5px] font-black uppercase text-foreground block border-b border-border/10 pb-1.5">
                  Top Targeted Platform Infrastructure Assets
                </span>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border text-zinc-500 font-black text-[7.5px] uppercase">
                        <th className="pb-2">Target Hostname</th>
                        <th className="pb-2 text-center">Alerts</th>
                        <th className="pb-2 text-right">Risk Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-semibold text-slate-600 dark:text-zinc-300">
                      {targetedAssets.map((asset, i) => (
                        <tr key={i} className="hover:bg-secondary/5">
                          <td className="py-2.5">
                            <span className="text-foreground font-bold block">{asset.hostname.split(" ")[0]}</span>
                            <span className="text-[7.5px] text-zinc-500 uppercase">{asset.type}</span>
                          </td>
                          <td className="py-2.5 text-center text-slate-900 dark:text-zinc-100">{Math.floor(asset.alerts * multiplier)}</td>
                          <td className="py-2.5 text-right font-black">
                            <span className={`px-2 py-0.5 rounded text-[7px] uppercase tracking-wider font-extrabold border ${asset.riskScore >= 80 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"}`}>
                              {asset.riskScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source Attackers List */}
              <div className="bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3">
                <span className="text-[9.5px] font-black uppercase text-foreground block border-b border-border/10 pb-1.5">
                  Top Malicious Attacking IP Sources Logged
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border text-zinc-500 font-black text-[7.5px] uppercase">
                        <th className="pb-2">Source Address IP</th>
                        <th className="pb-2 text-center">Country</th>
                        <th className="pb-2 text-center">Probes Count</th>
                        <th className="pb-2 text-right">Top Threat Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-semibold text-slate-600 dark:text-zinc-300">
                      {sourceAttackers.map((att, i) => (
                        <tr key={i} className="hover:bg-secondary/5">
                          <td className="py-3 font-bold text-cyan-600 dark:text-cyan-400">
                            {att.ip}
                          </td>
                          <td className="py-3 text-center">{att.country}</td>
                          <td className="py-3 text-center text-slate-900 dark:text-zinc-100">{Math.floor(att.count * multiplier)}</td>
                          <td className="py-3 text-right uppercase text-[7.5px] font-black text-rose-500">
                            {att.severity.split(" ")[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          {/* ==========================================
              7. FUSION ALERT REPORTING
              ========================================== */}
          <div ref={sectionRefs["fusion-reporting"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="fusion-alert-reporting">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <Database size={14} className="text-cyan-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                5. Bayesian Fusion Consensus Alert Reporting
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-[9px]">
              
              {/* Metrics blocks */}
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                  { label: "Fusion Consensus Alerts", value: liveKPIs.totalFusionAlerts.toLocaleString(), sub: "Total verified alarms" },
                  { label: "Critical Escalations", value: liveKPIs.criticalFusionAlerts.toLocaleString(), sub: "Immediate manual action required" },
                  { label: "Bayesian Consensus Conf.", value: "98.9%", sub: "Aggregated matching parameter" },
                  { label: "Telemetry Over-suppression", value: "-89.4%", sub: "Attained false positive mitigation" }
                ].map((b, i) => (
                  <div key={i} className="p-3 bg-secondary/10 border border-border/30 rounded-lg">
                    <span className="text-[7.5px] uppercase font-bold text-zinc-500 block leading-tight">
                      {b.label}
                    </span>
                    <span className="text-xs font-mono font-black text-foreground block mt-1.5 leading-tight">
                      {b.value}
                    </span>
                    <span className="text-[7px] text-zinc-500 block leading-none mt-1 uppercase font-semibold">
                      {b.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fusion trends chart */}
              <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase text-foreground block leading-tight">
                    Bayesian Fusion Alerts & Consensus Level Metrics
                  </span>
                  <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-relaxed">
                    Evaluated matching confidence factors plotted across historical metrics checkpoints
                  </span>
                </div>

                <div className="h-44 w-full text-zinc-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fusionTrendData} margin={{ left: -15, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.12} />
                      <XAxis dataKey="name" stroke="currentColor font-sans" fontSize={8} />
                      <YAxis stroke="currentColor font-sans" fontSize={8} />
                      <Tooltip contentStyle={{ background: "#090d16", border: "1px solid #1e293b" }} />
                      <Legend formatter={(value) => <span className="text-[8px] uppercase font-bold text-zinc-400">{value}</span>} />
                      <Line type="monotone" dataKey="fusionAlerts" stroke="#22d3ee" strokeWidth={2} name="Consensus Alerts" dot />
                      <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={1} name="Average Confidence %" dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ==========================================
              8. MITRE REPORTING SUMMARY
              ========================================== */}
          <div ref={sectionRefs["mitre-summary"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="mitre-attack-summary">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2">
                <Layers3 size={14} className="text-cyan-500" />
                <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                  6. ATT&CK Framework Mapping Summary
                </h3>
              </div>
              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-mono text-[7px] font-black uppercase">
                EXECUTIVE REPORTS ONLY - MATRIX NOT INTERACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-[9px] leading-relaxed">
              
              {/* Tactics list with micro indicator meters */}
              <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3.5">
                <span className="text-[9.5px] font-black uppercase text-foreground block border-b border-border/10 pb-1.5">
                  Top Observed Enterprise Security ATT&CK Tactics
                </span>

                <div className="space-y-3">
                  {mitreTactics.map((tac, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-black text-[8px]">
                        <span className="text-foreground uppercase">{tac.name}</span>
                        <span className="text-[#64748b]">{tac.percentage}% Coverage</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-secondary border border-border/10 rounded-full overflow-hidden block">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                          style={{ width: `${tac.percentage}%` }}
                        />
                      </div>
                      
                      <span className="text-[7px] text-zinc-500 uppercase font-semibold block leading-none">
                        Top Technique Vector: {tac.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Techniques List */}
              <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/10 border border-border/40 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase text-foreground block border-b border-border/10 pb-1.5">
                    Highest Aggregated Attack Techniques Logged
                  </span>

                  <div className="space-y-4 pt-1.5 font-semibold text-slate-600 dark:text-zinc-300">
                    {topMitreTechniques.map((tech, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/10 pb-2 last:border-none last:pb-0">
                        <div>
                          <span className="bg-cyan-50 dark:bg-slate-950 text-cyan-600 dark:text-cyan-400 font-extrabold px-1.5 py-0.5 border border-cyan-100 dark:border-border/30 rounded text-[7.5px] mr-2">
                            {tech.id}
                          </span>
                          <span className="text-slate-900 dark:text-zinc-100 font-bold">{tech.name}</span>
                        </div>
                        <span className="text-foreground font-black text-right">{tech.count.toLocaleString()} Probes</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-lg text-[7.5px] uppercase tracking-normal leading-relaxed text-zinc-500 select-none">
                  Reference: Mappings strictly verified using the MITRE ATT&CK Enterprise Matrix version 14 standard files.
                </div>
              </div>

            </div>
          </div>

          {/* ==========================================
              9. COMPLIANCE REPORTING
              ========================================== */}
          <div ref={sectionRefs["compliance-reporting"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="compliance-reporting-summary">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-cyan-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                  7. System Framework & Regulatory Compliance Reporting
                </h3>
              </div>
              <span className="bg-slate-500/10 text-slate-500 border border-border/20 px-2 py-0.5 rounded font-mono text-[7px] font-black uppercase">
                COMPLIANCE INDEX ONLY - HISTORICAL RECORDS
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-mono text-[9px] select-none">
              {[
                { label: "SOC2 Type II Compliance", value: "95.8%", text: "Passed: 104 / 106 controls", status: "Compliant" },
                { label: "NIST CSF 2.0 Mapping", value: "91.2%", text: "Passed: 88 / 94 controls", status: "Robust" },
                { label: "MITRE ATT&CK Protections", value: "88.5%", text: "Passed: 16 / 18 controls", status: "Coverage High" },
                { label: "Internal System SOC Controls", value: "96.0%", text: "Passed: 48 / 50 controls", status: "Compliant" }
              ].map((c, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-950/15 border border-border/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[7.5px] uppercase font-black text-zinc-500 block leading-none">
                      {c.label}
                    </span>
                    <span className="text-xl font-mono font-black text-cyan-400 block mt-2">
                      {c.value}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] uppercase font-extrabold text-emerald-500 block">
                      {c.status}
                    </span>
                    <span className="text-[7px] text-zinc-500 block mt-0.5 font-semibold">
                      {c.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/10 border border-border/45 p-4 rounded-xl font-mono text-[9px] grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-zinc-500 uppercase font-black text-[7.5px] block leading-none mb-1">Audit framework coverage</span>
                <span className="text-xs font-black text-foreground">95.8% Compliant</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-black text-[7.5px] block leading-none mb-1">Passed checks count</span>
                <span className="text-xs font-black text-emerald-500">256 Controls Passed</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-black text-[7.5px] block leading-none mb-1">Deviations registered</span>
                <span className="text-xs font-black text-rose-500 animate-pulse">3 Failed Checks</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-black text-[7.5px] block leading-none mb-1">Pending analyst signatures</span>
                <span className="text-xs font-black text-amber-500 animate-pulse">5 Outstanding reviews</span>
              </div>
            </div>
          </div>

          {/* ==========================================
              10. REPORT LIBRARY
              ========================================== */}
          <div ref={sectionRefs["report-library"]} className="bg-card border border-border rounded-xl p-5 space-y-5" id="report-library-archives">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <FileCheck size={14} className="text-indigo-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
                8. Enterprise SOC Compliance Report Library
              </h3>
            </div>

            <div className="overflow-x-auto font-mono text-[9px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-zinc-500 font-extrabold uppercase text-[8px] tracking-wider select-none">
                    <th className="pb-2.5">Report Package Identifier</th>
                    <th className="pb-2.5">Owner / Issuer</th>
                    <th className="pb-2.5 text-center">Status Index</th>
                    <th className="pb-2.5 text-center">Compilation Timestamp</th>
                    <th className="pb-2.5 text-right font-black">Archive Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25 font-semibold text-slate-300">
                  {MOCK_REPORT_LOGS.map((rep) => (
                    <tr key={rep.id} className="hover:bg-secondary/10 transition duration-150">
                      <td className="py-3">
                        <span className="text-foreground font-black block font-sans text-[9.5px]">
                          {rep.name}
                        </span>
                        <span className="text-[#64748b] text-[7.5px] uppercase font-bold tracking-widest">{rep.id}</span>
                      </td>
                      <td className="py-3 text-slate-650 dark:text-zinc-400 font-bold uppercase">{rep.author}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[7.5px] uppercase font-black border tracking-tight ${rep.status === "SIGNED" ? "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" : rep.status === "COMPILED" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-zinc-550 bg-secondary border-border"}`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 text-center text-zinc-400 select-none">{rep.date}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => triggerCompilation(rep.name, "PDF")}
                          className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/30 transition-all font-black px-2.5 py-1.5 rounded text-[8px] uppercase tracking-wider cursor-pointer"
                        >
                          Download Pack
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==========================================
              11. EXPORT CENTER
              ========================================== */}
          <div ref={sectionRefs["export-center"]} className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-lg" id="export-center-ref font-mono">
            <div className="border-b border-border/20 pb-3 flex items-center gap-1.5 select-none">
              <Download className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-sans font-black text-foreground uppercase tracking-widest block">
                9. Corporate Compliance Exports & Notary Panel
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-[9px] leading-relaxed">
              
              {/* Form elements */}
              <div className="md:col-span-8 space-y-4">
                <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-widest block">
                  Select Modules to encapsulate inside secure audit packet
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "executive", label: "Executive Threat & Posture Report" },
                    { id: "secops", label: "Security Operations & Volume Trends Metrics" },
                    { id: "incident", label: "Incident Resolution Operations and SLA Database" },
                    { id: "compliance", label: "Corporate Framework Compliance Audit" },
                    { id: "fusion", label: "Bayesian Fusion Consensus Alerts Metrics" }
                  ].map((sub) => (
                    <label key={sub.id} className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-950/15 border border-border/40 hover:border-border/80 transition-all rounded-lg cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={(exportSelections as any)[sub.id]}
                        onChange={() => setExportSelections(prev => ({ ...prev, [sub.id]: !(prev as any)[sub.id] }))}
                        className="mt-0.5 rounded border-border text-cyan-500 filter"
                      />
                      <span className="uppercase text-[8px] font-black text-slate-700 dark:text-zinc-200 block tracking-normal">
                        {sub.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format selection and compile button */}
              <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950/10 border border-border/40 p-4.5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[8px] uppercase text-zinc-500 font-extrabold tracking-widest block">
                    Choose Crytographic Export Format
                  </span>

                  <div className="bg-background border border-border p-0.5 rounded-lg flex overflow-hidden">
                    {(["PDF", "CSV", "XLSX"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`flex-1 py-1.5 text-[8.5px] uppercase tracking-wider font-extrabold select-none border-none transition-all ${exportFormat === fmt ? "bg-cyan-500 text-slate-950 font-black rounded-md" : "text-zinc-500 hover:text-zinc-300 cursor-pointer"}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => triggerCompilation("Enterprise SOC Audit Briefing Compilation", exportFormat)}
                  className="bg-cyan-500 text-slate-950 w-full text-center py-3.5 font-black uppercase text-[9px] tracking-wider rounded-lg border-none hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Notarize & Compile Briefing Pack</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          EXPORT PROGRESS MODAL SIMULATOR
          ========================================== */}
      <AnimatePresence>
        {exportModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border max-w-md w-full p-6 rounded-2xl space-y-5 shadow-2xl font-mono text-[9px] relative select-none uppercase font-bold"
            >
              <div className="space-y-1 select-none">
                <span className="text-[7.5px] text-cyan-500 tracking-[0.2em] block font-black leading-none">
                  SECURE NOTARY VERIFICATION PIPELINE
                </span>
                <p className="text-xs font-black text-foreground">
                  {exportTitle}
                </p>
                <p className="text-[7.5px] text-zinc-500 leading-normal lowercase font-mono">
                  Target compilation format: <b className="uppercase dark:text-cyan-400 font-black">{exportFormat}</b> ledger
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[7px] text-zinc-500 font-extrabold tracking-widest">
                  <span>Compilation: {exportProgress}% Completed</span>
                  <span className={`${exportProgress === 100 ? "text-emerald-500 animate-pulse" : ""}`}>
                    {exportStep}
                  </span>
                </div>

                <div className="w-full h-2 bg-secondary border border-border/10 rounded-full overflow-hidden block">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-border/20 pt-3 flex gap-2 justify-end">
                {exportProgress === 100 ? (
                  <button
                    onClick={() => {
                      setExportModalOpen(false);
                      setExportProgress(0);
                    }}
                    className="bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded uppercase text-[8.5px] tracking-wider border-none cursor-pointer"
                  >
                    Download Compiled Ledger
                  </button>
                ) : (
                  <button
                    onClick={() => setExportModalOpen(false)}
                    className="bg-secondary text-slate-500 hover:text-slate-800 border border-border/40 px-3 py-1.5 rounded uppercase text-[8px] tracking-wider cursor-pointer"
                  >
                    Cancel Compilation
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
