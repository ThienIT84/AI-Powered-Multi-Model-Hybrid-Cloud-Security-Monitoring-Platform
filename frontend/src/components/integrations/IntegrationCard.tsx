import React, { useState } from "react";
import { Integration } from "./integrationsConfig";
import { 
  Cloud, 
  Activity, 
  ShieldCheck, 
  MessageSquare, 
  ShieldAlert, 
  Mail, 
  Settings2, 
  Cpu, 
  Link2,
  Unlink,
  Rss,
  Zap,
  Gauge
} from "lucide-react";

interface IntegrationCardProps {
  key?: string;
  integration: Integration;
  onConfigureClick: (integration: Integration) => void;
}

export function IntegrationCard({ integration, onConfigureClick }: IntegrationCardProps) {
  const isConnected = integration.status === "connected";

  // Select icon and colors dynamically based on brand/purpose
  const getServiceConfig = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "aws":
        return {
          icon: <Cloud className="w-7 h-7 text-amber-500" />,
          accentBg: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(245,158,11,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]",
          metricName: "INGESTION EPS",
          metricValue: isConnected ? "1,240 eps" : "0 eps",
          activeAccent: "text-amber-400"
        };
      case "zeek":
        return {
          icon: <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />,
          accentBg: "bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(6,182,212,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]",
          metricName: "LOGS PARSED",
          metricValue: isConnected ? "482,881 logs" : "0 logs",
          activeAccent: "text-cyan-400"
        };
      case "suricata":
        return {
          icon: <ShieldCheck className="w-7 h-7 text-emerald-405" />,
          accentBg: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(16,185,129,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]",
          metricName: "SIGNATURES SYNCD",
          metricValue: isConnected ? "24,195 sigs" : "0 sigs",
          activeAccent: "text-emerald-400"
        };
      case "slack":
        return {
          icon: <MessageSquare className="w-7 h-7 text-indigo-405" />,
          accentBg: "bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(99,102,241,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]",
          metricName: "DELIVERY LIMIT",
          metricValue: isConnected ? "99.9% rate" : "0 / min",
          activeAccent: "text-indigo-400"
        };
      case "pfsense":
        return {
          icon: <ShieldAlert className="w-7 h-7 text-rose-500" />,
          accentBg: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(244,63,94,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]",
          metricName: "BLOCK RULE LIFESPAN",
          metricValue: isConnected ? "dynamic 24h" : "0 active",
          activeAccent: "text-rose-400"
        };
      case "smtp":
      case "twilio":
        return {
          icon: <Mail className="w-7 h-7 text-purple-400" />,
          accentBg: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
          accentGlow: "shadow-[inset_0_1px_1px_rgba(168,85,247,0.05)] shadow-black/80 hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]",
          metricName: "DISPATCH QUEUE",
          metricValue: isConnected ? "0 logs wait" : "standby",
          activeAccent: "text-purple-400"
        };
      default:
        return {
          icon: <Cpu className="w-7 h-7 text-slate-400" />,
          accentBg: "bg-slate-500/10 border-slate-500/25 group-hover:border-slate-500/40",
          accentGlow: "hover:shadow-[0_0_15px_-3px_rgba(148,163,184,0.15)]",
          metricName: "CONNECTED STATUS",
          metricValue: "Ready",
          activeAccent: "text-slate-400"
        };
    }
  };

  const sysConf = getServiceConfig(integration.iconName);

  const getCategoryEnglish = (categ: string) => {
    switch (categ) {
      case "inbound":
        return "Log Telemetry Ingestion";
      case "notifications":
        return "Command Room Notifier";
      case "security_actions":
        return "SOAR Automated Remediation";
      default:
        return categ;
    }
  };

  return (
    <div className={`bg-card/80 backdrop-blur-md rounded-xl border border-border p-5 flex flex-col justify-between h-67.5 relative transition-all duration-300 hover:border-cyan-500/30 group select-none overflow-hidden ${sysConf.accentGlow}`}>
      {/* Absolute cyber matrix layout indicators for premium look */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/1.5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-1 h-12 bg-linear-to-b from-cyan-500/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Main Upper Segment */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className={`p-3 bg-card border border-border rounded-xl transition-all duration-300 shadow-inner group-hover:scale-105 ${sysConf.accentBg}`}>
            {sysConf.icon}
          </div>
          
          {/* Active / Idle Status Banner */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8.5px] font-black uppercase tracking-widest transition-all duration-300 ${
            isConnected 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)] font-mono" 
              : "bg-muted text-muted-foreground border-border font-mono"
          }`}>
            <span className={`relative flex h-1.5 w-1.5 ${isConnected ? "animate-pulse" : ""}`}>
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConnected ? "bg-emerald-400" : "bg-muted-foreground/60"}`}></span>
            </span>
            <span>{isConnected ? "ACTIVE" : "STANDBY"}</span>
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[8.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block">
              {getCategoryEnglish(integration.category)}
            </span>
            <span className="text-muted-foreground/30 text-[9px]">•</span>
            <span className="text-[7.5px] font-mono text-cyan-500/60 font-bold uppercase tracking-widest">
              ID: {integration.id}
            </span>
          </div>

          <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-mono group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
            {integration.name}
          </h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 uppercase font-sans tracking-wide">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Real-time telemetry feed parameters specific to an enterprise platform */}
      <div className="mt-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between font-mono text-[8px] uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5 text-muted-foreground font-bold">
          <Gauge className="w-3.5 h-3.5 text-muted-foreground/80" />
          <span>{sysConf.metricName}:</span>
        </div>
        <span className={`font-black ${isConnected ? sysConf.activeAccent : 'text-muted-foreground'}`}>
          {sysConf.metricValue}
        </span>
      </div>

      {/* Connection management footer buttons */}
      <div className="border-t border-border pt-3.5 mt-3.5 flex items-center justify-between">
        <span className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wider">
          {isConnected && integration.configuredAt ? `SYNCED: ${integration.configuredAt}` : "OFFLINE // UNSET"}
        </span>

        <button
          onClick={() => onConfigureClick(integration)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition duration-300 relative overflow-hidden cursor-pointer ${
            isConnected
              ? "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border"
              : "bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-500 hover:to-indigo-500 text-white border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.12)] active:scale-95"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{isConnected ? "MANAGE NODE" : "PLUG SERVICE"}</span>
        </button>
      </div>

    </div>
  );
}
