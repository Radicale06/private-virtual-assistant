"""FastAPI dependencies: Prisma client, current user, and role guards."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from prisma import Prisma
from prisma.models import Agent, User

from app.constants import UserRole, UserStatus
from app.core.security import decode_access_token
from app.db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=True)

Db = Annotated[Prisma, Depends(get_db)]


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Db,
) -> User:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise cred_exc
    except ValueError:
        raise cred_exc

    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise cred_exc
    if user.status == UserStatus.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_admin(user: CurrentUser) -> User:
    """Platform operator guard (role = admin)."""
    if user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return user


Admin = Annotated[User, Depends(require_admin)]


async def get_user_agent(user: CurrentUser, db: Db) -> Agent:
    """The current admin's single agent."""
    agent = await db.agent.find_unique(where={"user_id": user.id})
    if agent is None:
        raise HTTPException(status_code=404, detail="No assistant configured yet")
    return agent
