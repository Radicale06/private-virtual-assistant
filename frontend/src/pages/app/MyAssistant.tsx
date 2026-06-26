import { Bot, Clock, MessageCircle, Mail, Mic, Sliders, Zap } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useApp } from "../../components/app/AppLayout";
import { AppTopbar } from "../../components/app/AppTopbar";
import { ConnectedAccounts } from "../../components/app/assistant/ConnectedAccounts";
import { CreateAssistant } from "../../components/app/assistant/CreateAssistant";
import {
  TIMEZONES,
  TONE_PRESETS,
  WORKING_DAYS,
  timeOptions,
  toneToPreset,
} from "../../components/app/assistant/options";
import { WhatsAppLinkPanel } from "../../components/app/assistant/WhatsAppLinkPanel";
import { Card } from "../../components/ui/Card";
import { Toggle } from "../../components/ui/Toggle";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import type { AgentOut, IntegrationOut } from "../../lib/types";

const TIMES = timeOptions(30);

// The editable slice of the form (persisted via PATCH /api/agent).
interface FormState {
  name: string;
  tone: string; // preset label
  timezone: string;
  workingDays: string[]; // UI-only (no backend field yet)
  work_start: string | null;
  work_end: string | null;
  confirm_before_send: boolean;
  morning_briefing_enabled: boolean;
  morning_briefing_time: string | null;
  voice_transcription: boolean; // UI-only
  out_of_hours_reply: boolean; // UI-only
}

function fromAgent(a: AgentOut, tz: string): FormState {
  return {
    name: a.name,
    tone: toneToPreset(a.tone),
    timezone: tz,
    workingDays: ["Mo", "Tu", "We", "Th", "Fr"],
    work_start: a.work_start ?? "09:00",
    work_end: a.work_end ?? "18:00",
    confirm_before_send: a.confirm_before_send,
    morning_briefing_enabled: a.morning_briefing_enabled,
    morning_briefing_time: a.morning_briefing_time ?? "08:00",
    voice_transcription: true,
    out_of_hours_reply: false,
  };
}

// ---------------------------------------------------------------- small bits
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bot;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center gap-2 pb-1">
        <Icon className="h-[17px] w-[17px] text-foreground" />
        <h2 className="font-headings text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  children,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
        </div>
        <Toggle checked={checked} onChange={onChange} label={title} />
      </div>
      {checked && children}
    </div>
  );
}

