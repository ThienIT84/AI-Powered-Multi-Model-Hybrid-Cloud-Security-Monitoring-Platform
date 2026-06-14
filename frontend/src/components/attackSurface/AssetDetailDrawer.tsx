import React from "react";
import { X, ShieldAlert, Monitor, Terminal, Activity, Tag, HelpCircle, HardDrive, Clock, Radio } from "lucide-react";
import { Asset } from "./types";
import { cn } from "../../lib/utils";

interface AssetDetailDrawerProps {
  asset: Asset | null;
  onClose: () => void;
}

export function AssetDetailDrawer({ asset, onClose }: AssetDetailDrawerProps) {
  if (!asset) return null;

  const statusStyles = {
    Normal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-655 dark:text-amber-400 border-amber-500/20",
    Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse",
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col font-mono text-[10px] select-none text-foreground animate-fade-in w-full h-208.75">
        
        {/* Header section */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Terminal size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-mono font-black tracking-[0.2em] text-[#06b6d4] uppercase">
                ASSET DISCOVERY TELEMETRY
              </span>
            </div>
            <h3 className="text-xs font-black uppercase text-foreground leading-none">
              Inventory Detail Record
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/30 cursor-pointer text-xs"
          >
            <X size={13} className="inline mr-1" /> CLOSE
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Status highlight bar */}
          <div className={cn("p-3 rounded-lg border flex items-center justify-between", statusStyles[asset.status])}>
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-wider block">STATE LEVEL</span>
              <span className="font-black text-[11px] uppercase tracking-widest">{asset.status}</span>
            </div>
            <div className="text-right">
              <span className="text-[7.5px] font-black uppercase tracking-wider block text-muted-foreground/80">FUSION RISK INDEX</span>
              <span className="text-sm font-black tracking-widest">SCORE {asset.riskScore}</span>
            </div>
          </div>

          {/* 1. Asset Profile */}
          <div className="border border-border/45 rounded-xl p-3.5 bg-muted/10 space-y-2.5">
            <div className="flex items-center gap-1.5 border-b border-border/25 pb-1.5">
              <Monitor size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
                ASSET DISCOVERY PROFILE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">HOSTNAME</span>
                <span className="text-foreground font-black text-[9.5px] break-all">{asset.hostname}</span>
              </div>
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">IP ADDRESS</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-black text-[9.5px]">{asset.ip}</span>
              </div>
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">ZONE ENVIRONMENT</span>
                <span className="text-foreground uppercase text-[8.5px]">{asset.zone}</span>
              </div>
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">ASSET TYPE</span>
                <span className="text-foreground uppercase text-[8.5px]">{asset.type}</span>
              </div>
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">OWNER REFERENCE</span>
                <span className="text-foreground/90 uppercase text-[8.5px]">{asset.owner}</span>
              </div>
              <div>
                <span className="text-[7.5px] text-muted-foreground uppercase block font-bold">LATEST HEURISTICS timestamp</span>
                <span className="text-foreground/90 uppercase text-[8.5px]">{asset.lastSeen}</span>
              </div>
            </div>
          </div>

          {/* 2. Services Configuration */}
          <div className="border border-border/45 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/25 pb-1.5">
              <HardDrive size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
                RUNNING SERVICES & APPLICATION PARAMS
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              {asset.services.map((svc) => (
                <span
                  key={svc}
                  className="bg-cyan-500/6 dark:bg-cyan-500/4 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 py-1 px-2 rounded-lg text-[8.5px] font-bold uppercase tracking-wider animate-fade-in"
                >
                  {svc}
                </span>
              ))}
              {asset.services.length === 0 && (
                <span className="text-muted-foreground uppercase py-1">No services matched in active routing configuration</span>
              )}
            </div>
          </div>

          {/* 3. Open Ports */}
          <div className="border border-border/45 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/25 pb-1.5">
              <Clock size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
                PROBED OPEN INBOUND PORTS
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {asset.ports.map((port) => (
                <span
                  key={port}
                  className="bg-background text-foreground border border-border px-2 py-1 rounded text-[8.5px] font-black"
                >
                  PORT: {port}
                </span>
              ))}
              {asset.ports.length === 0 && (
                <span className="text-muted-foreground uppercase">No open port detections recorded</span>
              )}
            </div>
          </div>

          {/* 4. Active Connections (Zeek Logs) */}
          <div className="border border-border/45 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/25 pb-1.5">
              <Radio size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
                RECENT ZEEK TELEMETRY SESSIONS
              </span>
            </div>

            <div className="space-y-1.5">
              {asset.connections && asset.connections.length > 0 ? (
                asset.connections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="p-2 border border-border/30 rounded bg-background/50 flex flex-col space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-cyan-600 dark:text-cyan-400 uppercase text-[8.5px]">{conn.service} (Port {conn.destPort})</span>
                      <span className="text-muted-foreground/60 text-[7.5px]">{conn.timestamp}</span>
                    </div>
                    <div className="flex justify-between items-center text-[7.8px] text-muted-foreground">
                      <span>PROTO: <strong className="text-foreground">{conn.protocol}</strong></span>
                      <span>BYTES: <strong className="text-foreground">{conn.bytes.toLocaleString()}</strong></span>
                      <span>STATE: <strong className="text-foreground">{conn.state}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground uppercase text-center py-4">No recent Zeek connection streams detected</p>
              )}
            </div>
          </div>

          {/* 5. Connected Alarm Summary */}
          <div className="border border-border/45 rounded-xl p-3.5 bg-muted/10 space-y-2.5">
            <div className="flex items-center gap-1.5 border-b border-border/25 pb-1.5">
              <ShieldAlert size={11} className="text-[#06b6d4]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
                ALERT SECURITY COHESION
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground uppercase">Linked Active Alerts on Host:</span>
              <span className={cn(
                "px-2 py-0.5 rounded border text-[9px] font-black text-center",
                asset.openAlerts > 0 ? "bg-red-400/15 border-red-500/30 text-red-650 dark:text-red-400 animate-pulse" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450"
              )}>
                {asset.openAlerts} ACTIVE ALERTS
              </span>
            </div>
          </div>

        </div>

        {/* Footer section */}
        <div className="p-3 border-t border-border/30 bg-muted/20 text-center text-muted-foreground/50 text-[7px] uppercase tracking-widest">
          Secured by Zeek v3 Discovery Agent
        </div>
    </div>
  );
}
