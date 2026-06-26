# PVA Backend

FastAPI application implementing the multi-tenant Private Virtual Assistant platform.

## Package layout

```
app/
├── main.py                 # FastAPI app factory, router mounting, CORS, lifespan
├── config.py               # Settings (pydantic-settings, env-driven)
├── database.py             # Async engine + session factory + Base
├── logging_config.py       # structlog setup
│
├── db.py                   # Prisma client provider (shared client + per-task sessions)
├── constants.py            # string enums mirroring the Prisma schema
│
├── core/                   # cross-cutting primitives
│   ├── security.py         # JWT, password hashing
│   ├── encryption.py       # Fernet cipher  OAuth tokens encrypted at rest
│   ├── vault.py            # encrypt/decrypt the integration token blob
│   ├── deps.py             # FastAPI dependencies: Prisma client, current user, role guards
│   └── locks.py            # per-tenant Redis lock (serialize one user's messages)
│
│   # Data layer = prisma/schema.prisma (source of truth). Models generated to `prisma.models`:
│   #   User · Agent · AgentIntegration · LinkingToken · WhatsAppIdentity
│   #   Message · AgentMemory · ConversationState · Job · AuditLog
│
├── llm/                    # provider-agnostic LLM
│   ├── base.py             # LLMClient interface + types (Message, ToolSpec, ToolCall)
│   ├── openai_client.py    # OpenAI implementation (function calling + whisper)
│   └── factory.py          # build client from settings (swap to Claude here later)
│
├── agent/                  # the assistant brain
│   ├── runtime.py          # the tool-calling loop
│   ├── context.py          # prompt assembly (system + memory + tools + summary + recent)
│   ├── compaction.py       # summarize-and-fold older history to bound context
│   └── tools/              # AI tools exposed to the model (only for connected integrations)
│       ├── registry.py     # Tool base + per-agent tool collection
│       ├── calendar.py · reminders.py · email.py · meet.py · calendly.py · memory.py
│
├── integrations/           # third-party clients + OAuth
│   ├── google/ (oauth, calendar, gmail) · calendly.py · zoom.py
│
├── whatsapp/               # the messaging edge
│   ├── client.py           # Cloud API send (free-form + template)
│   ├── webhook.py          # parse inbound payloads
│   ├── router.py           # phone → tenant resolution + linking
│   ├── media.py            # download voice notes
│   └── templates.py        # approved template names + builders
│
├── voice/transcribe.py     # voice note → text (Whisper)
│
├── services/               # orchestration use-cases
│   ├── linking_service.py · message_service.py · reminder_service.py · agent_service.py
│
├── tasks/                  # Celery
│   ├── celery_app.py · inbound.py (process message) · reminders.py · briefings.py
│
└── api/routes/             # HTTP surface
    ├── auth.py · agents.py · integrations.py · reminders.py · activity.py
    ├── memory.py · billing.py · webhook.py · admin.py (operator/platform)
```

## The request lifecycle (inbound WhatsApp message)

```
Meta → POST /api/webhook → parse → enqueue Celery task (fast 200, dedupe on wa_message_id)
   worker:
     router: phone → whatsapp_identities → agent instance   (or linking / onboarding)
     acquire per-tenant Redis lock (ordering)
     if voice: download media → Whisper → text
     context.assemble(): system + memory + tools(connected only) + rolling summary + last N
     runtime.run(): LLM tool-calling loop → execute tools (calendar/email/reminder/…)
     reply via WhatsApp (free-form if <24h window else template)
     persist transcript, maybe compaction, release lock
```

## Multi-tenancy & isolation

- **One shared WhatsApp number** for all users; the inbound `from` phone is the tenant key.
- Every query, tool call, and token read is scoped by `agent_id`  enforced in the data/service
  layer, never trusted to the prompt.
- One user → one agent → bound to the number via `whatsapp_identities`.

## Roles

- `user`  the customer. Manages their own agent, integrations, reminders, memory, billing.
- `admin`  the platform operator. Read/monitor across all tenants + platform health & costs.

## Running

```bash
# from repo root
docker compose up --build
# or standalone:
cd backend && cp .env.example .env   # fill secrets (incl. DATABASE_URL, ENCRYPTION_KEY)
prisma generate                      # generate the Prisma client
prisma db push                       # sync schema → Postgres (dev)
uvicorn app.main:app --reload
celery -A app.tasks.celery_app.celery_app worker --loglevel=info
celery -A app.tasks.celery_app.celery_app beat --loglevel=info

# create the first platform admin (operator):
python -m scripts.create_admin admin@you.com 'strong-password'
```

> Data layer is Prisma: edit `prisma/schema.prisma`, then `prisma db push` (dev) or
> `prisma migrate dev` (to generate migration files for production).
