export type DataMode = "demo" | "replay" | "live";
export type DeploymentEnvironment = "local" | "aws";

const rawDataMode = import.meta.env.VITE_DATA_MODE;
const normalizedDataMode = rawDataMode === "api" ? "live" : rawDataMode;
const rawDeploymentEnvironment = import.meta.env.VITE_DEPLOYMENT_ENV;
const configErrors: string[] = [];

if (!rawDataMode && import.meta.env.PROD) {
  configErrors.push("VITE_DATA_MODE is required for production builds.");
}

if (rawDataMode && normalizedDataMode !== "live" && normalizedDataMode !== "replay") {
  configErrors.push(
    `Unsupported VITE_DATA_MODE "${rawDataMode}". This frontend only accepts backend-backed live or replay data.`,
  );
}

if (!rawDeploymentEnvironment && import.meta.env.PROD) {
  configErrors.push("VITE_DEPLOYMENT_ENV is required for production builds.");
}

if (rawDeploymentEnvironment && rawDeploymentEnvironment !== "local" && rawDeploymentEnvironment !== "aws") {
  configErrors.push(
    `Unsupported VITE_DEPLOYMENT_ENV "${rawDeploymentEnvironment}". Use local or aws.`,
  );
}

const dataMode: DataMode = normalizedDataMode === "replay" ? "replay" : "live";
const deploymentEnvironment: DeploymentEnvironment = rawDeploymentEnvironment === "local"
  ? "local"
  : rawDeploymentEnvironment === "aws" || import.meta.env.PROD
    ? "aws"
    : "local";
const localApiBaseUrl = "http://localhost:8000";
const localWsUrl = "ws://localhost:8000/ws/alerts";

function browserLocation(): Location | null {
  return typeof window === "undefined" ? null : window.location;
}

function awsApiBaseUrl(): string {
  return browserLocation()?.origin ?? "";
}

function awsWsUrl(): string {
  const location = browserLocation();
  if (!location) return "/ws/alerts";
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/ws/alerts`;
}

function isSameBrowserOrigin(value: string): boolean {
  const location = browserLocation();
  if (!location) return true;

  try {
    const candidate = new URL(value, location.href);
    const candidateProtocol = candidate.protocol === "ws:"
      ? "http:"
      : candidate.protocol === "wss:"
        ? "https:"
        : candidate.protocol;
    return candidateProtocol === location.protocol && candidate.host === location.host;
  } catch {
    return false;
  }
}

function configuredUrl(envName: string, rawValue: string | undefined, fallback: string): string {
  const value = rawValue?.trim();
  if (!value) return fallback;

  if (deploymentEnvironment === "aws" && !isSameBrowserOrigin(value)) {
    configErrors.push(`${envName} must remain same-origin when VITE_DEPLOYMENT_ENV is aws.`);
    return fallback;
  }

  return value;
}

const apiBaseUrl = configuredUrl(
  "VITE_API_BASE_URL",
  import.meta.env.VITE_API_BASE_URL,
  deploymentEnvironment === "aws" ? awsApiBaseUrl() : localApiBaseUrl,
).replace(/\/+$/, "");
const wsUrl = configuredUrl(
  "VITE_WS_URL",
  import.meta.env.VITE_WS_URL,
  deploymentEnvironment === "aws" ? awsWsUrl() : localWsUrl,
);

export const appConfig: {
  dataMode: DataMode;
  deploymentEnvironment: DeploymentEnvironment;
  apiBaseUrl: string;
  wsUrl: string;
  configErrors: string[];
} = {
  dataMode,
  deploymentEnvironment,
  apiBaseUrl,
  wsUrl,
  configErrors,
};
