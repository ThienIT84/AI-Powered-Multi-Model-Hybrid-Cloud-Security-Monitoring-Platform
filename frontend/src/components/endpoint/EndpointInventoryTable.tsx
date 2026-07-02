import React, { useMemo } from "react";
import { Server, FileSpreadsheet, Search, ZapOff, Ban } from "lucide-react";
import { cn } from "../../lib/utils";
import { EndpointFCAJItem } from "./endpointFCAJData";

interface EndpointInventoryTableProps {
  filteredEndpoints: EndpointFCAJItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortField: keyof EndpointFCAJItem;
  setSortField: (field: keyof EndpointFCAJItem) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  visibleCols: {
    hostname: boolean;
    ip: boolean;
    deviceType: boolean;
    os: boolean;
    role: boolean;
    alertCount: boolean;
    riskScore: boolean;
    healthScore: boolean;
    status: boolean;
  };
  setVisibleCols: React.Dispatch<React.SetStateAction<{
    hostname: boolean;
    ip: boolean;
    deviceType: boolean;
    os: boolean;
    role: boolean;
    alertCount: boolean;
    riskScore: boolean;
    healthScore: boolean;
    status: boolean;
  }>>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onIsolate: (ep: EndpointFCAJItem) => void;
  onBlockIp: (ep: EndpointFCAJItem) => void;
  onExportCSV: () => void;
}

