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


def create_share_link(
    *,
    tenant_id: str,
    scan_id: str,
    expires_hours: int = 168,
) -> dict[str, Any]:
    if not persistence_enabled():
        token = secrets.token_urlsafe(32)
        return {
            "token": token,
            "url": f"/r/{token}",
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
                expires_at=expires_at,
            )
        )
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    return {
        "id": link_id,
        "token": token,
        "url": f"{base}/r/{token}",
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
        return {"tenantId": row.tenant_id, "scanId": row.scan_id}


def revoke_share_link(*, tenant_id: str, link_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.get(ShareLinkRow, link_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        row.revoked_at = datetime.now(timezone.utc)
        return True
