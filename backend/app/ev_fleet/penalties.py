from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class PenaltyPolicy:
    hard_constraint_lambda: float
    no_double_booking_lambda: float
    peak_concurrency_lambda: float
    soft_weights: dict[str, float]


def load_penalty_policy(
    penalty_weights: dict[str, Any], *, max_objective_coefficient: float
) -> PenaltyPolicy:
    multiplier = float(penalty_weights.get("hardConstraintMultiplier", 10.0))
    double_booking = float(penalty_weights.get("noDoubleBookingMultiplier", 8.0))
    peak_concurrency = float(penalty_weights.get("peakConcurrencyMultiplier", 6.0))
    soft_weights = {
        key: float(value) for key, value in penalty_weights.get("softWeights", {}).items()
    }
    base = max(1.0, max_objective_coefficient)
    return PenaltyPolicy(
        hard_constraint_lambda=round(multiplier * base, 4),
        no_double_booking_lambda=round(double_booking * base, 4),
        peak_concurrency_lambda=round(peak_concurrency * base, 4),
        soft_weights=soft_weights,
    )


def build_penalty_snapshot(policy: PenaltyPolicy) -> dict[str, Any]:
    return {
        "hardConstraintLambda": policy.hard_constraint_lambda,
        "noDoubleBookingLambda": policy.no_double_booking_lambda,
        "peakConcurrencyLambda": policy.peak_concurrency_lambda,
        "softWeights": policy.soft_weights,
    }
