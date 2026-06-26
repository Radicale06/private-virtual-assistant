import { ArrowDownLeft, ArrowUpRight, MessageCircle, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { SAMPLE } from "../../components/platform/overview/sampleData";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Sparkline } from "../../components/ui/Sparkline";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../lib/api";
import type { WhatsAppStatus } from "../../lib/types";

export function WhatsApp() {
  const [wa, setWa] = useState<WhatsAppStatus | null>(null);

  useEffect(() => {
    adminApi.whatsapp().then(setWa).catch(() => setWa(null));
  }, []);

  const s = SAMPLE.whatsapp;

  return (
    <PlatformPage
      title="WhatsApp"
      subtitle="Shared number throughput, delivery, and template health."
      actions={
        <Badge tone="success" dot>
          Healthy
        </Badge>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Linked numbers" value={String(wa?.linked_numbers ?? 1)} icon={Smartphone} />
        <StatCard label="Inbound (24h)" value={String(wa?.inbound_24h ?? 0)} icon={ArrowDownLeft} />
        <StatCard label="Outbound (24h)" value={String(wa?.outbound_24h ?? 0)} icon={ArrowUpRight} />
        <StatCard label="Delivery success" value={`${s.deliverySuccess}%`} icon={MessageCircle} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Send rate vs limit</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">{s.sendRatePerMin}</span>
            <span className="text-sm text-muted-foreground">/ {s.sendLimitPerMin} per min</span>
          </div>
          <ProgressBar
            value={(s.sendRatePerMin / s.sendLimitPerMin) * 100}
            className="mt-3 h-2"
          />
          <div className="mt-4 text-xs text-muted-foreground">Delivery rate  12h</div>
          <Sparkline data={SAMPLE.trends.whatsappDelivery} color="var(--color-success)" />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Message templates</h3>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { name: "pva_reminder", status: "Approved", tone: "success" as const },
              { name: "pva_morning_brief", status: "Approved", tone: "success" as const },
              { name: "pva_welcome", status: "Pending", tone: "warning" as const },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between">
                <span className="font-mono text-sm text-foreground">{t.name}</span>
                <Badge tone={t.tone} dot>
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PlatformPage>
  );
}
