export type DataMode = "demo" | "replay" | "live";
export type AuthMode = "demo" | "backend";

export type SocketStatus =
  | "Connected"
  | "Connecting"
  | "Reconnecting"
  | "Disconnected"
  | "Error";

export interface PlatformStatus {
  socketStatus: SocketStatus;
  dataMode: DataMode;
  dataSourcesOnline: number | null;
  dataSourcesTotal: number | null;
  modelHealthy: number | null;
  modelTotal: number | null;
  eventRatePerSecond: number | null;
  lastIngestAt: string | null;
  lastUiRefreshAt: string;
  lastError: string | null;
}

export interface ServiceResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
