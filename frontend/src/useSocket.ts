import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { appConfig } from "./config";
import { Alert, AlertStatus, BackendAlertDTO, PlatformStatus, SocketStatus, TrafficData } from "./types";
import { mapBackendAlertToAlert } from "./lib/alertMapper";

const MAX_RECONNECT_DELAY_MS = 30000;

const legacyAlertSchema = z.record(z.string(), z.unknown()).and(
  z.object({
    id: z.string(),
  }).passthrough()
);

const backendAlertSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  severity: z.string(),
  attack_type: z.string(),
  source_ip: z.string(),
  destination_ip: z.string(),
  source_port: z.number().optional(),
  destination_port: z.number(),
  protocol: z.string(),
  direction: z.string().optional(),
  confidence_score: z.number(),
  risk_score: z.number(),
  detected_by: z.array(z.string()).default([]),
  mitre: z.object({
    technique_id: z.string(),
    technique_name: z.string(),
    tactic: z.string().optional(),
    url: z.string().optional(),
  }),
  raw_payload: z.string().optional(),
  zeek_evidence: z.record(z.string(), z.unknown()).optional(),
  suricata_evidence: z.record(z.string(), z.unknown()).optional(),
  ai_analysis: z.record(z.string(), z.unknown()).optional(),
  decision_flow: z.array(z.record(z.string(), z.unknown())).optional(),
  status: z.string().optional(),
}).passthrough();

const trafficSchema = z.object({
  timestamp: z.string(),
  formattedTime: z.string().optional(),
  flows: z.number(),
  anomalies: z.number(),
  inbound: z.number(),
  outbound: z.number(),
  isAnomaly: z.boolean().optional(),
  isPeak: z.boolean().optional(),
});

const socketEnvelopeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("INITIAL_DATA"), data: z.array(z.union([backendAlertSchema, legacyAlertSchema])) }),
  z.object({ type: z.literal("NEW_ALERT"), data: z.union([backendAlertSchema, legacyAlertSchema]) }),
  z.object({ type: z.literal("alert.created"), data: z.union([backendAlertSchema, legacyAlertSchema]) }),
  z.object({ type: z.literal("alert.updated"), data: z.union([backendAlertSchema, legacyAlertSchema]) }),
  z.object({ type: z.literal("TRAFFIC_UPDATE"), data: trafficSchema }),
]);

const platformStatusSchema = z.object({
  dataSourcesOnline: z.number().nullable().optional(),
  dataSourcesTotal: z.number().nullable().optional(),
  modelHealthy: z.number().nullable().optional(),
  modelTotal: z.number().nullable().optional(),
  eventRatePerSecond: z.number().nullable().optional(),
  lastIngestAt: z.string().nullable().optional(),
  lastError: z.string().nullable().optional(),
}).passthrough();

function coerceIncomingAlert(raw: z.infer<typeof backendAlertSchema> | z.infer<typeof legacyAlertSchema>): Alert {
  if ("source_ip" in raw || "attack_type" in raw || "ai_analysis" in raw) {
    return mapBackendAlertToAlert(raw as unknown as BackendAlertDTO);
  }

  const legacy = raw as Record<string, unknown>;
  const aiDecision = legacy.aiDecision as Record<string, unknown> | undefined;
  const mitre = legacy.mitre as Record<string, unknown> | undefined;
  const mitreAttack = legacy.mitreAttack as Record<string, unknown> | undefined;
  const attackType = String(legacy.attackType ?? "Normal");
  const confidence = Number(legacy.confidence ?? legacy.confidenceScore ?? 0);
  const riskScore = Number(legacy.riskScore ?? 0);

  return {
    ...(legacy as unknown as Alert),
    id: String(legacy.id),
    destinationIp: String(legacy.destIp ?? legacy.destinationIp ?? ""),
    destIp: String(legacy.destIp ?? legacy.destinationIp ?? ""),
    destinationPort: Number(legacy.destPort ?? legacy.destinationPort ?? 0),
    destPort: Number(legacy.destPort ?? legacy.destinationPort ?? 0),
    confidenceScore: confidence,
    confidence,
    rawPayload: String(legacy.payload ?? legacy.rawPayload ?? ""),
    payload: String(legacy.payload ?? legacy.rawPayload ?? ""),
    direction: String(legacy.direction ?? "INGRESS"),
    detectedBy: Array.isArray(legacy.detectedBy) ? legacy.detectedBy.map(String) : ["AI Engine"],
    mitre: {
      techniqueId: String(mitre?.techniqueId ?? mitreAttack?.id ?? "T1000"),
      techniqueName: String(mitre?.techniqueName ?? mitreAttack?.technique ?? "Unknown Technique"),
      tactic: String(mitre?.tactic ?? mitreAttack?.tactic ?? "Unknown Tactic"),
      url: String(mitre?.url ?? ""),
    },
    zeekData: (legacy.zeekData as Alert["zeekData"]) ?? {},
    suricataData: (legacy.suricataData as Alert["suricataData"]) ?? {},
    aiDecision:
      !aiDecision || typeof aiDecision.ai1 === "object"
        ? ((aiDecision as Alert["aiDecision"]) ?? {})
        : {
            ai1: {
              verdict: String(aiDecision.ai1 ?? (riskScore > 35 ? "ANOMALY" : "NORMAL")),
              anomalyScore: confidence,
              status: "simulated",
              source: "simulated",
              modelVersion: "AI1_LEGACY_SIM",
              inputScope: "ZEEK_CONN_FLOW",
            },
            ai2a: {
              attackType: String(aiDecision.ai2a ?? attackType),
              confidenceScore: confidence,
              status: "simulated",
              source: "simulated",
              modelVersion: "AI2A_LEGACY_SIM",
              inputScope: "ZEEK_CONN_FLOW",
            },
            ai2b: {
              webAttackType: String(aiDecision.ai2b ?? attackType),
              confidenceScore: confidence,
              status: "simulated",
              source: "simulated",
              modelVersion: "AI2B_LEGACY_SIM",
              inputScope: "HTTP_URI_QUERY",
            },
            fusion: {
              confidenceScore: confidence,
              riskScore,
              reason: "Legacy frontend simulated alert normalized into the multi-model contract.",
              mode: "SIMULATED_FULL_MULTI_MODEL",
              contributors: ["AI1", "AI2A", "AI2B"],
              excludedModels: {},
              decisionVersion: "FUSION_V1_RULE_BASED",
            },
          },
    decisionFlow: (legacy.decisionFlow as Alert["decisionFlow"]) ?? [],
    status: (legacy.status as Alert["status"]) ?? AlertStatus.NEW,
  };
}

