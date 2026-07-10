import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { adminApi } from "../../lib/api";
import type { AdminTemplate } from "../../lib/types";

export function Templates() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);

  useEffect(() => {
    adminApi.templates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  return (
    <PlatformPage
      title="Templates"
      subtitle="Twilio Content templates for proactive sends (outside the 24h session window)."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.name} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-foreground">{t.name}</span>
              <Badge tone={t.configured ? "success" : "neutral"} dot>
                {t.configured ? "Configured" : "Not set"}
              </Badge>
            </div>
            <div className="break-all rounded-md bg-input p-3 font-mono text-xs text-secondary-foreground">
              {t.sid ?? "No Content SID configured"}
            </div>
            <span className="text-xs text-muted-foreground">{t.purpose}</span>
          </Card>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground">No templates.</p>
        )}
      </div>
    </PlatformPage>
  );
}
