import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useEndpointState } from "../hooks/useEndpointState";
import { EndpointInventoryTable } from "../components/endpoint/EndpointInventoryTable";
import { EndpointOverviewTab } from "../components/endpoint/EndpointOverviewTab";
import { EndpointDetailPanel } from "../components/endpoint/EndpointDetailPanel";
import { EndpointAlertToast } from "../components/endpoint/EndpointAlertToast";
import { Shield, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { DataModeNotice, EmptyState } from "../components/common/DataState";

export function EndpointPage() {
  const {
    endpoints,
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
    handleIsolate,
    handleBlockIp,
    filteredEndpoints,
    currentPage,
    setCurrentPage,
    alertPopup,
    setAlertPopup,
    isSimulated,
    dataMode,
  } = useEndpointState();

  // Selected Endpoint object computed from the endpoints state array
  const selectedEndpointObj = useMemo(() => {
    return endpoints.find(e => e.id === selectedId) || null;
  }, [endpoints, selectedId]);

  // Export CSV format for local asset inventory
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Hostname", "IP Address", "Device Type", "OS", "Role", "Risk Score", "Health Score", "Status"];
    const rows = filteredEndpoints.map(e => [
      e.id,
      e.hostname,
      e.ip,
      e.deviceType,
      e.os,
      e.role,
      e.riskScore,
      e.healthScore,
      e.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edr_asset_index_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredEndpoints]);

  return (
    <motion.div
      key="endpoint-edr-console"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full min-h-screen bg-background p-4 md:p-6 space-y-5 flex flex-col font-mono text-slate-800 dark:text-slate-100 animate-in fade-in"
    >
      {/* 1. Header (CrowdStrike / EDR-centric style) */}
      <div 
        id="endpoint-page-header"
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-650 dark:text-cyan-400 animate-pulse" />
            <h1 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">
              Endpoint Security Console
            </h1>
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
            Autonomous EDR Agent Investigation & Forensic Surveillance Panel
          </p>
        </div>

        {/* Sync status element */}
        <div className="flex items-center gap-2 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 px-3 py-1.5 rounded-lg select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 dark:bg-cyan-400 animate-ping" />
          <span className="text-[9px] font-black text-indigo-600 dark:text-cyan-400 tracking-wider uppercase font-mono">
            EDR Pipeline: {isSimulated ? "Active" : "Waiting for Telemetry"}
          </span>
        </div>
      </div>

      <DataModeNotice mode={dataMode} />
      {!isSimulated && endpoints.length === 0 && (
        <EmptyState label="Waiting for live endpoint telemetry." />
      )}

      {isSimulated && (
        <>
      {/* 2. Structured Two-Column EDR Panel Layout (Stacked Table + Overview & Forensic Slide-in/Toggle panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-start items-start">
        
        {/* 🟦 Left Area: ASSET LIST + OVERVIEW STACK */}
        <div className={cn(
          "space-y-5 transition-all duration-300 flex flex-col justify-between min-w-0",
          selectedId ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          {/* Asset Catalog Index Table */}
          <EndpointInventoryTable
            filteredEndpoints={filteredEndpoints}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onIsolate={handleIsolate}
            onBlockIp={handleBlockIp}
            onExportCSV={handleExportCSV}
          />

          {/* 🟨 Host Overview & AI Detection Panel underneath Table */}
          <div className="border border-border bg-card rounded-xl p-4.5 shadow-xs">
            <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-555 dark:text-cyan-455 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
                  Host Overview & AI Detection
                </span>
              </div>
              {selectedEndpointObj && (
                <span className="text-[9px] font-mono font-black text-indigo-650 dark:text-cyan-400 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 px-2 py-0.5 rounded tracking-wide">
                  SYS: {selectedEndpointObj.hostname}
                </span>
              )}
            </div>
            <EndpointOverviewTab endpoint={selectedEndpointObj} />
          </div>
        </div>

        {/* 🟥 Right Area: DETAILED FORENSIC PANEL (Shown & hidden dynamically with premium spring transition when selected) */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="lg:col-span-4 h-fit flex flex-col"
            >
              <EndpointDetailPanel
                endpoint={selectedEndpointObj}
                onBlockIp={handleBlockIp}
                onIsolate={handleIsolate}
                onClose={() => {
                  setSelectedId(null);
                  setIsDrawerOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. Global Toast System for real-time simulation updates */}
      <EndpointAlertToast 
        alertPopup={alertPopup} 
        onClose={() => setAlertPopup(null)} 
      />
        </>
      )}

    </motion.div>
  );
}

export default EndpointPage;
