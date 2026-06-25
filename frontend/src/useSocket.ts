import { useState, useEffect, useRef } from "react";
import { appConfig } from "./config";
import { Alert, BackendAlertDTO, TrafficData } from "./types";
import { mapBackendAlertToAlert } from "./lib/alertMapper";

function coerceIncomingAlert(raw: any): Alert {
  if (raw?.source_ip || raw?.attack_type || raw?.ai_analysis) {
    return mapBackendAlertToAlert(raw as BackendAlertDTO);
  }

  const legacyAiDecision = normalizeLegacyAiDecision(raw);

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
    aiDecision: legacyAiDecision,
    decisionFlow: raw.decisionFlow || [],
    status: raw.status || "new"
  };
}

function normalizeLegacyAiDecision(raw: any) {
  const attackType = raw.attackType || "Normal";
  const confidence = raw.confidence !== undefined ? raw.confidence : (raw.confidenceScore || 0);
  if (!raw.aiDecision || typeof raw.aiDecision.ai1 === "object") {
    return raw.aiDecision || {};
  }
  return {
    ai1: {
      verdict: raw.aiDecision.ai1 || (raw.riskScore > 35 ? "ANOMALY" : "NORMAL"),
      anomalyScore: confidence,
      status: "completed",
      source: "mock",
      modelVersion: "AI1_LEGACY_MOCK",
      inputScope: "ZEEK_CONN_FLOW",
    },
    ai2a: {
      attackType: raw.aiDecision.ai2a || attackType,
      confidenceScore: confidence,
      status: "completed",
      source: "mock",
      modelVersion: "AI2A_LEGACY_MOCK",
      inputScope: "ZEEK_CONN_FLOW",
    },
    ai2b: {
      webAttackType: raw.aiDecision.ai2b || attackType,
      confidenceScore: confidence,
      status: "completed",
      source: "mock",
      modelVersion: "AI2B_LEGACY_MOCK",
      inputScope: "HTTP_URI_QUERY",
    },
    fusion: {
      confidenceScore: confidence,
      riskScore: raw.riskScore || 0,
      reason: "Legacy frontend mock alert normalized into the multi-model contract.",
      mode: "SIMULATED_FULL_MULTI_MODEL",
      contributors: ["AI1", "AI2A", "AI2B"],
      excludedModels: {},
      decisionVersion: "FUSION_V1_RULE_BASED",
    },
  };
}

function upsertAlert(alerts: Alert[], alert: Alert): Alert[] {
  const existingIndex = alerts.findIndex((item) => item.id === alert.id);
  if (existingIndex === -1) {
    return [alert, ...alerts].slice(0, 50);
  }
  return alerts.map((item, index) => (index === existingIndex ? alert : item));
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
          setAlerts((message.data as unknown[]).map(coerceIncomingAlert));
          break;
        case "NEW_ALERT":
          setAlerts((prev) => upsertAlert(prev, coerceIncomingAlert(message.data)));
          break;
        case "alert.created":
          setAlerts((prev) => upsertAlert(prev, coerceIncomingAlert(message.data)));
          break;
        case "alert.updated":
          setAlerts((prev) => upsertAlert(prev, coerceIncomingAlert(message.data)));
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
