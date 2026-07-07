import {
  AlertTriangle,
  Bot,
  CalendarDays,
  Check,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CostBreakdown } from "../../components/platform/overview/CostBreakdown";
import { NeedsAttention } from "../../components/platform/overview/NeedsAttention";
import { SAMPLE } from "../../components/platform/overview/sampleData";
import { SystemHealthPanel } from "../../components/platform/overview/SystemHealthPanel";
import { UsersTable } from "../../components/platform/overview/UsersTable";
import { WhatsAppPanel } from "../../components/platform/overview/WhatsAppPanel";
import { Card } from "../../components/ui/Card";
import { SampleTag } from "../../components/ui/SampleTag";
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type {
  AdminOverview,
  AdminUser,
  SystemHealth,
  WhatsAppStatus,
} from "../../lib/types";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background";
const PRESS = "transition active:scale-[0.97] motion-reduce:active:scale-100";

function TrendCard({
  label,
  value,
  delta,
  deltaTone,
  range,
  data,
  color,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "danger";
  range: string;
  data: number[];
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <span className="truncate">{label}</span>
          <SampleTag />
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{range}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-semibold text-foreground">{value}</span>
        <span
          className={
            deltaTone === "danger"
              ? "text-xs font-medium text-danger"
              : "text-xs font-medium text-success"
          }
        >
          {delta}
        </span>
      </div>
      <div className="mt-2">
        <Sparkline data={data} color={color} />
      </div>
    </Card>
  );
}

export function Overview() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped on every successful load; keys the transient "Updated" confirmation
  // so it replays on each refresh.
  const [refreshCount, setRefreshCount] = useState(0);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [ov, us, hl, wa] = await Promise.all([
        adminApi.overview(),
        adminApi.users(q),
        adminApi.systemHealth(),
        adminApi.whatsapp(),
      ]);
      setOverview(ov);
      setUsers(us);
      setHealth(hl);
      setWhatsapp(wa);
      setRefreshCount((n) => n + 1);
    } catch (e) {
      // Backend not reachable / not authed — fall through to sample-only view.
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // First paint, before any response: skeleton the live (backend-backed) values
  // rather than flashing sample numbers as if they were real.
  const firstLoad = loading && !loaded;
  const t = SAMPLE.trends;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Platform Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Real-time health, usage, and revenue across all tenants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Last 12 days
          </span>
          {refreshCount > 0 && !loading && !error && (
            <span
              key={refreshCount}
              className="anim-confirm flex items-center gap-1 text-xs font-medium text-success"
              role="status"
            >
              <Check className="h-3.5 w-3.5" />
              Updated
            </span>
          )}
          <button
            onClick={() => void load()}
            disabled={loading}
            className={`flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 ${PRESS} ${FOCUS_RING}`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <Card className="anim-settle border-warning/40 bg-warning-muted px-4 py-2.5 text-sm text-warning">
          Live data unavailable ({error}) — showing sample values. Sign in as an admin
          and ensure the API is running.
        </Card>
      )}

      {/* KPI row — current-state scalars. Live values skeleton on first load;
          revenue and error-rate are still placeholder, so they're marked. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total users" value={fmt(overview?.total_users, "1,284")} delta="+42" icon={Users} loading={firstLoad} />
        <StatCard label="Active agents" value={fmt(overview?.active_agents, "1,101")} delta="+18" icon={Bot} loading={firstLoad} />
        <StatCard
          label="Messages today"
          value={fmt(overview?.messages_today, "8,412")}
          delta="+12%"
          icon={MessageSquare}
          loading={firstLoad}
        />
        <StatCard label="MRR" value="$14,880" delta="+3.2%" icon={CreditCard} highlight sample />
        <StatCard label="Error rate" value="0.8%" delta="-0.3%" deltaTone="success" icon={AlertTriangle} sample />
      </div>

      {/* trend row — time-series. Disjoint from the KPI scalars above (no metric
          printed twice); all series are placeholder until endpoints exist. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TrendCard label="Messages" value="118K" delta="+8.4%" deltaTone="success" range="12 days" data={t.messages} color="var(--color-chart-1)" />
        <TrendCard label="LLM cost" value="$38.20" delta="+5.1%" deltaTone="danger" range="12 days" data={t.cost} color="var(--color-chart-2)" />
        <TrendCard label="New signups" value="118 total" delta="+50%" deltaTone="success" range="12 days" data={t.signups} color="var(--color-chart-3)" />
      </div>

      {/* whatsapp + needs attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <WhatsAppPanel linkedNumbers={whatsapp?.linked_numbers ?? 1} />
        </div>
        <div className="lg:col-span-7">
          <NeedsAttention />
        </div>
      </div>

      {/* users */}
      <UsersTable users={users} loading={firstLoad} onSearch={(q) => void load(q)} />

      {/* system health + cost */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemHealthPanel health={health} />
        <CostBreakdown />
      </div>
    </div>
  );
}

function fmt(value: number | undefined, fallback: string): string {
  return value === undefined ? fallback : value.toLocaleString();
}
