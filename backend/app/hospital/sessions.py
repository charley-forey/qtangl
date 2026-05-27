from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass
from threading import Lock
from typing import Any


_DEFAULT_TTL_SECONDS = 60 * 60 * 24


@dataclass(slots=True)
class SessionRecord:
    payload: Any
    created_at: float
    expires_at: float


_session_lock = Lock()
_sessions: dict[str, SessionRecord] = {}


def _ttl_seconds() -> int:
    raw = os.getenv("QTANGL_HOSPITAL_SESSION_TTL_SECONDS")
    if not raw:
        return _DEFAULT_TTL_SECONDS
    try:
        return max(300, int(raw))
    except ValueError:
        return _DEFAULT_TTL_SECONDS


def create_session(payload: Any) -> str:
    now = time.time()
    session_id = f"hospital-{uuid.uuid4()}"
    with _session_lock:
        _purge_expired(now)
        _sessions[session_id] = SessionRecord(
            payload=payload,
            created_at=now,
            expires_at=now + _ttl_seconds(),
        )
    return session_id


def get_session(session_id: str) -> Any | None:
    now = time.time()
    with _session_lock:
        _purge_expired(now)
        record = _sessions.get(session_id)
        if not record or record.expires_at <= now:
            _sessions.pop(session_id, None)
            return None
        return record.payload


def delete_session(session_id: str) -> None:
    with _session_lock:
        _sessions.pop(session_id, None)


def _purge_expired(now: float) -> None:
    expired = [session_id for session_id, record in _sessions.items() if record.expires_at <= now]
    for session_id in expired:
        _sessions.pop(session_id, None)
