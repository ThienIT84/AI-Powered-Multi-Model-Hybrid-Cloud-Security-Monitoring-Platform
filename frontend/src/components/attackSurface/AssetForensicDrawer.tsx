import React from "react";
import { ShieldAlert, X, Radio, Brain, Flame, AlertTriangle, ShieldCheck, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AssetNode } from "./types";
import { cn, getRiskColorClass } from "./utils";

interface AssetForensicDrawerProps {
  activeAsset: AssetNode | null;
  setSelectedAssetId: (id: string | null) => void;
}

export function AssetForensicDrawer({
  activeAsset,
  setSelectedAssetId
}: AssetForensicDrawerProps) {
  return (
    <AnimatePresence>
      {activeAsset && (
        <>
          {/* Dark out-focus backdrop shadow overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAssetId(null)}
            className="fixed inset-0 bg-black z-40"
            id="forensic-drawer-backdrop"
          />

          {/* Sliding Container Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-125 bg-white dark:bg-[#0E1525] border-l border-slate-200 dark:border-gray-800/80 shadow-2xl z-50 overflow-y-auto p-5 sm:p-6 text-left"
            id="forensic-drawer-body"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-gray-800 mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                    Asset Forensic Investigation Panel
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest leading-none block mt-1.5">
                    IDENTIFIER: {activeAsset.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetId(null)}
                className="p-1 px-1.5 rounded bg-slate-100 dark:bg-gray-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 text-slate-500 dark:text-gray-400 transition-all border border-slate-200 dark:border-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Asset generic labels parameters card */}
            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-4 mb-5 space-y-3 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-gray-800">
                <div>
                  <span className="text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase block">
                    Host name URL
                  </span>
                  <span className="text-sm font-black text-slate-950 dark:text-white font-mono">
                    {activeAsset.name}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase block text-right">
                    IPV4 ADDRESS
                  </span>
                  <span className="text-xs font-black text-cyan-600 dark:text-[#38BDF8] font-mono text-right block">
                    {activeAsset.ip}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                <div>
                  <span className="text-[8.5px] text-slate-450 dark:text-gray-500 uppercase block">VLAN SEGMENT</span>
                  <span className="text-slate-700 dark:text-gray-300 font-bold uppercase">{activeAsset.location}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-455 dark:text-gray-500 uppercase block">ENV GROUP</span>
                  <span className="text-slate-700 dark:text-gray-300 font-bold uppercase">{activeAsset.environment}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-455 dark:text-gray-500 uppercase block">Service daemon</span>
                  <span className="text-slate-700 dark:text-gray-300 font-bold uppercase truncate block max-w-45">
                    {activeAsset.service}
                  </span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-455 dark:text-gray-500 uppercase block">Team Owner</span>
                  <span className="text-slate-700 dark:text-gray-300 font-bold uppercase">{activeAsset.owner}</span>
                </div>
              </div>
            </div>

            {/* Telemetry and exposure scores section */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-850 rounded-lg p-3 text-center shadow-sm dark:shadow-none">
                <span className="text-[8px] font-mono text-slate-450 dark:text-gray-500 uppercase block mb-1">
                  AGENCY RISK SCORE
                </span>
                <p className="text-3xl font-black text-rose-500 tracking-tighter font-mono">
                  {activeAsset.riskScore}
                </p>
                <span
                  className={cn(
                    "text-[8px] font-mono bg-rose-500/15 text-rose-550 dark:text-rose-400 font-black border border-rose-500/25 py-0.5 px-2 rounded-full uppercase inline-block mt-1",
                    getRiskColorClass(activeAsset.riskScore).bg,
                    getRiskColorClass(activeAsset.riskScore).text
                  )}
                >
                  {activeAsset.exposureLevel}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-855 rounded-lg p-3 text-center shadow-sm dark:shadow-none">
                <span className="text-[8px] font-mono text-slate-450 dark:text-gray-500 uppercase block mb-1 font-bold">
                  ZEEK CONNECT LOOPS
                </span>
                <p className="text-2xl font-black text-cyan-600 dark:text-[#38BDF8] font-mono leading-none pt-0.5">
                  {activeAsset.connections.toLocaleString()}
                </p>
                <span className="text-[8px] font-mono text-slate-400 dark:text-gray-400 uppercase tracking-widest block leading-none mt-2 font-bold">
                  Active sockets
                </span>
              </div>
            </div>

            {/* TAB SECTION: ZEEK TELEMETRY SERVICES */}
            <div className="mb-5 text-left">
              <span className="text-[9px] font-mono text-cyan-600 dark:text-[#38BDF8] tracking-widest uppercase mb-2.5 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-[#38BDF8]" />
                <span>Zeek Flow Analyzer (Top Services)</span>
              </span>
              <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-855 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                <table className="w-full border-collapse text-[10.5px] font-mono text-slate-700 dark:text-gray-300">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-gray-900/50 text-[8px] uppercase tracking-wider text-slate-450 dark:text-gray-500 border-b border-slate-200 dark:border-gray-800">
                      <th className="py-2 px-3 text-left">PROT SERVICE</th>
                      <th className="py-2 px-3 text-right">Sockets Loop Count</th>
                      <th className="py-2 px-3 text-right">SOCKET TYPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-gray-850">
                    {activeAsset.topServices.map((svc) => (
                      <tr key={svc.service} className="hover:bg-slate-100/50 dark:hover:bg-gray-855/50">
                        <td className="py-1.5 px-3 text-slate-900 dark:text-white font-bold">{svc.service}</td>
                        <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                          {svc.count.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-3 text-right text-slate-400 dark:text-gray-400">{svc.proto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SYSTEM AI FINDINGS ANALYSIS */}
            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-855 rounded-lg p-4 mb-5 text-left shadow-sm dark:shadow-none">
              <span className="text-[9px] font-mono text-cyan-600 dark:text-[#38BDF8] tracking-widest uppercase mb-2 font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-600 dark:text-[#38BDF8]" />
                <span>Multi-Model AI Detection &amp; Fusion Findings</span>
              </span>

              <div className="space-y-3 mt-2 text-xs font-mono">
                <div className="p-2.5 bg-white dark:bg-[#0B1220]/75 border border-slate-200 dark:border-gray-800 rounded">
                  <span className="text-[8.5px] text-slate-450 dark:text-gray-500 uppercase block font-bold">
                    AI1 (Core Network Anomaly Threshold)
                  </span>
                  <p className="text-slate-800 dark:text-gray-200 mt-0.5">{activeAsset.aiFindings.aiMin}</p>
                </div>
                {activeAsset.aiFindings.aiClass && (
                  <div className="p-2.5 bg-white dark:bg-[#0B1220]/75 border border-slate-200 dark:border-gray-800 rounded">
                    <span className="text-[8.5px] text-[#22C55E] uppercase block font-bold">
                      AI2A (Exploit Pattern Classifier)
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Threat Signature: {activeAsset.aiFindings.aiClass}</span>
                    </p>
                  </div>
                )}
                {activeAsset.aiFindings.aiHTTP && (
                  <div className="p-2.5 bg-white dark:bg-[#0B1220]/75 border border-slate-200 dark:border-gray-800 rounded">
                    <span className="text-[8.5px] text-purple-605 dark:text-purple-400 block uppercase font-bold">
                      AI2B (HTTP Parameter Semantic Analyzer)
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Action Payload: {activeAsset.aiFindings.aiHTTP}</span>
                    </p>
                  </div>
                )}
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded">
                  <span className="text-[8.5px] text-red-600 dark:text-red-400 block uppercase font-bold">
                    Bayesian Alert Fusion Layer Result
                  </span>
                  <p className="text-red-500 dark:text-red-400 mt-0.5 font-black uppercase text-[11px] font-mono flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Outcome: {activeAsset.aiFindings.fusion}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* SURICATA INCIDENTS ALERTS EVIDENCE */}
            <div className="mb-5 text-left">
              <span className="text-[9px] font-mono text-orange-500 dark:text-orange-400 tracking-widest uppercase mb-2.5 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Suricata Threat Incidents Forensic Evidence</span>
              </span>
              <div className="space-y-2">
                {activeAsset.suricataAlerts.length > 0 ? (
                  activeAsset.suricataAlerts.map((sig) => (
                    <div
                      key={sig.sigId}
                      className="bg-rose-500/5 border border-rose-500/15 p-2.5 rounded-lg font-mono"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8.5px] font-black text-rose-500 dark:text-rose-400 select-all">
                          {sig.sigId}
                        </span>
                        <span className="text-[8.5px] bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded px-1 font-bold">
                          {sig.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase">{sig.category}</p>
                      <span className="text-[9.5px] text-slate-400 dark:text-gray-505 block text-right mt-1">
                        Logged: {sig.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-850 p-4 rounded text-center text-xs font-mono text-slate-400 dark:text-gray-505 shadow-sm dark:shadow-none">
                    No matching Suricata alert logs recorded in index.
                  </div>
                )}
              </div>
            </div>

            {/* MITRE MATRIX TAGS MAPS */}
            {activeAsset.mitre.length > 0 && (
              <div className="text-left">
                <span className="text-[9px] font-mono text-amber-500 tracking-widest uppercase mb-2 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Associated Mitre ATT&amp;CK matrix tactics</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeAsset.mitre.map((tact) => (
                    <span
                      key={tact}
                      className="font-mono text-[9px] font-black px-2 py-1 rounded bg-slate-50 dark:bg-[#111827] text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-amber-500/20 uppercase flex items-center gap-1"
                    >
                      <Search className="w-3 h-3 text-amber-500" />
                      <span>ID: {tact}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
