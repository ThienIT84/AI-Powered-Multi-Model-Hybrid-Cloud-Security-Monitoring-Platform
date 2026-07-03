import { AuthMode, DataMode } from "./types/platform";

const env = (import.meta.env ?? {}) as ImportMetaEnv & Record<string, string | boolean | undefined>;

function resolveDataMode(value: unknown): { dataMode: DataMode; error: string | null } {
  if (value === "live" || value === "replay" || value === "demo") {
    return { dataMode: value, error: null };
  }
  if (value === "api") return { dataMode: "live", error: null };
  if (!env.PROD) return { dataMode: "demo", error: null };
  return {
    dataMode: "live",
    error: "Production build requires VITE_DATA_MODE to be set to live, replay, or demo.",
  };
}

function resolveAuthMode(value: unknown): { authMode: AuthMode; error: string | null } {
  if (value === "demo") {
    if (env.PROD) {
      return {
        authMode: "backend",
        error: "Production build cannot use VITE_AUTH_MODE=demo. Configure backend authentication.",
      };
    }
    return { authMode: "demo", error: null };
  }
  if (value === "backend") return { authMode: "backend", error: null };
  return { authMode: env.PROD ? "backend" : "demo", error: null };
}

const resolvedMode = resolveDataMode(env.VITE_DATA_MODE);
const resolvedAuth = resolveAuthMode(env.VITE_AUTH_MODE);
const configurationError = [resolvedMode.error, resolvedAuth.error].filter(Boolean).join(" ") || null;
const defaultMockWsUrl =
  typeof window === "undefined"
    ? "ws://localhost:3001"
    : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

export const appConfig: {
  dataMode: DataMode;
  authMode: AuthMode;
  apiBaseUrl: string;
  wsUrl: string;
  mockWsUrl: string;
  configurationError: string | null;
} = {
  dataMode: resolvedMode.dataMode,
  authMode: resolvedAuth.authMode,
  apiBaseUrl: env.VITE_API_BASE_URL ?? "",
  wsUrl: env.VITE_WS_URL ?? "",
  mockWsUrl: env.VITE_MOCK_WS_URL ?? defaultMockWsUrl,
  configurationError,
};
