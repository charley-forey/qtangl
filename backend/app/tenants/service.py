from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ApiKey, Tenant


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def generate_api_key() -> str:
    return f"qtangl_{secrets.token_urlsafe(32)}"


def create_tenant(*, tenant_id: str | None = None, name: str) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Tenant management requires DATABASE_URL")
    tid = tenant_id or f"tenant-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        if session.get(Tenant, tid) is not None:
            raise ValueError(f"Tenant already exists: {tid}")
        session.add(Tenant(id=tid, name=name))
    return {"tenantId": tid, "name": name}


def issue_api_key(*, tenant_id: str, label: str = "default") -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Tenant management requires DATABASE_URL")
    raw_key = generate_api_key()
    key_id = f"key-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        if session.get(Tenant, tenant_id) is None:
            raise ValueError(f"Unknown tenant: {tenant_id}")
        session.add(
            ApiKey(
                id=key_id,
                tenant_id=tenant_id,
                key_hash=hash_api_key(raw_key),
                label=label,
            )
        )
    return {"keyId": key_id, "tenantId": tenant_id, "label": label, "apiKey": raw_key}


def revoke_api_key(*, key_id: str) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Tenant management requires DATABASE_URL")
    with db_session() as session:
        row = session.get(ApiKey, key_id)
        if row is None:
            raise ValueError(f"Unknown key: {key_id}")
        row.revoked_at = datetime.now(timezone.utc)
        tenant_id = row.tenant_id
    return {"keyId": key_id, "tenantId": tenant_id, "revoked": True}


def list_tenant_keys(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(ApiKey).filter(ApiKey.tenant_id == tenant_id).all()
        return [
            {
                "keyId": row.id,
                "label": row.label,
                "createdAt": row.created_at.isoformat(),
                "revoked": row.revoked_at is not None,
            }
            for row in rows
        ]
