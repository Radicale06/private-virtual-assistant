// Placeholder data for things the backend doesn't expose as REST yet
// (today's calendar agenda, monthly AI-action/event counters). Real values for
// messages, reminders, activity, integrations, and link status come from the API.
// TODO: add a /api/agenda endpoint (today's events) and monthly KPI counters.

export const HOME_SAMPLE = {
  kpis: {
    aiActions: 47,
    aiActionsDelta: "+9%",
    events: 12,
    eventsDelta: "+3",
    messagesDelta: "+18%",
    remindersDelta: "+2",
  },
  agenda: [
    { time: "9:30 AM", title: "Team Standup", kind: "meet" as const },
    { time: "11:00 AM", title: "Design Review with Sara", kind: "event" as const },
    { time: "2:00 PM", title: "Send Q3 report to team", kind: "email" as const },
    { time: "4:30 PM", title: "Sync with Dev team", kind: "meet" as const },
  ],
  aiActionLimit: 100,
};

// Canonical integration list shown on the dashboard; status overlaid from the API.
export const INTEGRATION_CATALOG = [
  { provider: "google_calendar", label: "Google Calendar", icon: "calendar" as const },
  { provider: "gmail", label: "Gmail", icon: "mail" as const },
  { provider: "calendly", label: "Calendly", icon: "link" as const },
  { provider: "google_meet", label: "Google Meet", icon: "video" as const },
  { provider: "zoom", label: "Zoom", icon: "video" as const },
];
