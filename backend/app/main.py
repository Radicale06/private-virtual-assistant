"""FastAPI application factory."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.db import connect_db, disconnect_db
from app.logging_config import configure_logging, get_logger

configure_logging()
log = get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    log.info("startup", env=settings.app_env)
    try:
        yield
    finally:
        await disconnect_db()
        log.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="PVA  Private Virtual Assistant",
        version="0.1.0",
        description="Multi-tenant WhatsApp personal assistant platform.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_base_url, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        return {"status": "ok", "env": settings.app_env}

    return app


app = create_app()
