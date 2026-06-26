// Single source of truth for integration metadata (logos, labels, OAuth service).
// Logos are the real brand marks in /public/logos.

export interface IntegrationMeta {
  provider: string; // backend IntegrationProvider value
  label: string;
  logo: string; // path under /public
  service: string; // OAuth connect service: google | microsoft | calendly | zoom
  description: string;
}

export const INTEGRATIONS: IntegrationMeta[] = [
  {
    provider: "google_calendar",
    label: "Google Calendar",
    logo: "/logos/google-calendar.svg",
    service: "google",
    description: "Sync and create calendar events",
  },
  {
    provider: "gmail",
    label: "Gmail",
    logo: "/logos/gmail.svg",
    service: "google",
    description: "Read, summarize, and draft emails",
  },
  {
    provider: "google_meet",
    label: "Google Meet",
    logo: "/logos/google-meet.svg",
    service: "google",
    description: "Create and join video meetings",
  },
  {
    provider: "outlook_calendar",
    label: "Outlook Calendar",
    logo: "/logos/outlook.svg",
    service: "microsoft",
    description: "Sync and create Outlook events",
  },
  {
    provider: "outlook_mail",
    label: "Outlook Mail",
    logo: "/logos/outlook.svg",
    service: "microsoft",
    description: "Read, summarize, and draft Outlook mail",
  },
  {
    provider: "microsoft_teams",
    label: "Microsoft Teams",
    logo: "/logos/microsoft-teams.svg",
    service: "microsoft",
    description: "Create and join Teams meetings",
  },
  {
    provider: "calendly",
    label: "Calendly",
    logo: "/logos/calendly.svg",
    service: "calendly",
    description: "Share booking links and manage meetings",
  },
  {
    provider: "zoom",
    label: "Zoom",
    logo: "/logos/zoom.svg",
    service: "zoom",
    description: "Create and join Zoom meetings",
  },
];

// Landing marquee = all integrations + WhatsApp (the channel itself).
export const LANDING_INTEGRATIONS = [
  ...INTEGRATIONS.map((i) => ({ label: i.label, logo: i.logo })),
  { label: "WhatsApp", logo: "/logos/whatsapp.svg" },
];
