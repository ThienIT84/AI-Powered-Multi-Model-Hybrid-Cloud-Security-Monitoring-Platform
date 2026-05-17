import { Alert } from "../types";
import { cn } from "../lib/utils";
import { 
  X, 
  ShieldAlert, 
  Binary, 
  Activity, 
  Layers, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Brain,
  History,
  ShieldX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export function EventModal({ alert, onClose }: EventModalProps) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />
      
      <motion.div 
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-100 bg-[#0a0c10] h-full border-l border-white/10 relative z-10 flex flex-col shadow-2xl"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-[11px] font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
                 EVENT DETAIL <span className="text-blue-500 font-mono">#{alert.id.substring(0, 7)}</span>
               </h2>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-500 transition-colors">
                 <X size={16} />
               </button>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">SOURCE IP:</span>
                 <span className="font-mono text-red-500 font-bold">{alert.sourceIp}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">DESTINATION IP:</span>
                 <span className="font-mono text-blue-400 font-bold">{alert.destIp}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">SERVICE:</span>
                 <span className="text-[10px] font-black text-gray-100 bg-white/5 px-2 py-0.5 rounded border border-white/10 tracking-widest">{alert.protocol} ({alert.destPort})</span>
               </div>
            </div>
          </div>

          {/* AI Analysis Flow */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-4 h-4 text-purple-400" />
              <h2 className="text-[11px] font-black text-gray-100 uppercase tracking-widest">AI ANALYSIS FLOW</h2>
            </div>
            <div className="space-y-3 relative pl-4">
               <div className="absolute left-1.75 top-2 bottom-2 w-px bg-white/5 border-l border-dashed border-gray-700" />
               <FlowStep label="Data Source: Zeek Sensor" status="completed" />
               <FlowStep label="AI1: Feature Extraction" value={`${(parseFloat(alert.aiDecision.ai1) * 100).toFixed(0)}%`} status="active" />
               <FlowStep label="AI2A: Attack Classifier" value={alert.attackType} status="completed" />
               <FlowStep label="AI2B: Threat Intel Sync" value="MATCHED" status="completed" />
               <FlowStep label="Fusion Layer: Final Choice" value="CONFIRMED" status="confirmed" />
            </div>
          </div>

          {/* MITRE Mapping */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <h2 className="text-[11px] font-black text-gray-100 uppercase tracking-widest">MITRE ATT&CK MAPPING</h2>
            </div>
            <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
               <div className="font-black text-xs text-orange-500 mb-1 tracking-tighter">T1190 - Exploit Public-Facing Application</div>
               <div className="text-[10px] text-gray-500 font-medium leading-relaxed">Adversaries may attempt to exploit a software vulnerability in an Internet-facing application or system to achieve code execution or gain initial access.</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/5 space-y-3 bg-black/20">
           <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
              <ShieldX size={14} /> BLOCK SOURCE IP IMMEDIATELY
           </button>
           <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all">
                PDF REPORT
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all">
                INVESTIGATE
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function FlowStep({ label, value, status }: { label: string, value?: string, status: 'completed' | 'active' | 'confirmed' }) {
  return (
    <div className={cn(
      "relative bg-black/40 border px-3 py-2.5 rounded-lg text-[10px] flex justify-between items-center transition-all",
      status === 'active' ? "border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]" : "border-white/5"
    )}>
      <div className="absolute -left-3.25 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-gray-700 bg-bg-dark z-10" />
      <span className="font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
      {status === 'active' && <span className="font-black text-blue-400 font-mono">{value}</span>}
      {status === 'completed' && <span className="text-green-500 bg-green-500/10 px-1 rounded">DECODED</span>}
      {status === 'confirmed' && <span className="text-red-500 font-black">CRITICAL</span>}
    </div>
  );
}
