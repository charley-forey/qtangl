"""Cross-tenant predictive drift intelligence (opt-in cohorts)."""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.monitoring.anomaly import detect_readiness_anomalies, forecast_readiness


def _min_cohort() -> int:
    return int(os.getenv("QTANGL_INDEX_MIN_COHORT", "10"))


def aggregate_drift_patterns(*, industry: str, score_series: list[list[float]]) -> dict[str, Any] | None:
    if len(score_series) < _min_cohort():
        return None

    drop_counts = 0
    forecasts: list[float] = []
    for series in score_series:
        alerts = detect_readiness_anomalies(scores=series)
        if alerts:
            drop_counts += 1
        fc = forecast_readiness(scores=series)
        if fc.get("projected") is not None:
            forecasts.append(float(fc["projected"]))

    avg_projected = sum(forecasts) / len(forecasts) if forecasts else None
    return {
        "industry": industry,
        "cohortKey": "all",
        "patternType": "readiness_drift",
        "sampleSize": len(score_series),
        "dropRate": round(drop_counts / len(score_series), 2),
        "avgProjectedReadiness": round(avg_projected, 1) if avg_projected is not None else None,
        "asOf": datetime.now(timezone.utc).strftime("%Y-%m"),
    }


def persist_drift_aggregate(agg: dict[str, Any]) -> None:
    try:
        from app.db.engine import db_session
        from app.db.models import DriftAggregate
    except Exception:
        return

    metric = {k: v for k, v in agg.items() if k not in {"industry", "cohortKey", "patternType", "asOf"}}
    with db_session() as session:
        session.add(
            DriftAggregate(
                id=f"drift-{uuid.uuid4().hex[:16]}",
                industry=str(agg["industry"]),
                cohort_key=str(agg.get("cohortKey") or "all"),
                pattern_type=str(agg.get("patternType") or "readiness_drift"),
                sample_size=int(agg.get("sampleSize") or 0),
                metric_json=json.dumps(metric),
                as_of=str(agg.get("asOf") or ""),
                created_at=datetime.now(timezone.utc),
            )
        )


def run_drift_intel_pipeline() -> dict[str, Any]:
    """Daily job: aggregate drift patterns from opted-in tenants."""
    from app.data.index_pipeline import collect_opt_in_scores

    grouped = collect_opt_in_scores()
    published = 0
    for industry, scores in grouped.items():
        # Treat each score as a single-point series for cohort-level pattern
        series = [[s] for s in scores]
        agg = aggregate_drift_patterns(industry=industry, score_series=series)
        if agg:
            persist_drift_aggregate(agg)
            published += 1
    return {"status": "ok", "published": published}


def latest_drift_snapshot(*, industry: str) -> dict[str, Any]:
    """Return latest cohort drift aggregate or unavailable reason."""
    try:
        from app.db.engine import db_session
        from app.db.models import DriftAggregate
    except Exception:
        return {"available": False, "reason": "persistence_unavailable"}

    try:
        with db_session() as session:
            row = (
                session.query(DriftAggregate)
                .filter(DriftAggregate.industry == industry)
                .order_by(DriftAggregate.created_at.desc())
                .first()
            )
            if row is None:
                return {"available": False, "reason": "insufficient_cohort"}
            if row.sample_size < _min_cohort():
                return {"available": False, "reason": "insufficient_cohort", "sampleSize": row.sample_size}
            metric = json.loads(row.metric_json or "{}")
            return {
                "available": True,
                "industry": row.industry,
                "sampleSize": row.sample_size,
                "patternType": row.pattern_type,
                "asOf": row.as_of,
                **metric,
            }
    except RuntimeError:
        return {"available": False, "reason": "persistence_unavailable"}
