import React from "react";
import { Cloud, Check, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { Integration } from "./types";
import { cn } from "../../lib/utils";

interface CloudIntegrationsPanelProps {
  integrations: Integration[];
  onSelect: (id: string) => void;
}

export function CloudIntegrationsPanel({ integrations, onSelect }: CloudIntegrationsPanelProps) {
  // Extract AWS RDS, S3, SQS, CloudWatch
  const sqs = integrations.find(i => i.id === "aws-sqs");
  const s3 = integrations.find(i => i.id === "aws-s3");
  const rds = integrations.find(i => i.id === "aws-rds");
  const cw = integrations.find(i => i.id === "aws-cloudwatch");

  const cloudServices = [
    {
      id: "aws-sqs",
      name: "AWS SQS Ingestion Queue",
      data: sqs || { status: "Connected", region: "ap-southeast-1", lastSync: "Just Now", health: "Healthy" },
    },
    {
      id: "aws-s3",
      name: "AWS S3 Cold Storage Archive",
      data: s3 || { status: "Connected", region: "ap-southeast-1", lastSync: "2m ago", health: "Healthy" },
    },
    {
      id: "aws-rds",
      name: "AWS RDS PostgreSQL Platform DB",
      data: rds || { status: "Connected", region: "ap-southeast-1", lastSync: "Just Now", health: "Healthy" },
    },
    {
      id: "aws-cloudwatch",
      name: "AWS CloudWatch Auditor",
      data: cw || { status: "Connected", region: "ap-southeast-1", lastSync: "5m ago", health: "Healthy" },
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-[380px]">
      <div className="border-b border-border/40 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-1">
          <Cloud size={12} className="text-cyan-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Cloud Service Integrations
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Core Cloud-Hosted Boundaries & Relational Persistence Layers
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 my-3 space-y-2">
        {cloudServices.map((srv) => {
          const isWarning = srv.data.status === "Warning" || srv.data.health === "Warning";
          const isCritical = srv.data.status === "Disconnected" || srv.data.health === "Critical";

          return (
            <div
              key={srv.id}
              onClick={() => onSelect(srv.id)}
              className="px-3 py-2 bg-muted/20 hover:bg-muted/45 border border-border/60 rounded-lg transition-colors cursor-pointer group flex items-center justify-between h-[62px]"
            >
              <div className="flex flex-col">
                <span className="text-[9.5px] font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                  {srv.name}
                </span>
                
                {/* Region & last sync */}
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[7px] text-muted-foreground uppercase">
                  <span>REGION: <b>{srv.data.region || "ap-southeast-1"}</b></span>
                  <span>-</span>
                  <span>SYNC: <b>{srv.data.lastSync}</b></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={cn(
                    "text-[7px] font-black px-1.5 py-0.5 rounded border tracking-wider",
                    isCritical
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : isWarning
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  )}>
                    {srv.data.status === "Connected" ? "ONLINE" : srv.data.status.toUpperCase()}
                  </div>
                  <div className="text-[6.5px] font-mono text-muted-foreground uppercase mt-0.5">
                    HEALTH: <b className={isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-amber-500" : "text-emerald-500"}>{srv.data.health.toUpperCase()}</b>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5 text-center leading-none select-none flex items-center justify-center gap-1">
        <RefreshCw size={8} className="animate-pulse" />
        <span>Sync connection protocols fully secure (AWS IAM v4 signatures)</span>
      </div>
    </div>
  );
}
