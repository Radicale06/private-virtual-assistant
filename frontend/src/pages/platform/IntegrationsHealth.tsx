import { Calendar, Link2, Mail, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { IntegrationsHealth as Health } from "../../lib/types";

const META: Record<string, { label: string; icon: typeof Calendar }> = {
  google_calendar: { label: "Google Calendar", icon: Calendar },
  gmail: { label: "Gmail", icon: Mail },
  calendly: { label: "Calendly", icon: Link2 },
  google_meet: { label: "Google Meet", icon: Video },
  zoom: { label: "Zoom", icon: Video },
};

export function IntegrationsHealth() {
  const [health, setHealth] = useState<Health>({});

  useEffect(() => {
    adminApi.integrationsHealth().then(setHealth).catch(() => setHealth({}));
  }, []);

  const providers = Object.keys(META);

  return (
    <PlatformPage
      title="Integrations Health"
      subtitle="Connection status across every tenant, by provider."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((p) => {
          const meta = META[p];
          const Icon = meta.icon;
          const stats = health[p] ?? {};
          return (
            <Card key={p} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-input">
                  <Icon className="h-[17px] w-[17px] text-secondary-foreground" />
                </span>
                <span className="text-base font-semibold text-foreground">{meta.label}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-success-muted py-2">
                  <div className="text-lg font-semibold text-success">{stats.connected ?? 0}</div>
                  <div className="text-xs text-success">connected</div>
                </div>
                <div className="rounded-md bg-warning-muted py-2">
                  <div className="text-lg font-semibold text-warning">{stats.error ?? 0}</div>
                  <div className="text-xs text-warning">errored</div>
                </div>
                <div className="rounded-md bg-input py-2">
                  <div className="text-lg font-semibold text-muted-foreground">
                    {stats.disconnected ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">off</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PlatformPage>
  );
}
