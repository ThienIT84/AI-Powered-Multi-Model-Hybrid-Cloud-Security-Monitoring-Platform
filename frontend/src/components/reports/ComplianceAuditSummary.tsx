import React from "react";
import { ShieldCheck, HelpCircle, FileCheck, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface ComplianceAuditSummaryProps {
  socCoverage?: number;
  mitreCoverage?: number;
  playbookCoverage?: number;
  caseSlaPercent?: number;
}

export const ComplianceAuditSummary: React.FC<ComplianceAuditSummaryProps> = React.memo(({
  socCoverage = 95.8,
  mitreCoverage = 88.5,
  playbookCoverage = 92.0,
  caseSlaPercent = 94.2
}) => {
  const complianceKPICards = [
    { label: "SOC 2 Type II Coverage", value: `${socCoverage}%`, desc: "Auditable control mappings", rating: "Fully Compliant" },
    { label: "MITRE ATT&CK Mapping", value: `${mitreCoverage}%`, desc: "Coverage across system matrix", rating: "High" },
    { label: "Incident Playbook Mapped", value: `${playbookCoverage}%`, desc: "Automated trigger playbooks", rating: "Robust" },
    { label: "SLA Response Compliance", value: `${caseSlaPercent}%`, desc: "Tickets met within threshold SLA", rating: "Excellent" }
  ];

  const auditReadinessItems = [
    { name: "Syslog & Flow Retention Status", status: "Active", compliance: "180 Day Retained", health: "Compliant" },
    { name: "Forensic Evidence Log Access", status: "Immutable", compliance: "Signature Verified", health: "Compliant" },
    { name: "Active Incident Documentation Status", status: "Staged", compliance: "Automated Auditing", health: "Compliant" },
    { name: "Case Closure Sign-off Loop", status: "Active", compliance: "2-Factor Sign-off", health: "Warning" }
  ];

  const securityControlItems = [
    { name: "Continuous Network Monitoring", desc: "Inspection of high-frequency egress packets stream logs via Zeek & Nginx gateway", status: "Compliant", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Endpoint Telemetry Assessment", desc: "Integrity checking loops and host alerts evaluation via OSSEC daemon pipelines", status: "Compliant", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Multi-Cloud Governance Scans", desc: "AWS Resource auditing, permissions posture validation, and S3 access rules checks", status: "Warning", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { name: "AI Fusion Consensus Detection", desc: "Bayesian consensus and neural Multi-Classifier model consensus assessment pipeline", status: "Compliant", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Playbook Auto-Trigger Control", desc: "Automated deployment of firewall block filters and WAF egress rule updates", status: "Non-Compliant", color: "text-red-500 bg-red-500/10 border-red-500/20" }
  ];

  return (
    <div className="space-y-6" id="compliance-audit-summary">
      
      {/* Subsection 1: Compliance Overview */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 font-mono select-none">
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
          <ShieldCheck size={15} className="text-cyan-500" />
          <h3 className="text-xs font-black uppercase text-foreground tracking-widest leading-none">
            Corporate Compliance Overview
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {complianceKPICards.map((card, idx) => (
            <div key={idx} className="bg-secondary/15 hover:bg-secondary/35 border border-border/40 p-4.5 rounded-xl transition duration-150">
              <span className="text-[7.5px] uppercase font-black tracking-widest text-zinc-500 block leading-none">
                {card.label}
              </span>
              <span className="text-xl font-mono font-black text-foreground block mt-1.5 leading-tight">
                {card.value}
              </span>
              <span className="text-[7.5px] uppercase font-extrabold text-cyan-500 block mt-1">
                {card.rating}
              </span>
              <span className="text-[7px] text-zinc-500 block leading-none mt-1 uppercase font-semibold">
                {card.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid container for Audit Readiness and Control Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px]">
        
        {/* Subsection 2: Audit Readiness (5/12 columns) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
              <FileCheck size={14} className="text-purple-500" />
              <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
                SOC Audit Readiness Metrics
              </h3>
            </div>

            <div className="space-y-2.5">
              {auditReadinessItems.map((item, idx) => {
                const isWarning = item.health === "Warning";
                return (
                  <div key={idx} className="p-3 bg-secondary/10 border border-border/30 rounded-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-foreground block leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[7.5px] text-zinc-500 uppercase font-semibold block">
                        Record Type: {item.status} ({item.compliance})
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[7.5px] uppercase font-black tracking-tight border shrink-0 ${isWarning ? "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"}`}>
                      {item.health}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-cyan-950/15 border border-cyan-500/10 rounded-lg flex items-start gap-2 text-[7.5px] uppercase tracking-wide leading-relaxed text-zinc-400 select-none mt-4">
            <Info size={11} className="text-cyan-500 shrink-0 mt-0.5" />
            <span>
              All regulatory frameworks map to <b>AICPA Trust Services Criteria</b>. Multi-cloud encryption validation telemetry is checked dynamically every 6 hours.
            </span>
          </div>
        </div>

        {/* Subsection 3: Control Status (7/12 columns) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-4">
            <div className="flex items-center gap-2 select-none">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
                System Security Control Status
              </h3>
            </div>
            <span className="text-[7.5px] text-zinc-500 uppercase font-bold">
              5 Controls Registered
            </span>
          </div>

          <div className="divide-y divide-border/30">
            {securityControlItems.map((ctrl, idx) => {
              const icon = ctrl.status === "Compliant" ? (
                <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
              ) : ctrl.status === "Warning" ? (
                <AlertTriangle size={12} className="text-amber-500 mt-0.5" />
              ) : (
                <XCircle size={12} className="text-red-500 mt-0.5" />
              );

              return (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex gap-2.5">
                    {icon}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-foreground block">
                        {ctrl.name}
                      </span>
                      <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-relaxed">
                        {ctrl.desc}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[7.5px] uppercase font-black tracking-tight border shrink-0 ${ctrl.color}`}>
                    {ctrl.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
});
