import React, { useState } from "react";
import { z } from "zod";
import { FileCheck, Activity, ShieldCheck, HelpCircle, ToggleLeft, ClipboardCheck, Lock, Check } from "lucide-react";
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
  onChange: (path: string, value: any) => void;
  onToast?: (message: string, type: any) => void;
}

export function AuditCompliance({ data, onChange, onToast }: AuditComplianceProps) {
  const [checklist, setChecklist] = useState({
    auditSsl: true,
    blockPlainSockets: false,
    enforceMfa: true,
    restrictRootApi: true,
  });

  const handleToggleChecklist = (field: keyof typeof checklist) => {
    const nextVal = !checklist[field];
    setChecklist(prev => ({ ...prev, [field]: nextVal }));
    if (onToast) {
      onToast(`COMPLIANCE RULE: ${String(field).toUpperCase()} HAS BEEN ${nextVal ? "ARMED" : "BYPASSED"}`, "info");
    }
  };

  const handleToggle = (field: keyof AuditComplianceType, currentVal: boolean) => {
    onChange(`compliance.${field}`, !currentVal);
    onToast?.(`COMPLIANCE PARAMETER UPDATED: ${String(field).toUpperCase()}`, "success");
  };

  const handleDropdown = (val: any) => {
    onChange("compliance.complianceMapping", val);
    onToast?.(`COMPLIANCE FRAMEWORK CHANGED TO: ${val}`, "info");
  };

  const handleNumberChange = (val: string) => {
    onChange("compliance.auditLogRetention", parseInt(val, 10) || 5);
  };

  return (
    <div className="space-y-6" id="audit-compliance-panel">
      {/* Detail Labeling */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-500" />
          Audit & Compliance Settings Management
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Review regulatory policy frameworks coordinates, change tracking bounds, audit retention ages, and internal policies checklist items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px] uppercase">
        
        {/* Left Column: Regulatory Framework and Retention */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Lock className="w-3.5 h-3.5 text-cyan-500" />
              Standard Compliance Framework
            </h4>

            {/* Compliance mapping selector */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Target Compliance Framework</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                value={data.complianceMapping || "NIST SP 800-53"}
                onChange={(e) => handleDropdown(e.target.value)}
              >
                <option value="NIST SP 800-53">NIST SP 800-53 (US Goverment Cyber standard)</option>
                <option value="ISO 27001">ISO/IEC 27001:2022 (International ISMS standard)</option>
                <option value="SOC2 Type II">SOC2 Type II (SaaS trust service parameters)</option>
                <option value="CIS Controls">CIS Controls v8 (Critical security guidelines)</option>
              </select>
            </div>

            {/* Audit log retention */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Signed Audit Log Retention Age (Years)</label>
              <input
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-bold"
                value={data.auditLogRetention || 3}
                onChange={(e) => handleNumberChange(e.target.value)}
              />
              <span className="text-[7.5px] text-zinc-500 block leading-normal font-mono">
                System administrative action records are maintained in secure hash archives for this timeframe.
              </span>
            </div>

            <div className="space-y-3.5 border-t border-border/10 pt-4">
              {/* Config change tracking toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-black text-slate-900 dark:text-white block font-mono">Active Configuration Change Trace</span>
                  <span className="text-[7.5px] block font-normal text-slate-400 leading-none">Triggers logging for setting overrides</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("trackConfigChanges", data.trackConfigChanges)}
                  className={cn(
                    "w-10 h-5 rounded-full transition relative cursor-pointer border-none",
                    data.trackConfigChanges ? "bg-cyan-600" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    data.trackConfigChanges ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              {/* MITRE Coverage Tracking Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-black text-slate-900 dark:text-white block font-mono">MITRE Technique Mapping Log</span>
                  <span className="text-[7.5px] block font-normal text-slate-400 leading-none">Export coverage indexes dynamically</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("mitreTrackingEnabled", data.mitreTrackingEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full transition relative cursor-pointer border-none",
                    data.mitreTrackingEnabled ? "bg-cyan-600" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    data.mitreTrackingEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Internal Policy Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-cyan-500" />
              Internal Enforcement Settings
            </h4>

            <p className="text-[8px] text-slate-500 normal-case tracking-normal mb-1">
              Configure parameters related to automatic policy validation across host nodes:
            </p>

            <div className="space-y-2.5">
              {[
                { title: "Enforce TLS v1.3 Ingress Handshakes", field: "auditSsl", desc: "Forbid legacy SSL v3 and TLS v1.0 clients completely" },
                { title: "Block Plain Insecure WebSocket Sockets", field: "blockPlainSockets", desc: "Accept only encrypted wss:// connections" },
                { title: "Enforce Absolute MFA for Administrators", field: "enforceMfa", desc: "No bypass allowed for local administration network routes" },
                { title: "Restrict Host Kernel Raw API Logs access", field: "restrictRootApi", desc: "Prevent general non-root terminal requests" },
              ].map((item) => {
                const val = (checklist as any)[item.field];
                return (
                  <div
                    key={item.field}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 border border-border/50 hover:border-cyan-500/25 p-2 rounded-lg transition"
                  >
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-900 dark:text-white block">{item.title}</span>
                      <span className="text-[7.5px] text-zinc-500 block font-semibold leading-tight capitalize tracking-wide">{item.desc}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(item.field as any)}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition",
                        val ? "bg-cyan-500 border-cyan-500 text-slate-950" : "border-border bg-transparent"
                      )}
                    >
                      {val && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
