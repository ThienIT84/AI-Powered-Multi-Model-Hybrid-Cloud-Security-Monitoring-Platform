import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar 
} from "recharts";
import { Globe, ChevronRight, Shield, Clock, HardDrive, Terminal } from "lucide-react";
import { AlertRecord } from "./types";
import { CustomTooltip } from "./CustomTooltip";

interface SecurityReportsTabProps {
  filteredAlertRecords: AlertRecord[];
  onSelectDetail: (record: AlertRecord) => void;
}

export const SecurityReportsTab: React.FC<SecurityReportsTabProps> = React.memo(({
  filteredAlertRecords,
  onSelectDetail,
}) => {
  const [trendsRange, setTrendsRange] = useState<"24h" | "7d" | "30d">("7d");

  // 1. Threat Distribution Categories
  const threatDistribution = [
    { name: "Web Attacks", value: 4120, color: "#22d3ee" },
    { name: "Network Attacks", value: 2890, color: "#3b82f6" },
    { name: "Authentication Attacks", value: 3110, color: "#a855f7" },
    { name: "Malware", value: 1650, color: "#f43f5e" },
    { name: "Other", value: 870, color: "#10b981" }
  ];

  // 2. Alert Trend Analytics
  const trendData = {
    "24h": [
      { name: "00:00", alerts: 180, critical: 8 },
      { name: "04:00", alerts: 140, critical: 4 },
      { name: "08:00", alerts: 290, critical: 15 },
      { name: "12:00", alerts: 430, critical: 32 },
      { name: "16:00", alerts: 490, critical: 41 },
      { name: "20:00", alerts: 320, critical: 18 },
      { name: "24:00", alerts: 210, critical: 10 }
    ],
    "7d": [
      { name: "Mon", alerts: 1800, critical: 82 },
      { name: "Tue", alerts: 1950, critical: 95 },
      { name: "Wed", alerts: 2310, critical: 120 },
      { name: "Thu", alerts: 2120, critical: 91 },
      { name: "Fri", alerts: 2543, critical: 110 },
      { name: "Sat", alerts: 1650, critical: 60 },
      { name: "Sun", alerts: 1420, critical: 45 }
    ],
    "30d": [
      { name: "W1", alerts: 8200, critical: 380 },
      { name: "W2", alerts: 9100, critical: 410 },
      { name: "W3", alerts: 11500, critical: 512 },
      { name: "W4", alerts: 9800, critical: 450 }
    ]
  };

  // 3. Top Source IP Report
  const topSourceIps = [
    { ip: "185.220.101.5", country: "RU", alertCount: 312, riskScore: 94 },
    { ip: "45.122.90.15", country: "DE", alertCount: 188, riskScore: 56 },
    { ip: "109.231.42.110", country: "CN", alertCount: 142, riskScore: 78 },
    { ip: "85.203.45.18", country: "NL", alertCount: 95, riskScore: 68 },
    { ip: "198.51.100.42", country: "US", alertCount: 81, riskScore: 35 }
  ];

  // 4. Top Targeted Assets
  const targetedAssets = [
    { hostname: "aws-prod-db-rds-01 (MySQL Primary Store)", alerts: 419, riskScore: 94 },
    { hostname: "web-gateway-k8s-pod-x92 (Web Gateway Service)", alerts: 302, riskScore: 89 },
    { hostname: "aws-ec2-prod-bastion (Jump-host SSH Server)", alerts: 245, riskScore: 81 },
    { hostname: "alb-external-ingress (Application Load Balancer)", alerts: 198, riskScore: 78 },
    { hostname: "dns-primary-bind9 (Root Domains Resolver)", alerts: 112, riskScore: 56 }
  ];

  // 5. Service Exposure Summary
  const serviceExposureData = [
    { name: "HTTP", count: 4890, fill: "#22d3ee" },
    { name: "HTTPS", count: 3201, fill: "#3b82f6" },
    { name: "DNS", count: 1845, fill: "#10b981" },
    { name: "SSH", count: 911, fill: "#a855f7" },
    { name: "Database", count: 652, fill: "#f43f5e" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="security-reports-tab">
      
      {/* SECTION 1: Charts (Threat Distribution & Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-[9.5px]">
        
        {/* Threat Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md flex flex-col justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-[#64748b] block border-b border-border/20 pb-2.5">
            Threat Vector Distribution
          </span>
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Trend Analytics */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
            <span className="text-xs font-black uppercase tracking-widest text-[#64748b] block font-mono">
              Alert Volumetric Trend Analytics
            </span>
            <div className="bg-[#0f172a] rounded flex border border-border/20 p-0.5 font-mono text-[8.5px]">
              {(["24h", "7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendsRange(r)}
                  className={`px-2 py-1 uppercase font-black transition border-none cursor-pointer rounded ${trendsRange === r ? "bg-cyan-500 text-slate-950" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 w-full text-zinc-500">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData[trendsRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={9} fontWeight="bold" />
                <YAxis stroke="currentColor" fontSize={9} fontWeight="bold" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="alerts" stroke="#22d3ee" strokeWidth={2.5} name="Total Alerts" dot />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 2: IP Report & Targeted Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-[9px] select-none">
        
        {/* Top Source IP Report */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Globe size={13} className="text-cyan-500" />
              <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
                Top Attacking Source IP Report
              </h3>
            </div>
            <span className="text-[7.5px] text-zinc-500 uppercase font-black tracking-wider">
              IP / Country / Alert Count / Risk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left tracking-wider border-collapse">
              <thead>
                <tr className="border-b border-border text-zinc-500 uppercase font-black text-[8px]">
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2 text-center">Country</th>
                  <th className="pb-2 text-center">Alert Count</th>
                  <th className="pb-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25 font-bold text-zinc-300">
                {topSourceIps.map((item, idx) => {
                  const badgeC = item.riskScore >= 75 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20";
                  return (
                    <tr key={idx} className="hover:bg-secondary/10 transition duration-150">
                      <td className="py-2.5 font-bold text-cyan-400">
                        {item.ip}
                      </td>
                      <td className="py-2.5 text-center">{item.country}</td>
                      <td className="py-2.5 text-center text-zinc-100">{item.alertCount} Alerts</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded border text-[8.5px] uppercase font-black tracking-tight ${badgeC}`}>
                          {item.riskScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Targeted Assets */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
            <div className="flex items-center gap-1.5">
              <HardDrive size={13} className="text-purple-500" />
              <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
                Top Targeted Core Assets Report
              </h3>
            </div>
            <span className="text-[7.5px] text-zinc-500 uppercase font-black tracking-wider">
              Asset Hostname / Alerts / Risk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left tracking-wider border-collapse">
              <thead>
                <tr className="border-b border-border text-zinc-500 uppercase font-black text-[8px]">
                  <th className="pb-2">Hostname</th>
                  <th className="pb-2 text-center">Alerts</th>
                  <th className="pb-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25 font-bold text-zinc-300">
                {targetedAssets.map((asset, idx) => {
                  const badgeC = asset.riskScore >= 75 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20";
                  return (
                    <tr key={idx} className="hover:bg-secondary/10 transition duration-150">
                      <td className="py-2.5 text-zinc-100 font-bold truncate max-w-50">
                        {asset.hostname}
                      </td>
                      <td className="py-2.5 text-center text-zinc-200">{asset.alerts} Alerts</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded border text-[8.5px] uppercase font-black tracking-tight ${badgeC}`}>
                          {asset.riskScore}% Risk
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECTION 3: Service Exposure Summary */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md font-mono text-[9px]">
        <div className="flex items-center gap-1.5 border-b border-border/20 pb-2.5 mb-4 select-none">
          <Terminal size={14} className="text-cyan-500" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
            Protocol Service Exposure Summary (Alert Volumes)
          </h3>
        </div>
        <div className="h-56 w-full text-zinc-500">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceExposureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="currentColor" fontSize={9} />
              <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={10} fontWeight="black" width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} name="Incoming Probe Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
});
