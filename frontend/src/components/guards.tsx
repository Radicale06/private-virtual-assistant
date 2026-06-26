import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { roleHome, useAuth } from "../lib/auth";

function FullScreenLoader() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-pulse rounded-full bg-primary" />
        Loading…
      </div>
    </div>
  );
}

/** Gate any authenticated area. Sends anonymous users to /login (remembering where). */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

/** Gate by role. Wrong-role users are bounced to their own home (no cross-console access). */
export function RequireRole({ role }: { role: "user" | "admin" }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}

/** For /login & /register  already-authed users skip straight to their home. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Root "/" resolver  role home if authed, else login. */
export function RoleLanding() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return <Navigate to={user ? roleHome(user.role) : "/login"} replace />;
}
