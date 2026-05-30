import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudLightning,
  CloudOff,
  Server,
  Database,
  Globe,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Settings,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers
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
  Cell,
  BarChart,
  Bar
} from "recharts";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CLOUD_PROVIDERS = [
  {
    id: "aws",
    name: "Amazon Web Services",
    regions: "8 Regions Active",
    resources: "1,247",
    compliance: 94,
    cost: "$45.2k",
    trend: "+2.4%",
    status: "HEALTHY",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    regions: "5 Regions Active",
    resources: "832",
    compliance: 91,
    cost: "$28.4k",
    trend: "-1.2%",
    status: "HEALTHY",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    regions: "6 Regions Active",
    resources: "654",
    compliance: 88,
    cost: "$32.1k",
    trend: "+0.8%",
    status: "WARNING",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  }
];

const KPI_DATA = [
  { label: "TỔNG TÀI NGUYÊN", value: "2,733", delta: "+124 tuần này", icon: Layers, color: "text-blue-500" },
  { label: "TUÂN THỦ TRUNG BÌNH", value: "91%", delta: "+2.3% từ tháng trước", icon: ShieldCheck, color: "text-emerald-500" },
  { label: "PHÁT HIỆN AN NINH", value: "23", delta: "5 nghiêm trọng, 8 cao", icon: ShieldAlert, color: "text-red-500" },
  { label: "CHI PHÍ HÀNG THÁNG", value: "$105.7k", delta: "+$8.2k từ tháng trước", icon: DollarSign, color: "text-amber-500" }
];

const POSTURE_TREND = [
  { time: "00:00", score: 86 },
  { time: "04:00", score: 88 },
  { time: "08:00", score: 85 },
  { time: "12:00", score: 82 },
  { time: "16:00", score: 89 },
  { time: "20:00", score: 91 },
  { time: "Now", score: 88 }
];

const RESOURCE_DISTRIBUTION = [
  { name: "Compute", value: 342, color: "#06b6d4" },
  { name: "Database", value: 198, color: "#3b82f6" },
  { name: "Container", value: 124, color: "#8b5cf6" },
  { name: "Storage", value: 289, color: "#10b981" },
  { name: "Network", value: 156, color: "#f59e0b" },
  { name: "Serverless", value: 98, color: "#ec4899" }
];

const COMPLIANCE_FRAMEWORKS = [
  { name: "SOC 2", score: 94, color: "bg-emerald-500" },
  { name: "HIPAA", score: 87, color: "bg-amber-500" },
  { name: "PCI DSS", score: 91, color: "bg-emerald-500" },
  { name: "GDPR", score: 89, color: "bg-emerald-500" },
  { name: "ISO 27001", score: 92, color: "bg-emerald-500" }
];

const CRITICAL_FINDINGS = [
  { id: 1, severity: "CRITICAL", title: "Public S3 bucket detected", target: "s3://customer-data-backup", provider: "AWS", time: "10 min ago" },
  { id: 2, severity: "HIGH", title: "Overly permissive IAM role", target: "arn:aws:iam::123456789:role/AdminRole", provider: "AWS", time: "25 min ago" },
  { id: 3, severity: "MEDIUM", title: "Unencrypted EBS volume", target: "vol-0a1b2c3d4e5f6g7h8", provider: "AWS", time: "1 hour ago" },
  { id: 4, severity: "HIGH", title: "Exposed database port", target: "sql-server-prod.database.azure.com", provider: "AZURE", time: "35 min ago" },
  { id: 5, severity: "CRITICAL", title: "Service account key rotation overdue", target: "ml-pipeline@project.iam.gserviceaccount.com", provider: "GCP", time: "5 min ago" }
];

