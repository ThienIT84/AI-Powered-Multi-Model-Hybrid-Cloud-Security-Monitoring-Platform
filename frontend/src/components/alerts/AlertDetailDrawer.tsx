import React, { useState } from "react";
import { 
  X, 
  Copy, 
  ExternalLink, 
  Shield, 
  Brain, 
  History, 
  Globe, 
  Database,
  Lock,
  UserX,
  Share2,
  Trash2,
  MessageCircle,
  FileSearch,
  Activity,
  Zap,
  Target,
  Server,
  Plus,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface AlertDetailDrawerProps {
  alert: Alert;
  onClose: () => void;
}

export function AlertDetailDrawer({ alert, onClose }: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "logs" | "timeline">("overview");

  const radarData = [
    { subject: 'Impact', A: 80, fullMark: 100 },
    { subject: 'Velocity', A: 98, fullMark: 100 },
    { subject: 'Persistence', A: 86, fullMark: 100 },
    { subject: 'Sophistication', A: 99, fullMark: 100 },
    { subject: 'Evasion', A: 85, fullMark: 100 },
  ];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-card border-l border-border shadow-2xl z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-red-500/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-red-500" />
             </div>
             <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-[0.1em]">{alert.attackType}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">ID: {alert.id}</span>
                   <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">•</span>
                   <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">ACTIVE</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-muted/50 p-3 rounded-xl border border-border">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Source Asset</span>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-mono font-black text-cyan-500 leading-none">{alert.sourceIp}</span>
                 <ExternalLink className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
           </div>
           <div className="bg-muted/50 p-3 rounded-xl border border-border">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Risk Score</span>
              <div className="flex items-center gap-2">
                 <span className={cn(
                    "text-xs font-mono font-black leading-none",
                    alert.riskScore > 80 ? "text-red-500" : "text-orange-500"
                 )}>{alert.riskScore}/100</span>
                 <div className="h-1 flex-1 bg-background rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-red-500" style={{ width: `${alert.riskScore}%` }} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/20">
         {(['overview', 'analysis', 'logs', 'timeline'] as const).map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
               activeTab === tab ? "text-cyan-500 border-cyan-500 bg-cyan-500/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <FileSearch className="w-3.5 h-3.5 text-cyan-500" />
                Incident Description
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {alert.description} This activity patterns match known command-and-control communication protocols. AI correlation engine has identified this as a high-confidence threat targeting production assets.
              </p>
            </section>

            {/* MITRE Mapping */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                MITRE ATT&CK MAPPING
              </h3>
              <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded text-[8px] font-black tracking-widest">{alert.mitreAttack?.id}</span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{alert.mitreAttack?.technique}</span>
                 </div>
                 <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                   {alert.mitreAttack?.description}
                 </p>
              </div>
            </section>

            {/* Assets */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Related Assets</h3>
              <div className="space-y-2">
                 {[
                   { type: 'Service', name: 'Web_Gateway_02', status: 'Online', icon: Server },
                   { type: 'Database', name: 'DB_Production', status: 'Warning', icon: Database },
                   { type: 'Identity', name: 'User_johndoe (LDAP)', status: 'Active', icon: Lock },
                 ].map((asset, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                         <asset.icon className="w-4 h-4 text-muted-foreground" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{asset.name}</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{asset.type}</span>
                         </div>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        asset.status === 'Online' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                      )}>{asset.status}</span>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8">
             <section className="space-y-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                   <Brain className="w-4 h-4 text-purple-500" />
                   AI Behavioral Signature
                </h3>
                <div className="h-[250px] w-full bg-muted/20 rounded-2xl flex items-center justify-center border border-border p-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                         <PolarGrid stroke="var(--border)" />
                         <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--muted-foreground)' }} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar
                            name="Threat Profile"
                            dataKey="A"
                            stroke="rgb(168, 85, 247)"
                            fill="rgb(168, 85, 247)"
                            fillOpacity={0.4}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
             </section>

             <section className="space-y-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Risk Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Anomaly Score</span>
                      <div className="text-xl font-bold text-foreground">0.82 <span className="text-[10px] text-purple-500 uppercase tracking-widest">Extreme</span></div>
                   </div>
                   <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Recurrence Rate</span>
                      <div className="text-xl font-bold text-foreground">12/hr <span className="text-[10px] text-cyan-500 uppercase tracking-widest">Frequent</span></div>
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Raw Packet Buffer</h3>
                <button className="flex items-center gap-2 text-[9px] font-black text-cyan-500 uppercase tracking-widest">
                   <Copy size={12} /> Copy Logs
                </button>
             </div>
             <div className="bg-muted border border-border p-4 rounded-xl font-mono text-[10px] leading-relaxed relative group transition-colors">
                <div className="text-muted-foreground/80 space-y-1">
                   <p className="text-cyan-500/80"># Zeek Connection Log</p>
                   <p>ts: {new Date(alert.timestamp).getTime() / 1000}</p>
                   <p>uid: CQK3Z11K6r2aN2m7k</p>
                   <p>id.orig_h: {alert.sourceIp} id.orig_p: {(alert.sourcePort ?? alert.destinationPort) - 124}</p>
                   <p>id.resp_h: {alert.destinationIp} id.resp_p: {alert.destinationPort}</p>
                   <p>proto: {alert.protocol.toLowerCase()}</p>
                   <p>service: {alert.protocol === 'HTTPS' ? 'ssl' : 'http'}</p>
                   <p>duration: {alert.zeekData.duration}s</p>
                   <p>orig_bytes: {alert.zeekData.origBytes}</p>
                   <p>resp_bytes: {alert.zeekData.respBytes}</p>
                   <p>conn_state: {alert.zeekData.connState}</p>
                   <p className="pt-2 text-red-500/80"># Payload Segment (AI Extracted)</p>
                   <p className="text-red-500 font-bold">{alert.rawPayload ?? "No raw payload captured"}</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
             <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-500" />
                Alert Lifecycle
             </h3>
             <div className="relative pl-6 space-y-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border border-l border-dashed border-border" />
                
                {alert.timeline.map((event, i) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-card ring-2 ring-cyan-500/20" />
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{event.type}</span>
                          <span className="text-[8px] font-mono text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">{event.description}</p>
                       {event.actor && (
                         <div className="mt-2 flex items-center gap-1">
                            <UserX className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Actor: {event.actor}</span>
                         </div>
                       )}
                    </div>
                  </div>
                ))}

                <button className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">
                   <Plus size={14} /> Add Analyst Note
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border bg-muted/20 space-y-3">
         <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">
               <Lock size={14} /> Isolate Asset
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-muted border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-border transition-all">
               <UserX size={14} /> Block Domain
            </button>
         </div>
         <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border">
               <Share2 size={16} className="text-muted-foreground" />
               <span className="text-[8px] font-black text-muted-foreground uppercase">Share</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border">
               <MessageCircle size={16} className="text-muted-foreground" />
               <span className="text-[8px] font-black text-muted-foreground uppercase">Slack</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border">
               <Trash2 size={16} className="text-muted-foreground" />
               <span className="text-[8px] font-black text-muted-foreground uppercase">Discard</span>
            </button>
         </div>
         <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Mark as Resolved
         </button>
      </div>
    </motion.div>
  );
}
