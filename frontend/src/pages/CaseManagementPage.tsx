import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  AlertTriangle,
  Lock,
  Database,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { MultiColorDonut } from "../components/common/MultiColorDonut";
import { IncidentsFeed } from "../components/common/IncidentsFeed";
import {
  CASE_KPI,
  CASE_TREND,
  STATUS_DISTRIBUTION,
  RESOLUTION_TIME,
  ACTIVE_CASES,
  THREAT_DETECTION_FEED,
} from "../components/caseManagement/caseManagementConfig";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  FolderOpen, Clock, CheckCircle2, TrendingDown, ShieldCheck,
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-2xl text-[10px] font-mono">
      <span className="text-muted-foreground uppercase block border-b border-border pb-1 mb-1">{label}</span>
      {payload.map((p: any, i: number) => (
        <span key={i} className="block font-black" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}{p.name === "Hours" ? "h" : ""}
        </span>
      ))}
    </div>
  );
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: "bg-critical-accent/10 text-critical-accent border-critical-accent/30",
    High:     "bg-high-accent/10 text-high-accent border-high-accent/30",
    Medium:   "bg-medium-accent/10 text-medium-accent border-medium-accent/30",
    Low:      "bg-low-accent/10 text-low-accent border-low-accent/30",
  };
  return (
    <span className={cn("text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors", map[severity])}>
      {severity}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "In Progress":    "bg-xanh-accent/10 text-xanh-accent border-xanh-accent/30",
    "Open":           "bg-critical-accent/10 text-critical-accent border-critical-accent/30",
    "Resolved":       "bg-emerald-accent/10 text-emerald-accent border-emerald-accent/30",
    "Pending Review": "bg-purple-accent/10 text-purple-accent border-purple-accent/30",
  };
  return (
    <span className={cn("text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors", map[status])}>
      {status}
    </span>
  );
}

// ─── Progress bar color ───────────────────────────────────────────────────────
function progressColor(status: string, progress: number) {
  if (status === "Resolved") return "var(--emerald-accent)";
  if (status === "In Progress") return "var(--xanh-accent)";
  if (status === "Pending Review") return "var(--medium-accent)";
  return "var(--critical-accent)";
}

