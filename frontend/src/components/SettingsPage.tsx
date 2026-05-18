import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Key, 
  Database, 
  Cpu, 
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  Camera
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'network', label: 'Network', icon: Globe },
    { id: 'system', label: 'System', icon: Cpu },
  ];

  const [activeSegment, setActiveSegment] = React.useState('profile');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-black text-white dark:text-white light:text-gray-900 uppercase tracking-[0.3em]">System Configuration</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Configure AI nodes and security protocols</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Nodes Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSegment(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group",
                activeSegment === section.id 
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                  : "bg-transparent border-transparent text-gray-500 hover:bg-white/[0.03] hover:text-gray-300"
              )}
            >
              <section.icon className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                activeSegment === section.id ? "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : ""
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 space-y-6">
          <div className="bg-[#030408] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />
            
            {activeSegment === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1">
                      <div className="w-full h-full rounded-full bg-[#030408] flex items-center justify-center overflow-hidden">
                        <User className="w-10 h-10 text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Operational Identity</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">SOC Level 3 Administrator</p>
                    <button className="mt-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-300 uppercase tracking-widest hover:bg-white/10 transition-colors">
                      Update Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Assigned Designation</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="text" 
                        defaultValue="Admin_Phu"
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-gray-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Contact Path</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="email" 
                        defaultValue="phutd0212@gmail.com"
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-gray-100 focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSegment === 'security' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-200 uppercase tracking-wider">Critical Warning</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Quantum-safe encryption is currently disabled on primary nodes.</p>
                  </div>
                  <button className="ml-auto px-3 py-1.5 bg-orange-500 text-white rounded text-[9px] font-black uppercase tracking-widest">Enable</button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Multi-Factor Auth', status: 'Enabled', icon: Lock },
                    { label: 'Session Hardening', status: 'Standard', icon: Key },
                    { label: 'IP WhiteList', status: '3 Active', icon: Globe },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button className="px-6 py-2 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors">Discard</button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">Sync Configuration</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-[#030408] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Database Sync</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest">Healthy</p>
                   </div>
                </div>
                <div className="text-[10px] font-mono text-gray-600">8.4ms</div>
             </div>
             <div className="p-4 bg-[#030408] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">AI Storage</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest">84% Capacity</p>
                   </div>
                </div>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-[84%] h-full bg-blue-500" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
