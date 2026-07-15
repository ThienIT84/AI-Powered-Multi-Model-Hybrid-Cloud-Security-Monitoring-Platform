import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { apiRequest } from "./api/client";
import { getAccessToken } from "./api/session";
import { appConfig } from "./config";
import { mapBackendAlertToAlert } from "./lib/alertMapper";
import { Alert, BackendAlertDTO, NetworkFlow, PlatformStatus, SocketStatus, TrafficData } from "./types";

const MAX_ALERTS = 200;
const MAX_NETWORK_FLOWS = 200;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RECONCILIATION_INTERVAL_MS = 15_000;

const backendAlertSchema = z.object({
  id: z.string().optional(),
  event_id: z.string().optional(),
  timestamp: z.string(),
  severity: z.string(),
  attack_type: z.string(),
  source_ip: z.string(),
  destination_ip: z.string(),
  source_port: z.number().nullable().optional(),
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
  zeek_evidence: z.record(z.string(), z.unknown()).nullable().optional(),
  suricata_evidence: z.record(z.string(), z.unknown()).nullable().optional(),
  ai_analysis: z.record(z.string(), z.unknown()).optional(),
  decision_flow: z.array(z.record(z.string(), z.unknown())).optional(),
  status: z.string().optional(),
}).passthrough().superRefine((alert, context) => {
  if (!alert.id && !alert.event_id) {
    context.addIssue({
      code: "custom",
      message: "Alert payload must contain id or event_id",
    });
  }
});

const alertsSchema = z.array(backendAlertSchema);

const socketEnvelopeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("INITIAL_DATA"), data: alertsSchema }),
  z.object({ type: z.literal("alert.created"), data: backendAlertSchema }),
  z.object({ type: z.literal("alert.updated"), data: backendAlertSchema }),
]);

const dataSourceRuntimeStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["healthy", "warning", "offline", "unknown"]),
  eventCount: z.number().nullable().optional(),
  lastSeenAt: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
}).passthrough();

const modelRuntimeStatusSchema = z.object({
  name: z.string(),
  status: z.string(),
  source: z.string(),
  modelVersion: z.string().nullable().optional(),
  lastSeenAt: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
}).passthrough();

const platformStatusSchema = z.object({
  dataSourcesOnline: z.number().nullable().optional(),
  dataSourcesTotal: z.number().nullable().optional(),
  modelHealthy: z.number().nullable().optional(),
  modelTotal: z.number().nullable().optional(),
  eventRatePerSecond: z.number().nullable().optional(),
  lastIngestAt: z.string().nullable().optional(),
  lastError: z.string().nullable().optional(),
  dataSources: z.array(dataSourceRuntimeStatusSchema).optional(),
  models: z.array(modelRuntimeStatusSchema).optional(),
  databaseStatus: z.enum(["healthy", "warning", "offline", "unknown"]).optional(),
}).passthrough();

const trafficPointSchema = z.object({
  timestamp: z.string(),
  flows: z.number(),
  anomalies: z.number(),
  inbound: z.number(),
  outbound: z.number(),
});

const networkFlowSchema = z.object({
  id: z.string(),
  sensorId: z.string().nullable().optional(),
  source: z.string(),
  timestamp: z.string(),
  srcIp: z.string(),
  srcPort: z.number().nullable().optional(),
  dstIp: z.string(),
  dstPort: z.number(),
  protocol: z.string(),
  service: z.string().nullable().optional(),
  bytes: z.number(),
  packets: z.number(),
  verdict: z.enum(["NORMAL", "ANOMALY"]),
  severity: z.string(),
  anomalyScore: z.number(),
  correlationId: z.string().nullable().optional(),
  relatedAlertId: z.string(),
}).passthrough();

const networkActivitySchema = z.object({
  totalFlows: z.number(),
  totalAnomalies: z.number(),
  points: z.array(trafficPointSchema),
  flows: z.array(networkFlowSchema).default([]),
}).passthrough();

type ParsedBackendAlert = z.infer<typeof backendAlertSchema>;

function mapIncomingAlert(raw: ParsedBackendAlert): Alert {
  return mapBackendAlertToAlert({
    ...raw,
    id: raw.id ?? raw.event_id!,
  } as unknown as BackendAlertDTO);
}

function mergeAlerts(existing: Alert[], incoming: Alert[]): Alert[] {
  const alertsById = new Map(existing.map((alert) => [alert.id, alert]));
  for (const alert of incoming) alertsById.set(alert.id, alert);

  return [...alertsById.values()]
    .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
    .slice(0, MAX_ALERTS);
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
    dataSources: [],
    models: [],
    databaseStatus: "unknown",
  };
}

function authenticatedSocketUrl(_token: string): string {
  const url = new URL(appConfig.wsUrl, window.location.href);
  if (url.protocol === "http:") url.protocol = "ws:";
  if (url.protocol === "https:") url.protocol = "wss:";
  // Do not place the operator token in a URL: CloudFront/WAF/ALB access logs
  // commonly retain query strings. Authentication should move to a secure
  // same-origin cookie or a short-lived WebSocket ticket at the edge.
  return url.toString();
}

function disposeSocket(socket: WebSocket | null): void {
  if (!socket) return;
  socket.onopen = null;
  socket.onerror = null;
  socket.onclose = null;
  socket.onmessage = null;
  if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
    socket.close();
  }
}

