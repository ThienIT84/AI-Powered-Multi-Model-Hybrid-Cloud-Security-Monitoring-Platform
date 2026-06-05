import React from "react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar 
} from "recharts";
import { Globe, ChevronRight } from "lucide-react";
import { AlertRecord } from "./reportsConfig";
import { CustomTooltip } from "./CustomTooltip";
import { 
  THREAT_DISTRIBUTION_DATA, 
  ALERT_TREND_DATA, 
  DESTINATION_SERVICES_DATA 
} from "./reportsMockData";

interface SecurityReportsTabProps {
  filteredAlertRecords: AlertRecord[];
  onSelectDetail: (record: AlertRecord) => void;
}

export function SecurityReportsTab({
  filteredAlertRecords,
  onSelectDetail,
}: SecurityReportsTabProps) {
  return (
    <div className="space-y-6" id="security-reports-view">
      
      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-[9.5px]">
        
        {/* Pie chart threat distribution */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md">
          <span className="text-xs font-black uppercase tracking-widest text-foreground block border-b border-border pb-2">
            Threat Distribution (Vector Contribution)
          </span>
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={THREAT_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {THREAT_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Trend Line Chart */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md">
          <span className="text-xs font-black uppercase tracking-widest text-foreground block border-b border-border pb-2">
            System Alert Volumetric Trends (Active Hours)
          </span>
          <div className="h-56 w-full text-slate-500 dark:text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ALERT_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="currentColor" fontSize={10} fontWeight="bold" />
                <YAxis stroke="currentColor" fontSize={10} fontWeight="bold" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2.5} name="Total Alerts" dot />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" dot />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High Severity" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Destination Services & IP Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Destination Services Bar Chart (1/3 of row) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-md font-mono text-[9.5px]">
          <span className="text-xs font-black uppercase tracking-widest text-foreground block border-b border-border pb-2">
            Destination Microservices Counts
          </span>
          <div className="h-56 w-full text-slate-500 dark:text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DESTINATION_SERVICES_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="currentColor" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={10} fontWeight="black" width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Source IPs Table (2/3 of row) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md space-y-3 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-black uppercase tracking-widest text-foreground block font-mono">
                Aggressive Source attacker IPs
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-extrabold">
                Showing {filteredAlertRecords.length} records • Click raw log for full drawer detail
              </span>
            </div>

            {/* Interactive Table */}
            <div className="overflow-x-auto select-none font-mono">
              <table className="w-full text-left text-[9.5px] tracking-wider border-collapse">
                <thead>
                  <tr className="border-b border-border text-slate-500 dark:text-slate-400 uppercase font-black text-[8px]">
                    <th className="pb-2">IP Node Address</th>
                    <th className="pb-2">Attack Type</th>
                    <th className="pb-2 text-center">Country</th>
                    <th className="pb-2 text-center">Service</th>
                    <th className="pb-2 text-center">Risk Score</th>
                    <th className="pb-2 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-900 font-semibold text-slate-800 dark:text-slate-200">
                  {filteredAlertRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center uppercase tracking-widest font-black text-rose-500">
                        No active threat alert matches selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAlertRecords.map((item) => {
                      let badgeColor = "text-sky-500 bg-sky-500/10 border-sky-500/20";
                      if (item.severity === "critical") badgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                      else if (item.severity === "high") badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                      else if (item.severity === "medium") badgeColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => onSelectDetail(item)}
                          className="group hover:bg-slate-100 dark:hover:bg-[#090d16] transition-all duration-150 cursor-pointer"
                        >
                          <td className="py-2.5 font-bold flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300">
                            <Globe className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" />
                            <span>{item.sourceIp}</span>
                          </td>
                          <td className="py-2.5 uppercase font-black text-[9px]">{item.attackType}</td>
                          <td className="py-2.5 text-center font-bold text-slate-600 dark:text-slate-400">{item.country}</td>
                          <td className="py-2.5 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[8px] font-black uppercase">
                              {item.destinationService}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-black uppercase ${badgeColor}`}>
                              {item.riskScore}% Risk
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-slate-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground uppercase tracking-widest pt-3 border-t border-border text-center flex items-center justify-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>All database connections secure (TLS v1.3 encrypted tunnel)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
