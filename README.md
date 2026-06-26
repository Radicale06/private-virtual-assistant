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
├── docker-compose.yml        # postgres + redis + backend + worker + beat + frontend
├── .env.example              # shared env for compose
├── backend/                  # the full platform (this is where everything lives)
│   ├── app/                  # application package (see backend/README.md)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic/              # migrations
└── frontend/                 # placeholder  drop the generated React app here
```

## Quick start

```bash
cp .env.example .env          # fill in secrets (OpenAI, WhatsApp, Google, Stripe…)
docker compose up --build     # postgres, redis, backend API, worker, beat scheduler
# API:   http://localhost:8000      Docs: http://localhost:8000/docs
```

See [`backend/README.md`](backend/README.md) for the application-level architecture, the agent
runtime, the tool layer, and how multi-tenant routing / isolation works.
