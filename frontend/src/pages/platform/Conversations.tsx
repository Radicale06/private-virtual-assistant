import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PlatformPage } from "../../components/platform/PlatformPage";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

// Privacy-first: the backend exposes no cross-tenant message bodies. This is a
// metadata-only stream. TODO: add GET /api/admin/conversations (metadata feed).
const SAMPLE = [
  { tenant: "alex@startup.io", dir: "inbound", type: "voice", status: "delivered", latency: "1.2s", ago: "2m ago" },
  { tenant: "sara@designco.com", dir: "outbound", type: "text", status: "delivered", latency: "0.8s", ago: "5m ago" },
  { tenant: "marcus@ventures.com", dir: "inbound", type: "text", status: "delivered", latency: "1.0s", ago: "8m ago" },
  { tenant: "priya@freelance.in", dir: "outbound", type: "template", status: "failed", latency: "", ago: "12m ago" },
  { tenant: "fatima@corp.ae", dir: "inbound", type: "text", status: "delivered", latency: "0.9s", ago: "20m ago" },
];

export function Conversations() {
  return (
    <PlatformPage
      title="Conversations"
      subtitle="Platform-wide message stream (metadata only  no message content)."
    >
      <Card className="border-warning/30 bg-warning-muted px-4 py-2.5 text-sm text-warning">
        Sample data  add a metadata conversations endpoint to populate this.
      </Card>
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-3 font-medium">Tenant</th>
                <th className="px-2 py-3 font-medium">Direction</th>
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Latency</th>
                <th className="px-2 py-3 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 text-sm text-foreground">{row.tenant}</td>
                  <td className="px-2 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {row.dir === "inbound" ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                      )}
                      {row.dir}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm capitalize text-foreground">{row.type}</td>
                  <td className="px-2 py-3">
                    <Badge tone={row.status === "failed" ? "danger" : "success"} dot>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-sm text-muted-foreground">{row.latency}</td>
                  <td className="px-2 py-3 text-right text-sm text-muted-foreground">{row.ago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PlatformPage>
  );
}
