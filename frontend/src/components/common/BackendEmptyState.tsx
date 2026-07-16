import { Database, RefreshCw } from "lucide-react";

interface BackendEmptyStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function BackendEmptyState({ title, description, onRetry }: BackendEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <Database className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground"
        >
          <RefreshCw size={12} /> Refresh backend data
        </button>
      )}
    </div>
  );
}
