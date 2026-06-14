import React, { useState } from "react";
import { FileText, Download, Briefcase, FileSignature, AlertTriangle, ShieldCheck, Check } from "lucide-react";

interface ReportExportCenterProps {
  triggerExportSimulation: (title: string, format: string) => void;
  timeframe: string;
}

export const ReportExportCenter: React.FC<ReportExportCenterProps> = React.memo(({
  triggerExportSimulation,
  timeframe
}) => {
  const [selectedFormat, setSelectedFormat] = useState<Record<string, "PDF" | "CSV" | "JSON">>({
    exec: "PDF",
    secops: "PDF",
    compliance: "PDF",
    cases: "PDF",
    threats: "PDF"
  });

  const reportsList = [
    {
      id: "exec",
      title: "Executive PDF Report",
      desc: "Comprehensive security operations posture and assessment overview for C-level executives & stakeholders.",
      icon: <Briefcase className="w-5 h-5 text-cyan-500" />,
      colorClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
    },
    {
      id: "secops",
      title: "Security Operations Report",
      desc: "Detailed telemetry regarding network, endpoint, and server threats, along with raw malicious payload dumps.",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    },
    {
      id: "compliance",
      title: "Compliance Audit Report",
      desc: "Audit-ready logs retention documentation, system security control statuses, and mapped SOC framework matrices.",
      icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      id: "cases",
      title: "Case Management Report",
      desc: "Operational throughput metrics, average ticket resolution SLAs, and analyst productivity details.",
      icon: <FileSignature className="w-5 h-5 text-yellow-500" />,
      colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    },
    {
      id: "threats",
      title: "Threat Activity Summary",
      desc: "Consolidated summaries of top attacking IPs, countries, destination web services, and attack severity percentages.",
      icon: <FileText className="w-5 h-5 text-emerald-500" />,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
    }
  ];

  const handleFormatChange = (reportId: string, format: "PDF" | "CSV" | "JSON") => {
    setSelectedFormat(prev => ({
      ...prev,
      [reportId]: format
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="report-export-center">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-md">
        
        <div className="border-b border-border/20 pb-3">
          <h3 className="text-sm font-sans font-black text-foreground uppercase tracking-wider block">
            Executive Security Reports Export Center
          </h3>
          <p className="text-[10px] uppercase font-mono tracking-wide text-zinc-500 mt-1">
            Build, sign, and download auditable report briefs. All files contain digital signatures and TLS checksum verification metadata.
          </p>
        </div>

        <div className="space-y-4 font-mono text-[9px]">
          
          {reportsList.map((item) => {
            const currentF = selectedFormat[item.id] || "PDF";
            return (
              <div 
                key={item.id}
                className="bg-secondary/10 hover:bg-secondary/20 border border-border/40 p-4.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition duration-150"
              >
                <div className="flex items-start gap-4 max-w-xl">
                  <span className={`p-2 rounded-lg shrink-0 inline-block border border-border/15 ${item.colorClass}`}>
                    {item.icon}
                  </span>
                  <div className="space-y-1">
                    <p className="font-black text-foreground uppercase text-[10.5px]">
                      {item.title}
                    </p>
                    <p className="text-[8px] text-zinc-500 uppercase leading-relaxed font-semibold">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="bg-background border border-border/30 rounded flex overflow-hidden p-0.5">
                    {(["PDF", "CSV", "JSON"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleFormatChange(item.id, fmt)}
                        className={`px-2.5 py-1 text-[8px] uppercase tracking-wider font-black select-none border-none transition-all ${currentF === fmt ? "bg-cyan-500 text-slate-950 font-black" : "text-zinc-500 hover:text-zinc-300"}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => triggerExportSimulation(`${item.title} (${timeframe})`, currentF)}
                    className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/30 transition-all font-black px-4 py-2 rounded text-[8.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    <span>Compile</span>
                  </button>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      <div className="p-4 bg-secondary/15 border border-border/30 rounded-xl text-[8px] uppercase font-mono tracking-widest text-zinc-500 text-center select-none">
        Cryptographic fingerprinting: SHA-256 validation enabled for general regulatory auditing procedures.
      </div>
    </div>
  );
});
