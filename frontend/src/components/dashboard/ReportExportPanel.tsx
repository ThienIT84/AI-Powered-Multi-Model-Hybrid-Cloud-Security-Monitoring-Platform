import React, { useState } from "react";
import { Download, FileDown, CheckCircle, Database } from "lucide-react";
import { cn } from "../../lib/utils";

export function ReportExportPanel() {
  const [exportType, setExportType] = useState<"CSV" | "JSON" | "PDF">("PDF");
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = (reportName: string) => {
    setIsExporting(true);
    setSuccess(false);
    setTimeout(() => {
      setIsExporting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <FileDown className="w-4 h-4 text-cyan-500 animate-pulse" />
          SOC REPORT AUDIT EXPORT CONSOLE
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2.5 py-0.5 rounded uppercase font-black font-mono">
          EXPORTER
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4 p-1">
        
        {/* Toggle option buttons */}
        <div className="flex items-center gap-1.5 select-none leading-none font-mono">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest pl-1">FORMAT FRAME:</span>
          {/* Format buttons */}
          <div className="flex bg-muted border border-border p-0.5 rounded-lg">
            {(["CSV", "JSON", "PDF"] as const).map(f => (
              <button
                key={f}
                onClick={() => setExportType(f)}
                className={cn(
                  "px-2 py-0.5 text-[8.5px] font-black uppercase rounded cursor-pointer transition-all",
                  exportType === f 
                    ? "bg-cyan-500 text-white shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons List to trigger reports download */}
        <div className="space-y-2.5 select-none font-mono text-[9px] leading-none font-bold">
          <button
            onClick={() => handleExport("SOC Security Analytics Summary")}
            disabled={isExporting}
            className="w-full bg-secondary/40 hover:bg-secondary/70 border border-border/80 px-3 py-2 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <span>Executive Security Summary</span>
            <Download size={12} className="text-cyan-500" />
          </button>

          <button
            onClick={() => handleExport("AI Fusion Decision Log Report")}
            disabled={isExporting}
            className="w-full bg-secondary/40 hover:bg-secondary/70 border border-border/80 px-3 py-2 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <span>SOC Decision Coherence Log</span>
            <Download size={12} className="text-cyan-500" />
          </button>

          <button
            onClick={() => handleExport("Active Correlated Campaign Audit")}
            disabled={isExporting}
            className="w-full bg-secondary/40 hover:bg-secondary/70 border border-border/80 px-3 py-2 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <span>Incident Campaign Verification</span>
            <Download size={12} className="text-purple-400" />
          </button>
        </div>

        {isExporting && (
          <div className="text-center text-[8px] font-mono text-cyan-400 font-bold animate-pulse leading-none uppercase">
             Compiling security records & generating download streams...
          </div>
        )}

        {success && (
          <div className="text-center text-[8px] font-mono text-emerald-400 font-extrabold flex items-center justify-center gap-1 leading-none uppercase">
             <CheckCircle size={10} />
             Download sequence launched successfully in {exportType} format!
          </div>
        )}

      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>COLLECTED META COMPATIBLE DATA</span>
        <span>Secure Vault download</span>
      </div>
    </div>
  );
}

export default ReportExportPanel;