export const EndpointInventoryTable: React.FC<EndpointInventoryTableProps> = ({
  filteredEndpoints,
  selectedId,
  setSelectedId,
  isDrawerOpen,
  setIsDrawerOpen,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  visibleCols,
  setVisibleCols,
  currentPage,
  setCurrentPage,
  onIsolate,
  onBlockIp,
  onExportCSV,
}) => {
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredEndpoints.length / itemsPerPage);

  const displayedEndpoints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEndpoints.slice(start, start + itemsPerPage);
  }, [filteredEndpoints, currentPage]);

  const handleSort = (field: keyof EndpointFCAJItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleCol = (colName: keyof typeof visibleCols) => {
    setVisibleCols(prev => ({ ...prev, [colName]: !prev[colName] }));
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between overflow-hidden" id="endpoint-inventory-table-container">
      {/* Filter controls header */}
      <div className="p-4 border-b border-border bg-muted/40 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-slate-500" />
            <h2 className="text-xs font-black uppercase tracking-wider">Asset Catalog Index ({filteredEndpoints.length})</h2>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* CSV export */}
            <button 
              id="export-csv-btn"
              onClick={onExportCSV}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/85 border border-border text-foreground hover:border-muted-foreground/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet size={12} /> CSV
            </button>

            {/* Column visibility drop overlay simple toggler */}
            <div className="relative group">
              <button 
                id="toggle-columns-btn"
                className="px-3 py-1.5 bg-indigo-500/10 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-505/20 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Columns Visibility
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-card border border-border p-2.5 rounded-lg z-30 shadow-xl space-y-1 w-44 font-mono text-[9px]">
                {Object.keys(visibleCols).map(col => (
                  <label key={col} className="flex items-center gap-2 p-1 hover:bg-secondary rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={visibleCols[col as keyof typeof visibleCols]} 
                      onChange={() => toggleCol(col as keyof typeof visibleCols)}
                      className="accent-cyan-404"
                    />
                    <span className="uppercase text-foreground font-mono">{col.replace(/([A-Z])/g, " $1")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sub row: inputs for queries */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              id="endpoint-search-input"
              type="text" 
              placeholder="Search Host / IP..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-background text-foreground border border-border focus:border-indigo-500 dark:focus:border-cyan-404 outline-none rounded-lg font-mono placeholder:text-muted-foreground"
            />
          </div>

          <select 
            id="type-filter-select"
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-2 bg-background border border-border text-foreground rounded-lg text-[10px] font-mono focus:border-indigo-500 dark:focus:border-cyan-404 outline-none cursor-pointer"
          >
            <option value="ALL">ALL DEVICE TYPES</option>
            <option value="Server">SERVER</option>
            <option value="Workstation">WORKSTATION</option>
            <option value="Firewall">FIREWALL</option>
            <option value="Sensor">SENSOR</option>
            <option value="Unknown">UNKNOWN</option>
          </select>

          <select 
            id="role-filter-select"
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1.5 px-2 bg-background border border-border text-foreground rounded-lg text-[10px] font-mono focus:border-indigo-500 dark:focus:border-cyan-404 outline-none cursor-pointer"
          >
            <option value="ALL">ALL ROLES</option>
            <option value="Web Server">WEB SERVER</option>
            <option value="Database Server">DATABASE SERVER</option>
            <option value="User VM">USER VM</option>
            <option value="Admin VM">ADMIN VM</option>
            <option value="Zeek Sensor">ZEEK SENSOR</option>
            <option value="Suricata Sensor">SURICATA SENSOR</option>
            <option value="Kali Attacker">KALI ATTACKER</option>
          </select>

          <select 
            id="status-filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 bg-background border border-border text-foreground rounded-lg text-[10px] font-mono focus:border-indigo-500 dark:focus:border-cyan-404 outline-none cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Healthy">HEALTHY</option>
            <option value="Warning">WARNING</option>
            <option value="Critical">CRITICAL</option>
            <option value="Offline">OFFLINE</option>
          </select>
        </div>
      </div>

      {/* Real Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px] min-w-175">
          <thead>
            <tr className="bg-muted/40 text-[10px] font-black text-muted-foreground uppercase tracking-wider border-b border-border">
              {visibleCols.hostname && (
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("hostname")}>
                  Hostname {sortField === "hostname" && (sortOrder === "asc" ? "^" : "v")}
                </th>
              )}
              {visibleCols.ip && (
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("ip")}>
                  IP Address {sortField === "ip" && (sortOrder === "asc" ? "^" : "v")}
                </th>
              )}
              {visibleCols.deviceType && <th className="px-4 py-3">Type</th>}
              {visibleCols.os && <th className="px-4 py-3">OS</th>}
              {visibleCols.role && <th className="px-4 py-3">Role</th>}
              {visibleCols.alertCount && (
                <th className="px-4 py-3 text-center cursor-pointer select-none" onClick={() => handleSort("alertCount")}>
                  Alerts {sortField === "alertCount" && (sortOrder === "asc" ? "^" : "v")}
                </th>
              )}
              {visibleCols.riskScore && (
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("riskScore")}>
                  Risk Score {sortField === "riskScore" && (sortOrder === "asc" ? "^" : "v")}
                </th>
              )}
              {visibleCols.healthScore && (
                <th className="px-2 py-3 text-center cursor-pointer select-none" onClick={() => handleSort("healthScore")}>
                  Health {sortField === "healthScore" && (sortOrder === "asc" ? "^" : "v")}
                </th>
              )}
              {visibleCols.status && <th className="px-3 py-3 text-center">Status</th>}
              <th className="px-4 py-3 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
            {displayedEndpoints.map(ep => {
              const isSelected = selectedId === ep.id;
              return (
                <tr 
                  key={ep.id}
                  onClick={() => { 
                    if (selectedId === ep.id) {
                      setSelectedId(null);
                      setIsDrawerOpen(false);
                    } else {
                      setSelectedId(ep.id);
                      setIsDrawerOpen(true);
                    }
                  }}
                  className={cn(
                    "cursor-pointer group hover:bg-secondary/40 transition-all border-b border-border/50",
                    isSelected && "bg-secondary dark:bg-secondary/50 border-l-2 border-l-cyan-400"
                  )}
                >
                  {visibleCols.hostname && (
                    <td className="px-4 py-3 font-semibold dark:text-zinc-200 font-mono">
                      {ep.hostname}
                    </td>
                  )}
                  {visibleCols.ip && <td className="px-4 py-3 text-muted-foreground">{ep.ip}</td>}
                  {visibleCols.deviceType && (
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted uppercase tracking-widest font-black text-muted-foreground">
                        {ep.deviceType}
                      </span>
                    </td>
                  )}
                  {visibleCols.os && <td className="px-4 py-3 text-muted-foreground font-sans text-[10px]">{ep.os}</td>}
                  {visibleCols.role && <td className="px-4 py-3 text-muted-foreground font-sans text-[10px]">{ep.role}</td>}
                  {visibleCols.alertCount && (
                    <td className="px-4 py-3 text-center">
                      {ep.alertCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 dark:bg-red-950/40 text-red-500 animate-pulse">
                          {ep.alertCount}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  )}
                  {visibleCols.riskScore && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-bold text-[10px]",
                          ep.riskScore > 75 ? "text-red-500" : ep.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {ep.riskScore}
                        </span>
                        <div className="hidden sm:block w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              ep.riskScore > 75 ? "bg-red-500" : ep.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${ep.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleCols.healthScore && (
                    <td className="px-2 py-3 text-center">
                      <span className={cn(
                        "text-[10px] font-black font-mono px-1 py-0.5 rounded",
                        ep.healthScore >= 90 ? "text-emerald-500 dark:bg-emerald-950/20" :
                        ep.healthScore >= 70 ? "text-amber-500 dark:bg-amber-950/20" :
                        ep.healthScore >= 50 ? "text-orange-500 dark:bg-orange-950/20" :
                        "text-red-500 dark:bg-red-950/20 animate-pulse"
                      )}>
                        {ep.healthScore}%
                      </span>
                    </td>
                  )}
                  {visibleCols.status && (
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "py-0.5 px-2 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                        ep.status === "Healthy" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25" :
                        ep.status === "Warning" ? "bg-amber-500/10 text-amber-500 border border-amber-500/25" :
                        ep.status === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/25 animate-pulse" :
                        "bg-slate-500/10 text-slate-500 border border-slate-500/25"
                      )}>
                        {ep.status}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onIsolate(ep)}
                        disabled={ep.status === "Offline"}
                        className={cn(
                          "p-1 rounded cursor-pointer transition-colors hover:bg-muted text-foreground",
                          ep.status === "Offline" ? "text-muted-foreground/40 cursor-not-allowed" : "text-amber-500"
                        )}
                        title="Enforce Host Isolation"
                        id={`isolate-btn-${ep.id}`}
                      >
                        <ZapOff size={11} />
                      </button>
                      <button 
                        onClick={() => onBlockIp(ep)}
                        disabled={ep.status === "Offline"}
                        className={cn(
                          "p-1 rounded cursor-pointer transition-colors hover:bg-muted text-foreground",
                          ep.status === "Offline" ? "text-muted-foreground/40 cursor-not-allowed" : "text-red-500"
                        )}
                        title="Drop Target Traffic Rules"
                        id={`block-btn-${ep.id}`}
                      >
                        <Ban size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table pagination area */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/40 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span className="hidden sm:block">Showing {Math.min(filteredEndpoints.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredEndpoints.length, currentPage * itemsPerPage)} of {filteredEndpoints.length} total machines</span>
        <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            id="inventory-prev-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 px-2.5 bg-background border border-border rounded disabled:opacity-20 cursor-pointer text-foreground hover:bg-muted transition-colors"
          >
            Prev
          </button>
          <span className="font-extrabold text-foreground">Page {currentPage} of {totalPages || 1}</span>
          <button 
            id="inventory-next-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="p-1 px-2.5 bg-background border border-border rounded disabled:opacity-20 cursor-pointer text-foreground hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
