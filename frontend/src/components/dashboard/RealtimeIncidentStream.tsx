import React from "react";
import { useRealtimeIncidents } from "./hooks/useRealtimeIncidents";
import { Alert } from "../../types";
import { Terminal, Clock, Eye } from "lucide-react";

interface RealtimeIncidentStreamProps {
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
  selectedAlertId?: string;
  searchQuery?: string;
  onViewAlertsClick?: () => void;
}

export const RealtimeIncidentStream: React.FC<RealtimeIncidentStreamProps> = React.memo(({
  alerts,
  onSelectAlert,
  selectedAlertId,
  searchQuery = "",
  onViewAlertsClick
}) => {
  const incidents = useRealtimeIncidents(alerts, searchQuery);

  // Limit stream to latest 10-20 incidents only (we will use 15)
  const displayedIncidents = React.useMemo(() => {
    return incidents.slice(0, 15);
  }, [incidents]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/15 text-red-500 border border-red-500/25 font-black";
      case "High":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "Low":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-border";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved":
      case "mitigated":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 line-through decoration-emerald-500/20 hover:bg-emerald-500/15";
      case "investigating":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15";
      case "new":
        return "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse hover:bg-red-500/15";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20 hover:bg-zinc-500/15";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4" id="realtime-incident-stream">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-3.5 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
            <Terminal size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-widest font-mono">
              Live SOC Incident Feed (Latest 15)
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live operational awareness overview buffer
            </p>
          </div>
        </div>
        {onViewAlertsClick && (
          <button
            onClick={onViewAlertsClick}
            className="text-[9px] font-mono text-cyan-500 hover:text-cyan-400 font-black uppercase bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
          >
            Go to Alerts {'->'}
          </button>
        )}
      </div>

      <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[9px] border-collapse min-w-175">
            <thead>
              <tr className="bg-muted/40 border-b border-border/40 select-none text-muted-foreground uppercase text-[8px] font-black">
                <th className="p-3 w-37.5">Timestamp</th>
                <th className="p-3 w-22.5">Severity</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Destination IP</th>
                <th className="p-3">Category</th>
                <th className="p-3 w-27.5 text-right">Status</th>
                <th className="p-3 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {displayedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground italic select-none">
                    No active network threats or incidents matched your overview parameters.
                  </td>
                </tr>
              ) : (
                displayedIncidents.map((incident, idx) => {
                  const rawAlert = alerts.find(a => a.id === incident.id);
                  const isSelected = selectedAlertId === incident.id;

                  return (
                    <tr
                      key={incident.id || idx}
                      className={`hover:bg-muted/10 transition-colors ${
                        isSelected ? "bg-red-500/10 border-l-2 border-l-red-500" : ""
                      }`}
                    >
                      <td className="p-3 text-muted-foreground whitespace-nowrap text-[8.5px] font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={11} className="text-zinc-500" />
                          {incident.timestamp}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wide block text-center ${getSeverityStyle(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                        {incident.source}
                      </td>
                      <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                        {incident.destination}
                      </td>
                      <td className="p-3 text-zinc-300 font-extrabold max-w-50 truncate" title={incident.attackType}>
                        {incident.attackType}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-tight border inline-block select-none ${getStatusStyle(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => rawAlert && onSelectAlert?.(rawAlert)}
                          className="text-[8.5px] uppercase font-black text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                        >
                          <Eye size={10} />
                          View {'->'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono select-none flex items-center justify-between border-t border-border/10 pt-2.5 leading-none uppercase font-bold">
        <span>Sentinel network pipeline: active</span>
        <span className="text-emerald-500">Live Socket Stream Bound</span>
      </div>
    </div>
  );
});

