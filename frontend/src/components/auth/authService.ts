import { LoginRequest, RegisterRequest } from "../../types/auth";
import { getAuthAdapter } from "../../adapters/auth.adapters";
import { appConfig } from "../../config";
import { apiFetch } from "../../services/http";

export const authService = {
  login(credentials: LoginRequest) {
    return getAuthAdapter().login(credentials);
  },
  register(data: RegisterRequest) {
    return getAuthAdapter().register(data);
  },
  logout(): void {
    getAuthAdapter().logout();
  },
  getCurrentSession() {
    return getAuthAdapter().getCurrentSession();
  },
  async verifyMfa(email: string, code: string): Promise<boolean> {
    if (appConfig.authMode === "backend") {
      const result = await apiFetch<{ verified: boolean }>("/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      return result.verified;
    }
    return code.length === 6;
  },
};
