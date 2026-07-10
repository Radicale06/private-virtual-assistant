import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import { INTEGRATIONS } from "../../lib/integrations";
import type { IntegrationsHealth as Health } from "../../lib/types";

export function IntegrationsHealth() {
  const [health, setHealth] = useState<Health>({});

  useEffect(() => {
    adminApi.integrationsHealth().then(setHealth).catch(() => setHealth({}));
  }, []);

  return (
    <PlatformPage
      title="Integrations Health"
      subtitle="Connection status across every tenant, by provider."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((cat) => {
          const stats = health[cat.provider] ?? {};
          return (
            <Card key={cat.provider} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                  <img src={cat.logo} alt="" className="h-[18px] w-[18px]" loading="lazy" />
                </span>
                <span className="text-base font-semibold text-foreground">{cat.label}</span>
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
