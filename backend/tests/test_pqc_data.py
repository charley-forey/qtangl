from __future__ import annotations

import unittest

from app.pqc.data import load_dataset, load_scenario


class PqcDataTest(unittest.TestCase):
    def test_dataset_loads_inventory_and_scenarios(self) -> None:
        dataset = load_dataset()
        self.assertGreaterEqual(len(dataset.inventory), 5)
        self.assertGreaterEqual(len(dataset.scenarios), 3)

    def test_load_scenario_by_id(self) -> None:
        scenario = load_scenario("bank-tls-inventory")
        self.assertEqual(scenario.id, "bank-tls-inventory")


if __name__ == "__main__":
    unittest.main()
