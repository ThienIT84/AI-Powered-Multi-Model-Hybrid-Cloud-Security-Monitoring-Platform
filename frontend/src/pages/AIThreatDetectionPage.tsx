import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
} from "recharts";
import {
  ShieldAlert,
  TrendingUp,
  Target,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import {
  KPI_DATA,
  DETECTION_TIMELINE,
  SYSTEM_HEALTH,
  MODEL_PERFORMANCE_RADAR,
  ACCURACY_TREND,
  RECENT_DETECTIONS,
  ACTIVE_MODELS,
} from "../components/aiThreatDetection/aiThreatDetectionConfig";

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: "bg-critical-accent/10 text-critical-accent border-critical-accent/30",
    High:     "bg-high-accent/10 text-high-accent border-high-accent/30",
    Medium:   "bg-medium-accent/10 text-medium-accent border-medium-accent/30",
    Low:      "bg-low-accent/10 text-low-accent border-low-accent/30",
  };
  return (
    <span
      className={cn(
        "text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors",
        map[severity] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {severity}
    </span>
  );
}

// ─── Severity dot color ───────────────────────────────────────────────────────
function severityDot(severity: string) {
  const map: Record<string, string> = {
    Critical: "bg-critical-accent shadow-[0_0_6px_var(--critical-accent)]",
    High:     "bg-high-accent shadow-[0_0_6px_var(--high-accent)]",
    Medium:   "bg-medium-accent shadow-[0_0_6px_var(--medium-accent)]",
    Low:      "bg-low-accent shadow-[0_0_6px_var(--low-accent)]",
  };
  return map[severity] ?? "bg-muted";
}

// ─── KPI icon map ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  ShieldAlert,
  TrendingUp,
  Target,
  Cpu,
  Zap,
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-2xl text-[10px] font-mono">
      <span className="text-muted-foreground uppercase block border-b border-border pb-1 mb-1">
        {label}
      </span>
      {payload.map((p: any, i: number) => (
        <span key={i} className="block font-black" style={{ color: p.color }}>
          {p.name}: {p.value}
        </span>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AIThreatDetectionPage() {
  const [tick, setTick] = useState(0);
  const [timelineData, setTimelineData] = useState(DETECTION_TIMELINE);
  const [accuracyData, setAccuracyData] = useState(ACCURACY_TREND);
  const [healthData, setHealthData] = useState(SYSTEM_HEALTH);
  const [activeDetectionId, setActiveDetectionId] = useState<string | null>(null);

  // Simulate live feed ticking
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);

      // Update timeline data
      setTimelineData((prev) =>
        prev.map((d) => ({
          ...d,
          detections: Math.max(10, d.detections + Math.floor(Math.random() * 7) - 3),
        }))
      );

      // Update accuracy trend
      setAccuracyData((prev) =>
        prev.map((d) => ({
          ...d,
          accuracy: Number(Math.min(99.9, Math.max(92, d.accuracy + (Math.random() * 0.4 - 0.2))).toFixed(1)),
        }))
      );

      // Update system health
      setHealthData((prev) =>
        prev.map((d) => ({
          ...d,
          value: Number(Math.min(100, Math.max(88, d.value + (Math.random() * 0.6 - 0.3))).toFixed(1)),
        }))
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      key="ai-threat-detection"
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
            AI Threat Detection
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Multi-model ensemble learning for real-time threat detection
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-black text-xanh-accent">{accuracyData[accuracyData.length-1].accuracy}%</span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Overall Accuracy
          </span>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_DATA.map((kpi, i) => {
          const Icon = ICON_MAP[kpi.icon];
          const val = kpi.label === "Avg Accuracy" ? `${accuracyData[accuracyData.length-1].accuracy}%` : kpi.value;
          
          // Map border classes for neon effect
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
                "neon-card group relative bg-card border border-border rounded-lg p-4 flex flex-col gap-3 transition-all duration-300", 
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
                <div
                  className={cn("p-2 rounded-lg border transition-colors bg-background", kpi.border)}
                >
                  <Icon className={cn("w-4 h-4 transition-colors", kpi.color)} />
                </div>
                <span
                  className={cn("text-[9px] font-mono font-black px-1.5 py-0.5 rounded border transition-colors bg-background", kpi.color, kpi.border)}
                >
                  {kpi.delta}
                </span>
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black">
                  {kpi.label}
                </p>
                <h4 className={cn("text-2xl font-black transition-colors", kpi.color)}>
                  {val}
                </h4>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Detection Timeline + System Health ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Detection Timeline (24h)
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-accent/10 border border-emerald-accent/20 rounded text-[9px] font-mono font-black text-emerald-accent uppercase transition-colors">
              <span className="w-1.5 h-1.5 bg-emerald-accent rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--xanh-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--xanh-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.1} />
              <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="detections"
                stroke="var(--xanh-accent)"
                strokeWidth={2}
                fill="url(#detGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--xanh-accent)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            System Health
          </h3>
          <div className="space-y-3 flex-1">
            {healthData.map((m, i) => (
              <div key={m.name} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase">
                  <span className="text-muted-foreground">{m.name}</span>
                  <span className="text-xanh-accent">{m.value}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                    className="h-full rounded-full bg-xanh-accent"
                    style={{ boxShadow: "0 0 8px var(--xanh-accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-accent" />
            <span className="text-[9px] font-mono text-emerald-accent uppercase tracking-widest font-black">
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* ── Model Performance Radar + Accuracy Trend ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">
            Model Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={MODEL_PERFORMANCE_RADAR} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#64748b" opacity={0.2} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[75, 100]}
                tick={{ fontSize: 8, fontFamily: "JetBrains Mono", fill: "#64748b" }}
              />
              <Radar name="Model A (Primary)"   dataKey="modelA" stroke="var(--xanh-accent)" fill="var(--xanh-accent)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Model B (Secondary)" dataKey="modelB" stroke="var(--purple-accent)" fill="var(--purple-accent)" fillOpacity={0.1}  strokeWidth={1.5} />
              <Radar name="Model C (Tertiary)"  dataKey="modelC" stroke="var(--low-accent)" fill="var(--low-accent)" fillOpacity={0.08} strokeWidth={1} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2 text-[8px] font-mono">
            {[
              { label: "Model A (Primary)",   color: "var(--xanh-accent)" },
              { label: "Model B (Secondary)", color: "var(--purple-accent)" },
              { label: "Model C (Tertiary)",  color: "var(--low-accent)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className="w-2 h-0.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                <span className="text-muted-foreground uppercase">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">
            Accuracy Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={accuracyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.1} />
              <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis domain={[90, 100]} stroke="#94a3b8" tickLine={false} tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--xanh-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--xanh-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Detections ─────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            Recent Detections
          </h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-critical-accent/10 border border-critical-accent/20 rounded-full text-[9px] font-mono font-black text-critical-accent uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-critical-accent rounded-full animate-pulse" />
            Live Feed
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {RECENT_DETECTIONS.map((det, i) => {
              const isActive = activeDetectionId === det.id;
              return (
                <motion.div
                  key={det.id + tick}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveDetectionId(isActive ? null : det.id)}
                  className={cn(
                    "group relative flex items-center justify-between px-4 py-3 border transition-all duration-200 cursor-pointer rounded-xl",
                    isActive
                      ? "border-border shadow-sm"
                      : "border-border bg-background/50 hover:bg-background/80 hover:border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  )}
                  style={{
                    backgroundColor: isActive 
                      ? `color-mix(in srgb, var(--${det.severity.toLowerCase()}-accent), transparent 92%)` 
                      : undefined,
                  }}
                >
                  {/* Left border accent */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200"
                    style={{
                      backgroundColor: `var(--${det.severity.toLowerCase()}-accent)`,
                      boxShadow: isActive 
                        ? `0 0 12px var(--${det.severity.toLowerCase()}-accent)80` 
                        : `0 0 4px var(--${det.severity.toLowerCase()}-accent)40`,
                    }}
                  />

                  <div className="flex items-center gap-3 ml-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0 transition-all duration-300",
                      severityDot(det.severity),
                      isActive ? "scale-125" : "scale-100 opacity-70"
                    )} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-wide transition-colors",
                          isActive ? "text-foreground" : "text-foreground/70"
                        )}>
                          {det.name}
                        </span>
                        <SeverityBadge severity={det.severity} />
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Model: <span className="text-foreground/70 font-bold">{det.model}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "text-[12px] font-mono font-black tracking-tight transition-colors",
                      isActive 
                        ? (det.confidence > 95 ? "text-critical-accent" : "text-xanh-accent")
                        : "text-muted-foreground"
                    )}>
                      {det.confidence}%
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                      <Clock className="w-3 h-3" />
                      {det.timeAgo}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active AI Models (2x2 grid) ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">
          Active AI Models
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTIVE_MODELS.map((model, i) => {
            const isActive = model.status === "ACTIVE";
            const isIdle   = model.status === "IDLE";
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "bg-card border rounded-xl p-4 shadow-sm hover:border-cyan-500/30 transition-all duration-200",
                  isActive ? "border-border" : "border-border/60"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider">
                      {model.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive
                            ? "bg-emerald-accent shadow-[0_0_6px_var(--emerald-accent)] animate-pulse"
                            : isIdle
                            ? "bg-medium-accent shadow-[0_0_6px_var(--medium-accent)]"
                            : "bg-low-accent animate-spin"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[8px] font-mono font-black uppercase tracking-widest",
                          isActive ? "text-emerald-accent" : isIdle ? "text-medium-accent" : "text-low-accent"
                        )}
                      >
                        {model.status}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[8px] font-mono font-black",
                      model.deltaPositive ? "text-emerald-accent" : "text-critical-accent"
                    )}
                  >
                    {model.delta}
                  </span>
                </div>

                {/* Accuracy bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[8px] font-mono font-black uppercase">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="text-foreground">{model.accuracy}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.accuracy}%` }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        isActive ? "bg-xanh-accent" : "bg-medium-accent"
                      )}
                      style={
                        isActive
                          ? { boxShadow: "0 0 6px var(--xanh-accent)" }
                          : {}
                      }
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Inferences
                    </p>
                    <p className="text-[10px] font-black text-foreground font-mono">
                      {model.inferences}
                    </p>
                  </div>
                  <div>
                    <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Latency
                    </p>
                    <p className="text-[10px] font-black text-foreground font-mono">
                      {model.latency}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
