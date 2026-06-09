from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import HostFinding
from app.tenant.settings import get_tenant_settings_raw


def purge_stale_host_findings(*, tenant_id: str | None = None) -> int:
    if not persistence_enabled():
        return 0
    ttl_days = 90
    if tenant_id:
        settings = get_tenant_settings_raw(tenant_id=tenant_id)
        ttl_days = int(settings.get("discoveryRetentionDays", 90))
    cutoff = datetime.now(timezone.utc) - timedelta(days=ttl_days)
    with db_session() as session:
        q = session.query(HostFinding).filter(HostFinding.ingested_at < cutoff)
        if tenant_id:
            q = q.filter(HostFinding.tenant_id == tenant_id)
        count = q.delete()
        session.flush()
        return count


def purge_stale_clone_artifacts(*, tenant_id: str | None = None, ttl_days: int = 7) -> int:
    """Remove ephemeral repo clone directories from code scan jobs."""
    import shutil
    from pathlib import Path

    base = Path(__file__).resolve().parents[2] / "tmp" / "code-clones"
    if not base.exists():
        return 0
    cutoff = datetime.now(timezone.utc) - timedelta(days=ttl_days)
    removed = 0
    for path in base.iterdir():
        if not path.is_dir():
            continue
        if tenant_id and not path.name.startswith(tenant_id):
            continue
        mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
        if mtime < cutoff:
            shutil.rmtree(path, ignore_errors=True)
            removed += 1
    return removed
