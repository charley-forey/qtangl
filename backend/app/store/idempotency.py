from __future__ import annotations

import json
import time
from threading import Lock

from app.db.config import redis_enabled
from app.queue.redis_queue import _get_client

_memory: dict[str, tuple[str, float]] = {}
_lock = Lock()
_TTL_SECONDS = 3600


def _key(tenant_id: str, idempotency_key: str) -> str:
    return f"idempotency:{tenant_id}:{idempotency_key}"


def get_cached_scan_id(*, tenant_id: str, idempotency_key: str) -> str | None:
    cache_key = _key(tenant_id, idempotency_key)
    if redis_enabled():
        client = _get_client()
        if client is None:
            return None
        raw = client.get(cache_key)
        if not raw:
            return None
        payload = json.loads(raw)
        return payload.get("scanId")
    with _lock:
        entry = _memory.get(cache_key)
        if not entry:
            return None
        scan_id, expires = entry
        if time.time() > expires:
            del _memory[cache_key]
            return None
        return scan_id


def cache_scan_id(*, tenant_id: str, idempotency_key: str, scan_id: str) -> None:
    cache_key = _key(tenant_id, idempotency_key)
    if redis_enabled():
        client = _get_client()
        if client is None:
            return
        client.setex(cache_key, _TTL_SECONDS, json.dumps({"scanId": scan_id}))
        return
    with _lock:
        _memory[cache_key] = (scan_id, time.time() + _TTL_SECONDS)
