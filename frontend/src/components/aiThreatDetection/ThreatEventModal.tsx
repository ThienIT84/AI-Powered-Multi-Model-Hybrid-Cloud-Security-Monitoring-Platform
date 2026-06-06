import React from "react";
import { Database, Cpu, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { ThreatEvent, GraphColors } from "./types";
import { SeverityBadge } from "./SeverityBadge";

export interface ThreatEventModalProps {
  selectedEvent: ThreatEvent | null;
  onClose: () => void;
  graphColors: GraphColors;
}

export function ThreatEventModal({
  selectedEvent,
  onClose,
  graphColors
}: ThreatEventModalProps) {
  if (!selectedEvent) return null;

  return (
    <div className="bg-card w-full border border-border/90 rounded-2xl p-5 shadow-sm relative h-full flex flex-col justify-between overflow-y-auto max-h-110 font-sans leading-normal text-foreground custom-scrollbar">
      {/* Panel header with threat details */}
      <div className="border-b border-border/60 pb-3 mb-4 space-y-1 relative pr-16 bg-card">
        <div className="flex items-center gap-1.5 bg-card">
          <SeverityBadge severity={selectedEvent.severity} />
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">
            ID: {selectedEvent.id}
          </span>
        </div>
        <h3 className="text-sm font-black uppercase text-slate-800 dark:text-zinc-100 mt-1 leading-snug">
          {selectedEvent.attackType}
        </h3>
        <p className="text-[8.5px] font-mono text-muted-foreground uppercase mt-0.5">
          TS: {selectedEvent.timestamp}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground uppercase mt-0.5">
          Src: {selectedEvent.source} → Dst: {selectedEvent.destination}
        </p>

        {/* Close/Minimize button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-1.5 border border-red-500/10 hover:bg-red-500/10 text-[8px] uppercase font-mono font-black tracking-widest text-critical rounded-md cursor-pointer transition-all bg-transparent"
        >
          Hide panel ×
        </button>
      </div>

      {/* Decision Flow Pipeline Pathway */}
      <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-border/60 mb-4 font-mono">
        <span className="text-[8.5px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
          Decision Pathway
        </span>
        
        {/* Compact stacked flow */}
        <div className="grid grid-cols-2 gap-2 text-[8px] uppercase">
          {/* Step 1: Ingestion */}
          <div className="p-1.5 border border-border rounded bg-background">
            <span className="text-[6.5px] text-muted-foreground block">1. Ingest Log</span>
            <span className="font-bold text-foreground truncate block">{selectedEvent.zeekEvidence.logType}</span>
          </div>

          {/* Step 2: AI1 Anomaly */}
          <div className="p-1.5 border border-border rounded bg-background">
            <span className="text-[6.5px] text-muted-foreground block">2. AI1 Anomaly</span>
            <span className="font-bold text-cyan-500 animate-pulse block">{selectedEvent.aiResults.ai1AnomalyScore}%</span>
          </div>

          {/* Step 3: Classifier */}
          <div className="p-1.5 border border-border rounded bg-background">
            <span className="text-[6.5px] text-slate-400 block">3. Multi-Classifier</span>
            <span className="font-bold text-violet-500 block">
              {selectedEvent.zeekEvidence.logType === "http.log" ? selectedEvent.aiResults.ai2bHttpSemantic.prob : selectedEvent.aiResults.ai2aClassifier.prob}%
            </span>
          </div>

          {/* Step 4: Suricata Evidence */}
          <div className="p-1.5 border border-border rounded bg-background">
            <span className="text-[6.5px] text-muted-foreground block">4. Threat Signature</span>
            <span className={cn("font-bold block", selectedEvent.suricataEvidence.matched ? "text-amber-500" : "text-zinc-500")}>
              {selectedEvent.suricataEvidence.matched ? "MATCHED" : "EVADED"}
            </span>
          </div>
        </div>

        {/* Dynamic Highlight: Step 5: Fusion Consensus */}
        <div className="mt-2.5 p-2 bg-amber-500/10 dark:bg-zinc-900/90 border border-amber-500/50 rounded-xl relative shadow-[0_0_8px_rgba(234,179,8,0.2)]">
          <span className="text-[6.5px] text-amber-600 dark:text-yellow-500 block font-bold uppercase">5. FUSION decision</span>
          <span className="text-[9.5px] font-black text-amber-600 dark:text-cyan-400">{selectedEvent.riskScore}% Critical intensity consensus</span>
        </div>
      </div>

      {/* Sub-Evidences Section */}
      <div className="space-y-3 font-mono text-[8.5px] mb-4">
        {/* Neural Classifier Indicators */}
        <div className="border border-border/60 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-1 pb-1 border-b border-border/40 text-violet-500 font-bold">
            <Cpu size={10} /> Neural Classification Indicators
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase">AI1 Anomaly score:</span>
              <strong className="text-foreground">{selectedEvent.aiResults.ai1AnomalyScore}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase">AI2A XGBoost Class:</span>
              <strong className="text-foreground">
                {selectedEvent.aiResults.ai2aClassifier.label} ({selectedEvent.aiResults.ai2aClassifier.prob}%)
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase">AI2B CharCNN Semantic:</span>
              <strong className="text-foreground">
                {selectedEvent.aiResults.ai2bHttpSemantic.label} ({selectedEvent.aiResults.ai2bHttpSemantic.prob}%)
              </strong>
            </div>
          </div>
        </div>

        {/* Zeek Log attributes dump */}
        <div className="border border-border/60 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-1 mb-2 pb-1 border-b border-border/40 text-cyan-500 font-bold">
            <Database size={10} /> Raw Zeek Meta Packet Dump
          </div>
          <pre className="text-[7.5px] text-muted-foreground bg-zinc-100 dark:bg-black/40 p-2.5 rounded-lg overflow-x-auto leading-relaxed max-h-36">
            {JSON.stringify(selectedEvent.zeekEvidence.fields, null, 2)}
          </pre>
        </div>
      </div>

      {/* MITRE Mapping & Playbook recommendations */}
      <div className="space-y-3 font-mono text-[8.5px] leading-normal">
        {/* MITRE ATT&CK Framework */}
        <div className="border border-border/60 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
          <div className="flex items-center gap-1 pb-1 border-b border-border/40 text-amber-500 font-bold">
            <Shield size={10} /> MITRE ATT&amp;CK Alignment
          </div>
          <div>
            <span className="text-[7.5px] text-muted-foreground block uppercase font-black font-mono">Technique ID: {selectedEvent.fusionDecision.mitreId}</span>
            <span className="text-foreground font-bold block">{selectedEvent.fusionDecision.mitreTechnique}</span>
          </div>
        </div>

        {/* Fusion Playbook mitigation */}
        <div className="border border-border/60 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
          <div className="flex items-center gap-1 pb-1 border-b border-border/40 text-rose-500 font-bold">
            <CheckCircle2 size={10} /> Playbook Action Plan
          </div>
          <p className="text-foreground leading-normal border border-dashed border-red-500/20 p-2 rounded bg-red-500/5">
            {selectedEvent.fusionDecision.remediationAction}
          </p>
        </div>
      </div>
    </div>
  );
}
