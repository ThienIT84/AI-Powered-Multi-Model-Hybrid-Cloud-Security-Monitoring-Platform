import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Workflow, 
  PlayCircle, 
  Activity, 
  HelpCircle,
  Terminal,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw,
  Search,
  Filter,
  List,
  Grid,
  Shield,
  Eye,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertOctagon,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
  BookOpen,
  CheckCircle,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Check,
  X,
  Database,
  BarChart3,
  CheckSquare,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Playbook, PlaybookAction } from "../components/playbooks/playbooksConfig";
import { 
  initialPlaybooks, 
  mockIncidents as initialIncidents, 
  mockCampaigns, 
  mitreTechniques, 
  effectivenessMetrics, 
  kbLibrary,
  MockIncident 
} from "../components/playbooks/playbookMockData";

export function PlaybooksPage({ isDarkMode = true }: { isDarkMode?: boolean; key?: string }) {
  // Navigation Tabs state: overview, workspace, analytics
  const [activeTab, setActiveTab] = useState<"overview" | "workspace" | "analytics">("workspace");

  // Playbook Library state
  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [layoutStyle, setLayoutStyle] = useState<"grid" | "table">("grid");
  
  // MITRE Matrix state - technique filter matching
  const [selectedMitreId, setSelectedMitreId] = useState<string | null>(null);

  // SOC Workspace state
  const [incidents, setIncidents] = useState<MockIncident[]>(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidents[0]?.id || "INC-9011");
  const [terminalLogs, setTerminalLogs] = useState<{ [incidentId: string]: string[] }>({
    "INC-9011": [
      "[10:20:15] [ALERT_INGRESS] Detected raw packet payload targeting authentication gateway.",
      "[10:20:15] [AI_ENGINE] Deep evaluation: XSS confidence 98.2%. Severity level set to Critical.",
      "[10:20:16] [FUSION_LAYER] Aggregating Zeek http.log and Suricata Alert. Consensus achieved.",
      "[10:20:16] [STANDBY] Ready for SOC Analyst investigation protocols."
    ]
  });

  // Selected incident details computed
  const activeIncident = useMemo(() => {
    return incidents.find(inc => inc.id === selectedIncidentId) || incidents[0];
  }, [incidents, selectedIncidentId]);

  // Playbook detail modal state
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<"general" | "detection" | "steps" | "history">("general");

  // Attack Campaign selected
  const [campaignId, setCampaignId] = useState("camp-1");
  const activeCampaign = useMemo(() => {
    return mockCampaigns.find(c => c.id === campaignId) || mockCampaigns[0];
  }, [campaignId]);

  // UTC clock time ticker state
  const [utcTime, setUtcTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const mins = String(now.getUTCMinutes()).padStart(2, "0");
      const secs = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${year}-${month}-${day} ${hours}:${mins}:${secs} UTC`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync active playbook triggered on MITRE Click
  const handleMitreClick = (techId: string) => {
    if (selectedMitreId === techId) {
      setSelectedMitreId(null); // Clear filter
    } else {
      setSelectedMitreId(techId);
      setCategoryFilter("all"); // Reset category filter to view MITRE technique items
      // Auto-scrolling down to library container
      const libSection = document.getElementById("playbooks-library-anchor");
      if (libSection) {
        libSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Playbook activation toggle
  const togglePlaybookState = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id === id) {
        const nextStatus = pb.status === "active" ? "inactive" : "active";
        return { ...pb, status: nextStatus, updatedAt: "Just now" };
      }
      return pb;
    }));
  };

  // Open playbook model popup
  const inspectPlaybook = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setModalActiveTab("general");
    setIsModalOpen(true);
  };

  // Simulation handler inside Workspace Simulator
  const executeSimAction = (actionType: "Investigate" | "Contain" | "Monitor" | "Escalate" | "Close") => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    let logLine = "";
    let nextStatus: MockIncident["status"] = activeIncident.status;

    switch (actionType) {
      case "Investigate":
        nextStatus = "Investigating";
        logLine = `[${timestamp}] [INVESTIGATION] SOC Analyst initiated core forensic diagnostics. Reviewing payload matching UID...`;
        break;
      case "Contain":
        nextStatus = "Contained";
        logLine = `[${timestamp}] [MITIGATION] Dispatched isolate request. Core pfSense alias state injected. Bad traffic severed!`;
        break;
      case "Monitor":
        nextStatus = "Monitoring";
        logLine = `[${timestamp}] [MONITORING] Enabled passive watch loop. Flow delta interval tracing activated. Host clean.`;
        break;
      case "Escalate":
        nextStatus = "Escalated";
        logLine = `[${timestamp}] [ESCALATION] Created threat file Jira task SEC-${activeIncident.id}. Elevating threat to Tier 2 squad.`;
        break;
      case "Close":
        nextStatus = "Closed";
        logLine = `[${timestamp}] [RESOLUTION] Case completed. Incident confirmed resolved under FCAJ v3.0 playbook standards. Log archived.`;
        break;
    }

    // Update Incident State
    setIncidents(prev => prev.map(inc => {
      if (inc.id === activeIncident.id) {
        return { ...inc, status: nextStatus };
      }
      return inc;
    }));

    // Append Logs
    setTerminalLogs(prev => {
      const current = prev[activeIncident.id] || [];
      return {
        ...prev,
        [activeIncident.id]: [...current, logLine]
      };
    });
  };

  // Reset simulator
  const resetIncidentSimulator = () => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === activeIncident.id) {
        return { ...inc, status: "New Alert" };
      }
      return inc;
    }));
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setTerminalLogs(prev => ({
      ...prev,
      [activeIncident.id]: [
        `[${timestamp}] [SYS_RESET] Incident state rejuvenated. Telemetry buffers synchronized. Target active.`
      ]
    }));
  };

  // Filtered Playbooks computed
  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter(pb => {
      // MITRE override filter
      if (selectedMitreId) {
        const matchingTech = mitreTechniques.find(m => m.id === selectedMitreId);
        if (matchingTech && !matchingTech.playbooks.includes(pb.id)) {
          return false;
        }
      }
      
      // Search Box text Filter
      const matchedText = searchQuery === "" || 
        pb.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.triggerCondition.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pb.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Category matches
      const matchesCategory = categoryFilter === "all" || 
        (categoryFilter === "web" && (pb.id === "pb-1" || pb.id === "pb-2" || pb.id === "pb-14")) ||
        (categoryFilter === "recon" && (pb.id === "pb-3" || pb.id === "pb-12" || pb.id === "pb-21")) ||
        (categoryFilter === "auth" && (pb.id === "pb-4" || pb.id === "pb-15" || pb.id === "pb-16")) ||
        (categoryFilter === "dos" && (pb.id === "pb-5" || pb.id === "pb-18")) ||
        (categoryFilter === "c2" && (pb.id === "pb-6" || pb.id === "pb-19")) ||
        (categoryFilter === "exfil" && (pb.id === "pb-7" || pb.id === "pb-10" || pb.id === "pb-11"));

      // Severity matches
      const matchesSeverity = severityFilter === "all" || pb.severity === severityFilter;

      return matchedText && matchesCategory && matchesSeverity;
    });
  }, [playbooks, searchQuery, categoryFilter, severityFilter, selectedMitreId]);

  // Aggregate Metrics counters
  const totalPlaybooks = playbooks.length;
  const activeIncidentsCount = incidents.filter(i => i.status !== "Closed" && i.status !== "Contained").length;
  const closedIncidentsCount = incidents.filter(i => i.status === "Closed" || i.status === "Contained").length;
  const mitreTechniquesCount = mitreTechniques.length;

  return (
    <div className="space-y-6 select-none animate-fade-in text-foreground">
      {/* HEADER ROW WITH UTC CLOCK & SUB-LOGO */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-border/80 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-500 dark:text-cyan-400 uppercase">
              FCAJ SECURITY RESPONSE OPERATIONS CENTER v3.0
            </span>
          </div>
          <h2 className="text-2xl font-mono font-black tracking-tight uppercase leading-none">
            Playbooks & SOC Incident Workspace
          </h2>
        </div>

        {/* CLOCK & CONTROLS CONTAINER */}
        <div className="flex flex-wrap items-center gap-3">
          {/* NAVIGATION TAB CONTROLLER */}
          <div className="bg-muted/70 p-1 rounded-lg border border-border flex gap-1">
            <button 
              onClick={() => setActiveTab("workspace")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-bold uppercase transition ${activeTab === "workspace" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Terminal className="w-3.5 h-3.5 inline mr-1.5" /> Workspace Hub
            </button>
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-bold uppercase transition ${activeTab === "overview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Mitchell Library
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-bold uppercase transition ${activeTab === "analytics" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1.5" /> SIEM Intelligence
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg px-4 py-1.5 font-mono text-right shrink-0">
            <span className="text-[8px] font-bold tracking-widest text-muted-foreground block uppercase">
              SOC MASTER COORDINATION CLOCK
            </span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {utcTime || "2026-06-04 10:31:51 UTC"}
            </span>
          </div>
        </div>
      </div>

      {/* TOP DECORATIVE ROADBLOCK MINI GAUGE HERO SLIDER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Playbooks */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-cyan-500/30 transition">
          <div className="absolute top-2 right-2 p-1.5 bg-blue-500/5 text-blue-500 rounded-md">
            <Workflow className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase font-bold">Total Playbooks</span>
          <div className="text-xl font-mono font-black mt-1">{totalPlaybooks} Active</div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-2 font-mono">
            <span className="text-emerald-500 font-bold">● Core 8</span>
            <span>+ 13 custom nodes</span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-rose-500/30 transition">
          <div className="absolute top-2 right-2 p-1.5 bg-rose-500/5 text-rose-500 rounded-md">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase font-bold">Active Incidents</span>
          <div className="text-xl font-mono font-black mt-1 text-rose-500">{activeIncidentsCount} Cases</div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-2 font-mono">
            <span className="text-emerald-500 font-bold">-12%</span>
            <span>historical reduction rate</span>
          </div>
        </div>

        {/* Response Workflows */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-emerald-500/30 transition">
          <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/5 text-emerald-500 rounded-md">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase font-bold">Response Workflows</span>
          <div className="text-xl font-mono font-black mt-1">{closedIncidentsCount} Success</div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-2 font-mono">
            <span className="text-cyan-500 font-bold">100%</span>
            <span>simulated dispatch validity</span>
          </div>
        </div>

        {/* MITRE Covers */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-purple-500/30 transition">
          <div className="absolute top-2 right-2 p-1.5 bg-purple-500/5 text-purple-500 rounded-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase font-bold">MITRE Techniques</span>
          <div className="text-xl font-mono font-black mt-1">{mitreTechniquesCount} Tatics</div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-2 font-mono">
            <span className="text-purple-500 font-bold">32 Codes</span>
            <span>exhaustive mapped coverage</span>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-amber-500/30 transition">
          <div className="absolute top-2 right-2 p-1.5 bg-amber-500/5 text-amber-500 rounded-md">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase font-bold">Avg Response Time</span>
          <div className="text-xl font-mono font-black mt-1 text-amber-500">4.2 Mins</div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-2 font-mono">
            <span className="text-emerald-500 font-bold">↓ 18%</span>
            <span>reduction over manual</span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE VIEW: TAB-BASED COMMAND MODULES */}
      <AnimatePresence mode="wait">
        {/* TAB 1: SOC INCIDENT INVESTIGATION WORKSPACE */}
        {activeTab === "workspace" && (
          <motion.div 
            key="workspace-hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* LEFT COLUMN: ACTIVE CASE SELECTOR LIST */}
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 text-rose-500">
                    <AlertOctagon className="w-4 h-4 shrink-0" /> Open Incidents ({activeIncidentsCount})
                  </h3>
                  <span className="text-[8px] font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded font-black">
                    SIMULATOR ACTIVE
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground mb-4">
                  Select an active alert vector block to drive interactive FCAJ v3.0 forensic investigations and container workflows.
                </p>

                {/* INCIDENTS VERTICAL TRACK */}
                <div className="space-y-2 max-h-115 overflow-y-auto custom-scrollbar pr-1">
                  {incidents.map(inc => {
                    const isSelected = inc.id === selectedIncidentId;
                    const statusColors = {
                      "New Alert": "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
                      "Investigating": "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      "Contained": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      "Monitoring": "bg-purple-500/10 text-purple-500 border-purple-500/20",
                      "Escalated": "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      "Closed": "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    }[inc.status];

                    return (
                      <button
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`w-full text-left p-3 rounded-lg border transition ${isSelected ? "bg-muted border-cyan-500/50 shadow-sm" : "bg-card border-border hover:bg-muted/40"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-muted-foreground">{inc.id}</span>
                          <span className={`text-[7.5px] font-mono font-black uppercase px-2 py-0.5 rounded border ${statusColors}`}>
                            {inc.status}
                          </span>
                        </div>
                        <h4 className="text-[10.5px] font-mono font-bold truncate text-foreground mb-1 uppercase tracking-wide">
                          {inc.name}
                        </h4>
                        <div className="flex items-center justify-between text-[8.5px] text-muted-foreground font-mono">
                          <span>SRC: {inc.sourceIp}</span>
                          <span className="text-cyan-500 font-bold">FScore: {inc.fusionScore}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION QUICK SUMMARY MAP */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm font-mono text-[9.5px]">
                <div className="border-b border-border pb-2 mb-3">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Incident Guidance</span>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Incident Target:</span>
                    <span className="text-foreground font-bold">{activeIncident.destinationIp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Attack Vector:</span>
                    <span className="text-rose-500 font-bold">{activeIncident.attackType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Severity index:</span>
                    <span className="text-foreground uppercase font-bold">{activeIncident.severity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE & RIGHT COMBINED WORKSPACE: ACTIVE SIMULATION HUB */}
            <div className="xl:col-span-9 space-y-6">
              {/* TARGET WORKSPACE FRAME - CARD SECTION */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05),transparent)] pointer-events-none" />
                
                {/* Active Incident Metadata Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded font-black">
                        {activeIncident.mitre.split(" - ")[0]}
                      </span>
                      <span className="text-[9px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black uppercase">
                        {activeIncident.severity} priority
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Generated: {activeIncident.createdAt}
                      </span>
                    </div>
                    <h3 className="text-base font-mono font-black text-foreground uppercase tracking-tight">
                      Analyzing: {activeIncident.name}
                    </h3>
                  </div>

                  <button
                    onClick={resetIncidentSimulator}
                    className="px-2.5 py-1.5 rounded bg-muted hover:bg-muted-foreground/10 border border-border font-mono text-[9.5px] font-black uppercase text-muted-foreground flex items-center gap-1.5 self-start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Rejuvenate Case
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* CENTRAL SIMULATION TERMINAL PATH */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* STEP 5: VISUAL TIMELINE */}
                    <div>
                      <span className="text-[9.5px] font-mono font-bold text-muted-foreground tracking-widest uppercase block mb-2.5">
                        Response Workflow Visualization
                      </span>
                      
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[8px] tracking-wide uppercase">
                        {[
                          { label: "Alert", match: ["New Alert", "Investigating", "Contained", "Monitoring", "Escalated", "Closed"] },
                          { label: "Investigate", match: ["Investigating", "Contained", "Monitoring", "Escalated", "Closed"] },
                          { label: "Contain", match: ["Contained", "Monitoring", "Escalated", "Closed"] },
                          { label: "Monitor", match: ["Monitoring", "Escalated", "Closed"] },
                          { label: "Resolved", match: ["Closed"] }
                        ].map((node, i) => {
                          const isActive = node.match.includes(activeIncident.status);
                          return (
                            <div key={node.label} className="relative py-2 px-1">
                              {/* Background Connector Pipe */}
                              {i < 4 && (
                                <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${isActive && node.match.includes(activeIncident.status) ? "bg-cyan-500" : "bg-border"}`} />
                              )}
                              <div className={`relative z-10 w-5 h-5 mx-auto rounded-full flex items-center justify-center border text-[9px] font-bold ${isActive ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-muted text-muted-foreground border-border"}`}>
                                {isActive ? <Check className="w-3 h-3" /> : i + 1}
                              </div>
                              <span className={`block mt-2 font-black text-[7.5px] ${isActive ? "text-cyan-500 font-bold" : "text-muted-foreground"}`}>{node.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* INTERACTIVE COMPONENT: SIMULATION HUB ACTION ACTIONS */}
                    <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold font-mono text-foreground uppercase tracking-widest flex items-center gap-1">
                          <Play className="w-3.5 h-3.5 text-cyan-500" /> Response Simulator Actions
                        </span>
                        <span className="text-[8px] font-mono text-muted-foreground">FCAJ COMPLIANT EXECUTOR</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Investigation trigger */}
                        <button
                          onClick={() => executeSimAction("Investigate")}
                          disabled={activeIncident.status !== "New Alert"}
                          className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "New Alert" ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                        >
                          <Search className="w-3.5 h-3.5" /> Investigate
                        </button>

                        {/* Containment trigger */}
                        <button
                          onClick={() => executeSimAction("Contain")}
                          disabled={activeIncident.status !== "Investigating"}
                          className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Investigating" ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Contain Host
                        </button>

                        {/* Monitor trigger */}
                        <button
                          onClick={() => executeSimAction("Monitor")}
                          disabled={activeIncident.status !== "Contained"}
                          className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Contained" ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                        >
                          <Activity className="w-3.5 h-3.5" /> Monitor
                        </button>

                        {/* Escalate Trigger */}
                        <button
                          onClick={() => executeSimAction("Escalate")}
                          disabled={activeIncident.status !== "Investigating" && activeIncident.status !== "New Alert"}
                          className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Investigating" || activeIncident.status === "New Alert" ? "bg-amber-600 text-white hover:bg-amber-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                        </button>

                        {/* Close incident Trigger */}
                        <button
                          onClick={() => executeSimAction("Close")}
                          disabled={activeIncident.status === "Closed" || activeIncident.status === "New Alert"}
                          className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status !== "Closed" && activeIncident.status !== "New Alert" ? "bg-slate-700 text-white hover:bg-slate-800 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Close Incident
                        </button>
                      </div>

                      <p className="text-[9px] text-muted-foreground italic font-mono text-center pt-1.5 leading-snug">
                        *Note: Simulating process flow alters the active state of incident metrics. Dispatches mock firewall filters and credentials deactivators.
                      </p>
                    </div>

                    {/* LIVE SIMULATED CONSOLE STREAMS */}
                    <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-inner p-4 font-mono text-[9.5px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SOC Investigation Case Terminal Logs
                        </span>
                        <span className="text-[8px] text-emerald-450 uppercase animate-pulse font-black font-mono">
                          CONNECTOR ONLINE
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 min-h-27.5 max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed">
                        {(terminalLogs[activeIncident.id] || []).map((logLine, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-slate-500 select-none">&gt;&gt;</span>
                            <span className={logLine.includes("[Resolution]") || logLine.includes("[sys_reset]") ? "text-emerald-400" : logLine.includes("[mitigation]") ? "text-cyan-400 font-bold" : logLine.includes("[escalation]") ? "text-amber-400" : "text-slate-300"}>
                              {logLine}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT PANEL: DECISION FORMULA EXPLAINER EXCEL FRAME */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* FCAJ v3.0 Multi-Sensor Decision Tree Graphic */}
                    <div className="bg-muted p-4 rounded-xl border border-border space-y-3.5">
                      <div className="border-b border-border pb-1.5">
                        <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-rose-500" /> FCAJ v3.0 Decision Flow Explainer
                        </span>
                      </div>

                      {/* Math weight explainer block */}
                      <div className="space-y-2.5 font-mono text-[9px] leading-snug text-muted-foreground">
                        <p className="text-[9.5px] text-foreground leading-normal font-bold">
                          FCAJ fusion layers compute scores dynamically based on sensor multipliers:
                        </p>

                        {/* Formula box */}
                        <div className="bg-card border border-border p-2.5 rounded-lg text-center text-foreground font-black text-[10px] select-all shadow-inner">
                          Score = Σ(Weight_i * S_i) / ΣWeight_i
                        </div>

                        {/* Weighted parameters */}
                        <div className="space-y-1.5 bg-card border border-border/85 p-3 rounded-lg text-foreground">
                          {/* Parameter 1 */}
                          <div className="flex items-center justify-between border-b border-border/40 pb-1">
                            <span className="text-muted-foreground">AI Payload (W1: {activeIncident.decisionFlow.w1}):</span>
                            <span className="font-bold">{activeIncident.decisionFlow.s1}% score</span>
                          </div>
                          {/* Parameter 2 */}
                          <div className="flex items-center justify-between border-b border-border/40 pb-1 font-mono">
                            <span className="text-muted-foreground">Suricata Alert (W2: {activeIncident.decisionFlow.w2}):</span>
                            <span className="font-bold">{activeIncident.decisionFlow.s2}% score</span>
                          </div>
                          {/* Parameter 3 */}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Protocol Rate (W3: {activeIncident.decisionFlow.w3}):</span>
                            <span className="font-bold">{activeIncident.decisionFlow.s3}% score</span>
                          </div>
                        </div>

                        {/* Output verdict summary indicator */}
                        <div className="p-2.5 rounded bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 font-bold space-y-1 text-center font-mono">
                          <div className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Consensus Classifier Verdict</div>
                          <div className="text-[9.5px] uppercase tracking-tight">{activeIncident.decisionFlow.finalDecision}</div>
                          <div className="text-[10.5px] text-emerald-500">Confidence: {activeIncident.decisionFlow.confidence}%</div>
                        </div>
                      </div>
                    </div>

                    {/* INVESTIGATION CHECKS - STEP INSPECTOR (ITEM 6) */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm font-mono text-[9px]">
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest block mb-2">Investigation Guide Checklist</span>
                      <div className="space-y-1.5">
                        {activeIncident.steps.map((st, sidx) => (
                          <div key={sidx} className="flex gap-2 items-start text-muted-foreground">
                            <span className="p-0.5 rounded bg-muted text-foreground text-[8px] font-black shrink-0">ST-{sidx+1}</span>
                            <span className="leading-snug">{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REACTIVE EVENT ANALYSIS LOG TAB BOXES (ITEM 7) */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest flex items-center gap-1">
                    <Database className="w-4 h-4 text-cyan-500" /> Evidence Analysis Panel & Telemetry Payload
                  </h3>
                  <span className="text-[8px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border">
                    ACTIVE SOURCE: {activeIncident.id} Payload
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9.5px]">
                  {/* Left Box: Zeek raw telemetry payload inside inspector */}
                  <div className="space-y-1.5">
                    <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest">Zeek Log (conn.log / http.log) Payload</span>
                    <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed">
                      {JSON.stringify(activeIncident.zeekLog, null, 2)}
                    </pre>
                  </div>

                  {/* Right Box: Suricata Alert payload inside inspector */}
                  <div className="space-y-1.5">
                    <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest">Suricata Threat Signature Alert Entry</span>
                    <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed">
                      {JSON.stringify(activeIncident.suricataAlert, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* RECOMMENDED MITIGATION ACTIONS BOX */}
                <div className="p-3.5 bg-yellow-550/5 text-amber-800 dark:text-amber-400 border border-yellow-500/10 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 text-amber-500" />
                  <div className="space-y-1 text-[9.5px] font-mono">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block">FCAJ v3.0 Mitigation Safeguard Recommendations</span>
                    <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                      {activeIncident.attackType === "XSS" && (
                        <>
                          <li>Block immediate requester host <strong className="text-rose-500 font-extrabold">{activeIncident.sourceIp}</strong> in edge pfSense aliases dynamic lists.</li>
                          <li>Check target redirect parameter configurations on web controller route: <strong className="text-foreground">{activeIncident.zeekLog.uri}</strong>.</li>
                          <li>Sanitize database inputs and audit cookie safety indicators (HttpOnly, Secure bindings).</li>
                        </>
                      )}
                      {activeIncident.attackType === "SQLi" && (
                        <>
                          <li>Audit transaction payload indices targeting database path parameters on: <strong className="text-foreground">{activeIncident.zeekLog.uri}</strong>.</li>
                          <li>Downgrade API role credentials used on route session immediately to protect DB assets.</li>
                          <li>Engage parameterized queries validator checks across all REST endpoints.</li>
                        </>
                      )}
                      {activeIncident.attackType === "Port Scan" && (
                        <>
                          <li>Instruct pfSense firewall interface nodes to throttle scanning source segment: <strong className="text-foreground">{activeIncident.sourceIp}</strong>.</li>
                          <li>Confirm active socket connection state (State REJ implies request was rejected successfully).</li>
                          <li>Review host reconnaissance logs to track sweep scope variables.</li>
                        </>
                      )}
                      {activeIncident.attackType === "Brute Force" && (
                        <>
                          <li>Revoke active authorization keys from Bastion node <strong className="text-foreground">{activeIncident.destinationIp}</strong>.</li>
                          <li>Instruct SSH/LDAP network registers to trigger a temporary password locking profile.</li>
                          <li>Audit credential spray records inside secure terminal logs folders.</li>
                        </>
                      )}
                      {activeIncident.attackType === "DoS" && (
                        <>
                          <li>Enforce strict SYN proxies checkpoints on cloud load balancers.</li>
                          <li>Halt traffic routing pools associated with anomalous ingress rate volumes.</li>
                          <li>Activate CDN buffer rate limits to screen client connections dynamically.</li>
                        </>
                      )}
                      {activeIncident.attackType === "Beaconing" && (
                        <>
                          <li>Maintain mirror PCAP logging channel on target destination coordinate <strong className="text-foreground">{activeIncident.destinationIp}</strong>.</li>
                          <li>Coordinate memory inspection process with local machine administrators to isolate threat processes.</li>
                          <li>Re-verify domain reputation ratings matching outbound targets.</li>
                        </>
                      )}
                      {activeIncident.attackType === "Data Exfiltration" && (
                        <>
                          <li>Apply immediate QoS bottleneck limits across network interface gateways (restricted DB egress).</li>
                          <li>Revoke temporal AWS storage bucket privilege structures to contain data leaks.</li>
                          <li>Decompile transmission payloads context to confirm volume classification thresholds.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PLAYBOOK LIBRARY MAPS */}
        {activeTab === "overview" && (
          <motion.div 
            key="overview-library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* INTERACTIVE MITRE ATT&CK MATRIX HUB (ITEM 4) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-500">
                    <Shield className="w-4 h-4 shrink-0" /> MITRE ATT&CK Mapping matrix - Interactive Matrix
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal max-w-2xl">
                    Click any technique card below to automatically filter and reveal related defensive playbooks inside our SOAR Library database below.
                  </p>
                </div>
                {selectedMitreId && (
                  <button
                    onClick={() => setSelectedMitreId(null)}
                    className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono text-[9px] font-black uppercase flex items-center gap-1 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    Clear Filter ({selectedMitreId}) <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* MITRE SIX COLUMNS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {mitreTechniques.map(tech => {
                  const isSelected = selectedMitreId === tech.id;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => handleMitreClick(tech.id)}
                      className={`text-left p-3 rounded-lg border transition duration-200 select-none ${isSelected ? "border-purple-500 bg-muted/95 shadow-md flex-1" : "border-border bg-card/60 hover:bg-muted/40"}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-mono font-black tracking-widest text-muted-foreground uppercase">{tech.tactic}</span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: tech.color }} 
                        />
                      </div>
                      <div className="text-[10.5px] font-mono font-black text-foreground uppercase tracking-tight line-clamp-1 mb-1">
                        {tech.id}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2 leading-tight uppercase font-mono tracking-wide">
                        {tech.name}
                      </div>
                      <div className="mt-2 text-[8px] font-semibold font-mono text-purple-500 uppercase tracking-widest">
                        {tech.playbooks.length} SOAR Playbooks
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NEW CONTAINER BLOCK FOR SECTIONS SEARCH AND LIST */}
            <div id="playbooks-library-anchor" className="space-y-4">
              {/* FILTERING CONTROLLERS ROW (ITEM 18 & ITEM 2) */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search query box */}
                <div className="flex-1 flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-cyan-500">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Playbook Library... (Name, Severity, MITRE, Tags)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[11px] font-mono placeholder:text-muted-foreground focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters chips select */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Filter dropdown style */}
                  <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2 py-1 rounded-lg">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-mono focus:outline-none text-foreground font-black uppercase tracking-wide cursor-pointer"
                    >
                      <option value="all">ALL CATEGORIES</option>
                      <option value="web">WEB EXPLOITATION</option>
                      <option value="recon">RECON / DISCOVERY</option>
                      <option value="auth">AUTHENTICATION DEFS</option>
                      <option value="dos">SYN DOS MITIGATION</option>
                      <option value="c2">BEACON / C2 SYSTEMS</option>
                      <option value="exfil">DATA SECURITY</option>
                    </select>
                  </div>

                  {/* Severity level filter */}
                  <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2 py-1 rounded-lg">
                    <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-mono focus:outline-none text-foreground font-black uppercase tracking-wide cursor-pointer"
                    >
                      <option value="all">ALL SEVERITIES</option>
                      <option value="critical">CRITICAL</option>
                      <option value="high">HIGH</option>
                      <option value="medium">MEDIUM</option>
                      <option value="low">LOW</option>
                    </select>
                  </div>

                  {/* Table vs Grid toggle button */}
                  <div className="bg-muted p-0.5 rounded-lg border border-border flex gap-0.5">
                    <button
                      onClick={() => setLayoutStyle("grid")}
                      className={`p-1.5 rounded transition ${layoutStyle === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      title="Grid Cards Layout"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setLayoutStyle("table")}
                      className={`p-1.5 rounded transition ${layoutStyle === "table" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      title="Tabular Dense List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC VIEW SWAPPER (GRID VS TABLE CARD BOILERPLATE) */}
              <AnimatePresence mode="wait">
                {layoutStyle === "grid" ? (
                  <motion.div 
                    key="grid-canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {filteredPlaybooks.map(pb => {
                      const isActive = pb.status === "active";
                      const severityColors = {
                        critical: "text-red-500 border-red-500/20 bg-red-500/5",
                        high: "text-orange-500 border-orange-500/20 bg-orange-500/5",
                        medium: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5",
                        low: "text-blue-500 border-blue-500/20 bg-blue-500/5"
                      }[pb.severity];

                      return (
                        <div
                          key={pb.id}
                          onClick={() => inspectPlaybook(pb)}
                          className={`bg-card border rounded-xl p-5 select-none transition cursor-pointer relative overflow-hidden group hover:-translate-y-1 ${isActive ? "border-cyan-500/25 shadow-md shadow-cyan-500/2" : "border-border/60 opacity-60 hover:opacity-100"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-1">
                              <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border ${severityColors}`}>
                                {pb.severity}
                              </span>
                              <span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border bg-muted text-muted-foreground">
                                {pb.triggerType}
                              </span>
                            </div>

                            {/* Active switch */}
                            <button
                              onClick={(e) => togglePlaybookState(pb.id, e)}
                              className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition focus:outline-none ${isActive ? "bg-cyan-500" : "bg-muted border-border"}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${isActive ? "translate-x-4" : "translate-x-0"} mt-px`} />
                            </button>
                          </div>

                          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-foreground group-hover:text-cyan-500 mb-1.5 transition-colors">
                            {pb.name}
                          </h3>
                          
                          <p className="text-[10px] text-muted-foreground leading-normal font-sans line-clamp-2 uppercase tracking-wide mb-4">
                            {pb.description}
                          </p>

                          {/* Trigger condition logic row */}
                          <div className="bg-muted/45 p-2 rounded border border-border/80 font-mono text-[8.5px] text-amber-600 dark:text-amber-400 mb-3 block truncate">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold mr-1">IF</span>
                            {pb.triggerCondition}
                          </div>

                          <div className="border-t border-border pt-3.5 flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                            <span>RUN TIMELINES: <strong className="text-foreground font-black">{pb.executions}</strong></span>
                            <span>{pb.updatedAt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="table-canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted text-[8.5px] font-mono text-muted-foreground font-semibold uppercase border-b border-border">
                            <th className="p-3.5">ID / Name</th>
                            <th className="p-3.5">Trigger Condition</th>
                            <th className="p-3.5">Severity</th>
                            <th className="p-3.5">Type</th>
                            <th className="p-3.5">Executions</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right font-mono">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-[10px] font-mono">
                          {filteredPlaybooks.map(pb => {
                            const isActive = pb.status === "active";
                            return (
                              <tr 
                                key={pb.id}
                                onClick={() => inspectPlaybook(pb)}
                                className="hover:bg-muted/30 cursor-pointer transition"
                              >
                                <td className="p-3.5">
                                  <div className="font-bold text-foreground uppercase tracking-tight">{pb.name}</div>
                                  <div className="text-[8px] text-muted-foreground mt-0.5">{pb.id}</div>
                                </td>
                                <td className="p-3.5 text-amber-600 dark:text-amber-400 max-w-55 truncate">
                                  {pb.triggerCondition}
                                </td>
                                <td className="p-3.5 uppercase">{pb.severity}</td>
                                <td className="p-3.5 uppercase text-muted-foreground">{pb.triggerType}</td>
                                <td className="p-3.5 font-bold text-foreground">{pb.executions}</td>
                                <td className="p-3.5">
                                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded border ${isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                                    {pb.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => togglePlaybookState(pb.id, e)}
                                    className={`px-2 py-1 rounded font-mono text-[9px] font-bold uppercase border ${isActive ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20"}`}
                                  >
                                    {isActive ? "Disable" : "Enable"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CAMPAIGN RECON & METRICS INTELLIGENCE */}
        {activeTab === "analytics" && (
          <motion.div 
            key="intelligence-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ROW 1: ATTACK CAMPAIGN RECONSTRUCTION NODE GRAPH (ITEM 14 & ITEM 13) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              <div className="xl:col-span-8 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" /> Attack Campaign Reconstruction Node Graph
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                      Visualize active multi-stage attack scenarios reconstructed across various system network sectors.
                    </p>
                  </div>

                  {/* Campaign selector buttons */}
                  <div className="flex bg-muted p-0.5 rounded-lg border border-border">
                    {mockCampaigns.map(camp => (
                      <button
                        key={camp.id}
                        onClick={() => setCampaignId(camp.id)}
                        className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase transition ${campaignId === camp.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {camp.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/45 border border-border rounded-xl space-y-4 font-mono select-none">
                  <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2 text-[10px] text-foreground font-black">
                    <span>SOCIALLY RECONSTRUCTED: {activeCampaign.name}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded border ${activeCampaign.state === "MITIGATED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"}`}>
                      STATUS: {activeCampaign.state}
                    </span>
                  </div>

                  <p className="text-[9.5px] text-muted-foreground italic leading-normal">
                    Pivot attacker points discovered within 24 hours. The graph below displays chronological tactical progression:
                  </p>

                  {/* CUSTOM GRAPH VISUALIZATION (ITEM 14) */}
                  <div className="flex flex-col md:flex-row items-stretch justify-around gap-4 pt-2">
                    {activeCampaign.stages.map((stg, sidx) => (
                      <div key={stg.step} className="flex-1 bg-card border border-border p-3.5 rounded-xl hover:border-cyan-500/30 transition shadow-inner relative">
                        {/* Stepper badge */}
                        <span className="absolute -top-2.5 left-3.5 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[7.5px] font-bold font-mono">
                          PHASE 0{sidx+1}
                        </span>

                        <div className="text-[10px] text-foreground font-bold uppercase mt-1 mb-1.5">{stg.step}</div>
                        <p className="text-[8.5px] text-muted-foreground leading-snug lowercase tracking-wide first-letter:uppercase">{stg.desc}</p>
                        <div className="text-[8px] text-cyan-500 mt-2 font-bold flex items-center justify-between">
                          <span>DISPATCHED</span>
                          <span>{stg.epoch} UTC</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FUSION DECISION REFERENCE GRID (ITEM 15) */}
              <div className="xl:col-span-4 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Layers className="w-4 h-4 text-cyan-555 dark:text-cyan-400" /> Fusion Decision Reference Matrix
                  </span>
                </div>

                <div className="font-mono text-[9px] text-muted-foreground space-y-3 leading-relaxed">
                  <p className="text-foreground font-black leading-snug">
                    FCAJ v3.0 standard consensus logic matrix reference. Evaluates multiple raw score sources to determine threat priority:
                  </p>

                  <div className="space-y-1.5 bg-muted p-3 border border-border rounded-lg text-foreground">
                    <div className="flex justify-between border-b border-border/80 pb-1">
                      <span className="text-muted-foreground font-bold">AI High + IDS Alarm</span>
                      <span className="text-rose-500 font-black">CRITICAL (Verd: 98%)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/80 pb-1">
                      <span className="text-muted-foreground font-bold">AI High + IDS None</span>
                      <span className="text-orange-500 font-black">HIGH (Verd: 81%)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/80 pb-1">
                      <span className="text-muted-foreground font-bold">AI Low + IDS Alarm</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-black">MEDIUM (Verd: 64%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-bold">AI None + IDS None</span>
                      <span className="text-slate-500 font-black">CLEAN STATE</span>
                    </div>
                  </div>

                  <p className="italic text-[8px] text-muted-foreground text-center">
                    *Formula enforces dynamic weighting. False positives are filtered based on consensus protocol score tables.
                  </p>
                </div>
              </div>
            </div>

            {/* EFFECTIVENESS METRICS RECHARTS TILES (ITEM 12) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-[9px]">
              {/* Chart 1: Playbooks Usage trend */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-widest block border-b border-border pb-2">
                  SOAR Active Weekly Usage Trends
                </span>
                
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={effectivenessMetrics.usage}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} />
                      <YAxis stroke="#94a3b8" fontSize={9.5} />
                      <Tooltip />
                      <Bar dataKey="XSS" fill="#22d3ee" stackId="a" />
                      <Bar dataKey="Brute Force" fill="#f43f5e" stackId="a" />
                      <Bar dataKey="Port Scan" fill="#f59e0b" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Time savings */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-widest block border-b border-border pb-2">
                  Hours Saved: Manual vs SOAR Dispatch
                </span>
                
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={effectivenessMetrics.resolutionTimeHour} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" fontSize={9.5} />
                      <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={9} width={65} />
                      <Tooltip />
                      <Bar dataKey="withSoar" fill="#10b981" name="FCAJ SOAR v3" />
                      <Bar dataKey="withoutSoar" fill="#e2e8f0" name="Manual Response" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: False positive rates */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-widest block border-b border-border pb-2">
                  Playbook Alarm Target Precision (%)
                </span>
                
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectivenessMetrics.falsePositiveRate}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} />
                      <YAxis stroke="#94a3b8" fontSize={9.5} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="#a855f7" fill="#a855f7" fillOpacity={0.06} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SOC KNOWLEDGE BASE LIBRARY CARDS (ITEM 16) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-blue-500" /> SOC Analyst Knowledge Base & Threat Indicators Index
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kbLibrary.map(kb => (
                  <div key={kb.attack} className="bg-muted p-4 rounded-xl border border-border space-y-2 font-mono text-[9px] hover:border-blue-500/20 transition">
                    <div className="text-[10px] text-foreground font-bold uppercase tracking-tight border-b border-border/80 pb-1 mb-1 flex items-center justify-between">
                      <span>{kb.attack}</span>
                      <span className="text-[7.5px] font-mono text-cyan-500">{kb.mitre.split(" - ")[0]}</span>
                    </div>

                    <p className="text-[9.5px] text-muted-foreground leading-relaxed font-sans lowercase first-letter:uppercase">{kb.description}</p>
                    
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Compromise Indicators</span>
                      {kb.indicators.map((ind, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-[8.5px] text-muted-foreground leading-snug">
                          <span className="text-rose-500">▪</span> <span>{ind}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[8px] text-muted-foreground pt-1.5">
                      <strong className="text-foreground">Defends: </strong> {kb.detectionMethods}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE PLAYBOOK WORKSPACE POPUP DIALOG (ITEM 17) */}
      <AnimatePresence>
        {isModalOpen && selectedPlaybook && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden font-mono text-[10px] text-foreground relative"
            >
              {/* Decorative top border glow */}
              <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-purple-500" />

              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-border cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Core Contents */}
              <div className="p-6 space-y-5">
                {/* Header metadata */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8.5px] font-bold tracking-widest bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded">
                      {selectedPlaybook.id}
                    </span>
                    <span className="text-[8.5px] font-bold tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                      {selectedPlaybook.severity} severity
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground uppercase tracking-wider">{selectedPlaybook.name}</h3>
                  <p className="text-muted-foreground text-[10px] leading-relaxed lowercase first-letter:uppercase mt-1 max-w-xl">
                    {selectedPlaybook.description}
                  </p>
                </div>

                {/* Sub-tabs controller in Modal popup */}
                <div className="flex border-b border-border gap-1.5">
                  {[
                    { id: "general", label: "General & Theory" },
                    { id: "detection", label: "Detection Sensors" },
                    { id: "steps", label: "Defensive Steps" },
                    { id: "history", label: "Metrics & Logs" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModalActiveTab(tab.id as any)}
                      className={`pb-2 px-3 relative font-bold text-[9.5px] uppercase transition cursor-pointer ${modalActiveTab === tab.id ? "text-foreground border-b-2 border-cyan-500" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content areas */}
                <div className="min-h-40 bg-muted/30 p-4 rounded-xl border border-border">
                  {/* TAB 1: General Info */}
                  {modalActiveTab === "general" && (
                    <div className="space-y-3">
                      <div className="font-black text-foreground uppercase">Playbook Strategy Overview</div>
                      <p className="text-muted-foreground leading-relaxed lowercase first-letter:uppercase">
                        This playbook establishes unified multi-sensor consensus mitigation coordinates under the standard FCAJ v3.0 SIEM framework. Upon trigger matching, isolates coordinates inside production virtual clusters.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-card border border-border p-3 rounded text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-black block">TRIGGER TYPE</span>
                          <span className="text-foreground uppercase font-bold text-[10.5px]">{selectedPlaybook.triggerType}</span>
                        </div>
                        <div className="bg-card border border-border p-3 rounded text-center font-mono">
                          <span className="text-[8px] text-muted-foreground uppercase font-black block">CONFIDENCE THRESHOLD</span>
                          <span className="text-foreground uppercase font-bold text-[10.5px]">{(selectedPlaybook.confidenceThreshold || 90)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Detection Sensors rule */}
                  {modalActiveTab === "detection" && (
                    <div className="space-y-3">
                      <div className="font-semibold text-foreground uppercase">FCAJ Alert Trigger Condition Rule</div>
                      <div className="p-3 bg-slate-950 text-amber-400 rounded-lg select-all">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold mr-1.5 text-[8.5px]">IF</span>
                        {selectedPlaybook.triggerCondition}
                      </div>
                      <p className="text-muted-foreground text-[9px] italic leading-normal text-center">
                        *Rule parsed instantly inside local Zeek ingress aggregators. Feeds into active consensus weights logic.
                      </p>
                    </div>
                  )}

                  {/* TAB 3: Action steps layout */}
                  {modalActiveTab === "steps" && (
                    <div className="space-y-3">
                      <div className="font-semibold text-foreground uppercase">Remediation Action Steps Sequential List</div>
                      <div className="space-y-2">
                        {selectedPlaybook.actions && selectedPlaybook.actions.length > 0 ? (
                          selectedPlaybook.actions.map(act => (
                            <div key={act.id} className="flex items-start gap-2.5 p-2 bg-card border border-border rounded-lg">
                              <span className="p-1 px-1.5 bg-muted text-foreground rounded text-[8px] font-bold font-mono">STEP-{act.step}</span>
                              <div className="flex-1 space-y-0.5">
                                <div className="text-[10px] font-bold uppercase text-foreground">{act.name}</div>
                                <p className="text-muted-foreground text-[8.5px] leading-relaxed uppercase">{act.description}</p>
                              </div>
                              <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                COMPLETED
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground italic text-center py-4">No specific sequential action steps configured for this custom playbook.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: History & Usage count statistics */}
                  {modalActiveTab === "history" && (
                    <div className="space-y-3">
                      <div className="font-semibold text-foreground uppercase">Playbook Performance Metrics</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card border border-border p-3 rounded text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-black block">TOTAL LIFE DISPATCHES</span>
                          <span className="text-cyan-500 font-black text-[12px]">{selectedPlaybook.executions} Runs</span>
                        </div>
                        <div className="bg-card border border-border p-3 rounded text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-black block">LATENCY PERFORMANCE</span>
                          <span className="text-foreground font-black text-[12px]">{(selectedPlaybook.avgDurationMs || 120)} ms</span>
                        </div>
                        <div className="bg-card border border-border p-3 rounded text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-black block">SUCCESS RESOLUTION</span>
                          <span className="text-emerald-500 font-black text-[12px]">100% Rate</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal footer closing controllers */}
                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-muted hover:bg-muted-foreground/10 text-muted-foreground cursor-pointer transition font-bold"
                  >
                    Close Inspector
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer transition font-bold"
                  >
                    Commit Active Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
