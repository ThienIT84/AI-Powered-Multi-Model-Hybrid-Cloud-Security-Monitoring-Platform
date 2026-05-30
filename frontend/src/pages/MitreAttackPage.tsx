import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  Shield,
  Target,
  Users,
  TrendingUp,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import {
  MITRE_KPI,
  TACTIC_COVERAGE,
  DETECTION_TREND,
  THREAT_ACTORS,
  TECHNIQUE_MATRIX,
  MATRIX_COLUMNS,
} from "../components/mitre/mitreConfig";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Target, Users, TrendingUp,
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-2xl text-[10px] font-mono">
      <span className="text-muted-foreground uppercase block border-b border-border pb-1 mb-1">{label}</span>
      {payload.map((p: any, i: number) => (
        <span key={i} className="block font-black" style={{ color: p.color ?? p.stroke }}>
          {p.name}: {p.value}{p.name === "Coverage" ? "%" : ""}
        </span>
      ))}
    </div>
  );
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: "Critical" | "High" | "Medium" }) {
  const map = {
    Critical: "bg-critical-accent/10 text-critical-accent border-critical-accent/30",
    High:     "bg-high-accent/10 text-high-accent border-high-accent/30",
    Medium:   "bg-medium-accent/10 text-medium-accent border-medium-accent/30",
  };
  return (
    <span className={cn("text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors", map[severity])}>
      {severity}
    </span>
  );
}