function ThisMonth() {
  const rows = [
    { icon: MessageCircle, label: "Messages processed", value: 284 },
    { icon: Zap, label: "Actions taken", value: 47 },
    { icon: Mic, label: "Voice notes transcribed", value: 12 },
    { icon: Mail, label: "Emails summarized", value: 31 },
  ];
  return (
    <Card className="p-5">
      <h3 className="font-headings text-lg font-semibold text-foreground">This month</h3>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <r.icon className="h-[15px] w-[15px]" />
              {r.label}
            </span>
            <span className="text-sm font-semibold text-foreground">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- page
export function MyAssistant() {
  const { me } = useApp();
  const [agent, setAgent] = useState<AgentOut | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationOut[]>([]);
  const [saving, setSaving] = useState(false);

  const tz = me?.timezone ?? "America/New_York";

  const load = () => {
    api
      .agent()
      .then((a) => {
        setAgent(a);
        setForm(fromAgent(a, tz));
        setNotFound(false);
      })
      .catch(() => setNotFound(true));
    api.integrations().then(setIntegrations).catch(() => undefined);
  };

  useEffect(load, [tz]);

  const initial = useMemo(() => (agent ? fromAgent(agent, tz) : null), [agent, tz]);
  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  );

  if (notFound) {
    return (
      <>
        <AppTopbar title="My Assistant" userName={me?.full_name ?? "You"} />
        <main className="flex flex-1 items-center justify-center px-8 py-7">
          <CreateAssistant onCreated={load} />
        </main>
      </>
    );
  }

  if (!form) {
    return (
      <>
        <AppTopbar title="My Assistant" userName={me?.full_name ?? "You"} />
        <main className="flex-1 px-8 py-7 text-sm text-muted-foreground">Loading…</main>
      </>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await api.updateAgent({
        name: form.name,
        tone: form.tone.toLowerCase(),
        confirm_before_send: form.confirm_before_send,
        morning_briefing_enabled: form.morning_briefing_enabled,
        morning_briefing_time: form.morning_briefing_enabled
          ? form.morning_briefing_time
          : null,
        work_start: form.work_start,
        work_end: form.work_end,
      });
      setAgent(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppTopbar
        title="My Assistant"
        subtitle={`Customize how ${form.name} behaves, her schedule, and connected accounts.`}
        userName={me?.full_name ?? "You"}
      />

      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* left: form */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Identity */}
            <SectionCard icon={Bot} title="Identity">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Assistant name">
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Tone">
                  <div className="flex flex-wrap gap-2">
                    {TONE_PRESETS.map((preset) => {
                      const active = form.tone === preset;
                      return (
                        <button
                          key={preset}
                          onClick={() => set("tone", preset)}
                          className={cn(
                            "rounded-md border px-3 py-1.5 text-sm font-medium",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface text-foreground hover:bg-secondary",
                          )}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </SectionCard>

            {/* Schedule */}
            <SectionCard icon={Clock} title="Schedule & Availability">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Timezone">
                  <Select
                    value={form.timezone}
                    onChange={(v) => set("timezone", v)}
                    options={TIMEZONES.map((t) => ({ value: t, label: t }))}
                  />
                </Field>
                <Field label="Working days">
                  <div className="flex flex-wrap gap-2">
                    {WORKING_DAYS.map((d) => {
                      const active = form.workingDays.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() =>
                            set(
                              "workingDays",
                              active
                                ? form.workingDays.filter((x) => x !== d)
                                : [...form.workingDays, d],
                            )
                          }
                          className={cn(
                            "h-9 w-10 rounded-md border text-sm font-medium",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface text-foreground hover:bg-secondary",
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              <Field label="Working hours">
                <div className="flex items-center gap-3">
                  <Select
                    value={form.work_start ?? "09:00"}
                    onChange={(v) => set("work_start", v)}
                    options={TIMES}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Select
                    value={form.work_end ?? "18:00"}
                    onChange={(v) => set("work_end", v)}
                    options={TIMES}
                  />
                </div>
              </Field>
            </SectionCard>

            {/* Behaviour */}
            <SectionCard icon={Sliders} title="Behaviour">
              <div className="flex flex-col gap-4">
                <ToggleRow
                  title="Confirm before sending emails"
                  description={`${form.name} will ask for your approval before sending any email on your behalf.`}
                  checked={form.confirm_before_send}
                  onChange={(v) => set("confirm_before_send", v)}
                />
                <ToggleRow
                  title="Daily morning briefing"
                  description="Receive a daily WhatsApp summary of your agenda and reminders."
                  checked={form.morning_briefing_enabled}
                  onChange={(v) => set("morning_briefing_enabled", v)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Send at</span>
                    <Select
                      value={form.morning_briefing_time ?? "08:00"}
                      onChange={(v) => set("morning_briefing_time", v)}
                      options={timeOptions(60)}
                    />
                  </div>
                </ToggleRow>
                <ToggleRow
                  title="Voice note transcription"
                  description="Automatically transcribe voice notes you send on WhatsApp."
                  checked={form.voice_transcription}
                  onChange={(v) => set("voice_transcription", v)}
                />
                <ToggleRow
                  title="Out-of-hours auto-reply"
                  description="Send an automatic reply when messages arrive outside working hours."
                  checked={form.out_of_hours_reply}
                  onChange={(v) => set("out_of_hours_reply", v)}
                />
              </div>
            </SectionCard>

            {/* Connected accounts */}
            <ConnectedAccounts integrations={integrations} onChange={load} />
          </div>

          {/* right rail */}
          <div className="flex flex-col gap-6">
            <WhatsAppLinkPanel />
            <ThisMonth />
          </div>
        </div>

        {/* sticky footer actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setForm(initial)}
            disabled={!dirty || saving}
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </main>
    </>
  );
}
