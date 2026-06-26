import { MessageCircle } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Sparkline } from "../../ui/Sparkline";
import { SAMPLE } from "./sampleData";

function Stat({
  label,
  value,
  unit,
  sub,
  subTone,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  subTone?: "muted" | "warning";
}) {
  return (
    <div className="rounded-md bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {sub && (
        <div
          className={
            subTone === "warning"
              ? "mt-1 text-xs text-warning"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function WhatsAppPanel({ linkedNumbers }: { linkedNumbers: number }) {
  const w = SAMPLE.whatsapp;
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-[18px] w-[18px] text-success" />
          <h3 className="text-base font-semibold text-foreground">WhatsApp Number</h3>
        </div>
        <Badge tone="success" dot>
          Healthy
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Send rate" value={String(w.sendRatePerMin)} unit="/min" sub={`Limit: ${w.sendLimitPerMin}/min`} />
        <Stat
          label="Delivery success"
          value={String(w.deliverySuccess)}
          unit="%"
          sub="↓ Below 95% threshold"
          subTone="warning"
        />
        <Stat
          label="24h window used"
          value={w.windowUsed.toLocaleString()}
          unit={`/ ${(w.windowLimit / 1000).toFixed(0)}K`}
        />
        <Stat label="Linked numbers" value={String(linkedNumbers)} sub={w.sharedNumber} />
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted-foreground">Delivery rate  12h</div>
        <Sparkline data={SAMPLE.trends.whatsappDelivery} color="var(--color-success)" />
      </div>
    </Card>
  );
}
