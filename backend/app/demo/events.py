from __future__ import annotations

import asyncio
import json
from collections import deque
from datetime import datetime, timezone
from typing import Any

_EVENT_HISTORY: deque[dict[str, Any]] = deque(maxlen=200)
_SUBSCRIBERS: list[asyncio.Queue[str]] = []


def publish_event(event_type: str, data: dict[str, Any]) -> None:
    payload = {
        "type": event_type,
        "data": data,
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    _EVENT_HISTORY.append(payload)
    message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    for queue in list(_SUBSCRIBERS):
        try:
            queue.put_nowait(message)
        except asyncio.QueueFull:
            pass


def recent_events(limit: int = 25) -> list[dict[str, Any]]:
    return list(_EVENT_HISTORY)[-limit:]


async def subscribe() -> asyncio.Queue[str]:
    queue: asyncio.Queue[str] = asyncio.Queue(maxsize=100)
    _SUBSCRIBERS.append(queue)
    for event in list(_EVENT_HISTORY)[-5:]:
        await queue.put(f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n")
    return queue


def unsubscribe(queue: asyncio.Queue[str]) -> None:
    if queue in _SUBSCRIBERS:
        _SUBSCRIBERS.remove(queue)
