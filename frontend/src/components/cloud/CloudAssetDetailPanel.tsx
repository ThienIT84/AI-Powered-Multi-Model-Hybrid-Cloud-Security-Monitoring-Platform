import React from "react";
import { CloudAsset, CloudThreat } from "./types";
import { Info, Shield, ShieldAlert, FileText, CheckCircle, AlertTriangle, Cpu, Globe, Key } from "lucide-react";

interface CloudAssetDetailPanelProps {
  asset: CloudAsset | null;
  allThreats: CloudThreat[];
}

export function CloudAssetDetailPanel({ asset, allThreats }: CloudAssetDetailPanelProps) {
  if (!asset) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center select-none" id="cloud-asset-detail-placeholder">
        <div className="max-w-md mx-auto py-8 flex flex-col items-center justify-center p-4">
          <Info size={32} className="text-zinc-500 mb-3 animate-pulse" />
          <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
            No Asset Selected for Investigation
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-sm">
            Select an active cloud resource from the Asset Inventory panel to trigger detailed posture, configuration encryption, and active GuardDuty audits.
          </p>
        </div>
      </div>
    );
  }

  // Filter threats targeting this specific asset name
  const linkedThreats = allThreats.filter((t) => t.asset === asset.name);

  // Generate dynamic, asset-centric remediation recommendations
  const getAssetRecommendations = (a: CloudAsset) => {
    const list = [];
    if (a.service === "S3") {
      list.push("Enable S3 Block Public Access and ensure bucket policy allows only specific VPC origin endpoints.");
      list.push("Establish Object Lock and enable versioning to guarantee write-once-read-many compliance.");
    } else if (a.service === "EKS") {
      list.push("Restrict Kubernetes API server access. Switch cluster API from Public to Public/Private Endpoint.");
      list.push("Deploy multi-tenant security policies to restrict inter-pod communications on default namespace.");
    } else if (a.service === "EC2") {
      list.push("Review security group broad ingress. Demote SSH port 22 access to explicit office CIDR ranges.");
      list.push("Configure standard EBS volume hardware encryption during launching phase.");
    } else if (a.service === "IAM") {
      list.push("Enforce MFA policies on root account level.");
      list.push("Audit and restrict permissions mapped to administration entities to stop privilege escalation chains.");
    } else {
      list.push("Review and restrict resource access permissions to the absolute minimum needed.");
      list.push("Ensure full KMS encryption is configured with automated yearly keys rotation.");
    }
    return list;
  };

  const recommendations = getAssetRecommendations(asset);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/35";
      case "High":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border border-yellow-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-650 dark:text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col h-full" id="cloud-asset-detail-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/40 pb-3.5 mb-4 gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Shield size={18} />
          </div>
          <div>
            <span className="text-[7.5px] uppercase font-bold text-cyan-550 dark:text-cyan-400 block font-mono">ASSET INVESTIGATION WORKBENCH</span>
            <h3 className="text-sm font-black uppercase text-foreground tracking-tight font-mono">
              {asset.name}
            </h3>
          </div>
        </div>

        {/* Aggregated Scores */}
        <div className="flex items-center gap-3 font-mono">
          <div className="bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[7px] text-zinc-400 block uppercase font-bold leading-none">Risk Score</span>
            <span className={`text-[12px] font-black ${asset.riskScore >= 75 ? "text-red-500" : "text-emerald-500"}`}>
              {asset.riskScore}
            </span>
          </div>
          <div className="bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[7px] text-zinc-400 block uppercase font-bold leading-none">Exposure</span>
            <span className={`text-[12px] font-black ${asset.exposureScore >= 50 ? "text-red-400" : "text-emerald-500"}`}>
              {asset.exposureScore}%
            </span>
          </div>
          <div className="bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[7px] text-zinc-400 block uppercase font-bold leading-none">Compliance</span>
            <span className="text-[12px] font-black text-purple-400">
              {asset.complianceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Info & Config (Col Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Asset Info Card */}
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3.5 space-y-2.5 font-mono text-[9px] leading-relaxed select-none">
            <div className="text-[7.5px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider flex items-center gap-1">
              <Info size={11} />
              Asset Metadata
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Service Engine</span>
                <strong className="text-foreground uppercase">{asset.service}</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Host Region</span>
                <strong className="text-foreground">{asset.region}</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Administrator</span>
                <strong className="text-foreground uppercase truncate max-w-32.5" title={asset.owner}>{asset.owner}</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Environment</span>
                <strong className="text-foreground uppercase">{asset.environment}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 uppercase">Resource Status</span>
                <strong className="text-emerald-600 dark:text-emerald-400 uppercase font-black">{asset.status}</strong>
              </div>
            </div>
          </div>

          {/* Security Config Card */}
          <div className="bg-muted/15 border border-border/50 rounded-xl p-3.5 space-y-2.5 font-mono text-[9px] leading-relaxed select-none">
            <div className="text-[7.5px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider flex items-center gap-1">
              <Key size={11} />
              Security Configuration
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between gap-2 border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Encryption type</span>
                <strong className="text-foreground uppercase text-right leading-none truncate max-w-37.5" title={asset.securityConfig?.encryption}>
                  {asset.securityConfig?.encryption || "Default"}
                </strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">MFA Configuration</span>
                <strong className={`uppercase ${asset.securityConfig?.mfaEnabled ? "text-emerald-500 font-extrabold" : "text-amber-500 font-medium"}`}>
                  {asset.securityConfig?.mfaEnabled ? "Active" : "Absent"}
                </strong>
              </div>
              <div className="flex justify-between gap-2 border-b border-border/10 pb-1">
                <span className="text-zinc-400 uppercase">Linked Identity</span>
                <strong className="text-foreground uppercase truncate max-w-37.5" title={asset.securityConfig?.iamRole}>
                  {asset.securityConfig?.iamRole || "N/A"}
                </strong>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400 uppercase">VPC Endpoint Link</span>
                <strong className="text-foreground uppercase truncate max-w-32.5" title={asset.securityConfig?.vpcRing}>
                  {asset.securityConfig?.vpcRing || "No isolated VPC"}
                </strong>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Findings & Compliance (Col Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Posture Findings / Issues */}
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3.5 h-57.5 overflow-y-auto flex flex-col">
            <div className="text-[7.5px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1 border-b border-border/20 pb-2 mb-2 select-none">
              <AlertTriangle size={11} />
              CSPM & Exposure Findings ({asset.findings.length})
            </div>
            
            <div className="space-y-2 flex-1 pr-1 font-mono text-[8.5px]">
              {asset.findings.length === 0 ? (
                <div className="text-center italic text-zinc-500 py-8">
                  Security posture pristine. No active issues detected.
                </div>
              ) : (
                asset.findings.map((f) => (
                  <div key={f.id} className="p-2 bg-background border border-border/40 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-foreground uppercase">{f.category}</span>
                      <span className={`text-[7px] font-black uppercase px-1 rounded ${getSeverityBadgeClass(f.severity)}`}>
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-muted-foreground font-sans leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actionable Remediation Recommendations */}
          <div className="bg-linear-to-r from-emerald-950/10 to-transparent border border-emerald-500/10 rounded-xl p-3.5 font-mono text-[9px] select-none">
            <div className="text-[7.5px] font-black uppercase text-emerald-600 dark:text-emerald-450 tracking-wider mb-2.5 flex items-center gap-1">
              <CheckCircle size={11} strokeWidth={2.5} />
              REMEDIATION PLAYBOOK INSTRUCTIONS
            </div>
            <div className="space-y-2 leading-relaxed">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-zinc-650 dark:text-zinc-300">
                  <span className="text-emerald-555 font-black">&bull;</span>
                  <p className="text-[8.5px] leading-relaxed font-sans font-medium uppercase tracking-tight">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Real-time Intel Threat Logs (Col Span 3) */}
        <div className="lg:col-span-3">
          <div className="bg-muted/10 border border-border/50 rounded-xl p-3.5 h-full flex flex-col justify-between">
            <div>
              <div className="text-[7.5px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1 border-b border-border/20 pb-2 mb-2 select-none">
                <ShieldAlert size={11} />
                Recent Alerts Targeting Asset ({linkedThreats.length})
              </div>

              <div className="space-y-2 max-h-42.5 overflow-y-auto pr-1 font-mono text-[8.5px]">
                {linkedThreats.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    No active threat triggers logged.
                  </div>
                ) : (
                  linkedThreats.map((t) => (
                    <div key={t.id} className="p-2 bg-background border border-border/40 rounded-lg">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-extrabold text-foreground text-[8px] uppercase tracking-tight truncate max-w-30" title={t.threatType}>
                          {t.threatType}
                        </span>
                        <span className="text-[7px] font-black text-red-500 uppercase bg-red-500/10 px-1 py-0.2 rounded border border-red-500/15">
                          {t.severity}
                        </span>
                      </div>
                      <div className="text-[7.5px] text-muted-foreground">
                        {t.timestamp.split(" ")[1] || t.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-border/10 pt-2.5 font-mono text-[8.5px] text-zinc-500 leading-normal uppercase select-none font-bold mt-3">
              GuardDuty Live Link established
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default CloudAssetDetailPanel;
