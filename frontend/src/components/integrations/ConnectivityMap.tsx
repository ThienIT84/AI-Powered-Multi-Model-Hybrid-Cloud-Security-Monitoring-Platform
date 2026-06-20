import React from "react";
import { Link2, ArrowRight, ShieldCheck, Database, LayoutGrid, Server, Send, Radio } from "lucide-react";
import { Integration } from "./types";
import { cn } from "../../lib/utils";

interface ConnectivityMapProps {
  integrations: Integration[];
}

export function ConnectivityMap({ integrations }: ConnectivityMapProps) {
  // Extract states of each element
  const zeek = integrations.find((i) => i.id === "zeek");
  const filebeat = integrations.find((i) => i.id === "filebeat");
  const sqs = integrations.find((i) => i.id === "aws-sqs");
  const rds = integrations.find((i) => i.id === "aws-rds");

  // Determine node states
  const getStatus = (item: Integration | undefined) => {
    if (!item) return "Connected";
    return item.status;
  };

  const flowNodes = [
    {
      id: "zeek",
      label: "Zeek Sensor",
      icon: Radio,
      status: getStatus(zeek),
    },
    {
      id: "filebeat",
      label: "Filebeat",
      icon: Send,
      status: getStatus(filebeat),
    },
    {
      id: "aws-sqs",
      label: "AWS SQS",
      icon: Server,
      status: getStatus(sqs),
    },
    {
      id: "backend",
      label: "Backend",
      icon: ShieldCheck,
      status: getStatus(sqs) === "Disconnected" || getStatus(rds) === "Disconnected" ? "Disconnected" : "Connected",
    },
    {
      id: "database",
      label: "Database",
      icon: Database,
      status: getStatus(rds),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
      status: "Connected" as const,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="border-b border-border/40 pb-2 flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Link2 size={12} className="text-cyan-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Platform Connectivity Map
            </h4>
            <span className="text-[7.5px] font-mono text-foreground/85 dark:text-muted-foreground/95 uppercase tracking-widest mt-1 block">
              E2E Telemetry Ingress Path & Data Flow Topology
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 font-mono text-[7.5px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-foreground dark:text-white uppercase font-black">CONNECTED</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-foreground dark:text-white uppercase font-black">WARNING</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-foreground dark:text-white uppercase font-black">DISCONNECTED</span>
          </div>
        </div>
      </div>

      <div className="py-2.5 px-4 overflow-x-auto min-w-150 flex items-center justify-around gap-1.5">
        {flowNodes.map((node, idx) => {
          const NodeIcon = node.icon;
          const status = node.status;
          
          let stateColor = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
          let dotColor = "bg-emerald-400";
          let textStatusColor = "text-emerald-700 dark:text-emerald-400 font-extrabold";
          
          if (status === "Warning") {
            stateColor = "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300";
            dotColor = "bg-amber-400";
            textStatusColor = "text-amber-700 dark:text-amber-400 font-extrabold";
          } else if (status === "Disconnected" || status === "Offline") {
            stateColor = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300";
            dotColor = "bg-red-400";
            textStatusColor = "text-red-700 dark:text-red-400 font-extrabold";
          }

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                className={cn(
                  "flex flex-col items-center justify-between border rounded-xl p-3 w-28.75 h-18.75 bg-card/60 transition-all shadow-xs relative overflow-hidden",
                  stateColor
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <NodeIcon size={12} className="opacity-95" />
                  <span className={cn("w-1.5 h-1.5 rounded-full", dotColor, status === "Connected" ? "" : "animate-pulse")} />
                </div>

                <div className="text-center mt-1.5">
                  <span className="text-[9.5px] font-black tracking-wider uppercase block text-foreground dark:text-white">
                    {node.label}
                  </span>
                  <span className={cn("text-[7px] font-mono uppercase tracking-widest block mt-0.5", textStatusColor)}>
                    {status === "Connected" ? "CONNECTED" : status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Connections (Arrow) */}
              {idx < flowNodes.length - 1 && (
                <div className="flex flex-col items-center select-none text-muted-foreground/50 px-1">
                  <ArrowRight size={14} className={cn("transition-colors", status === "Connected" ? "text-cyan-500" : "text-muted-foreground/30")} />
                  <span className="text-[6px] font-mono tracking-widest uppercase text-foreground/70 dark:text-muted-foreground/90 mt-1 font-bold">
                    FORWARD
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
