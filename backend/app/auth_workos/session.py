from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import DashboardSessionKey, TenantMembership, User

BFF_SESSION_TTL_SECONDS = 8 * 3600
SESSION_KEY_TTL_SECONDS = 8 * 3600


@dataclass(slots=True)
class BffSessionClaims:
    tenant_id: str
    user_id: str
    role: str
    email: str
    exp: int


def _bff_secret() -> str | None:
    return os.getenv("QTANGL_BFF_SESSION_SECRET")


def sign_bff_session(*, tenant_id: str, user_id: str, role: str, email: str) -> str | None:
    secret = _bff_secret()
    if not secret:
        return None
    exp = int(datetime.now(timezone.utc).timestamp()) + BFF_SESSION_TTL_SECONDS
    payload = {
        "tenantId": tenant_id,
        "userId": user_id,
        "role": role,
        "email": email,
        "exp": exp,
    }
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode()
    sig = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def verify_bff_session(header_value: str | None) -> BffSessionClaims | None:
    secret = _bff_secret()
    if not secret or not header_value or not isinstance(header_value, str):
        return None
    parts = header_value.split(".", 1)
    if len(parts) != 2:
        return None
    payload_b64, sig = parts
    expected = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return None
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=="))
    except (json.JSONDecodeError, ValueError):
        return None
    exp = int(payload.get("exp", 0))
    if exp < int(datetime.now(timezone.utc).timestamp()):
        return None
    tenant_id = payload.get("tenantId")
    user_id = payload.get("userId")
    role = payload.get("role", "viewer")
    email = payload.get("email", "")
    if not tenant_id or not user_id:
        return None
    if persistence_enabled():
        with db_session() as session:
            membership = (
                session.query(TenantMembership)
                .filter(
                    TenantMembership.tenant_id == tenant_id,
                    TenantMembership.user_id == user_id,
                )
                .one_or_none()
            )
            if membership is None:
                return None
            role = membership.role
    return BffSessionClaims(
        tenant_id=str(tenant_id),
        user_id=str(user_id),
        role=str(role),
        email=str(email),
        exp=exp,
    )


def mint_session_key(*, tenant_id: str, user_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    raw = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=SESSION_KEY_TTL_SECONDS)
    key_id = f"dsk-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        membership = (
            session.query(TenantMembership)
            .filter(TenantMembership.tenant_id == tenant_id, TenantMembership.user_id == user_id)
            .one_or_none()
        )
        if membership is None:
            return None
        role = membership.role
        session.add(
            DashboardSessionKey(
                id=key_id,
                tenant_id=tenant_id,
                user_id=user_id,
                key_hash=key_hash,
                expires_at=expires_at,
            )
        )
    return {
        "sessionKey": raw,
        "sessionKeyId": key_id,
        "expiresAt": expires_at.isoformat(),
        "role": role,
    }


def verify_session_key(token: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    key_hash = hashlib.sha256(token.encode()).hexdigest()
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = (
            session.query(DashboardSessionKey)
            .filter(
                DashboardSessionKey.key_hash == key_hash,
                DashboardSessionKey.revoked_at.is_(None),
                DashboardSessionKey.expires_at >= now,
            )
            .one_or_none()
        )
        if row is None:
            return None
        membership = (
            session.query(TenantMembership)
            .filter(
                TenantMembership.tenant_id == row.tenant_id,
                TenantMembership.user_id == row.user_id,
            )
            .one_or_none()
        )
        user = session.get(User, row.user_id)
        if membership is None:
            return None
        return {
            "tenantId": row.tenant_id,
            "userId": row.user_id,
            "role": membership.role,
            "email": user.email if user else "",
            "sessionKeyId": row.id,
        }


def revoke_session_keys_for_user(*, tenant_id: str, user_id: str) -> int:
    if not persistence_enabled():
        return 0
    now = datetime.now(timezone.utc)
    with db_session() as session:
        rows = (
            session.query(DashboardSessionKey)
            .filter(
                DashboardSessionKey.tenant_id == tenant_id,
                DashboardSessionKey.user_id == user_id,
                DashboardSessionKey.revoked_at.is_(None),
            )
            .all()
        )
        for row in rows:
            row.revoked_at = now
        return len(rows)
