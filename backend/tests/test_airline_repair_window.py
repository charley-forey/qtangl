from __future__ import annotations

import unittest

from app.airline.data import load_dataset, load_scenario
from app.airline.repair_window import detect_repair_window
from app.airline.solver_classical import solve_crew_classically
from app.airline.solver_routing import solve_routing_repair


class AirlineRepairWindowTest(unittest.TestCase):
    def test_repair_window_has_crew(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("mx-hold-ord-0612")
        routing = solve_routing_repair(dataset, scenario).result
        classical = solve_crew_classically(dataset, scenario, routing)
        window = detect_repair_window(dataset, scenario, classical)
        self.assertGreaterEqual(len(window.crew_ids), 1)
        self.assertGreaterEqual(len(window.leg_ids), 1)


if __name__ == "__main__":
    unittest.main()
