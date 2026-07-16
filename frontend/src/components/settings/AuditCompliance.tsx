import { AlertTriangle, FileCheck, Lock, Settings2 } from "lucide-react";
import { z } from "zod";
import { cn } from "../../lib/utils";

export const auditComplianceSchema = z.object({
  auditLogRetention: z.number().min(1, "Minimum log retention is 1 year").max(10, "Maximum log retention is 10 years"),
  trackConfigChanges: z.boolean(),
  complianceMapping: z.enum(["NIST SP 800-53", "ISO 27001", "SOC2 Type II", "CIS Controls"]),
  mitreTrackingEnabled: z.boolean(),
  enableDailyPolicyValidation: z.boolean(),
});

export type AuditComplianceType = z.infer<typeof auditComplianceSchema>;

interface AuditComplianceProps {
  data: AuditComplianceType;
  onChange: (path: string, value: unknown) => void;
  onToast?: (message: string, type: "success" | "warning" | "info") => void;
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function PreferenceToggle({ label, description, checked, onToggle }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/40">
      <div>
        <span className="block text-[9px] font-extrabold text-slate-900 dark:text-white">{label}</span>
        <span className="mt-0.5 block text-[7.5px] normal-case leading-relaxed text-zinc-500">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "relative h-5 w-10 shrink-0 rounded-full border transition",
          checked ? "border-cyan-500 bg-cyan-600" : "border-border bg-zinc-800",
        )}
      >
        <span className={cn(
          "absolute top-1 h-3 w-3 rounded-full bg-white transition-all",
          checked ? "right-1" : "left-1",
        )} />
      </button>
    </div>
  );
}

export function AuditCompliance({ data, onChange, onToast }: AuditComplianceProps) {
  const update = (field: keyof AuditComplianceType, value: AuditComplianceType[keyof AuditComplianceType]) => {
    onChange(`compliance.${field}`, value);
    onToast?.("Compliance preference updated. Enforcement status remains unverified.", "info");
  };

  return (
    <div className="space-y-6" id="audit-compliance-panel">
      <div>
        <h3 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
          <FileCheck className="h-4 w-4 text-cyan-500" />
          Audit &amp; Compliance Preferences
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Saved administrative preferences only; this screen does not verify infrastructure enforcement or certification.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 font-mono">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-foreground">Enforcement status unavailable</p>
          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            No policy-validation API reports TLS, MFA, root-access, audit-log, or compliance-control enforcement. Toggle values below are preferences persisted by the settings API, not proof that a control is active.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 font-mono text-[9px] uppercase lg:grid-cols-2">
        <section className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h4 className="flex items-center gap-2 border-b border-border/40 pb-2.5 text-xs font-bold tracking-wider text-slate-900 dark:text-white">
            <Lock className="h-3.5 w-3.5 text-cyan-500" /> Preference record
          </h4>

          <label className="block space-y-1.5">
            <span className="block text-[8.5px] font-bold text-[#64748b]">Target framework label</span>
            <select
              value={data.complianceMapping}
              onChange={(event) => update("complianceMapping", event.target.value as AuditComplianceType["complianceMapping"])}
              className="w-full rounded-lg border border-border/80 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-cyan-500 dark:bg-slate-900/50"
            >
              <option value="NIST SP 800-53">NIST SP 800-53</option>
              <option value="ISO 27001">ISO/IEC 27001</option>
              <option value="SOC2 Type II">SOC 2 Type II</option>
              <option value="CIS Controls">CIS Controls</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="block text-[8.5px] font-bold text-[#64748b]">Requested audit retention (years)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={data.auditLogRetention}
              onChange={(event) => update("auditLogRetention", Number.parseInt(event.target.value, 10) || 1)}
              className="w-full rounded-lg border border-border/80 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-cyan-500 dark:bg-slate-900/50"
            />
            <span className="block text-[7.5px] normal-case leading-relaxed text-zinc-500">
              The retention worker and underlying storage policy are not verified here.
            </span>
          </label>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h4 className="flex items-center gap-2 border-b border-border/40 pb-2.5 text-xs font-bold tracking-wider text-slate-900 dark:text-white">
            <Settings2 className="h-3.5 w-3.5 text-cyan-500" /> Requested behavior
          </h4>
          <PreferenceToggle
            label="Track configuration changes"
            description="Request audit entries for settings changes when backend support is configured."
            checked={data.trackConfigChanges}
            onToggle={() => update("trackConfigChanges", !data.trackConfigChanges)}
          />
          <PreferenceToggle
            label="Record MITRE mapping coverage"
            description="Request coverage tracking; no coverage index is fabricated in the browser."
            checked={data.mitreTrackingEnabled}
            onToggle={() => update("mitreTrackingEnabled", !data.mitreTrackingEnabled)}
          />
          <PreferenceToggle
            label="Request daily policy validation"
            description="Stores the requested schedule only; execution remains unavailable until a backend worker reports it."
            checked={data.enableDailyPolicyValidation}
            onToggle={() => update("enableDailyPolicyValidation", !data.enableDailyPolicyValidation)}
          />
        </section>
      </div>
    </div>
  );
}
