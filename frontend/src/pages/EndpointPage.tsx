import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend, 
  LineChart, 
  Line 
} from "recharts";
import { 
  Shield, 
  Server, 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  X, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Network, 
  Cpu, 
  Flame, 
  Clock, 
  SlidersHorizontal,
  Globe,
  FileSpreadsheet,
  Cpu as CpuIcon,
  HelpCircle,
  Eye,
  CheckCircle,
  ShieldCheck,
  ZapOff,
  Ban,
  MapPin,
  Monitor,
  GitFork
} from "lucide-react";
import { 
  generateFCAJData, 
  EndpointFCAJItem, 
  ZeekConnLog, 
  ZeekHttpLog, 
  SuricataAlert, 
  IncidentFCAJ,
  makeSparkline 
} from "../components/endpoint/endpointFCAJData";
import { cn } from "../lib/utils";

export function EndpointPage() {
  // 1. Core dataset loaded from FCAJ mock database engine
  const [data, setData] = useState(() => generateFCAJData());
  const [endpoints, setEndpoints] = useState<EndpointFCAJItem[]>(() => data.endpoints);
  const [flows, setFlows] = useState<ZeekConnLog[]>(() => data.flows);
  const [alerts, setAlerts] = useState<SuricataAlert[]>(() => data.alerts);
  const [incidents, setIncidents] = useState<IncidentFCAJ[]>(() => data.incidents);

  // Interaction States
  const [selectedId, setSelectedId] = useState<string | null>("EP-FCAJ-2012"); // defaults to high threat EP
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentFCAJ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"inventory" | "incidents">("inventory");

  // Filter systems
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof EndpointFCAJItem>("riskScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Visible columns state
  const [visibleCols, setVisibleCols] = useState({
    hostname: true,
    ip: true,
    deviceType: true,
    os: true,
    role: true,
    alertCount: true,
    riskScore: true,
    healthScore: true,
    status: true,
  });

  // Timeline zoom state
  const [timelineZoom, setTimelineZoom] = useState<number>(100); // percentage time scale window

  // Active custom threat campaign popup
  const [alertPopup, setAlertPopup] = useState<{
    id: string;
    title: string;
    message: string;
    severity: "Critical" | "High" | "Medium";
  } | null>(null);

  // 16. Real-time background update simulation (updates every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick a random healthy endpoint and tick its traffic & metrics
      setEndpoints(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const ep = { ...next[randomIndex] };

        // Ensure offline endpoints don't simulate real-time live hits unless booting up
        if (ep.status !== "Offline") {
          ep.totalConnections += Math.floor(Math.random() * 8) + 1;
          ep.totalBytes += Math.floor(Math.random() * 5000) + 1200;
          ep.riskScore = Math.min(100, Math.max(0, ep.riskScore + (Math.random() > 0.65 ? (Math.random() > 0.5 ? 2 : -2) : 0)));
          ep.healthScore = Math.max(5, Math.min(100, 100 - Math.round(ep.riskScore * 0.9)));
          
          if (Math.random() > 0.85) {
            ep.alertCount += 1;
            const newAlertTypes = ["XSS Probe Hits", "SQLi Injection Vector", "Dreaded Brute Force Execution", "Unusual Beaconing Detected"];
            const selectedAlert = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)];
            
            ep.timeline = [
              {
                id: `t-sim-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                event: `Simulated: ${selectedAlert}`,
                severity: "High"
              },
              ...ep.timeline
            ];

            // Trigger visual overlay notification block
            setAlertPopup({
              id: `pop-${Date.now()}`,
              title: `REAL-TIME THREAT: ${ep.hostname}`,
              message: `AI/Fusion system flagged ${selectedAlert} targeting endpoint ${ep.ip}.`,
              severity: ep.riskScore > 75 ? "Critical" : "High"
            });
            setTimeout(() => setAlertPopup(null), 5500);
          }
          next[randomIndex] = ep;
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Isolate machine callback helper
  const handleIsolate = (ep: EndpointFCAJItem) => {
    setEndpoints(prev => 
      prev.map(item => 
        item.id === ep.id 
          ? {
              ...item,
              status: "Offline",
              riskScore: 0,
              healthScore: 100,
              timeline: [
                { id: `iso-${Date.now()}`, time: "JUST NOW", event: "VPC ISOLATION POLICY ENFORCED", severity: "Critical" },
                ...item.timeline
              ]
            }
          : item
      )
    );
    setAlertPopup({
      id: `act-${Date.now()}`,
      title: `NODE RETRACTED: ${ep.hostname}`,
      message: `Quarantine logic dispatched to vpc domain controller. Node completely isolated.`,
      severity: "Medium"
    });
    setTimeout(() => setAlertPopup(null), 4000);
  };

  // Block router IP helper
  const handleBlockIp = (ep: EndpointFCAJItem) => {
    setAlertPopup({
      id: `act-block-${Date.now()}`,
      title: `GATEWAY ACCESS DENIED`,
      message: `Inbound routing from external vector dropping rules for ${ep.ip}.`,
      severity: "Medium"
    });
    setTimeout(() => setAlertPopup(null), 4000);
  };

  // Memoized statistical calculations for 1. ENDPOINT OVERVIEW CARDS
  const stats = useMemo(() => {
    const total = endpoints.length;
    const active = endpoints.filter(e => e.status !== "Offline").length;
    const alertList = endpoints.filter(e => e.alertCount > 0).length;
    const critical = endpoints.filter(e => e.status === "Critical").length;
    const newCount = Math.floor(total * 0.08) + 1; // mock telemetry
    return { total, active, alertList, critical, newCount };
  }, [endpoints]);

  // Sparklines pre-compiled data series
  const sparks = useMemo(() => {
    return {
      total: makeSparkline(10, 80),
      active: makeSparkline(10, 75),
      alerts: makeSparkline(10, 30),
      critical: makeSparkline(10, 10),
      newCount: makeSparkline(10, 5),
    };
  }, []);

  // Filter application & list formatting for 2. ENDPOINT INVENTORY TABLE
  const filteredEndpoints = useMemo(() => {
    let list = [...endpoints];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.hostname.toLowerCase().includes(q) || 
        e.ip.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "ALL") {
      list = list.filter(e => e.deviceType === typeFilter);
    }

    if (roleFilter !== "ALL") {
      list = list.filter(e => e.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter(e => e.status === statusFilter);
    }

    // Sorting
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc" 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });

    return list;
  }, [endpoints, searchQuery, typeFilter, roleFilter, statusFilter, sortField, sortOrder]);

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredEndpoints.length / itemsPerPage);
  const displayedEndpoints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEndpoints.slice(start, start + itemsPerPage);
  }, [filteredEndpoints, currentPage]);

  const selectedEndpointObj = useMemo(() => {
    return endpoints.find(e => e.id === selectedId) || null;
  }, [endpoints, selectedId]);

  // Export CSV generator block
  const handleExportCSV = useCallback(() => {
    const headers = ["Hostname,IP Address,Device Type,OS,Role,Risk Score,Health,Alerts,Status"];
    const rows = filteredEndpoints.map(e => 
      `"${e.hostname}","${e.ip}","${e.deviceType}","${e.os}","${e.role}",${e.riskScore},${e.healthScore},${e.alertCount},"${e.status}"`
    );
    const content = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "endpoint_intelligence_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredEndpoints]);

  // Heatmap matrix helper data matching X, Y axis
  const riskCategories = ["AI1 Anomaly", "AI2A Attack", "AI2B Web Attack", "Suricata Evidence"];
  const matrixEndPoints = useMemo(() => {
    // Pick top 15 highest risk endpoints for the Heatmap visualization size
    return [...endpoints]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 15);
  }, [endpoints]);

  // Top 10 Risky endpoints
  const topRiskyData = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)
      .map(e => ({
        hostname: e.hostname,
        ip: e.ip,
        risk: e.riskScore
      }));
  }, [endpoints]);

  // 5. Zeek Schema traffic profile analytics
  const trafficProfile = useMemo(() => {
    const srcCounts: Record<string, number> = {};
    const destCounts: Record<string, number> = {};
    let tcpCount = 0;
    let udpCount = 0;
    let icmpCount = 0;
    
    const svcCounts = { HTTP: 0, DNS: 0, SSH: 0, FTP: 0, HTTPS: 0 };

    flows.forEach(f => {
      srcCounts[f.src_ip] = (srcCounts[f.src_ip] || 0) + f.bytes;
      destCounts[f.dest_ip] = (destCounts[f.dest_ip] || 0) + f.bytes;
      if (f.proto === "TCP") tcpCount++;
      else if (f.proto === "UDP") udpCount++;
      else icmpCount++;

      if (f.service in svcCounts) {
        svcCounts[f.service as keyof typeof svcCounts]++;
      }
    });

    const topSrc = Object.entries(srcCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, bytes]) => ({ ip, bytes: Math.round(bytes / 1024) }));

    const topDest = Object.entries(destCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, bytes]) => ({ ip, bytes: Math.round(bytes / 1024) }));

    return {
      topSrc,
      topDest,
      protocols: [
        { name: "TCP", value: tcpCount },
        { name: "UDP", value: udpCount },
        { name: "ICMP", value: icmpCount }
      ],
      services: Object.entries(svcCounts).map(([name, value]) => ({ name, value }))
    };
  }, [flows]);

  // 6. Doughnut Alert Categories values
  const doughnutData = useMemo(() => {
    const cats: Record<string, number> = {
      "XSS": 45,
      "SQLi": 38,
      "Port Scan": 120,
      "Brute Force": 140,
      "DoS": 60,
      "Beaconing": 32,
      "Data Exfiltration": 25,
    };
    
    // Sum real alerts
    alerts.forEach(a => {
      if (a.category in cats) {
        cats[a.category]++;
      }
    });

    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  const ATTACK_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-1 rounded-2xl min-h-screen font-sans border border-slate-200/40 dark:border-slate-800/20">
      
      {/* Visual threat popup toast on simulation alerts */}
      {alertPopup && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl font-mono text-[10px] space-y-2 max-w-sm animate-in slide-in-from-bottom-5 duration-300",
          alertPopup.severity === "Critical" ? "bg-red-955 text-red-400 border-red-500/40 bg-red-950/95" :
          alertPopup.severity === "High" ? "bg-amber-955 text-amber-500 border-amber-500/30 bg-amber-950/95" :
          "bg-indigo-955 text-indigo-400 border-indigo-500/20 bg-indigo-950/95"
        )}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Flame size={12} className="animate-pulse" /> {alertPopup.severity} TELEMETRY
            </span>
            <button onClick={() => setAlertPopup(null)} className="hover:text-white">
              <X size={10} />
            </button>
          </div>
          <p className="font-bold text-slate-100 uppercase">{alertPopup.title}</p>
          <p className="text-slate-300 uppercase leading-snug">{alertPopup.message}</p>
        </div>
      )}

      {/* Header and top dashboard sync information */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/55 dark:bg-slate-900/45 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-650 dark:text-cyan-400 animate-pulse" />
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest leading-none">
              Endpoint Intelligence Center
            </h1>
          </div>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
            FCAJ v3.0 Compliance Console • Extreme Risk Profiling, Flow Investigation & Realtime Threat Sprints
          </p>
        </div>

        {/* Sync badge and quick view selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-ping" />
            <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-cyan-400 tracking-wider uppercase">
              FUSION SYNC: SECURE
            </span>
          </div>
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveSegment("inventory")}
              className={cn(
                "px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded cursor-pointer transition-all",
                activeSegment === "inventory" ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-cyan-400 shadow-sm" : "text-slate-400"
              )}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveSegment("incidents")}
              className={cn(
                "px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded cursor-pointer transition-all",
                activeSegment === "incidents" ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-cyan-400 shadow-sm" : "text-slate-400"
              )}
            >
              Incident Logs
            </button>
          </div>
        </div>
      </div>

      {/* 1. ENDPOINT OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Endpoints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Server size={14} className="text-slate-500 dark:text-slate-300" />
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
              <TrendingUp size={10} /> +4%
            </span>
          </div>
          <div>
            <h3 className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Total Assets</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono">{stats.total}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-6 w-full pt-1">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-slate-400 dark:stroke-slate-600 stroke-2 fill-none">
              <path d={`M ${sparks.total.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
          {/* Tooltip */}
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
            Deploy scope catalog details
          </div>
        </div>

        {/* Card 2: Active Endpoints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
              <Activity size={14} className="text-indigo-650 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
              <TrendingUp size={10} /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Active Hosts</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
          <div className="h-6 w-full pt-1">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-500/70 dark:stroke-emerald-400/40 stroke-2 fill-none">
              <path d={`M ${sparks.active.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
            Hosts streaming telemetry data
          </div>
        </div>

        {/* Card 3: Endpoints w/ Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <span className="text-[10px] text-red-500 font-mono font-black flex items-center gap-0.5">
              <TrendingUp size={10} /> +8%
            </span>
          </div>
          <div>
            <h3 className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Host Alerts</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-amber-500">{stats.alertList}</p>
          </div>
          <div className="h-6 w-full pt-1">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-500 dark:stroke-amber-500/40 stroke-2 fill-none">
              <path d={`M ${sparks.alerts.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
            Systems flagged during 24h spectrum
          </div>
        </div>

        {/* Card 4: Critical Endpoints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-lg">
              <AlertOctagon size={14} className="text-red-500" />
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
              <TrendingDown size={10} /> -3%
            </span>
          </div>
          <div>
            <h3 className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Critical Severity</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-red-500 animate-pulse">{stats.critical}</p>
          </div>
          <div className="h-6 w-full pt-1">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-550 dark:stroke-red-500/50 stroke-2 fill-none">
              <path d={`M ${sparks.critical.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
            Requires immediate isolation intervention
          </div>
        </div>

        {/* Card 5: New Endpoints Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg">
              <Cpu size={14} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
              <TrendingUp size={10} /> +1%
            </span>
          </div>
          <div>
            <h3 className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Discovered Today</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-cyan-600 dark:text-cyan-400">{stats.newCount}</p>
          </div>
          <div className="h-6 w-full pt-1">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-cyan-500 dark:stroke-cyan-500/40 stroke-2 fill-none">
              <path d={`M ${sparks.newCount.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
            New agent registrations recorded today
          </div>
        </div>

      </div>

      {activeSegment === "inventory" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Inventory Layout Left Col (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 2. ENDPOINT INVENTORY TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              
              {/* Filter controls header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-slate-500" />
                    <h2 className="text-xs font-black uppercase tracking-wider">Asset Catalog Index ({filteredEndpoints.length})</h2>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* CSV export */}
                    <button 
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet size={12} /> CSV
                    </button>

                    {/* Column visibility drop overlay simple toggler */}
                    <div className="relative group">
                      <button className="px-3 py-1.5 bg-indigo-500/10 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-505/20 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                        Columns Visibility
                      </button>
                      <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg z-30 shadow-xl space-y-1 w-44 font-mono text-[9px]">
                        {Object.keys(visibleCols).map(col => (
                          <label key={col} className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={visibleCols[col as keyof typeof visibleCols]} 
                              onChange={() => setVisibleCols(prev => ({ ...prev, [col]: !prev[col as keyof typeof visibleCols] }))}
                              className="accent-cyan-400"
                            />
                            <span className="uppercase">{col.replace(/([A-Z])/g, " $1")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub row: inputs for queries */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input 
                      type="text" 
                      placeholder="Search Host / IP..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-400 outline-none rounded-lg font-mono"
                    />
                  </div>

                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono"
                  >
                    <option value="ALL">ALL DEVICE TYPES</option>
                    <option value="Server">SERVER</option>
                    <option value="Workstation">WORKSTATION</option>
                    <option value="Firewall">FIREWALL</option>
                    <option value="Sensor">SENSOR</option>
                    <option value="Unknown">UNKNOWN</option>
                  </select>

                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono"
                  >
                    <option value="ALL">ALL ROLES</option>
                    <option value="Web Server">WEB SERVER</option>
                    <option value="Database Server">DATABASE SERVER</option>
                    <option value="User VM">USER VM</option>
                    <option value="Admin VM">ADMIN VM</option>
                    <option value="Zeek Sensor">ZEEK SENSOR</option>
                    <option value="Suricata Sensor">SURICATA SENSOR</option>
                    <option value="Kali Attacker">KALI ATTACKER</option>
                  </select>

                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono"
                  >
                    <option value="ALL">ALL STATUSES</option>
                    <option value="Healthy">HEALTHY</option>
                    <option value="Warning">WARNING</option>
                    <option value="Critical">CRITICAL</option>
                    <option value="Offline">OFFLINE</option>
                  </select>
                </div>
              </div>

              {/* Real Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px] min-w-175">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      {visibleCols.hostname && <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortField("hostname"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>Hostname</th>}
                      {visibleCols.ip && <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortField("ip"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>IP Address</th>}
                      {visibleCols.deviceType && <th className="px-4 py-3">Type</th>}
                      {visibleCols.os && <th className="px-4 py-3">OS</th>}
                      {visibleCols.role && <th className="px-4 py-3">Role</th>}
                      {visibleCols.alertCount && <th className="px-4 py-3 text-center cursor-pointer" onClick={() => { setSortField("alertCount"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>Alerts</th>}
                      {visibleCols.riskScore && <th className="px-4 py-3 cursor-pointer" onClick={() => { setSortField("riskScore"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>Risk Score</th>}
                      {visibleCols.healthScore && <th className="px-2 py-3 text-center cursor-pointer" onClick={() => { setSortField("healthScore"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>Health</th>}
                      {visibleCols.status && <th className="px-3 py-3 text-center">Status</th>}
                      <th className="px-4 py-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                    {displayedEndpoints.map(ep => {
                      const isSelected = selectedId === ep.id;
                      return (
                        <tr 
                          key={ep.id}
                          onClick={() => { setSelectedId(ep.id); setIsDrawerOpen(true); }}
                          className={cn(
                            "cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all",
                            isSelected && "bg-indigo-50/40 dark:bg-cyan-950/10 border-l-2 border-l-cyan-400"
                          )}
                        >
                          {visibleCols.hostname && (
                            <td className="px-4 py-3 font-semibold dark:text-zinc-200 font-mono">
                              {ep.hostname}
                            </td>
                          )}
                          {visibleCols.ip && <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{ep.ip}</td>}
                          {visibleCols.deviceType && (
                            <td className="px-4 py-3">
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 uppercase tracking-widest font-black">
                                {ep.deviceType}
                              </span>
                            </td>
                          )}
                          {visibleCols.os && <td className="px-4 py-3 text-slate-400 font-sans text-[10px]">{ep.os}</td>}
                          {visibleCols.role && <td className="px-4 py-3 text-slate-400 font-sans text-[10px]">{ep.role}</td>}
                          {visibleCols.alertCount && (
                            <td className="px-4 py-3 text-center">
                              {ep.alertCount > 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 dark:bg-red-950/40 text-red-500 animate-pulse">
                                  {ep.alertCount}
                                </span>
                              ) : (
                                <span className="text-slate-500">0</span>
                              )}
                            </td>
                          )}
                          {visibleCols.riskScore && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "font-bold text-[10px]",
                                  ep.riskScore > 75 ? "text-red-500" : ep.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                                )}>
                                  {ep.riskScore}
                                </span>
                                <div className="hidden sm:block w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full",
                                      ep.riskScore > 75 ? "bg-red-500" : ep.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${ep.riskScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleCols.healthScore && (
                            <td className="px-2 py-3 text-center">
                              <span className={cn(
                                "text-[10px] font-black font-mono px-1 py-0.5 rounded",
                                ep.healthScore >= 90 ? "text-emerald-500 dark:bg-emerald-950/20" :
                                ep.healthScore >= 70 ? "text-amber-500 dark:bg-amber-950/20" :
                                ep.healthScore >= 50 ? "text-orange-500 dark:bg-orange-950/20" :
                                "text-red-500 dark:bg-red-950/20 animate-pulse"
                              )}>
                                {ep.healthScore}%
                              </span>
                            </td>
                          )}
                          {visibleCols.status && (
                            <td className="px-3 py-3 text-center">
                              <span className={cn(
                                "py-0.5 px-2 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                                ep.status === "Healthy" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25" :
                                ep.status === "Warning" ? "bg-amber-500/10 text-amber-500 border border-amber-500/25" :
                                ep.status === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/25 animate-pulse" :
                                "bg-slate-500/10 text-slate-500 border border-slate-500/25"
                              )}>
                                {ep.status}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleIsolate(ep)}
                                disabled={ep.status === "Offline"}
                                className={cn(
                                  "p-1 rounded cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-800",
                                  ep.status === "Offline" ? "text-slate-400 dark:text-slate-600 cursor-not-allowed" : "text-amber-500"
                                )}
                                title="Enforce Host Isolation"
                              >
                                <ZapOff size={11} />
                              </button>
                              <button 
                                onClick={() => handleBlockIp(ep)}
                                disabled={ep.status === "Offline"}
                                className={cn(
                                  "p-1 rounded cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-800",
                                  ep.status === "Offline" ? "text-slate-400 dark:text-slate-600 cursor-not-allowed" : "text-red-500"
                                )}
                                title="Drop Target Traffic Rules"
                              >
                                <Ban size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table pagination area */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                <span className="hidden sm:block">Showing {Math.min(filteredEndpoints.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredEndpoints.length, currentPage * itemsPerPage)} of {filteredEndpoints.length} total machines</span>
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded disabled:opacity-20 cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    Prev
                  </button>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">Page {currentPage} of {totalPages || 1}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded disabled:opacity-20 cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>

            {/* Middle Grid containing Matrices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 3. ENDPOINT RISK MATRIX HEATMAP */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                <div className="flex gap-2 items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Activity size={13} className="text-cyan-405" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Detection Spectrum Heatmatrix</h3>
                </div>
                <div className="overflow-x-auto select-none">
                  <div className="min-w-[320px] space-y-1.5 font-mono text-[9px]">
                    <div className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-400">
                      <div className="col-span-2">Endpoint</div>
                      {riskCategories.map((c, i) => (
                        <div key={i} className="text-center text-[8px] truncate uppercase" title={c}>{c.split(' ')[0]}</div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      {matrixEndPoints.map(ep => {
                        return (
                          <div key={ep.id} className="grid grid-cols-6 items-center hover:bg-slate-100/55 dark:hover:bg-slate-800/35 p-0.5 rounded transition-all">
                            <div 
                              onClick={() => { setSelectedId(ep.id); setIsDrawerOpen(true); }}
                              className="col-span-2 truncate font-bold text-slate-705 dark:text-slate-300 cursor-pointer"
                              title={ep.hostname}
                            >
                              {ep.hostname}
                            </div>
                            {riskCategories.map((cat, i) => {
                              // Assign risk score ranges based on factors
                              let val = 10;
                              if (cat.includes("AI1") && ep.ai1.prediction !== "NORMAL") val = ep.ai1.anomalyScore;
                              if (cat.includes("AI2A") && ep.ai2a.attackType !== "None") val = ep.ai2a.confidence;
                              if (cat.includes("AI2B") && ep.ai2b.webAttack !== "None") val = ep.ai2b.confidence;
                              if (cat.includes("Suricata") && ep.alertCount > 0) val = Math.min(99, ep.alertCount * 25);

                              const bgClass = 
                                val >= 80 ? "bg-red-500 border border-red-650" :
                                val >= 55 ? "bg-orange-500 border border-orange-600" :
                                val >= 30 ? "bg-amber-400 border border-amber-500 animate-pulse" :
                                "bg-emerald-500/30 dark:bg-emerald-950/20 border border-emerald-500/20";

                              return (
                                <div 
                                  key={i}
                                  onClick={() => { setSelectedId(ep.id); setIsDrawerOpen(true); }}
                                  className={cn("h-4 rounded mx-1.5 cursor-pointer transition-transform hover:scale-105", bgClass)}
                                  title={`${cat} metric: ${val}% rating`}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TOP RISKY ENDPOINTS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                <div className="flex gap-2 items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Flame size={13} className="text-red-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Top 10 Risky Systems Profiler</h3>
                </div>
                <div className="h-45 w-full text-[9px] font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRiskyData} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="hostname" type="category" stroke="#888888" tickLine={false} axisLine={false} width={80} />
                      <Tooltip 
                        contentStyle={{ fontSize: 9, fontFamily: "monospace", borderRadius: 4, backgroundColor: "#020617", borderColor: "#1e293b" }}
                        labelStyle={{ color: "#94a3b8" }}
                      />
                      <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={10}>
                        {topRiskyData.map((entry, index) => {
                          const col = entry.risk >= 80 ? "#ef4444" : entry.risk >= 50 ? "#f59e0b" : "#10b981";
                          return <Cell key={`cell-${index}`} fill={col} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* 12. ENDPOINT GEO ANALYTICS (MOCK GEOIP WORLD MAP GRAPHIC) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <div className="flex gap-2 items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-indigo-650" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">GeoIP Global Ingress / Egress Map</h3>
                </div>
                <span className="text-[8px] uppercase font-mono tracking-widest text-slate-400">{endpoints.filter(e => e.geoInfo).length} Active Channels Mapped</span>
              </div>
              <div className="relative h-45 bg-slate-100 dark:bg-slate-950/70 rounded-lg flex items-center justify-center overflow-hidden border border-slate-205 dark:border-slate-850">
                {/* SVG representing visual clean continents sketch */}
                <svg viewBox="0 0 1000 400" className="w-full h-full opacity-30 dark:opacity-20 fill-slate-500 dark:fill-zinc-700">
                  <path d="M150,120 Q160,110 180,115 T220,130 T250,110 T300,120 T350,150 T310,220 T250,250 T200,280 T180,240 T150,120 Z" />
                  <path d="M450,100 Q480,80 520,70 T580,90 T640,110 T720,130 T750,160 T730,220 T650,250 T580,220 T520,240 T450,100 Z" />
                  <path d="M220,310 Q240,300 270,305 T320,330 T340,360 T310,390 T250,380 T220,310 Z" />
                  <path d="M780,260 Q810,250 840,255 T870,280 T880,310 T850,330 T810,300 T780,260 Z" />
                </svg>

                {/* Animated Vectors on Top of the Map dynamically pulled from current highlighted item */}
                {selectedEndpointObj && (
                  <svg viewBox="0 0 1000 400" className="absolute inset-0 w-full h-full">
                    {/* Src Node */}
                    <g transform="translate(300, 150)">
                      <circle r="6" fill="#ef4444" className="animate-ping" />
                      <circle r="4" fill="#ef4444" />
                      <text y="-8" textAnchor="middle" fill="#ef4444" className="text-[10px] font-mono font-black">{selectedEndpointObj.geoInfo.srcCode}</text>
                    </g>
                    {/* Destination node */}
                    <g transform="translate(680, 200)">
                      <circle r="6" fill="#3b82f6" className="animate-ping" />
                      <circle r="4" fill="#3b82f6" />
                      <text y="-8" textAnchor="middle" fill="#3b82f6" className="text-[10px] font-mono font-black">{selectedEndpointObj.geoInfo.destCode}</text>
                    </g>
                    {/* Flow link curve */}
                    <path 
                      d="M 300 150 Q 490 80 680 200" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="2.5" 
                      strokeDasharray="6 3"
                      className="origin-center"
                    />
                  </svg>
                )}

                {/* Map stats overlays absolute positioned */}
                <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-slate-950/90 p-2 border border-slate-205 dark:border-slate-805 rounded shadow-sm text-[8px] font-mono uppercase space-y-1">
                  <div className="text-indigo-650 dark:text-cyan-400 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Threat Src Origin
                  </div>
                  <div>IP: {selectedEndpointObj?.ip || "10.100.1.x"}</div>
                  <div>Country: {selectedEndpointObj?.geoInfo.srcCountry || "Vietnam"}</div>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-white/90 dark:bg-slate-950/90 p-2 border border-slate-205 dark:border-slate-805 rounded shadow-sm text-[8px] font-mono uppercase text-right space-y-1">
                  <div className="text-blue-500 font-extrabold flex items-center justify-end gap-1">
                     Destination Tunnel <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                  <div>IP Target Range: {selectedEndpointObj?.geoInfo.destCountry || "United States"}</div>
                </div>
              </div>
            </div>

            {/* Middle Grid Row for Profile Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 5. ENDPOINT TRAFFIC PROFILE CHARTS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-4">
                <div className="flex gap-2 items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Activity size={13} className="text-cyan-400 animate-pulse" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Zeek Log Traffic Spectrometers</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Protocol Distribution pie */}
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Protocols (conn.log)</span>
                    <div className="h-22.5 w-full text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={trafficProfile.protocols} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={30} 
                            fill="#8884d8"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#eab308" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Service distribution Bar */}
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Services Index</span>
                    <div className="h-22.5 w-full text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficProfile.services}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={8} />
                          <Bar dataKey="value" fill="#818cf8" barSize={8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Top Src IP lists according to schema conn.log */}
                <div className="grid grid-cols-2 gap-3 text-[9px] font-mono pt-1">
                  <div>
                    <p className="border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-400 font-bold uppercase">Top Inbound Src (KB)</p>
                    {trafficProfile.topSrc.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/10">
                        <span className="truncate max-w-22.5" title={item.ip}>{item.ip}</span>
                        <span className="font-bold text-slate-700 dark:text-zinc-300">{item.bytes} KB</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-400 font-bold uppercase">Top Outbound Dest (KB)</p>
                    {trafficProfile.topDest.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-100/50 dark:border-slate-800/10">
                        <span className="truncate max-w-22.5" title={item.ip}>{item.ip}</span>
                        <span className="font-bold text-slate-700 dark:text-zinc-300">{item.bytes} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. ENDPOINT ALERT DISTRIBUTION DOUGHNUT */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                <div className="flex gap-2 items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Flame size={13} className="text-red-500 animate-pulse" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Fusion Attack Categories Alerts</h3>
                </div>
                <div className="h-30 w-full text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={doughnutData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={30} 
                        outerRadius={50} 
                        dataKey="value"
                      >
                        {doughnutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ATTACK_COLORS[index % ATTACK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom list grid index values */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[8.5px] text-zinc-650 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {doughnutData.map((item, idx) => (
                    <div key={idx} className="flex flex-col border-r border-slate-100 dark:border-slate-800 pr-1 last:border-none">
                      <span className="truncate uppercase font-bold" title={item.name}>{item.name}</span>
                      <span className="font-extrabold text-high" style={{ color: ATTACK_COLORS[idx % ATTACK_COLORS.length] }}>{item.value} Alert</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right slide panel / Detail Info Grid (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 13. ENDPOINT HEALTH SCORE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex gap-2 items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <Activity size={13} className="text-indigo-650 dark:text-cyan-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider">Telemetry Health Gauge</h3>
              </div>
              {selectedEndpointObj ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center pt-2 relative">
                    {/* Ring score */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="48" 
                          stroke={
                            selectedEndpointObj.healthScore >= 90 ? "#10b981" :
                            selectedEndpointObj.healthScore >= 70 ? "#f59e0b" :
                            selectedEndpointObj.healthScore >= 50 ? "#f97316" : "#ef4444"
                          } 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray="301.59"
                          strokeDashoffset={301.59 - (301.59 * selectedEndpointObj.healthScore) / 100}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute text-center bg-slate-100 dark:bg-slate-950 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-lg font-black font-mono tracking-tighter">{selectedEndpointObj.healthScore}%</span>
                        <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global Health</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-mono leading-none">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-205 dark:border-slate-855 rounded-lg">
                      <p className="text-slate-500 mb-1 uppercase text-[7px] font-bold">Severity Level</p>
                      <p className={cn(
                        "font-black uppercase tracking-wider",
                        selectedEndpointObj.healthScore >= 90 ? "text-emerald-500" :
                        selectedEndpointObj.healthScore >= 70 ? "text-amber-500" :
                        selectedEndpointObj.healthScore >= 50 ? "text-orange-500" :
                        "text-red-500 animate-pulse"
                      )}>
                        {selectedEndpointObj.healthScore >= 90 ? "Healthy" :
                         selectedEndpointObj.healthScore >= 70 ? "Warning" :
                         selectedEndpointObj.healthScore >= 50 ? "High Risk" : "Critical"}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-205 dark:border-slate-855 rounded-lg">
                      <p className="text-slate-500 mb-1 uppercase text-[7px] font-bold">Mitre Score</p>
                      <p className="font-extrabold text-slate-700 dark:text-zinc-200 uppercase">{selectedEndpointObj.timeline.length} Records</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-mono text-center py-6">Select a host node in our index directory grid.</p>
              )}
            </div>

            {/* 9. ATTACK PATH VISUALIZATION GRAPH */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex gap-2 items-center border-b border-slate-100 dark:border-slate-800 pb-2 justify-between">
                <div className="flex items-center gap-1.5">
                  <GitFork size={13} className="text-indigo-650" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Attack Tree Graph Visualization</h3>
                </div>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              </div>

              {/* Graphical rendering area using flex blocks and linking SVGs */}
              <div className="space-y-4 font-mono text-[9px] relative py-2">
                
                {/* Node 1: Attacker Kali VM */}
                <div className="flex flex-col items-center">
                  <div className="p-2 border border-red-505 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg text-center tracking-widest uppercase font-extrabold flex items-center gap-1">
                    <Flame size={12} className="animate-bounce" /> Kali Attacker (192.168.1.99)
                  </div>
                </div>

                {/* Animated Arrow 1 */}
                <div className="flex justify-center -my-2">
                  <svg className="w-6 h-8 text-red-405 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Node 2: Target Target Web Host */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "p-2 border rounded-lg text-center tracking-widest uppercase font-mono flex items-center gap-1 w-5/6 justify-center",
                    selectedEndpointObj?.status === "Critical" ? "border-red-505 bg-red-500/10 text-red-505" :
                    selectedEndpointObj?.status === "Warning" ? "border-amber-550 bg-amber-500/10 text-amber-550" :
                    "border-slate-350 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-zinc-400"
                  )}>
                    <Monitor size={12} /> {selectedEndpointObj?.hostname || "Target Victim"}
                  </div>
                </div>

                {/* Animated Arrow 2 */}
                <div className="flex justify-center -my-2">
                  <svg className="w-6 h-8 text-neutral-450 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Node 3: Affected Core services e.g. SQL Database */}
                <div className="flex flex-col items-center">
                  <div className="p-2 border border-purple-505 bg-purple-500/10 text-purple-400 rounded-lg text-center tracking-widest uppercase w-4/5 flex items-center gap-1 justify-center">
                    <Server size={12} /> Target database Sub (3306)
                  </div>
                </div>

                <p className="text-[8px] text-center text-slate-400 uppercase leading-none">Attack sequence triggered via Drupal API route exploitation vectors.</p>
              </div>
            </div>

            {/* 7. ENDPOINT TIMELINE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-cyan-405" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider">Device Chronicle Timeline</h3>
                </div>
                {/* Zoom range controller */}
                <div className="flex items-center gap-1">
                  <span className="text-[7.5px] uppercase font-mono text-slate-400">Scale zoom</span>
                  <input 
                    type="range" 
                    min="30" 
                    max="100" 
                    value={timelineZoom}
                    onChange={(e) => setTimelineZoom(Number(e.target.value))}
                    className="w-16 h-1 bg-slate-250 dark:bg-slate-805 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {selectedEndpointObj ? (
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-3 font-mono text-[10px] overflow-y-auto max-h-47.5 pr-1">
                  {selectedEndpointObj.timeline
                    .slice(0, Math.ceil(selectedEndpointObj.timeline.length * (timelineZoom / 100)))
                    .map((item, index) => (
                      <div key={item.id} className="relative group/time">
                        {/* Circle marker */}
                        <span className={cn(
                          "absolute left-[-20.5px] top-1 w-2 h-2 rounded-full",
                          item.severity === "Critical" ? "bg-red-500" :
                          item.severity === "High" ? "bg-amber-500" : "bg-indigo-550"
                        )} />
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-505 dark:text-zinc-500 font-black">{item.time}</span>
                          <p className="font-extrabold text-[#111] dark:text-[#f8fafc] leading-snug uppercase">{item.event}</p>
                          <span className={cn(
                            "text-[7px] border rounded px-1.5 py-0.2 uppercase font-black tracking-widest",
                            item.severity === "Critical" ? "border-red-500 bg-red-500/10 text-red-550" :
                            "border-slate-350 text-slate-450 bg-slate-100/40"
                          )}>
                            {item.severity} Level
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-slate-400 text-center py-6">Highlight target vm node below.</p>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* 10. ENDPOINT INCIDENT HISTORY DATA GRID */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-red-500 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider">Fusion Consensus Threats Data Grid</h2>
            </div>
            <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-red-500 font-extrabold border border-slate-250 dark:border-slate-850">
              {incidents.length} Records Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse text-[11px] min-w-175">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900 text-[10px] text-slate-500 font-black border-b border-slate-200 dark:border-slate-800 uppercase tracking-widest">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Host Node</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3">Attack Category</th>
                  <th className="px-5 py-3 text-center">Severity</th>
                  <th className="px-5 py-3">Risk Rating</th>
                  <th className="px-5 py-3">Mitigation AI Context</th>
                  <th className="px-5 py-3 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {incidents.map((inc, i) => (
                  <tr 
                    key={inc.id}
                    onClick={() => { setSelectedIncident(inc); setIsModalOpen(true); }}
                    className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/10"
                  >
                    <td className="px-5 py-3 text-[10px] text-indigo-650 dark:text-cyan-404 font-extrabold">{inc.timestamp}</td>
                    <td className="px-5 py-3 font-bold dark:text-zinc-200">{inc.hostname}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{inc.ip}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 text-[9px] font-black uppercase tracking-wider">
                        {inc.attackType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn(
                        "py-0.5 px-2 rounded-full text-[8px] font-black uppercase tracking-widest",
                        inc.severity === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-extrabold text-red-550">{inc.riskScore}%</td>
                    <td className="px-5 py-3 text-[10px] text-slate-400">{inc.aiSource}</td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => { setSelectedIncident(inc); setIsModalOpen(true); }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-205 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-[8.5px] font-black uppercase tracking-wider rounded cursor-pointer transition-colors"
                      >
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. ENDPOINT DETAIL DRAWER (RIGHT PANEL SLIDE OUT SHOWN AS COMPONENT SIDE PANEL WHEN DRAWER IS TOGGLED ON) */}
      {selectedEndpointObj && isDrawerOpen && (
        <div className="fixed top-0 right-0 h-full w-90 md:w-120 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 transform transition-all p-5 font-mono text-[10px] overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server size={15} className="text-indigo-650" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-wider">{selectedEndpointObj.hostname}</span>
                <span className="text-[8px] text-slate-450 font-black">{selectedEndpointObj.id}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[9px] font-black rounded uppercase cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* ASSET INFORMATION */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-850 pb-3">
            <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5">Asset Information</h3>
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div><span className="text-slate-400">Hostname:</span> <p className="font-bold">{selectedEndpointObj.hostname}</p></div>
              <div><span className="text-slate-400">IP Address:</span> <p className="font-bold">{selectedEndpointObj.ip}</p></div>
              <div><span className="text-slate-400">MAC Address:</span> <p className="font-bold">{selectedEndpointObj.mac}</p></div>
              <div><span className="text-slate-400">OS Module:</span> <p className="font-bold">{selectedEndpointObj.os}</p></div>
              <div><span className="text-slate-400">Role Assign:</span> <p className="font-bold text-slate-800 dark:text-zinc-300">{selectedEndpointObj.role}</p></div>
              <div><span className="text-slate-400">Telemetry Register:</span> <p className="font-bold">{selectedEndpointObj.firstSeen}</p></div>
            </div>
          </div>

          {/* NETWORK STATS ACTIVITY */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-850 pb-3">
            <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5">Network Analytics Spectrum</h3>
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div><span className="text-slate-400">Connections (Zeek):</span> <p className="font-bold text-amber-500">{selectedEndpointObj.totalConnections} Flows</p></div>
              <div><span className="text-slate-400">Dispatched Payload:</span> <p className="font-bold text-indigo-500">{(selectedEndpointObj.totalBytes / (1024 * 1024)).toFixed(2)} MB</p></div>
            </div>
            <div className="pt-2">
              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold block mb-1">Port Service Distribution Bounds</span>
              <div className="grid grid-cols-5 gap-1 text-[8.5px] text-center">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-855 rounded p-1">
                  <span className="text-slate-400 block h-3">HTTP</span>
                  <span className="font-black">{selectedEndpointObj.services.HTTP}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-855 rounded p-1">
                  <span className="text-slate-400 block h-3">DNS</span>
                  <span className="font-black">{selectedEndpointObj.services.DNS}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-855 rounded p-1">
                  <span className="text-slate-400 block h-3">SSH</span>
                  <span className="font-black">{selectedEndpointObj.services.SSH}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-855 rounded p-1">
                  <span className="text-slate-400 block h-3">HTTPS</span>
                  <span className="font-black">{selectedEndpointObj.services.HTTPS}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-855 rounded p-1">
                  <span className="text-slate-400 block h-3">OTHER</span>
                  <span className="font-black">{selectedEndpointObj.services.OTHER}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI ANALYSIS MODULE DEEP RESEARCH (AI1, AI2A, AI2B) */}
          <div className="space-y-4 border-b border-slate-200 dark:border-slate-850 pb-3">
            <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5">AI Models Cognition Insights</h3>
            
            <div className="space-y-2.5 font-sans">
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-202 dark:border-slate-802 p-2.5 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
                  <span className="text-indigo-600 dark:text-cyan-400">AI1 Anomaly Estimator</span>
                  <span className={cn(
                    "px-1 rounded",
                    selectedEndpointObj.ai1.prediction === "ANOMALOUS" ? "bg-red-500/10 text-red-500" : "bg-neutral-500/10 text-neutral-400"
                  )}>{selectedEndpointObj.ai1.prediction}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Anomaly Prediction Index</span>
                  <span className="font-mono font-extrabold">{selectedEndpointObj.ai1.anomalyScore}%</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-202 dark:border-slate-802 p-2.5 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
                  <span className="text-indigo-600 dark:text-cyan-400">AI2A Attack Classifier</span>
                  <span className="text-amber-500">{selectedEndpointObj.ai2a.attackType !== "None" ? "ATTACK TRIGGERED" : "CLEAR"}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Attack Classification: {selectedEndpointObj.ai2a.attackType}</span>
                  <span className="font-mono font-extrabold">{selectedEndpointObj.ai2a.confidence}% Confidence</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-202 dark:border-slate-802 p-2.5 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase font-mono">
                  <span className="text-indigo-600 dark:text-cyan-400">AI2B HTTP API Web Parser</span>
                  <span className="text-blue-400">{selectedEndpointObj.ai2b.webAttack !== "None" ? "PROBE SEEN" : "CLEAR"}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">API Web payload probe: {selectedEndpointObj.ai2b.webAttack}</span>
                  <span className="font-mono font-extrabold">{selectedEndpointObj.ai2b.confidence}% Confidence</span>
                </div>
              </div>
            </div>
          </div>

          {/* SURICATA RULE EVIDENCE */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-850 pb-3">
            <h3 className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest border-l-2 border-indigo-405 pl-1.5">Suricata IDS Evidence</h3>
            {selectedEndpointObj.alertCount > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded text-[9.5px] space-y-1">
                <div className="flex justify-between font-black">
                  <span>SIGNATURE TRIGGERED</span>
                  <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded uppercase font-bold">{selectedEndpointObj.suricata.severity}</span>
                </div>
                <p className="font-extrabold text-[#222] dark:text-amber-400 italic">"{selectedEndpointObj.suricata.signature}"</p>
                <p className="text-slate-400 text-[8.5px] uppercase font-bold">Category: {selectedEndpointObj.suricata.category}</p>
              </div>
            ) : (
              <p className="text-[9.5px] text-slate-400 font-mono">No active Suricata signatures compiled for this target machine assets.</p>
            )}
          </div>

          {/* FUSION CORE DECISION AND MITRE MAP */}
          <div className="space-y-3 bg-indigo-50/50 dark:bg-slate-900 pb-3 pt-2.5 px-3 rounded-lg border border-indigo-120 dark:border-slate-800">
            <h3 className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
              <GitFork size={11} /> Fusion Layer Decision
            </h3>
            {selectedEndpointObj.riskScore > 40 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black">
                  <span className="text-red-500 uppercase">{selectedEndpointObj.fusion.finalAttackType}</span>
                  <span className="text-slate-400">{selectedEndpointObj.fusion.riskScore}% Fusion Score</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">MITRE ATT&CK Mitigation Action Match:</span>
                  <p className="text-[10px] font-mono font-extrabold text-[#111] dark:text-emerald-400 uppercase">{selectedEndpointObj.fusion.mitreMapping}</p>
                </div>
              </div>
            ) : (
              <p className="text-[9.5px] text-slate-400 font-mono">System is behaving normally under fusion audit checks.</p>
            )}
          </div>

        </div>
      )}

      {/* 11. ENDPOINT INCIDENT MODAL PREVIEW EVIDENCE (ZEEK CON LOGS, HTTP SEEN, FUSION FLOW DIAGRAM GRAPHIC) */}
      {isModalOpen && selectedIncident && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-[10px]">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-red-500 w-4 h-4 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Investigative Evidence Drawer: {selectedIncident.id}</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="hover:text-red-500 text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
              
              {/* Incident Context Grid */}
              <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div>
                  <span className="text-slate-400 uppercase">Affected Machine:</span>
                  <p className="font-extrabold text-[11px] uppercase dark:text-zinc-200">{selectedIncident.hostname}</p>
                  <p className="text-slate-400">{selectedIncident.ip} • ID: {selectedIncident.endpointId}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase">Detection Time:</span>
                  <p className="font-extrabold text-[11px] uppercase dark:text-zinc-200">{selectedIncident.timestamp}</p>
                  <span className="px-2.5 py-0.5 rounded-full text-[8px] bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest">{selectedIncident.severity} Severity</span>
                </div>
              </div>

              {/* Zeek Evidence */}
              <div className="space-y-2.5">
                <span className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Server size={12} /> Zeek Ecosystem Evidence
                </span>
                <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-205 dark:border-slate-855 space-y-3.5 text-[9.5px]">
                  
                  {/* conn.log */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-amber-500 font-black block uppercase">&#187; zeek conn.log schema output</span>
                    <div className="grid grid-cols-4 gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                      <div><span className="text-slate-400">Duration:</span> <p className="font-extrabold font-mono text-zinc-900 dark:text-zinc-100">{selectedIncident.zeekLogs?.conn.duration.toFixed(3)}s</p></div>
                      <div><span className="text-slate-400">Bytes Shipped:</span> <p className="font-extrabold font-mono text-zinc-900 dark:text-zinc-100">{selectedIncident.zeekLogs?.conn.bytes.toLocaleString()} B</p></div>
                      <div><span className="text-slate-400">Packets count:</span> <p className="font-extrabold font-mono text-zinc-900 dark:text-zinc-100">{selectedIncident.zeekLogs?.conn.packets}</p></div>
                      <div><span className="text-slate-400">Conn state:</span> <p className="font-extrabold font-mono text-emerald-500 uppercase">{selectedIncident.zeekLogs?.conn.conn_state}</p></div>
                    </div>
                  </div>

                  {/* http.log */}
                  {selectedIncident.zeekLogs?.http && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[8px] text-cyan-400 font-black block uppercase">&#187; zeek http.log payload inspect</span>
                      <div className="grid grid-cols-1 gap-2 text-[9px] leading-relaxed">
                        <div>
                          <span className="text-slate-400">Request:</span>
                          <p className="font-black font-mono text-cyan-500 uppercase">{selectedIncident.zeekLogs.http.method} {selectedIncident.zeekLogs.http.uri}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Browser Agent Header:</span>
                          <p className="text-slate-400 italic">"{selectedIncident.zeekLogs.http.user_agent}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Suricata Alert Source */}
              {selectedIncident.suricataAlert && (
                <div className="space-y-2">
                  <span className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={12} fill="currentColor" className="text-transparent" /> Suricata Rule Alerts
                  </span>
                  <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-205 dark:border-slate-855 text-[9.5px] space-y-1">
                    <span className="text-[8.5px] bg-red-500/10 border border-red-500/20 text-red-500 px-1.5 rounded uppercase font-bold">Severity: {selectedIncident.suricataAlert.severity}</span>
                    <p className="font-extrabold text-[#222] dark:text-red-400">SA Signature: {selectedIncident.suricataAlert.signature}</p>
                    <p className="text-slate-400">Target Range: {selectedIncident.suricataAlert.src_ip}:{selectedIncident.suricataAlert.src_port} &#8594; {selectedIncident.suricataAlert.dest_ip}:{selectedIncident.suricataAlert.dest_port}</p>
                  </div>
                </div>
              )}

              {/* 11. Fusion Decision Flow Graph */}
              <div className="space-y-2">
                <span className="text-[9px] text-indigo-650 dark:text-cyan-404 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={12} className="animate-spin" /> Fusion Decision Pipeline Flowchart
                </span>
                <div className="bg-indigo-50/10 dark:bg-slate-950 p-4 border border-indigo-200/10 dark:border-slate-855 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 font-mono text-[9px] text-center">
                    
                    <div className="p-1 px-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded shadow-sm w-36">
                      <span className="text-[7.5px] text-slate-400 block uppercase">Step 1: Zeek Logs</span>
                      <p className="font-extrabold uppercase">Telemetry Read</p>
                    </div>

                    <span className="hidden md:inline">&#8594;</span>

                    <div className="p-1 px-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded shadow-sm w-36">
                      <span className="text-[7.5px] text-slate-400 block uppercase">Step 2: model AI1</span>
                      <p className="font-extrabold text-red-500 uppercase">Anomaly 93%</p>
                    </div>

                    <span className="hidden md:inline">&#8594;</span>

                    <div className="p-1 px-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded shadow-sm w-36">
                      <span className="text-[7.5px] text-slate-400 block uppercase">Step 3: model AI2A</span>
                      <p className="font-extrabold text-amber-500 uppercase">{selectedIncident.attackType} 91%</p>
                    </div>

                    <span className="hidden md:inline">&#8594;</span>

                    <div className="p-1.5 px-3 bg-indigo-500 text-white rounded shadow-sm w-36">
                      <span className="text-[7.5px] text-indigo-200 block uppercase font-mono">Consensus</span>
                      <p className="font-extrabold uppercase">Fusion Core</p>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-right bg-slate-50/70 dark:bg-slate-900/60">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-white hover:text-white uppercase font-black text-[9px] tracking-widest rounded-lg cursor-pointer"
              >
                Dismiss Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
