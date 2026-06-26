import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "success" | "warning" | "danger" | "primary" | "neutral";

const toneStyles: Record<Tone, string> = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  primary: "bg-primary-muted text-primary",
  neutral: "bg-secondary text-secondary-foreground",
};

const dotStyles: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  primary: "bg-primary",
  neutral: "bg-muted-foreground",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotStyles[tone])} />
      )}
      {children}
    </span>
  );
}
