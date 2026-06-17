from __future__ import annotations

import hashlib
import hmac
import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Query, status

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ApiKey
from app.queue.redis_queue import rate_limit_check

_WINDOW_SECONDS = 60
_DEFAULT_RATE_LIMIT = 300
_MIN_RATE_LIMIT = 300
_requests_by_token: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = Lock()


@dataclass(slots=True)
class AuthContext:
    token: str
    tenant_id: str
    role: str = "admin"
    user_id: str | None = None
    email: str | None = None
    auth_method: str = "api_key"


def get_expected_api_key() -> str:
    return os.getenv("QTANGL_API_KEY", "qtangl-demo-key")


def get_rate_limit() -> int:
    raw_value = os.getenv("QTANGL_RATE_LIMIT_PER_MINUTE")
    if not raw_value:
        return _DEFAULT_RATE_LIMIT

    try:
        value = int(raw_value)
    except ValueError:
        return _DEFAULT_RATE_LIMIT

    return max(_MIN_RATE_LIMIT, max(1, value))


class AuthDatabaseError(Exception):
    """Raised when tenant resolution cannot reach the database."""


def resolve_tenant_id(token: str) -> str:
    demo_key = get_expected_api_key()
    if token == demo_key:
        return "sandbox"
    if not persistence_enabled():
        return "sandbox"
    key_hash = hash_api_key(token)
    try:
        with db_session() as session:
            row = session.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None)).one_or_none()
            if row is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key. Check the pilot token and try again.",
                )
            return row.tenant_id
    except HTTPException:
        raise
    except Exception as exc:
        raise AuthDatabaseError("Unable to resolve tenant from API key.") from exc


def resolve_role(token: str) -> str:
    if token == get_expected_api_key():
        return "admin"
    if not persistence_enabled():
        return "admin"
    key_hash = hash_api_key(token)
    try:
        with db_session() as session:
            row = session.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None)).one_or_none()
            if row is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key. Check the pilot token and try again.",
                )
            return row.role or "admin"
    except HTTPException:
        raise
    except Exception as exc:
        raise AuthDatabaseError("Unable to resolve role from API key.") from exc


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def get_admin_api_key() -> str | None:
    return os.getenv("QTANGL_ADMIN_API_KEY")


def require_admin(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> str:
    admin_key = get_admin_api_key()
    if not admin_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API is not configured (set QTANGL_ADMIN_API_KEY).",
        )
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif x_api_key:
        token = x_api_key.strip()
    if token != admin_key:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin API key required.")
    return token


def require_auth(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    x_qtangl_session: Annotated[str | None, Header(alias="X-Qtangl-Session")] = None,
    api_key: str | None = Query(default=None),
    *,
    count_toward_rate_limit: bool = True,
) -> AuthContext:
    session_ctx = _resolve_session_auth(x_qtangl_session, authorization)
    if session_ctx is not None:
        if count_toward_rate_limit:
            _enforce_rate_limit(session_ctx.token)
        return session_ctx

    token = None

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif x_api_key:
        token = x_api_key.strip()
    elif api_key:
        token = api_key.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing credentials. Sign in to the dashboard or send an API key.",
        )

    if token != get_expected_api_key():
        try:
            registered = _token_registered(token)
        except AuthDatabaseError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable. Try again shortly.",
            ) from None
        if not registered:
            session_key_ctx = _resolve_dashboard_session_key(token)
            if session_key_ctx is not None:
                if count_toward_rate_limit:
                    _enforce_rate_limit(session_key_ctx.token)
                return session_key_ctx
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key. Check the pilot token and try again.",
            )

    if count_toward_rate_limit:
        _enforce_rate_limit(token)
    try:
        tenant_id = resolve_tenant_id(token)
        role = resolve_role(token)
        _touch_api_key_last_used(token)
    except AuthDatabaseError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable. Try again shortly.",
        ) from None
    return AuthContext(token=token, tenant_id=tenant_id, role=role, auth_method="api_key")


ROLE_RANK = {"viewer": 0, "operator": 1, "admin": 2}


def require_tenant_role(min_role: str):
    """Dependency factory enforcing minimum tenant role (viewer < operator < admin)."""

    def _require(auth: AuthContext = Depends(require_auth)) -> AuthContext:
        current = ROLE_RANK.get(auth.role, 0)
        required = ROLE_RANK.get(min_role, 0)
        if current < required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{min_role} role or higher required for this resource.",
            )
        return auth

    return _require


