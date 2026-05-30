from __future__ import annotations

import hashlib
import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock

from fastapi import Header, HTTPException, Query, status

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ApiKey
from app.queue.redis_queue import rate_limit_check

_WINDOW_SECONDS = 60
_DEFAULT_RATE_LIMIT = 120
_requests_by_token: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = Lock()


@dataclass(slots=True)
class AuthContext:
    token: str
    tenant_id: str


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

    return max(1, value)


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
                return "sandbox"
            return row.tenant_id
    except Exception:
        return "sandbox"


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
    api_key: str | None = Query(default=None),
) -> AuthContext:
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
            detail="Missing API key. Send a bearer token or x-api-key header.",
        )

    if token != get_expected_api_key() and not _token_registered(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key. Check the pilot token and try again.",
        )

    _enforce_rate_limit(token)
    return AuthContext(token=token, tenant_id=resolve_tenant_id(token))


def require_api_key(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> str:
    return require_auth(authorization=authorization, x_api_key=x_api_key).token


def _token_registered(token: str) -> bool:
    if not persistence_enabled():
        return False
    key_hash = hash_api_key(token)
    try:
        with db_session() as session:
            row = session.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None)).one_or_none()
            return row is not None
    except Exception:
        return False


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
