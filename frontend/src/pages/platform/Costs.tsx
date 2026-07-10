import { Coins, Cpu, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
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
      subtitle="LLM and transcription spend across all tenants (last 30 days)."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="LLM cost today"
          value={`$${(costs?.cost_usd_today ?? 0).toFixed(2)}`}
          icon={Coins}
        />
        <StatCard
          label="LLM cost (30d)"
          value={`$${(costs?.cost_usd ?? 0).toFixed(2)}`}
          icon={Coins}
        />
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
    </PlatformPage>
  );
}
