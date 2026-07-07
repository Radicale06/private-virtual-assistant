import { ChevronRight, Shield } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../ui/Avatar";
import { SuperSidebar } from "./SuperSidebar";

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  users: "Users",
  agents: "Agents",
  conversations: "Conversations",
  integrations: "Integrations Health",
  whatsapp: "WhatsApp",
  system: "System Health",
  costs: "Costs & Usage",
  revenue: "Revenue",
  templates: "Templates",
  audit: "Audit Log",
};

export function PlatformLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "overview";
  const section = SECTION_LABELS[slug] ?? "Overview";
  const name = user?.full_name ?? user?.email ?? "Operator";

  return (
    <div className="flex min-h-full bg-background font-body">
      <SuperSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-muted px-3 py-1 font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              Platform Console
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-secondary-foreground">{section}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium text-foreground">{name}</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
            <Avatar name={name} />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
