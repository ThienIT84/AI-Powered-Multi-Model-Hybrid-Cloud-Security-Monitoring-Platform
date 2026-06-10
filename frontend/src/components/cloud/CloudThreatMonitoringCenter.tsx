import React, { useState, useEffect, useMemo } from "react";
import {
  MOCK_OPERATIONAL_FINDINGS,
  THREAT_TREND_DATA,
  LIVE_SECURITY_EVENTS,
  OperationalFinding,
  SecurityEvent
} from "./csocData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  ShieldAlert,
  Clock,
  Search,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";

interface CloudThreatMonitoringCenterProps {
  searchQuery: string;
  selectedService: string;
  selectedSeverity: string;
  onRefreshTrigger?: boolean;
}

export function CloudThreatMonitoringCenter({
  searchQuery,
  selectedService,
  selectedSeverity,
  onRefreshTrigger
}: CloudThreatMonitoringCenterProps) {
  // Findings state to support interaction (e.g. status changes or active resolution)
  const [findings, setFindings] = useState<OperationalFinding[]>(MOCK_OPERATIONAL_FINDINGS);
  const [liveStream, setLiveStream] = useState<SecurityEvent[]>(LIVE_SECURITY_EVENTS);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Filter findings based on headers search & selections
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchSearch =
        f.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchService = selectedService === "ALL" || f.service === selectedService;
      const matchSeverity = selectedSeverity === "ALL" || f.severity === selectedSeverity;

      return matchSearch && matchService && matchSeverity;
    });
  }, [findings, searchQuery, selectedService, selectedSeverity]);

  // Handle fake status resolution triggers in table
  const toggleFindingStatus = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const statusCycle: Record<string, "Open" | "In Progress" | "Investigating" | "Resolved"> = {
            Open: "In Progress",
            "In Progress": "Investigating",
            Investigating: "Resolved",
            Resolved: "Open"
          };
          return { ...f, status: statusCycle[f.status] };
        }
        return f;
      })
    );
  };

  // Simulate incoming live cloud events to make it feel alive!
  useEffect(() => {
    if (!isLiveStreaming) return;

    const eventTemplates = [
      { eventType: "Access Key Creation", actor: "root-admin-system", resource: "svc-ci-cd-uploader", severity: "High" },
      { eventType: "CloudTrail Anomaly", actor: "ProxyHost-911", resource: "DescribeAuthTokens", severity: "Medium" },
      { eventType: "Public Bucket Exposure", actor: "anonymous-scanner", resource: "financial-ledger-2026", severity: "Critical" },
      { eventType: "IAM Policy Change", actor: "phutd0212@gmail.com", resource: "FullAdministratorOverride", severity: "Critical" },
      { eventType: "Security Group Modification", actor: "k8s-pod-dns-controller", resource: "sg-internal-transit", severity: "High" },
      { eventType: "Role Escalation", actor: "lambda-token-verifier", resource: "arn:aws:iam::3720:role/write-access", severity: "Medium" }
    ];

    const interval = setInterval(() => {
      const randomTpl = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} UTC`;
      
      const newEvent: SecurityEvent = {
        id: `evt-dyn-${Date.now()}`,
        timestamp: timeStr,
        eventType: randomTpl.eventType,
        actor: randomTpl.actor,
        resource: randomTpl.resource,
        severity: randomTpl.severity as "Critical" | "High" | "Medium" | "Low",
        status: randomTpl.severity === "Critical" ? "Blocked" : "Flagged"
      };

      setLiveStream((prev) => [newEvent, ...prev.slice(0, 12)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Support manual event generator injection
  const triggerManualEvent = () => {
    const manualEvent: SecurityEvent = {
      id: `evt-manual-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + " UTC",
      eventType: "Credential Rotation Initiated",
      actor: "phutd0212@gmail.com",
      resource: "kms-master-vault",
      severity: "Low",
      status: "Monitored"
    };
    setLiveStream((prev) => [manualEvent, ...prev.slice(0, 12)]);
  };

  // Helper colors
  const getSeverityBadge = (sev: "Critical" | "High" | "Medium" | "Low") => {
    switch (sev) {
      case "Critical":
        return "bg-red-500/15 text-red-500 border border-red-500/30 font-black";
      case "High":
        return "bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "Low":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20";
      case "In Progress":
        return "bg-blue-505/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20";
      case "Investigating":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20";
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-40 border border-emerald-500/20 line-through decoration-emerald-500/30 hover:bg-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/10";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-6" id="threat-monitoring-center">
      
      {/* Container Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5 select-none">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 animate-pulse">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
              Cloud Threat Monitoring Center
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Unified Security Incidents & Hostile Activity Mapping
            </p>
          </div>
        </div>
        
        {/* State Indicators */}
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-2 py-0.5 rounded font-mono text-[8px] font-black uppercase flex items-center gap-1 border transition-all ${
              isLiveStreaming
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLiveStreaming ? "bg-emerald-500 animate-ping" : "bg-zinc-500"}`}></span>
            {isLiveStreaming ? "Live Feed Ingesting" : "Ingestion Paused"}
          </button>
        </div>
      </div>

      {/* A. Active Security Findings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between select-none">
          <span className="text-[10px] font-bold uppercase text-foreground/80 tracking-wider font-mono flex items-center gap-1.5">
            <Layers size={13} className="text-red-550" />
            Active Security Findings
          </span>
          <span className="text-[8.5px] font-mono text-muted-foreground uppercase">
            Showing {filteredFindings.length} of {findings.length} alerts
          </span>
        </div>

        <div className="border border-border/50 rounded-lg overflow-x-auto bg-muted/5">
          <table className="w-full text-left font-mono text-[9px] border-collapse min-w-150">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40 select-none text-muted-foreground uppercase text-[8px] font-extrabold">
                <th className="p-2.5 w-22.5">Severity</th>
                <th className="p-2.5">Resource Name</th>
                <th className="p-2.5 w-17.5">Service</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 w-27.5">Status</th>
                <th className="p-2.5 w-25 text-right">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground italic select-none">
                    No active security findings matched your query.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-tight block text-center ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-foreground max-w-37.5 truncate" title={finding.resource}>
                      {finding.resource}
                    </td>
                    <td className="p-2.5">
                      <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-[8px] uppercase">
                        {finding.service}
                      </span>
                    </td>
                    <td className="p-2.5 text-zinc-650 dark:text-zinc-350">
                      {finding.category}
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => toggleFindingStatus(finding.id)}
                        className={`px-2 py-0.5 rounded text-[8px] uppercase text-center transition-all cursor-pointer ${getStatusBadge(finding.status)}`}
                        title="Click to toggle resolution stage"
                      >
                        {finding.status}
                      </button>
                    </td>
                    <td className="p-2.5 text-right font-medium text-muted-foreground text-[8px]">
                      {finding.lastSeen}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Primary Grid Partition of LeftOperations: Chart & Events (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* B. Threat Trend Chart (Last 24h Area curves) */}
        <div className="lg:col-span-7 bg-muted/15 border border-border/40 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-3 select-none">
            <span className="text-[9.5px] font-bold uppercase text-foreground/80 tracking-wider font-mono">
              Threat Trend (24h Volume Waves)
            </span>
            <span className="text-[8px] font-mono text-muted-foreground">INTERVAL: 2H SLICES</span>
          </div>

          <div className="h-45 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={THREAT_TREND_DATA}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.08)" />
                <XAxis
                  dataKey="hour"
                  stroke="#71717a"
                  fontSize={8}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={8}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "9px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Critical"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCrit)"
                />
                <Area
                  type="monotone"
                  dataKey="High"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorHigh)"
                />
                <Area
                  type="monotone"
                  dataKey="Medium"
                  stroke="#3B82F6"
                  strokeWidth={1.2}
                  fillOpacity={1}
                  fill="url(#colorMed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[8px] font-mono font-bold mt-2 pt-2 border-t border-border/15 select-none uppercase">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>Critical Findings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>High Findings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>Medium Findings</span>
            </div>
          </div>
        </div>

        {/* C. Live Cloud Security Events Ingestion Stream */}
        <div className="lg:col-span-5 bg-muted/10 border border-border/40 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2 select-none">
              <span className="text-[9.5px] font-bold uppercase text-foreground/80 tracking-wider font-mono flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Live Security Events
              </span>
              <button
                onClick={triggerManualEvent}
                className="text-[7.5px] text-cyan-600 dark:text-cyan-400 font-extrabold uppercase hover:underline cursor-pointer"
                title="Inject a manual compliance update audit log"
              >
                + Inject Log
              </button>
            </div>

            {/* Ingress stream of event cards scrollable */}
            <div className="space-y-1.5 max-h-41.25 overflow-y-auto pr-1">
              {liveStream.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-background/80 border border-border/50 rounded p-2 text-[8px] font-mono flex flex-col gap-1 transition-all hover:bg-background"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-foreground/90 font-black uppercase text-[8.5px] truncate max-w-37.5">
                      {evt.eventType}
                    </span>
                    <span className={`text-[7px] font-black uppercase px-1 rounded-sm ${
                      evt.status === "Blocked"
                        ? "bg-red-500/10 text-red-500 border border-red-500/15"
                        : evt.status === "Flagged"
                        ? "bg-amber-500/10 text-amber-550 border border-amber-500/15"
                        : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/10"
                    }`}>
                      {evt.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-muted-foreground text-[7.5px] uppercase">
                    <span>Act: {evt.actor.split("@")[0]}</span>
                    <span className="truncate max-w-30" title={evt.resource}>Res: {evt.resource}</span>
                  </div>

                  <div className="border-t border-border/10 pt-1 mt-0.5 flex items-center justify-between text-[7px] text-zinc-500">
                    <span>SEV: {evt.severity}</span>
                    <span className="text-[7.5px] text-zinc-400 font-medium">{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[7.5px] font-bold font-mono text-zinc-400 dark:text-zinc-500 border-t border-border/10 pt-2 flex items-center justify-between uppercase select-none mt-2">
            <span>Buffer Limit: 12 Security Elements</span>
            <span>Agent Socket: Connected</span>
          </div>
        </div>

      </div>
    </div>
  );
}
export default CloudThreatMonitoringCenter;