// ─── Matrix dot ───────────────────────────────────────────────────────────────
function MatrixDot({ value }: { value: boolean | "partial" }) {
  if (value === true)
    return (
      <span
        className="w-2.5 h-2.5 rounded-full bg-emerald-accent inline-block"
        style={{ boxShadow: "0 0 6px var(--emerald-accent)" }}
      />
    );
  if (value === "partial")
    return (
      <span
        className="w-2.5 h-2.5 rounded-full bg-medium-accent inline-block"
        style={{ boxShadow: "0 0 6px var(--medium-accent)" }}
      />
    );
  return <span className="w-2.5 h-2.5 rounded-full bg-muted/40 border border-border inline-block" />;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function MitreAttackPage() {
  const [search, setSearch] = useState("");
  const [tacticCoverage, setTacticCoverage] = useState(TACTIC_COVERAGE);
  const [detectionTrend, setDetectionTrend] = useState(DETECTION_TREND);

  useEffect(() => {
    const id = setInterval(() => {
      // Update tactic coverage
      setTacticCoverage((prev) =>
        prev.map((d) => ({
          ...d,
          coverage: Number(Math.min(100, Math.max(65, d.coverage + (Math.random() * 1.6 - 0.8))).toFixed(1)),
        }))
      );

      // Update detection trend
      setDetectionTrend((prev) =>
        prev.map((d) => ({
          ...d,
          detections: Math.max(5, d.detections + Math.floor(Math.random() * 5) - 2),
          techniques: Math.max(2, d.techniques + Math.floor(Math.random() * 3) - 1),
        }))
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const filteredTechniques = TECHNIQUE_MATRIX.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      key="mitre-attack"
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
            MITRE ATT&amp;CK Framework
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Adversary tactics, techniques, and detection coverage analysis
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-black text-xanh-accent">90%</span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Average Coverage
          </span>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MITRE_KPI.map((kpi, i) => {
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
              transition={{ delay: i * 0.07 }}
              className={cn(
                "neon-card group border rounded-xl p-4 flex flex-col gap-3 transition-all duration-300", 
                kpi.border,
                neonClass
              )}
              style={{
                background: `linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, ${kpi.accentHex}, transparent 95%) 100%)`,
                boxShadow: `0 6px 20px ${kpi.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              {/* Subtle corner accent */}
              <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.03] blur-xl", kpi.bg)} />
              <div className="flex items-center justify-between relative z-10 mt-1">
                <div className={cn("p-2 rounded-lg border transition-colors", kpi.bg, kpi.border)}>
                  <Icon className={cn("w-4 h-4 transition-colors", kpi.color)} />
                </div>
                <span className={cn(
                  "text-[9px] font-mono font-black px-1.5 py-0.5 rounded border transition-colors",
                  kpi.color, kpi.bg, kpi.border
                )}>
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

      {/* ── Tactic Coverage + Detection Trend ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Horizontal bar – Tactic Coverage */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              ATT&amp;CK TACTIC MAPPING
            </p>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Tactic Coverage
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={tacticCoverage}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
              barSize={10}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#475569"
                tickLine={false}
                tick={{ fontSize: 8, fontFamily: "JetBrains Mono", fill: "#64748b" }}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                dataKey="tactic"
                type="category"
                stroke="#475569"
                tickLine={false}
                width={110}
                tick={{ fontSize: 8.5, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(34,211,238,0.04)" }} />
              <Bar dataKey="coverage" name="Coverage" radius={[0, 4, 4, 0]} barSize={12}>
                {tacticCoverage.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.coverage >= 90 ? "var(--emerald-accent)" : entry.coverage >= 80 ? "var(--xanh-accent)" : "var(--purple-accent)"}
                    style={{
                      filter: entry.coverage >= 90
                        ? "drop-shadow(0 0 2px var(--emerald-accent))"
                        : entry.coverage >= 80
                        ? "drop-shadow(0 0 2px var(--xanh-accent))"
                        : "drop-shadow(0 0 2px var(--purple-accent))",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Color legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {[
              { label: "≥90% Covered",  color: "var(--emerald-accent)" },
              { label: "80–89% Good",   color: "var(--xanh-accent)" },
              { label: "<80% Monitor",  color: "var(--purple-accent)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
                <span className="text-[8px] font-mono text-muted-foreground uppercase font-black">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line chart – Detection Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              7-DAY ACTIVITY OVERVIEW
            </p>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Detection Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={detectionTrend} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis
                dataKey="day"
                stroke="#475569"
                tickLine={false}
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
              />
              <YAxis
                stroke="#475569"
                tickLine={false}
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="detections"
                name="Detections"
                stroke="var(--medium-accent)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--medium-accent)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "var(--medium-accent)", stroke: "var(--card)", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 0 4px var(--medium-accent))" }}
              />
              <Line
                type="monotone"
                dataKey="techniques"
                name="Techniques"
                stroke="var(--xanh-accent)"
                strokeWidth={2}
                dot={{ r: 3.5, fill: "var(--xanh-accent)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--xanh-accent)", stroke: "var(--card)", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 0 4px var(--xanh-accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border">
            {[
              { label: "Detections", color: "var(--medium-accent)" },
              { label: "Techniques", color: "var(--xanh-accent)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-4 h-0.5 rounded-full inline-block" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                <span className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Threat Actor Tracking ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
            ADVERSARY INTELLIGENCE
          </p>
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            Threat Actor Tracking
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THREAT_ACTORS.map((actor, i) => {
            const isCritical = actor.severity === "Critical";
            const borderColor = isCritical ? "border-critical-accent/30" : "border-high-accent/30";
            const glowColor   = isCritical ? "var(--critical-accent)" : "var(--high-accent)";
            const accentColor = isCritical ? "var(--critical-accent)" : "var(--high-accent)";
            return (
              <motion.div
                key={actor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "bg-card border rounded-xl p-5 shadow-sm hover:scale-[1.01] transition-all duration-200 cursor-pointer",
                  borderColor
                )}
                style={{ boxShadow: `0 4px 20px color-mix(in srgb, ${glowColor}, transparent 95%)` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                    />
                    <span className="text-[12px] font-black text-foreground uppercase tracking-wide">
                      {actor.name}
                    </span>
                    <SeverityBadge severity={actor.severity} />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                </div>

                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                  Last seen: {actor.lastSeen}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColor}, transparent 95%)`,
                      borderColor: `color-mix(in srgb, ${accentColor}, transparent 80%)`,
                    }}
                  >
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                      Techniques Used
                    </p>
                    <p className="text-xl font-black" style={{ color: accentColor }}>
                      {actor.techniquesUsed}
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColor}, transparent 95%)`,
                      borderColor: `color-mix(in srgb, ${accentColor}, transparent 80%)`,
                    }}
                  >
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                      Detections
                    </p>
                    <p className="text-xl font-black" style={{ color: accentColor }}>
                      {actor.detections}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Technique Coverage Matrix ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              ATT&amp;CK TECHNIQUE MAPPING
            </p>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Technique Coverage Matrix
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: "Covered",  color: "var(--xanh-accent)" },
              { label: "Partial",  color: "var(--medium-accent)" },
              { label: "Gap",      color: "var(--muted-foreground)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                <span className="text-[8px] font-mono text-muted-foreground uppercase font-black">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search techniques..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-wider"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-4 text-muted-foreground font-black uppercase tracking-widest text-[9px] w-56">
                  Technique
                </th>
                {MATRIX_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="text-center py-2.5 px-3 text-muted-foreground font-black uppercase tracking-widest text-[9px] whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTechniques.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xanh-accent font-black text-[9px] shrink-0">{row.id}</span>
                      <span className="text-xanh-accent font-black text-[9px]">·</span>
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors truncate">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  {MATRIX_COLUMNS.map((col) => (
                    <td key={col.key} className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        <MatrixDot value={(row as any)[col.key]} />
                      </div>
                    </td>
                  ))}
                </motion.tr>
              ))}
              {filteredTechniques.length === 0 && (
                <tr>
                  <td colSpan={MATRIX_COLUMNS.length + 1} className="py-8 text-center text-muted-foreground uppercase tracking-widest text-[9px]">
                    No techniques match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[9px] font-mono text-muted-foreground">
          <span className="uppercase tracking-widest">
            Showing {filteredTechniques.length} of {TECHNIQUE_MATRIX.length} techniques
          </span>
          <span className="text-xanh-accent font-black uppercase tracking-widest">
            MITRE ATT&amp;CK v14
          </span>
        </div>
      </div>
    </motion.div>
  );
}
