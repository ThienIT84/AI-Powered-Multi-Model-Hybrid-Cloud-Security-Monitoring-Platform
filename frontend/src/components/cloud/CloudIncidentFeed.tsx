import React, { useState, useMemo } from "react";
import { MOCK_CLOUD_INCIDENTS, IncidentFeedItem } from "./csocData";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle,
  Play,
  Terminal,
  Activity,
  AlertCircle
} from "lucide-react";

interface CloudIncidentFeedProps {
  onRefreshTrigger?: boolean;
}

export function CloudIncidentFeed({ onRefreshTrigger }: CloudIncidentFeedProps) {
  const [incidents, setIncidents] = useState<IncidentFeedItem[]>(MOCK_CLOUD_INCIDENTS);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "critical">("all");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Metric match
      const matchSearch =
        inc.resource.toLowerCase().includes(searchFilter.toLowerCase()) ||
        inc.finding.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchSearch) return false;

      // Filter tabs state
      if (activeFilter === "active") {
        return inc.status === "Active" || inc.status === "Investigating";
      }
      if (activeFilter === "critical") {
        return inc.severity === "Critical";
      }
      return true;
    });
  }, [incidents, activeFilter, searchFilter]);

  // Handle status toggle simulation of incident containment
  const toggleIncidentStatus = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const transitions: Record<string, "Active" | "Contained" | "Investigating" | "Resolved"> = {
            Active: "Investigating",
            Investigating: "Contained",
            Contained: "Resolved",
            Resolved: "Active"
          };
          return { ...inc, status: transitions[inc.status] };
        }
        return inc;
      })
    );
  };

  // Quick incident resolver action
  const resolveAllIncidents = () => {
    setIncidents(prev =>
      prev.map(i => ({ ...i, status: "Resolved" }))
    );
  };

  // Color mappings
  const getSeverityPill = (sev: "Critical" | "High" | "Medium" | "Low") => {
    switch (sev) {
      case "Critical":
        return "bg-red-500/10 text-red-655 dark:text-red-400 border border-red-500/25 font-black";
      case "High":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-550 border border-yellow-550/15";
      case "Low":
        return "bg-emerald-500/10 text-emerald-550 border border-emerald-500/15";
    }
  };

  const getStatusDot = (status: "Active" | "Contained" | "Investigating" | "Resolved") => {
    switch (status) {
      case "Active":
        return "bg-red-500 animate-ping";
      case "Investigating":
        return "bg-purple-500";
      case "Contained":
        return "bg-blue-400";
      case "Resolved":
        return "bg-emerald-500";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "Investigating":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "Contained":
        return "bg-blue-500/10 text-blue-605 dark:text-blue-450 border border-blue-500/20";
      case "Resolved":
        return "bg-emerald-550/10 text-emerald-500 border border-emerald-500/20 line-through decoration-emerald-500/30";
      default:
        return "bg-zinc-550/10 text-zinc-400";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4" id="cloud-incident-feed-panel">
      
      {/* Header and filter bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/30 pb-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-amber-500/10 text-amber-500">
            <Terminal size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
              Cloud Incident Feed
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live Audits, Container Ingress Threats, and Privilege Breaches
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end font-mono">
          {/* Quick Search */}
          <input
            type="text"
            placeholder="Search feed..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-muted/40 border border-border rounded px-2.5 py-1 text-[9px] outline-hidden focus:border-cyan-500 placeholder:text-muted-foreground max-w-32.5 w-full"
          />

          {/* Quick Status selectors */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-0.5 border border-border rounded-lg">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${
                activeFilter === "all" ? "bg-card text-foreground" : "text-muted-foreground hover:bg-card/40"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${
                activeFilter === "active" ? "bg-red-500/10 text-red-500" : "text-muted-foreground hover:bg-card/40"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter("critical")}
              className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${
                activeFilter === "critical" ? "bg-red-650/15 text-red-600 dark:text-red-400" : "text-muted-foreground hover:bg-card/40"
              }`}
            >
              Critical
            </button>
          </div>

          {/* Master Resolution Button */}
          <button
            onClick={resolveAllIncidents}
            className="px-3 py-1 bg-emerald-555/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] uppercase font-black cursor-pointer transition-all shrink-0"
          >
            Resolve All
          </button>
        </div>
      </div>

      {/* Incident listings table as specified */}
      <div className="border border-border/40 rounded-lg overflow-x-auto bg-muted/5">
        <table className="w-full text-left font-mono text-[9px] border-collapse min-w-175">
          <thead>
            <tr className="bg-muted/20 border-b border-border/30 select-none text-muted-foreground uppercase text-[8px] font-extrabold">
              <th className="p-3 w-37.5">Timestamp</th>
              <th className="p-3 w-37.5">Target Resource</th>
              <th className="p-3 w-22.5">Severity</th>
              <th className="p-3">Logged Threat / Finding</th>
              <th className="p-3 w-32.5 text-right">Containment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/15">
            {filteredIncidents.length === 0 ? (
              <tr className="select-none text-center">
                <td colSpan={5} className="p-8 text-muted-foreground italic text-[10px]">
                  No active incidents flagged in this filtered index.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 text-muted-foreground whitespace-nowrap text-[8.5px] font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={11} className="text-zinc-500" />
                      {incident.timestamp}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-foreground tracking-tight whitespace-nowrap uppercase">
                    {incident.resource}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${getSeverityPill(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-650 dark:text-zinc-355 font-medium leading-relaxed font-sans max-w-81.25 truncate" title={incident.finding}>
                    {incident.finding}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleIncidentStatus(incident.id)}
                      className={`px-2.5 py-0.5 rounded text-[8.5px] uppercase font-black transition-all cursor-pointer inline-flex items-center gap-1.5 ${getStatusBadgeStyle(incident.status)}`}
                      title="Click to trigger lifecycle status container transition"
                    >
                      <span className="relative flex h-1.5 w-1.5 select-none font-bold">
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDot(incident.status)}`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${getStatusDot(incident.status).split(" ")[0]}`}></span>
                      </span>
                      {incident.status}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center justify-between uppercase select-none border-t border-border/10 pt-2.5 leading-none">
        <span>GuardDuty Agent status: ACTIVE</span>
        <span className="font-extrabold text-teal-500">Telemetry Sync complete</span>
      </div>
    </div>
  );
}
export default CloudIncidentFeed;
