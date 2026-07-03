import { appConfig } from "../config";
import { PlatformStatus, SocketStatus } from "../types/platform";
import { apiFetch } from "./http";

interface BackendPlatformStatusDTO {
  status?: string;
  socket_status?: SocketStatus;
  data_mode?: string;
  data_sources_online?: number;
  data_sources_total?: number;
  model_healthy?: number;
  model_total?: number;
  event_rate_per_second?: number;
  last_ingest_at?: string | null;
  last_error?: string | null;
}

function unknownStatus(socketStatus: SocketStatus, lastError: string | null): PlatformStatus {
  return {
    socketStatus,
    dataMode: appConfig.dataMode,
    dataSourcesOnline: null,
    dataSourcesTotal: null,
    modelHealthy: null,
    modelTotal: null,
    eventRatePerSecond: null,
    lastIngestAt: null,
    lastUiRefreshAt: new Date().toISOString(),
    lastError,
  };
}

export async function getPlatformStatus(socketStatus: SocketStatus): Promise<PlatformStatus> {
  if (appConfig.dataMode !== "live") {
    return {
      socketStatus,
      dataMode: appConfig.dataMode,
      dataSourcesOnline: null,
      dataSourcesTotal: null,
      modelHealthy: null,
      modelTotal: null,
      eventRatePerSecond: null,
      lastIngestAt: null,
      lastUiRefreshAt: new Date().toISOString(),
      lastError: null,
    };
  }

  try {
    let dto: BackendPlatformStatusDTO;
    try {
      dto = await apiFetch<BackendPlatformStatusDTO>("/api/status");
    } catch {
      dto = await apiFetch<BackendPlatformStatusDTO>("/health");
    }
    return {
      socketStatus: dto.socket_status ?? socketStatus,
      dataMode: appConfig.dataMode,
      dataSourcesOnline: dto.data_sources_online ?? null,
      dataSourcesTotal: dto.data_sources_total ?? null,
      modelHealthy: dto.model_healthy ?? null,
      modelTotal: dto.model_total ?? null,
      eventRatePerSecond: dto.event_rate_per_second ?? null,
      lastIngestAt: dto.last_ingest_at ?? null,
      lastUiRefreshAt: new Date().toISOString(),
      lastError: dto.last_error ?? null,
    };
  } catch (error) {
    return unknownStatus("Disconnected", error instanceof Error ? error.message : "Backend status unavailable.");
  }
}
