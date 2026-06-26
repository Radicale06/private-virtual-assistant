// Shapes returned by the backend /api/admin/* endpoints.

export interface AdminOverview {
  total_users: number;
  active_agents: number;
  messages_today: number;
  pending_jobs: number;
  integrations_errored: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  plan: string;
  created_at: string;
}

export interface SystemHealth {
  pending_jobs: number;
  failed_jobs: number;
  integrations_errored: number;
}

export interface WhatsAppStatus {
  linked_numbers: number;
  inbound_24h: number;
  outbound_24h: number;
}

export interface CostSummary {
  window_days: number;
  messages: number;
  total_tokens: number;
}

export interface AdminAgent {
  id: string;
  name: string;
  status: string;
  owner_email: string | null;
  integrations_connected: number;
}

export type IntegrationsHealth = Record<
  string,
  { connected?: number; error?: number; disconnected?: number }
>;

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

export interface MemoryOut {
  id: string;
  key: string;
  value: string;
  source: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  timezone?: string;
  assistant_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ---- customer-side ----
export interface UserMe {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  plan: string;
  timezone: string;
}

export interface AgentOut {
  id: string;
  name: string;
  tone: string;
  status: string;
  confirm_before_send: boolean;
  morning_briefing_enabled: boolean;
  morning_briefing_time: string | null;
  work_start: string | null;
  work_end: string | null;
}

export interface LinkStatus {
  linked: boolean;
  phone_number: string | null;
}

export interface ReminderOut {
  id: string;
  title: string | null;
  run_at: string;
  status: string;
}

export interface IntegrationOut {
  provider: string;
  status: string;
  account_email: string | null;
  last_error: string | null;
}

export interface ActivityOut {
  id: string;
  direction: string;
  role: string;
  type: string;
  content: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface BillingSummary {
  plan: string;
  messages_used: number;
  limit: number;
}

export interface LinkOut {
  token: string;
  wa_link: string;
  expires_at: string;
}

export interface ConnectUrl {
  authorization_url: string;
}

export interface AgentUpdate {
  name?: string;
  tone?: string;
  confirm_before_send?: boolean;
  morning_briefing_enabled?: boolean;
  morning_briefing_time?: string | null;
  work_start?: string | null;
  work_end?: string | null;
}
