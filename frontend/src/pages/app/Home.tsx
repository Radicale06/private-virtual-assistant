import {
  Bell,
  Bot,
  Calendar,
  Mail,
  MessageCircle,
  Mic,
  QrCode,
  SlidersHorizontal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { INTEGRATIONS } from "../../lib/integrations";
import { KpiCard } from "../../components/app/home/KpiCard";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import type {
  ActivityOut,
  BillingSummary,
  DashboardStats,
  IntegrationOut,
  LinkStatus,
  ReminderOut,
} from "../../lib/types";

// Soft display cap for the AI-actions usage bar (no hard backend limit).
const AI_ACTION_LIMIT = 100;

// ---------------------------------------------------------------- helpers
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(full: string | null | undefined): string {
  return (full ?? "there").split(" ")[0];
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · ${time}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; tone: string; bg: string }> = {
  create_event: { icon: Calendar, tone: "text-primary", bg: "bg-primary-muted" },
  set_reminder: { icon: Bell, tone: "text-warning", bg: "bg-warning-muted" },
  send_email: { icon: Mail, tone: "text-primary", bg: "bg-primary-muted" },
  summarize_emails: { icon: Mail, tone: "text-primary", bg: "bg-primary-muted" },
  voice: { icon: Mic, tone: "text-success", bg: "bg-success-muted" },
  default: { icon: Zap, tone: "text-primary", bg: "bg-primary-muted" },
};

function activityVisual(a: ActivityOut) {
  const tool = (a.payload?.tool as string) ?? (a.type === "voice" ? "voice" : "default");
  return ACTIVITY_ICONS[tool] ?? ACTIVITY_ICONS.default;
}

function integrationStatus(status: string | undefined): {
  label: string;
  tone: "success" | "warning" | "neutral";
} {
  if (status === "connected") return { label: "Active", tone: "success" };
  if (status === "error") return { label: "Token refresh needed", tone: "warning" };
  return { label: "Not connected", tone: "neutral" };
}

// ---------------------------------------------------------------- sections
function AssistantBar({
  name,
  link,
  lastActiveAt,
}: {
  name: string;
  link: LinkStatus | null;
  lastActiveAt: string | null;
}) {
  const connected = link?.linked ?? false;
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-input">
          <Bot className="h-5 w-5 text-secondary-foreground" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headings text-lg font-semibold text-foreground">{name}</span>
            <Badge tone={connected ? "success" : "neutral"} dot>
              {connected ? "Connected to WhatsApp" : "Not linked"}
            </Badge>
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {link?.phone_number ? `+${link.phone_number}` : "Not linked to WhatsApp"}
            {lastActiveAt ? ` · Last active ${timeAgo(lastActiveAt)}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary">
          <QrCode className="h-4 w-4" />
          {connected ? "Re-link" : "Link WhatsApp"}
        </button>
        <button className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <SlidersHorizontal className="h-4 w-4" />
          Configure
        </button>
      </div>
    </Card>
  );
}

function AgendaCard() {
  // Today's calendar events aren't exposed as a REST endpoint yet; once a
  // /api/agenda (reading the connected calendar) exists, populate this.
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Today's Agenda</h3>
        <span className="text-sm text-muted-foreground">0 events</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Nothing scheduled. Connect a calendar and your assistant will show your day here.
      </p>
    </Card>
  );
}

function RemindersCard({ reminders }: { reminders: ReminderOut[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Reminders</h3>
        <a href="/app/reminders" className="text-sm font-medium text-primary">
          View all
        </a>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {reminders.length === 0 && (
          <p className="text-sm text-muted-foreground">No upcoming reminders.</p>
        )}
        {reminders.slice(0, 3).map((r) => (
          <div key={r.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning-muted">
              <Bell className="h-[15px] w-[15px] text-warning" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-medium text-foreground">{r.title ?? "Reminder"}</div>
              <div className="text-xs text-muted-foreground">{formatWhen(r.run_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityCard({ items }: { items: ActivityOut[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <a href="/app/activity" className="text-sm font-medium text-primary">
          Full history
        </a>
      </div>
      <div className="mt-4 flex flex-col">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        )}
        {items.map((a) => {
          const v = activityVisual(a);
          const Icon = v.icon;
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 border-b border-border py-3 last:border-0"
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", v.bg)}>
                <Icon className={cn("h-[15px] w-[15px]", v.tone)} />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-sm font-medium text-foreground">
                  {a.content ?? a.type}
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(a.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function IntegrationsCard({ integrations }: { integrations: IntegrationOut[] }) {
  const byProvider = new Map(integrations.map((i) => [i.provider, i]));
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Integrations</h3>
        <a href="/app/assistant" className="text-sm font-medium text-primary">
          Manage
        </a>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {INTEGRATIONS.map((cat) => {
          const status = integrationStatus(byProvider.get(cat.provider)?.status);
          return (
            <div key={cat.provider} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
                  <img src={cat.logo} alt="" className="h-[18px] w-[18px]" loading="lazy" />
                </span>
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
              </div>
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function UsageCard({
  billing,
  aiActions,
}: {
  billing: BillingSummary | null;
  aiActions: number;
}) {
  const messagesUsed = billing?.messages_used ?? 0;
  const messagesLimit = billing?.limit ?? 100;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Usage</h3>
        <Badge tone="primary" className="capitalize">
          {billing?.plan ?? "free"}
        </Badge>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Messages</span>
            <span className="text-muted-foreground">
              {messagesUsed} / {messagesLimit}
            </span>
          </div>
          <ProgressBar value={(messagesUsed / messagesLimit) * 100} className="mt-2 h-2" />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">AI Actions</span>
            <span className="text-muted-foreground">
              {aiActions} / {AI_ACTION_LIMIT}
            </span>
          </div>
          <ProgressBar value={(aiActions / AI_ACTION_LIMIT) * 100} className="mt-2 h-2" />
        </div>
      </div>

      <button className="mt-5 w-full rounded-md border border-primary py-3 text-sm font-medium text-primary hover:bg-primary-muted">
        Upgrade Plan
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------- page
export function Home() {
  const { me } = useApp();
  const [link, setLink] = useState<LinkStatus | null>(null);
  const [reminders, setReminders] = useState<ReminderOut[]>([]);
  const [activity, setActivity] = useState<ActivityOut[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationOut[]>([]);
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentName, setAgentName] = useState("Musaed");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      api.agent(),
      api.linkStatus(),
      api.reminders(),
      api.activity(),
      api.integrations(),
      api.billing(),
      api.dashboard(),
    ]).then(([ag, ln, rm, ac, ig, bl, st]) => {
      if (ag.status === "fulfilled") setAgentName(ag.value.name);
      if (ln.status === "fulfilled") setLink(ln.value);
      if (rm.status === "fulfilled") setReminders(rm.value);
      if (ac.status === "fulfilled") setActivity(ac.value);
      if (ig.status === "fulfilled") setIntegrations(ig.value);
      if (bl.status === "fulfilled") setBilling(bl.value);
      if (st.status === "fulfilled") setStats(st.value);
      if ([ag, ln, rm, ac, ig, bl, st].every((r) => r.status === "rejected")) {
        setError("Couldn't reach the server — some data may be missing.");
      }
    });
  }, []);

  return (
    <>
      <AppTopbar
        title={`${greeting()}, ${firstName(me?.full_name)} 👋`}
        subtitle="Here's what your assistant is working on today."
        userName={me?.full_name ?? me?.email ?? "You"}
      />

      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        {error && (
          <Card className="border-warning/30 bg-warning-muted px-4 py-2.5 text-sm text-warning">
            {error}
          </Card>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Messages this month"
            value={String(stats?.messages_this_month ?? 0)}
            icon={MessageCircle}
          />
          <KpiCard
            label="AI Actions taken"
            value={String(stats?.ai_actions ?? 0)}
            icon={Zap}
          />
          <KpiCard
            label="Events created"
            value={String(stats?.events_created ?? 0)}
            icon={Calendar}
          />
          <KpiCard
            label="Reminders set"
            value={String(reminders.length)}
            icon={Bell}
          />
        </div>

        {/* assistant status */}
        <AssistantBar name={agentName} link={link} lastActiveAt={stats?.last_active_at ?? null} />

        {/* two-column */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <AgendaCard />
            <ActivityCard items={activity} />
          </div>
          <div className="flex flex-col gap-6">
            <RemindersCard reminders={reminders} />
            <IntegrationsCard integrations={integrations} />
          </div>
        </div>

        {/* usage */}
        <UsageCard billing={billing} aiActions={stats?.ai_actions ?? 0} />
      </main>
    </>
  );
}