export function useSocket(enabled: boolean = getAccessToken() !== null) {
  const canConnect = enabled && getAccessToken() !== null && appConfig.configErrors.length === 0;
  const [socketStatus, setSocketStatus] = useState<SocketStatus>(canConnect ? "connecting" : "disconnected");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [trafficError, setTrafficError] = useState<string | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [networkFlows, setNetworkFlows] = useState<NetworkFlow[]>([]);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus>(() =>
    buildEmptyPlatformStatus(canConnect ? "connecting" : "disconnected", null),
  );
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeCurrentSocket = useCallback(() => {
    clearReconnectTimer();
    const socket = socketRef.current;
    socketRef.current = null;
    disposeSocket(socket);
  }, [clearReconnectTimer]);

  const refreshPlatformStatus = useCallback(async () => {
    if (!canConnect) return;

    try {
      const parsed = await apiRequest("/api/status", { schema: platformStatusSchema });
      setPlatformStatus({
        socketStatus: "disconnected",
        dataMode: appConfig.dataMode,
        dataSourcesOnline: parsed.dataSourcesOnline ?? null,
        dataSourcesTotal: parsed.dataSourcesTotal ?? null,
        modelHealthy: parsed.modelHealthy ?? null,
        modelTotal: parsed.modelTotal ?? null,
        eventRatePerSecond: parsed.eventRatePerSecond ?? null,
        lastIngestAt: parsed.lastIngestAt ?? null,
        lastError: parsed.lastError ?? null,
        dataSources: parsed.dataSources ?? [],
        models: parsed.models ?? [],
        databaseStatus: parsed.databaseStatus ?? "unknown",
      });
      setStatusError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Status endpoint unavailable";
      setStatusError(`Unable to refresh platform status: ${message}`);
      setPlatformStatus(buildEmptyPlatformStatus("disconnected", message));
    }
  }, [canConnect]);

  const refreshPersistedAlerts = useCallback(async () => {
    if (!canConnect) return;

    try {
      const persistedAlerts = await apiRequest("/api/alerts?limit=200", { schema: alertsSchema });
      setAlerts((previous) => mergeAlerts(previous, persistedAlerts.map(mapIncomingAlert)));
      setAlertsError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Alerts endpoint unavailable";
      setAlertsError(`Unable to refresh persisted alerts: ${message}`);
    }
  }, [canConnect]);

  const refreshNetworkActivity = useCallback(async () => {
    if (!canConnect) return;

    try {
      const activity = await apiRequest("/api/network/activity", { schema: networkActivitySchema });
      setTraffic(activity.points);
      setNetworkFlows(activity.flows.slice(0, MAX_NETWORK_FLOWS));
      setTrafficError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Network activity endpoint unavailable";
      setTrafficError(`Unable to refresh network activity: ${message}`);
    }
  }, [canConnect]);

  const connect = useCallback(() => {
    closeCurrentSocket();

    if (!canConnect) {
      setSocketStatus(enabled && appConfig.configErrors.length > 0 ? "error" : "disconnected");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setSocketStatus("disconnected");
      return;
    }

    setSocketStatus(reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(authenticatedSocketUrl(token));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Invalid WebSocket URL";
      setSocketStatus("error");
      setSocketError(`Unable to connect to the backend WebSocket: ${message}`);
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current !== socket) return;
      reconnectAttemptRef.current = 0;
      setSocketStatus("connected");
      setSocketError(null);
    };

    socket.onerror = () => {
      if (socketRef.current !== socket) return;
      setSocketStatus("error");
      setSocketError("Unable to connect to the backend WebSocket.");
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      reconnectAttemptRef.current += 1;
      const delay = Math.min(1000 * 2 ** (reconnectAttemptRef.current - 1), MAX_RECONNECT_DELAY_MS);
      setSocketStatus("reconnecting");
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) return;
      try {
        const message = socketEnvelopeSchema.parse(JSON.parse(String(event.data)));
        if (message.type === "INITIAL_DATA") {
          setAlerts((previous) => mergeAlerts(previous, message.data.map(mapIncomingAlert)));
        } else {
          setAlerts((previous) => mergeAlerts(previous, [mapIncomingAlert(message.data)]));
        }
        void refreshNetworkActivity();
        setSocketError(null);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Invalid WebSocket message";
        setSocketError(`Ignored invalid backend WebSocket message: ${message}`);
      }
    };
  }, [canConnect, closeCurrentSocket, enabled, refreshNetworkActivity]);

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    connect();
    void refreshPersistedAlerts();
    void refreshPlatformStatus();
    void refreshNetworkActivity();
  }, [connect, refreshNetworkActivity, refreshPersistedAlerts, refreshPlatformStatus]);

  useEffect(() => {
    if (!canConnect) {
      closeCurrentSocket();
      reconnectAttemptRef.current = 0;
      setSocketStatus(enabled && appConfig.configErrors.length > 0 ? "error" : "disconnected");
      setAlerts([]);
      setTraffic([]);
      setNetworkFlows([]);
      setPlatformStatus(buildEmptyPlatformStatus("disconnected", null));
      return;
    }

    connect();
    return closeCurrentSocket;
  }, [canConnect, closeCurrentSocket, connect, enabled]);

  useEffect(() => {
    if (!canConnect) return;
    void refreshPlatformStatus();
    const timer = window.setInterval(() => void refreshPlatformStatus(), RECONCILIATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [canConnect, refreshPlatformStatus]);

  useEffect(() => {
    if (!canConnect) return;
    void refreshPersistedAlerts();
    const timer = window.setInterval(() => void refreshPersistedAlerts(), RECONCILIATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [canConnect, refreshPersistedAlerts]);

  useEffect(() => {
    if (!canConnect) return;
    void refreshNetworkActivity();
    const timer = window.setInterval(() => void refreshNetworkActivity(), RECONCILIATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [canConnect, refreshNetworkActivity]);

  const error = appConfig.configErrors[0] ?? alertsError ?? trafficError ?? statusError ?? socketError;
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
    networkFlows,
    error,
    dataMode: appConfig.dataMode,
    platformStatus: mergedPlatformStatus,
    reconnect,
  };
}
