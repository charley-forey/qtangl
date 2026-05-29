from __future__ import annotations

import unittest

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan


class PqcPipelineTest(unittest.TestCase):
    def test_fixture_scan_returns_bundle(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        self.assertGreater(len(bundle.assets), 0)
        self.assertGreater(len(bundle.remediation_backlog), 0)
        self.assertIsNotNone(bundle.scoreboard.manual)
        self.assertEqual(bundle.handshake_proof.mode, "fixture")


if __name__ == "__main__":
    unittest.main()
