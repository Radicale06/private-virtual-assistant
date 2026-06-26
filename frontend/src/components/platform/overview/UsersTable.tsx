import { Search } from "lucide-react";
import type { AdminUser } from "../../../lib/types";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";

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

export function UsersTable({
  users,
  onSearch,
}: {
  users: AdminUser[];
  onSearch?: (q: string) => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">All Users</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search users…"
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Search users"
            />
          </div>
          <select className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-secondary-foreground">
            <option>All plans</option>
            <option>Free</option>
            <option>Pro</option>
            <option>Team</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-3 font-medium">User</th>
              <th className="px-2 py-3 font-medium">Plan</th>
              <th className="px-2 py-3 font-medium">Status</th>
              <th className="px-2 py-3 font-medium">Messages</th>
              <th className="px-2 py-3 font-medium">Created</th>
              <th className="px-2 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name ?? u.email} />
                    <div className="leading-tight">
                      <div className="text-sm font-medium text-foreground">
                        {u.full_name ?? ""}
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
                <td className="px-2 py-3 text-sm text-foreground"></td>
                <td className="px-2 py-3 text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-2 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-border px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary">
                      View
                    </button>
                    <button className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary">
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
