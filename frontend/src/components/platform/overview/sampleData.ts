// Placeholder data for metrics the backend doesn't yet expose (MRR, error-rate,
// time-series, WhatsApp send-rate). The page renders real values from /api/admin/*
// where available and falls back to these so the dashboard reads complete.
// TODO: add backend endpoints for revenue, error-rate, and time-series, then remove.

export const SAMPLE = {
  trends: {
    messages: [42, 48, 45, 53, 49, 58, 55, 64, 60, 70, 66, 78],
    cost: [22, 25, 23, 28, 26, 30, 29, 33, 31, 35, 34, 38],
    signups: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12, 11, 15],
    errors: [1.1, 0.8, 1.4, 0.9, 1.2, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.8],
    whatsappDelivery: [92, 94, 93, 95, 96, 94, 93, 95, 96, 94, 95, 94],
    errorEvents: [3, 5, 2, 6, 3, 7, 4, 5, 3, 6, 4, 3],
  },
  whatsapp: {
    sendRatePerMin: 18.4,
    sendLimitPerMin: 80,
    deliverySuccess: 94.2,
    windowUsed: 8412,
    windowLimit: 100000,
    sharedNumber: "+1 (555) 012-3456",
  },
  needsAttention: [
    {
      tone: "danger" as const,
      icon: "plug" as const,
      title: "3 broken integrations",
      detail: "Google Calendar tokens expired for 3 users",
      ago: "12m ago",
    },
    {
      tone: "danger" as const,
      icon: "card" as const,
      title: "2 payment failures",
      detail: "Users on Pro plan  retrying in 24h",
      ago: "1h ago",
    },
    {
      tone: "warning" as const,
      icon: "layers" as const,
      title: "Job queue backlog",
      detail: "148 jobs pending · avg wait 4.2s",
      ago: "5m ago",
    },
    {
      tone: "warning" as const,
      icon: "chat" as const,
      title: "WhatsApp delivery dip",
      detail: "Success rate at 91.4% (threshold: 95%)",
      ago: "35m ago",
    },
  ],
  costBreakdown: {
    total: 38.2,
    revenueToday: 496.0,
    margin: 92.3,
    rows: [
      { label: "GPT-4o (main)", value: 22.1, pct: 58, color: "var(--color-chart-1)" },
      { label: "GPT-4o mini (routing)", value: 9.4, pct: 24, color: "var(--color-chart-2)" },
      { label: "o1 (reasoning)", value: 4.8, pct: 13, color: "var(--color-chart-3)" },
      { label: "Whisper (transcription)", value: 1.9, pct: 5, color: "var(--color-chart-4)" },
    ],
  },
};
