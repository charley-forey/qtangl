from __future__ import annotations

import json
import logging
import math
import os
import time
from typing import Any

from app.db.config import redis_enabled
from app.queue.redis_queue import _get_client

logger = logging.getLogger(__name__)
_REDIS_KEY = "qtangl:scheduler:state"

_STATE: dict[str, Any] = {
    "last_tick_at": None,
    "last_enqueued_count": 0,
    "total_enqueued": 0,
}


def record_scheduler_tick(*, enqueued: int) -> None:
    _STATE["last_tick_at"] = time.time()
    _STATE["last_enqueued_count"] = enqueued
    _STATE["total_enqueued"] = int(_STATE.get("total_enqueued", 0)) + enqueued
    if redis_enabled():
        try:
            client = _get_client()
            if client is None:
                raise RuntimeError("Scheduler Redis client unavailable")
            with client.pipeline() as pipeline:
                pipeline.hset(_REDIS_KEY, mapping={
                    "last_tick_at": _STATE["last_tick_at"],
                    "last_enqueued_count": enqueued,
                })
                pipeline.hincrby(_REDIS_KEY, "total_enqueued", enqueued)
                _STATE["total_enqueued"] = int(pipeline.execute()[-1])
        except Exception:
            logger.warning("Unable to publish scheduler heartbeat to Redis", exc_info=True)
            return
    path = os.environ.get("QTANGL_SCHEDULER_STATE_FILE")
    if path:
        try:
            with open(path, "w", encoding="utf-8") as handle:
                json.dump(_STATE, handle)
        except OSError:
            pass


def scheduler_metrics() -> dict[str, Any]:
    from app.db.config import persistence_enabled, redis_enabled
    from app.monitoring.service import scheduler_enabled

    state = _STATE
    if redis_enabled():
        # A local tick cannot establish another process's scheduler health.
        state = {}
        try:
            client = _get_client()
            raw = client.hgetall(_REDIS_KEY) if client is not None else {}
            if raw:
                tick = float(raw["last_tick_at"])
                count = int(raw["last_enqueued_count"])
                total = int(raw["total_enqueued"])
                if math.isfinite(tick) and tick > 0 and count >= 0 and total >= 0:
                    state = {"last_tick_at": tick, "last_enqueued_count": count, "total_enqueued": total}
        except Exception:
            logger.warning("Unable to read scheduler heartbeat from Redis", exc_info=True)
    return {
        "schedulerEnabled": scheduler_enabled(),
        "persistenceEnabled": persistence_enabled(),
        "redisEnabled": redis_enabled(),
        "lastTickAt": state.get("last_tick_at"),
        "lastEnqueuedCount": state.get("last_enqueued_count"),
        "totalEnqueued": state.get("total_enqueued"),
        "intervalSec": float(os.environ.get("QTANGL_SCHEDULER_INTERVAL_SEC", "60")),
    }
