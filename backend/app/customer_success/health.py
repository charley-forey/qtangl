from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed
    except ValueError:
        return None


def _days_since(value: str | None) -> float | None:
    parsed = _parse_iso(value)
    if not parsed:
        return None
    return max(0.0, (datetime.now(timezone.utc) - parsed).total_seconds() / 86400.0)


def _scan_recency_score(*, last_scan_at: str | None) -> tuple[float, str]:
    days = _days_since(last_scan_at)
    if days is None:
        return 50.0, "no_scan"
    if days <= 30:
        return 100.0, "fresh"
    if days <= 60:
        return 50.0, "stale"
    return 0.0, "overdue"


def _critical_findings_score(*, open_critical: int) -> tuple[float, str]:
    if open_critical <= 5:
        return 100.0, "controlled"
    if open_critical <= 15:
        return 50.0, "elevated"
    return 0.0, "critical"


def _schedule_score(*, schedule_active: bool, has_scans: bool) -> tuple[float, str]:
    if schedule_active:
        return 100.0, "active"
    if has_scans:
        return 25.0, "missing"
    return 100.0, "not_applicable"


def _remediation_velocity_score(*, completion_rate_pct: float | None) -> tuple[float, str]:
    if completion_rate_pct is None:
        return 75.0, "unknown"
    if completion_rate_pct >= 20:
        return 100.0, "healthy"
    if completion_rate_pct >= 5:
        return 50.0, "slow"
    return 0.0, "stalled"


def _digest_score(*, weekly_digest_enabled: bool, role: str) -> tuple[float, str]:
    if weekly_digest_enabled:
        return 100.0, "enabled"
    if role in {"executive", "admin"}:
        return 40.0, "executive_missing"
    return 85.0, "optional"


def compute_customer_health(
    *,
    tenant_id: str,
    last_scan_at: str | None = None,
    open_critical: int = 0,
    schedule_active: bool = False,
    has_scans: bool = False,
    remediation_velocity: dict[str, Any] | None = None,
    role: str = "operator",
    settings: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Composite 0–100 customer health score for CS automation."""
    settings = settings or {}
    velocity = remediation_velocity or {}
    completion_rate = velocity.get("completionRatePct")
    completion_rate_pct = float(completion_rate) if completion_rate is not None else None

    signals = {
        "scanRecency": _scan_recency_score(last_scan_at=last_scan_at),
        "openCritical": _critical_findings_score(open_critical=open_critical),
        "scheduleActive": _schedule_score(schedule_active=schedule_active, has_scans=has_scans),
        "remediationVelocity": _remediation_velocity_score(completion_rate_pct=completion_rate_pct),
        "digestEngagement": _digest_score(
            weekly_digest_enabled=bool(settings.get("weeklyDigestEnabled")),
            role=role,
        ),
    }
    weights = {
        "scanRecency": 0.25,
        "openCritical": 0.25,
        "scheduleActive": 0.20,
        "remediationVelocity": 0.15,
        "digestEngagement": 0.15,
    }
    score = round(sum(signals[key][0] * weights[key] for key in weights), 1)
    if score >= 75:
        band = "green"
    elif score >= 50:
        band = "yellow"
    else:
        band = "red"

    return {
        "score": score,
        "band": band,
        "tenantId": tenant_id,
        "signals": {
            key: {"score": round(signals[key][0], 1), "status": signals[key][1]}
            for key in signals
        },
    }
