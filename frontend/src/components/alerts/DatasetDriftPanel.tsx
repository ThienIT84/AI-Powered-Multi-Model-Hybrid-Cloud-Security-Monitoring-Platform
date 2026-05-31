import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, BarChart3, RefreshCw, Layers } from "lucide-react";
import { cn } from "../../lib/utils";

export function DatasetDriftPanel() {
  const [isRetraining, setIsRetraining] = useState<Record<string, boolean>>({});

  const triggerRetraining = (modelKey: string) => {
    setIsRetraining(prev => ({ ...prev, [modelKey]: true }));
    setTimeout(() => {
      setIsRetraining(prev => ({ ...prev, [modelKey]: false }));
    }, 2800);
  };

  const models = [
    {
      key: "ai1",
      name: "AI1 Anomaly Model",
      psi: 0.08,
      status: "STABLE",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
      description: "Low distribution change. Baseline matches current active data stream."
    },
    {
      key: "ai2a",
      name: "AI2A Flow Classifier",
      psi: 0.18,
      status: "MODERATE DRIFT",
      color: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
      description: "Mild shift detected in connection duration parameters. Retraining recommended soon."
    },
    {
      key: "ai2b",
      name: "AI2B Payload Analyzer",
      psi: 0.29,
      status: "CRITICAL DRIFT",
      color: "border-red-500 bg-red-400/10 text-red-400",
      description: "Significant drift in HTTP request body lengths. Models require mandatory retraining!"
    }
  ];

  // SECTION 17: Public VS Zeek Telemetry Comparisons
  const comparisonFeatures = [
    {
      name: "Connection Duration (seconds)",
      publicDistribution: [12, 18, 42, 60, 24, 7],
      zeekDistribution: [15, 25, 48, 85, 38, 12],
    },
    {
      name: "Outbound Byte ratio (orig_bytes / resp_bytes)",
      publicDistribution: [40, 52, 28, 12, 5, 2],
      zeekDistribution: [22, 38, 45, 62, 50, 15],
    }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* PSI score summary matrix cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map(m => {
          const isStable = m.status === "STABLE";
          const isCritical = m.status === "CRITICAL DRIFT";

          return (
            <div key={m.key} className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-wide truncate max-w-37.5">{m.name}</h4>
                  <span className="font-mono text-[7px] text-muted-foreground uppercase">Pop Drift Index</span>
                </div>
                <span className={cn("text-[7px] font-black uppercase font-mono px-1.5 py-0.5 border rounded", m.color)}>
                  {m.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-foreground leading-none">{m.psi.toFixed(2)}</span>
                <span className="text-[7.5px] font-mono text-muted-foreground/80 font-bold uppercase">PSI Score</span>
              </div>

              <p className="text-[8.5px] text-muted-foreground leading-normal font-medium">{m.description}</p>

              {/* RETRAINING ALERTS AND CONTROLS (SECTION 16 Requirements) */}
              <button
                onClick={() => triggerRetraining(m.key)}
                disabled={isRetraining[m.key]}
                className="w-full text-center p-2 rounded-lg bg-secondary border border-border hover:bg-muted text-[8.5px] font-black uppercase tracking-wider text-foreground hover:border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={11} className={cn(isRetraining[m.key] ? "animate-spin text-cyan-500" : "text-muted-foreground")} />
                {isRetraining[m.key] ? "Retraining Epochs Active..." : "Queue retraining pipeline"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Target 17 Comparison Metrics histograms histograms */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
          <Layers size={14} className="text-cyan-500" />
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
            Public Dataset Baseline vs Active Zeek Ingestion Histograms
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonFeatures.map((feat, fIdx) => (
            <div key={fIdx} className="space-y-3 bg-secondary/15 p-3 rounded-lg border border-border/40">
              <span className="text-[8.5px] font-black uppercase text-foreground leading-none block">{feat.name}</span>

              {/* Simplified high-fidelity distribution comparison chart in CSS bar nodes */}
              <div className="h-28 flex items-end gap-3.5 pt-4 px-2 relative border-b border-border">
                {feat.publicDistribution.map((pubVal, barIdx) => {
                  const zeekVal = feat.zeekDistribution[barIdx] || 10;
                  const maxVal = 100;

                  return (
                    <div key={barIdx} className="flex-1 flex gap-1 items-end h-full group relative">
                      {/* Public source bar */}
                      <div 
                        className="bg-muted-foreground/35 w-full hover:bg-muted-foreground/50 transition-colors cursor-help rounded-t-sm"
                        style={{ height: `${(pubVal / maxVal) * 100}%` }}
                        title={`Baseline: ${pubVal}%`}
                      />
                      {/* Current active Zeek server bar */}
                      <div 
                        className="bg-cyan-500 w-full hover:bg-cyan-400 transition-colors cursor-help rounded-t-sm"
                        style={{ height: `${(zeekVal / maxVal) * 100}%` }}
                        title={`Zeek: ${zeekVal}%`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Legend indicators */}
              <div className="flex justify-between text-[7px] font-mono text-muted-foreground/80 font-bold uppercase px-1 leading-none">
                <span className="flex items-center gap-1"><span className="w-2 h-1 bg-muted-foreground/40 rounded-sm" /> Public Baseline (KDD/CSE)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-1 bg-cyan-500 rounded-sm" /> Client Zeek Stream</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DatasetDriftPanel;
