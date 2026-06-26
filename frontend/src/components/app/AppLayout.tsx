import { Outlet, useOutletContext } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import type { UserMe } from "../../lib/types";
import { AppSidebar } from "./AppSidebar";

export interface AppContext {
  me: UserMe | null;
}

export function useApp(): AppContext {
  return useOutletContext<AppContext>();
}

export function AppLayout() {
  const { user } = useAuth();

  const name = user?.full_name ?? "there";
  const plan = user?.plan ?? "free";

  return (
    <div className="flex min-h-full bg-background font-body">
      <AppSidebar userName={name} plan={plan} />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <Outlet context={{ me: user } satisfies AppContext} />
      </div>
    </div>
  );
}
