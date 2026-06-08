from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import TenantSettings as TenantSettingsRow
from app.security.secrets import decrypt_json_blob, encrypt_json_blob

DEFAULT_SETTINGS: dict[str, Any] = {
    "readinessDropThreshold": 5.0,
    "alertOnNewQuantumVulnerable": True,
    "certExpiryDays": 30,
    "webhookSigningSecret": "",
    "autoRetainScans": False,
    "evidenceRetentionMonths": 12,
    "benchmarkOptIn": False,
    "industry": "financial",
}


def get_tenant_settings(*, tenant_id: str) -> dict[str, Any]:
    if not persistence_enabled():
        return dict(DEFAULT_SETTINGS)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            return dict(DEFAULT_SETTINGS)
        data = decrypt_json_blob(row.settings_json or "{}")
        merged = dict(DEFAULT_SETTINGS)
        merged.update(data)
        if merged.get("webhookSigningSecret"):
            merged["webhookSigningSecret"] = "***"
        return merged


def upsert_tenant_settings(*, tenant_id: str, settings: dict[str, Any]) -> dict[str, Any]:
    if not persistence_enabled():
        return settings
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        existing = dict(DEFAULT_SETTINGS)
        if row is not None:
            existing.update(decrypt_json_blob(row.settings_json or "{}"))
        merged = dict(existing)
        for key, value in settings.items():
            if key == "webhookSigningSecret" and value in ("", "***"):
                continue
            merged[key] = value
        stored = encrypt_json_blob(merged)
        if row is None:
            row = TenantSettingsRow(tenant_id=tenant_id, settings_json=stored, updated_at=now)
            session.add(row)
        else:
            row.settings_json = stored
            row.updated_at = now
        session.flush()
        response = dict(merged)
        if response.get("webhookSigningSecret"):
            response["webhookSigningSecret"] = "***"
        return response


def get_tenant_settings_raw(*, tenant_id: str) -> dict[str, Any]:
    """Internal use — includes decrypted webhook signing secret."""
    if not persistence_enabled():
        return dict(DEFAULT_SETTINGS)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            return dict(DEFAULT_SETTINGS)
        data = decrypt_json_blob(row.settings_json or "{}")
        merged = dict(DEFAULT_SETTINGS)
        merged.update(data)
        return merged
