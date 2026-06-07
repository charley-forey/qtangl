from __future__ import annotations

import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ShareLink as ShareLinkRow
from app.db.models import ShareLinkView

VALID_PASSPORT_SCOPES = {"report", "bundle", "passport"}


def create_share_link(
    *,
    tenant_id: str,
    scan_id: str,
    expires_hours: int = 168,
    label: str = "",
    scope: str = "report",
) -> dict[str, Any]:
    normalized_scope = scope if scope in VALID_PASSPORT_SCOPES else "report"
    if not persistence_enabled():
        token = secrets.token_urlsafe(32)
        return {
            "token": token,
            "url": f"/r/{token}",
            "scope": normalized_scope,
            "label": label,
            "expiresAt": (datetime.now(timezone.utc) + timedelta(hours=expires_hours)).isoformat(),
        }
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    link_id = f"share-{uuid.uuid4()}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    with db_session() as session:
        session.add(
            ShareLinkRow(
                id=link_id,
                tenant_id=tenant_id,
                scan_id=scan_id,
                token_hash=token_hash,
                label=label or "",
                scope=normalized_scope,
                view_count=0,
                expires_at=expires_at,
            )
        )
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    return {
        "id": link_id,
        "token": token,
        "url": f"{base}/r/{token}",
        "scope": normalized_scope,
        "label": label or "",
        "expiresAt": expires_at.isoformat(),
    }


def resolve_share_token(token: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with db_session() as session:
        row = (
            session.query(ShareLinkRow)
            .filter(ShareLinkRow.token_hash == token_hash, ShareLinkRow.revoked_at.is_(None))
            .one_or_none()
        )
        if row is None or row.expires_at < datetime.now(timezone.utc):
            return None
        return {
            "tenantId": row.tenant_id,
            "scanId": row.scan_id,
            "linkId": row.id,
            "label": row.label,
            "scope": row.scope,
        }


def record_share_view(
    *,
    link_id: str,
    tenant_id: str,
    viewer_ip: str = "",
    user_agent: str = "",
) -> None:
    if not persistence_enabled():
        return
    ip_hash = hashlib.sha256(viewer_ip.encode()).hexdigest()[:32] if viewer_ip else ""
    with db_session() as session:
        row = session.get(ShareLinkRow, link_id)
        if row is None:
            return
        row.view_count = int(row.view_count or 0) + 1
        session.add(
            ShareLinkView(
                id=f"view-{uuid.uuid4()}",
                link_id=link_id,
                tenant_id=tenant_id,
                viewer_ip_hash=ip_hash,
                user_agent=(user_agent or "")[:512],
            )
        )


def list_share_links(*, tenant_id: str, scan_id: str | None = None) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        query = session.query(ShareLinkRow).filter(ShareLinkRow.tenant_id == tenant_id)
        if scan_id:
            query = query.filter(ShareLinkRow.scan_id == scan_id)
        rows = query.order_by(ShareLinkRow.created_at.desc()).limit(50).all()
        return [
            {
                "id": row.id,
                "scanId": row.scan_id,
                "label": row.label,
                "scope": row.scope,
                "viewCount": row.view_count,
                "expiresAt": row.expires_at.isoformat() if row.expires_at else None,
                "revokedAt": row.revoked_at.isoformat() if row.revoked_at else None,
            }
            for row in rows
        ]


def revoke_share_link(*, tenant_id: str, link_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.get(ShareLinkRow, link_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        row.revoked_at = datetime.now(timezone.utc)
        return True
