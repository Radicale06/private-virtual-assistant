import { Bot, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../../../lib/api";
import { Card } from "../../ui/Card";

export function CreateAssistant({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("Aria");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      await api.updateAgent({ name: name.trim() || "Aria" });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-muted">
        <Bot className="h-7 w-7 text-primary" />
      </span>
      <div>
        <h2 className="font-headings text-xl font-semibold text-foreground">
          Create your assistant
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your WhatsApp assistant a name. You can customize its tone, schedule, and
          integrations next.
        </p>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Assistant name"
        className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        aria-label="Assistant name"
      />
      <button
        onClick={create}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {busy ? "Creating…" : "Create assistant"}
      </button>
    </Card>
  );
}
