import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

// WhatsApp templates live in Meta Business Manager; the backend tracks the names
// it sends. TODO: surface approval status via a templates endpoint.
const TEMPLATES = [
  {
    name: "pva_reminder",
    body: "⏰ Reminder: {{1}}",
    category: "Utility",
    status: "Approved",
    tone: "success" as const,
  },
  {
    name: "pva_morning_brief",
    body: "Good morning! {{1}}",
    category: "Utility",
    status: "Approved",
    tone: "success" as const,
  },
  {
    name: "pva_welcome",
    body: "You're connected to {{1}}.",
    category: "Utility",
    status: "Pending",
    tone: "warning" as const,
  },
];

export function Templates() {
  return (
    <PlatformPage
      title="Templates"
      subtitle="Approved WhatsApp message templates for proactive sends."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.name} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-foreground">{t.name}</span>
              <Badge tone={t.tone} dot>
                {t.status}
              </Badge>
            </div>
            <div className="rounded-md bg-input p-3 text-sm text-secondary-foreground">
              {t.body}
            </div>
            <span className="text-xs text-muted-foreground">{t.category}</span>
          </Card>
        ))}
      </div>
    </PlatformPage>
  );
}
