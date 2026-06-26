import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { AuditEntry } from "../../lib/types";

function actionTone(a: string): "danger" | "success" | "primary" | "neutral" {
  if (a.includes("suspend") || a.includes("delete")) return "danger";
  if (a.includes("activate")) return "success";
  if (a.includes("impersonate")) return "primary";
  return "neutral";
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    adminApi.audit().then(setEntries).catch(() => setEntries([]));
  }, []);

  return (
    <PlatformPage title="Audit Log" subtitle="Every admin action, recorded.">
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-3 font-medium">Action</th>
                <th className="px-2 py-3 font-medium">Target</th>
                <th className="px-2 py-3 font-medium">Actor</th>
                <th className="px-2 py-3 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No audit entries.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <Badge tone={actionTone(e.action)}>{e.action}</Badge>
                  </td>
                  <td className="px-2 py-3 text-sm text-muted-foreground">
                    {e.target_type ? `${e.target_type}:${e.target_id?.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-2 py-3 text-sm text-muted-foreground">
                    {e.actor_id?.slice(0, 8) ?? "system"}
                  </td>
                  <td className="px-2 py-3 text-right text-sm text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
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
