"""Assignment inbox aggregation."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.command_center.schemas import InboxItem, InboxResponse
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationProgramItem, TenantAlert
from app.remediation.program import list_program_items
from app.store.scan_jobs import list_jobs_for_tenant


def _overdue(target: str | None) -> bool:
    if not target:
        return False
    try:
        dt = datetime.fromisoformat(target.replace("Z", "+00:00"))
        return dt < datetime.now(timezone.utc)
    except ValueError:
        return False


def build_inbox(*, tenant_id: str, owner: str, limit: int = 50) -> InboxResponse:
    items: list[InboxItem] = []

    program_items, _ = list_program_items(tenant_id=tenant_id, limit=200)
    for row in program_items:
        if (row.get("owner") or "").lower() != owner.lower():
            continue
        items.append(
            InboxItem(
                id=row["id"],
                kind="remediation",
                title=row.get("title") or row.get("remediationId") or "Remediation item",
                status=row.get("status"),
                owner=row.get("owner"),
                dueAt=row.get("targetDate"),
                deepLink=row.get("deepLink"),
                severity="high" if _overdue(row.get("targetDate")) else None,
            )
        )

    if persistence_enabled():
        with db_session() as session:
            alerts = (
                session.query(TenantAlert)
                .filter(TenantAlert.tenant_id == tenant_id, TenantAlert.resolved_at.is_(None))
                .order_by(TenantAlert.fired_at.desc())
                .limit(100)
                .all()
            )
            for alert in alerts:
                assignee = alert.rule or alert.source
                if str(assignee).lower() != owner.lower() and owner.lower() not in (alert.message or "").lower():
                    continue
                items.append(
                    InboxItem(
                        id=alert.id,
                        kind="alert",
                        title=alert.message[:80],
                        status=alert.severity,
                        owner=assignee,
                        deepLink=f"/command-center?tab=monitor&alert={alert.id}",
                        severity=alert.severity,
                    )
                )

    jobs = list_jobs_for_tenant(tenant_id=tenant_id, limit=20)
    for job in jobs:
        if job.get("status") not in {"queued", "running"}:
            continue
        actor = job.get("actorEmail") or ""
        if owner.lower() not in actor.lower():
            continue
        items.append(
            InboxItem(
                id=job["scanId"],
                kind="scan",
                title=f"Scan {job.get('targetDomain') or job['scanId']}",
                status=job.get("status"),
                owner=actor or None,
                deepLink=f"/command-center?tab=scans&scan={job['scanId']}",
            )
        )

    items = items[:limit]
    return InboxResponse(owner=owner, items=items, total=len(items))
