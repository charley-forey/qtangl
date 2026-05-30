from __future__ import annotations

from app.db.config import redis_enabled as _redis_enabled
from app.queue import redis_queue


def redis_enabled() -> bool:
    return _redis_enabled()


def enqueue_job(queue_name: str, job_id: str) -> None:
    redis_queue.enqueue(queue_name, job_id)


def ping_redis() -> bool:
    return redis_queue.ping()
