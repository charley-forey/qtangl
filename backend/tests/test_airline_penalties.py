from __future__ import annotations

import unittest

from app.airline.data import load_penalty_weights
from app.airline.penalties import load_penalty_policy


class AirlinePenaltiesTest(unittest.TestCase):
    def test_penalty_policy_scales_with_objective(self) -> None:
        weights = load_penalty_weights()
        policy = load_penalty_policy(weights, max_objective_coefficient=12.5)
        self.assertGreater(policy.hard_constraint_lambda, 100)
        self.assertGreater(policy.no_double_booking_lambda, 50)


if __name__ == "__main__":
    unittest.main()
