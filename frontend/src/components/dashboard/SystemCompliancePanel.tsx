import React from "react";
import { CheckCircle2, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

interface ComplianceFeature {
  name: string;
  metric: string;
  completionPct: number;
}

export function SystemCompliancePanel() {
  const features: ComplianceFeature[] = [
    { name: "Zeek-first Ingestion Architecture", metric: "Active & Synced", completionPct: 100 },
    { name: "AI1 Global Outlier Filtering Module", metric: "ONNX Runtime Integration v3.1", completionPct: 100 },
    { name: "AI2A Local Zeek Classifier Module", metric: "ONNX Runtime Integration v3.0", completionPct: 100 },
    { name: "AI2B Public Dataset Matcher Module", metric: "ONNX Runtime Integration v3.0", completionPct: 100 },
    { name: "Correlation Fusion Layer Synthesis", metric: "Neural Verdict Consensus Model", completionPct: 100 },
    { name: "Population Drift Stability (PSI/KS)", metric: "Negligible Drift Verified", completionPct: 100 },
    { name: "Cross-correlated Threat Incident Mapping", metric: "Live Dynamic Campaigns", completionPct: 100 },
    { name: "MITRE ATT&CK Matrix Decoration", metric: "Full Framework Compliance", completionPct: 100 },
    { name: "Real-time Responsive SOC Dashboard", metric: "v3.0 Live Subsystems Operational", completionPct: 100 },
    { name: "Segmented AWS Processing Pipeline", metric: "Simulated SQS/S3 Log Ingestion", completionPct: 100 },
    { name: "Incident Report Export Subsystem", metric: "Fully Functional export capabilities", completionPct: 100 }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          SECTION 40: FCAJ V3.0 SYSTEM COMPLIANCE SUMMARY CHECKLIST
        </h3>
        <span className="text-[7.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          ALL MODULES STABLE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {features.map((feat) => {
          return (
            <div 
              key={feat.name} 
              className="bg-secondary/40 border border-border/75 rounded-xl p-3 flex items-center justify-between font-mono"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 select-none" />
                <div className="min-w-0">
                  <span className="text-[8.5px] font-black text-foreground block truncate">{feat.name}</span>
                  <span className="text-[6.5px] text-muted-foreground mt-0.5 block uppercase font-bold">{feat.metric}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9.5px] font-black text-emerald-500">{feat.completionPct}%</span>
                <span className="text-[6px] text-emerald-500/80 block uppercase font-black">COMPLIANT</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemCompliancePanel;
