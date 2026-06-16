from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import Tenant, TenantInvite, TenantMembership, User

logger = logging.getLogger(__name__)

WORKOS_API_BASE = "https://api.workos.com"
WEBHOOK_TOLERANCE_SEC = 300

ROLE_TO_WORKOS = {"admin": "admin", "operator": "member", "viewer": "member"}
WORKOS_TO_QTANGL = {"admin": "admin", "member": "operator"}


def workos_enabled() -> bool:
    return os.getenv("QTANGL_DASHBOARD_AUTH_WORKOS", "false").lower() in {"1", "true", "yes"}


def _api_key() -> str | None:
    return os.getenv("WORKOS_API_KEY")


def _client_id() -> str | None:
    return os.getenv("WORKOS_CLIENT_ID")


def _request(method: str, path: str, body: dict[str, Any] | None = None) -> dict[str, Any] | None:
    secret = _api_key()
    if not secret:
        return None
    url = f"{WORKOS_API_BASE}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        logger.warning("WorkOS %s %s failed: %s", method, path, exc.read().decode()[:300])
        return None
    except Exception as exc:
        logger.warning("WorkOS %s %s error: %s", method, path, exc)
        return None


def create_organization(*, tenant_id: str, name: str) -> str | None:
    """Create WorkOS org and persist workos_org_id on tenant."""
    if not workos_enabled() or not persistence_enabled():
        return None
    payload = {"name": name, "metadata": {"qtangl_tenant_id": tenant_id}}
    result = _request("POST", "/organizations", payload)
    if not result or not result.get("id"):
        return None
    org_id = str(result["id"])
    with db_session() as session:
        tenant = session.get(Tenant, tenant_id)
        if tenant is not None:
            tenant.workos_org_id = org_id
    return org_id


def invite_user(
    *,
    tenant_id: str,
    email: str,
    role: str = "operator",
    inviter_user_id: str | None = None,
) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        tenant = session.get(Tenant, tenant_id)
        if tenant is None or not tenant.workos_org_id:
            return None
        org_id = tenant.workos_org_id
    workos_role = ROLE_TO_WORKOS.get(role, "member")
    payload: dict[str, Any] = {
        "email": email,
        "organization_id": org_id,
        "role_slug": workos_role,
    }
    if inviter_user_id:
        payload["inviter_user_id"] = inviter_user_id
    result = _request("POST", "/user_management/invitations", payload)
    if not result:
        return None
    invite_id = result.get("id")
    expires_at = result.get("expires_at")
    row_id = f"inv-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        session.add(
            TenantInvite(
                id=row_id,
                tenant_id=tenant_id,
                email=email.lower(),
                role=role,
                workos_invite_id=str(invite_id) if invite_id else None,
                status="pending",
                expires_at=_parse_ts(expires_at),
            )
        )
    return {"inviteId": row_id, "workosInviteId": invite_id, "email": email, "role": role}


def get_admin_portal_link(*, tenant_id: str, return_url: str) -> str | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        tenant = session.get(Tenant, tenant_id)
        if tenant is None or not tenant.workos_org_id:
            return None
        org_id = tenant.workos_org_id
    client = _client_id()
    if not client:
        return None
    result = _request(
        "POST",
        "/portal/generate_link",
        {
            "organization": org_id,
            "intent": "sso",
            "return_url": return_url,
        },
    )
    if result and result.get("link"):
        return str(result["link"])
    return f"https://api.workos.com/portal/authorize?organization={org_id}&intent=sso"


def verify_webhook_signature(payload: bytes, signature_header: str) -> bool:
    secret = os.getenv("WORKOS_WEBHOOK_SECRET")
    if not secret or not signature_header:
        return False
    try:
        parts = dict(item.split("=", 1) for item in signature_header.split(",") if "=" in item)
        timestamp = parts.get("t", "")
        sig = parts.get("v1", "")
        if not timestamp or not sig:
            return False
        ts_int = int(timestamp)
        if abs(int(time.time()) - ts_int) > WEBHOOK_TOLERANCE_SEC:
            return False
        signed = f"{timestamp}.{payload.decode('utf-8')}".encode()
        expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig)
    except Exception:
        return False


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def upsert_user(*, workos_user_id: str, email: str, name: str | None = None) -> str:
    if not persistence_enabled():
        return workos_user_id
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.query(User).filter(User.workos_user_id == workos_user_id).one_or_none()
        if row is None:
            user_id = f"usr-{uuid.uuid4().hex[:12]}"
            session.add(
                User(
                    id=user_id,
                    workos_user_id=workos_user_id,
                    email=email.lower(),
                    name=name,
                    last_login_at=now,
                )
            )
            return user_id
        row.email = email.lower()
        if name:
            row.name = name
        row.last_login_at = now
        return row.id


def map_workos_role(role_slug: str | None) -> str:
    if not role_slug:
        return "operator"
    return WORKOS_TO_QTANGL.get(role_slug.lower(), "operator")


