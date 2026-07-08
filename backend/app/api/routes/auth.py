"""Auth  register (creates user + draft agent), login, current user."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt

from app.config import settings
from app.core.deps import CurrentUser, Db
from app.core.security import create_access_token, hash_password, verify_password
from app.integrations.google.oauth import get_userinfo
from app.schemas.schemas import RegisterRequest, TokenResponse, UserOut
from app.services import google_login
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: Db) -> TokenResponse:
    existing = await db.user.find_unique(where={"email": body.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = await db.user.create(
        data={
            "email": body.email,
            "hashed_password": hash_password(body.password),
            "full_name": body.full_name,
            "timezone": body.timezone,
        }
    )
    # Every user gets one (draft) assistant up front.
    await get_or_create_agent(db, user.id, name=body.assistant_name)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(db: Db, form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    user = await db.user.find_unique(where={"email": form.username})
    if user is None or not user.hashed_password or not verify_password(
        form.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token)


# --------------------------------------------------------------- Google sign-in
_STATE_ALG = "HS256"


def _sign_login_state() -> str:
    return jwt.encode(
        {
            "purpose": "google_login",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        },
        settings.app_secret_key,
        algorithm=_STATE_ALG,
    )


def _verify_login_state(state: str) -> None:
    try:
        data = jwt.decode(state, settings.app_secret_key, algorithms=[_STATE_ALG])
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid OAuth state") from exc
    if data.get("purpose") != "google_login":
        raise HTTPException(status_code=400, detail="Invalid OAuth state")


@router.get("/google/start")
async def google_start() -> RedirectResponse:
    """Kick off Google sign-in — redirect the browser to Google's consent."""
    return RedirectResponse(google_login.authorization_url(_sign_login_state()))


@router.get("/google/callback")
async def google_callback(
    db: Db, code: str = Query(...), state: str = Query(...)
) -> RedirectResponse:
    """Google redirects here. Find-or-create the user, then hand a JWT to the SPA."""
    front = settings.frontend_base_url.rstrip("/")

    def _fail() -> RedirectResponse:
        return RedirectResponse(f"{front}/login?error=google")

    try:
        _verify_login_state(state)
        tokens = await google_login.exchange_code(code)
        info = await get_userinfo(tokens["access_token"])
    except Exception:  # noqa: BLE001 — any failure → back to login with a flag
        return _fail()

    email = (info.get("email") or "").strip().lower()
    if not email or info.get("email_verified") is False:
        return _fail()

    user = await db.user.find_unique(where={"email": email})
    if user is None:
        user = await db.user.create(data={"email": email, "full_name": info.get("name")})
        # New sign-ups get a draft assistant, same as email registration.
        await get_or_create_agent(db, user.id)

    token = create_access_token(subject=user.id, role=user.role)
    return RedirectResponse(f"{front}/auth/callback#token={token}")


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        plan=user.plan,
        timezone=user.timezone,
    )
