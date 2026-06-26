import { cn } from "../../lib/cn";

// Initials avatar  no external image dependency (Banani used CDN avatars).
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
