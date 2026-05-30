from __future__ import annotations

import unittest

from app.metrics.diversity import diversity_metrics_from_signatures
from app.metrics.success_metric import compute_success_metric
from app.models.results import TaskAssignment


class DiversityMetricsTest(unittest.TestCase):
    def test_distinct_and_score_for_multiple_signatures(self) -> None:
        metrics = diversity_metrics_from_signatures(["plan-a", "plan-b", "plan-a"])
        self.assertEqual(metrics.distinct_feasible_plans, 2)
        self.assertGreater(metrics.diversity_score, 0.0)

    def test_success_metric_true_when_more_alternates_within_epsilon(self) -> None:
        payload = compute_success_metric(
            hybrid_distinct=3,
            classical_distinct=1,
            hybrid_objective=101.0,
            classical_objective=100.0,
            epsilon=0.02,
        )
        self.assertTrue(payload["successMetric"])
        self.assertTrue(payload["withinEpsilon"])

    def test_assignment_signature_stable(self) -> None:
        from app.metrics.diversity import assignment_signature

        assignments = [
            TaskAssignment(task="a", start_day=1, end_day=2, resource="crew-1"),
            TaskAssignment(task="b", start_day=2, end_day=4, resource="crew-2"),
        ]
        self.assertEqual(
            assignment_signature(assignments),
            assignment_signature(list(reversed(assignments))),
        )


if __name__ == "__main__":
    unittest.main()
