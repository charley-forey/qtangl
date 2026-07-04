from __future__ import annotations

import asyncio
import os
import threading
import time

from app.demo.config import DEMO_CADENCE_SEC, demo_enabled
from app.demo.service import maybe_run_cadence_tick

_THREAD: threading.Thread | None = None
_STOP = threading.Event()


def start_demo_scheduler() -> None:
    global _THREAD
    if not demo_enabled():
        return
    if _THREAD and _THREAD.is_alive():
        return
    _STOP.clear()
    _THREAD = threading.Thread(target=_loop, daemon=True)
    _THREAD.start()


def stop_demo_scheduler() -> None:
    _STOP.set()


def _loop() -> None:
    interval = max(5.0, float(os.getenv("QTANGL_DEMO_SCHEDULER_INTERVAL_SEC", str(min(DEMO_CADENCE_SEC, 30)))))
    while not _STOP.is_set():
        try:
            maybe_run_cadence_tick()
        except Exception:
            pass
        _STOP.wait(timeout=interval)


async def run_demo_scheduler_async() -> None:
    """Async-friendly cadence loop for FastAPI lifespan."""
    if not demo_enabled():
        return
    interval = max(5.0, float(os.getenv("QTANGL_DEMO_SCHEDULER_INTERVAL_SEC", str(min(DEMO_CADENCE_SEC, 30)))))
    while True:
        try:
            maybe_run_cadence_tick()
        except Exception:
            pass
        await asyncio.sleep(interval)
