import { CreditCard, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { AdminRevenue } from "../../lib/types";

const PLAN_COLORS: Record<string, string> = {
  pro: "var(--color-chart-1)",
  team: "var(--color-chart-2)",
  free: "var(--color-muted-foreground)",
};

export function Revenue() {
  const [rev, setRev] = useState<AdminRevenue | null>(null);

  useEffect(() => {
    adminApi.revenue().then(setRev).catch(() => setRev(null));
  }, []);

  return (
    <PlatformPage title="Revenue" subtitle="MRR and plan mix, computed from live plan data.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="MRR" value={`$${(rev?.mrr_usd ?? 0).toLocaleString()}`} icon={CreditCard} />
        <StatCard label="Paying users" value={String(rev?.paying_users ?? 0)} icon={Users} />
        <StatCard label="Total users" value={String(rev?.total_users ?? 0)} icon={Users} />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Plan mix</h3>
        <div className="mt-4 flex flex-col gap-3">
          {(rev?.plan_mix ?? []).map((p) => (
            <div key={p.plan}>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground">
                  {p.plan}
                  {p.price ? ` · $${p.price}/mo` : ""}
                </span>
                <span className="text-muted-foreground">
                  {p.count} · {p.pct}%
                </span>
              </div>
              <ProgressBar
                value={p.pct}
                color={PLAN_COLORS[p.plan] ?? "var(--color-primary)"}
                className="mt-1.5"
              />
            </div>
          ))}
          {(!rev || rev.plan_mix.length === 0) && (
            <p className="text-sm text-muted-foreground">No data.</p>
          )}
        </div>
      </Card>
    </PlatformPage>
  );
}
