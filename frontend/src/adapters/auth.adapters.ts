import { appConfig } from "../config";
import { LoginRequest, RegisterRequest, User, UserRole } from "../types/auth";
import { apiFetch } from "../services/http";

export interface AuthSession {
  token: string;
  user: User;
}

export interface AuthAdapter {
  login(credentials: LoginRequest): Promise<AuthSession>;
  register(details: RegisterRequest): Promise<AuthSession>;
  logout(): void;
  getCurrentSession(): AuthSession | null;
}

const DEFAULT_USERS: User[] = [
  {
    fullName: "Chief SOC Architect",
    email: "admin@defense.soc",
    role: "Admin",
    organization: "Antigravity Global Security",
    mfaEnabled: true,
    avatar: "CA",
    lastLogin: "Demo Account",
  },
  {
    fullName: "Lead Threat Analyst",
    email: "analyst@defense.soc",
    role: "SOC Analyst",
    organization: "Antigravity Global Security",
    mfaEnabled: false,
    avatar: "LA",
    lastLogin: "Demo Account",
  },
];

const ACCOUNTS_STORAGE_KEY = "hybrid_soc_accounts_db";
const SESSION_TOKEN_KEY = "hybrid_soc_session_token";
const SESSION_USER_KEY = "hybrid_soc_session_user";

function getStoredUsers(): Record<string, { user: User; pass: string }> {
  const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!data) {
    const seed: Record<string, { user: User; pass: string }> = {};
    DEFAULT_USERS.forEach((user) => {
      seed[user.email.toLowerCase()] = { user, pass: "Password123!" };
    });
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data) as Record<string, { user: User; pass: string }>;
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, { user: User; pass: string }>) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(users));
}

function createDemoToken(user: User) {
  const header = btoa(JSON.stringify({ alg: "demo", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: user.email, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 }));
  return `${header}.${payload}.demo`;
}

function tokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (typeof payload.exp !== "number") return true;
    const expiryMs = payload.exp < 10_000_000_000 ? payload.exp * 1000 : payload.exp;
    return expiryMs < Date.now();
  } catch {
    return true;
  }
}

export const DemoAuthAdapter: AuthAdapter = {
  async login(credentials) {
    const email = credentials.email.trim().toLowerCase();
    const record = getStoredUsers()[email];
    if (!record || record.pass !== credentials.password) {
      throw new Error("Access Denied: Invalid SOC operator credentials.");
    }
    const session = { token: createDemoToken(record.user), user: { ...record.user, lastLogin: new Date().toISOString() } };
    localStorage.setItem(SESSION_TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
    return session;
  },
  async register(data) {
    const email = data.email.trim().toLowerCase();
    const db = getStoredUsers();
    if (db[email]) throw new Error("Registration Failed: Operator ID already registered.");
    const role: UserRole = "Security Engineer";
    const user: User = {
      fullName: data.fullName,
      email,
      role,
      organization: data.organization || "Independent Sentinel",
      mfaEnabled: false,
      avatar: data.fullName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "OP",
      lastLogin: new Date().toISOString(),
    };
    db[email] = { user, pass: data.password };
    saveStoredUsers(db);
    const session = { token: createDemoToken(user), user };
    localStorage.setItem(SESSION_TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    return session;
  },
  logout() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },
  getCurrentSession() {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    if (!token || !userStr || tokenExpired(token)) return null;
    try {
      return { token, user: JSON.parse(userStr) as User };
    } catch {
      return null;
    }
  },
};

export const BackendAuthAdapter: AuthAdapter = {
  async login(credentials) {
    const session = await apiFetch<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    localStorage.setItem(SESSION_TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
    return session;
  },
  async register(details) {
    const session = await apiFetch<AuthSession>("/auth/register", { method: "POST", body: JSON.stringify(details) });
    localStorage.setItem(SESSION_TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
    return session;
  },
  logout() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },
  getCurrentSession() {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    if (!token || !userStr || tokenExpired(token)) return null;
    try {
      return { token, user: JSON.parse(userStr) as User };
    } catch {
      return null;
    }
  },
};

export function getAuthAdapter(): AuthAdapter {
  return appConfig.authMode === "backend" ? BackendAuthAdapter : DemoAuthAdapter;
}
