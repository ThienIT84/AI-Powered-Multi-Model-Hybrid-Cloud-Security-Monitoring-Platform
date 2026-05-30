import React, { useState } from "react";
import {
  Shield,
  Search,
  Download,
  RefreshCw,
  Globe,
  Link2,
  Hash,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  Activity,
  Zap,
  User,
  Bug,
  Database,
  CheckCircle2,
  Clock,
  Server,
  Target,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: "TỔNG CHỈ SỐ (IOCS)", value: "211,503", delta: "+2.4%", icon: Activity, color: "text-blue-500", border: "border-blue-500/20", accentHex: "#3b82f6" },
  { label: "NGUỒN TIN HOẠT ĐỘNG", value: "5/6", delta: "+2.4%", icon: CheckCircle2, color: "text-emerald-500", border: "border-emerald-500/20", accentHex: "#10b981" },
  { label: "LỖ HỔNG NGHIÊM TRỌNG", value: "2", delta: "+2.4%", icon: Bug, color: "text-red-500", border: "border-red-500/20", accentHex: "#ef4444" },
  { label: "TÁC NHÂN ĐANG HOẠT ĐỘNG", value: "4", delta: "+2.4%", icon: User, color: "text-amber-500", border: "border-amber-500/20", accentHex: "#f59e0b" }
];

const IOC_TREND_DATA = [
  { time: "00:00", iocs: 120, threats: 45 },
  { time: "04:00", iocs: 250, threats: 80 },
  { time: "08:00", iocs: 180, threats: 60 },
  { time: "12:00", iocs: 420, threats: 110 },
  { time: "16:00", iocs: 310, threats: 95 },
  { time: "20:00", iocs: 580, threats: 140 },
  { time: "23:59", iocs: 450, threats: 125 },
];

const THREAT_DISTRIBUTION = [
  { name: "Phần mềm độc hại", value: 45, color: "#3b82f6" },
  { name: "Lừa đảo trực tuyến", value: 25, color: "#10b981" },
  { name: "Tấn công mạng", value: 20, color: "#f59e0b" },
  { name: "Ransomware", value: 10, color: "#ef4444" },
];

const RECENT_IOCS = [
  { id: 1, type: "IP", value: "45.33.32.156", threat: "Command & Control", confidence: 95, color: "text-blue-500", icon: Globe },
  { id: 2, type: "Domain", value: "malware-c2.evil.com", threat: "Malware Distribution", confidence: 89, color: "text-cyan-500", icon: Link2 },
  { id: 3, type: "Hash", value: "a1b2c3d4e5f6...", threat: "Ransomware", confidence: 98, color: "text-violet-500", icon: Hash },
  { id: 4, type: "URL", value: "https://phishing.fake-bank.com/login", threat: "Phishing", confidence: 92, color: "text-rose-500", icon: ExternalLink }
];

const THREAT_FEEDS = [
  { name: "AlienVault OTX", type: "Multi-source", count: "45,678 IOCs", time: "5 min ago", status: "active" },
  { name: "Abuse.ch", type: "Malware", count: "23,456 IOCs", time: "10 min ago", status: "active" },
  { name: "Emerging Threats", type: "IDS Rules", count: "12,890 IOCs", time: "15 min ago", status: "active" },
  { name: "VirusTotal", type: "File Hashes", count: "89,234 IOCs", time: "2 min ago", status: "active" },
  { name: "PhishTank", type: "Phishing URLs", count: "5,678 IOCs", time: "1 hour ago", status: "warning" },
  { name: "Spamhaus", type: "IP/Domain", count: "34,567 IOCs", time: "30 min ago", status: "active" }
];

const THREAT_ACTORS = [
  { name: "APT28 (Fancy Bear)", origin: "Russia", motivation: "Espionage", techniques: "45 mapped", sectors: ["Government", "Defense", "Media"], status: "Active" },
  { name: "Lazarus Group", origin: "North Korea", motivation: "Financial", techniques: "38 mapped", sectors: ["Financial", "Crypto", "Entertainment"], status: "Active" },
  { name: "APT41", origin: "China", motivation: "Espionage/Financial", techniques: "52 mapped", sectors: ["Healthcare", "Tech", "Telecom"], status: "Active" },
  { name: "FIN7", origin: "Russia", motivation: "Financial", techniques: "28 mapped", sectors: ["Retail", "Hospitality", "Finance"], status: "Active" }
];

