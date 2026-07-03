import { appConfig } from "../config";
import { NetworkLog, ProtocolType } from "../components/network/NetworkConfig";
import { generateInitialLogsList, generateRandomLog } from "../components/network/NetworkGenerator";
import { apiFetch } from "../services/http";
import { NetworkFlow, NetworkTelemetrySource } from "../types/network";

export interface NetworkTelemetryAdapter {
  initialLogs(): Promise<NetworkLog[]>;
  nextLogs(): Promise<NetworkLog[]>;
  canSimulate: boolean;
}

const emptyLiveAdapter: NetworkTelemetryAdapter = {
  canSimulate: false,
  async initialLogs() {
    const flows = await apiFetch<NetworkFlowDTO[]>("/api/network/flows");
    return flows.map(mapNetworkFlowToLog);
  },
  async nextLogs() {
    return [];
  },
};

interface NetworkFlowDTO {
  id: string;
  sensor_id?: string;
  source?: NetworkTelemetrySource | "zeek_conn" | "zeek_http" | "suricata" | "vpc_flow_logs" | string;
  timestamp: string;
  src_ip: string;
  src_port?: number;
  dst_ip: string;
  dst_port?: number;
  protocol: string;
  service?: string;
  bytes?: number;
  packets?: number;
  correlation_id?: string;
  related_alert_id?: string;
  related_case_id?: string;
  severity?: string;
  risk_score?: number;
  reason?: string;
}

function normalizeTelemetrySource(source: NetworkFlowDTO["source"], service?: string): NetworkTelemetrySource {
  const value = (source || "").toLowerCase();
  if (value.includes("zeek") && value.includes("http")) return "Zeek http.log";
  if (value.includes("zeek") || value === "conn" || value === "zeek_conn") return "Zeek conn.log";
  if (value.includes("suricata")) return "Suricata alert";
  if (value.includes("vpc")) return "VPC Flow Logs";
  if ((service || "").toLowerCase() === "http") return "Zeek http.log";
  return "Unknown telemetry";
}

function normalizeProtocol(value: string): ProtocolType | "TCP" | "UDP" | "ICMP" {
  const normalized = value.toUpperCase();
  if (normalized === "UDP") return ProtocolType.UDP;
  if (normalized === "ICMP") return ProtocolType.ICMP;
  return ProtocolType.TCP;
}

export function mapNetworkFlowToLog(flow: NetworkFlowDTO): NetworkLog {
  const packets = flow.packets ?? 0;
  const bytes = flow.bytes ?? 0;
  const riskScore = flow.risk_score ?? 0;
  return {
    id: flow.id,
    sensorId: flow.sensor_id,
    source: normalizeTelemetrySource(flow.source, flow.service),
    correlationId: flow.correlation_id || flow.id,
    relatedAlertId: flow.related_alert_id,
    relatedCaseId: flow.related_case_id,
    timestamp: flow.timestamp,
    srcIp: flow.src_ip,
    srcPort: flow.src_port,
    destIp: flow.dst_ip,
    destPort: flow.dst_port ?? 0,
    protocol: normalizeProtocol(flow.protocol),
    origBytes: bytes,
    respPkts: packets,
    verdict: riskScore >= 50 ? "ANOMALY" : "NORMAL",
    severity: (flow.severity?.toUpperCase() as NetworkLog["severity"]) ?? "INFO",
    threatScore: riskScore,
    confidence: riskScore > 0 ? Math.min(99, Math.max(50, riskScore)) : 0,
    duration: 0,
    reason: flow.reason || `${flow.service || "unknown"} telemetry`,
    hexDump: `sensor=${flow.sensor_id || "unknown"} correlation=${flow.correlation_id || flow.id} source=${normalizeTelemetrySource(flow.source, flow.service)}`,
  };
}

export async function getNetworkFlowById(flowId: string): Promise<NetworkLog | null> {
  if (appConfig.dataMode !== "live") return null;
  const flow = await apiFetch<NetworkFlowDTO>(`/api/network/flows/${encodeURIComponent(flowId)}`);
  return mapNetworkFlowToLog(flow);
}

const demoAdapter: NetworkTelemetryAdapter = {
  canSimulate: true,
  async initialLogs() {
    return generateInitialLogsList(60).map((log) => ({ ...log, source: "Demo simulation" }));
  },
  async nextLogs() {
    return [{ ...generateRandomLog(), source: "Demo simulation" }];
  },
};

const replayAdapter: NetworkTelemetryAdapter = {
  canSimulate: true,
  async initialLogs() {
    return generateInitialLogsList(60).map((log, index) => ({
      ...log,
      id: `replay-${index}-${log.id}`,
      source: "Replay dataset",
      timestamp: log.timestamp,
    }));
  },
  async nextLogs() {
    return [{ ...generateRandomLog(), source: "Replay dataset" }];
  },
};

export function getNetworkTelemetryAdapter(): NetworkTelemetryAdapter {
  if (appConfig.dataMode === "live") return emptyLiveAdapter;
  if (appConfig.dataMode === "replay") return replayAdapter;
  return demoAdapter;
}
