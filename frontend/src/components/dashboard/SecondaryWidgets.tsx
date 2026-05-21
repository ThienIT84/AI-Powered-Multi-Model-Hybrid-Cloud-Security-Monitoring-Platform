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
      <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-6">
           <Activity className="w-4 h-4 text-cyan-400" />
           <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-widest">SỨC KHỎE HẠ TẦNG</h3>
        </div>
        <div className="space-y-5">
           <InfraItem icon={Server} label="Web Servers" ok={45} err={3} total={48} color="bg-cyan-500" />
           <InfraItem icon={Database} label="Databases" ok={23} err={1} total={24} color="bg-yellow-500" />
           <InfraItem icon={Cloud} label="Cloud Instances" ok={152} err={4} total={156} color="bg-orange-500" />
           <InfraItem icon={Cpu} label="Endpoints" ok={879} err={13} total={892} color="bg-green-500" />
        </div>
      </div>

      {/* Attack Surface Radar */}
      <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
           <ShieldCheck className="w-4 h-4 text-purple-400" />
           <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-widest">BỀ MẶT TẤN CÔNG</h3>
        </div>
        <div className="h-[180px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8, fontWeight: 900 }} />
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
      <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
           <AlertTriangle className="w-4 h-4 text-yellow-500" />
           <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-widest">SỰ CỐ TUẦN NÀY</h3>
        </div>
        <div className="h-[180px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 8, fontWeight: 900 }} />
                 <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #333', borderRadius: '4px' }}
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
         <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">DỰ BÁO RỦI RO AI</span>
               <Zap className="w-3 h-3 text-purple-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
               <RiskTile label="1H" value={72} color="text-red-500" sub="Nguy cơ cao" />
               <RiskTile label="6H" value={58} color="text-yellow-500" sub="Trung bình" />
               <RiskTile label="12H" value={45} color="text-blue-500" sub="Thấp" />
               <RiskTile label="24H" value={32} color="text-green-500" sub="An toàn" />
            </div>
         </div>
         <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
               <p className="text-[10px] text-red-400 font-bold leading-snug">AI dự báo đợt tấn công DDoS quy mô lớn trong 1-2 giờ tới</p>
               <p className="text-[8px] text-red-500/50 uppercase font-black mt-1 tracking-widest">HÀNH ĐỘNG KHUYÊN DÙNG: BẬT WAF</p>
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
             <Icon size={12} className="text-gray-500" />
             <span className="text-[10px] font-bold text-gray-300">{label}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
             <span className="text-[9px] font-black text-green-500">{ok} OK</span>
             <span className="text-[9px] font-black text-red-500">{err} ERR</span>
             <span className="text-[9px] font-bold text-gray-600">{total} total</span>
          </div>
       </div>
       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}

function RiskTile({ label, value, color, sub }: any) {
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col justify-center items-center text-center">
       <span className="text-[8px] font-black text-gray-600 mb-1">{label}</span>
       <span className={cn("text-lg font-black leading-none", color)}>{value}%</span>
       <span className="text-[7px] font-bold text-gray-500 uppercase mt-1 tracking-tighter">{sub}</span>
    </div>
  );
}

const radarData = [
  { subject: 'Mạng', value: 120, fullMark: 150 },
  { subject: 'Server', value: 98, fullMark: 150 },
  { subject: 'DB', value: 86, fullMark: 150 },
  { subject: 'App', value: 99, fullMark: 150 },
  { subject: 'Endpoint', value: 85, fullMark: 150 },
  { subject: 'Cloud', value: 65, fullMark: 150 },
];

const weeklyData = [
  { day: 'T2', count: 12 },
  { day: 'T3', count: 8 },
  { day: 'T4', count: 15 },
  { day: 'T5', count: 6 },
  { day: 'T6', count: 22 },
  { day: 'T7', count: 11 },
  { day: 'CN', count: 9 },
];
