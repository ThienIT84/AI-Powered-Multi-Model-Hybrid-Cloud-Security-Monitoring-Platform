import React, { useState } from "react";
import { Cloud, RefreshCw, FileDown, Search, Filter, ShieldAlert, CheckCircle, Info } from "lucide-react";

// Mock collections
import { MOCK_CLOUD_ASSETS } from "../components/cloud/mockData";

// Operational Components
import { CloudSecurityKPIs } from "../components/cloud/CloudSecurityKPIs";
import { CloudThreatMonitoringCenter } from "../components/cloud/CloudThreatMonitoringCenter";
import { CloudSecurityInsights } from "../components/cloud/CloudSecurityInsights";
import { CloudResourceSecurity } from "../components/cloud/CloudResourceSecurity";
import { CloudIncidentFeed } from "../components/cloud/CloudIncidentFeed";
import { DataMode } from "../config";
import { DataModeBanner } from "../components/common/DataModeBanner";

export function CloudPage({ dataMode }: { dataMode: DataMode }) {
  // Primary operational search and filter states passed to layout components
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");

  // Sync state & export simulation indicators
  const [isSyncing, setIsSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 850);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 select-none text-foreground" id="cloud-ops-dashboard-hub">
      <DataModeBanner dataMode={dataMode} label="Cloud assets, exposure findings, and incidents are sample records" />
      
      {/* Dynamic Notification Toast for Export feedback */}
      {showExportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-650 text-white dark:bg-emerald-950/95 dark:text-emerald-405 border border-emerald-500/30 font-mono text-[9px] uppercase font-black px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle size={12} className="text-emerald-400" />
          <span>CSOC Report standard-export.json compiled successfully!</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        
        {/* Core title and metadata */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500/10 text-red-550 dark:text-red-400 rounded-lg shrink-0 mt-0.5 animate-pulse">
            <Cloud size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight leading-none mb-1.5 font-mono">
              Cloud Security Operations Center
            </h1>
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
              Cloud Security Monitoring, Threat Visibility & Compliance Operations
            </p>
          </div>
        </div>

        {/* Dynamic Toolbar Actions Area */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          
          {/* Active Search Field input */}
          <div className="relative">
            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resource/findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/40 border border-border focus:border-red-500/60 rounded px-2.5 pl-6 py-1 text-[8.5px] uppercase font-bold outline-hidden w-40 text-ellipsis placeholder:text-muted-foreground"
            />
          </div>

          {/* Service filter selector */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-muted/40 border border-border focus:border-red-500 rounded px-2 py-1 text-[8.5px] font-black uppercase cursor-pointer outline-hidden"
          >
            <option value="ALL">SVC: ALL_PROVIDERS</option>
            <option value="EC2">EC2 Instances</option>
            <option value="S3">S3 Storage</option>
            <option value="RDS">RDS Database</option>
            <option value="IAM">IAM Identities</option>
            <option value="EKS">EKS Cluster</option>
          </select>

          {/* Severity filter selector */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-muted/40 border border-border focus:border-red-500 rounded px-2 py-1 text-[8.5px] font-black uppercase cursor-pointer outline-hidden"
          >
            <option value="ALL">SEV: ALL_LEVELS</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Export findings action */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-3.5 py-1.5 bg-muted/40 hover:bg-muted/70 text-zinc-650 dark:text-zinc-200 hover:text-foreground border border-border rounded text-[8.5px] uppercase font-black cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-45"
            title="Export standard-export JSON logs payload"
          >
            <FileDown size={11} className={exporting ? "animate-bounce" : ""} />
            {exporting ? "Compiling Report..." : "Export Findings"}
          </button>

          {/* Sync Trigger Action */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-650 dark:text-red-400 border border-red-500/25 rounded text-[8.5px] uppercase font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Refresh CSPM checklists and event logging channels"
          >
            <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing SOC..." : "Refresh"}
          </button>
        </div>

      </div>

      {/* ROW 1: SECURITY KPI BAR */}
      <CloudSecurityKPIs assets={MOCK_CLOUD_ASSETS} />

      {/* ROW 2: PRIMARY OPERATIONS AREA (70 / 30 SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
        
        {/* LEFT (70%) - Threat Monitoring Operations Center */}
        <div className="lg:col-span-7">
          <CloudThreatMonitoringCenter
            searchQuery={searchQuery}
            selectedService={selectedService}
            selectedSeverity={selectedSeverity}
            onRefreshTrigger={isSyncing}
          />
        </div>

        {/* RIGHT (30%) - Operational Insights Panel */}
        <div className="lg:col-span-3">
          <CloudSecurityInsights />
        </div>

      </div>

      {/* ROW 3: THREE EQUAL-WIDTH PANELS DESIGN */}
      <CloudResourceSecurity onSelectAsset={(name) => setSearchQuery(name)} />

      {/* ROW 4: INTERACTIVE INCIDENTS FEED TIMELINE */}
      <CloudIncidentFeed onRefreshTrigger={isSyncing} />

    </div>
  );
}

export default CloudPage;
