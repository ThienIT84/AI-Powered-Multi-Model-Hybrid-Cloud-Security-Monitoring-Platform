import React from "react";
import { ShieldAlert, Search } from "lucide-react";
import { AssetNode } from "./types";
import { cn, getRiskColorClass } from "./utils";

interface HighRiskAssetsPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredAssetsTable: AssetNode[];
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
}

export function HighRiskAssetsPanel({
  searchTerm,
  setSearchTerm,
  filteredAssetsTable,
  selectedAssetId,
  setSelectedAssetId
}: HighRiskAssetsPanelProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800 gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              Current High Risk Assets Monitor
            </h3>
            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              Vulnerability, Exposure and Alert metrics database
            </span>
          </div>
        </div>

        {/* Search filter input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Seach asset identifier / location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded px-2.5 py-1 text-xs font-mono text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-slate-350 dark:focus:border-gray-650 focus:ring-1 focus:ring-slate-350 dark:focus:ring-gray-650"
            id="asset-search-input"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 border-collapse text-left text-xs font-mono" id="high-risk-assets-table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-[#0B1220]/40">
              <th className="py-2.5 px-3">Asset identifier</th>
              <th className="py-2.5 px-3">Asset Type</th>
              <th className="py-2.5 px-3">VLAN Location</th>
              <th className="py-2.5 px-3 text-right">Risk Factor</th>
              <th className="py-2.5 px-3 text-right">Alerts State</th>
              <th className="py-2.5 px-3">Last Checked</th>
              <th className="py-2.5 px-3 text-right">SOC Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
            {filteredAssetsTable.map((node) => {
              const cl = getRiskColorClass(node.riskScore);
              return (
                <tr
                  key={node.id}
                  className="hover:bg-slate-50 dark:hover:bg-gray-800/20 transition-colors uppercase text-[11px] text-slate-700 dark:text-gray-300"
                  id={`asset-tr-${node.id}`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-mono">
                    {node.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-gray-400 font-mono">
                    {node.type}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800/70 text-slate-600 dark:text-gray-400 text-[10px] rounded border border-slate-200 dark:border-gray-700">
                      {node.location}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className={cn("px-2 py-0.5 rounded font-black", cl.bg, cl.text)}>
                      {node.riskScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-500 dark:text-rose-400">
                    {node.suricataAlerts.length > 0 ? (
                      <span className="bg-rose-500/10 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20 animate-pulse">
                        {node.suricataAlerts.length} Active
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">0 Alerts</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 dark:text-gray-505 font-mono">
                    {node.id === "web-server-01" ? "10 sec ago" : "Just now"}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedAssetId(node.id)}
                      className="bg-slate-100 hover:bg-[#38BDF8]/10 dark:bg-gray-800/80 hover:border-[#38BDF8]/30 hover:text-[#38BDF8] border border-slate-250 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-black uppercase text-[9px] px-2.5 py-1 rounded transition-all cursor-pointer"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredAssetsTable.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400 dark:text-gray-600 font-mono">
                  No asset matched search parameter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