// ─── Severity dot ─────────────────────────────────────────────────────────────
function severityDot(severity: string) {
  const map: Record<string, string> = {
    Critical: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
    High:     "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]",
    Medium:   "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]",
    Low:      "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]",
  };
  return map[severity] ?? "bg-muted";
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function CaseManagementPage() {
  const [search, setSearch] = useState("");
  const [caseTrend, setCaseTrend] = useState(CASE_TREND);
  const [resolutionTime, setResolutionTime] = useState(RESOLUTION_TIME);
  const [statusDist, setStatusDist] = useState(STATUS_DISTRIBUTION);

  useEffect(() => {
    const id = setInterval(() => {
      // Update case trend
      setCaseTrend((prev) =>
        prev.map((d) => ({
          ...d,
          opened: Math.max(5, d.opened + Math.floor(Math.random() * 5) - 2),
          closed: Math.max(3, d.closed + Math.floor(Math.random() * 5) - 2),
          critical: Math.max(1, d.critical + Math.floor(Math.random() * 3) - 1),
        }))
      );

      // Update resolution time
      setResolutionTime((prev) =>
        prev.map((d) => ({
          ...d,
          hours: Number(Math.max(1, d.hours + (Math.random() * 1.2 - 0.6)).toFixed(1)),
        }))
      );

      // Update status distribution
      setStatusDist((prev) =>
        prev.map((d) => ({
          ...d,
          value: Math.max(5, d.value + Math.floor(Math.random() * 7) - 3),
        }))
      );
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const filtered = ACTIVE_CASES.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      key="case-management"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6"
    >
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-border transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-xanh-accent rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-xanh-accent uppercase">
              DETECTION &amp; ANALYSIS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
            Case Management
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Track and manage security incidents and investigations
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-black text-critical-accent">34</span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Active Cases
          </span>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CASE_KPI.map((kpi, i) => {
          const Icon = ICON_MAP[kpi.icon];
          const neonClass = 
            kpi.accentHex.includes('0011bb') ? 'neon-border-blue' :
            kpi.accentHex.includes('9f1239') ? 'neon-border-red' :
            kpi.accentHex.includes('9a3412') ? 'neon-border-orange' :
            kpi.accentHex.includes('854d0e') ? 'neon-border-yellow' :
            kpi.accentHex.includes('6b21a8') ? 'neon-border-purple' : '';

          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "neon-card group border border-border rounded-lg p-4 flex flex-col gap-3 transition-all duration-300", 
                "hover:border-2 hover:scale-[1.02] cursor-pointer",
                kpi.border.replace('border-', 'hover:border-'),
                neonClass
              )}
              style={{
                boxShadow: `0 4px 12px rgba(0,0,0,0.03)`,
              }}
              whileHover={{ 
                boxShadow: `0 0 25px color-mix(in srgb, ${kpi.accentHex}, transparent 70%)`,
                borderColor: kpi.accentHex
              }}
            >
              {/* Network-style subtle background circle */}
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-5 group-hover:opacity-10 pointer-events-none transition-opacity" 
                style={{ backgroundColor: kpi.accentHex }}
              />
              <div className="flex items-center justify-between relative z-10 mt-1">
                <div className={cn("p-2 rounded-lg border transition-colors", kpi.bg, kpi.border)}>
                  <Icon className={cn("w-4 h-4 transition-colors", kpi.color)} />
                </div>
                <span className={cn("text-[9px] font-mono font-black px-1.5 py-0.5 rounded border transition-colors", kpi.color, kpi.bg, kpi.border)}>
                  {kpi.delta}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
                  {kpi.label}
                </p>
                <p className={cn("text-2xl font-black leading-none", kpi.color)}>
                  {kpi.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Case Trend + Status Distribution ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grouped bar – Case Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Case Trend (5 Weeks)
            </h3>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="week" 
                  stroke="#475569" 
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }} 
                />
                <YAxis 
                  stroke="#475569" 
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 5, 10, 15, 20]}
                  domain={[0, 20]}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }} 
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar 
                  dataKey="opened"   
                  name="Opened"   
                  fill="var(--xanh-accent)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="closed"   
                  name="Closed"   
                  fill="var(--emerald-accent)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="critical" 
                  name="Critical" 
                  fill="var(--critical-accent)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend - Centered at bottom */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { label: "Opened",   color: "var(--xanh-accent)" },
              { label: "Closed",   color: "var(--emerald-accent)" },
              { label: "Critical", color: "var(--critical-accent)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: l.color }} />
                <span className="text-[10px] font-bold tracking-wide transition-colors" style={{ color: l.color }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut – Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Status Distribution
            </h3>
          </div>
          <div className="flex justify-center">
            <MultiColorDonut 
              data={statusDist.map(item => ({
                ...item,
                color: item.name === "Open" ? "var(--critical-accent)" :
                       item.name === "In Progress" ? "var(--purple-accent)" :
                       item.name === "Pending Review" ? "var(--medium-accent)" :
                       item.name === "Resolved" ? "var(--emerald-accent)" : item.color,
                icon: item.name === "Open" ? FolderOpen :
                      item.name === "In Progress" ? Clock :
                      item.name === "Pending Review" ? Search : CheckCircle2,
                subLabel: item.name
              }))} 
              centerLabel="TOTAL"
              variant="dashboard"
            />
          </div>
        </div>
      </div>

      {/* ── Avg Resolution Time by Priority ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
        <div className="mb-6">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
            SLA PERFORMANCE METRICS
          </p>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Avg Resolution Time by Priority
          </h3>
        </div>
        <div className="w-full h-50">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionTime} margin={{ top: 10, right: 20, left: -25, bottom: 0 }} barSize={120}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="priority" 
                stroke="#475569" 
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }} 
              />
              <YAxis 
                stroke="#475569" 
                tickLine={false} 
                axisLine={false}
                ticks={[0, 5, 10, 15, 20]}
                domain={[0, 20]}
                label={{ value: "Hours", angle: -90, position: "insideLeft", offset: 15, style: { fontSize: 8, fontFamily: "JetBrains Mono", fill: "#64748b" } }}
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }} 
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(34,211,238,0.04)" }} />
              <Bar 
                 dataKey="hours" 
                 name="Hours" 
                 fill="var(--xanh-accent)"
                 radius={[4, 4, 0, 0]}
               >
                 {resolutionTime.map((entry, idx) => (
                   <Cell
                     key={idx}
                     fill="var(--xanh-accent)"
                     opacity={1}
                   />
                 ))}
               </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Active Cases ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              INCIDENT TRACKER
            </p>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Active Cases
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background border border-border rounded-lg pl-7 pr-3 py-1.5 text-[9px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-wider w-40"
              />
            </div>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted border border-border rounded-lg text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-cyan-500/30 transition-all">
              <Filter className="w-3 h-3" />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((c, i) => {
            const barColor = progressColor(c.status, c.progress);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group px-4 py-3.5 bg-background/50 border border-border rounded-xl hover:border-cyan-500/20 hover:bg-cyan-500/3 transition-all duration-200 cursor-pointer"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", severityDot(c.severity))} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black text-foreground uppercase tracking-wide truncate">
                          {c.title}
                        </span>
                        <SeverityBadge severity={c.severity} />
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Created {c.createdAgo}
                        <span className="mx-1.5 opacity-40">•</span>
                        Assigned: {c.assignedTo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-black" style={{ color: barColor }}>
                      {c.progress}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-cyan-500/50 transition-colors" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: barColor,
                      boxShadow: c.progress > 0 ? `0 0 6px ${barColor}80` : undefined,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              No cases match your search
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[9px] font-mono text-muted-foreground">
          <span className="uppercase tracking-widest">
            Showing {filtered.length} of {ACTIVE_CASES.length} cases
          </span>
          <span className="text-cyan-500 font-black uppercase tracking-widest">
            CASE_MGMT_V2.0
          </span>
        </div>
      </div>

      {/* ── Threat Detection Feed ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <IncidentsFeed
          items={THREAT_DETECTION_FEED.map((item) => ({
            ...item,
            icon: item.id === "brute-force" ? <Lock className="w-4 h-4" /> :
                  item.id === "privilege-escalation" ? <AlertTriangle className="w-4 h-4" /> :
                  item.id === "data-exfiltration" ? <Database className="w-4 h-4" /> :
                  <Zap className="w-4 h-4" />,
            borderColor: item.color,
          }))}
          title="Threat Detection Feed"
          subtitle="THREAT DETECTION FEED"
          confidenceLabel="CONFIDENCE (AVG)"
        />
      </div>
    </motion.div>
  );
}
