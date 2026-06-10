from __future__ import annotations

import json
from typing import Any

from app.db.config import redis_url

_client = None


def _get_client():
    global _client
    url = redis_url()
    if not url:
        return None
    if _client is None:
        import redis

        _client = redis.from_url(url, decode_responses=True)
    return _client


def ping() -> bool:
    client = _get_client()
    if client is None:
        return False
    try:
        return bool(client.ping())
    except Exception:
        return False


def enqueue(queue_name: str, job_id: str) -> None:
    client = _get_client()
    if client is None:
        return
    client.lpush(f"qtangl:queue:{queue_name}", job_id)


def queue_depth(queue_name: str) -> int:
    client = _get_client()
    if client is None:
        return 0
    try:
        return int(client.llen(f"qtangl:queue:{queue_name}"))
    except Exception:
        return 0


def total_discovery_queue_depth() -> int:
    return sum(queue_depth(q) for q in ("discovery_host", "discovery_code", "discovery_binary"))


def dequeue_blocking(queue_name: str, *, timeout_seconds: int = 5) -> str | None:
    client = _get_client()
    if client is None:
        return None
    result = client.brpop(f"qtangl:queue:{queue_name}", timeout=timeout_seconds)
    if not result:
        return None
    return result[1]


def store_job_payload(job_id: str, payload: dict[str, Any]) -> None:
    client = _get_client()
    if client is None:
        return
    client.setex(f"qtangl:jobpayload:{job_id}", 86_400, json.dumps(payload))


def load_job_payload(job_id: str) -> dict[str, Any] | None:
    client = _get_client()
    if client is None:
        return None
    raw = client.get(f"qtangl:jobpayload:{job_id}")
    if not raw:
        return None
    return json.loads(raw)


def rate_limit_check(token: str, *, limit: int, window_seconds: int = 60) -> bool:
    """Return True if request is allowed."""
    client = _get_client()
    if client is None:
        return True
    key = f"qtangl:ratelimit:{token}"
    count = client.incr(key)
    if count == 1:
        client.expire(key, window_seconds)
    return count <= limit
