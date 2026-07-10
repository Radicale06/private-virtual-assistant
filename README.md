# PVA  Private Virtual Assistant

A multi-tenant SaaS platform where each user configures **one** AI assistant, connects their
productivity accounts (Google Calendar, Gmail, Calendly, Google Meet, Zoom), and talks to it
through a **single shared WhatsApp number**  by text or voice note. The assistant takes actions
on the user's behalf: creating events, setting reminders, summarizing email, scheduling meetings.

```
                         ONE WhatsApp Business number
                                    │  (all inbound traffic funnels here)
                          backend /webhook
                                    │
              router: message.from (phone) → tenant (agent instance)
                                    │
        ┌───────────────┬───────────────┬───────────────┐
   Sara's instance  Ali's instance  Omar's instance   …
   (her integrations, memory, context  strictly isolated by agent_id)
```

## Architecture

| Concern            | Choice                                                      |
| ------------------ | ---------------------------------------------------------- |
| Backend            | FastAPI (async, Python 3.12)                                |
| Agent core         | LLM tool-calling loop behind a provider-agnostic interface (OpenAI now, Claude swappable) |
| Scheduler / queue  | Celery + Redis, backed by a durable `jobs` table           |
| Database           | PostgreSQL (SQLAlchemy 2.0 async)                           |
| Messaging          | WhatsApp Cloud API (webhooks in, template messages out)    |
| Voice              | Whisper transcription (inbound voice notes → text)         |
| Token vault        | OAuth tokens encrypted at rest (Fernet envelope)           |
| Auth / roles       | JWT, two roles: `user` (customer), `admin` (operator)      |
| Billing            | Stripe                                                      |
| Frontend           | React/TypeScript (generated separately  see `frontend/`)  |

## Repository layout

```
PVA/
├── start-all.sh                  # build + start both stacks (backend then frontend)
├── backend/
│   ├── docker-compose.yml        # postgres, redis, adminer, API, worker, beat
│   ├── .env.example              # copy to backend/.env, fill secrets
│   ├── app/                      # application package (see backend/README.md)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── docker-compose.yml        # Vite dev server
│   ├── .env.example              # VITE_API_BASE_URL
│   └── ...                       # React/TypeScript app
└── nginx/                        # host nginx site configs + setup.sh (Let's Encrypt)
```

Each stack is its own compose project with its own `.env` — no shared root env.

## Quick start

```bash
cp backend/.env.example backend/.env    # fill in secrets (OpenAI, Twilio, Google…)
./start-all.sh                          # builds + starts backend + frontend stacks
# API:  http://localhost:18000     Frontend:  http://localhost:13000
```

Or run a single stack directly:

```bash
docker compose -f backend/docker-compose.yml up -d --build
docker compose -f frontend/docker-compose.yml up -d --build
```

See [`backend/README.md`](backend/README.md) for the application-level architecture, the agent
runtime, the tool layer, and how multi-tenant routing / isolation works.