const CLOUD_RESOURCES = [
  { id: "res-1", name: "prod-api-server-01", subName: "i-0a1b2c3d4e5f", type: "EC2 Instance", provider: "AWS", region: "us-east-1", status: "Running", score: 94, findings: 0, cpu: 45, mem: 62 },
  { id: "res-2", name: "gcp-ml-worker-03", subName: "vm-abc123def456", type: "Compute Engine", provider: "GCP", region: "us-central1", status: "Running", score: 78, findings: 3, cpu: 82, mem: 71 },
  { id: "res-3", name: "azure-db-primary", subName: "vm-xyz789", type: "Virtual Machine", provider: "AZURE", region: "eastus", status: "Running", score: 65, findings: 5, cpu: 34, mem: 89 },
  { id: "res-4", name: "prod-postgres-cluster", subName: "rds-prod-001", type: "RDS Instance", provider: "AWS", region: "us-west-2", status: "Running", score: 91, findings: 1, cpu: 28, mem: 55 },
  { id: "res-5", name: "k8s-production", subName: "gke-cluster-01", type: "GKE Cluster", provider: "GCP", region: "europe-west1", status: "Warning", score: 72, findings: 4, cpu: 67, mem: 78 },
  { id: "res-6", name: "security-audit-logs", subName: "s3-logs-bucket", type: "S3 Bucket", provider: "AWS", region: "us-east-1", status: "Running", score: 98, findings: 0, cpu: null, mem: null },
  { id: "res-7", name: "azure-k8s-prod", subName: "aks-prod-cluster", type: "AKS Cluster", provider: "AZURE", region: "westeurope", status: "Critical", score: 45, findings: 12, cpu: 91, mem: 94 },
  { id: "res-8", name: "auth-token-validator", subName: "lambda-auth-fn", type: "Lambda Function", provider: "AWS", region: "us-east-1", status: "Running", score: 88, findings: 1, cpu: 12, mem: 24 }
];

// ─── Components ──────────────────────────────────────────────────────────────

