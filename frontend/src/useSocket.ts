import { useState, useEffect, useRef } from "react";
import { appConfig } from "./config";
import { Alert, BackendAlertDTO, TrafficData } from "./types";
import { mapBackendAlertToAlert } from "./lib/alertMapper";
import { SocketStatus } from "./types/platform";
import { socketMessageSchema } from "./types/socket";
import { applyPersistedAlertActions } from "./services/alerts.service";

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
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("Disconnected");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const manuallyClosedRef = useRef(false);
  const [reconnectNonce, setReconnectNonce] = useState(0);

  const reconnect = () => {
    manuallyClosedRef.current = false;
    retryRef.current = 0;
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
    }
    socketRef.current?.close();
    setReconnectNonce((value) => value + 1);
  };

  useEffect(() => {
    manuallyClosedRef.current = false;
    const socketUrl = appConfig.dataMode === "live" ? appConfig.wsUrl : appConfig.mockWsUrl;
    if (appConfig.dataMode === "live" && !socketUrl) {
      setSocketStatus("Error");
      setIsConnected(false);
      setError("Live mode is missing VITE_WS_URL. Configure the backend WebSocket endpoint.");
      return;
    }

    setSocketStatus(retryRef.current > 0 ? "Reconnecting" : "Connecting");
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      retryRef.current = 0;
      setIsConnected(true);
      setSocketStatus("Connected");
      setError(null);
    };

    socket.onerror = () => {
      setSocketStatus("Error");
      setError(`Unable to connect to ${socketUrl}`);
    };

    socket.onclose = () => {
      setIsConnected(false);
      if (manuallyClosedRef.current) {
        setSocketStatus("Disconnected");
        return;
      }
      const retryMs = Math.min(30000, 1000 * 2 ** retryRef.current);
      retryRef.current += 1;
      setSocketStatus(retryRef.current > 1 ? "Reconnecting" : "Disconnected");
      retryTimerRef.current = window.setTimeout(() => {
        setReconnectNonce((value) => value + 1);
      }, retryMs);
    };
    
    socket.onmessage = (event) => {
      try {
        const parsed = socketMessageSchema.safeParse(JSON.parse(event.data));
        if (!parsed.success) {
          setError("Ignored invalid WebSocket message schema.");
          console.warn("Ignored invalid SOC socket message", parsed.error.flatten());
          return;
        }
        const message = parsed.data;

        switch (message.type) {
          case "INITIAL_DATA":
            setAlerts(applyPersistedAlertActions(message.data.map(coerceIncomingAlert)));
            break;
          case "NEW_ALERT":
          case "alert.created":
          case "alert.updated":
            setAlerts((prev) => applyPersistedAlertActions(upsertAlert(prev, coerceIncomingAlert(message.data))));
            break;
          case "TRAFFIC_UPDATE":
            setTraffic((prev) => [...prev, message.data].slice(-100));
            break;
        }
      } catch (err) {
        setError("Ignored invalid WebSocket message payload.");
        console.warn("Ignored invalid SOC socket message", err);
      }
    };

    return () => {
      manuallyClosedRef.current = true;
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
      socket.close();
    };
  }, [reconnectNonce]);

  return { isConnected, socketStatus, alerts, traffic, error, dataMode: appConfig.dataMode, reconnect };
}
