import React, { useState } from "react";
import { EndpointAsset, getStatusBadgeColor } from "./endpointConfig";
import { EndpointOverviewTab } from "./EndpointOverviewTab";
import { EndpointNetworkTab } from "./EndpointNetworkTab";
import { EndpointSecurityTab } from "./EndpointSecurityTab";
import { EndpointAgentTab } from "./EndpointAgentTab";
import { cn } from "../../lib/utils";
import { X, Shield, Terminal, ZapOff, Ban, Download, ChevronRight } from "lucide-react";

interface EndpointDetailPanelProps {
  endpoint: EndpointAsset | null;
  onClose: () => void;
  onIsolateNode: (endpoint: EndpointAsset) => void;
  onBlockIp: (endpoint: EndpointAsset) => void;
  onExportReport: (endpoint: EndpointAsset) => void;
}

type TabType = "OVERVIEW" | "NETWORK" | "SECURITY" | "AGENT" | "LOGS";

export function EndpointDetailPanel({
  endpoint,
  onClose,
  onIsolateNode,
  onBlockIp,
  onExportReport,
}: EndpointDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");

  if (!endpoint) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-125 text-muted-foreground select-none relative overflow-hidden h-full">
        {/* Animated radar rings check */}
        <div className="absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping duration-3000" />
          <div className="w-12 h-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
              <path d="M9 9h6M9 13h6M9 17h3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest leading-none mb-1.5">
          NO ASSET SELECTED
        </h4>
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider max-w-52.5 leading-relaxed">
          Select any asset row in the SEC-INDEX database to view compiled real-time host forensic telemetry.
        </p>
      </div>
    );
  }

  const badge = getStatusBadgeColor(endpoint.status);

  // Risk circle gauge computation values
  const riskColor = endpoint.riskScore >= 80 ? "text-red-500" : endpoint.riskScore >= 50 ? "text-amber-500" : "text-emerald-500";
  const circleDashArray = 2 * Math.PI * 26; // radius 26
  const circleProgressOffset = circleDashArray - (endpoint.riskScore / 100) * circleDashArray;

  const renderTabContent = () => {
    switch (activeTab) {
      case "OVERVIEW":
        return <EndpointOverviewTab endpoint={endpoint} />;
      case "NETWORK":
        return <EndpointNetworkTab endpoint={endpoint} />;
      case "SECURITY":
        return <EndpointSecurityTab endpoint={endpoint} />;
      case "AGENT":
        return <EndpointAgentTab endpoint={endpoint} />;
      case "LOGS":
        return (
          <div className="space-y-3 animate-in fade-in duration-300">
            <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block px-1">
              Raw Syslog Stream (Real-Time Ingestion)
            </span>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[9px] text-zinc-400 overflow-y-auto max-h-80 space-y-2 select-text custom-scrollbar custom-terminal flex flex-col">
              {endpoint.rawLogs.length === 0 ? (
                <span className="text-zinc-600 text-center py-4">NO COMPLED SYSLOG PACKETS EXTRACTED</span>
              ) : (
                endpoint.rawLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-start leading-relaxed group hover:bg-zinc-900/40 p-1 rounded">
                    <span className="text-zinc-600 select-none shrink-0">{i + 1} &gt;</span>
                    <span className="text-zinc-300 truncate lowercase select-text selection:bg-cyan-500 selection:text-black">
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest px-1">
              <span>SOCKET STREAM: ATTACHED</span>
              <span>256-bit hash check verified</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="endpoint-detail-panel" className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between select-none shadow-md h-full relative">
      <div>
        
        {/* Detail Panel Header */}
        <div className="p-5 border-b border-border bg-card/65 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            
            {/* SVG circular gauge */}
            <div className="relative w-16 h-16 shrink-0 bg-background/50 rounded-full border border-border flex items-center justify-center select-none shadow-inner">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className="stroke-muted-foreground/10"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className={cn("transition-all duration-1000", riskColor)}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circleDashArray}
                  strokeDashoffset={circleProgressOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="z-10 text-center flex flex-col font-mono">
                <span className={cn("text-[13px] font-black leading-none", riskColor)}>
                  {endpoint.riskScore}%
                </span>
                <span className="text-[6.5px] text-muted-foreground uppercase font-semibold scale-90 mt-0.5">
                  RISK
                </span>
              </div>
            </div>

            {/* Asset quick details */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-mono font-black text-foreground uppercase tracking-wide truncate max-w-32.5" title={endpoint.hostname}>
                  {endpoint.hostname}
                </h4>
                
                {/* Status indicator */}
                <span className={cn(
                  "px-2 py-0.5 rounded-full border text-[7.5px] font-black uppercase tracking-widest",
                  badge.bg, badge.text, badge.border
                )}>
                  {endpoint.status}
                </span>
              </div>
              
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide">
                <span>ID: </span>
                <span className="text-cyan-500 font-extrabold">{endpoint.id}</span>
                <span className="mx-1.5 text-border">|</span>
                <span>IP: </span>
                <span className="text-foreground font-bold">{endpoint.ip}</span>
              </div>
              
              <p className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wider truncate max-w-42.5" title={endpoint.os}>
                {endpoint.os}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Small tabs switch bar */}
        <div className="px-3 bg-muted/40 border-b border-border flex items-center gap-1 font-mono text-[9px] overflow-x-auto select-none custom-scrollbar">
          {(["OVERVIEW", "NETWORK", "SECURITY", "AGENT", "LOGS"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-3 border-b-2 font-black uppercase tracking-wider transition-all cursor-pointer shrink-0",
                  isActive 
                    ? "border-b-cyan-500 text-cyan-500 font-bold" 
                    : "border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-border/60"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Body surface */}
        <div className="p-5 overflow-y-auto max-h-115 custom-scrollbar">
          {renderTabContent()}
        </div>

      </div>

      {/* Mitigation Action buttons at the bottom */}
      <div className="p-4 border-t border-border bg-card/65 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Export Node details */}
        <button
          onClick={() => onExportReport(endpoint)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-muted hover:bg-border text-muted-foreground hover:text-foreground border border-border rounded-xl text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer shrink-0"
        >
          <Download size={11} /> Config PDF
        </button>

        {/* BLOCK NETWORK IP */}
        <button
          disabled={endpoint.status === "OFFLINE"}
          onClick={() => onBlockIp(endpoint)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-xl text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer shrink-0",
            endpoint.status === "OFFLINE"
              ? "opacity-30 cursor-not-allowed bg-muted border-border text-zinc-600"
              : "bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border-border"
          )}
        >
          <Ban size={11} /> Block IP
        </button>

        {/* ISOLATE NODE OUT */}
        <button
          disabled={endpoint.status === "OFFLINE"}
          onClick={() => onIsolateNode(endpoint)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-xl text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer shrink-0",
            endpoint.status === "OFFLINE"
              ? "opacity-30 cursor-not-allowed bg-muted border-border text-zinc-600"
              : endpoint.status === "CRITICAL"
              ? "bg-red-600 hover:bg-red-500 text-white border-red-700 shadow-lg shadow-red-500/15"
              : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500/30"
          )}
        >
          <ZapOff size={11} /> Isolate HOST
        </button>

      </div>

    </div>
  );
}
