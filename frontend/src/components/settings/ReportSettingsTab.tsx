import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "../../lib/utils";
import { SettingsStateData } from "./settingsConfig";

interface ReportSettingsTabProps {
  data: SettingsStateData;
  onChange: (path: string, value: any) => void;
}

export function ReportSettingsTab({ data, onChange }: ReportSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
          System Scheduled Reports & Exports
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Pick target export schemas, declare compile intervals, and toggle autogeneration triggers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/40 border border-border/70 rounded-xl p-5 shadow-sm text-[10px] font-mono">
        {/* Export format */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Default Export Format Schema
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["PDF", "CSV", "JSON"] as const).map((format) => (
              <button
                key={format}
                onClick={() => onChange("reportFormat", format)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.reportFormat === format
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {format} file
              </button>
            ))}
          </div>
        </div>

        {/* Schedule interval */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Scheduled Recurrence Compile
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Daily", "Weekly", "Monthly"] as const).map((sched) => (
              <button
                key={sched}
                onClick={() => onChange("reportSchedule", sched)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.reportSchedule === sched
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {sched}
              </button>
            ))}
          </div>
        </div>

        {/* Auto generate */}
        <div className="space-y-2 md:col-span-2 pt-2">
          <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border/80 rounded-xl">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider block">COMPILE SCHEDULERS AUTOMATICALLY</span>
              <span className="text-[8px] text-muted-foreground uppercase mt-0.5 block">Saves pdf/csv reports in secure AWS S3 bucket logs directly.</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onChange("reportAutoGenerate", true)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all",
                  data.reportAutoGenerate
                    ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
                    : "bg-muted text-muted-foreground border-border/80"
                )}
              >
                Enable
              </button>
              <button
                onClick={() => onChange("reportAutoGenerate", false)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all",
                  !data.reportAutoGenerate
                    ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
                    : "bg-muted text-muted-foreground border-border/80"
                )}
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
