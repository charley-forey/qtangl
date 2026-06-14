from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, is_dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import UploadSession as UploadSessionRow


def _json_dumps(payload: Any) -> str:
    def default(obj: Any) -> Any:
        if is_dataclass(obj):
            return asdict(obj)
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

    return json.dumps(payload, default=default)


class MemorySessionStore:
    def __init__(self, *, ttl_seconds: int, prefix: str) -> None:
        self._ttl_seconds = ttl_seconds
        self._prefix = prefix
        self._lock = Lock()
        self._sessions: dict[str, tuple[Any, float]] = {}

    def create(self, payload: Any, *, tenant_id: str = "sandbox") -> str:
        del tenant_id
        session_id = f"{self._prefix}-{uuid.uuid4()}"
        expires = time.time() + self._ttl_seconds
        with self._lock:
            self._purge()
            self._sessions[session_id] = (payload, expires)
        return session_id

    def get(self, session_id: str, *, tenant_id: str = "sandbox") -> Any | None:
        del tenant_id
        now = time.time()
        with self._lock:
            self._purge(now)
            record = self._sessions.get(session_id)
            if not record or record[1] <= now:
                self._sessions.pop(session_id, None)
                return None
            return record[0]

    def delete(self, session_id: str, *, tenant_id: str = "sandbox") -> None:
        del tenant_id
        with self._lock:
            self._sessions.pop(session_id, None)

    def _purge(self, now: float | None = None) -> None:
        now = now or time.time()
        expired = [sid for sid, (_, exp) in self._sessions.items() if exp <= now]
        for sid in expired:
            self._sessions.pop(sid, None)


class PostgresSessionStore:
    def __init__(self, *, namespace: str, ttl_seconds: int, prefix: str) -> None:
        self._namespace = namespace
        self._ttl_seconds = ttl_seconds
        self._prefix = prefix

    def create(self, payload: Any, *, tenant_id: str = "sandbox") -> str:
        session_id = f"{self._prefix}-{uuid.uuid4()}"
        expires_dt = datetime.now(timezone.utc) + timedelta(seconds=self._ttl_seconds)
        with db_session() as session:
            session.add(
                UploadSessionRow(
                    id=session_id,
                    tenant_id=tenant_id,
                    namespace=self._namespace,
                    payload_json=_json_dumps(payload),
                    expires_at=expires_dt,
                )
            )
        return session_id

    def get(self, session_id: str, *, tenant_id: str = "sandbox") -> Any | None:
        now = datetime.now(timezone.utc)
        with db_session() as session:
            row = session.get(UploadSessionRow, session_id)
            if row is None or row.namespace != self._namespace:
                return None
            if row.tenant_id != tenant_id:
                return None
            expires = row.expires_at
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires <= now:
                session.delete(row)
                return None
            return json.loads(row.payload_json)

    def delete(self, session_id: str, *, tenant_id: str = "sandbox") -> None:
        with db_session() as session:
            row = session.get(UploadSessionRow, session_id)
            if row and row.tenant_id == tenant_id:
                session.delete(row)


def session_store(*, namespace: str, ttl_seconds: int, prefix: str) -> MemorySessionStore | PostgresSessionStore:
    if persistence_enabled():
        return PostgresSessionStore(namespace=namespace, ttl_seconds=ttl_seconds, prefix=prefix)
    return MemorySessionStore(ttl_seconds=ttl_seconds, prefix=prefix)
