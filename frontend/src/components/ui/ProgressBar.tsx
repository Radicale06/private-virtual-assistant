import { cn } from "../../lib/cn";

export function ProgressBar({
  value,
  color = "var(--color-primary)",
  className,
}: {
  value: number; // 0..100
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}
