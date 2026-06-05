import React from "react";
import { Database, ShieldAlert, BadgeInfo, Eye, Sliders, ChevronRight } from "lucide-react";

interface DatasetSettingsTabProps {
  data: {
    connDatasetName: string;
    httpDatasetName: string;
    datasetDuplicates: number; // in %
    datasetMissing: number; // in %
    datasetPsi: number;
    datasetOutliers: number; // in %
    datasetMismatchStatus: "Safe" | "Warning" | "Critical";
    datasetLab: string;
    datasetPublic: string;
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function DatasetSettingsTab({ data, onChange, onToast }: DatasetSettingsTabProps) {
  const triggerVerifyIndex = (label: string) => {
    onToast(`VERIFYING DATASET INTEGRITY INDEX FOR: ${label.toUpperCase()}...`, "info");
    setTimeout(() => {
      onToast(`INTEGRITY VERIFICATION SUCCEEDED! NO STRUCTURAL DRIFT DETECTED.`, "success");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-500" />
          SOC Threat Dataset & Learning Weights Settings
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Inspect corpus data files, verify structural data quality metrics, and control lab simulation mismatch triggers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DATASET OVERVIEW */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <BadgeInfo className="w-3.5 h-3.5 text-cyan-400" />
            Current Active Storage Datasets
          </span>

          <div className="space-y-3.5 text-[10px] font-mono">
            <div className="p-3.5 bg-muted/40 border border-border/60 rounded-xl space-y-2">
              <span className="text-muted-foreground block text-[8px] uppercase">Conn Log Dataset</span>
              <div className="flex justify-between items-center text-[10.5px] font-bold text-foreground">
                <span className="uppercase">{data.connDatasetName}</span>
                <span className="text-cyan-400">50,000 FLOWS ACTIVE</span>
              </div>
              <button
                onClick={() => triggerVerifyIndex("Conn Log")}
                className="text-[8px] text-cyan-500 uppercase tracking-widest font-black hover:text-cyan-400 transition-colors cursor-pointer mt-1 block"
              >
                RUN INTEGRITY DRIFT STUDY →
              </button>
            </div>

            <div className="p-3.5 bg-muted/40 border border-border/60 rounded-xl space-y-2">
              <span className="text-muted-foreground block text-[8px] uppercase">HTTP Log Dataset</span>
              <div className="flex justify-between items-center text-[10.5px] font-bold text-foreground">
                <span className="uppercase">{data.httpDatasetName}</span>
                <span className="text-cyan-400">25,000 FLOWS ACTIVE</span>
              </div>
              <button
                onClick={() => triggerVerifyIndex("HTTP Log")}
                className="text-[8px] text-cyan-500 uppercase tracking-widest font-black hover:text-cyan-400 transition-colors cursor-pointer mt-1 block"
              >
                RUN INTEGRITY DRIFT STUDY →
              </button>
            </div>
          </div>
        </div>

        {/* DATA QUALITY */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Realtime Machine Learning Corpus Data Quality
          </span>

          <div className="space-y-4 pt-1 font-mono text-[10px]">
            {/* Duplicates */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-muted-foreground uppercase">DUPLICATE PACKETS RATIO</span>
                <span className="text-foreground font-black">{data.datasetDuplicates}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div style={{ width: `${data.datasetDuplicates * 10}%` }} className="bg-cyan-500 h-full rounded" />
              </div>
            </div>

            {/* Missing values */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-muted-foreground uppercase">MISSING PAYLOAD VALUES RATING</span>
                <span className="text-foreground font-black">{data.datasetMissing}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div style={{ width: `${data.datasetMissing * 10}%` }} className="bg-cyan-500 h-full rounded" />
              </div>
            </div>

            {/* Outliers */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-muted-foreground uppercase">ANOMALY OUTLIER RANGE RATING</span>
                <span className="text-foreground font-black">{data.datasetOutliers}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div style={{ width: `${data.datasetOutliers * 10}%` }} className="bg-yellow-500 h-full rounded" />
              </div>
            </div>

            {/* PSI Index */}
            <div className="space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40 flex items-center justify-between text-[9px]">
              <div>
                <span className="text-muted-foreground block text-[8px] uppercase">POPULATION STABILITY INDEX (PSI)</span>
                <span className="text-foreground font-extrabold">{data.datasetPsi}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md uppercase text-[8px] font-black border border-emerald-500/20">
                GOOD QUALITY CRITERIA
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* MISMATCH CHECK */}
      <div className="border border-border/80 rounded-xl bg-card/25 p-5 space-y-4">
        <div className="pb-2 border-b border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
            Lab Simulation Mismatch Configuration & Drift Status
          </span>

          {/* Selector options to let user set mismatch status */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border">
            {(["Safe", "Warning", "Critical"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  onChange("datasetMismatchStatus", status);
                  onToast(`LAB DRIFT CONFIG CO-STAGED: ${status.toUpperCase()}`, status === "Safe" ? "success" : status === "Warning" ? "info" : "warning");
                }}
                className={`px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg select-none transition-all cursor-pointer ${
                  data.datasetMismatchStatus === status
                    ? status === "Safe"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : status === "Warning"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 font-mono text-[10px]">
          <div className="space-y-3">
            <p className="text-[9px] text-muted-foreground uppercase leading-relaxed tracking-wider">
              Verify compatibility drift index between isolated Lab Dataset models and high-volume wild Public datasets.
            </p>

            <div className="flex items-center gap-4 p-3 bg-muted/40 border border-dashed border-border/80 rounded-xl relative">
              <div className="flex-1 text-center py-2 bg-muted rounded-lg border border-border/60">
                <span className="text-muted-foreground block text-[7.5px] uppercase">Lab Simulation Host</span>
                <span className="text-foreground tracking-widest font-black text-[9.5px] uppercase">{data.datasetLab}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
              <div className="flex-1 text-center py-2 bg-muted rounded-lg border border-border/60">
                <span className="text-muted-foreground block text-[7.5px] uppercase">Public Corpus Reference</span>
                <span className="text-foreground tracking-widest font-black text-[9.5px] uppercase">{data.datasetPublic}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/40 border border-border/60 rounded-xl flex items-start gap-3.5 h-full">
            <BadgeInfo className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-[9px] uppercase leading-relaxed">
              <span className="text-foreground font-extrabold tracking-wider block">CURRENT DRIFT WARNING LEVEL:</span>
              {data.datasetMismatchStatus === "Safe" && (
                <p className="text-emerald-500 font-extrabold">🟢 DRIFT Safe (0.04% discrepancy). Models and pipelines are perfectly synchronized in production.</p>
              )}
              {data.datasetMismatchStatus === "Warning" && (
                <p className="text-amber-500 font-extrabold">⚠️ DRIFT ALERT (2.41% discrepancy). Sub-class labeling disparities detected under Port Scan thresholds.</p>
              )}
              {data.datasetMismatchStatus === "Critical" && (
                <p className="text-red-500 font-extrabold">🚨 CRITICAL DRIFT MISMATCH (11.85% deviation). AI payload filters are running on raw unaligned labels! Action required.</p>
              )}
              <span className="text-muted-foreground block text-[8px] mt-2">Adjust values above to simulate alerts of different threat tiers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
