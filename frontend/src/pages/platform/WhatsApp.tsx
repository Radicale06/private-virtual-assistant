import { ArrowDownLeft, ArrowUpRight, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { AdminTemplate, WhatsAppStatus } from "../../lib/types";

export function WhatsApp() {
  const [wa, setWa] = useState<WhatsAppStatus | null>(null);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);

  useEffect(() => {
    adminApi.whatsapp().then(setWa).catch(() => setWa(null));
    adminApi.templates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  return (
    <PlatformPage title="WhatsApp" subtitle="Shared number throughput and content templates.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Linked numbers" value={String(wa?.linked_numbers ?? 0)} icon={Smartphone} />
        <StatCard label="Inbound (24h)" value={String(wa?.inbound_24h ?? 0)} icon={ArrowDownLeft} />
        <StatCard label="Outbound (24h)" value={String(wa?.outbound_24h ?? 0)} icon={ArrowUpRight} />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Content templates</h3>
        <div className="mt-4 flex flex-col gap-3">
          {templates.map((t) => (
            <div key={t.name} className="flex items-center justify-between">
              <span className="font-mono text-sm text-foreground">{t.name}</span>
              <Badge tone={t.configured ? "success" : "neutral"} dot>
                {t.configured ? "Configured" : "Not set"}
              </Badge>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground">No templates configured.</p>
          )}
        </div>
      </Card>
    </PlatformPage>
  );
}
