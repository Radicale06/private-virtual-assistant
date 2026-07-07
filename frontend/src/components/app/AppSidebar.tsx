import {
  Activity,
  Bell,
  Bot,
  Brain,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Settings,
  User,
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
  { label: "Home", icon: LayoutDashboard, to: "/app/home" },
  { label: "My Assistant", icon: Bot, to: "/app/assistant" },
];

const PRODUCTIVITY: NavItem[] = [
  { label: "Reminders", icon: Bell, to: "/app/reminders" },
  { label: "Activity", icon: Activity, to: "/app/activity" },
  { label: "Memory", icon: Brain, to: "/app/memory" },
];

const ACCOUNT: NavItem[] = [
  { label: "Settings", icon: Settings, to: "/app/settings" },
  { label: "Billing", icon: CreditCard, to: "/app/billing" },
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

export function AppSidebar({
  userName,
  plan,
}: {
  userName: string;
  plan: string;
}) {
  const { logout } = useAuth();
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <img
          src="/logos/Musaed.png"
          alt="Musaed"
          className="h-11 w-11 shrink-0 object-contain"
        />
        <span className="font-headings text-xl font-semibold tracking-tight text-foreground">
          Musaed
        </span>
      </div>

      {/* user chip */}
      <div className="border-b border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-md bg-input px-2 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-muted">
            <User className="h-[13px] w-[13px] text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <span className="text-xs capitalize text-muted-foreground">{plan} plan</span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-4 px-3 py-3">
        <NavGroup items={MAIN} />
        <NavGroup title="Productivity" items={PRODUCTIVITY} />
        <NavGroup title="Account" items={ACCOUNT} />
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
        <a
          href="https://docs.example.com"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-[15px] w-[15px]" />
          Help &amp; Support
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-danger"
        >
          <LogOut className="h-[15px] w-[15px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}
