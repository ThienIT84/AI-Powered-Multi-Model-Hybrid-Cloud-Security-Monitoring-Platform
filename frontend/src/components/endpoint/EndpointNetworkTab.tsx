import React from "react";
import { EndpointAsset } from "./endpointConfig";
import { cn } from "../../lib/utils";
import { ArrowUpRight, ArrowDownLeft, Network, Shield, HelpCircle } from "lucide-react";

interface EndpointNetworkTabProps {
  endpoint: EndpointAsset;
}

export function EndpointNetworkTab({ endpoint }: EndpointNetworkTabProps) {
  const activeFlows = endpoint.networkFlows;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Network identity metadata boxes */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Mac address block */}
        <div className="p-3 bg-muted/40 border border-border rounded-xl font-mono text-[9.5px]">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block leading-none">MAC PHYSICAL ADDRESS</span>
          <span className="text-foreground font-bold mt-1.5 block tracking-widest">{endpoint.macAddress}</span>
        </div>

        {/* VPC block */}
        <div className="p-3 bg-muted/40 border border-border rounded-xl font-mono text-[9.5px]">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest block leading-none">VPC BOUNDARY ENDPOINT</span>
          <span className="text-foreground font-bold mt-1.5 block tracking-widest uppercase">{endpoint.vpcId}</span>
        </div>

      </div>

      {/* Traffic Flows block */}
      <div className="space-y-2.5">
        <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block px-1">
          Active TCP/UDP Network Flows ({activeFlows.length})
        </label>

        {activeFlows.length === 0 ? (
          <div className="p-6 bg-muted/40 border border-border border-dashed rounded-xl text-center">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              {endpoint.status === "OFFLINE" ? "Telemetry is offline. No active flows." : "Zero egress/ingress activities monitored"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {activeFlows.map((flow, i) => {
              const isInbound = flow.direction === "INBOUND";
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-xl border font-mono text-[10px] flex items-center justify-between gap-4 transition-all",
                    isInbound 
                      ? "bg-purple-500/5 border-purple-500/10 text-purple-400" 
                      : "bg-cyan-500/5 border-cyan-500/10 text-cyan-400"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                      isInbound ? "bg-purple-500/10 border-purple-500/20" : "bg-cyan-500/10 border-cyan-500/20"
                    )}>
                      {isInbound ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-foreground uppercase tracking-wide">{flow.protocol}</span>
                        <span className="text-muted-foreground text-[8px] font-black uppercase tracking-wider bg-card border border-border px-1 rounded">
                          {flow.direction}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[9px] truncate max-w-42.5 mt-1 tracking-wider lowercase">
                        {flow.sourceIp}:{flow.sourcePort} &rarr; {flow.destIp}:{flow.destPort}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-foreground font-black tracking-wide block">
                      {(flow.bytes / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-[8px] text-muted-foreground uppercase mt-0.5 block">
                      payload traffic size
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
