import {
  AlertTriangle,
  Bot,
  ChevronDown,
  CreditCard,
  Link2,
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
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type {
  AdminOverview,
  AdminUser,
  SystemHealth,
  WhatsAppStatus,
} from "../../lib/types";

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
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{range}</span>
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
  const [error, setError] = useState<string | null>(null);

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
    } catch (e) {
      // Backend not reachable / not authed  fall through to sample-only view.
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-secondary-foreground">
            Last 12 days
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <Card className="border-warning/30 bg-warning-muted px-4 py-2.5 text-sm text-warning">
          Live data unavailable ({error})  showing sample values. Sign in as an admin
          and ensure the API is running.
        </Card>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={fmt(overview?.total_users, "1,284")} delta="+42" icon={Users} />
        <StatCard label="Active agents" value={fmt(overview?.active_agents, "1,101")} delta="+18" icon={Bot} />
        <StatCard
          label="Messages today"
          value={fmt(overview?.messages_today, "8,412")}
          delta="+12%"
          icon={MessageSquare}
        />
        <StatCard label="LLM cost today" value="$38.20" delta="+5%" deltaTone="danger" icon={Link2} />
        <StatCard label="MRR" value="$14,880" delta="+3.2%" icon={CreditCard} highlight />
        <StatCard label="Error rate" value="0.8%" delta="-0.3%" icon={AlertTriangle} />
      </div>

      {/* trend row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TrendCard label="Messages over time" value="118K" delta="+8.4%" deltaTone="success" range="Last 12 days" data={t.messages} color="var(--color-primary)" />
        <TrendCard label="LLM cost over time" value="$38.20" delta="+5.1%" deltaTone="danger" range="Today" data={t.cost} color="var(--color-warning)" />
        <TrendCard label="New signups" value="15 today" delta="+50%" deltaTone="success" range="Last 12 days" data={t.signups} color="var(--color-success)" />
        <TrendCard label="Error rate" value="0.8%" delta="-0.3%" deltaTone="success" range="Last 12 days" data={t.errors} color="var(--color-danger)" />
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
      <UsersTable users={users} onSearch={(q) => void load(q)} />

      {/* system health + cost */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemHealthPanel health={health} />
        <CostBreakdown />
      </div>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">Refreshing…</p>
      )}
    </div>
  );
}

function fmt(value: number | undefined, fallback: string): string {
  return value === undefined ? fallback : value.toLocaleString();
}
