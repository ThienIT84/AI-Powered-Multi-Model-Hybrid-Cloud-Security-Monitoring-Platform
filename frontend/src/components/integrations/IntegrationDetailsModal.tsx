import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { FCAJIntegrationItem } from "./integrationFCAJData";

interface IntegrationDetailsModalProps {
  isDarkMode: boolean;
  selectedIntegration: FCAJIntegrationItem | null;
  onClose: () => void;
}

export function IntegrationDetailsModal({ isDarkMode, selectedIntegration, onClose }: IntegrationDetailsModalProps) {
  if (!selectedIntegration) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl p-5 rounded-2xl border border-border bg-card text-foreground font-mono text-[10px] space-y-4 shadow-2xl relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full cursor-pointer"
        >
          <X size={15} />
        </button>

        <div className="border-b pb-3 border-border/60 space-y-1">
          <span className="text-[8.5px] uppercase tracking-widest text-[#94a3b8] font-bold">{selectedIntegration.category}</span>
          <h2 className="text-sm font-black uppercase tracking-wider text-cyan-500 dark:text-cyan-400">{selectedIntegration.name}</h2>
          <p className="text-[8.5px] text-muted-foreground">Compliance Code Integration Target: {selectedIntegration.version}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-[9px] uppercase font-bold text-muted-foreground">Technical Specs Mapping</h3>
          <div className="grid grid-cols-2 gap-2 bg-muted/70 p-3 rounded-lg border border-border/60">
            {Object.entries(selectedIntegration.specs).map(([k, v]) => (
              <div key={k} className="space-y-0.5">
                <span className="text-[8px] text-muted-foreground/80 uppercase block">{k}</span>
                <span className="font-extrabold uppercase text-foreground/90">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[9px] uppercase font-bold text-muted-foreground">Current Telemetry Metrics</h3>
          <div className="grid grid-cols-3 gap-2">
            {selectedIntegration.metrics.map((m, idx) => (
              <div key={idx} className="p-3 bg-muted/50 border border-border/50 rounded-lg text-center">
                <span className="text-[8px] text-muted-foreground block mb-1 uppercase tracking-tight leading-none">{m.label}</span>
                <span className="font-mono text-foreground font-extrabold text-xs block">{m.value}</span>
                <span className="text-[7.5px] text-emerald-500 block uppercase mt-1">{m.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[9px] uppercase font-bold text-muted-foreground">Pipeline Dependencies</h3>
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 uppercase text-[8.5px]">Local Lab Network Tap</span>
            <span className="p-0.5 text-muted-foreground font-bold">→</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 uppercase text-[8.5px]">{selectedIntegration.id} parser</span>
            <span className="p-0.5 text-muted-foreground font-bold">→</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 uppercase text-[8.5px]">AWS SQS stream</span>
          </div>
        </div>

        <div className="border-t pt-3 border-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground uppercase text-[9px] font-bold rounded-lg cursor-pointer border border-border"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
