// Thin fetch client for the PVA backend. Bearer token kept in localStorage.

import type {
  ActivityOut,
  AdminAgent,
  AdminConversation,
  AdminOverview,
  AdminRevenue,
  AdminTemplate,
  AdminUser,
  AgentOut,
  AgentUpdate,
  AuditEntry,
  BillingSummary,
  ConnectUrl,
  CostSummary,
  DashboardStats,
  IntegrationOut,
  IntegrationsHealth,
  LinkOut,
  LinkStatus,
  MemoryOut,
  RegisterPayload,
  ReminderOut,
  SystemHealth,
  TokenResponse,
  UserMe,
  WhatsAppStatus,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const TOKEN_KEY = "pva_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Raised on a 401 so callers (auth provider) can react to expired sessions. */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  } catch {
    /* non-JSON body */
  }
  return `${res.status} ${res.statusText}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) {
    const message = await extractError(res);
    // Signal the auth layer to sign out (expired/invalid session).
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("pva:auth-expired"));
    }
    throw new UnauthorizedError(message);
  }
  if (!res.ok) throw new Error(await extractError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  // Full-page redirect to the backend, which bounces to Google's consent screen.
  googleSignInUrl: (): string => `${BASE_URL}/api/auth/google/start`,
  // Backend login uses OAuth2PasswordRequestForm → form-encoded, not JSON.
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(await extractError(res));
    return res.json() as Promise<TokenResponse>;
  },
  register: (payload: RegisterPayload) =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const api = {
  me: () => request<UserMe>("/api/auth/me"),
  dashboard: () => request<DashboardStats>("/api/dashboard"),
  agent: () => request<AgentOut>("/api/agent"),
  updateAgent: (patch: AgentUpdate) =>
    request<AgentOut>("/api/agent", { method: "PATCH", body: JSON.stringify(patch) }),
  linkAgent: () => request<LinkOut>("/api/agent/link", { method: "POST" }),
  linkStatus: () => request<LinkStatus>("/api/agent/link/status"),
  reminders: (status = "pending") =>
    request<ReminderOut[]>(`/api/reminders?status=${status}`),
  cancelReminder: (id: string) =>
    request(`/api/reminders/${id}`, { method: "DELETE" }),
  activity: (limit = 50) => request<ActivityOut[]>(`/api/activity?limit=${limit}`),
  integrations: () => request<IntegrationOut[]>("/api/integrations"),
  connectIntegration: (service: string) =>
    request<ConnectUrl>(`/api/integrations/${service}/connect`),
  disconnectIntegration: (provider: string) =>
    request(`/api/integrations/${provider}`, { method: "DELETE" }),
  memory: () => request<MemoryOut[]>("/api/memory"),
  addMemory: (key: string, value: string) =>
    request<MemoryOut>("/api/memory", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    }),
  deleteMemory: (id: string) => request(`/api/memory/${id}`, { method: "DELETE" }),
  billing: () => request<BillingSummary>("/api/billing"),
  checkout: () =>
    request<{ checkout_url: string }>("/api/billing/checkout", { method: "POST" }),
};

export const adminApi = {
  overview: () => request<AdminOverview>("/api/admin/overview"),
  users: (q?: string) =>
    request<AdminUser[]>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  userDetail: (id: string) => request<Record<string, unknown>>(`/api/admin/users/${id}`),
  agents: () => request<AdminAgent[]>("/api/admin/agents"),
  integrationsHealth: () =>
    request<IntegrationsHealth>("/api/admin/integrations/health"),
  systemHealth: () => request<SystemHealth>("/api/admin/system/health"),
  whatsapp: () => request<WhatsAppStatus>("/api/admin/whatsapp"),
  costs: () => request<CostSummary>("/api/admin/costs"),
  audit: () => request<AuditEntry[]>("/api/admin/audit"),
  conversations: () => request<AdminConversation[]>("/api/admin/conversations"),
  revenue: () => request<AdminRevenue>("/api/admin/revenue"),
  templates: () => request<AdminTemplate[]>("/api/admin/templates"),
  suspendUser: (id: string) =>
    request(`/api/admin/users/${id}/suspend`, { method: "POST" }),
  activateUser: (id: string) =>
    request(`/api/admin/users/${id}/activate`, { method: "POST" }),
};
