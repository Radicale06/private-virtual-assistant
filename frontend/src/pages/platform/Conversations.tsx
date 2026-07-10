import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { AdminConversation } from "../../lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Conversations() {
  const [rows, setRows] = useState<AdminConversation[]>([]);

  useEffect(() => {
    adminApi.conversations().then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <PlatformPage
      title="Conversations"
      subtitle="Platform-wide message stream — metadata only, no message content."
    >
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-3 font-medium">Tenant</th>
                <th className="px-2 py-3 font-medium">Direction</th>
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No messages yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 text-sm text-foreground">{r.tenant ?? "—"}</td>
                  <td className="px-2 py-3">
                    <span className="flex items-center gap-1.5 text-sm capitalize text-muted-foreground">
                      {r.direction === "inbound" ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                      )}
                      {r.direction}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm capitalize text-foreground">{r.type}</td>
                  <td className="px-2 py-3 text-right text-sm text-muted-foreground">
                    {timeAgo(r.created_at)}
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
