export type DataMode = "demo" | "replay" | "live";

const rawDataMode = import.meta.env.VITE_DATA_MODE;
const normalizedDataMode =
  rawDataMode === "api" ? "live" : rawDataMode === "mock" ? "demo" : rawDataMode;
const isValidDataMode = (mode: unknown): mode is DataMode =>
  mode === "demo" || mode === "replay" || mode === "live";
const configErrors: string[] = [];

if (!rawDataMode && import.meta.env.PROD) {
  configErrors.push("VITE_DATA_MODE is required for production builds.");
}

if (rawDataMode && !isValidDataMode(normalizedDataMode)) {
  configErrors.push(`Unsupported VITE_DATA_MODE "${rawDataMode}". Use demo, replay, or live.`);
}

const dataMode: DataMode = isValidDataMode(normalizedDataMode)
  ? normalizedDataMode
  : import.meta.env.PROD
    ? "live"
    : "demo";

export const appConfig: {
  dataMode: DataMode;
  apiBaseUrl: string;
  wsUrl: string;
  mockWsUrl: string;
  configErrors: string[];
} = {
  dataMode,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  wsUrl: import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws/alerts",
  mockWsUrl:
    import.meta.env.VITE_MOCK_WS_URL ??
    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`,
  configErrors,
};
