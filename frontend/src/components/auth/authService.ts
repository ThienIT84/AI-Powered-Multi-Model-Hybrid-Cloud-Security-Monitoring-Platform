import { LoginRequest, RegisterRequest, User, UserRole } from "../../types/auth";
import { appConfig } from "../../config";

const DEFAULT_USERS: User[] = [
  {
    fullName: "Chief SOC Architect",
    email: "admin@defense.soc",
    role: "Admin",
    organization: "Antigravity Global Security",
    mfaEnabled: true,
    avatar: "CA",
    lastLogin: "Just Now",
  },
  {
    fullName: "Lead Threat Analyst",
    email: "analyst@defense.soc",
    role: "SOC Analyst",
    organization: "Antigravity Global Security",
    mfaEnabled: false,
    avatar: "LA",
    lastLogin: "2 hours ago",
  },
];

// In-Memory/LocalStorage User DB for registering new accounts dynamically
const ACCOUNTS_STORAGE_KEY = "hybrid_soc_accounts_db";
const SESSION_TOKEN_KEY = "hybrid_soc_session_token";
const SESSION_USER_KEY = "hybrid_soc_session_user";

function buildDefaultUserSeed(): Record<string, { user: User; pass: string }> {
  const seed: Record<string, { user: User; pass: string }> = {};
  DEFAULT_USERS.forEach((u) => {
    seed[u.email.toLowerCase()] = {
      user: u,
      pass: "Password123!",
    };
  });
  return seed;
}

function getStoredUsers(): Record<string, { user: User; pass: string }> {
  const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!data) {
    const seed = buildDefaultUserSeed();
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(data) as Record<string, { user: User; pass: string }>;
    let changed = false;
    DEFAULT_USERS.forEach((u) => {
      const key = u.email.toLowerCase();
      if (!parsed[key]) {
        parsed[key] = {
          user: u,
          pass: "Password123!",
        };
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    const seed = buildDefaultUserSeed();
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveStoredUsers(users: Record<string, { user: User; pass: string }>) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(users));
}

function parseTokenExpiry(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const parsed = JSON.parse(atob(payload)) as { exp?: number };
    if (!parsed.exp) return null;
    return parsed.exp > 10_000_000_000 ? parsed.exp : parsed.exp * 1000;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string) {
  const expiry = parseTokenExpiry(token);
  return expiry !== null && expiry <= Date.now();
}

async function requestBackendAuth<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Authentication API returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

const demoAuthAdapter = {
  /**
   * Performs an asynchronous login simulation with realistic response latency
   */
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        const db = getStoredUsers();
        const record = db[email];

        if (!record) {
          return reject(new Error("Access Denied: Invalidation of provided SOC credentials."));
        }

        if (record.pass !== password) {
          return reject(new Error("Access Denied: Invalid password for this operator ID."));
        }

        // Generate a simulated secure JWT Token
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: record.user.email,
            role: record.user.role,
            org: record.user.organization,
            exp: Date.now() + 8 * 60 * 60 * 1000, // 8-hour shift expiry
          })
        );
        const signature = btoa("soc_secure_signature_hash");
        const token = `${header}.${payload}.${signature}`;

        // Save session
        localStorage.setItem(SESSION_TOKEN_KEY, token);
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(record.user));

        // Update last login
        record.user.lastLogin = new Date().toISOString();
        db[email] = record;
        saveStoredUsers(db);

        resolve({ token, user: record.user });
      }, 800); // 800ms realistic network and validator latency
    });
  },

  /**
   * Registers a new operator account and stores it securely
   */
  async register(data: RegisterRequest): Promise<{ token: string; user: User }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = data.email.trim().toLowerCase();
        const db = getStoredUsers();

        if (db[email]) {
          return reject(new Error("Registration Failed: Email domain or operator ID already registered."));
        }

        // Default role for new signups is Security Engineer or viewer (we'll default to Security Engineer)
        const role: UserRole = "Security Engineer";
        const avatar = data.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "OP";

        const newUser: User = {
          fullName: data.fullName,
          email,
          role,
          organization: data.organization || "Independent Sentinel",
          mfaEnabled: false,
          avatar,
          lastLogin: new Date().toISOString(),
        };

        // Add to persistent operator DB
        db[email] = {
          user: newUser,
          pass: data.password,
        };
        saveStoredUsers(db);

        // Generate session elements for instant login upon registration
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: newUser.email,
            role: newUser.role,
            org: newUser.organization,
            exp: Date.now() + 8 * 60 * 60 * 1000,
          })
        );
        const signature = btoa("soc_secure_signature_hash");
        const token = `${header}.${payload}.${signature}`;

        localStorage.setItem(SESSION_TOKEN_KEY, token);
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser));

        resolve({ token, user: newUser });
      }, 1000);
    });
  },

  logout(): void {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },

  getCurrentSession(): { token: string; user: User } | null {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    if (token && userStr && !isTokenExpired(token)) {
      try {
        return {
          token,
          user: JSON.parse(userStr) as User,
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Simulates an MFA challenge trigger
   */
  async verifyMfa(email: string, code: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock verification: any 6-digit code matches or 123456
        resolve(code.length === 6);
      }, 500);
    });
  },
};

const backendAuthAdapter = {
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    const result = await requestBackendAuth<{ token: string; user: User }>("/api/auth/login", credentials);
    if (isTokenExpired(result.token)) throw new Error("Authentication token is expired.");
    localStorage.setItem(SESSION_TOKEN_KEY, result.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(result.user));
    return result;
  },

  async register(data: RegisterRequest): Promise<{ token: string; user: User }> {
    const result = await requestBackendAuth<{ token: string; user: User }>("/api/auth/register", data);
    if (isTokenExpired(result.token)) throw new Error("Authentication token is expired.");
    localStorage.setItem(SESSION_TOKEN_KEY, result.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(result.user));
    return result;
  },

  logout(): void {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      fetch(`${appConfig.apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => undefined);
    }
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },

  getCurrentSession(): { token: string; user: User } | null {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    if (!token || !userStr || isTokenExpired(token)) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    try {
      return { token, user: JSON.parse(userStr) as User };
    } catch {
      return null;
    }
  },

  async verifyMfa(email: string, code: string): Promise<boolean> {
    const result = await requestBackendAuth<{ verified: boolean }>("/api/auth/mfa/verify", { email, code });
    return result.verified;
  },
};

export const authService = appConfig.dataMode === "live" ? backendAuthAdapter : demoAuthAdapter;
