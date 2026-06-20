"""One-time onboarding API key retrieval tokens (24h TTL, single use)."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.security.secrets import encrypt_json_blob, decrypt_json_blob

_memory_tokens: dict[str, dict[str, Any]] = {}

DEFAULT_TTL_HOURS = 24


def _as_utc_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def create_onboarding_token(*, tenant_id: str, api_key: str, email: str) -> dict[str, Any]:
    """Issue a single-use token; returns raw token for URL (not stored plaintext)."""
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=DEFAULT_TTL_HOURS)
    payload = encrypt_json_blob({"apiKey": api_key, "email": email})

    if persistence_enabled():
        from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

        row_id = f"obt-{uuid.uuid4().hex[:12]}"
        with db_session() as session:
            session.add(
                OnboardingKeyTokenRow(
                    id=row_id,
                    tenant_id=tenant_id,
                    token_hash=token_hash,
                    payload_encrypted=payload,
                    expires_at=expires_at,
                )
            )
    else:
        _memory_tokens[token_hash] = {
            "tenantId": tenant_id,
            "payload": payload,
            "expiresAt": expires_at,
            "redeemed": False,
        }

    return {"token": token, "expiresAt": expires_at.isoformat()}


def peek_onboarding_token(token: str) -> dict[str, Any] | None:
    """Return api key without marking token redeemed (assess-first path)."""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    if persistence_enabled():
        from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

        with db_session() as session:
            row = (
                session.query(OnboardingKeyTokenRow)
                .filter(OnboardingKeyTokenRow.token_hash == token_hash)
                .one_or_none()
            )
            if row is None or row.redeemed_at is not None or _as_utc_aware(row.expires_at) < now:
                return None
            data = decrypt_json_blob(row.payload_encrypted)
            return {
                "tenantId": row.tenant_id,
                "apiKey": data.get("apiKey"),
                "email": data.get("email"),
                "tokenHash": token_hash,
            }

    entry = _memory_tokens.get(token_hash)
    if entry is None or entry.get("redeemed") or entry["expiresAt"] < now:
        return None
    data = decrypt_json_blob(entry["payload"])
    return {
        "tenantId": entry["tenantId"],
        "apiKey": data.get("apiKey"),
        "email": data.get("email"),
        "tokenHash": token_hash,
    }


def redeem_onboarding_token(token: str) -> dict[str, Any] | None:
    """Return api key once; mark token redeemed."""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    if persistence_enabled():
        from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

        with db_session() as session:
            row = (
                session.query(OnboardingKeyTokenRow)
                .filter(OnboardingKeyTokenRow.token_hash == token_hash)
                .one_or_none()
            )
            if row is None or row.redeemed_at is not None or _as_utc_aware(row.expires_at) < now:
                return None
            data = decrypt_json_blob(row.payload_encrypted)
            row.redeemed_at = now
            return {
                "tenantId": row.tenant_id,
                "apiKey": data.get("apiKey"),
                "email": data.get("email"),
            }

    entry = _memory_tokens.get(token_hash)
    if entry is None or entry.get("redeemed") or entry["expiresAt"] < now:
        return None
    entry["redeemed"] = True
    data = decrypt_json_blob(entry["payload"])
    return {"tenantId": entry["tenantId"], "apiKey": data.get("apiKey"), "email": data.get("email")}


def resolve_onboarding_token(*, token: str, email: str) -> dict[str, Any] | None:
    """Validate onboarding token for dashboard membership linking (does not redeem)."""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = datetime.now(timezone.utc)
    email_l = email.lower().strip()

    if persistence_enabled():
        from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

        with db_session() as session:
            row = (
                session.query(OnboardingKeyTokenRow)
                .filter(OnboardingKeyTokenRow.token_hash == token_hash)
                .one_or_none()
            )
            if row is None or row.redeemed_at is not None or _as_utc_aware(row.expires_at) < now:
                return None
            data = decrypt_json_blob(row.payload_encrypted)
            token_email = str(data.get("email") or "").lower().strip()
            if token_email and token_email != email_l:
                return None
            return {"tenantId": row.tenant_id, "email": token_email or email_l, "tokenHash": token_hash}

    entry = _memory_tokens.get(token_hash)
    if entry is None or entry.get("redeemed") or entry["expiresAt"] < now:
        return None
    data = decrypt_json_blob(entry["payload"])
    token_email = str(data.get("email") or "").lower().strip()
    if token_email and token_email != email_l:
        return None
    return {"tenantId": entry["tenantId"], "email": token_email or email_l, "tokenHash": token_hash}


def mark_onboarding_token_linked(*, token_hash: str) -> None:
    """Mark onboarding token redeemed after dashboard membership is linked."""
    now = datetime.now(timezone.utc)
    if persistence_enabled():
        from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

        with db_session() as session:
            row = (
                session.query(OnboardingKeyTokenRow)
                .filter(OnboardingKeyTokenRow.token_hash == token_hash)
                .one_or_none()
            )
            if row is not None and row.redeemed_at is None:
                row.redeemed_at = now
        return
    entry = _memory_tokens.get(token_hash)
    if entry is not None:
        entry["redeemed"] = True


def find_onboarding_tenant_for_email(*, email: str) -> str | None:
    """Return tenant id from the newest unredeemed onboarding token for this email."""
    if not persistence_enabled():
        return None
    from app.db.models import OnboardingKeyToken as OnboardingKeyTokenRow

    email_l = email.lower().strip()
    now = datetime.now(timezone.utc)
    with db_session() as session:
        rows = (
            session.query(OnboardingKeyTokenRow)
            .filter(OnboardingKeyTokenRow.redeemed_at.is_(None))
            .order_by(OnboardingKeyTokenRow.created_at.desc())
            .all()
        )
        for row in rows:
            if _as_utc_aware(row.expires_at) < now:
                continue
            data = decrypt_json_blob(row.payload_encrypted)
            token_email = str(data.get("email") or "").lower().strip()
            if token_email == email_l:
                return row.tenant_id
    return None
