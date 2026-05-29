from __future__ import annotations

import unittest

from app.airline.data import load_dataset, load_scenario
from app.airline.solver_classical import solve_crew_classically
from app.airline.solver_routing import solve_routing_repair


class AirlineClassicalSolverTest(unittest.TestCase):
    def test_classical_assigns_all_open_legs(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("mx-hold-ord-0612")
        routing = solve_routing_repair(dataset, scenario).result
        result = solve_crew_classically(dataset, scenario, routing)
        self.assertEqual(len(result.selected_plan.assignments), len(routing.open_legs))


if __name__ == "__main__":
    unittest.main()
