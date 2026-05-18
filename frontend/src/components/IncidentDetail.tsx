import React from "react";
import { ShieldAlert, X, Copy, ExternalLink } from "lucide-react";
import { Alert } from "../types";
import { cn } from "../lib/utils";

interface IncidentDetailProps {
  alert: Alert | null;
  onClose?: () => void;
}

export function IncidentDetail({ alert, onClose }: IncidentDetailProps) {
  if (!alert) return null;

  const isSQLi = alert.attackType.includes("SQL Injection");

  return (
    <div className={cn(
      "h-full rounded-sm flex flex-col relative overflow-hidden group select-none transition-colors duration-500",
      isSQLi ? "shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] shadow-2xl" : "shadow-[0_0_40px_rgba(0,0,0,0.5)] light:shadow-sm",
      "bg-[#06070a] dark:bg-[#06070a] light:bg-white border border-white/10 dark:border-white/10 light:border-gray-200"
    )}>
      {/* HEADER SECTION */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn(
            "text-xs font-black uppercase tracking-[0.15em] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
            isSQLi ? "text-red-500" : "text-blue-500"
          )}>
            {isSQLi ? "CRITICAL SQL INJECTION DETECTED" : `${alert.severity} ${alert.attackType.toUpperCase()} DETECTED`}
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-5 h-5 rounded-full border border-gray-700 dark:border-gray-700 light:border-gray-300 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-all text-white group"
            >
              <X className="w-3 h-3 text-gray-400 dark:text-gray-400 light:text-gray-500 group-hover:text-white dark:group-hover:text-white light:group-hover:text-gray-900" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">INCIDENT ID:</span>
            <span className="text-[10px] font-mono font-black text-gray-300 dark:text-gray-300 light:text-gray-700">INC-2025-05-19-1024-001</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-sm">
              <span className="text-[7px] font-black text-red-500 uppercase tracking-widest leading-none">CRITICAL</span>
            </div>
            <span className="text-[7px] text-gray-600 font-bold uppercase mt-1 tracking-widest">Status: Active</span>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="flex border-b border-white/5 dark:border-white/5 light:border-gray-100 text-[8px] font-black uppercase tracking-[0.2em]">
        <div className="px-5 py-2.5 text-gray-600 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">Overview</div>
        <div className={cn(
          "px-5 py-2.5 cursor-pointer transition-all border-b-2",
          isSQLi ? "border-blue-500 text-blue-400" : "border-gray-300 text-white dark:text-white light:text-gray-900"
        )}>Payload & Context</div>
        <div className="px-5 py-2.5 text-gray-600 dark:text-gray-600 light:text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">AI Analysis</div>
        <div className="px-5 py-2.5 text-gray-600 dark:text-gray-600 light:text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 cursor-pointer transition-colors border-b-2 border-transparent">MITRE ATT&CK</div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* RAW PAYLOAD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">RAW PAYLOAD</h3>
            <div className="flex items-center gap-3">
              <X className="w-2.5 h-2.5 text-gray-700 cursor-pointer" />
              <div className="flex items-center gap-1 cursor-pointer group/copy">
                <Copy className="w-2.5 h-2.5 text-gray-700 group-hover/copy:text-gray-400 dark:group-hover/copy:text-gray-400 light:group-hover/copy:text-gray-900" />
                <span className="text-[8px] text-gray-600 font-black group-hover/copy:text-gray-400 dark:group-hover/copy:text-gray-400 light:group-hover/copy:text-gray-900">COPY</span>
              </div>
            </div>
          </div>
          <div className="bg-[#030408] dark:bg-[#030408] light:bg-gray-50 border border-white/5 dark:border-white/5 light:border-gray-200 rounded-sm p-3 font-mono text-[9px] leading-relaxed relative">
            <div className="text-gray-400 dark:text-gray-400 light:text-gray-600">
              POST /login.php HTTP/1.1<br />
              Host: app.internal.example.com<br />
              User-Agent: Mozilla/5.0<br />
              Content-Type: application/x-www-form-urlencoded<br />
              Content-Length: 96<br /><br />
              <span className="text-red-500 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                username=admin' OR '1'='1'--#apasswordanything&submit=Login
              </span>
            </div>
          </div>
        </div>

        {/* DECODED & INTERPRETED */}
        <div className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">DECODED & INTERPRETED</h3>
          <p className="text-[10px] text-gray-400 leading-relaxed italic">
            SQL Injection attempt detected. The payload manipulates the authentication query to bypass login security controls.
          </p>
        </div>

        {/* MITRE ATT&CK */}
        <div className="space-y-2">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">MITRE ATT&CK</h3>
          <div className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-sm border border-white/5">
            <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Initial Access</span>
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 text-[8px] font-black tracking-widest">T1190</span>
            <span className="text-[9px] text-gray-400 font-black tracking-tight flex-1 ml-1">Exploit Public-Facing Application</span>
            <ExternalLink className="w-3 h-3 text-gray-600 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* SOURCE INFORMATION */}
        <div className="space-y-3">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">SOURCE INFORMATION</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Source IP</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-400 font-mono tracking-tight cursor-pointer hover:text-blue-300 transition-colors">203.0.113.45</span>
                <span className="text-sm">🇺🇸</span>
              </div>
            </div>
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Source Port</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono tracking-tight">54321</span>
            </div>
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Destination IP</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono tracking-tight pointer-events-none">10.0.12.15</span>
            </div>
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Destination Port</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono tracking-tight">443</span>
            </div>
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Protocol</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-300 light:text-gray-700 tracking-tight uppercase">TCP</span>
            </div>
            <div>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">Direction</span>
              <span className="text-[10px] font-black text-gray-300 dark:text-gray-300 light:text-gray-700 tracking-tight uppercase">External → Internal</span>
            </div>
          </div>
        </div>

        {/* ADDITIONAL CONTEXT */}
        <div className="space-y-4 pt-4 border-t border-white/5 dark:border-white/5 light:border-gray-100">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">ADDITIONAL CONTEXT</h3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Detected By</span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest border-b border-blue-500/30">AI Model (NLP-SQLi)</span>
              </div>
              <div className="h-1 w-full bg-white/5 dark:bg-white/5 light:bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Confidence Score</span>
                <span className="text-[10px] font-mono font-black text-gray-200 dark:text-gray-200 light:text-gray-700">0.96</span>
              </div>
              <div className="h-1 w-full bg-white/5 dark:bg-white/5 light:bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: '96%' }} />
              </div>
            </div>

            <div className="flex justify-between border-b border-white/[0.02] dark:border-white/[0.02] light:border-gray-100 pb-1">
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">First Seen</span>
              <span className="text-[9px] font-mono font-black text-gray-400 dark:text-gray-400 light:text-gray-600">10:24:17 AM</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.02] dark:border-white/[0.02] light:border-gray-100 pb-1">
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Last Seen</span>
              <span className="text-[9px] font-mono font-black text-gray-400 dark:text-gray-400 light:text-gray-600">10:24:19 AM</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.02] dark:border-white/[0.02] light:border-gray-100 pb-1">
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Occurrences</span>
              <span className="text-[9px] font-mono font-black text-gray-400 dark:text-gray-400 light:text-gray-600">3</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.02] dark:border-white/[0.02] light:border-gray-100 pb-1">
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Severity</span>
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-[#030408] dark:bg-[#030408] light:bg-gray-50 border-t border-white/5 dark:border-white/5 light:border-gray-200 flex gap-2">
        <button className="flex-1 py-3 px-1 border border-white/10 dark:border-white/10 light:border-gray-300 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200 transition-all rounded-sm">
          ISOLATE SOURCE
        </button>
        <button className="flex-1 py-3 px-1 border border-white/10 dark:border-white/10 light:border-gray-300 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200 transition-all rounded-sm">
          BLOCK IP
        </button>
        <button className="flex-1 py-3 px-1 border border-white/10 dark:border-white/10 light:border-gray-300 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-400 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-gray-200 transition-all rounded-sm">
          CREATE CASE
        </button>
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-1 bg-red-600/10 border border-red-600/30 text-[8px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-600/20 transition-all rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          CLOSE
        </button>
      </div>

      {/* Ambient backgrounds */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600 opacity-5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600 opacity-5 blur-[100px] pointer-events-none rounded-full" />
    </div>
  );
}
