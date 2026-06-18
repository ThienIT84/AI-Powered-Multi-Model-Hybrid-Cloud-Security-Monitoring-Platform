export type UserRole = "Admin" | "SOC Analyst" | "Security Engineer" | "Viewer";

export interface User {
  fullName: string;
  email: string;
  role: UserRole;
  organization?: string;
  mfaEnabled: boolean;
  avatar?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
