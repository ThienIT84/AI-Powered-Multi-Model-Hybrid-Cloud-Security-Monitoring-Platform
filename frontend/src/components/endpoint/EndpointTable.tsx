import React, { useState } from "react";
import { EndpointAsset, getStatusBadgeColor } from "./endpointConfig";
import { cn } from "../../lib/utils";
import { ShieldAlert, Server, Trash, Globe, MapPin, Eye, ZapOff, Ban, ChevronLeft, ChevronRight } from "lucide-react";

interface EndpointTableProps {
  endpoints: EndpointAsset[];
  onSelectEndpoint: (endpoint: EndpointAsset) => void;
  selectedEndpointId?: string;
  onIsolateNode: (endpoint: EndpointAsset) => void;
  onBlockIp: (endpoint: EndpointAsset) => void;
}

export function EndpointTable({
  endpoints,
  onSelectEndpoint,
  selectedEndpointId,
  onIsolateNode,
  onBlockIp,
}: EndpointTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(endpoints.length / itemsPerPage);

  // Paginate list
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEndpoints = endpoints.slice(startIndex, startIndex + itemsPerPage);

  const getRiskScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    if (score >= 50) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  };

  const getRiskScoreTextColor = (score: number) => {
    if (score >= 80) return "text-red-500 font-black";
    if (score >= 50) return "text-amber-500 font-bold";
    return "text-emerald-500";
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between select-none">
      
      {/* Table Title and Pulse indicator */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 text-cyan-500" />
          <h3 className="text-xs font-mono font-black text-foreground uppercase tracking-widest leading-none">
            CONNECTED ASSETS INDEX ({endpoints.length})
          </h3>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-[8px] font-mono font-black text-emerald-500 uppercase tracking-widest leading-none">
              REAL-TIME SYNC
            </span>
          </div>
        </div>
        
        {/* Pagination indicator */}
        <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-wider">
          PAGE {currentPage} OF {totalPages || 1}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest select-none">
              <th className="px-5 py-3.5">ENDPOINT ID</th>
              <th className="px-5 py-3.5">HOSTNAME</th>
              <th className="px-5 py-3.5">IP ADDRESS</th>
              <th className="px-5 py-3.5">TYPE / CLOUD</th>
              <th className="px-5 py-3.5">GEOGRAPHY</th>
              <th className="px-5 py-3.5 text-center">STATUS</th>
              <th className="px-5 py-3.5 max-w-35">AI RISK SCORE</th>
              <th className="px-5 py-3.5 text-right">MITIGATION CONTROLS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayedEndpoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                  NO ENDPOINTS FOUND MATCHING CHOSEN SOC QUERIES.
                </td>
              </tr>
            ) : (
              displayedEndpoints.map((ep) => {
                const badge = getStatusBadgeColor(ep.status);
                const isSelected = selectedEndpointId === ep.id;

                return (
                  <tr
                    key={ep.id}
                    onClick={() => onSelectEndpoint(ep)}
                    className={cn(
                      "group cursor-pointer transition-all duration-150 select-none text-[11px]",
                      isSelected 
                        ? "bg-cyan-500/5 dark:bg-cyan-500/10 hover:bg-cyan-500/10 text-foreground border-l-2 border-l-cyan-500" 
                        : "hover:bg-muted/20 text-foreground/90 border-l-2 border-l-transparent"
                    )}
                  >
                    {/* Endpoint ID */}
                    <td className="px-5 py-3.5 font-bold font-mono tracking-widest text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 transition-colors">
                      {ep.id}
                    </td>

                    {/* Hostname */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-foreground uppercase tracking-wide truncate max-w-40">
                          {ep.hostname}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase mt-0.5 font-mono">
                          {ep.os.split("(")[0]}
                        </span>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="px-5 py-3.5 font-bold font-mono tracking-wider text-muted-foreground dark:text-zinc-300">
                      {ep.ip}
                    </td>

                    {/* Type and Provider */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-muted text-foreground text-[8px] font-black uppercase tracking-wider">
                          {ep.type}
                        </span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase border font-mono tracking-wider",
                          ep.provider === "AWS" ? "text-orange-500 bg-orange-500/5 border-orange-500/15" :
                          ep.provider === "Azure" ? "text-blue-500 bg-blue-500/5 border-blue-500/15" :
                          "text-red-500 bg-red-500/5 border-red-500/15"
                        )}>
                          {ep.provider}
                        </span>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-muted-foreground/60 shrink-0" />
                        <span className="uppercase tracking-wide">{ep.region}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full border text-[8.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5",
                          badge.bg, badge.text, badge.border
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", badge.dot, ep.status !== "OFFLINE" && "animate-pulse")} />
                          {ep.status}
                        </span>
                      </div>
                    </td>

                    {/* AI Risk Score % bar segment */}
                    <td className="px-5 py-3.5 max-w-35 select-none font-mono">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className={cn("font-black uppercase tracking-wider", getRiskScoreTextColor(ep.riskScore))}>
                            {ep.riskScore}% RISK
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/80">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", getRiskScoreBarColor(ep.riskScore))}
                            style={{ width: `${Math.max(4, ep.riskScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Direct action triggers */}
                    <td className="px-5 py-3.5 text-right font-mono" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details trigger */}
                        <button
                          onClick={() => onSelectEndpoint(ep)}
                          title="View Details"
                          className="p-1.5 bg-muted/60 text-muted-foreground hover:text-cyan-500 hover:bg-muted border border-border rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>

                        {/* Isolate Node (only active for WAN/CRIT nodes) */}
                        <button
                          disabled={ep.status === "OFFLINE"}
                          onClick={() => onIsolateNode(ep)}
                          title="Isolate Host Asset"
                          className={cn(
                            "p-1.5 border rounded-lg transition-all cursor-pointer",
                            ep.status === "OFFLINE" 
                              ? "opacity-30 cursor-not-allowed bg-muted border-border text-zinc-600"
                              : ep.status === "CRITICAL"
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/30"
                              : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                          )}
                        >
                          <ZapOff size={12} />
                        </button>

                        {/* Block IP Address */}
                        <button
                          disabled={ep.status === "OFFLINE"}
                          onClick={() => onBlockIp(ep)}
                          title="Block Network Gateway IP"
                          className={cn(
                            "p-1.5 border rounded-lg transition-all cursor-pointer",
                            ep.status === "OFFLINE"
                              ? "opacity-30 cursor-not-allowed bg-muted border-border text-zinc-600"
                              : "bg-muted/60 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border-border"
                          )}
                        >
                          <Ban size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border flex items-center justify-between font-mono bg-card/40">
          <span className="text-[10px] text-muted-foreground uppercase">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, endpoints.length)} of {endpoints.length} assets
          </span>
          
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={cn(
                "p-1.5 bg-muted/60 hover:bg-muted border border-border rounded-lg text-foreground transition-all flex items-center justify-center cursor-pointer",
                currentPage === 1 && "opacity-30 cursor-not-allowed hover:bg-muted/60 text-muted-foreground"
              )}
            >
              <ChevronLeft size={14} />
            </button>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={cn(
                "p-1.5 bg-muted/60 hover:bg-muted border border-border rounded-lg text-foreground transition-all flex items-center justify-center cursor-pointer",
                currentPage === totalPages && "opacity-30 cursor-not-allowed hover:bg-muted/60 text-muted-foreground"
              )}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
