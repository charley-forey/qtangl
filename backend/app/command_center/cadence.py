"""Smart scan cadence recommendation from drift volatility."""

from __future__ import annotations

from app.command_center.schemas import CadenceRecommendation
from app.monitoring.drift_snapshots import list_snapshots_for_tenant


def recommend_cadence(*, tenant_id: str, current_cadence_hours: int | None = None) -> CadenceRecommendation:
    snapshots = list_snapshots_for_tenant(tenant_id=tenant_id, limit=12)
    if len(snapshots) < 2:
        return CadenceRecommendation(
            currentCadenceHours=current_cadence_hours,
            recommendedCadenceHours=current_cadence_hours or 168,
            volatilityScore=0.0,
            rationale="Insufficient drift history — keep your current weekly cadence until more snapshots exist.",
            assumptions=["Requires at least two drift snapshots."],
        )

    changes = [float(s.get("changeCount") or 0) for s in snapshots]
    avg = sum(changes) / len(changes)
    variance = sum((c - avg) ** 2 for c in changes) / max(1, len(changes) - 1)
    volatility = min(100.0, (variance ** 0.5) * 10)

    base = current_cadence_hours or 168
    if volatility >= 40:
        recommended = max(24, int(base * 0.5))
        rationale = "High drift volatility — consider scanning more frequently."
    elif volatility >= 15:
        recommended = max(48, int(base * 0.75))
        rationale = "Moderate drift — a modest cadence increase may catch regressions sooner."
    else:
        recommended = min(336, int(base * 1.25))
        rationale = "Low drift volatility — you may safely extend cadence slightly."

    return CadenceRecommendation(
        currentCadenceHours=current_cadence_hours,
        recommendedCadenceHours=recommended,
        volatilityScore=round(volatility, 1),
        rationale=rationale,
        assumptions=["Based on change counts between scheduled assessments only."],
    )
