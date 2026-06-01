from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import TenantSettings as TenantSettingsRow

DEFAULT_SETTINGS: dict[str, Any] = {
    "readinessDropThreshold": 5.0,
    "alertOnNewQuantumVulnerable": True,
    "certExpiryDays": 30,
    "webhookSigningSecret": "",
}


def get_tenant_settings(*, tenant_id: str) -> dict[str, Any]:
    if not persistence_enabled():
        return dict(DEFAULT_SETTINGS)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            return dict(DEFAULT_SETTINGS)
        data = json.loads(row.settings_json or "{}")
        merged = dict(DEFAULT_SETTINGS)
        merged.update(data)
        return merged


def upsert_tenant_settings(*, tenant_id: str, settings: dict[str, Any]) -> dict[str, Any]:
    if not persistence_enabled():
        return settings
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            row = TenantSettingsRow(tenant_id=tenant_id, settings_json=json.dumps(settings), updated_at=now)
            session.add(row)
        else:
            row.settings_json = json.dumps(settings)
            row.updated_at = now
        session.flush()
        return json.loads(row.settings_json)
