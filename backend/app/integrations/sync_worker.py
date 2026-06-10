from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationExternalSync as SyncRow
from app.integrations.service import _pull_jira_status
from app.remediation.program import update_program_item
from app.remediation.verify import map_external_status

logger = logging.getLogger(__name__)

_MAX_RETRIES = 5


def _pull_servicenow_status(tenant_id: str, external_ref: str, table: str = "incident") -> str | None:
    if not persistence_enabled():
        return None
    from app.db.models import TenantIntegration as IntegrationRow
    from app.security.secrets import decrypt_config
    import base64
    import json
    import urllib.request

    with db_session() as session:
        row = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == "servicenow")
            .one_or_none()
        )
        if row is None:
            return None
        config = decrypt_config(row.config_json or "{}")
    instance = config.get("instanceUrl", "").rstrip("/")
    user = config.get("username", "")
    password = config.get("password", "")
    if not instance or not user or not external_ref:
        return None
    auth = base64.b64encode(f"{user}:{password}".encode()).decode()
    request = urllib.request.Request(
        f"{instance}/api/now/table/{table}/{external_ref}?sysparm_fields=state",
        headers={"Authorization": f"Basic {auth}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = json.loads(response.read().decode("utf-8"))
            result = data.get("result") or {}
            return str(result.get("state", "unknown"))
    except Exception:
        return None


def poll_open_sync_rows(*, limit: int = 100) -> dict[str, Any]:
    if not persistence_enabled():
        return {"polled": 0, "updated": 0}
    updated = 0
    now = datetime.now(timezone.utc)
    with db_session() as session:
        rows = (
            session.query(SyncRow)
            .filter(SyncRow.retry_count < _MAX_RETRIES)
            .order_by(SyncRow.updated_at.asc())
            .limit(limit)
            .all()
        )
        for row in rows:
            try:
                status = None
                if row.provider == "jira":
                    status = _pull_jira_status(row.tenant_id, row.external_ref)
                elif row.provider == "servicenow":
                    status = _pull_servicenow_status(row.tenant_id, row.external_ref)
                if not status:
                    row.retry_count += 1
                    row.sync_error = "pull_failed"
                    continue
                mapped = map_external_status(row.provider, status)
                if row.external_status != status:
                    row.external_status = status
                    row.synced_at = now
                    if row.program_item_id:
                        update_program_item(
                            tenant_id=row.tenant_id,
                            item_id=row.program_item_id,
                            status=mapped,
                            actor="itsm_sync",
                        )
                    updated += 1
                row.sync_error = None
            except Exception as exc:
                row.retry_count += 1
                row.sync_error = str(exc)[:500]
                try:
                    from app.monitoring.metrics import increment_remediation_sync_failure

                    increment_remediation_sync_failure(provider=row.provider)
                except Exception:
                    pass
        session.flush()
    try:
        from app.monitoring.metrics import set_remediation_sync_lag

        set_remediation_sync_lag(provider="all", seconds=300.0)
    except Exception:
        pass
    return {"polled": len(rows), "updated": updated}


def itsm_sync_enabled() -> bool:
    return os.environ.get("QTANGL_ENABLE_ITSM_SYNC", "true").lower() in ("1", "true", "yes")
