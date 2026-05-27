from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Header, HTTPException, status

_WINDOW_SECONDS = 60
_DEFAULT_RATE_LIMIT = 120
_requests_by_token: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = Lock()


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


def require_api_key(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> str:
    token = None

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif x_api_key:
        token = x_api_key.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Send a bearer token or x-api-key header.",
        )

    if token != get_expected_api_key():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key. Check the pilot token and try again.",
        )

    _enforce_rate_limit(token)
    return token


def _enforce_rate_limit(token: str) -> None:
    now = time.time()
    rate_limit = get_rate_limit()

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
