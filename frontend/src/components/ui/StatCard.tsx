import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "success",
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "danger";
  icon: LucideIcon;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <Card className="border-primary bg-primary p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-foreground opacity-80">{label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/20">
            <Icon className="h-4 w-4 text-primary-foreground" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primary-foreground">{value}</span>
          {delta && (
            <span className="rounded px-1.5 py-0.5 text-xs font-medium text-primary-foreground bg-primary-foreground/20">
              {delta}
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-foreground">{value}</span>
        {delta && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-medium",
              deltaTone === "danger"
                ? "bg-danger-muted text-danger"
                : "bg-success-muted text-success",
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
