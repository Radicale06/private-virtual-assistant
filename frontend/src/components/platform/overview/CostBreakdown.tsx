import { Card } from "../../ui/Card";
import { ProgressBar } from "../../ui/ProgressBar";
import { SAMPLE } from "./sampleData";

export function CostBreakdown() {
  const c = SAMPLE.costBreakdown;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Cost Breakdown  Today</h3>
        <span className="text-lg font-semibold text-foreground">${c.total.toFixed(2)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {c.rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{row.label}</span>
              <span className="text-muted-foreground">
                ${row.value.toFixed(2)} <span className="text-xs">({row.pct}%)</span>
              </span>
            </div>
            <ProgressBar value={row.pct} color={row.color} className="mt-1.5" />
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Revenue today</span>
          <span className="font-semibold text-success">${c.revenueToday.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Margin</span>
          <span className="font-semibold text-foreground">{c.margin}%</span>
        </div>
      </div>
    </Card>
  );
}
