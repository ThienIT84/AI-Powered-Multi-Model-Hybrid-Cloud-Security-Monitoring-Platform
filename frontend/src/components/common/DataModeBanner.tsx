import { DataMode } from "../../config";
import { cn } from "../../lib/utils";

interface DataModeBannerProps {
  dataMode: DataMode;
  label?: string;
  className?: string;
}

export function DataModeBanner({ dataMode, label = "This workspace uses simulated data", className }: DataModeBannerProps) {
  if (dataMode === "live") return null;

  const text = dataMode === "replay" ? "Replay data" : "Simulated data";

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest",
        dataMode === "replay"
          ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
          : "border-purple-500/25 bg-purple-500/10 text-purple-400",
        className
      )}
    >
      {text} - {label}
    </div>
  );
}
