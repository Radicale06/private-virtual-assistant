import { Activity, CheckCircle, Cpu, Layers } from "lucide-react";
import type { SystemHealth } from "../../../lib/types";
import { Card } from "../../ui/Card";
import { SampleTag } from "../../ui/SampleTag";
import { Sparkline } from "../../ui/Sparkline";
import { SAMPLE } from "./sampleData";

function HealthStat({
  icon: Icon,
  tone,
  label,
  value,
  sample = false,
}: {
  icon: typeof Activity;
  tone: "warning" | "success" | "primary";
  label: string;
  value: string;
  sample?: boolean;
}) {
  const toneBg =
    tone === "warning" ? "bg-warning-muted" : tone === "success" ? "bg-success-muted" : "bg-primary-muted";
  const toneFg =
    tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="flex items-center gap-3 rounded-md bg-background p-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneBg}`}>
        <Icon className={`h-4 w-4 ${toneFg}`} />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{label}</span>
          {sample && <SampleTag />}
        </div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function SystemHealthPanel({ health }: { health: SystemHealth | null }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">System Health</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <HealthStat
          icon={Layers}
          tone="warning"
          label="Queue depth"
          value={`${health?.pending_jobs ?? 0} jobs`}
        />
        <HealthStat icon={Cpu} tone="success" label="Worker status" value="8 / 8 active" sample />
        <HealthStat icon={Activity} tone="primary" label="Webhook latency" value="142 ms avg" sample />
        <HealthStat icon={CheckCircle} tone="success" label="API uptime" value="99.97%" sample />
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Error events — last 12h</span>
          <SampleTag />
        </div>
        <Sparkline data={SAMPLE.trends.errorEvents} color="var(--color-danger)" />
      </div>
    </Card>
  );
}
