from __future__ import annotations

import unittest

from app.pqc.data import load_dataset
from app.pqc.scanner import fixture_assets_for_scenario, scan_fixture


class PqcScannerTest(unittest.TestCase):
    def test_fixture_scan_returns_scenario_assets(self) -> None:
        dataset = load_dataset()
        scenario = next(s for s in dataset.scenarios if s.id == "bank-tls-inventory")
        assets, timeline = scan_fixture(dataset, scenario)
        self.assertGreaterEqual(len(assets), 5)
        self.assertTrue(any(event.key == "fixture" for event in timeline))

    def test_fixture_assets_for_scenario_filters_ids(self) -> None:
        dataset = load_dataset()
        scenario = next(s for s in dataset.scenarios if s.id == "bank-tls-inventory")
        assets = fixture_assets_for_scenario(dataset, scenario)
        self.assertEqual(len(assets), len(scenario.fixture_asset_ids))


if __name__ == "__main__":
    unittest.main()
