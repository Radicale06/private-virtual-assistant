import { Bell, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";
import { api } from "../../lib/api";
import type { ReminderOut } from "../../lib/types";

const TABS = [
  { key: "pending", label: "Upcoming" },
  { key: "sent", label: "Completed" },
  { key: "all", label: "All" },
];

function statusTone(s: string): "primary" | "success" | "neutral" {
  if (s === "pending") return "primary";
  if (s === "sent") return "success";
  return "neutral";
}

export function Reminders() {
  const { me } = useApp();
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState<ReminderOut[]>([]);

  const load = useCallback(() => {
    api.reminders(tab).then(setItems).catch(() => setItems([]));
  }, [tab]);

  useEffect(load, [load]);

  async function cancel(id: string) {
    await api.cancelReminder(id);
    load();
  }

  return (
    <>
      <AppTopbar
        title="Reminders"
        subtitle="Everything your assistant is keeping track of for you."
        userName={me?.full_name ?? "You"}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div className="flex gap-1 rounded-md border border-border bg-surface p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium",
                tab === t.key
                  ? "bg-primary-muted text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Card className="p-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Bell className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No reminders here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-muted">
                    <Bell className="h-[15px] w-[15px] text-warning" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-sm font-medium text-foreground">
                      {r.title ?? "Reminder"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.run_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge tone={statusTone(r.status)} dot>
                    {r.status}
                  </Badge>
                  {r.status === "pending" && (
                    <button
                      onClick={() => cancel(r.id)}
                      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
