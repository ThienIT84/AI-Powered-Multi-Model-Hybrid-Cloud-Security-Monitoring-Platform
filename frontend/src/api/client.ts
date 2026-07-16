import { appConfig } from "../config";
import { clearSession, getAccessToken } from "./session";

export interface RuntimeSchema<T> {
  parse(value: unknown): T;
}

export interface ApiRequestOptions<T> extends Omit<RequestInit, "body"> {
  body?: unknown;
  authenticated?: boolean;
  schema?: RuntimeSchema<T>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${appConfig.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractErrorMessage(payload: unknown, response: Response): string {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return `Backend request failed with HTTP ${response.status}`;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError("Backend returned invalid JSON.", response.status, text);
    }
  }
  return text;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions<T> = {},
): Promise<T> {
  const {
    authenticated = true,
    body,
    headers: providedHeaders,
    schema,
    ...requestInit
  } = options;
  const headers = new Headers(providedHeaders);
  headers.set("Accept", "application/json");

  if (authenticated) {
    const token = getAccessToken();
    if (!token) throw new ApiError("An authenticated backend session is required.", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string") {
      requestBody = body;
    } else {
      headers.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...requestInit,
    headers,
    body: requestBody,
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    if (authenticated && response.status === 401) clearSession();
    throw new ApiError(extractErrorMessage(payload, response), response.status, payload);
  }

  return (schema ? schema.parse(payload) : payload) as T;
}