def sync_membership_from_webhook(data: dict[str, Any]) -> dict[str, Any] | None:
    """Upsert membership from WorkOS organization_membership.* events."""
    if not persistence_enabled():
        return None
    org_id = data.get("organization_id")
    workos_user_id = data.get("user_id")
    membership_id = data.get("id")
    role_slug = data.get("role", {}).get("slug") if isinstance(data.get("role"), dict) else data.get("role_slug")
    if not org_id or not workos_user_id:
        return None
    with db_session() as session:
        tenant = session.query(Tenant).filter(Tenant.workos_org_id == org_id).one_or_none()
        if tenant is None:
            return None
        user = session.query(User).filter(User.workos_user_id == workos_user_id).one_or_none()
        if user is None:
            return None
        role = map_workos_role(role_slug if isinstance(role_slug, str) else None)
        existing = (
            session.query(TenantMembership)
            .filter(TenantMembership.tenant_id == tenant.id, TenantMembership.user_id == user.id)
            .one_or_none()
        )
        if existing is None:
            mem_id = f"mem-{uuid.uuid4().hex[:12]}"
            session.add(
                TenantMembership(
                    id=mem_id,
                    tenant_id=tenant.id,
                    user_id=user.id,
                    role=role,
                    workos_membership_id=str(membership_id) if membership_id else None,
                )
            )
        else:
            existing.role = role
            if membership_id:
                existing.workos_membership_id = str(membership_id)
        return {
            "tenantId": tenant.id,
            "userId": user.id,
            "email": user.email,
            "role": role,
        }


def delete_membership_from_webhook(data: dict[str, Any]) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    membership_id = data.get("id")
    org_id = data.get("organization_id")
    workos_user_id = data.get("user_id")
    with db_session() as session:
        query = session.query(TenantMembership)
        if membership_id:
            row = query.filter(TenantMembership.workos_membership_id == str(membership_id)).one_or_none()
        elif org_id and workos_user_id:
            tenant = session.query(Tenant).filter(Tenant.workos_org_id == org_id).one_or_none()
            user = session.query(User).filter(User.workos_user_id == workos_user_id).one_or_none()
            if tenant is None or user is None:
                return None
            row = (
                query.filter(TenantMembership.tenant_id == tenant.id, TenantMembership.user_id == user.id)
                .one_or_none()
            )
        else:
            return None
        if row is None:
            return None
        payload = {"tenantId": row.tenant_id, "userId": row.user_id}
        session.delete(row)
        from app.auth_workos.session import revoke_session_keys_for_user

        revoke_session_keys_for_user(tenant_id=row.tenant_id, user_id=row.user_id)
        return payload


def handle_webhook_event(event: dict[str, Any]) -> dict[str, Any]:
    event_type = str(event.get("event", ""))
    data = event.get("data") or {}
    result: dict[str, Any] = {"event": event_type, "handled": False}

    if event_type == "user.created":
        user_id = data.get("id")
        email = data.get("email")
        if user_id and email:
            upsert_user(
                workos_user_id=str(user_id),
                email=str(email),
                name=(data.get("first_name") or "") + " " + (data.get("last_name") or ""),
            )
            result["handled"] = True
        return result

    if event_type in {"organization_membership.created", "organization_membership.updated"}:
        synced = sync_membership_from_webhook(data)
        result["handled"] = synced is not None
        if synced:
            result["membership"] = synced
        return result

    if event_type == "organization_membership.deleted":
        deleted = delete_membership_from_webhook(data)
        result["handled"] = deleted is not None
        if deleted:
            result["membership"] = deleted
        return result

    if event_type == "invitation.accepted":
        invite_id = data.get("id")
        email = data.get("email")
        org_id = data.get("organization_id")
        if invite_id and persistence_enabled():
            with db_session() as session:
                invite = (
                    session.query(TenantInvite)
                    .filter(TenantInvite.workos_invite_id == str(invite_id))
                    .one_or_none()
                )
                if invite:
                    invite.status = "accepted"
                if org_id and email:
                    tenant = session.query(Tenant).filter(Tenant.workos_org_id == org_id).one_or_none()
                    if tenant:
                        result["tenantId"] = tenant.id
        result["handled"] = True
        return result

    return result


def link_pending_invites_for_user(*, user_id: str, email: str) -> list[dict[str, Any]]:
    """Create tenant memberships from pending invites matching the user's email."""
    if not persistence_enabled():
        return []
    now = datetime.now(timezone.utc)
    linked: list[dict[str, Any]] = []
    with db_session() as session:
        invites = (
            session.query(TenantInvite)
            .filter(TenantInvite.email == email.lower(), TenantInvite.status == "pending")
            .all()
        )
        for invite in invites:
            if invite.expires_at and invite.expires_at < now:
                continue
            existing = (
                session.query(TenantMembership)
                .filter(
                    TenantMembership.tenant_id == invite.tenant_id,
                    TenantMembership.user_id == user_id,
                )
                .one_or_none()
            )
            if existing is not None:
                invite.status = "accepted"
                continue
            mem_id = f"mem-{uuid.uuid4().hex[:12]}"
            session.add(
                TenantMembership(
                    id=mem_id,
                    tenant_id=invite.tenant_id,
                    user_id=user_id,
                    role=invite.role,
                )
            )
            invite.status = "accepted"
            tenant = session.get(Tenant, invite.tenant_id)
            linked.append(
                {
                    "tenantId": invite.tenant_id,
                    "tenantName": tenant.name if tenant else invite.tenant_id,
                    "role": invite.role,
                    "membershipId": mem_id,
                }
            )
    return linked


def list_user_memberships(*, user_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(TenantMembership).filter(TenantMembership.user_id == user_id).all()
        out: list[dict[str, Any]] = []
        for row in rows:
            tenant = session.get(Tenant, row.tenant_id)
            user = session.get(User, row.user_id)
            out.append(
                {
                    "tenantId": row.tenant_id,
                    "tenantName": tenant.name if tenant else row.tenant_id,
                    "role": row.role,
                    "email": user.email if user else None,
                    "authMode": tenant.auth_mode if tenant else "magic_link",
                }
            )
        return out


def get_user_by_workos_id(workos_user_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.query(User).filter(User.workos_user_id == workos_user_id).one_or_none()
        if row is None:
            return None
        return {"userId": row.id, "email": row.email, "name": row.name, "workosUserId": row.workos_user_id}
