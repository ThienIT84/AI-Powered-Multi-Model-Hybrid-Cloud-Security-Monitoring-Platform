import React, { useState, useMemo } from "react";
import { MOCK_ENDPOINTS, EndpointAsset } from "../components/endpoint/endpointConfig";
import { EndpointStats } from "../components/endpoint/EndpointStats";
import { EndpointFilters, FilterState } from "../components/endpoint/EndpointFilters";
import { EndpointTable } from "../components/endpoint/EndpointTable";
import { EndpointDetailPanel } from "../components/endpoint/EndpointDetailPanel";
import { Shield, Radio, ShieldCheck, Heart, Terminal, Cpu, Info, AlertTriangle, CheckCircle, Flame } from "lucide-react";

export function EndpointPage() {
  // Source dataset
  const [endpoints, setEndpoints] = useState<EndpointAsset[]>(MOCK_ENDPOINTS);
  
  // Selected endpoint highlight
  const [selectedId, setSelectedId] = useState<string | null>(endpoints[0]?.id || null);

  // Filter criteria state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    provider: "all",
    status: "all",
    riskThreshold: 0,
    region: "all",
  });

  // Action log feed or custom alert notification overlay
  const [activeAlert, setActiveAlert] = useState<{
    type: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);

  // Filter application
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      // 1. Text Query (ID, Hostname, IP)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchId = ep.id.toLowerCase().includes(query);
        const matchHost = ep.hostname.toLowerCase().includes(query);
        const matchIp = ep.ip.toLowerCase().includes(query);
        if (!matchId && !matchHost && !matchIp) return false;
      }

      // 2. Asset Type
      if (filters.type !== "all" && ep.type !== filters.type) {
        return false;
      }

      // 3. Cloud Provider
      if (filters.provider !== "all" && ep.provider !== filters.provider) {
        return false;
      }

      // 4. Status Check
      if (filters.status !== "all" && ep.status !== filters.status) {
        return false;
      }

      // 5. AI Risk Score Threshold (Floor value)
      if (ep.riskScore < filters.riskThreshold) {
        return false;
      }

      // 6. Geographic region boundary matches
      if (filters.region !== "all") {
        const regQuery = filters.region.toLowerCase();
        // e.g. "US" matches 'US-East-1', 'AP' matches 'AP-Southeast-1'
        if (!ep.region.toLowerCase().includes(regQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [endpoints, filters]);

  // Read currently highlighted endpoint
  const selectedEndpoint = useMemo(() => {
    return endpoints.find((ep) => ep.id === selectedId) || null;
  }, [endpoints, selectedId]);

  // Action: Reset filter controls
  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      provider: "all",
      status: "all",
      riskThreshold: 0,
      region: "all",
    });
  };

  // Action: Isolate Node
  const handleIsolateNode = (ep: EndpointAsset) => {
    // Modify status to isolated / warning state or offline
    setEndpoints((prev) =>
      prev.map((item) =>
        item.id === ep.id
          ? {
              ...item,
              status: "OFFLINE",
              riskScore: 0,
              anomalies: ["HOST QUARANTINED: Network interface disconnected under direct incident action command."],
              rawLogs: [
                `[Direct Action] CLI: isolated node ${ep.hostname} successfully. Interface disabled globally.`,
                ...item.rawLogs,
              ],
            }
          : item
      )
    );

    setActiveAlert({
      type: "CRITICAL",
      title: "HOST ISOLATION TRIGGERED",
      message: `VPC access lists and DNS proxy controls updated. Node '${ep.hostname}' (${ep.ip}) is now completely isolated from other corporate subnets.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Auto close alert after 5s
    setTimeout(() => {
      setActiveAlert(null);
    }, 6000);
  };

  // Action: Block Client Network IP
  const handleBlockIp = (ep: EndpointAsset) => {
    setEndpoints((prev) =>
      prev.map((item) =>
        item.id === ep.id
          ? {
              ...item,
              riskScore: Math.max(0, item.riskScore - 20),
              rawLogs: [
                `[Direct Action] Firewall proxy: IP rule compiled. Traffic blocked for target socket interfaces.`,
                ...item.rawLogs,
              ],
            }
          : item
      )
    );

    setActiveAlert({
      type: "WARNING",
      title: "GATEWAY IP BLOCKED",
      message: `Successfully updated host firewalls and CDN routing rules. Incoming routing is dropped for gateway '${ep.ip}'.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    setTimeout(() => {
      setActiveAlert(null);
    }, 5000);
  };

  // Action: Export config report
  const handleExportReport = (ep: EndpointAsset) => {
    setActiveAlert({
      type: "SUCCESS",
      title: "EXPORT GENERATED SUCCESSFULLY",
      message: `Asset identity profile report compiled for binary: '${ep.hostname}' (SHA-256 validation index matched).`,
      timestamp: new Date().toLocaleTimeString(),
    });

    setTimeout(() => {
      setActiveAlert(null);
    }, 5000);
  };

  // Global action: CSV Export all filtered
  const handleExportFilteredCsv = () => {
    setActiveAlert({
      type: "SUCCESS",
      title: "REPORTS DOWNLOAD INITIATED",
      message: `CSV report generated for ${filteredEndpoints.length} filtered assets. Metadata checks passed successfully.`,
      timestamp: new Date().toLocaleTimeString(),
    });
    setTimeout(() => {
      setActiveAlert(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header Info details of the Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-cyan-500" />
            <h1 className="text-base font-black text-foreground uppercase tracking-widest leading-none">
              Endpoint Protection Control Gateway
            </h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Monitor active machine logs inside VPC instances, isolate container anomalies, and enforce zero-trust access list constraints
          </p>
        </div>
        
        {/* Real-time sync tracker badge */}
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl shrink-0 select-none">
          <Terminal size={14} className="text-cyan-500 animate-pulse" />
          <span className="text-[10px] font-mono font-black text-cyan-500 tracking-widest uppercase">
            X-DR MONITOR: ACTIVE
          </span>
        </div>
      </div>

      {/* Action alert message notifier */}
      {activeAlert && (
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 animate-in slide-in-from-top-3 duration-300 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-card/65 rounded-full blur-3xl" />
          
          <div className="shrink-0 mt-0.5">
            {activeAlert.type === "CRITICAL" ? (
              <Flame size={20} className="text-red-500 animate-pulse" />
            ) : activeAlert.type === "WARNING" ? (
              <AlertTriangle size={20} className="text-amber-500 animate-bounce" />
            ) : activeAlert.type === "SUCCESS" ? (
              <CheckCircle size={20} className="text-emerald-500" />
            ) : (
              <Info size={20} className="text-cyan-500" />
            )}
          </div>

          <div className="flex-1 space-y-1 font-mono text-[10px]">
            <h4 className="font-extrabold text-foreground uppercase tracking-wider">
              {activeAlert.title}
            </h4>
            <p className="text-muted-foreground uppercase tracking-wide leading-relaxed">
              {activeAlert.message}
            </p>
            <div className="text-[8px] text-zinc-500 uppercase font-black pt-1">
              LOG TIME: {activeAlert.timestamp}
            </div>
          </div>

          <button 
            onClick={() => setActiveAlert(null)}
            className="text-muted-foreground hover:text-foreground shrink-0 text-xs font-mono font-black uppercase cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 1. Real-time statistical metrics cards */}
      <EndpointStats endpoints={endpoints} />

      {/* 2. Advanced Multi-Param query filters */}
      <EndpointFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        onExport={handleExportFilteredCsv}
      />

      {/* 3. Splitting columns page layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
        
        {/* Left column (70%): table lists */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <EndpointTable
            endpoints={filteredEndpoints}
            onSelectEndpoint={(ep) => setSelectedId(ep.id)}
            selectedEndpointId={selectedId || undefined}
            onIsolateNode={handleIsolateNode}
            onBlockIp={handleBlockIp}
          />
        </div>

        {/* Right column (30%): asset diagnostic panel */}
        <div className="lg:col-span-3">
          <EndpointDetailPanel
            endpoint={selectedEndpoint}
            onClose={() => setSelectedId(null)}
            onIsolateNode={handleIsolateNode}
            onBlockIp={handleBlockIp}
            onExportReport={handleExportReport}
          />
        </div>

      </div>

    </div>
  );
}
