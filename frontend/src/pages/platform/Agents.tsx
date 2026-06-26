import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { AdminAgent } from "../../lib/types";

function statusTone(s: string): "success" | "warning" | "danger" | "neutral" {
  if (s === "active") return "success";
  if (s === "draft") return "neutral";
  if (s === "error") return "danger";
  return "warning";
}

export function Agents() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);

  useEffect(() => {
    adminApi.agents().then(setAgents).catch(() => setAgents([]));
  }, []);

  return (
    <PlatformPage title="Agents" subtitle="Every assistant instance across tenants.">
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-3 font-medium">Assistant</th>
                <th className="px-2 py-3 font-medium">Owner</th>
                <th className="px-2 py-3 font-medium">Integrations</th>
                <th className="px-2 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No agents.
                  </td>
                </tr>
              )}
              {agents.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 text-sm font-medium text-foreground">{a.name}</td>
                  <td className="px-2 py-3 text-sm text-muted-foreground">
                    {a.owner_email ?? ""}
                  </td>
                  <td className="px-2 py-3 text-sm text-foreground">
                    {a.integrations_connected} connected
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={statusTone(a.status)} dot>
                      {a.status}
                    </Badge>
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
