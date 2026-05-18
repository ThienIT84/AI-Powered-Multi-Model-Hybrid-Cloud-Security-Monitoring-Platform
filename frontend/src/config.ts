export type DataMode = "mock" | "api";

const dataMode: DataMode = import.meta.env.VITE_DATA_MODE === "api" ? "api" : "mock";

export const appConfig: {
  dataMode: DataMode;
  apiBaseUrl: string;
  wsUrl: string;
  mockWsUrl: string;
} = {
  dataMode,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  wsUrl: import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws/alerts",
  mockWsUrl:
    import.meta.env.VITE_MOCK_WS_URL ??
    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`,
};
