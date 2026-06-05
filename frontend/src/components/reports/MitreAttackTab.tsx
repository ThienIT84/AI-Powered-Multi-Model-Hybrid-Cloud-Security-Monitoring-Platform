import React from "react";

export function MitreAttackTab() {
  return (
    <div className="space-y-6 animate-fadeIn" id="mitre-attack-view">
      
      {/* MITRE MATRIX CONTAINER CARD */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded font-mono text-[8px] font-black uppercase">
              MITRE ATT&CK Matrix framework (v14.1)
            </span>
            <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block mt-1">
              Active Enterprise Threat coverage heat map
            </h3>
          </div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-extrabold text-right">
            Red Cell indicator active on threat detection match
          </p>
        </div>

        {/* The Matrix Grid Columns representing tactics */}
        <div className="overflow-x-auto select-none">
          <div className="min-w-300 grid grid-cols-14 gap-2 font-mono text-[8.5px] font-semibold text-center uppercase tracking-wide leading-tight">
            
            {/* T1: Recon */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Recon
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Active Scanning
                </div>
                <div className="p-2 border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 font-black rounded shadow-[0_0_8px_rgba(239,68,68,0.06)] animate-pulse">
                  Vulnerability Scanning
                  <div className="text-[7px] text-rose-500 mt-1 font-bold">Logged • 35 times</div>
                </div>
              </div>
            </div>

            {/* T2: Resource Dev */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Res Dev
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Acquire Infra
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Server Compromise
                </div>
              </div>
            </div>

            {/* T3: Initial Access */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Init Access
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-critical/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                  Exploit Public-Facing App
                  <div className="text-[7px] text-rose-500 mt-1 font-bold">Triggered • SQLi</div>
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Phishing Email
                </div>
              </div>
            </div>

            {/* T4: Execution */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Execution
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Command & Scripting
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition font-mono">
                  Container orchestration
                </div>
              </div>
            </div>

            {/* T5: Persistence */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Persist
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Account Manip
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Scheduled Tasks
                </div>
              </div>
            </div>

            {/* T6: Priv Esc */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Priv Esc
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Valid Accounts
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Process Injection
                </div>
              </div>
            </div>

            {/* T7: Defense Evasion */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Def Evasion
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Binary Padding
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Masquerading
                </div>
              </div>
            </div>

            {/* T8: Cred Access */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Cred Access
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Brute Force
                </div>
                <div className="p-2 border border-border dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  LSASS Memory
                </div>
              </div>
            </div>

            {/* T9: Discovery */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Discovery
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 font-bold rounded animate-pulse">
                  Port Sweep scan
                  <div className="text-[7px] text-rose-500 mt-1 font-bold">Triggered • AL-5892</div>
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 rounded transition">
                  Software Discovery
                </div>
              </div>
            </div>

            {/* T10: Lateral Movement */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Lat Move
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  SSH Brute Force
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  SMB Relay Session
                </div>
              </div>
            </div>

            {/* T11: Collection */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Collection
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Email Collection
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Screen Capture
                </div>
              </div>
            </div>

            {/* T12: Command & Control */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                C&C
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Application Layer Protocol
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Dynamic DNS Host
                </div>
              </div>
            </div>

            {/* T13: Exfiltration */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Exfil
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-455 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Exfiltration over Unencrypted channel
                </div>
              </div>
            </div>

            {/* T14: Impact */}
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-border dark:border-slate-800 p-2 rounded font-black text-slate-700 dark:text-slate-400 text-[8.5px]">
                Impact
              </div>
              <div className="space-y-1.5">
                <div className="p-2 border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 font-bold rounded animate-pulse">
                  DDoS Flood (TCP)
                  <div className="text-[7px] text-rose-500 mt-1 font-bold">Triggered • AL-7712</div>
                </div>
                <div className="p-2 border border-border dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355 rounded transition">
                  Resource Hijacking
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
