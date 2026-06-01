from __future__ import annotations

import json
import os
import time
from typing import Any

_STATE: dict[str, Any] = {
    "last_tick_at": None,
    "last_enqueued_count": 0,
    "total_enqueued": 0,
}


def record_scheduler_tick(*, enqueued: int) -> None:
    _STATE["last_tick_at"] = time.time()
    _STATE["last_enqueued_count"] = enqueued
    _STATE["total_enqueued"] = int(_STATE.get("total_enqueued", 0)) + enqueued
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

    return {
        "schedulerEnabled": scheduler_enabled(),
        "persistenceEnabled": persistence_enabled(),
        "redisEnabled": redis_enabled(),
        "lastTickAt": _STATE.get("last_tick_at"),
        "lastEnqueuedCount": _STATE.get("last_enqueued_count", 0),
        "totalEnqueued": _STATE.get("total_enqueued", 0),
        "intervalSec": float(os.environ.get("QTANGL_SCHEDULER_INTERVAL_SEC", "60")),
    }
