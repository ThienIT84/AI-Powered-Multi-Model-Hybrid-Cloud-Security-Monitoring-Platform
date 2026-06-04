import React from "react";
import { Flame, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface EndpointAlertToastProps {
  alertPopup: {
    id: string;
    title: string;
    message: string;
    severity: "Critical" | "High" | "Medium";
  } | null;
  onClose: () => void;
}

export const EndpointAlertToast: React.FC<EndpointAlertToastProps> = ({ alertPopup, onClose }) => {
  if (!alertPopup) return null;

  return (
    <div 
      id="endpoint-alert-toast"
      className={cn(
        "fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl font-mono text-[10px] space-y-2 max-w-sm animate-in slide-in-from-bottom-5 duration-300",
        alertPopup.severity === "Critical" ? "bg-red-955 text-red-400 border-red-500/40 bg-red-950/95" :
        alertPopup.severity === "High" ? "bg-amber-955 text-amber-500 border-amber-500/30 bg-amber-950/95" :
        "bg-indigo-955 text-indigo-400 border-indigo-500/20 bg-indigo-950/95"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <Flame size={12} className="animate-pulse" /> {alertPopup.severity} TELEMETRY
        </span>
        <button onClick={onClose} className="hover:text-white cursor-pointer p-0.5">
          <X size={10} />
        </button>
      </div>
      <p className="font-bold text-slate-100 uppercase">{alertPopup.title}</p>
      <p className="text-slate-300 uppercase leading-snug">{alertPopup.message}</p>
    </div>
  );
};
