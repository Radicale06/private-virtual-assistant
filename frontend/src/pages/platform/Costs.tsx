import { Coins, Cpu, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { CostBreakdown } from "../../components/platform/overview/CostBreakdown";
import { SAMPLE } from "../../components/platform/overview/sampleData";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { CostSummary } from "../../lib/types";

export function Costs() {
  const [costs, setCosts] = useState<CostSummary | null>(null);

  useEffect(() => {
    adminApi.costs().then(setCosts).catch(() => setCosts(null));
  }, []);

  return (
    <PlatformPage
      title="Costs & Usage"
      subtitle="LLM and transcription spend across all tenants."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="LLM cost today" value="$38.20" icon={Coins} delta="+5%" deltaTone="danger" />
        <StatCard
          label="Tokens (30d)"
          value={(costs?.total_tokens ?? 0).toLocaleString()}
          icon={Cpu}
        />
        <StatCard
          label="Messages (30d)"
          value={(costs?.messages ?? 0).toLocaleString()}
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">LLM cost over time</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">$38.20</span>
            <span className="text-xs font-medium text-danger">+5.1%</span>
          </div>
          <div className="mt-3">
            <Sparkline data={SAMPLE.trends.cost} color="var(--color-warning)" height={72} />
          </div>
        </Card>
        <CostBreakdown />
      </div>
    </PlatformPage>
  );
}
