import { LoginRequest, RegisterRequest } from "../../types/auth";
import { getAuthAdapter } from "../../adapters/auth.adapters";

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
  async verifyMfa(_email: string, code: string): Promise<boolean> {
    return code.length === 6;
  },
};
