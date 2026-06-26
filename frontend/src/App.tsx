import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app/AppLayout";
import { PlatformLayout } from "./components/platform/PlatformLayout";
import { RequireAuth, RequireRole, PublicOnly, RoleLanding } from "./components/guards";
import { AuthProvider } from "./lib/auth";
import { Landing } from "./pages/landing/Landing";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Activity } from "./pages/app/Activity";
import { Billing } from "./pages/app/Billing";
import { Home } from "./pages/app/Home";
import { Memory } from "./pages/app/Memory";
import { MyAssistant } from "./pages/app/MyAssistant";
import { Reminders } from "./pages/app/Reminders";
import { Settings } from "./pages/app/Settings";
import { Agents } from "./pages/platform/Agents";
import { AuditLog } from "./pages/platform/AuditLog";
import { Conversations } from "./pages/platform/Conversations";
import { Costs } from "./pages/platform/Costs";
import { IntegrationsHealth } from "./pages/platform/IntegrationsHealth";
import { Overview } from "./pages/platform/Overview";
import { Revenue } from "./pages/platform/Revenue";
import { SystemHealth } from "./pages/platform/SystemHealth";
import { Templates } from "./pages/platform/Templates";
import { Users } from "./pages/platform/Users";
import { WhatsApp } from "./pages/platform/WhatsApp";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public marketing landing */}
          <Route path="/" element={<Landing />} />

          {/* Public */}
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

          {/* Authenticated */}
          <Route element={<RequireAuth />}>
            {/* Customer (user) app */}
            <Route element={<RequireRole role="user" />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="assistant" element={<MyAssistant />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="activity" element={<Activity />} />
                <Route path="memory" element={<Memory />} />
                <Route path="settings" element={<Settings />} />
                <Route path="billing" element={<Billing />} />
              </Route>
            </Route>

            {/* Platform admin (operator) console */}
            <Route element={<RequireRole role="admin" />}>
              <Route path="/platform" element={<PlatformLayout />}>
                <Route index element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="users" element={<Users />} />
                <Route path="agents" element={<Agents />} />
                <Route path="conversations" element={<Conversations />} />
                <Route path="integrations" element={<IntegrationsHealth />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="system" element={<SystemHealth />} />
                <Route path="costs" element={<Costs />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="templates" element={<Templates />} />
                <Route path="audit" element={<AuditLog />} />
              </Route>
            </Route>
          </Route>

          {/* Root + catch-all → role home or login */}
          <Route path="*" element={<RoleLanding />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
