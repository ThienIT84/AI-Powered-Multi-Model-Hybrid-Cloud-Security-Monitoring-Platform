import { useState, useEffect, useRef } from "react";
import { appConfig } from "./config";
import { Alert, BackendAlertDTO, TrafficData } from "./types";

function mapBackendAlertToAlert(raw: any): Alert {
  return {
    ...raw,
    destinationIp: raw.destIp || raw.destinationIp || "",
    destIp: raw.destIp || raw.destinationIp || "",
    destinationPort: raw.destPort || raw.destinationPort || 0,
    destPort: raw.destPort || raw.destinationPort || 0,
    confidenceScore: raw.confidence !== undefined ? raw.confidence : (raw.confidenceScore || 0),
    confidence: raw.confidence !== undefined ? raw.confidence : (raw.confidenceScore || 0),
    rawPayload: raw.payload || raw.rawPayload || "",
    payload: raw.payload || raw.rawPayload || "",
    direction: raw.direction || "INGRESS",
    detectedBy: raw.detectedBy || ["AI Engine"],
    mitre: {
      techniqueId: raw.mitre?.techniqueId || raw.mitreAttack?.id || "T1000",
      techniqueName: raw.mitre?.techniqueName || raw.mitreAttack?.technique || "Unknown Technique",
      tactic: raw.mitre?.tactic || raw.mitreAttack?.tactic || "Unknown Tactic",
      url: raw.mitre?.url || ""
    },
    zeekData: raw.zeekData || {},
    suricataData: raw.suricataData || {},
    aiDecision: raw.aiDecision || {},
    decisionFlow: raw.decisionFlow || [],
    status: raw.status || "new"
  };
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = appConfig.dataMode === "api" ? appConfig.wsUrl : appConfig.mockWsUrl;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onerror = () => {
      setError(`Unable to connect to ${socketUrl}`);
    };

    socket.onclose = () => setIsConnected(false);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case "INITIAL_DATA":
          setAlerts((message.data as BackendAlertDTO[]).map(mapBackendAlertToAlert));
          break;
        case "NEW_ALERT":
          setAlerts((prev) => [mapBackendAlertToAlert(message.data), ...prev].slice(0, 50));
          break;
        case "alert.created":
          setAlerts((prev) => [mapBackendAlertToAlert(message.data), ...prev].slice(0, 50));
          break;
        case "TRAFFIC_UPDATE":
          setTraffic((prev) => [...prev, message.data].slice(-100));
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return { isConnected, alerts, traffic, error, dataMode: appConfig.dataMode };
}
