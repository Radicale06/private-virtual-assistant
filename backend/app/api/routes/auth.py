"""Auth  register (creates user + draft agent), login, current user."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import CurrentUser, Db
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.schemas import RegisterRequest, TokenResponse, UserOut
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
