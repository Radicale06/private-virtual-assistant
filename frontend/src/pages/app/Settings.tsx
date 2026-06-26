import { AlertTriangle, Globe, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { Card } from "../../components/ui/Card";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-input">
        <Icon className="h-[15px] w-[15px] text-secondary-foreground" />
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function Settings() {
  const { me } = useApp();

  return (
    <>
      <AppTopbar
        title="Settings"
        subtitle="Manage your profile and account."
        userName={me?.full_name ?? "You"}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Profile</h3>
          <div className="mt-4 flex flex-col">
            <Row icon={User} label="Name" value={me?.full_name ?? ""} />
            <Row icon={Mail} label="Email" value={me?.email ?? ""} />
            <Row icon={Globe} label="Timezone" value={me?.timezone ?? "UTC"} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground">Assistant behaviour</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirmations, briefings, and working hours are configured on your assistant.
          </p>
          <Link
            to="/app/assistant"
            className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary"
          >
            Open My Assistant
          </Link>
        </Card>

        <Card className="border-danger/30 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-[17px] w-[17px] text-danger" />
            <h3 className="text-lg font-semibold text-danger">Danger zone</h3>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
              <div className="leading-tight">
                <div className="text-sm font-medium text-foreground">Disconnect WhatsApp</div>
                <div className="text-xs text-muted-foreground">
                  Unlink your phone from this assistant.
                </div>
              </div>
              <button className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-muted">
                Disconnect
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
              <div className="leading-tight">
                <div className="text-sm font-medium text-foreground">Delete account</div>
                <div className="text-xs text-muted-foreground">
                  Permanently delete your account and all data.
                </div>
              </div>
              <button className="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                Delete
              </button>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
