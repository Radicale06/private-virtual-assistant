"""Application settings, loaded from the environment via pydantic-settings."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    # --- App ---
    app_env: str = "development"
    app_secret_key: str = "change-me"
    app_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:3000"
    log_level: str = "INFO"

    # JWT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # --- Postgres (Prisma reads DATABASE_URL directly) ---
    database_url: str = "postgresql://pva:pva@localhost:5432/pva"
    postgres_user: str = "pva"
    postgres_password: str = "pva"
    postgres_db: str = "pva"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # --- Redis / Celery ---
    redis_url: str = "redis://localhost:6379/0"

    # --- Token vault ---
    encryption_key: str = ""  # Fernet key; required in non-dev

    # --- LLM ---
    llm_provider: str = "openai"
    openai_api_key: str = ""
    llm_router_model: str = "gpt-4o-mini"
    llm_main_model: str = "gpt-4o"
    llm_reasoning_model: str = "o4-mini"
    whisper_model: str = "whisper-1"

    # --- WhatsApp via Twilio ---
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    # The Twilio-provisioned WhatsApp sender, E.164 (e.g. +15559005286).
    twilio_whatsapp_number: str = ""
    twilio_api_base: str = "https://api.twilio.com/2010-04-01"
    # Verify the X-Twilio-Signature on inbound webhooks (enable in prod once the
    # public webhook URL is stable; off by default so local/tunnel setup isn't blocked).
    twilio_validate_signature: bool = False
    # Optional approved Content template SIDs (HX...) for proactive sends outside
    # the 24h session window. If unset, proactive sends fall back to free-form text.
    twilio_content_reminder: str = ""
    twilio_content_briefing: str = ""
    # Public number users message (for wa.me QR deep links). Defaults to the Twilio number.
    whatsapp_shared_number: str = ""

    # --- Google OAuth ---
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/integrations/google/callback"

    # --- Calendly OAuth ---
    calendly_client_id: str = ""
    calendly_client_secret: str = ""
    calendly_redirect_uri: str = "http://localhost:8000/api/integrations/calendly/callback"

    # --- Zoom OAuth ---
    zoom_client_id: str = ""
    zoom_client_secret: str = ""
    zoom_redirect_uri: str = "http://localhost:8000/api/integrations/zoom/callback"

    # --- Microsoft 365 OAuth (Graph: Outlook Calendar + Mail + Teams) ---
    ms_client_id: str = ""
    ms_client_secret: str = ""
    ms_tenant: str = "common"  # common | organizations | consumers | <tenant-id>
    ms_redirect_uri: str = "http://localhost:8000/api/integrations/microsoft/callback"

    # --- Stripe ---
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_pro: str = ""

    # --- Agent runtime tuning ---
    context_recent_messages: int = 15          # raw turns kept verbatim in context
    context_compaction_threshold_tokens: int = 3500
    agent_max_tool_iterations: int = 8         # safety cap on the tool loop

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in {"production", "prod"}

    @property
    def public_whatsapp_number(self) -> str:
        """E.164 number users message (for wa.me QR). Falls back to the Twilio sender."""
        return self.whatsapp_shared_number or self.twilio_whatsapp_number


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
