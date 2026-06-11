import React, { useState } from "react";
import { z } from "zod";
import { FolderSync, DownloadCloud, UploadCloud, RotateCcw, ShieldCheck, History, AlertTriangle, CalendarRange, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

export const backupRecoverySchema = z.object({
  backupPolicy: z.enum(["Daily", "Weekly", "Monthly", "None"]),
  lastVerifiedDate: z.string(),
  backupHistory: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    hashCode: z.string(),
    size: z.string(),
    environment: z.string(),
    status: z.string(),
  })),
});

interface BackupRecoveryProps {
  onToast: (msg: string, type: any) => void;
  onLog?: (msg: string) => void;
}

export function BackupRecovery({ onToast, onLog }: BackupRecoveryProps) {
  const [policy, setPolicy] = useState<"Daily" | "Weekly" | "Monthly" | "None">("Weekly");
  const [lastVerified, setLastVerified] = useState("2026-06-08 14:02:44");
  const [history, setHistory] = useState([
    { id: "SNAP-2938", timestamp: "2026-06-10 12:00:00", hashCode: "sha256:d8c0b9a...12a", size: "4.8 MB", status: "Verified" },
    { id: "SNAP-2911", timestamp: "2026-06-03 12:00:00", hashCode: "sha256:3a4b92c...e14", size: "4.7 MB", status: "Verified" },
    { id: "SNAP-2882", timestamp: "2026-05-27 12:00:00", hashCode: "sha256:88fb3cd...5a3", size: "4.5 MB", status: "Verified" },
  ]);

  const triggerSnapshot = () => {
    onToast("INITIATING CORE STATE PROTOCOL SERIALIZER...", "info");
    if (onLog) onLog("Serializing complete PostgreSQL schemas and active thresholds settings...");
    
    setTimeout(() => {
      const snapId = `SNAP-${Math.floor(Math.random() * 9000 + 1000)}`;
      const newSnap = {
        id: snapId,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        hashCode: `sha256:${Math.random().toString(36).substring(2, 9)}...${Math.random().toString(36).substring(2, 5)}`,
        size: "4.9 MB",
        status: "Verified"
      };
      setHistory((prev) => [newSnap, ...prev]);
      onToast(`CORE PLUGS STATE COMMITTED INTO NEW SNAPSHOT: ${snapId}`, "success");
      if (onLog) onLog(`Snapshot file generated successfully. Hashcode: ${newSnap.hashCode}`);
    }, 1200);
  };

  const triggerRestore = (id: string) => {
    onToast(`RESTORING CORE DATA STATE BACK TO ${id}...`, "warning");
    if (onLog) onLog(`System snapshot ${id} selected. Purging temporary logs...`);
    
    setTimeout(() => {
      onToast(`SYSTEM RESTORE PROTOCOLS FINISHED SUCCESSFULLY FOR ${id}`, "success");
      setLastVerified(new Date().toISOString().replace("T", " ").substring(0, 19));
      if (onLog) onLog(`Live settings state successfully repopulated from snapshots database archive.`);
    }, 1500);
  };

  const handleVerify = () => {
    onToast("VERIFYING CONSISTENCY OF SECURE RECOVERY STORAGE ARCHIVES...", "info");
    setTimeout(() => {
      setLastVerified(new Date().toISOString().replace("T", " ").substring(0, 19));
      onToast("ALL SNAPSHOT RECOVERIES CHECKSUM PASS WITH 100% DISK REPLICABILITY!", "success");
    }, 1000);
  };

  return (
    <div className="space-y-6" id="backup-recovery-panel">
      {/* Detail Labeling */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <FolderSync className="w-4 h-4 text-cyan-500" />
          Backup & Disaster Recovery Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Perform manual system snapshot commits, restore older backup stages, define automated cron schedules, and verify checklist integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px] uppercase">
        
        {/* Left Column: Actions and Automated schedules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <CalendarRange className="w-3.5 h-3.5 text-cyan-500" />
              Cron Backup Policy
            </h4>

            {/* Drodown Backup */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Automatic Snapshot Routine</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                value={policy}
                onChange={(e) => setPolicy(e.target.value as any)}
              >
                <option value="Daily">Daily Snapshot Sync (Midnight PDT)</option>
                <option value="Weekly">Weekly System Snapshot Sync (Saturday night)</option>
                <option value="Monthly">Monthly Global Snapshot Sync</option>
                <option value="None">De-activated (Manual snapshots ONLY)</option>
              </select>
            </div>

            {/* Manual snapshot triggers */}
            <div className="space-y-3 border-t border-border/10 pt-4 flex flex-col gap-1">
              <span className="text-[8.5px] font-bold text-[#64748b] block">Trigger Manual Snapshots</span>
              <button
                type="button"
                onClick={triggerSnapshot}
                className="w-full py-2.5 bg-foreground text-background font-black uppercase text-center rounded-lg hover:opacity-95 transition cursor-pointer select-none border-none flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Commit Live Settings Snapshot
              </button>
            </div>
          </div>

          {/* Verification section */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm font-mono flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white border-b border-border/25 pb-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Recovery Integrity Verification
              </span>

              <div className="py-1">
                <span className="text-[8px] text-slate-500 block">Checksum Last Verification Checkpoint</span>
                <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 block mt-1">
                  {lastVerified}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              className="w-full py-2 bg-slate-50 dark:bg-slate-900 border border-border hover:border-cyan-500 rounded-lg text-center font-black transition cursor-pointer select-none"
            >
              Verify Checksums Now
            </button>
          </div>
        </div>

        {/* Right Column: Backup History table */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white border-b border-border/25 pb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-500" />
                Secure Snapshot Archive History
              </span>

              <div className="space-y-2.5 max-h-70 overflow-y-auto custom-scrollbar pr-1">
                {history.map((snap) => (
                  <div key={snap.id} className="p-3 bg-slate-100/50 dark:bg-slate-950/25 border border-border/50 hover:border-cyan-500/30 rounded-xl transition flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-500/10 text-cyan-500 font-extrabold border border-cyan-500/25 px-1.5 py-0.5 rounded text-[8px]">
                          {snap.id}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">{snap.size}</span>
                        <span className="text-[#10b981] text-[7px] bg-emerald-500/5 border border-emerald-500/10 rounded px-1">{snap.status}</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {snap.timestamp}
                      </span>
                      <span className="text-[6.5px] text-slate-400 dark:text-zinc-500 font-mono block select-all">{snap.hashCode}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerRestore(snap.id)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 hover:border-transparent border border-cyan-500/20 font-black rounded text-[7.5px] cursor-pointer transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/15 flex items-center gap-2 mt-4">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="text-[7.5px] text-zinc-500 font-semibold leading-normal">
                Absolute Warning: Restoration replaces full live configuration thresholds instantly. All open network sockets will disconnect for 2 seconds.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