const VULNERABILITIES = [
  { cve: "CVE-2024-21412", title: "Windows SmartScreen Bypass", severity: "CRITICAL", cvss: 9.8, exploited: "Active Exploit", assets: 12 },
  { cve: "CVE-2024-20253", title: "Cisco Unified CM RCE", severity: "CRITICAL", cvss: 9.9, exploited: "No", assets: 3 },
  { cve: "CVE-2024-1234", title: "Apache Log4j New Variant", severity: "HIGH", cvss: 8.1, exploited: "Active Exploit", assets: 8 },
  { cve: "CVE-2024-0567", title: "OpenSSL Buffer Overflow", severity: "HIGH", cvss: 7.5, exploited: "No", assets: 15 },
  { cve: "CVE-2024-9999", title: "WordPress Plugin SQLi", severity: "MEDIUM", cvss: 6.5, exploited: "Active Exploit", assets: 2 }
];

// ─── Components ──────────────────────────────────────────────────────────────

export function ThreatIntelPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDonutIndex, setActiveIndex] = useState<number | null>(null);

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "indicators", label: "Chỉ số (IOCs)" },
    { id: "actors", label: "Tác nhân đe dọa" },
    { id: "vulnerabilities", label: "Lỗ hổng bảo mật" },
    { id: "feeds", label: "Nguồn tin đe dọa" }
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-border transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-rose-500 uppercase">
              INTEL & ADVERSARY TRACKING
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
            THREAT INTELLIGENCE
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            GIÁM SÁT NGUỒN TIN, IOCS VÀ HOẠT ĐỘNG CỦA TÁC NHÂN ĐE DỌA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded text-[10px] font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Xuất IOCs
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-black text-cyan-500 hover:bg-cyan-500/20 transition-all uppercase tracking-widest cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ Feeds
          </button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ 
              scale: 1.02, 
              translateY: -2,
              boxShadow: `0 0 25px color-mix(in srgb, ${kpi.accentHex}, transparent 80%)`,
              borderColor: kpi.accentHex
            }}
            className={cn(
              "bg-card border border-border rounded-xl p-5 relative overflow-hidden group transition-all duration-300 cursor-pointer",
              "hover:border-opacity-50"
            )}
            style={{
              boxShadow: `0 4px 12px rgba(0,0,0,0.03)`,
            }}
          >
            {/* Background Glow */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 pointer-events-none transition-opacity" 
              style={{ backgroundColor: kpi.accentHex }} 
            />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn("p-2.5 rounded-xl bg-background border border-border transition-all group-hover:shadow-lg", kpi.color, kpi.border)}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
              <span className={cn("text-[10px] font-mono font-black px-2 py-0.5 rounded border bg-background/50 backdrop-blur-sm transition-colors", kpi.color, kpi.border)}>
                {kpi.delta}
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black">{kpi.label}</p>
              <h3 className={cn("text-2xl font-black tracking-tight", kpi.color)}>{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────────── */}
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm IOCs (IP, domain, hash, URL)..."
          className="w-full bg-card border border-border rounded-xl pl-12 pr-32 py-3.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all uppercase tracking-wider shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-current" /> TRUY VẾT
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* IOC Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 relative overflow-hidden group transition-all hover:border-cyan-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Xu hướng Phát hiện IOCs</h3>
                        <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Dữ liệu thời gian thực trong 24h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-mono font-black uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-muted-foreground">IOCs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-muted-foreground">Mối đe dọa</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={IOC_TREND_DATA}>
                        <defs>
                          <linearGradient id="colorIocs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px', fontFamily: 'JetBrains Mono', fontWeight: '900' }}
                          itemStyle={{ padding: '2px 0' }}
                        />
                        <Area type="monotone" dataKey="iocs" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorIocs)" />
                        <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Threat Distribution Pie Chart */}
                <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group transition-all hover:border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <PieChartIcon className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Phân loại Đe dọa</h3>
                      <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Theo danh mục IOCs</p>
                    </div>
                  </div>
                  <div className="h-[160px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={THREAT_DISTRIBUTION}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          onClick={(_, index) => setActiveIndex(index === activeDonutIndex ? null : index)}
                          className="cursor-pointer outline-none"
                        >
                          {THREAT_DISTRIBUTION.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              style={{
                                filter: activeDonutIndex === index ? `drop-shadow(0 0 12px ${entry.color})` : 'none',
                                transition: 'all 0.3s ease'
                              }}
                              stroke={activeDonutIndex === index ? '#fff' : 'none'}
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px', fontFamily: 'JetBrains Mono', fontWeight: '900' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-foreground">100%</span>
                      <span className="text-[6px] font-mono text-muted-foreground uppercase tracking-widest">PHÂN TÍCH</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {THREAT_DISTRIBUTION.map((item, index) => (
                      <div 
                        key={item.name} 
                        onClick={() => setActiveIndex(index === activeDonutIndex ? null : index)}
                        className={cn(
                          "flex items-center justify-between group cursor-pointer transition-all px-2 py-1 rounded border",
                          activeDonutIndex === index ? "border-white/20 bg-white/5 shadow-sm" : "border-transparent hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: item.color, boxShadow: activeDonutIndex === index ? `0 0 8px ${item.color}` : 'none' }} />
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-tight transition-colors",
                            activeDonutIndex === index ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}>{item.name}</span>
                        </div>
                        {activeDonutIndex === index && (
                          <span className="text-[9px] font-black font-mono text-cyan-500">
                            {item.value}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent IOCs */}
                <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30 group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" />
                      </div>
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">IOCs Mới nhất</h3>
                    </div>

                    <div className="space-y-2">
                      {RECENT_IOCS.map((ioc) => (
                        <div 
                          key={ioc.id} 
                          className="group cursor-pointer flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/5 hover:border-cyan-500/30 hover:bg-muted/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-background border border-border transition-all group-hover:scale-110 shadow-sm", ioc.color)}>
                              <ioc.icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground group-hover:text-cyan-500 transition-colors tracking-tight leading-none">{ioc.value}</p>
                              <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-[0.2em] font-black mt-1">{ioc.threat}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-mono text-muted-foreground uppercase font-black tracking-widest">CONFIDENCE</span>
                              <span className={cn("text-[9px] font-black font-mono px-1.5 py-0.5 rounded border bg-background", ioc.confidence >= 90 ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20")}>
                                {ioc.confidence}%
                              </span>
                            </div>
                            <div className="h-1 w-20 bg-muted rounded-full overflow-hidden border border-border/50">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${ioc.confidence}%` }}
                                 className={cn("h-full rounded-full shadow-[0_0_6px_currentColor]", ioc.confidence >= 90 ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500")} 
                               />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 border-t border-border/50 text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] hover:bg-cyan-500/5 transition-all mt-1">
                      XEM TẤT CẢ CHỈ SỐ
                    </button>
                  </div>
                </div>

                {/* Threat Feed Status */}
                <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Database className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Trạng thái Nguồn tin</h3>
                    </div>

                    <div className="space-y-2">
                      {THREAT_FEEDS.map((feed) => (
                        <div 
                          key={feed.name} 
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/5 hover:border-emerald-500/30 hover:bg-muted/10 transition-all duration-300 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={cn("w-2 h-2 rounded-full animate-pulse", feed.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]")} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground group-hover:text-emerald-500 transition-colors tracking-tight leading-none">{feed.name}</p>
                              <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-[0.2em] font-black mt-1">{feed.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-foreground tracking-tight font-mono leading-none">{feed.count}</p>
                            <div className="flex items-center justify-end gap-1 text-[8px] text-muted-foreground font-mono uppercase tracking-widest font-black mt-1">
                              <Clock className="w-2.5 h-2.5" /> {feed.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 border-t border-border/50 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] hover:bg-emerald-500/5 transition-all mt-1">
                      QUẢN LÝ NGUỒN TIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "indicators" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Loại</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Giá trị</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mối đe dọa</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tin cậy</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nguồn</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nhãn (Tags)</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Thấy lần đầu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {RECENT_IOCS.map((ioc) => (
                      <tr key={ioc.id} className="hover:bg-cyan-500/[0.02] transition-colors group cursor-pointer">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-background border border-border shadow-sm group-hover:shadow-md transition-all", ioc.color)}>
                              <ioc.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{ioc.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm font-black text-foreground group-hover:text-cyan-500 transition-colors tracking-tight">{ioc.value}</td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded border border-border">{ioc.threat}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${ioc.confidence}%` }}
                                className={cn("h-full rounded-full shadow-[0_0_8px_currentColor]", ioc.confidence >= 90 ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500")} 
                              />
                            </div>
                            <span className={cn("text-[11px] font-black font-mono", ioc.confidence >= 90 ? "text-emerald-500" : "text-amber-500")}>{ioc.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AlienVault OTX</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">APT28</span>
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest">Cobalt Strike</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase font-bold">
                            <Clock className="w-3.5 h-3.5" /> 2 hours ago
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "actors" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {THREAT_ACTORS.map((actor) => (
                <div key={actor.name} className="bg-card border border-border rounded-2xl p-7 hover:border-cyan-500/50 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
                  
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    {actor.status}
                  </div>

                  <div className="flex items-start gap-5 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground group-hover:text-cyan-500 transition-colors uppercase tracking-tight leading-tight">{actor.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest font-bold">Nguồn gốc: {actor.origin}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-8 relative z-10">
                    <div className="p-4 rounded-xl bg-muted/5 border border-border/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Động lực</p>
                      <p className="text-sm font-black text-foreground tracking-tight">{actor.motivation}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/5 border border-border/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Kỹ thuật (TTPs)</p>
                      <p className="text-sm font-black text-foreground tracking-tight">{actor.techniques}</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Lĩnh vực mục tiêu
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {actor.sectors.map(sector => (
                        <span key={sector} className="px-3 py-1.5 rounded-lg bg-background border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-cyan-500 hover:border-cyan-500/30 transition-all cursor-default">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 pt-5 border-t border-border/50 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-500" /> Hoạt động gần nhất: Hôm nay
                    </span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[11px] font-black text-cyan-500 uppercase tracking-widest transition-all group/btn">
                      Xem hồ sơ <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "vulnerabilities" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mã CVE</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tiêu đề</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mức độ</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Điểm CVSS</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Khai thác</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tài sản</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {VULNERABILITIES.map((vuln) => (
                      <tr key={vuln.cve} className="hover:bg-cyan-500/[0.02] transition-colors group cursor-pointer">
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm font-black text-cyan-500 hover:underline decoration-cyan-500/30 underline-offset-4">{vuln.cve}</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-foreground group-hover:text-cyan-500/80 transition-colors">{vuln.title}</td>
                        <td className="px-6 py-5">
                          <span className={cn("px-2.5 py-1 rounded text-[9px] font-black uppercase border tracking-widest shadow-sm",
                            vuln.severity === "CRITICAL" ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5" :
                            vuln.severity === "HIGH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/5" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5"
                          )}>
                            {vuln.severity}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                              <div className={cn("h-full rounded-full", vuln.cvss >= 9 ? "bg-red-500" : "bg-orange-500")} style={{ width: `${vuln.cvss * 10}%` }} />
                            </div>
                            <span className="text-sm font-black font-mono text-foreground">{vuln.cvss}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("px-2.5 py-1 rounded text-[9px] font-black uppercase border tracking-widest",
                            vuln.exploited === "Active Exploit" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-muted/50 text-muted-foreground border-border"
                          )}>
                            {vuln.exploited}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Server className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-black text-foreground">{vuln.assets}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "feeds" && (
            <div className="space-y-4">
              {THREAT_FEEDS.map((feed) => (
                <div key={feed.name} className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between hover:border-cyan-500/30 hover:bg-muted/5 transition-all duration-300 group shadow-sm">
                  <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="relative">
                        <div className={cn("w-3 h-3 rounded-full animate-pulse", feed.status === 'active' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]")} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-cyan-500 transition-colors">{feed.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] font-bold mt-0.5">{feed.type}</p>
                      </div>
                    </div>
                    
                    <div className="hidden lg:grid grid-cols-3 gap-12 flex-1">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Chỉ số</p>
                        <p className="text-base font-black text-foreground tracking-tight">{feed.count}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Cập nhật cuối</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          <p className="text-sm font-black text-foreground font-mono uppercase">{feed.time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Trạng thái đồng bộ</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Synchronized</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-[0.2em]",
                      feed.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {feed.status}
                    </div>
                    <button className="p-2.5 hover:bg-background rounded-xl border border-border text-muted-foreground hover:text-cyan-500 hover:border-cyan-500/30 transition-all shadow-sm">
                      <Settings className="w-4.5 h-4.5" />
                    </button>
                    <button className="px-5 py-2 bg-muted hover:bg-background border border-border rounded-xl text-[11px] font-black text-foreground hover:text-cyan-500 hover:border-cyan-500/30 transition-all uppercase tracking-widest shadow-sm">
                      Cấu hình
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