function upsertAlert(alerts: Alert[], alert: Alert): Alert[] {
  const existingIndex = alerts.findIndex((item) => item.id === alert.id);
  if (existingIndex === -1) {
    return [alert, ...alerts].slice(0, 50);
  }
  return alerts.map((item, index) => (index === existingIndex ? alert : item));
}

function buildEmptyPlatformStatus(socketStatus: SocketStatus, lastError: string | null): PlatformStatus {
  return {
    socketStatus,
    dataMode: appConfig.dataMode,
    dataSourcesOnline: null,
    dataSourcesTotal: null,
    modelHealthy: null,
    modelTotal: null,
    eventRatePerSecond: null,
    lastIngestAt: null,
    lastError,
  };
}

export function useSocket() {
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [error, setError] = useState<string | null>(appConfig.configErrors[0] ?? null);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus>(() =>
    buildEmptyPlatformStatus("connecting", appConfig.configErrors[0] ?? null)
  );
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const manualCloseRef = useRef(false);

  const socketUrl = appConfig.dataMode === "live" ? appConfig.wsUrl : appConfig.mockWsUrl;

  const refreshPlatformStatus = useCallback(async () => {
    if (appConfig.dataMode !== "live") {
      setPlatformStatus(buildEmptyPlatformStatus(socketStatus, error));
      return;
    }

    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/status`);
      if (!response.ok) {
        throw new Error(`Status endpoint returned ${response.status}`);
      }
      const parsed = platformStatusSchema.parse(await response.json());
      setPlatformStatus({
        socketStatus,
        dataMode: appConfig.dataMode,
        dataSourcesOnline: parsed.dataSourcesOnline ?? null,
        dataSourcesTotal: parsed.dataSourcesTotal ?? null,
        modelHealthy: parsed.modelHealthy ?? null,
        modelTotal: parsed.modelTotal ?? null,
        eventRatePerSecond: parsed.eventRatePerSecond ?? null,
        lastIngestAt: parsed.lastIngestAt ?? null,
        lastError: parsed.lastError ?? error,
      });
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "Status endpoint unavailable";
      setPlatformStatus(buildEmptyPlatformStatus(socketStatus, message));
    }
  }, [error, socketStatus]);

  const connect = useCallback(() => {
    if (appConfig.configErrors.length > 0) {
      setSocketStatus("error");
      setError(appConfig.configErrors.join(" "));
      return;
    }

    manualCloseRef.current = false;
    setSocketStatus(reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting");
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      setSocketStatus("connected");
      setError(null);
    };

    socket.onerror = () => {
      setSocketStatus("error");
      setError(`Unable to connect to ${socketUrl}`);
    };

    socket.onclose = () => {
      socketRef.current = null;
      if (manualCloseRef.current) {
        setSocketStatus("disconnected");
        return;
      }
      reconnectAttemptRef.current += 1;
      const delay = Math.min(1000 * 2 ** (reconnectAttemptRef.current - 1), MAX_RECONNECT_DELAY_MS);
      setSocketStatus("reconnecting");
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    };

    socket.onmessage = (event) => {
      try {
        const message = socketEnvelopeSchema.parse(JSON.parse(event.data));

        switch (message.type) {
          case "INITIAL_DATA":
            setAlerts(message.data.map(coerceIncomingAlert));
            break;
          case "NEW_ALERT":
          case "alert.created":
          case "alert.updated":
            setAlerts((prev) => upsertAlert(prev, coerceIncomingAlert(message.data)));
            break;
          case "TRAFFIC_UPDATE":
            setTraffic((prev) => [...prev, message.data].slice(-100));
            break;
        }
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : "Invalid WebSocket message";
        setError(`Ignored invalid WebSocket message: ${message}`);
      }
    };
  }, [socketUrl]);

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    manualCloseRef.current = true;
    socketRef.current?.close();
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    refreshPlatformStatus();
    const timer = window.setInterval(refreshPlatformStatus, 15000);
    return () => window.clearInterval(timer);
  }, [refreshPlatformStatus]);

  const mergedPlatformStatus = useMemo<PlatformStatus>(() => ({
    ...platformStatus,
    socketStatus,
    lastError: error ?? platformStatus.lastError,
  }), [error, platformStatus, socketStatus]);

  return {
    isConnected: socketStatus === "connected",
    socketStatus,
    alerts,
    traffic,
    error,
    dataMode: appConfig.dataMode,
    platformStatus: mergedPlatformStatus,
    reconnect,
  };
}
