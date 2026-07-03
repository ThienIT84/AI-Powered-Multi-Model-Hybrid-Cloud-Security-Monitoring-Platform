import React from "react";
import { RefreshCw } from "lucide-react";
import { DataMode } from "../../types/platform";

export function LoadingState({ label = "Loading SOC telemetry..." }: { label?: string }) {
  return <div className="bg-card border border-border rounded-lg p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</div>;
}

export function EmptyState({ label = "Waiting for Telemetry" }: { label?: string }) {
  return <div className="bg-card border border-border rounded-lg p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</div>;
}

export function ErrorState({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <div className="bg-card border border-red-500/25 rounded-lg p-6 flex items-center justify-between gap-4">
      <span className="text-xs font-black uppercase tracking-widest text-red-400">{label}</span>
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1.5 rounded border border-border text-[9px] font-black uppercase flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

export function DataModeNotice({ mode, className = "" }: { mode: DataMode; className?: string }) {
  if (mode === "live") return null;
  return (
    <div className={`border border-amber-500/20 bg-amber-500/10 text-amber-500 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest ${className}`}>
      {mode === "replay" ? "Replay Data" : "Simulated Demo Data"}
    </div>
  );
}
