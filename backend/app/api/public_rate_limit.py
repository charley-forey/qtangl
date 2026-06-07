"""Lightweight rate limiting for unauthenticated public endpoints (verify, transparency)."""

from __future__ import annotations

import os
import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request, status

_lock = Lock()
_buckets: dict[str, list[float]] = defaultdict(list)

_DEFAULT_LIMIT = 60
_DEFAULT_WINDOW = 60


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def enforce_public_rate_limit(request: Request, *, limit: int | None = None) -> None:
    """Reject requests when client exceeds verify/transparency rate budget."""
    max_requests = limit or int(os.getenv("QTANGL_VERIFY_RATE_LIMIT_PER_MINUTE", str(_DEFAULT_LIMIT)))
    window = int(os.getenv("QTANGL_VERIFY_RATE_WINDOW_SEC", str(_DEFAULT_WINDOW)))
    key = _client_key(request)
    now = time.time()
    cutoff = now - window
    with _lock:
        window_hits = [t for t in _buckets[key] if t > cutoff]
        if len(window_hits) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Verify rate limit exceeded. Try again shortly.",
                headers={"Retry-After": str(window)},
            )
        window_hits.append(now)
        _buckets[key] = window_hits
