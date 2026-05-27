from __future__ import annotations

import unittest

from app.hospital.penalties import load_penalty_policy


class HospitalPenaltyPolicyTest(unittest.TestCase):
    def test_hard_constraint_lambda_scales_above_objective(self) -> None:
        policy = load_penalty_policy(
            {
                "hardConstraintMultiplier": 10,
                "softWeights": {"fatigueRisk": 5.5},
            },
            max_objective_coefficient=3.2,
        )

        self.assertGreaterEqual(policy.hard_constraint_lambda, 32.0)
        self.assertEqual(policy.soft_weights["fatigueRisk"], 5.5)


if __name__ == "__main__":
    unittest.main()
