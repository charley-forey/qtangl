"""Anonymized readiness benchmarks and index (data moat scaffolding)."""

from __future__ import annotations

from typing import Any


def readiness_index_snapshot(*, industry: str = "financial") -> dict[str, Any]:
    return {
        "industry": industry,
        "medianReadiness": 62.4,
        "p25": 48.0,
        "p75": 71.2,
        "sampleSize": 128,
        "asOf": "2026-Q2",
        "disclaimer": "Synthetic benchmark for product preview; not attestation.",
    }


def compare_to_benchmark(*, score: float, industry: str = "financial") -> dict[str, Any]:
    bench = readiness_index_snapshot(industry=industry)
    median = float(bench["medianReadiness"])
    return {
        "yourScore": score,
        "median": median,
        "delta": round(score - median, 1),
        "percentileEstimate": min(99, max(1, int(50 + (score - median) * 2))),
    }
