import { useMemo } from "react";
import { Alert } from "../../../types";

export interface RealtimeIncidentItem {
  id: string;
  timestamp: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  source: string;
  destination: string;
  attackType: string;
  confidence: number;
  status: string;
}

export function useRealtimeIncidents(alerts: Alert[], searchQuery: string = "") {
  const incidents = useMemo(() => {
    const formatted: RealtimeIncidentItem[] = alerts.map((alert) => ({
      id: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity as "Critical" | "High" | "Medium" | "Low",
      source: alert.sourceIp || "N/A",
      destination: alert.destinationIp || "N/A",
      attackType: alert.attackType || "Unknown Threat",
      confidence: Math.round(alert.confidenceScore * 100) || 85,
      status: alert.status || "new"
    }));

    if (!searchQuery) return formatted;
    
    const query = searchQuery.toLowerCase();
    return formatted.filter(
      (inc) =>
        inc.source.toLowerCase().includes(query) ||
        inc.destination.toLowerCase().includes(query) ||
        inc.attackType.toLowerCase().includes(query) ||
        inc.severity.toLowerCase().includes(query)
    );
  }, [alerts, searchQuery]);

  return incidents;
}
