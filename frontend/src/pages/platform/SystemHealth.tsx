import { Activity, CheckCircle, Cpu, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { SAMPLE } from "../../components/platform/overview/sampleData";
import { Card } from "../../components/ui/Card";
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { SystemHealth as Health } from "../../lib/types";

export function SystemHealth() {
  const [h, setH] = useState<Health | null>(null);

  useEffect(() => {
    adminApi.systemHealth().then(setH).catch(() => setH(null));
  }, []);

  return (
    <PlatformPage title="System Health" subtitle="Queues, workers, and error rates.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pending jobs" value={String(h?.pending_jobs ?? 0)} icon={Layers} />
        <StatCard
          label="Failed jobs"
          value={String(h?.failed_jobs ?? 0)}
          icon={Activity}
          delta={h?.failed_jobs ? "attention" : undefined}
          deltaTone="danger"
        />
        <StatCard label="Workers" value="8 / 8" icon={Cpu} />
        <StatCard label="API uptime" value="99.97%" icon={CheckCircle} />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Error events  last 12h</h3>
        <div className="mt-3">
          <Sparkline data={SAMPLE.trends.errorEvents} color="var(--color-danger)" height={72} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Subsystems</h3>
        <div className="mt-4 flex flex-col gap-3">
          {[
            { name: "Webhook ingestion", value: "142 ms avg", ok: true },
            { name: "Celery worker pool", value: "8 active", ok: true },
            { name: "Redis broker", value: "connected", ok: true },
            { name: "Integration errors", value: `${h?.integrations_errored ?? 0}`, ok: (h?.integrations_errored ?? 0) === 0 },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between border-b border-border py-2 last:border-0"
            >
              <span className="text-sm text-foreground">{row.name}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {row.value}
                <span
                  className={`h-1.5 w-1.5 rounded-full ${row.ok ? "bg-success" : "bg-danger"}`}
                />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PlatformPage>
  );
}
