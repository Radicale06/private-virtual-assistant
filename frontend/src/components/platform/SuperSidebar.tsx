import {
  Activity,
  Bot,
  Coins,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  MessageCircle,
  MessageSquare,
  Plug,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

const MAIN: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, to: "/platform/overview" },
  { label: "Users", icon: Users, to: "/platform/users" },
  { label: "Agents", icon: Bot, to: "/platform/agents" },
  { label: "Conversations", icon: MessageSquare, to: "/platform/conversations" },
];

const INFRA: NavItem[] = [
  { label: "Integrations Health", icon: Plug, to: "/platform/integrations" },
  { label: "WhatsApp", icon: MessageCircle, to: "/platform/whatsapp" },
  { label: "System Health", icon: Activity, to: "/platform/system" },
];

const BUSINESS: NavItem[] = [
  { label: "Costs & Usage", icon: Coins, to: "/platform/costs" },
  { label: "Revenue", icon: TrendingUp, to: "/platform/revenue" },
  { label: "Templates", icon: FileText, to: "/platform/templates" },
  { label: "Audit Log", icon: Shield, to: "/platform/audit" },
];

function NavGroup({ title, items }: { title?: string; items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      {title && (
        <span className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      )}
      {items.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-active text-sidebar-active-foreground"
                : "text-sidebar-foreground hover:bg-secondary",
            )
          }
        >
          <Icon className="h-[15px] w-[15px] shrink-0" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

export function SuperSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Sparkles className="h-[15px] w-[15px] text-primary-foreground" />
        </div>
        <span className="font-headings text-lg font-semibold text-foreground">Aria</span>
      </div>

      {/* console badge + back */}
      <div className="border-b border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-md bg-danger-muted px-2 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-danger">
            <Shield className="h-[11px] w-[11px] text-primary-foreground" />
          </span>
          <span className="text-sm font-semibold text-danger">Platform Console</span>
        </div>
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-danger"
        >
          <LogOut className="h-3 w-3" />
          Sign out
        </button>
      </div>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-4 px-3 py-3">
        <NavGroup items={MAIN} />
        <NavGroup title="Infrastructure" items={INFRA} />
        <NavGroup title="Business" items={BUSINESS} />
      </nav>

      <div className="border-t border-border px-3 py-4">
        <a
          href="https://docs.example.com"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-[15px] w-[15px]" />
          Documentation
        </a>
      </div>
    </aside>
  );
}
