"""Readiness anomaly detection on scan history."""

from __future__ import annotations

from typing import Any


def detect_readiness_anomalies(*, scores: list[float], threshold_drop: float = 5.0) -> list[dict[str, Any]]:
    alerts: list[dict[str, Any]] = []
    for index in range(1, len(scores)):
        prev, curr = scores[index - 1], scores[index]
        delta = curr - prev
        if delta <= -threshold_drop:
            alerts.append(
                {
                    "type": "readiness_drop",
                    "from": prev,
                    "to": curr,
                    "delta": round(delta, 1),
                    "index": index,
                }
            )
    return alerts


def forecast_readiness(*, scores: list[float], horizon: int = 4) -> dict[str, Any]:
    if len(scores) < 2:
        return {"projected": scores[-1] if scores else None, "method": "insufficient_data"}
    slope = (scores[-1] - scores[0]) / max(1, len(scores) - 1)
    projected = min(100.0, max(0.0, scores[-1] + slope * horizon))
    return {
        "current": scores[-1],
        "projected": round(projected, 1),
        "slopePerScan": round(slope, 2),
        "horizonScans": horizon,
        "method": "linear_extrapolation",
    }
