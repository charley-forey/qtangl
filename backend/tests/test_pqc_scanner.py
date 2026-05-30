from __future__ import annotations

import os
import unittest
import unittest.mock

from app.pqc.data import load_dataset, load_scenario
from app.pqc.scanner import fixture_assets_for_scenario, scan_fixture, scan_live


class PqcScannerTest(unittest.TestCase):
    def test_fixture_scan_returns_scenario_assets(self) -> None:
        dataset = load_dataset()
        scenario = next(s for s in dataset.scenarios if s.id == "bank-tls-inventory")
        assets, timeline, coverage = scan_fixture(dataset, scenario)
        self.assertGreaterEqual(len(assets), 5)
        self.assertTrue(any(event.key == "fixture" for event in timeline))
        self.assertEqual(coverage, [])

    def test_fixture_assets_for_scenario_filters_ids(self) -> None:
        dataset = load_dataset()
        scenario = next(s for s in dataset.scenarios if s.id == "bank-tls-inventory")
        assets = fixture_assets_for_scenario(dataset, scenario)
        self.assertEqual(len(assets), len(scenario.fixture_asset_ids))


@unittest.skipUnless(
    os.getenv("QTANGL_PQC_RUN_LIVE_INTEGRATION") == "true",
    "Set QTANGL_PQC_RUN_LIVE_INTEGRATION=true to run outbound live scan integration tests",
)
class PqcLiveScannerIntegrationTest(unittest.TestCase):
    def test_live_scan_openquantumsafe_org(self) -> None:
        scenario = load_scenario("bank-tls-inventory")
        env = {
            "QTANGL_PQC_ENABLE_LIVE_SCAN": "true",
            "QTANGL_PQC_SCAN_ALLOWLIST": "test.openquantumsafe.org",
            "QTANGL_PQC_MAX_ENDPOINTS": "3",
            "QTANGL_PQC_SCAN_TIMEOUT": "15",
        }
        with unittest.mock.patch.dict(os.environ, env, clear=False):
            assets, timeline, coverage = scan_live(
                scenario,
                target_override="test.openquantumsafe.org",
            )

        self.assertGreaterEqual(len(assets), 1)
        self.assertTrue(any(event.key == "resolve" for event in timeline))
        tls_assets = [asset for asset in assets if asset.kind == "tls"]
        self.assertGreaterEqual(len(tls_assets), 1)
        self.assertIsInstance(coverage, list)


if __name__ == "__main__":
    unittest.main()
