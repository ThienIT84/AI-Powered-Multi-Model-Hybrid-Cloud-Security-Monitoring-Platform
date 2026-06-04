import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Globe,
  TrendingDown,
  CheckCircle2,
  Eye,
  Search,
  Zap,
  Shield,
  AlertCircle,
  Target,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { MultiColorDonut } from "../components/common/MultiColorDonut";
import { IncidentsFeed } from "../components/common/IncidentsFeed";
import { FloatingPanel } from "../components/common/FloatingPanel";
import {
  ATTACK_SURFACE_KPI,
  ASSET_DISTRIBUTION,
  RISK_DISTRIBUTION,
  RISK_TREND,
  ASSET_GROUPS,
  THREAT_DETECTION_FEED,
  AssetGroup,
} from "../components/attackSurface/attackSurfaceConfig";

// ─── Mock Assets for Detail View ──────────────────────────────────────────────
const MOCK_GROUP_ASSETS: Record<string, any[]> = {
  prod: [
    { id: "srv-01", name: "prod-web-01", ip: "10.0.1.15", type: "Compute", risk: "Low", lastScan: "1h ago" },
    { id: "srv-02", name: "prod-db-01", ip: "10.0.2.10", type: "Database", risk: "Critical", lastScan: "1h ago" },
    { id: "srv-03", name: "prod-lb-01", ip: "10.0.1.1", type: "Load Balancer", risk: "High", lastScan: "1h ago" },
  ],
  dev: [
    { id: "dev-01", name: "dev-web-01", ip: "192.168.1.10", type: "Compute", risk: "Warning", lastScan: "3h ago" },
    { id: "dev-02", name: "dev-sandbox", ip: "192.168.1.20", type: "Sandbox", risk: "Low", lastScan: "3h ago" },
  ],
  cloud: [
    { id: "aws-s3-01", name: "customer-data-bucket", ip: "s3.amazonaws.com", type: "Storage", risk: "Critical", lastScan: "2h ago" },
    { id: "aws-ec2-01", name: "api-gateway-node", ip: "3.21.45.12", type: "Compute", risk: "High", lastScan: "2h ago" },
  ],
  third: [
    { id: "ext-01", name: "stripe-api-connector", ip: "api.stripe.com", type: "SaaS API", risk: "Healthy", lastScan: "4h ago" },
    { id: "ext-02", name: "auth0-tenant", ip: "auth.company.com", type: "Identity", risk: "Healthy", lastScan: "4h ago" },
  ],
};

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  AlertTriangle,
  Globe,
  TrendingDown,
  CheckCircle2,
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
        <span key={i} className="block font-black" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}
        </span>
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "Healthy" | "Warning" | "Critical" }) {
  const map = {
    Healthy:  "bg-emerald-accent/10 text-emerald-accent border-emerald-accent/30",
    Warning:  "bg-medium-accent/10 text-medium-accent border-medium-accent/30",
    Critical: "bg-critical-accent/10 text-critical-accent border-critical-accent/30",
  };
  return (
    <span className={cn("text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors", map[status])}>
      {status}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AttackSurfacePage() {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AssetGroup | null>(null);
  const [assetData, setAssetData] = useState(ASSET_DISTRIBUTION);
  const [riskTrend, setRiskTrend] = useState(RISK_TREND);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const handleGroupScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleKPIClick = (label: string) => {
    setSelectedKPI(label === selectedKPI ? null : label);
  };

  useEffect(() => {
    const id = setInterval(() => {
      // Update asset distribution
      setAssetData((prev) =>
        prev.map((d) => ({
          ...d,
          assets: Math.max(50, d.assets + Math.floor(Math.random() * 21) - 10),
        }))
      );

      // Update risk trend
      setRiskTrend((prev) =>
        prev.map((d) => ({
          ...d,
          total: Math.max(100, d.total + Math.floor(Math.random() * 11) - 5),
          high: Math.max(30, d.high + Math.floor(Math.random() * 7) - 3),
          critical: Math.max(10, d.critical + Math.floor(Math.random() * 5) - 2),
        }))
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      key="attack-surface"
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
            Attack Surface
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Comprehensive exposure assessment and asset inventory
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-black text-critical-accent">290</span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Total Assets at Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ATTACK_SURFACE_KPI.map((kpi, i) => {
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
              onClick={() => handleKPIClick(kpi.label)}
              className={cn(
                "neon-card group relative bg-card border rounded-lg p-4 flex flex-col gap-3 transition-all duration-300", 
                "hover:border-2 hover:scale-[1.02] cursor-pointer",
                kpi.border.replace('border-', 'hover:border-'),
                selectedKPI === kpi.label ? "border-2 border-opacity-100 scale-[1.02]" : "border-border",
                neonClass
              )}
              style={{
                boxShadow: selectedKPI === kpi.label 
                  ? `0 0 30px color-mix(in srgb, ${kpi.accentHex}, transparent 60%)` 
                  : `0 4px 12px rgba(0,0,0,0.03)`,
                borderColor: selectedKPI === kpi.label ? kpi.accentHex : undefined
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

      {/* ── Asset Distribution + Risk Distribution ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart – Asset Distribution */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="mb-6">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              ASSET INVENTORY BREAKDOWN
            </p>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Asset Distribution by Type
            </h3>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 300, 600, 900, 1200]}
                  domain={[0, 1200]}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.05)" }} />
                <Bar dataKey="assets" name="Assets" fill="var(--xanh-accent)" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {assetData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill="var(--xanh-accent)"
                      opacity={idx === 2 ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut – Risk Distribution */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
              EXPOSURE SEVERITY BREAKDOWN
            </p>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Risk Distribution
            </h3>
          </div>
          <MultiColorDonut 
            data={RISK_DISTRIBUTION.map(item => ({
              ...item,
              color: item.name === "Low" ? "var(--purple-accent)" : 
                     item.name === "Medium" ? "var(--medium-accent)" :
                     item.name === "High" ? "var(--high-accent)" :
                     item.name === "Critical" ? "var(--critical-accent)" : item.color,
              icon: item.name === "Critical" ? AlertTriangle :
                    item.name === "High" ? ShieldAlert :
                    item.name === "Medium" ? AlertCircle :
                    item.name === "Low" ? Shield : Globe,
              subLabel: item.name
            }))} 
            centerLabel="TOTAL"
            variant="dashboard"
          />
        </div>
      </div>

      {/* ── Risk Trend (5 Months) ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
            HISTORICAL EXPOSURE ANALYSIS
          </p>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Risk Trend (5 Months)
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={riskTrend} margin={{ top: 20, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--medium-accent)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--medium-accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--high-accent)" stopOpacity={0.14} />
                <stop offset="100%" stopColor="var(--high-accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--critical-accent)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--critical-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis
              dataKey="month"
              stroke="#475569"
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
            />
            <YAxis
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#94a3b8" }}
              domain={[0, 200]}
            />
            <Tooltip content={<ChartTooltip />} />
            {/* Total — widest, bottom layer */}
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="var(--medium-accent)"
              strokeWidth={2.5}
              fill="url(#gradTotal)"
              dot={false}
              activeDot={{ r: 5, fill: "var(--medium-accent)", stroke: "#0d1117", strokeWidth: 2 }}
            />
            {/* High */}
            <Area
              type="monotone"
              dataKey="high"
              name="High"
              stroke="var(--high-accent)"
              strokeWidth={2}
              fill="url(#gradHigh)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--high-accent)", stroke: "#0d1117", strokeWidth: 2 }}
            />
            {/* Critical — top, thinnest */}
            <Area
              type="monotone"
              dataKey="critical"
              name="Critical"
              stroke="var(--critical-accent)"
              strokeWidth={2}
              fill="url(#gradCritical)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--critical-accent)", stroke: "#0d1117", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border">
          {[
            { label: "Total",    color: "var(--medium-accent)" },
            { label: "High",     color: "var(--high-accent)" },
            { label: "Critical", color: "var(--critical-accent)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span
                className="w-4 h-0.5 rounded-full inline-block"
                style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}80` }}
              />
              <span className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Threat Detection Feed ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <IncidentsFeed
          items={THREAT_DETECTION_FEED.map((item) => ({
            ...item,
            icon: item.id === "port-scan" ? <Search className="w-4 h-4" /> :
                  item.id === "sql-injection" ? <Shield className="w-4 h-4" /> :
                  item.id === "lfi" ? <Eye className="w-4 h-4" /> :
                  <AlertCircle className="w-4 h-4" />,
            borderColor: item.color,
          }))}
          title="Threat Detection Feed"
          subtitle="THREAT DETECTION FEED"
          confidenceLabel="CONFIDENCE (AVG)"
        />
      </div>

      {/* ── Asset Groups ──────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
            GROUPED ASSET INVENTORY
          </p>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Asset Groups
          </h3>
        </div>

        <div className="space-y-3">
          {ASSET_GROUPS.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onMouseEnter={() => setHoveredGroup(group.id)}
              onMouseLeave={() => setHoveredGroup(null)}
              className={cn(
                "bg-card border rounded-xl px-5 py-4 shadow-sm transition-all duration-200",
                hoveredGroup === group.id
                  ? "border-cyan-500/25 shadow-[0_4px_20px_rgba(34,211,238,0.05)]"
                  : "border-border"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                {/* Name + status */}
                <div className="flex items-center gap-3 sm:w-56 shrink-0">
                  <div
                    className={cn(
                      "w-1.5 h-8 rounded-full shrink-0",
                      group.status === "Healthy"  ? "bg-emerald-500" :
                      group.status === "Warning"  ? "bg-yellow-500"  : "bg-red-500"
                    )}
                  />
                  <div>
                    <p className="text-[11px] font-black text-foreground uppercase tracking-wide">
                      {group.name}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={group.status} />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-1 flex-wrap gap-6 sm:gap-0 sm:justify-around items-center">
                  <div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Assets
                    </p>
                    <p className="text-sm font-black text-foreground font-mono">{group.assets}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Critical
                    </p>
                    <p className={cn(
                      "text-sm font-black font-mono",
                      group.critical > 0 ? "text-red-400" : "text-muted-foreground"
                    )}>
                      {group.critical}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      High
                    </p>
                    <p className={cn(
                      "text-sm font-black font-mono",
                      group.high > 10 ? "text-orange-400" : group.high > 0 ? "text-yellow-400" : "text-muted-foreground"
                    )}>
                      {group.high}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Last Scan
                    </p>
                    <p className="text-[11px] font-black text-muted-foreground font-mono">{group.lastScan}</p>
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-cyan-500/10 hover:border-cyan-500/30 text-foreground hover:text-cyan-400 rounded border border-border font-mono text-[9px] font-black uppercase tracking-widest transition-all duration-200 shrink-0 cursor-pointer sm:ml-4"
                >
                  <Eye className="w-3 h-3" />
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Asset Group Details Panel ─────────────────────────────────────────── */}
      <FloatingPanel
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title={selectedGroup ? `Asset Group: ${selectedGroup.name}` : "Asset Group Details"}
        className="max-w-md"
      >
        <div className="p-4 space-y-6">
          {/* Quick Stats Header */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total Assets", value: selectedGroup?.assets, color: "text-foreground" },
              { label: "Critical", value: selectedGroup?.critical, color: "text-red-400" },
              { label: "High", value: selectedGroup?.high, color: "text-orange-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background/50 border border-border rounded-lg p-2.5 text-center">
                <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-lg font-black font-mono", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Asset List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Inventory Assets</h4>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{MOCK_GROUP_ASSETS[selectedGroup?.id || ""]?.length || 0} Items</span>
            </div>

            <div className="space-y-2">
              {MOCK_GROUP_ASSETS[selectedGroup?.id || ""]?.map((asset) => (
                <div key={asset.id} className="bg-muted/30 border border-border/50 rounded-lg p-3 hover:border-cyan-500/30 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[11px] font-black text-foreground uppercase">{asset.name}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{asset.ip}</p>
                    </div>
                    <span className={cn(
                      "text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded border",
                      asset.risk === "Critical" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                      asset.risk === "High" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                      asset.risk === "Warning" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    )}>
                      {asset.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase">{asset.type}</span>
                    <span className="text-[8px] font-mono text-muted-foreground uppercase italic">Last scan: {asset.lastScan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button 
              onClick={handleGroupScan}
              disabled={isScanning}
              className={cn(
                "w-full py-2 rounded font-mono text-[9px] font-black uppercase tracking-widest transition-all border",
                isScanning
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 cursor-not-allowed"
                  : "bg-xanh-accent/10 hover:bg-xanh-accent/20 text-xanh-accent border-xanh-accent/30"
              )}
            >
              {isScanning ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  SCANNING GROUP...
                </div>
              ) : "Initiate Full Group Scan"}
            </button>
          </div>
        </div>
      </FloatingPanel>
    </motion.div>
  );
}
