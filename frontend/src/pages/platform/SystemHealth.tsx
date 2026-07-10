import { Activity, Database, Layers, Plug } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { SystemHealth as Health } from "../../lib/types";

export function SystemHealth() {
  const [h, setH] = useState<Health | null>(null);

  useEffect(() => {
    adminApi.systemHealth().then(setH).catch(() => setH(null));
  }, []);

  const subsystems = [
    { name: "Job queue", value: `${h?.pending_jobs ?? 0} pending`, ok: (h?.pending_jobs ?? 0) < 100 },
    { name: "Failed jobs", value: String(h?.failed_jobs ?? 0), ok: (h?.failed_jobs ?? 0) === 0 },
    {
      name: "Integration errors",
      value: String(h?.integrations_errored ?? 0),
      ok: (h?.integrations_errored ?? 0) === 0,
    },
    { name: "Redis broker", value: h?.redis_ok ? "connected" : "unreachable", ok: !!h?.redis_ok },
  ];

  return (
    <PlatformPage title="System Health" subtitle="Queues, jobs, and broker status.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pending jobs" value={String(h?.pending_jobs ?? 0)} icon={Layers} />
        <StatCard
          label="Failed jobs"
          value={String(h?.failed_jobs ?? 0)}
          icon={Activity}
          delta={h?.failed_jobs ? "attention" : undefined}
          deltaTone="danger"
        />
        <StatCard label="Integration errors" value={String(h?.integrations_errored ?? 0)} icon={Plug} />
        <StatCard label="Redis" value={h?.redis_ok ? "OK" : "Down"} icon={Database} />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Subsystems</h3>
        <div className="mt-4 flex flex-col gap-3">
          {subsystems.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between border-b border-border py-2 last:border-0"
            >
              <span className="text-sm text-foreground">{row.name}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {row.value}
                <span className={`h-1.5 w-1.5 rounded-full ${row.ok ? "bg-success" : "bg-danger"}`} />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PlatformPage>
  );
}
