import React from "react";
import { Network, Shield, ChevronRight, Cloud, Lightbulb } from "lucide-react";
import { AssetNode } from "./types";
import { cn, getRiskColorClass } from "./utils";

interface AttackSurfaceMapProps {
  assets: AssetNode[];
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
}

export function AttackSurfaceMap({
  assets,
  selectedAssetId,
  setSelectedAssetId
}: AttackSurfaceMapProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              Hybrid-Cloud Security Infrastructure Map
            </h3>
            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              Zeek Flow Mapping &amp; Device Topology Nodes
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-700 uppercase">
          12 active endpoints
        </span>
      </div>

      {/* Topology Flow Canvas */}
      <div className="space-y-4 pt-1">
        
        {/* Internet Ingress Gateway Row (pfSense Center) */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-sm">
            <div className="text-center text-[9px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              EDGE FIREWALL FILTER
            </div>
            {assets.filter(a => a.location === "pfSense").map((node) => {
              const cl = getRiskColorClass(node.riskScore);
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedAssetId(node.id)}
                  className={cn(
                    "bg-slate-50 dark:bg-[#0B1220] border-2 rounded-lg p-2.5 transition-all cursor-pointer relative hover:scale-[1.02]",
                    cl.border,
                    selectedAssetId === node.id ? cn(cl.glow, "ring-2 ring-[#38BDF8]/40 scale-[1.02]") : "hover:border-slate-400 dark:hover:border-gray-600"
                  )}
                  id={`map-node-${node.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-left">
                      <Shield className={cn("w-4 h-4 shrink-0", cl.text)} />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none font-mono">
                          {node.name}
                        </p>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400">{node.ip}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-[9px] font-mono py-0.5 px-2 rounded-full font-black uppercase", cl.bg, cl.text)}>
                        Risk: {node.riskScore}
                      </span>
                      <span className="block text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase mt-0.5">
                        {node.connections.toLocaleString()} Conns
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow Connector Indicator Block */}
        <div className="flex justify-center -my-3 h-4">
          <div className="h-full w-0.5 bg-linear-to-b from-[#38BDF8]/40 to-transparent relative">
            <ChevronRight className="w-3 h-3 text-[#38BDF8]/60 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-90" />
          </div>
        </div>

        {/* Tiers Block Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* DMZ COLUMN */}
          <div className="bg-slate-50/75 dark:bg-[#0B1220]/70 border border-slate-205 dark:border-gray-800/80 rounded-lg p-3">
            <div className="text-center border-b border-slate-200 dark:border-gray-800/60 pb-1.5 mb-2.5">
              <span className="text-[9px] font-mono text-slate-650 dark:text-gray-400 tracking-widest font-bold uppercase block">
                DMZ Segment (External)
              </span>
              <span className="text-[8px] font-mono text-slate-450 dark:text-gray-500 uppercase">Public Facing Servers</span>
            </div>
            <div className="space-y-2">
              {assets.filter(a => a.location === "DMZ").map((node) => {
                const cl = getRiskColorClass(node.riskScore);
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedAssetId(node.id)}
                    className={cn(
                      "bg-white dark:bg-[#111827] border rounded-lg p-2.5 transition-all cursor-pointer relative hover:scale-[1.02] text-left",
                      selectedAssetId === node.id ? cn(cl.border, cl.glow, "ring-1 ring-[#38BDF8] scale-[1.02]") : "border-slate-200 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-600"
                    )}
                    id={`map-node-${node.id}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9.5px] font-bold font-mono text-slate-900 dark:text-white truncate block 27.5">
                        {node.name}
                      </span>
                      <span className={cn("text-[8px] font-mono font-black px-1 rounded uppercase", cl.bg, cl.text)}>
                        {node.riskScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 dark:text-gray-400">
                      <span>{node.ip}</span>
                      <span className="text-[7.5px] text-slate-400 dark:text-gray-500 uppercase">{node.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secure Internal Core VLAN COLUMN */}
          <div className="bg-slate-50/75 dark:bg-[#0B1220]/70 border border-slate-205 dark:border-gray-800/80 rounded-lg p-3">
            <div className="text-center border-b border-slate-200 dark:border-gray-800/60 pb-1.5 mb-2.5">
              <span className="text-[9px] font-mono text-slate-650 dark:text-gray-400 tracking-widest font-bold uppercase block">
                Internal Core LAN
              </span>
              <span className="text-[8px] font-mono text-slate-450 dark:text-gray-500 uppercase">Isolated VLAN Subnet</span>
            </div>
            <div className="space-y-2">
              {assets.filter(a => a.location === "Internal Network").map((node) => {
                const cl = getRiskColorClass(node.riskScore);
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedAssetId(node.id)}
                    className={cn(
                      "bg-white dark:bg-[#111827] border rounded-lg p-2.5 transition-all cursor-pointer relative hover:scale-[1.02] text-left",
                      selectedAssetId === node.id ? cn(cl.border, cl.glow, "ring-1 ring-[#38BDF8] scale-[1.02]") : "border-slate-200 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-600"
                    )}
                    id={`map-node-${node.id}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9.5px] font-bold font-mono text-slate-900 dark:text-white truncate block 27.5">
                        {node.name}
                      </span>
                      <span className={cn("text-[8px] font-mono font-black px-1 rounded uppercase", cl.bg, cl.text)}>
                        {node.riskScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 dark:text-gray-400">
                      <span>{node.ip}</span>
                      <span className="text-[7.5px] text-slate-400 dark:text-gray-500 uppercase">{node.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AWS CLOUD SUITE COLUMN */}
          <div className="bg-slate-50/75 dark:bg-[#0B1220]/70 border border-slate-205 dark:border-gray-800/80 rounded-lg p-3">
            <div className="text-center border-b border-slate-200 dark:border-gray-800/60 pb-1.5 mb-2.5">
              <span className="text-[9px] tracking-widest font-bold uppercase flex items-center justify-center gap-1 text-[#38BDF8]">
                <Cloud className="w-3 h-3 text-[#38BDF8]" />
                AWS VPC US-EAST-1
              </span>
              <span className="text-[8px] font-mono text-slate-450 dark:text-gray-500 uppercase">Production Cloud Hub</span>
            </div>
            <div className="space-y-2">
              {assets.filter(a => a.location === "AWS Cloud").map((node) => {
                const cl = getRiskColorClass(node.riskScore);
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedAssetId(node.id)}
                    className={cn(
                      "bg-white dark:bg-[#111827] border rounded-lg p-2.5 transition-all cursor-pointer relative hover:scale-[1.02] text-left",
                      selectedAssetId === node.id ? cn(cl.border, cl.glow, "ring-1 ring-[#38BDF8] scale-[1.02]") : "border-slate-200 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-600"
                    )}
                    id={`map-node-${node.id}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9.5px] font-bold font-mono text-slate-900 dark:text-white truncate block 27.5">
                        {node.name}
                      </span>
                      <span className={cn("text-[8px] font-mono font-black px-1 rounded uppercase", cl.bg, cl.text)}>
                        {node.riskScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#38BDF8]">
                      <span>AWS Resource</span>
                      <span className="text-[7.5px] text-slate-400 dark:text-gray-400 uppercase">{node.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
        
        {/* Action hint block */}
        <div className="text-center text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase mt-4 flex items-center justify-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Click any device node to extract full Zeek telemetry and Suricata evidence.</span>
        </div>

      </div>
    </div>
  );
}
