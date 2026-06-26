import { Plug } from "lucide-react";
import { api } from "../../../lib/api";
import { INTEGRATIONS } from "../../../lib/integrations";
import type { IntegrationOut } from "../../../lib/types";
import { Badge } from "../../ui/Badge";
import { cn } from "../../../lib/cn";

const CATALOG = INTEGRATIONS;

function status(s: string | undefined): {
  label: string;
  tone: "success" | "warning" | "neutral";
} {
  if (s === "connected") return { label: "Connected", tone: "success" };
  if (s === "error") return { label: "Needs attention", tone: "warning" };
  return { label: "Not connected", tone: "neutral" };
}

export function ConnectedAccounts({
  integrations,
  onChange,
}: {
  integrations: IntegrationOut[];
  onChange: () => void;
}) {
  const byProvider = new Map(integrations.map((i) => [i.provider, i]));
  const needsAttention = integrations.filter((i) => i.status === "error").length;

  async function connect(service: string) {
    try {
      const { authorization_url } = await api.connectIntegration(service);
      window.location.href = authorization_url; // hand off to OAuth consent
    } catch {
      /* surfaced by the row status on next load */
    }
  }

  async function disconnect(provider: string) {
    try {
      await api.disconnectIntegration(provider);
      onChange();
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Plug className="h-[17px] w-[17px] text-foreground" />
          <h2 className="font-headings text-lg font-semibold text-foreground">
            Connected Accounts
          </h2>
        </div>
        {needsAttention > 0 && (
          <Badge tone="warning" dot>
            {needsAttention} needs attention
          </Badge>
        )}
      </div>

      <div className="flex flex-col">
        {CATALOG.map((entry) => {
          const row = byProvider.get(entry.provider);
          const st = status(row?.status);
          const isConnected = row?.status === "connected";
          return (
            <div
              key={entry.provider}
              className="flex items-center gap-4 border-b border-border py-4 last:border-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white">
                <img src={entry.logo} alt="" className="h-5 w-5" loading="lazy" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-sm font-semibold text-foreground">{entry.label}</div>
                <div className="text-sm text-muted-foreground">{entry.description}</div>
                {row?.account_email && (
                  <div className="text-xs text-muted-foreground">{row.account_email}</div>
                )}
              </div>
              <Badge tone={st.tone} dot>
                {st.label}
              </Badge>
              <button
                onClick={() =>
                  isConnected ? disconnect(entry.provider) : connect(entry.service)
                }
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium",
                  isConnected
                    ? "border-border text-danger hover:bg-danger-muted"
                    : "border-primary text-primary hover:bg-primary-muted",
                )}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
