import { cn } from "../../lib/cn";

// Marks a value or panel as placeholder data (backend metric not wired yet).
// Dashed outline + "Sample" reads as "not live" without competing for attention —
// the operator must be able to tell real numbers from filled-in ones.
export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      title="Placeholder data — this metric isn't wired to the backend yet"
      className={cn(
        "inline-flex shrink-0 items-center rounded border border-dashed border-muted-foreground/50 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      Sample
    </span>
  );
}
