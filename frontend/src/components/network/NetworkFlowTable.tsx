import React, { useState, useMemo, useEffect } from "react";
import { Search, Binary } from "lucide-react";
import { NetworkLog } from "../network/NetworkConfig";

interface NetworkFlowTableProps {
  logs: NetworkLog[];
  selectedLog: NetworkLog | null;
  onSelectLog: (log: NetworkLog | null) => void;
  onActionFeedback: (feedback: { type: "success" | "warning"; message: string } | null) => void;
  selectedTopologyIP: string | null;
  selectedAssetIP: string | null;
}

export const NetworkFlowTable: React.FC<NetworkFlowTableProps> = ({
  logs,
  selectedLog,
  onSelectLog,
  onActionFeedback,
  selectedTopologyIP,
  selectedAssetIP,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Filter keys
  const [searchText, setSearchText] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // Reset page when filters or selection IP changes to avoid blank views
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopologyIP, selectedAssetIP, searchText, protocolFilter, serviceFilter, riskFilter]);

  // FILTERED LOGGER LOGS ARRAY (For the active Flow Table Explorer)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Check topology selection IP
      if (selectedTopologyIP && log.srcIp !== selectedTopologyIP && log.destIp !== selectedTopologyIP) {
        return false;
      }

      // 1.2 Check asset selection IP
      if (selectedAssetIP && log.srcIp !== selectedAssetIP && log.destIp !== selectedAssetIP) {
        return false;
      }
      
      // 2. Check search coordinates
      const term = searchText.trim().toLowerCase();
      if (term) {
        const srcMatch = log.srcIp.toLowerCase().includes(term);
        const destMatch = log.destIp.toLowerCase().includes(term);
        const uidMatch = log.id.toLowerCase().includes(term);
        const reasonMatch = log.reason.toLowerCase().includes(term);
        if (!srcMatch && !destMatch && !uidMatch && !reasonMatch) {
          return false;
        }
      }

      // 3. Check protocol selector
      if (protocolFilter !== "ALL" && log.protocol !== protocolFilter) {
        return false;
      }

      // 4. Check Service selector
      if (serviceFilter !== "ALL") {
        if (serviceFilter === "HTTP" && log.destPort !== 80) return false;
        if (serviceFilter === "HTTPS" && log.destPort !== 443) return false;
        if (serviceFilter === "SSH" && log.destPort !== 22) return false;
        if (serviceFilter === "DNS" && log.destPort !== 53 && log.srcPort !== 5353) return false;
        if (serviceFilter === "FTP" && log.destPort !== 21) return false;
        if (serviceFilter === "ICMP" && log.protocol !== "ICMP") return false;
      }

      // 5. Check risk score severity
      if (riskFilter !== "ALL") {
        if (riskFilter === "HIGH" && log.threatScore < 70) return false;
        if (riskFilter === "MEDIUM" && (log.threatScore < 30 || log.threatScore >= 70)) return false;
        if (riskFilter === "LOW" && log.threatScore >= 30) return false;
      }

      return true;
    });
  }, [logs, selectedTopologyIP, selectedAssetIP, searchText, protocolFilter, serviceFilter, riskFilter]);

  // Compute pagination bounds and paginated subset
  const totalPages = useMemo(() => {
    return Math.ceil(filteredLogs.length / itemsPerPage);
  }, [filteredLogs.length, itemsPerPage]);

  // Gracefully clamp pagination if filtered list shrinks, rather than auto-resetting to 1
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLogs = useMemo(() => {
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage, totalPages]);

  // Copy Reference Token helper
  const handleCopyReference = (logId: string) => {
    navigator.clipboard.writeText(logId);
    onActionFeedback({
      type: "success",
      message: `COPED REF ID: Flow token copied successfully [${logId.substring(0, 10)}]`
    });
  };

  return (
    <>
      {/* Real-time Explorer Filters Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
            ADVANCED REAL-TIME ZEEK CONN.LOG FIELD EXPLORER
          </h3>
        </div>

        {/* Filters dropdown parameters row */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {/* Search Text IP */}
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Node IP, UID, or Attack..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-7 pr-2 py-1 w-48 bg-background border border-border rounded focus:outline-none focus:border-emerald-505 text-foreground placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          {/* Protocol filter */}
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-background border border-border rounded py-1 px-1.5 text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
          >
            <option value="ALL">ALL PROTOCOLS (TCP/UDP/ICMP)</option>
            <option value="TCP">TCP ONLY</option>
            <option value="UDP">UDP ONLY</option>
            <option value="ICMP">ICMP DETECTOR</option>
          </select>

          {/* Service type filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-background border border-border rounded py-1 px-1.5 text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
          >
            <option value="ALL">ALL SERVICES</option>
            <option value="HTTP">HTTP (Port 80)</option>
            <option value="HTTPS">HTTPS (Port 443)</option>
            <option value="SSH font-mono">SSH (Port 22)</option>
            <option value="DNS font-mono">DNS Resolver</option>
            <option value="FTP font-mono">FTP File Relay</option>
          </select>

          {/* Risk category level filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-background border border-border rounded py-1 px-1.5 text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
          >
            <option value="ALL">ALL ACTIONS</option>
            <option value="HIGH">CRITICAL / HIGH THREAT (&gt;70)</option>
            <option value="MEDIUM">MEDIUM (30-70)</option>
            <option value="LOW">LOW VERDICT STATUS (&lt;30)</option>
          </select>
        </div>
      </div>

      {/* FLUID FLOW EVENT GRID TABLE */}
      <div className="overflow-x-auto border border-border rounded pr-1 bg-card">
        <table className="w-full text-left font-mono border-collapse divide-y divide-border/40">
          <thead className="bg-secondary/80 dark:bg-slate-900/80 sticky top-0 z-10 text-[9px] uppercase font-black text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">UID Identifier</th>
              <th className="px-3 py-2">Source Host (IP:Port)</th>
              <th className="px-3 py-2">Destination Host (IP:Port)</th>
              <th className="px-3 py-2">Protocol</th>
              <th className="px-3 py-2">Service</th>
              <th className="px-3 py-2">Conn.State</th>
              <th className="px-3 py-2 text-right">Size (Bytes)</th>
              <th className="px-3 py-2 text-center">AI1 Anomal-Score</th>
              <th className="px-3 py-2 text-center">AI2A Prediction</th>
              <th className="px-3 py-2 text-center">Security Status</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-[10px]">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground italic">
                  No active flows match selected operational parameter filter arrays.
                </td>
              </tr>
            ) : (
              paginatedLogs.map(log => {
                const isAnomaly = log.verdict === "ANOMALY";
                const sizeFormatted = log.origBytes >= 1024 * 1024 
                  ? `${(log.origBytes / (1024 * 1024)).toFixed(1)} MB` 
                  : log.origBytes >= 1024 
                  ? `${(log.origBytes / 1024).toFixed(1)} KB` 
                  : `${log.origBytes} B`;

                // Derive Service dynamically
                let svc = "Unknown";
                if (log.protocol === "ICMP") svc = "ICMP";
                else if (log.destPort === 80) svc = "HTTP";
                else if (log.destPort === 443) svc = "HTTPS";
                else if (log.destPort === 22) svc = "SSH";
                else if (log.destPort === 53 || log.srcPort === 5353) svc = "DNS";
                else if (log.destPort === 21) svc = "FTP";

                // Derive Connection State dynamically
                const state = log.destPort === 22 && isAnomaly
                  ? "REJ"
                  : isAnomaly && log.origBytes > 50000000
                  ? "RSTR"
                  : "SF";

                // Derive AI2A multiclass prediction name
                const ai2aPred = isAnomaly
                  ? log.reason.toLowerCase().includes("scan") || log.id.includes("scan")
                    ? "Port Scan"
                    : log.reason.toLowerCase().includes("leak") || log.reason.toLowerCase().includes("exfil")
                    ? "Botnet"
                    : log.destPort === 22
                    ? "Brute Force"
                    : "DoS"
                  : "Normal";

                const isSelected = selectedLog?.id === log.id;

                return (
                  <tr 
                    key={log.id}
                    className={`hover:bg-secondary/50 dark:hover:bg-slate-900/50 group h-8 transition-colors cursor-pointer border-b border-border/30 ${
                      isSelected
                        ? "bg-emerald-500/10 dark:bg-emerald-950/35 border-l-2 border-l-emerald-500 font-extrabold"
                        : isAnomaly 
                        ? "bg-red-500/5 dark:bg-red-950/5 hover:bg-red-500/10 dark:hover:bg-red-950/10" 
                        : "even:bg-secondary/15"
                    }`}
                    onClick={() => onSelectLog(log)}
                  >
                    <td className="px-3 py-1 text-muted-foreground/80 font-extrabold whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-3 py-1 text-slate-705 dark:text-slate-350 font-black whitespace-nowrap">{log.id}</td>
                    <td className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{log.srcIp}:{log.srcPort}</td>
                    <td className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{log.destIp}:{log.destPort}</td>
                    <td className="px-3 py-1 font-bold whitespace-nowrap">
                      <span className={`px-1 rounded text-[8.5px] font-black border uppercase ${
                        log.protocol === "TCP" ? "bg-blue-500/10 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-500/15" : "bg-purple-500/10 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-500/15"
                      }`}>
                        {log.protocol}
                      </span>
                    </td>
                    <td className="px-3 py-1 font-bold text-muted-foreground whitespace-nowrap">{svc}</td>
                    <td className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{state}</td>
                    <td className="px-3 py-1 text-right text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">{sizeFormatted}</td>
                    <td className="px-3 py-1 text-center font-bold whitespace-nowrap">
                      <span className={isAnomaly ? "text-red-500 dark:text-red-400 animate-pulse" : "text-emerald-600 dark:text-emerald-500 font-extrabold"}>
                        {log.threatScore}%
                      </span>
                    </td>
                    <td className="px-3 py-1 text-center font-extrabold whitespace-nowrap">
                      <span className={isAnomaly ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>{ai2aPred}</span>
                    </td>
                    <td className="px-3 py-1 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[8.5px] font-black tracking-widest rounded border ${
                        isAnomaly 
                          ? "bg-red-500/10 dark:bg-red-950 text-red-655 dark:text-red-400 border-red-500/20" 
                          : "bg-emerald-500/10 dark:bg-emerald-950 text-emerald-655 dark:text-emerald-400 border-emerald-500/20"
                      }`}>
                        {log.verdict}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyReference(log.id)}
                        className="opacity-0 group-hover:opacity-100 px-1 py-0.5 bg-secondary hover:bg-secondary-foreground hover:text-background dark:bg-slate-900 dark:hover:bg-slate-850 text-muted-foreground dark:text-slate-500 dark:hover:text-slate-200 rounded text-[8px] font-extrabold uppercase border border-border transition-all"
                        title="Copy Reference Token"
                      >
                        Copy ID
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS PANEL */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border border-border rounded-lg p-2 bg-secondary/30 dark:bg-slate-900/40 gap-2 text-[10.5px]">
          <div className="text-muted-foreground font-bold">
            Page <span className="text-foreground font-black">{currentPage}</span> of <span className="text-foreground font-black">{totalPages}</span>
            <span className="ml-1.5 font-sans text-[10px] normal-case font-normal text-muted-foreground/85">
              (Showing {paginatedLogs.length} of {filteredLogs.length} items)
            </span>
          </div>

          <div className="flex items-center gap-1 font-sans">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-0.5 bg-background border border-border hover:bg-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-background rounded text-[9px] font-extrabold cursor-pointer transition-colors"
              title="First Page"
            >
              &laquo;
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 bg-background border border-border hover:bg-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-background rounded text-[9px] font-extrabold cursor-pointer transition-colors"
            >
              PREV
            </button>

            {/* Numeric page buttons range */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold border cursor-pointer transition-all ${
                    currentPage === pageNum
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-background border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 bg-background border border-border hover:bg-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-background rounded text-[9px] font-extrabold cursor-pointer transition-colors"
            >
              NEXT
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 bg-background border border-border hover:bg-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-background rounded text-[9px] font-extrabold cursor-pointer transition-colors"
              title="Last Page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

      <div className="text-[9px] text-muted-foreground uppercase flex flex-col md:flex-row justify-between items-center gap-2">
        <span>Selected parameters matched {filteredLogs.length} of {logs.length} flows loaded inside active ZEEK RAM memory.</span>
        <span>Click any flow row to decode hexadecimal payload frame captures inline.</span>
      </div>
    </>
  );
};
