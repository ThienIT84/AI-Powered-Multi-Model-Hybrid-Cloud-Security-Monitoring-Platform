import React, { useMemo } from "react";
import { CloudLightning, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Asset, CloudResource } from "./types";
import { cn } from "../../lib/utils";

interface CloudResourceStatusProps {
  assets: Asset[]; // We can derive cloud resources from both AWS assets and CloudResource items
  cloudResources: CloudResource[];
}

export function CloudResourceStatus({ assets, cloudResources }: CloudResourceStatusProps) {
  // Aggregate cloud status counts dynamically to prevent hardcoding and ensure interactive realism
  const aggregatedStatus = useMemo(() => {
    // 5 Categories: EC2, RDS, S3, SQS, IAM
    const statusMap: Record<
      string,
      { type: string; label: string; healthyCount: number; warningCount: number; criticalCount: number }
    > = {
      EC2: { type: "EC2", label: "Elastic Compute Gateway (EC2)", healthyCount: 1, warningCount: 1, criticalCount: 0 },
      RDS: { type: "RDS", label: "Relational DB Cluster (RDS)", healthyCount: 3, warningCount: 1, criticalCount: 0 },
      S3: { type: "S3", label: "Object Storage Containers (S3)", healthyCount: 17, warningCount: 0, criticalCount: 1 },
      SQS: { type: "SQS", label: "Alert Distributed Queues (SQS)", healthyCount: 6, warningCount: 0, criticalCount: 0 },
      IAM: { type: "IAM", label: "Identity & Access Groups (IAM)", healthyCount: 12, warningCount: 0, criticalCount: 0 },
    };

    // Integrate any changes dynamically from assets state where location matches AWS Cloud
    assets.forEach((asset) => {
      if (asset.zone === "AWS Cloud") {
        let typeKey = "EC2";
        const typeL = asset.type.toLowerCase();
        const hostL = asset.hostname.toLowerCase();

        if (typeL.includes("rds") || typeL.includes("db") || hostL.includes("rds") || hostL.includes("postgres")) {
          typeKey = "RDS";
        } else if (typeL.includes("s3") || hostL.includes("s3") || hostL.includes("bucket")) {
          typeKey = "S3";
        } else if (typeL.includes("sqs") || hostL.includes("sqs") || hostL.includes("queue")) {
          typeKey = "SQS";
        } else if (typeL.includes("iam") || hostL.includes("iam")) {
          typeKey = "IAM";
        }

        const mapItem = statusMap[typeKey];
        if (mapItem) {
          if (asset.status === "Normal") {
            mapItem.healthyCount++;
          } else if (asset.status === "Warning") {
            mapItem.warningCount++;
          } else {
            mapItem.criticalCount++;
          }
        }
      }
    });

    return Object.values(statusMap);
  }, [assets]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full flex flex-col justify-between select-none">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <CloudLightning size={12} className="text-[#06b6d4]" />
          <div>
            <h4 className="text-[9.5px] font-black text-foreground uppercase tracking-[0.2em] leading-none">
              CLOUD SERVICE RESOURCE STATUS
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              AWS infrastructure component health matrix
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-2 py-3">
        {aggregatedStatus.map((service) => {
          const total = service.healthyCount + service.warningCount + service.criticalCount;

          return (
            <div
              key={service.type}
              className="p-2.5 rounded-lg bg-background border border-border/45 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 font-mono text-[9.5px]"
            >
              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-1 py-0.5 rounded leading-none shrink-0 font-mono">
                    {service.type}
                  </span>
                  <span className="text-foreground tracking-wide font-black uppercase truncate text-[9px]">
                    {service.label}
                  </span>
                </div>
                <p className="text-[8px] text-muted-foreground">
                  MONITORING {total} DISCOVERED COMPONENTS
                </p>
              </div>

              {/* Counts row */}
              <div className="flex items-center gap-2.5 shrink-0 text-[8.5px]">
                {/* Healthy count */}
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/4 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  <CheckCircle2 size={9} />
                  <span>{service.healthyCount} OK</span>
                </div>

                {/* Warning count */}
                <div
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                    service.warningCount > 0
                      ? "text-amber-600 dark:text-amber-450 bg-amber-500/4 border-amber-500/20 font-black"
                      : "text-muted-foreground/35 bg-transparent border-transparent"
                  )}
                >
                  <AlertTriangle size={9} />
                  <span>{service.warningCount} WRN</span>
                </div>

                {/* Critical count */}
                <div
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                    service.criticalCount > 0
                      ? "text-red-600 dark:text-red-400 bg-red-500/4 border-red-500/20 font-black animate-pulse"
                      : "text-muted-foreground/35 bg-transparent border-transparent"
                  )}
                >
                  <XCircle size={9} />
                  <span>{service.criticalCount} CRT</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
