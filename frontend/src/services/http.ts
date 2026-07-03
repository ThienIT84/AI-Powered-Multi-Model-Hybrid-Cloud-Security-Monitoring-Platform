import { appConfig } from "../config";

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function assertLiveConfigured() {
  if (appConfig.dataMode !== "live") return;
  if (!appConfig.apiBaseUrl || !appConfig.wsUrl) {
    throw new ConfigurationError("Live mode requires VITE_API_BASE_URL and VITE_WS_URL.");
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  assertLiveConfigured();
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

