import { Brain, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { MemoryOut } from "../../lib/types";

export function Memory() {
  const { me } = useApp();
  const [items, setItems] = useState<MemoryOut[]>([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.memory().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!key.trim() || !value.trim()) return;
    setBusy(true);
    try {
      await api.addMemory(key.trim(), value.trim());
      setKey("");
      setValue("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await api.deleteMemory(id);
    load();
  }

  return (
    <>
      <AppTopbar
        title="Memory"
        subtitle="Facts and preferences your assistant remembers about you."
        userName={me?.full_name ?? "You"}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        {/* add */}
        <Card className="p-5">
          <h3 className="text-base font-semibold text-foreground">Add a preference</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key (e.g. no_morning_meetings)"
              className="rounded-md border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value (e.g. Never schedule before 10am)"
              className="rounded-md border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={add}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </Card>

        {/* list */}
        <Card className="p-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Brain className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nothing yet  your assistant learns your preferences over time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-muted">
                    <Brain className="h-[15px] w-[15px] text-primary" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-sm font-medium text-foreground">{m.value}</div>
                    <div className="text-xs text-muted-foreground">{m.key}</div>
                  </div>
                  <Badge tone={m.source === "user" ? "primary" : "neutral"}>{m.source}</Badge>
                  <button
                    onClick={() => remove(m.id)}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Forget
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
