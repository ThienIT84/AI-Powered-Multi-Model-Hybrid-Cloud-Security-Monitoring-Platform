import { LoginRequest, RegisterRequest, User, UserRole } from "../../types/auth";

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

function getStoredUsers(): Record<string, { user: User; pass: string }> {
  const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!data) {
    const seed: Record<string, { user: User; pass: string }> = {};
    DEFAULT_USERS.forEach((u) => {
      // Seed with password: "Password123!" for ease of use
      seed[u.email.toLowerCase()] = {
        user: u,
        pass: "Password123!",
      };
    });
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, { user: User; pass: string }>) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(users));
}

export const authService = {
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

  /**
   * Logs out the current operator and revokes local session tokens
   */
  logout(): void {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },

  /**
   * Attempts to restore active user session from localStorage
   */
  getCurrentSession(): { token: string; user: User } | null {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    if (token && userStr) {
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
