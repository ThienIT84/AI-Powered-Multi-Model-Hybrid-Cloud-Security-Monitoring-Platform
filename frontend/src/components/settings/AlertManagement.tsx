import React, { useState } from "react";
import { z } from "zod";
import { BellRing, Shield, Mail, MessageSquare, AlertCircle, Clock, Volume2, HardDrive, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export const alertManagementSchema = z.object({
  alertRetention: z.enum(["7 Days", "30 Days", "90 Days", "180 Days", "365 Days"]),
  alertAutoClose: z.boolean(),
  alertAutoCloseDuration: z.enum(["1h", "6h", "24h"]),
  soundCritical: z.boolean(),
  soundHigh: z.boolean(),
  soundMedium: z.boolean(),
  soundLow: z.boolean(),
  channelEmail: z.boolean(),
  channelSlack: z.boolean(),
  channelTeams: z.boolean(),
  escalateDelayCritical: z.number().min(0, "Minutes cannot be negative"),
  escalateDelayHigh: z.number().min(0),
  escalateDelayMedium: z.number().min(0),
});

export type AlertManagementType = z.infer<typeof alertManagementSchema>;

interface AlertManagementProps {
  data: AlertManagementType;
  onChange: (path: string, value: any) => void;
  onToast?: (message: string, type: any) => void;
}

export function AlertManagement({ data, onChange, onToast }: AlertManagementProps) {
  const [activeTab, setActiveTab] = useState<"retention" | "notifications" | "escalation">("retention");

  const handleToggle = (field: keyof AlertManagementType, currentVal: boolean) => {
    onChange(`alerts.${field}`, !currentVal);
    if (onToast) {
       onToast(`NOTIFICATION RULE UPDATED FOR: ${String(field).toUpperCase()}`, "info");
    }
  };

  const handleDropdownChange = (field: keyof AlertManagementType, value: any) => {
    onChange(`alerts.${field}`, value);
  };

  const handleNumberChange = (field: keyof AlertManagementType, value: string) => {
    onChange(`alerts.${field}`, parseInt(value, 10) || 0);
  };

  return (
    <div className="space-y-6" id="alert-management-panel">
      {/* Detail Labeling */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <BellRing className="w-4 h-4 text-cyan-500" />
          Alert Lifecycle & Notification Controls
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Administer data retention bounds of security alarms, toggles of notification channels, and active escalation delay parameters.
        </p>
      </div>

      {/* Internal Tabs Option Selection */}
      <div className="flex border-b border-border/40 gap-1 font-mono text-[9px] uppercase tracking-wider font-bold">
        {[
          { id: "retention", label: "Retention & Lifespan", icon: HardDrive },
          { id: "notifications", label: "Channels & Broadcast", icon: Mail },
          { id: "escalation", label: "Escalation Policy", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 flex items-center gap-2 rounded-t-lg transition border-b-2 cursor-pointer select-none",
                activeTab === tab.id 
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 font-black" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              )}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="font-mono text-[9px] uppercase">
        {/* TAB 1: RETENTION & LIFESPAN */}
        {activeTab === "retention" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="retention-sub-tab">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                Operational Log Storage Retention Policy
              </span>

              <div className="space-y-2">
                <label className="text-[8.5px] font-bold text-[#64748b] block">Alert Event Retention Age</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                  value={data.alertRetention || "30 Days"}
                  onChange={(e) => handleDropdownChange("alertRetention", e.target.value)}
                >
                  <option value="7 Days">7 Days (Short Sandbox Storage)</option>
                  <option value="30 Days">30 Days (Standard Audit Limit)</option>
                  <option value="90 Days">90 Days (QBR Assessment Cycle)</option>
                  <option value="180 Days">180 Days (Semi-annual Legislative)</option>
                  <option value="365 Days">365 Days (Full compliance index)</option>
                </select>
                <p className="text-[7.5px] mt-1 text-slate-400 leading-normal normal-case">
                  * Note: Events exceeding this retention age limit will be permanently deleted or moved to cold files storage automatically.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                Automated Incident Cleanups
              </span>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-[9.5px] font-black text-slate-900 dark:text-white block">Auto Close Resolved Incidents</span>
                  <span className="text-[7.5px] text-zinc-500 block">Close inactive ticket indicators</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("alertAutoClose", data.alertAutoClose)}
                  className={cn(
                    "w-10 h-5 rounded-full transition relative cursor-pointer border-none",
                    data.alertAutoClose ? "bg-cyan-600" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    data.alertAutoClose ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              {data.alertAutoClose && (
                <div className="space-y-1.5 pt-2 border-t border-border/10">
                  <label className="text-[8px] font-bold text-[#64748b] block">Inactivity Duration Before Closure</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer"
                    value={data.alertAutoCloseDuration || "6h"}
                    onChange={(e) => handleDropdownChange("alertAutoCloseDuration", e.target.value)}
                  >
                    <option value="1h">1 Hour (Hyper critical turnover)</option>
                    <option value="6h">6 Hours (Single engineering shift)</option>
                    <option value="24h">24 Hours (Full operating day cycle)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CHANNELS & BROADCOAST */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="notifications-sub-tab">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                Broadcast Channels
              </span>

              <div className="space-y-3">
                {/* Email Channel */}
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-900 dark:text-white block">Email Dispatch Rules</span>
                      <span className="text-[7.5px] text-zinc-500 block">Deliver complete SLA metrics summaries</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("channelEmail", data.channelEmail)}
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center transition cursor-pointer",
                      data.channelEmail ? "bg-cyan-500 border-cyan-500 text-slate-950" : "border-border bg-transparent"
                    )}
                  >
                    {data.channelEmail && <Check className="w-3 h-3" />}
                  </button>
                </div>

                {/* Slack Channel */}
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-900 dark:text-white block">Slack Security-Channel Webhooks</span>
                      <span className="text-[7.5px] text-zinc-500 block">Fires instant alert snippets</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("channelSlack", data.channelSlack)}
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center transition cursor-pointer",
                      data.channelSlack ? "bg-cyan-500 border-cyan-500 text-slate-950" : "border-border bg-transparent"
                    )}
                  >
                    {data.channelSlack && <Check className="w-3 h-3" />}
                  </button>
                </div>

                {/* MS Teams Channel */}
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-900 dark:text-white block">Microsoft Teams Operations</span>
                      <span className="text-[7.5px] text-zinc-500 block">Relays critical consensus summaries</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("channelTeams", data.channelTeams)}
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center transition cursor-pointer",
                      data.channelTeams ? "bg-cyan-500 border-cyan-500 text-slate-950" : "border-border bg-transparent"
                    )}
                  >
                    {data.channelTeams && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Severity Sound triggers */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white block border-b border-border/25 pb-2">
                Operational Alert Audio Consoles
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-[8.5px] text-slate-500 border-b border-border/10 pb-1">
                  <span>Target Class</span>
                  <span>Audio Beacon Active</span>
                </div>

                {[
                  { label: "Critical Severity Alarms", sub: "Alarm horn", field: "soundCritical" },
                  { label: "High Operations Signals", sub: "Priority bip", field: "soundHigh" },
                  { label: "Medium Warning Bleeps", sub: "Micro sound", field: "soundMedium" },
                  { label: "Low Informational Events", sub: "Soft toggle noise", field: "soundLow" },
                ].map((sound) => {
                  const val = (data as any)[sound.field];
                  return (
                    <div key={sound.field} className="flex items-center justify-between py-1 hover:bg-secondary/5 rounded px-1.5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-900 dark:text-white block">{sound.label}</span>
                          <span className="text-[7px] text-zinc-500 block leading-none">{sound.sub}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(sound.field as any, val)}
                        className={cn(
                          "w-4 h-4 border rounded flex items-center justify-center transition cursor-pointer",
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
        )}

        {/* TAB 3: ESCALATION POLICY */}
        {activeTab === "escalation" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-5" id="escalation-sub-tab">
            <h4 className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white border-b border-border/25 pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />
              Automated Incident Escalation Wait-Time Delays
            </h4>

            <p className="text-[8.5px] text-slate-500 dark:text-zinc-500 uppercase leading-normal font-medium">
              Define the delay period (in minutes) an incident can sit unanswered inside triaged status levels before the system automatically sends priority escalations to on-duty administrators:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Critical */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-xl space-y-1.5">
                <span className="text-[8.5px] font-black text-rose-500 block">Critical Breaches (immediate)</span>
                <input
                  type="number"
                  className="w-full bg-background border border-border/80 focus:border-rose-500 rounded px-2 py-1 text-xs font-bold"
                  value={data.escalateDelayCritical || 5}
                  onChange={(e) => handleNumberChange("escalateDelayCritical", e.target.value)}
                />
                <span className="text-[7px] text-zinc-500 block">Minutes until absolute paging pagerDuty sweep</span>
              </div>

              {/* High */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-xl space-y-1.5">
                <span className="text-[8.5px] font-black text-orange-400 block">High Severity Events</span>
                <input
                  type="number"
                  className="w-full bg-background border border-border/80 focus:border-orange-400 rounded px-2 py-1 text-xs font-bold"
                  value={data.escalateDelayHigh || 15}
                  onChange={(e) => handleNumberChange("escalateDelayHigh", e.target.value)}
                />
                <span className="text-[7px] text-zinc-500 block">Minutes before pushing tickets to Tier-3 team Leads</span>
              </div>

              {/* Medium */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-xl space-y-1.5">
                <span className="text-[8.5px] font-black text-yellow-500 block">Medium Warnings</span>
                <input
                  type="number"
                  className="w-full bg-background border border-border/80 focus:border-yellow-500 rounded px-2 py-1 text-xs font-bold"
                  value={data.escalateDelayMedium || 60}
                  onChange={(e) => handleNumberChange("escalateDelayMedium", e.target.value)}
                />
                <span className="text-[7px] text-zinc-500 block">Minutes until automated notification alerts</span>
              </div>
            </div>

            <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[7.5px] text-zinc-500 uppercase leading-normal font-semibold">
                Critical SLA requirements mandate values &le; 10 minutes to remain strictly ISO-compatible.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
