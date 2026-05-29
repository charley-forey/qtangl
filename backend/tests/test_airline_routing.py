from __future__ import annotations

import unittest

from app.airline.data import load_dataset, load_scenario
from app.airline.solver_routing import solve_routing_repair


class AirlineRoutingTest(unittest.TestCase):
    def test_routing_opens_affected_legs(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("mx-hold-ord-0612")
        bundle = solve_routing_repair(dataset, scenario)
        self.assertEqual(len(bundle.result.open_legs), 3)
        self.assertGreater(bundle.result.wall_time_seconds, 0)


if __name__ == "__main__":
    unittest.main()
