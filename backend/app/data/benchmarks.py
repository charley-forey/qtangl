"""Anonymized readiness benchmarks and Readiness Index."""

from __future__ import annotations

import os
from typing import Any


def _min_cohort() -> int:
    return int(os.getenv("QTANGL_INDEX_MIN_COHORT", "10"))


def _index_enabled() -> bool:
    return os.getenv("QTANGL_INDEX_ENABLED", "true").lower() in {"1", "true", "yes"}


def _fetch_aggregate(*, industry: str, cohort_key: str = "all") -> dict[str, Any] | None:
    try:
        from app.db.engine import db_session
        from app.db.models import BenchmarkAggregate
    except Exception:
        return None

    try:
        with db_session() as session:
            row = (
                session.query(BenchmarkAggregate)
                .filter(
                    BenchmarkAggregate.industry == industry,
                    BenchmarkAggregate.cohort_key == cohort_key,
                )
                .order_by(BenchmarkAggregate.created_at.desc())
                .first()
            )
            if row is None:
                return None
            return {
                "industry": row.industry,
                "cohortKey": row.cohort_key,
                "medianReadiness": row.median_readiness,
                "p25": row.p25,
                "p75": row.p75,
                "sampleSize": row.sample_size,
                "asOf": row.as_of,
            }
    except Exception:
        return None


def readiness_index_snapshot(*, industry: str = "financial") -> dict[str, Any]:
    if not _index_enabled():
        return {
            "available": False,
            "reason": "index_disabled",
            "industry": industry,
        }

    agg = _fetch_aggregate(industry=industry)
    if agg is None or int(agg.get("sampleSize") or 0) < _min_cohort():
        return {
            "available": False,
            "reason": "insufficient_cohort",
            "industry": industry,
            "minCohort": _min_cohort(),
        }

    return {
        "available": True,
        "industry": industry,
        "medianReadiness": agg["medianReadiness"],
        "p25": agg["p25"],
        "p75": agg["p75"],
        "sampleSize": agg["sampleSize"],
        "asOf": agg["asOf"],
        "disclaimer": "Anonymized aggregate from opted-in tenants; not attestation.",
    }


def compare_to_benchmark(*, score: float, industry: str = "financial") -> dict[str, Any]:
    bench = readiness_index_snapshot(industry=industry)
    if not bench.get("available"):
        return {
            "available": False,
            "reason": bench.get("reason", "unavailable"),
            "yourScore": score,
        }
    median = float(bench["medianReadiness"])
    p25 = float(bench.get("p25") or median - 10)
    p75 = float(bench.get("p75") or median + 10)
    band = "above_peers" if score >= p75 else ("below_peers" if score <= p25 else "within_band")
    return {
        "available": True,
        "yourScore": score,
        "median": median,
        "p25": p25,
        "p75": p75,
        "delta": round(score - median, 1),
        "band": band,
        "percentileEstimate": min(99, max(1, int(50 + (score - median) * 2))),
        "sampleSize": bench.get("sampleSize"),
        "asOf": bench.get("asOf"),
    }
