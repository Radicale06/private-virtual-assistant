import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { AdminUser } from "../../lib/types";

function statusTone(s: string): "success" | "danger" | "neutral" {
  if (s === "active") return "success";
  if (s === "suspended") return "danger";
  return "neutral";
}
function planTone(p: string): "primary" | "warning" | "neutral" {
  if (p === "pro") return "primary";
  if (p === "team") return "warning";
  return "neutral";
}

export function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback((query?: string) => {
    adminApi.users(query).then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => load(), [load]);

  async function toggle(u: AdminUser) {
    if (u.status === "suspended") await adminApi.activateUser(u.id);
    else await adminApi.suspendUser(u.id);
    load(q);
  }

  return (
    <PlatformPage title="Users" subtitle="Every customer on the platform.">
      <Card className="p-6">
        <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5 w-fit">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              load(e.target.value);
            }}
            placeholder="Search users…"
            className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search users"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-3 font-medium">User</th>
                <th className="px-2 py-3 font-medium">Plan</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Joined</th>
                <th className="px-2 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No users.
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
                  <td className="px-2 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggle(u)}
                        className="rounded-md border border-border px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary"
                      >
                        {u.status === "suspended" ? "Activate" : "Suspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PlatformPage>
  );
}
