from __future__ import annotations

from typing import Any


def compute_success_metric(
    *,
    hybrid_distinct: int,
    classical_distinct: int,
    hybrid_objective: float,
    classical_objective: float,
    epsilon: float = 0.02,
) -> dict[str, Any]:
    """Track C2 falsifiable success metric for hybrid optimization."""
    within_epsilon = hybrid_objective <= classical_objective * (1 + epsilon)
    success = hybrid_distinct >= classical_distinct + 1 and within_epsilon
    return {
        "successMetric": success,
        "epsilon": epsilon,
        "hybridDistinctFeasiblePlans": hybrid_distinct,
        "classicalDistinctFeasiblePlans": classical_distinct,
        "hybridObjective": round(hybrid_objective, 4),
        "classicalObjective": round(classical_objective, 4),
        "withinEpsilon": within_epsilon,
    }
