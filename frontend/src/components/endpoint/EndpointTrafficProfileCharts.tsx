import React from "react";
import { Activity, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ATTACK_COLORS } from "./EndpointConstants";

interface EndpointTrafficProfileChartsProps {
  trafficProfile: { name: string; value: number }[];
  serviceIndex: { name: string; value: number }[];
  topSourceHosts: { ip: string; count: number; bytes: number }[];
  topDestHosts: { ip: string; count: number; bytes: number }[];
  doughnutData: { name: string; value: number; color: string }[];
}

export const EndpointTrafficProfileCharts: React.FC<EndpointTrafficProfileChartsProps> = ({
  trafficProfile,
  serviceIndex,
  topSourceHosts,
  topDestHosts,
  doughnutData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="endpoint-traffic-profile-charts">
      {/* 5. ZEEK PROTOCOL / SERVICE BOUNDARY */}
      <div className="lg:col-span-2 bg-card border border-border p-4 rounded-xl shadow-xs space-y-4">
        <div className="flex gap-2 items-center border-b border-border pb-2 justify-between">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-cyan-405" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider">Zeek Log Traffic Spectrometers</h3>
          </div>
          <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-black">
            L7 Protocol Bounds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protocol Distribution pie */}
          <div className="space-y-1">
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide block">
              14. Connection Protocol Distribution Ratio
            </span>
            <div className="h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={trafficProfile} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                    {trafficProfile.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ATTACK_COLORS[index % ATTACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.1)" }}
                    labelClassName="text-white font-mono text-[9px] uppercase font-bold"
                    itemStyle={{ fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400">IP L4 Ratio</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 text-[8.5px] font-mono leading-none">
              {trafficProfile.map((p, idx) => (
                <div key={p.name} className="flex items-center gap-1 bg-secondary p-1 px-2 border border-border rounded">
                  <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: ATTACK_COLORS[idx % ATTACK_COLORS.length] }} />
                  <span className="font-bold text-foreground">{p.name}: {p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Port services Bar chart */}
          <div className="space-y-1">
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide flex justify-between">
              <span>Port Service Index Distribution Bounds</span>
              <span className="font-mono text-indigo-500">Zeek Log API</span>
            </span>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceIndex} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="rgba(156, 163, 175, 0.3)" fontSize={8.5} tickLine={false} />
                  <YAxis stroke="rgba(156, 163, 175, 0.3)" fontSize={8.5} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.1)" }}
                    itemStyle={{ color: "#22d3ee", fontSize: "10px" }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Destination / Source IP addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
          {/* Top Inbound IP */}
          <div className="space-y-2">
            <span className="text-[9px] text-indigo-600 dark:text-cyan-400 font-bold uppercase tracking-widest block">
              Top Source Inbound Host IPs
            </span>
            <div className="space-y-1.5 font-mono text-[9px] leading-tight select-all">
              {topSourceHosts.map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-secondary/40 p-1.5 px-2 border border-border rounded-lg">
                  <span className="font-extrabold text-foreground">{s.ip}</span>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-amber-550 font-bold">{s.count} requests</span>
                    <span className="text-slate-400">{(s.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Outbound Destination IP */}
          <div className="space-y-2">
            <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest block">
              Top External Outbound Targets
            </span>
            <div className="space-y-1.5 font-mono text-[9px] leading-tight select-all">
              {topDestHosts.map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-secondary/40 p-1.5 px-2 border border-border rounded-lg">
                  <span className="font-extrabold text-foreground">{s.ip}</span>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-indigo-405 font-bold">{s.count} requests</span>
                    <span className="text-slate-400">{(s.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. ALERT DISTRIBUTION TAXONOMY (PieChart Doughnut) */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex gap-2 items-center border-b border-border pb-2 justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-amber-500 font-bold" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider">Alert Category Distribution</h3>
          </div>
          <span className="w-2 h-2 rounded-full bg-red-550 animate-ping" />
        </div>

        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={doughnutData} cx="50%" cy="50%" innerRadius={42} outerRadius={58} stroke="#0f172a" strokeWidth={1} dataKey="value">
                {doughnutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.1)" }}
                labelClassName="text-white uppercase font-bold"
                itemStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[12px] font-black font-mono tracking-tighter text-foreground">
              {doughnutData.reduce((acc, curr) => acc + curr.value, 0)}
            </span>
            <span className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider leading-none">IDS alerts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] leading-none pt-2">
          {doughnutData.map(item => (
            <div key={item.name} className="flex items-center gap-1.5 bg-secondary/35 p-1 rounded border border-border/60">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="truncate text-left">
                <p className="font-extrabold text-foreground truncate uppercase">{item.name}</p>
                <span className="text-slate-400 font-bold">{item.value} hits</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
