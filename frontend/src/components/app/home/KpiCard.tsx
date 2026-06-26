import type { LucideIcon } from "lucide-react";
import { Card } from "../../ui/Card";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <Card className="flex flex-col gap-3 border-primary bg-primary p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-foreground opacity-80">
            {label}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/20">
            <Icon className="h-[15px] w-[15px] text-primary-foreground" />
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-headings text-3xl font-semibold text-primary-foreground">
            {value}
          </span>
          {delta && (
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {delta}
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-muted">
          <Icon className="h-[15px] w-[15px] text-primary" />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-headings text-3xl font-semibold text-foreground">{value}</span>
        {delta && (
          <span className="rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success">
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
