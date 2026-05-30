from __future__ import annotations

from dataclasses import dataclass

from app.models.results import TaskAssignment


@dataclass(slots=True)
class DiversityMetrics:
    distinct_feasible_plans: int
    diversity_score: float


def assignment_signature(assignments: list[TaskAssignment]) -> str:
    pairs = sorted(
        (item.task, item.start_day, item.end_day, item.resource or "")
        for item in assignments
    )
    return "|".join(f"{task}:{start}-{end}@{resource}" for task, start, end, resource in pairs)


def pairwise_diversity_score(signatures: list[str]) -> float:
    if len(signatures) <= 1:
        return 0.0
    total = 0.0
    pairs = 0
    for index, left in enumerate(signatures):
        for right in signatures[index + 1 :]:
            if left == right:
                distance = 0.0
            else:
                max_len = max(len(left), len(right), 1)
                mismatches = sum(1 for a, b in zip(left, right) if a != b)
                mismatches += abs(len(left) - len(right))
                distance = min(1.0, mismatches / max_len)
            total += distance
            pairs += 1
    return round(total / pairs, 3)


def diversity_metrics_from_signatures(signatures: list[str]) -> DiversityMetrics:
    filtered = [signature for signature in signatures if signature]
    if not filtered:
        return DiversityMetrics(distinct_feasible_plans=1, diversity_score=0.0)
    distinct = len(set(filtered))
    return DiversityMetrics(
        distinct_feasible_plans=max(1, distinct),
        diversity_score=pairwise_diversity_score(filtered),
    )