def require_auth_write(auth: AuthContext = Depends(require_auth)) -> AuthContext:
    if auth.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewer role cannot modify tenant resources.",
        )
    return auth


def require_auth_operator(auth: AuthContext = Depends(require_auth)) -> AuthContext:
    if auth.role not in {"admin", "operator"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operator or admin role required for this resource.",
        )
    return auth


def require_api_key(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> str:
    return require_auth(authorization=authorization, x_api_key=x_api_key).token


def require_api_key_readonly(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> str:
    """Authenticated catalog/read endpoints — no rate-limit counter (demo prefetch)."""
    return require_auth(
        authorization=authorization,
        x_api_key=x_api_key,
        count_toward_rate_limit=False,
    ).token


def require_auth_readonly(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    api_key: str | None = Query(default=None),
) -> AuthContext:
    return require_auth(
        authorization=authorization,
        x_api_key=x_api_key,
        api_key=api_key,
        count_toward_rate_limit=False,
    )


def require_auth_admin(auth: AuthContext = Depends(require_auth_readonly)) -> AuthContext:
    if auth.role not in {"admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required for this resource.",
        )
    return auth


def require_bff_secret(
    x_qtangl_bff_secret: str | None = Header(default=None, alias="X-Qtangl-Bff-Secret"),
) -> None:
    secret = os.getenv("QTANGL_BFF_SESSION_SECRET")
    if not secret or not x_qtangl_bff_secret or not hmac.compare_digest(x_qtangl_bff_secret, secret):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid BFF credentials.",
        )


def _token_registered(token: str) -> bool:
    if not persistence_enabled():
        return False
    key_hash = hash_api_key(token)
    try:
        with db_session() as session:
            row = session.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None)).one_or_none()
            return row is not None
    except Exception as exc:
        raise AuthDatabaseError("Unable to validate API key registration.") from exc


def _enforce_rate_limit(token: str) -> None:
    rate_limit = get_rate_limit()
    from app.db.config import redis_enabled

    if redis_enabled():
        if not rate_limit_check(token, limit=rate_limit, window_seconds=_WINDOW_SECONDS):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Rate limit reached. The pilot API allows {rate_limit} requests "
                    "per minute per key."
                ),
            )
        return

    now = time.time()
    with _rate_lock:
        window = _requests_by_token[token]

        while window and now - window[0] > _WINDOW_SECONDS:
            window.popleft()

        if len(window) >= rate_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Rate limit reached. The pilot API allows {rate_limit} requests "
                    "per minute per key."
                ),
            )

        window.append(now)


def _resolve_session_auth(
    x_qtangl_session: str | None,
    authorization: str | None,
) -> AuthContext | None:
    header = x_qtangl_session if isinstance(x_qtangl_session, str) else None
    if not header and authorization and isinstance(authorization, str) and authorization.lower().startswith("bff "):
        header = authorization.split(" ", 1)[1].strip()
    if not header:
        return None
    from app.auth_workos.session import verify_bff_session

    claims = verify_bff_session(header)
    if claims is None:
        return None
    return AuthContext(
        token=f"bff:{claims.user_id}",
        tenant_id=claims.tenant_id,
        role=claims.role,
        user_id=claims.user_id,
        email=claims.email,
        auth_method="bff_session",
    )


def _resolve_dashboard_session_key(token: str) -> AuthContext | None:
    from app.auth_workos.session import verify_session_key

    payload = verify_session_key(token)
    if payload is None:
        return None
    return AuthContext(
        token=token,
        tenant_id=str(payload["tenantId"]),
        role=str(payload.get("role", "viewer")),
        user_id=str(payload.get("userId")),
        email=str(payload.get("email") or ""),
        auth_method="session_key",
    )


def _touch_api_key_last_used(token: str) -> None:
    if token == get_expected_api_key() or not persistence_enabled():
        return
    from datetime import datetime, timezone

    key_hash = hash_api_key(token)
    try:
        with db_session() as session:
            row = session.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None)).one_or_none()
            if row is not None:
                row.last_used_at = datetime.now(timezone.utc)
    except Exception:
        return
