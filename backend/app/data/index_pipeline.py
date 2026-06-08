"""K-anonymized Readiness Index aggregation pipeline."""

from __future__ import annotations

import os
import statistics
import uuid
from datetime import datetime, timezone
from typing import Any


def _min_cohort() -> int:
    return int(os.getenv("QTANGL_INDEX_MIN_COHORT", "10"))


def _index_enabled() -> bool:
    return os.getenv("QTANGL_INDEX_ENABLED", "true").lower() in {"1", "true", "yes"}


def _size_band(asset_count: int) -> str:
    if asset_count < 50:
        return "s"
    if asset_count < 200:
        return "m"
    if asset_count < 1000:
        return "l"
    return "xl"


def collect_opt_in_scores() -> dict[str, list[float]]:
    """Gather readiness scores from opted-in tenants grouped by industry."""
    grouped: dict[str, list[float]] = {}
    try:
        from app.db.engine import db_session
        from app.db.models import TenantSettings, ScanJob
        from app.security.secrets import decrypt_json_blob
    except Exception:
        return grouped

    try:
        with db_session() as session:
            settings_rows = session.query(TenantSettings).all()
            for row in settings_rows:
                data = decrypt_json_blob(row.settings_json or "{}")
                if not data.get("benchmarkOptIn"):
                    continue
                industry = str(data.get("industry") or "general")
                job = (
                    session.query(ScanJob)
                    .filter(ScanJob.tenant_id == row.tenant_id, ScanJob.status == "done")
                    .order_by(ScanJob.updated_at.desc())
                    .first()
                )
                if job is None or job.readiness_score is None:
                    continue
                grouped.setdefault(industry, []).append(float(job.readiness_score))
    except Exception:
        pass
    return grouped


def aggregate_cohort(*, industry: str, scores: list[float], cohort_key: str = "all") -> dict[str, Any] | None:
    if len(scores) < _min_cohort():
        return None
    scores_sorted = sorted(scores)
    n = len(scores_sorted)
    p25_idx = max(0, int(n * 0.25) - 1)
    p75_idx = min(n - 1, int(n * 0.75))
    return {
        "industry": industry,
        "cohortKey": cohort_key,
        "sampleSize": n,
        "medianReadiness": round(statistics.median(scores_sorted), 1),
        "p25": round(scores_sorted[p25_idx], 1),
        "p75": round(scores_sorted[p75_idx], 1),
        "asOf": datetime.now(timezone.utc).strftime("%Y-%m"),
    }


def persist_aggregate(agg: dict[str, Any]) -> None:
    try:
        from app.db.engine import db_session
        from app.db.models import BenchmarkAggregate
    except Exception:
        return

    now = datetime.now(timezone.utc)
    as_of = now.strftime("%Y-%m")
    with db_session() as session:
        session.add(
            BenchmarkAggregate(
                id=f"bench-{uuid.uuid4().hex[:16]}",
                industry=str(agg["industry"]),
                cohort_key=str(agg.get("cohortKey") or "all"),
                sample_size=int(agg["sampleSize"]),
                median_readiness=float(agg["medianReadiness"]),
                p25=float(agg["p25"]),
                p75=float(agg["p75"]),
                as_of=as_of,
                created_at=now,
            )
        )


def run_index_pipeline() -> dict[str, Any]:
    """Daily worker job: aggregate opt-in tenant scores."""
    if not _index_enabled():
        return {"status": "disabled"}

    grouped = collect_opt_in_scores()
    published = 0
    skipped = 0
    for industry, scores in grouped.items():
        agg = aggregate_cohort(industry=industry, scores=scores)
        if agg:
            persist_aggregate(agg)
            published += 1
        else:
            skipped += 1

    return {"status": "ok", "published": published, "skipped": skipped, "industries": list(grouped.keys())}