export function CloudPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDonutIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-3 border-b border-border transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-500 uppercase">
              DETECTION & ANALYSIS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
            TRẠNG THÁI AN NINH ĐÁM MÂY
          </h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            GIÁM SÁT VÀ TUÂN THỦ HẠ TẦNG ĐA ĐÁM MÂY (MULTI-CLOUD)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono font-black text-emerald-500 uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            CSPM ĐANG HOẠT ĐỘNG
          </div>
          <button className="p-1.5 hover:bg-muted rounded border border-border transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="p-1.5 hover:bg-muted rounded border border-border transition-colors cursor-pointer">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Provider Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CLOUD_PROVIDERS.map((provider) => (
          <motion.div
            key={provider.id}
            whileHover={{ scale: 1.02 }}
            className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group transition-all"
          >
            {/* Background Glow */}
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity rounded-full", provider.bg)} />
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black border", provider.bg, provider.border, provider.color)}>
                  {provider.id.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{provider.name}</h3>
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">{provider.regions}</p>
                </div>
              </div>
              <div className={cn("px-2 py-0.5 rounded text-[8px] font-mono font-black border uppercase", 
                provider.status === "HEALTHY" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {provider.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 relative z-10">
              <div className="space-y-1">
                <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">Tài nguyên</p>
                <p className="text-lg font-black text-foreground">{provider.resources}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">Tuân thủ</p>
                <p className={cn("text-lg font-black", 
                  provider.compliance >= 90 ? "text-emerald-500" : provider.compliance >= 80 ? "text-amber-500" : "text-red-500"
                )}>{provider.compliance}%</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">Chi phí tháng</p>
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-lg font-black text-foreground">{provider.cost}</p>
                  {provider.trend.startsWith('+') ? <TrendingUp className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            </div>

            {/* Subtle Progress Bar for Cost/Usage */}
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", 
                  provider.id === 'aws' ? 'bg-orange-500' : provider.id === 'gcp' ? 'bg-blue-500' : 'bg-cyan-500'
                )} 
                style={{ width: `${provider.compliance}%` }} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity" style={{ backgroundColor: 'currentColor' }} />
             
             <div className={cn("p-2.5 rounded-lg bg-muted border border-border", kpi.color)}>
               <kpi.icon className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">{kpi.label}</p>
               <div className="flex items-baseline gap-2">
                 <h4 className="text-xl font-black text-foreground tracking-tight">{kpi.value}</h4>
                 <span className="text-[8px] font-mono text-emerald-500 font-bold">{kpi.delta}</span>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* ── Main Dashboard Content ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Posture Trend Chart */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Xu hướng An ninh theo Thời gian</h3>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-cyan-500" />
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Điểm an ninh</span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={POSTURE_TREND}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ fontWeight: 'black', color: '#06b6d4' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Distribution Donut */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Phân bổ Tài nguyên</h3>
              </div>
              <div className="flex flex-col xl:flex-row items-center gap-4 flex-1">
                <div className="w-[140px] h-[140px] shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={RESOURCE_DISTRIBUTION}
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        onClick={(_, index) => setActiveIndex(index === activeDonutIndex ? null : index)}
                        className="cursor-pointer outline-none"
                      >
                        {RESOURCE_DISTRIBUTION.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-black text-foreground leading-none">{KPI_DATA[0].value}</span>
                    <span className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Tài nguyên</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5 w-full">
                  {RESOURCE_DISTRIBUTION.map((item, index) => (
                    <div 
                      key={item.name} 
                      onClick={() => setActiveIndex(index === activeDonutIndex ? null : index)}
                      className={cn(
                        "flex items-center justify-between group cursor-pointer transition-all px-2 py-1 rounded border",
                        activeDonutIndex === index ? "border-white/20 bg-white/5" : "border-transparent hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                        <span className={cn(
                          "text-[9px] font-mono font-black uppercase tracking-wider",
                          activeDonutIndex === index ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}>{item.name}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black font-mono",
                        activeDonutIndex === index ? "text-foreground" : "text-muted-foreground"
                      )}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Frameworks Progress */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Khung Tuân thủ</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-1">
                {COMPLIANCE_FRAMEWORKS.map((framework) => (
                  <div key={framework.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{framework.name}</span>
                      <span className={cn("text-[9px] font-black", framework.score >= 90 ? "text-emerald-500" : "text-amber-500")}>
                        {framework.score}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${framework.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full shadow-[0_0_8px_currentColor]", framework.score >= 90 ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Resources Table ─────────────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/20 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Cloud className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">Tài nguyên Đám mây</h3>
                  <p className="text-[8px] font-mono text-muted-foreground uppercase">8 tài nguyên trên 3 nhà cung cấp</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="bg-background border border-border rounded-lg pl-8 pr-3 py-1 text-[9px] font-mono focus:outline-none focus:border-cyan-500/50 w-32 sm:w-48 uppercase tracking-wider"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-1.5 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Filter className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-muted/10 text-muted-foreground uppercase font-black tracking-widest text-[8px]">
                    <th className="px-4 py-2 text-left">Tài nguyên</th>
                    <th className="px-4 py-2 text-left">Nhà cung cấp</th>
                    <th className="px-4 py-2 text-left">Trạng thái</th>
                    <th className="px-4 py-2 text-left">Điểm</th>
                    <th className="px-4 py-2 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {CLOUD_RESOURCES.slice(0, 5).map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-cyan-500 transition-colors">{res.name}</span>
                          <span className="text-[8px] font-mono text-muted-foreground uppercase">{res.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-1.5 py-0.5 rounded text-[7px] font-black border uppercase",
                          res.provider === "AWS" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                          res.provider === "GCP" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                        )}>
                          {res.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-1 h-1 rounded-full animate-pulse", 
                            res.status === "Running" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                            res.status === "Warning" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                            "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                          )} />
                          <span className={cn("font-bold text-[8px] uppercase",
                            res.status === "Running" ? "text-emerald-500" :
                            res.status === "Warning" ? "text-amber-500" :
                            "text-red-500"
                          )}>{res.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-black", res.score >= 90 ? "text-emerald-500" : res.score >= 70 ? "text-amber-500" : "text-red-500")}>
                          {res.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-cyan-500 transition-colors cursor-pointer">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>Hiển thị 5 trên 8</span>
              <button className="text-cyan-500 font-black hover:underline cursor-pointer">Xem tất cả</button>
            </div>
          </div>
        </div>

        {/* Right Section (1/3 width) - Critical Findings */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Phát hiện Nghiêm trọng</h3>
              </div>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-mono font-black text-red-500 uppercase">
                5 Đang hoạt động
              </span>
            </div>
            
            <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
              {CRITICAL_FINDINGS.map((finding) => (
                <div key={finding.id} className="group cursor-pointer">
                  <div className="flex items-start justify-between mb-2.5">
                    <span className={cn("text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase",
                      finding.severity === "CRITICAL" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      finding.severity === "HIGH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {finding.severity}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">{finding.time}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-foreground group-hover:text-cyan-500 transition-colors mb-1.5 leading-tight">{finding.title}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground truncate mb-3">{finding.target}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-orange-500 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/20">{finding.provider}</span>
                  </div>
                  {finding.id < CRITICAL_FINDINGS.length && <div className="mt-6 border-b border-border/50" />}
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 mt-8 border-t border-border/50 text-[11px] font-black text-cyan-500 uppercase tracking-widest hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-2 group">
              Xem tất cả Phát hiện <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
