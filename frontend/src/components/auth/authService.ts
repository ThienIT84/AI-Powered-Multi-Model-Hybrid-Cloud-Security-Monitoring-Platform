import { apiRequest } from "../../api/client";
import {
  clearSession,
  getAccessToken,
  isAccessTokenExpired,
  readSession,
  saveSession,
} from "../../api/session";
import { LoginRequest, RegisterRequest, User } from "../../types/auth";

interface AuthResponse {
  token: string;
  user: User;
}

function assertAuthResponse(value: AuthResponse): AuthResponse {
  if (!value?.token || !value.user?.email || !value.user.fullName) {
    throw new Error("Authentication API returned an invalid session payload.");
  }
  if (isAccessTokenExpired(value.token)) {
    throw new Error("Authentication token is expired.");
  }
  return value;
}

async function authenticate(path: string, body: LoginRequest | RegisterRequest): Promise<AuthResponse> {
  const result = assertAuthResponse(
    await apiRequest<AuthResponse>(path, {
      method: "POST",
      body,
      authenticated: false,
    }),
  );
  saveSession(result.token, result.user);
  return result;
}

export const authService = {
  login(credentials: LoginRequest): Promise<AuthResponse> {
    return authenticate("/api/auth/login", credentials);
  },

  register(details: RegisterRequest): Promise<AuthResponse> {
    return authenticate("/api/auth/register", details);
  },

  logout(): void {
    const token = getAccessToken();
    if (token) {
      void apiRequest("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    }
    clearSession();
  },

  getCurrentSession(): AuthResponse | null {
    const session = readSession<User>();
    if (!session?.user?.email || !session.user.fullName) {
      clearSession();
      return null;
    }
    return session;
  },

  async verifyMfa(email: string, code: string): Promise<boolean> {
    const result = await apiRequest<{ verified: boolean }>("/api/auth/mfa/verify", {
      method: "POST",
      body: { email, code },
      authenticated: false,
    });
    return result.verified === true;
  },
};
