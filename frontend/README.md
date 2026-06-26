# PVA Frontend

React + TypeScript + Vite + **Tailwind v4** dashboard for the Private Virtual Assistant
platform. Design tokens are ported from the Banani export into `src/index.css` (`@theme`),
so the same utility classes (`bg-sidebar`, `text-muted-foreground`, `rounded-md`, …) work.

## Stack
- **Vite** + React 18 + TypeScript
- **Tailwind v4** (`@tailwindcss/vite`)  tokens in `src/index.css`
- **lucide-react** icons (replacing the export's inline SVGs)
- **react-router-dom** routing
- Typed API client in `src/lib/api.ts` → backend `/api/admin/*`

## Routes
- `/app/home`  **Customer (user)** dashboard: assistant status, KPIs, agenda,
  reminders, activity, integrations, usage.
- `/platform/overview`  **Operator (admin)** Platform Console: cross-tenant
  health, usage, costs, users.

## Layout
```
src/
├── main.tsx · App.tsx           # entry + router (/app + /platform)
├── index.css                    # Tailwind v4 + ported design tokens
├── lib/                         # api client (api + adminApi), types, cn helper
├── components/
│   ├── ui/                      # Card, Badge, StatCard, Sparkline, ProgressBar, Avatar
│   ├── app/                     # AppSidebar, AppLayout, AppTopbar, home/*  (customer)
│   └── platform/                # SuperSidebar, PlatformLayout, overview/*  (operator)
└── pages/
    ├── app/Home.tsx             # Customer dashboard
    └── platform/Overview.tsx    # Platform Console  Overview
```

## Run
```bash
cp .env.example .env            # VITE_API_BASE_URL → backend
npm install
npm run dev                     # http://localhost:3000  → /platform/overview
# or from repo root: docker compose up --build  (frontend service included)
```

## Notes
- The **Overview** page fetches live data from `/api/admin/{overview,users,system/health,whatsapp}`
  (requires an admin JWT in `localStorage.pva_token`). When the API is unreachable it
  shows a banner and renders sample values so the layout stays intact.
- Metrics the backend doesn't expose yet (MRR, error-rate, time-series, WhatsApp send-rate)
  live in `components/platform/overview/sampleData.ts`  wire real endpoints there later.
- Next screens (Users, Agents, Conversations, …) plug into the same `PlatformLayout`.
