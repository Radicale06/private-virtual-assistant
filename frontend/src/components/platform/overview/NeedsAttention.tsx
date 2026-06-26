import { CreditCard, Layers, MessageCircle, Plug, type LucideIcon } from "lucide-react";
import { Card } from "../../ui/Card";
import { cn } from "../../../lib/cn";
import { SAMPLE } from "./sampleData";

const ICONS: Record<string, LucideIcon> = {
  plug: Plug,
  card: CreditCard,
  layers: Layers,
  chat: MessageCircle,
};

export function NeedsAttention() {
  const items = SAMPLE.needsAttention;
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">Needs Attention</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-semibold text-primary-foreground">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const tone = item.tone;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-3"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  tone === "danger" ? "bg-danger-muted" : "bg-warning-muted",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    tone === "danger" ? "text-danger" : "text-warning",
                  )}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    tone === "danger" ? "text-danger" : "text-warning",
                  )}
                >
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.ago}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
