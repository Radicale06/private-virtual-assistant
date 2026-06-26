// Minimal className combiner (no clsx dependency needed for this surface).
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
