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


def create_tenant(
    *,
    tenant_id: str | None = None,
    name: str,
    auth_mode: str = "magic_link",
    admin_email: str | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Tenant management requires DATABASE_URL")
    tid = tenant_id or f"tenant-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        if session.get(Tenant, tid) is not None:
            raise ValueError(f"Tenant already exists: {tid}")
        session.add(Tenant(id=tid, name=name, auth_mode=auth_mode))
    workos_org_id = None
    try:
        from app.auth_workos.service import create_organization, invite_user, workos_enabled

        if workos_enabled():
            workos_org_id = create_organization(tenant_id=tid, name=name)
            if admin_email and workos_org_id:
                invite_user(tenant_id=tid, email=admin_email, role="admin")
    except Exception:
        pass
    return {"tenantId": tid, "name": name, "workosOrgId": workos_org_id}


def issue_api_key(
    *,
    tenant_id: str,
    label: str = "default",
    role: str = "operator",
    created_by_user_id: str | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Tenant management requires DATABASE_URL")
    raw_key = generate_api_key()
    key_id = f"key-{uuid.uuid4().hex[:12]}"
    key_prefix = raw_key[:15] + "…"
    with db_session() as session:
        if session.get(Tenant, tenant_id) is None:
            raise ValueError(f"Unknown tenant: {tenant_id}")
        session.add(
            ApiKey(
                id=key_id,
                tenant_id=tenant_id,
                key_hash=hash_api_key(raw_key),
                label=label,
                role=role,
                key_prefix=key_prefix,
                created_by_user_id=created_by_user_id,
            )
        )
    return {
        "keyId": key_id,
        "tenantId": tenant_id,
        "label": label,
        "role": role,
        "keyPrefix": key_prefix,
        "apiKey": raw_key,
    }


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
                "role": row.role,
                "keyPrefix": row.key_prefix,
                "createdAt": row.created_at.isoformat(),
                "lastUsedAt": row.last_used_at.isoformat() if row.last_used_at else None,
                "revoked": row.revoked_at is not None,
            }
            for row in rows
        ]
