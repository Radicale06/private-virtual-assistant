import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { api } from "../../lib/api";
import type { BillingSummary } from "../../lib/types";

// Invoice history isn't exposed by the backend yet  sample.
const SAMPLE_INVOICES = [
  { id: "INV-0042", date: "Jun 1, 2026", amount: "$12.00", status: "Paid" },
  { id: "INV-0041", date: "May 1, 2026", amount: "$12.00", status: "Paid" },
  { id: "INV-0040", date: "Apr 1, 2026", amount: "$12.00", status: "Paid" },
];

export function Billing() {
  const { me } = useApp();
  const [billing, setBilling] = useState<BillingSummary | null>(null);

  useEffect(() => {
    api.billing().then(setBilling).catch(() => setBilling(null));
  }, []);

  async function upgrade() {
    try {
      const { checkout_url } = await api.checkout();
      window.location.href = checkout_url;
    } catch {
      /* billing not configured */
    }
  }

  const used = billing?.messages_used ?? 284;
  const limit = billing?.limit ?? 500;

  return (
    <>
      <AppTopbar
        title="Billing"
        subtitle="Your plan, usage, and invoices."
        userName={me?.full_name ?? "You"}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* current plan */}
          <Card className="flex flex-col gap-3 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Current plan</h3>
              <Badge tone="primary" className="capitalize">
                {billing?.plan ?? "pro"}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Messages this month</span>
                <span className="text-muted-foreground">
                  {used} / {limit}
                </span>
              </div>
              <ProgressBar value={(used / limit) * 100} className="mt-2 h-2" />
            </div>
            <button
              onClick={upgrade}
              className="mt-3 w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Upgrade plan
            </button>
          </Card>

          {/* plan perks */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground">Pro includes</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground">
              {["5,000 messages / mo", "All integrations", "Voice notes", "Morning briefings"].map(
                (perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    {perk}
                  </li>
                ),
              )}
            </ul>
          </Card>
        </div>

        {/* invoices */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Invoice history</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Invoice</th>
                  <th className="px-2 py-3 font-medium">Date</th>
                  <th className="px-2 py-3 font-medium">Amount</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="px-2 py-3 text-sm font-medium text-foreground">{inv.id}</td>
                    <td className="px-2 py-3 text-sm text-muted-foreground">{inv.date}</td>
                    <td className="px-2 py-3 text-sm text-foreground">{inv.amount}</td>
                    <td className="px-2 py-3">
                      <Badge tone="success" dot>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  );
}
