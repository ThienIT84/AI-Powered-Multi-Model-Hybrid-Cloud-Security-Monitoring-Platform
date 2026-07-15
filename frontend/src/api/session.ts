export const SESSION_TOKEN_KEY = "hybrid_soc_session_token";
export const SESSION_USER_KEY = "hybrid_soc_session_user";

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const [, encodedPayload] = token.split(".");
  if (!encodedPayload) return null;

  try {
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return null;
  return exp > 100_000_000_000 ? exp : exp * 1000;
}

export function isAccessTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry <= Date.now();
}

export function getAccessToken(): string | null {
  if (!storageAvailable()) return null;

  const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;
  if (isAccessTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function saveSession(token: string, user: unknown): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function readSession<TUser>(): { token: string; user: TUser } | null {
  if (!storageAvailable()) return null;

  const token = getAccessToken();
  const serializedUser = window.localStorage.getItem(SESSION_USER_KEY);
  if (!token || !serializedUser) {
    clearSession();
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(serializedUser) as TUser,
    };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_USER_KEY);
}
