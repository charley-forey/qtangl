from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class PenaltyPolicy:
    hard_constraint_lambda: float
    soft_weights: dict[str, float]


def load_penalty_policy(penalty_weights: dict[str, Any], *, max_objective_coefficient: float) -> PenaltyPolicy:
    multiplier = float(penalty_weights.get("hardConstraintMultiplier", 10.0))
    soft_weights = {
        key: float(value) for key, value in penalty_weights.get("softWeights", {}).items()
    }
    return PenaltyPolicy(
        hard_constraint_lambda=round(multiplier * max(1.0, max_objective_coefficient), 4),
        soft_weights=soft_weights,
    )


def build_penalty_snapshot(policy: PenaltyPolicy) -> dict[str, Any]:
    return {
        "hardConstraintLambda": policy.hard_constraint_lambda,
        "softWeights": policy.soft_weights,
    }
