import {
  Bell,
  CalendarPlus,
  Mail,
  type LucideIcon,
  MessageSquare,
  Mic,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";
import { api } from "../../lib/api";
import type { ActivityOut } from "../../lib/types";

const ICONS: Record<string, { icon: LucideIcon; tone: string; bg: string }> = {
  create_event: { icon: CalendarPlus, tone: "text-primary", bg: "bg-primary-muted" },
  set_reminder: { icon: Bell, tone: "text-warning", bg: "bg-warning-muted" },
  send_email: { icon: Mail, tone: "text-primary", bg: "bg-primary-muted" },
  summarize_emails: { icon: Mail, tone: "text-primary", bg: "bg-primary-muted" },
  voice: { icon: Mic, tone: "text-success", bg: "bg-success-muted" },
  message: { icon: MessageSquare, tone: "text-secondary-foreground", bg: "bg-input" },
  default: { icon: Zap, tone: "text-primary", bg: "bg-primary-muted" },
};

function visual(a: ActivityOut) {
  const tool = (a.payload?.tool as string) ?? (a.type === "voice" ? "voice" : a.role === "user" ? "message" : "default");
  return ICONS[tool] ?? ICONS.default;
}

export function Activity() {
  const { me } = useApp();
  const [items, setItems] = useState<ActivityOut[]>([]);

  useEffect(() => {
    api.activity(100).then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <>
      <AppTopbar
        title="Activity"
        subtitle="A full history of what your assistant has done."
        userName={me?.full_name ?? "You"}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <Card className="p-2">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="flex flex-col">
              {items.map((a) => {
                const v = visual(a);
                const Icon = v.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0"
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", v.bg)}>
                      <Icon className={cn("h-[15px] w-[15px]", v.tone)} />
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-sm font-medium text-foreground">
                        {a.content ?? a.type}
                      </div>
                      <div className="text-xs capitalize text-muted-foreground">
                        {a.direction} · {a.type}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
