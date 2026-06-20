import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from "react";
import { User, LoginRequest, RegisterRequest } from "../types/auth";
import { authService } from "../components/auth/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (details: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check for existing active session
  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (details: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(details);
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.message || "Operator registration failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
