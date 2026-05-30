from __future__ import annotations

import os
from typing import Any

from app.store.sessions import session_store

_DEFAULT_TTL_SECONDS = 60 * 60 * 24
_store = None


def _ttl_seconds() -> int:
    raw = os.getenv("QTANGL_AIRLINE_SESSION_TTL_SECONDS") or os.getenv("QTANGL_HOSPITAL_SESSION_TTL_SECONDS")
    if not raw:
        return _DEFAULT_TTL_SECONDS
    try:
        return max(300, int(raw))
    except ValueError:
        return _DEFAULT_TTL_SECONDS


def _get_store():
    global _store
    if _store is None:
        _store = session_store(namespace="airline", ttl_seconds=_ttl_seconds(), prefix="airline")
    return _store


def create_session(payload: Any, *, tenant_id: str = "sandbox") -> str:
    return _get_store().create(payload, tenant_id=tenant_id)


def get_session(session_id: str, *, tenant_id: str = "sandbox"):
    return _get_store().get(session_id, tenant_id=tenant_id)


def delete_session(session_id: str, *, tenant_id: str = "sandbox") -> None:
    _get_store().delete(session_id, tenant_id=tenant_id)
