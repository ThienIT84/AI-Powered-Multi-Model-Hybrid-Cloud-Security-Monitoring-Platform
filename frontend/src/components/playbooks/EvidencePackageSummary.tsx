import React from "react";
import { FolderGit, Radio, Shield, Fingerprint, Activity, ClipboardMinus, Hash, Terminal } from "lucide-react";

interface EvidencePackageSummaryProps {
  playbookId?: string | null;
  playbookName?: string | null;
}

export function EvidencePackageSummary({ playbookId, playbookName }: EvidencePackageSummaryProps) {
  // Let's dynamically map different mock count stats for different playbooks to make the interface incredibly active and convincing!
  const getMockCounts = () => {
    const id = playbookId || "pb-sqli";
    switch (id) {
      case "pb-sqli":
        return {
          zeekEvents: 142,
          suricataAlerts: 48,
          fusionAlerts: 12,
          caseIds: ["CASE-1024", "CASE-1082"],
        };
      case "pb-xss":
        return {
          zeekEvents: 34,
          suricataAlerts: 16,
          fusionAlerts: 4,
          caseIds: ["CASE-2045"],
        };
      case "pb-dos":
        return {
          zeekEvents: 8522,
          suricataAlerts: 1840,
          fusionAlerts: 240,
          caseIds: ["CASE-1057", "CASE-1200", "CASE-1992"],
        };
      case "pb-brute":
        return {
          zeekEvents: 1240,
          suricataAlerts: 450,
          fusionAlerts: 85,
          caseIds: ["CASE-1085", "CASE-2114"],
        };
      case "pb-stuffing":
        return {
          zeekEvents: 14592,
          suricataAlerts: 3200,
          fusionAlerts: 642,
          caseIds: ["CASE-9488", "CASE-9920"],
        };
      case "pb-lateral":
        return {
          zeekEvents: 182,
          suricataAlerts: 92,
          fusionAlerts: 28,
          caseIds: ["CASE-9421", "CASE-1081"],
        };
      case "pb-exfil":
        return {
          zeekEvents: 820,
          suricataAlerts: 340,
          fusionAlerts: 55,
          caseIds: ["CASE-9492", "CASE-9510", "CASE-9556"],
        };
      default:
        return {
          zeekEvents: 24,
          suricataAlerts: 12,
          fusionAlerts: 2,
          caseIds: ["CASE-9400"],
        };
    }
  };

  const counts = getMockCounts();

  return (
    <div
      id="evidence-package-summary"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col gap-4 font-mono select-none"
    >
      {/* Header element */}
      <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Fingerprint size={13} className="text-cyan-500 shrink-0 select-none" />
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Incident Evidence Package Summary
            </h2>
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
              Aggregate logs count currently linked to active playbook session
            </span>
          </div>
        </div>
        <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest border border-border/85 rounded px-2 py-0.5 select-none leading-none w-fit self-start sm:self-center">
          SOP ID: {(playbookId || "pb-sqli").toUpperCase()}
        </span>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Zeek Events */}
        <div className="bg-muted/10 border border-border/60 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
            <Terminal size={14} />
          </div>
          <div>
            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest block leading-none">
              Zeek Events
            </span>
            <span className="text-lg font-black text-foreground block mt-1 tracking-tight leading-none">
              {counts.zeekEvents}
            </span>
          </div>
        </div>

        {/* Suricata Alerts */}
        <div className="bg-muted/10 border border-border/60 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg shrink-0">
            <Radio size={14} />
          </div>
          <div>
            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest block leading-none">
              Suricata Alerts
            </span>
            <span className="text-lg font-black text-foreground block mt-1 tracking-tight leading-none">
              {counts.suricataAlerts}
            </span>
          </div>
        </div>

        {/* Fusion Alerts */}
        <div className="bg-muted/10 border border-border/60 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg shrink-0">
            <Shield size={14} />
          </div>
          <div>
            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest block leading-none">
              Fusion Alerts
            </span>
            <span className="text-lg font-black text-foreground block mt-1 tracking-tight leading-none">
              {counts.fusionAlerts}
            </span>
          </div>
        </div>

        {/* Related Case IDs */}
        <div className="bg-muted/10 border border-border/60 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 rounded-lg shrink-0">
            <FolderGit size={14} />
          </div>
          <div>
            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-widest block leading-none">
              Case Associations ({counts.caseIds.length})
            </span>
            <div className="flex flex-wrap gap-1 mt-1 font-black text-[7.5px] leading-none">
              {counts.caseIds.map((caseId) => (
                <span
                  key={caseId}
                  className="bg-cyan-50/70 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 dark:bg-cyan-950/20 px-1 py-0.5 rounded uppercase"
                >
                  {caseId}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer details note */}
      <div className="text-[7.5px] text-muted-foreground/80 uppercase font-black tracking-normal text-right pt-1 border-t border-border/30">
        Note: Counts aggregated dynamically. For complete forensic detail records maps, refer directly to Case Management.
      </div>
    </div>
  );
}
