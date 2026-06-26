import { Bell } from "lucide-react";
import { Avatar } from "../ui/Avatar";

export function AppTopbar({
  title,
  subtitle,
  userName,
}: {
  title: string;
  subtitle?: string;
  userName: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-8 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-headings text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[15px] w-[15px]" />
        </button>
        <Avatar name={userName} />
      </div>
    </header>
  );
}
