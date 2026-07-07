import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Card } from "./Card";
import { SampleTag } from "./SampleTag";

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "success",
  icon: Icon,
  highlight = false,
  loading = false,
  sample = false,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "danger";
  icon: LucideIcon;
  highlight?: boolean;
  loading?: boolean;
  sample?: boolean;
}) {
  if (highlight) {
    return (
      <Card className="border-primary bg-primary p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm text-primary-foreground/85">
            {label}
            {sample && (
              <span className="rounded border border-dashed border-primary-foreground/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-primary-foreground/85">
                Sample
              </span>
            )}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/20">
            <Icon className="h-4 w-4 text-primary-foreground" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primary-foreground">{value}</span>
          {delta && (
            <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
              {delta}
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <span className="truncate">{label}</span>
          {sample && <SampleTag />}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {loading ? (
          <span className="my-0.5 h-7 w-20 animate-pulse rounded bg-muted" aria-hidden="true" />
        ) : (
          <span className="anim-settle text-3xl font-semibold text-foreground">{value}</span>
        )}
        {!loading && delta && (
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
