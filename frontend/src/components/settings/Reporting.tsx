import React from "react";
import { z } from "zod";
import { FileSpreadsheet, Download, Calendar, HardDrive, ShieldCheck, Mail } from "lucide-react";
import { cn } from "../../lib/utils";

export const reportingSettingsSchema = z.object({
  reportFormat: z.enum(["PDF", "CSV", "XLSX"]),
  reportSchedule: z.enum(["Daily", "Weekly", "Monthly"]),
  reportAutoGenerate: z.boolean(),
  reportRetentionMonths: z.number().min(1, "Retention must be at least 1 month").max(60, "Maximum retention is 60 months"),
  reportStoragePath: z.enum(["Local Secure Vault", "AWS S3 Glacier", "Enterprise Database"]),
  emailSubscribers: z.string(),
});

export type ReportingSettingsType = z.infer<typeof reportingSettingsSchema>;

interface ReportingSettingsProps {
  data: ReportingSettingsType;
  onChange: (path: string, value: any) => void;
  onToast?: (message: string, type: any) => void;
}

export function Reporting({ data, onChange, onToast }: ReportingSettingsProps) {

  const handleToggleAuto = () => {
    onChange("reports.reportAutoGenerate", !data.reportAutoGenerate);
    if (onToast) {
      onToast(`AUTOMATED GENERATIONS HAS BEEN ${!data.reportAutoGenerate ? "ENABLED" : "DISABLED"} FOR REPORTS`, "info");
    }
  };

  const handleDropdown = (field: keyof ReportingSettingsType, val: any) => {
    onChange(`reports.${field}`, val);
  };

  const handleNumberChange = (field: keyof ReportingSettingsType, val: string) => {
    onChange(`reports.${field}`, parseInt(val, 10) || 12);
  };

  return (
    <div className="space-y-6" id="reporting-settings-panel">
      {/* Detail labelling */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
          Reporting Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Administer default formatting presets, schedule chronologies, retention criteria, and target storage facilities of security compliance reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px] uppercase">
        
        {/* Left Card: Render styles & schedules */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              Document Formats & Schedules
            </h4>

            {/* Default Format Selector */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Default Render Compliance Format</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-border/80">
                {["PDF", "CSV", "XLSX"].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleDropdown("reportFormat", format as any)}
                    className={cn(
                      "flex-1 py-1 px-3 text-[10px] font-semibold uppercase rounded cursor-pointer transition",
                      data.reportFormat === format 
                        ? "bg-cyan-500 text-slate-950 font-black shadow-md border-transparent" 
                        : "text-slate-500 bg-transparent border-none"
                    )}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Schedule Frequency */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Automatic Synthesis Chronology</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                value={data.reportSchedule || "Weekly"}
                onChange={(e) => handleDropdown("reportSchedule", e.target.value as any)}
              >
                <option value="Daily">Daily Summary Render (Midnight UTC)</option>
                <option value="Weekly">Weekly System Performance Audits (Sunday)</option>
                <option value="Monthly">Monthly Legislative Overview audits (1st of month)</option>
              </select>
            </div>

            {/* Auto generate Toggle */}
            <div className="flex items-center justify-between border-t border-border/10 pt-3.5">
              <div>
                <span className="text-[9.5px] font-black text-slate-900 dark:text-white block font-mono">Activate Automated Generation</span>
                <span className="text-[7.5px] text-zinc-500 block normal-case">Runs report worker chronologically</span>
              </div>
              <button
                type="button"
                onClick={handleToggleAuto}
                className={cn(
                  "w-10 h-5 rounded-full transition relative cursor-pointer border-none",
                  data.reportAutoGenerate ? "bg-cyan-600" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  data.reportAutoGenerate ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Storage pathway & age retentions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
              Retention Policy & Storage Location
            </h4>

            {/* Retention in Months */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Signed Report Retention Age (Months)</label>
              <input
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-bold"
                value={data.reportRetentionMonths || 12}
                onChange={(e) => handleNumberChange("reportRetentionMonths", e.target.value)}
              />
              <span className="text-[7.5px] text-zinc-500 block font-semibold leading-normal font-mono">
                Report PDF logs are archived or pruned beyond this duration limit automatically.
              </span>
            </div>

            {/* Storage vault path dropdown */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Vault Storage Location Target</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                value={data.reportStoragePath || "Local Secure Vault"}
                onChange={(e) => handleDropdown("reportStoragePath", e.target.value as any)}
              >
                <option value="Local Secure Vault">Local Secure Storage Vault (/var/log/soc/reports)</option>
                <option value="AWS S3 Glacier">Amazon Cloud S3 Glacier (Cold archival storage)</option>
                <option value="Enterprise Database">PostgreSQL relational blob indices</option>
              </select>
            </div>

            {/* Email dispatch address list */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors border-t border-border/10 pt-3">
              <label className="text-[8.5px] font-bold text-[#64748b] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-500" />
                Dispatch Email Recipients (Comma Separated)
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-medium"
                value={data.emailSubscribers}
                placeholder="No recipients configured"
                onChange={(e) => handleDropdown("emailSubscribers", e.target.value)}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
