import { CreditCard, TrendingDown, TrendingUp, Users } from "lucide-react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";

// Revenue isn't exposed by the backend yet  sample. TODO: GET /api/admin/revenue.
const SAMPLE = {
  mrr: "$14,880",
  trend: [11, 11.4, 12, 12.3, 12.9, 13.2, 13.8, 14.1, 14.4, 14.6, 14.7, 14.88],
  planMix: [
    { plan: "Pro", pct: 62, color: "var(--color-primary)" },
    { plan: "Team", pct: 28, color: "var(--color-warning)" },
    { plan: "Free", pct: 10, color: "var(--color-muted-foreground)" },
  ],
};

export function Revenue() {
  return (
    <PlatformPage title="Revenue" subtitle="MRR, churn, and plan mix.">
      <Card className="border-warning/30 bg-warning-muted px-4 py-2.5 text-sm text-warning">
        Sample data  add a revenue endpoint (Stripe metrics) to populate this.
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="MRR" value={SAMPLE.mrr} icon={CreditCard} delta="+3.2%" highlight />
        <StatCard label="New MRR" value="$1,240" icon={TrendingUp} delta="+12%" />
        <StatCard label="Churn" value="1.8%" icon={TrendingDown} delta="-0.4%" />
        <StatCard label="Paying users" value="842" icon={Users} delta="+18" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">MRR over time</h3>
          <div className="mt-3">
            <Sparkline data={SAMPLE.trend} color="var(--color-success)" height={80} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Plan mix</h3>
          <div className="mt-4 flex flex-col gap-3">
            {SAMPLE.planMix.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{p.plan}</span>
                  <span className="text-muted-foreground">{p.pct}%</span>
                </div>
                <ProgressBar value={p.pct} color={p.color} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PlatformPage>
  );
}
