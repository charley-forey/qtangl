from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


MATURITY_STAGES: list[dict[str, Any]] = [
    {"stage": 0, "name": "Unaware", "tier": "Content / free mini-assess"},
    {"stage": 1, "name": "Inventory", "tier": "Assess"},
    {"stage": 2, "name": "Prioritized", "tier": "Assess + workshop"},
    {"stage": 3, "name": "Monitored", "tier": "Monitor"},
    {"stage": 4, "name": "Converting", "tier": "Convert"},
    {"stage": 5, "name": "Agile", "tier": "Enterprise"},
    {"stage": 6, "name": "Optimizing", "tier": "Optimize"},
]


def compute_maturity_stage(*, tenant_id: str) -> dict[str, Any]:
    """Derive crypto-agility maturity stage 0–6 from tenant signals."""
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import RemediationStatus as RemediationStatusRow
    from app.db.models import ScheduledScan
    from app.monitoring.drift_snapshots import list_snapshots_for_tenant
    from app.store.scan_jobs import list_jobs_for_tenant
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
    done_scans = [s for s in scans if s.get("status") == "done"]
    if not done_scans:
        return _stage_payload(0, next_stage=1)

    latest = done_scans[0]
    readiness = float(latest.get("readinessScore") or 0)

    has_owner = False
    has_verify = False
    if persistence_enabled():
        with db_session() as session:
            owned = (
                session.query(RemediationStatusRow)
                .filter(
                    RemediationStatusRow.tenant_id == tenant_id,
                    RemediationStatusRow.owner.isnot(None),
                    RemediationStatusRow.owner != "",
                )
                .count()
            )
            has_owner = owned > 0
            verified = (
                session.query(RemediationStatusRow)
                .filter(
                    RemediationStatusRow.tenant_id == tenant_id,
                    RemediationStatusRow.verify_scan_id.isnot(None),
                )
                .count()
            )
            has_verify = verified > 0
            in_progress = (
                session.query(RemediationStatusRow)
                .filter(
                    RemediationStatusRow.tenant_id == tenant_id,
                    RemediationStatusRow.status == "in_progress",
                )
                .count()
            )
            has_in_progress = in_progress > 0
            active_schedules = (
                session.query(ScheduledScan)
                .filter(ScheduledScan.tenant_id == tenant_id, ScheduledScan.active.is_(True))
                .count()
            )
    else:
        has_in_progress = False
        active_schedules = 0

    has_schedule = active_schedules > 0

    recent_drift = False
    try:
        since = datetime.now(timezone.utc) - timedelta(days=30)
        snaps = list_snapshots_for_tenant(tenant_id=tenant_id, since=since, limit=1)
        recent_drift = len(snaps) > 0
    except Exception:
        recent_drift = has_schedule

    peer_leading = False
    if settings.get("benchmarkOptIn"):
        try:
            from app.data.benchmarks import compare_to_benchmark

            peer = compare_to_benchmark(score=readiness, industry=str(settings.get("industry") or "financial"))
            if peer.get("available"):
                band = str(peer.get("band", "")).lower()
                peer_leading = band in {"leading", "above_median", "top_quartile"}
        except Exception:
            pass

    if readiness >= 80 and has_schedule:
        if settings.get("benchmarkOptIn") and peer_leading:
            return _stage_payload(6, next_stage=None)
        return _stage_payload(5, next_stage=6)

    if has_verify or has_in_progress:
        return _stage_payload(4, next_stage=5)

    if has_schedule or recent_drift:
        return _stage_payload(3, next_stage=4)

    if has_owner:
        return _stage_payload(2, next_stage=3)

    return _stage_payload(1, next_stage=2)


def _stage_payload(stage: int, *, next_stage: int | None) -> dict[str, Any]:
    current = MATURITY_STAGES[stage]
    nxt = MATURITY_STAGES[next_stage] if next_stage is not None else None
    return {
        "stage": stage,
        "name": current["name"],
        "tier": current["tier"],
        "nextStage": next_stage,
        "nextStageName": nxt["name"] if nxt else None,
        "nextStageTier": nxt["tier"] if nxt else None,
        "progressPct": round(100 * stage / 6, 1),
    }
