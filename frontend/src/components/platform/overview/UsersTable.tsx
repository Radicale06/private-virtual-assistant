import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminUser } from "../../../lib/types";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface";
const PRESS = "transition active:scale-[0.97] motion-reduce:active:scale-100";

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "active") return "success";
  if (status === "suspended") return "danger";
  return "neutral";
}

function planTone(plan: string): "primary" | "warning" | "neutral" {
  if (plan === "pro") return "primary";
  if (plan === "team") return "warning";
  return "neutral";
}

const PLAN_FILTERS = ["all", "free", "pro", "team"] as const;
type PlanFilter = (typeof PLAN_FILTERS)[number];

export function UsersTable({
  users,
  loading = false,
  onSearch,
}: {
  users: AdminUser[];
  loading?: boolean;
  onSearch?: (q: string) => void;
}) {
  const [plan, setPlan] = useState<PlanFilter>("all");

  const visible = useMemo(
    () => (plan === "all" ? users : users.filter((u) => u.plan === plan)),
    [users, plan],
  );

  function impersonate(u: AdminUser) {
    const ok = window.confirm(
      `Impersonate ${u.email}? You'll act as this user until you switch back.`,
    );
    if (!ok) return;
    // TODO: wire to the impersonation endpoint once it exists.
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">All Users</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/40">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search users…"
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Search users"
            />
          </div>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as PlanFilter)}
            aria-label="Filter by plan"
            className={`rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-secondary-foreground ${FOCUS_RING}`}
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-3 font-medium">User</th>
              <th className="px-2 py-3 font-medium">Plan</th>
              <th className="px-2 py-3 font-medium">Status</th>
              <th className="px-2 py-3 font-medium">Created</th>
              <th className="px-2 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
                      <div className="flex flex-col gap-1.5">
                        <span className="h-3 w-28 animate-pulse rounded bg-muted" />
                        <span className="h-2.5 w-40 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3"><span className="block h-4 w-12 animate-pulse rounded-full bg-muted" /></td>
                  <td className="px-2 py-3"><span className="block h-4 w-16 animate-pulse rounded-full bg-muted" /></td>
                  <td className="px-2 py-3"><span className="block h-3 w-20 animate-pulse rounded bg-muted" /></td>
                  <td className="px-2 py-3"><span className="ml-auto block h-6 w-24 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))}

            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-10 text-center text-sm text-muted-foreground">
                  {users.length === 0
                    ? "No users yet — they'll appear here as people sign up."
                    : "No users match this plan filter."}
                </td>
              </tr>
            )}

            {!loading &&
              visible.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.full_name ?? u.email} />
                      <div className="leading-tight">
                        <div className="text-sm font-medium text-foreground">
                          {u.full_name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={planTone(u.plan)}>{u.plan}</Badge>
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={statusTone(u.status)} dot>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className={`rounded-md border border-border px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary ${PRESS} ${FOCUS_RING}`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => impersonate(u)}
                        className={`rounded-md border border-border px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary ${PRESS} ${FOCUS_RING}`}
                      >
                        Impersonate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
