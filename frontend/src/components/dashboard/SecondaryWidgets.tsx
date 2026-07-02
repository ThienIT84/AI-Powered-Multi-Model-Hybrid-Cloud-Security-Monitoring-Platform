import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from "recharts";
import { cn } from "../../lib/utils";
import { Database, Server, Cloud, Cpu, Activity, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

export function SecondaryWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {/* Infrastructure Health */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-6">
           <Activity className="w-4 h-4 text-cyan-400" />
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Infrastructure Health</h3>
        </div>
        <div className="space-y-5">
           <InfraItem icon={Server} label="Web Servers" ok={45} err={3} total={48} color="bg-cyan-500" />
           <InfraItem icon={Database} label="Databases" ok={23} err={1} total={24} color="bg-yellow-500" />
           <InfraItem icon={Cloud} label="Cloud Instances" ok={152} err={4} total={156} color="bg-orange-500" />
           <InfraItem icon={Cpu} label="Endpoints" ok={879} err={13} total={892} color="bg-green-500" />
        </div>
      </div>

      {/* Attack Surface Radar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
           <ShieldCheck className="w-4 h-4 text-purple-400" />
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Attack Surface</h3>
        </div>
        <div className="h-45 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="currentColor" className="opacity-10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 8, fontWeight: 900 }} />
                <Radar
                   name="Surface"
                   dataKey="value"
                   stroke="#a855f7"
                   fill="#a855f7"
                   fillOpacity={0.4}
                />
              </RadarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Incidents Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
           <AlertTriangle className="w-4 h-4 text-yellow-500" />
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Incidents This Week</h3>
        </div>
        <div className="h-45 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', className: "opacity-40", fontSize: 8, fontWeight: 900 }} />
                 <Tooltip 
                    cursor={{ fill: 'currentColor', className: "opacity-5" }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px' }}
                 />
                 <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.count > 15 ? '#ef4444' : entry.count > 10 ? '#f97316' : '#eab308'} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* AI Risk Panel */}
      <div className="grid grid-rows-2 gap-4">
         <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">AI Risk Forecast</span>
               <Zap className="w-3 h-3 text-purple-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
               <RiskTile label="1H" value={72} color="text-red-500" sub="High Risk" />
               <RiskTile label="6H" value={58} color="text-yellow-500" sub="Medium" />
               <RiskTile label="12H" value={45} color="text-blue-500" sub="Low" />
               <RiskTile label="24H" value={32} color="text-green-500" sub="Safe" />
            </div>
         </div>
         <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
               <p className="text-[10px] text-red-400 font-bold leading-snug">AI forecasts a large-scale DDoS attempt within the next 1-2 hours</p>
               <p className="text-[8px] text-red-500/50 uppercase font-black mt-1 tracking-widest">Recommended action: enable WAF</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfraItem({ icon: Icon, label, ok, err, total, color }: any) {
  const percentage = (ok / total) * 100;
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Icon size={12} className="text-muted-foreground/60" />
             <span className="text-[10px] font-bold text-foreground">{label}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
             <span className="text-[9px] font-black text-green-500">{ok} OK</span>
             <span className="text-[9px] font-black text-red-500">{err} ERR</span>
             <span className="text-[9px] font-bold text-muted-foreground/75">{total} total</span>
          </div>
       </div>
       <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}

function RiskTile({ label, value, color, sub }: any) {
  return (
    <div className="bg-secondary/40 rounded-lg p-2 border border-border flex flex-col justify-center items-center text-center">
       <span className="text-[8px] font-black text-muted-foreground/75 mb-1">{label}</span>
       <span className={cn("text-lg font-black leading-none", color)}>{value}%</span>
       <span className="text-[7px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">{sub}</span>
    </div>
  );
}

const radarData = [
  { subject: 'Network', value: 120, fullMark: 150 },
  { subject: 'Server', value: 98, fullMark: 150 },
  { subject: 'DB', value: 86, fullMark: 150 },
  { subject: 'App', value: 99, fullMark: 150 },
  { subject: 'Endpoint', value: 85, fullMark: 150 },
  { subject: 'Cloud', value: 65, fullMark: 150 },
];

const weeklyData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 8 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 22 },
  { day: 'Sat', count: 11 },
  { day: 'Sun', count: 9 },
];
