from __future__ import annotations

import unittest

from app.hospital.data import load_dataset, load_scenario
from app.hospital.repair_window import detect_repair_window
from app.hospital.solver_classical import solve_callout_classically


class HospitalRepairWindowTest(unittest.TestCase):
    def test_repair_window_collects_micro_candidates(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("callout-cath-acls")
        classical = solve_callout_classically(dataset, scenario)

        repair_window = detect_repair_window(dataset, scenario, classical)

        self.assertGreaterEqual(len(repair_window.nurse_ids), 3)
        self.assertIn("Cath Lab 2", repair_window.ward_ids)
        self.assertGreater(repair_window.edge_count, 0)


if __name__ == "__main__":
    unittest.main()
