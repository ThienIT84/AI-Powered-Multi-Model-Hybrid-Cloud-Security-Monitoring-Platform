import React, { useMemo } from "react";
import { CloudAsset, Finding } from "./types";
import { ShieldAlert, AlertOctagon, HelpCircle, AlertCircle, CheckCircle } from "lucide-react";

interface CloudPosturePanelProps {
  assets: CloudAsset[];
}

interface PostureRule {
  id: string;
  checkName: string;
  category: "S3" | "Network" | "IAM" | "Encryption" | "Compliance";
  description: string;
  status: "Fail" | "Pass";
  severity: "Critical" | "High" | "Medium" | "Low";
  impactCount: number;
  affectedNodes: string[];
}

export function CloudPosturePanel({ assets }: CloudPosturePanelProps) {
  // Memoized aggregator to derive rules status from the real list of assets and their findings
  const postureRules = useMemo<PostureRule[]>(() => {
    // 1. Check: Public S3 Buckets
    const publicS3Assets = assets.filter(
      (a) => a.service === "S3" && a.findings.some((f) => f.category.includes("Public Access") || f.category.includes("Exposed"))
    );
    
    // 2. Check: Open Security Groups
    const openSgAssets = assets.filter(
      (a) => a.findings.some((f) => f.category.includes("Open SSH") || f.category.includes("Security Group"))
    );

    // 3. Check: Excessive IAM Privileges
    const excessiveIamAssets = assets.filter(
      (a) => a.findings.some((f) => f.category.includes("Excessive Policy") || f.category.includes("Instance Profile"))
    );

    // 4. Check: Unencrypted Resources
    const unencryptedAssets = assets.filter(
      (a) => a.findings.some((f) => f.category.includes("Unencrypted")) || 
             (a.securityConfig && a.securityConfig.encryption.includes("Unencrypted"))
    );

    // 5. Check: Inactive Security Controls
    const inactiveControls = assets.filter(
      (a) => a.findings.some((f) => f.category.includes("Authentication Absent") || f.category.includes("Logging Off"))
    );

    return [
      {
        id: "posture-01",
        checkName: "Public S3 Buckets Exposure Guard",
        category: "S3",
        description: "Enforce active Amazon S3 Block Public Access configurations on all production object states.",
        status: publicS3Assets.length > 0 ? "Fail" : "Pass",
        severity: "Critical",
        impactCount: publicS3Assets.length,
        affectedNodes: publicS3Assets.map((a) => a.name)
      },
      {
        id: "posture-02",
        checkName: "Open Security Groups Policy check",
        category: "Network",
        description: "Review and restrict broad IPv4 CIDR ranges permitting unrestricted port access on EC2 security layers.",
        status: openSgAssets.length > 0 ? "Fail" : "Pass",
        severity: "High",
        impactCount: openSgAssets.length,
        affectedNodes: openSgAssets.map((a) => a.name)
      },
      {
        id: "posture-03",
        checkName: "Excessive IAM Role Permissions Audit",
        category: "IAM",
        description: "Enforce least privilege access constraints on execution policies attached to Kubernetes clusters & handlers.",
        status: excessiveIamAssets.length > 0 ? "Fail" : "Pass",
        severity: "High",
        impactCount: excessiveIamAssets.length,
        affectedNodes: excessiveIamAssets.map((a) => a.name)
      },
      {
        id: "posture-04",
        checkName: "Unencrypted Cloud Resources Storage Scan",
        category: "Encryption",
        description: "Mandate native block volume & DB encryption using Customer Managed Keys (CMK) within KMS.",
        status: unencryptedAssets.length > 0 ? "Fail" : "Pass",
        severity: "Medium",
        impactCount: unencryptedAssets.length,
        affectedNodes: unencryptedAssets.map((a) => a.name)
      },
      {
        id: "posture-05",
        checkName: "Inactive/Disabled Account MFA Verification",
        category: "Compliance",
        description: "Ensure Multi-Factor Authentication is established on all privilege IAM credential hooks.",
        status: inactiveControls.length > 0 ? "Fail" : "Pass",
        severity: "High",
        impactCount: inactiveControls.length,
        affectedNodes: inactiveControls.map((a) => a.name)
      }
    ];
  }, [assets]);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="cloud-posture-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Cloud Security Posture Management
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live configuration audits & privilege policy controls
            </p>
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 select-none">
        {postureRules.map((rule) => {
          const isFailed = rule.status === "Fail";
          return (
            <div
              key={rule.id}
              className={`p-3 rounded-lg border transition-all ${
                isFailed
                  ? "bg-red-550/5 border-red-500/20 dark:bg-red-950/10"
                  : "bg-muted/10 border-border/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight leading-none">
                      {rule.checkName}
                    </span>
                    <span className={`text-[7px] px-1.5 py-0.2 rounded font-mono font-black uppercase ${getSeverityStyle(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-[8.5px] text-muted-foreground font-sans font-medium line-clamp-2 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono border ${
                      isFailed
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {isFailed ? "Failed" : "Passed"}
                  </span>
                </div>
              </div>

              {/* Details of failure */}
              {isFailed && (
                <div className="mt-2 pt-2 border-t border-dashed border-border/20 flex flex-wrap items-center justify-between gap-2 text-[8px] font-mono leading-none">
                  <div className="text-red-500 font-extrabold flex items-center gap-1 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                    <AlertCircle size={10} />
                    {rule.impactCount} vulnerable {rule.impactCount === 1 ? "asset" : "assets"}
                  </div>
                  <div className="text-zinc-500 truncate max-w-50" title={rule.affectedNodes.join(", ")}>
                    {rule.affectedNodes.join(", ")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default CloudPosturePanel;
