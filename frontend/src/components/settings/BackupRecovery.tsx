import { AlertTriangle, DatabaseBackup, History, ShieldQuestion } from "lucide-react";

interface BackupRecoveryProps {
  onToast: (message: string, type: "success" | "warning" | "info") => void;
  onLog?: (message: string) => void;
}

export function BackupRecovery(_props: BackupRecoveryProps) {
  return (
    <div className="space-y-6" id="backup-recovery-panel">
      <div>
        <h3 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
          <DatabaseBackup className="h-4 w-4 text-cyan-500" />
          Backup &amp; Disaster Recovery
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Backup controls require a backend snapshot API and an authorized storage provider.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5 font-mono">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-500">
            <ShieldQuestion size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">
              Backup service not configured
            </h4>
            <p className="mt-2 max-w-3xl text-[9px] leading-relaxed text-muted-foreground">
              The frontend has no API contract for creating, listing, verifying, or restoring snapshots. It therefore does not display backup history or claim that recovery checks succeeded.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-foreground">
              <History size={13} className="text-muted-foreground" /> Snapshot history
            </div>
            <p className="mt-2 text-[8px] uppercase text-muted-foreground">Unavailable — no backend records were requested.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-foreground">
              <AlertTriangle size={13} className="text-muted-foreground" /> Recovery verification
            </div>
            <p className="mt-2 text-[8px] uppercase text-muted-foreground">Unknown — checksum verification is not implemented.</p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-5 w-full cursor-not-allowed rounded-lg border border-border bg-muted/40 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70"
          title="A backend backup API must be configured before this action is available"
        >
          Snapshot actions unavailable
        </button>
      </div>
    </div>
  );
}
