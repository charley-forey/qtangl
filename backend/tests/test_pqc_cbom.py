from __future__ import annotations

import json
import unittest
from pathlib import Path

from app.pqc.cbom import CBOM_SCHEMA_ID, CBOM_SPEC_VERSION, validate_cbom
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import build_migration_report, report_to_cbom

REPO_ROOT = Path(__file__).resolve().parents[2]
SAMPLE_CBOM = REPO_ROOT / "demos" / "pqc_migration" / "data" / "sample-cbom-bank-tls-inventory.json"


class PqcCbomTest(unittest.TestCase):
    def test_fixture_scan_cbom_validates(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        cbom = report_to_cbom(bundle.report)
        errors = validate_cbom(cbom)
        self.assertEqual(errors, [], msg="; ".join(errors))
        self.assertEqual(cbom["specVersion"], CBOM_SPEC_VERSION)
        self.assertEqual(
            cbom["metadata"]["properties"][0],
            {"name": "qtangl:cbomSchemaId", "value": CBOM_SCHEMA_ID},
        )
        self.assertGreaterEqual(len(cbom["components"]), 5)

    def test_cbom_includes_remediation_sla_when_backlog_exists(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        cbom = report_to_cbom(bundle.report)
        props_by_name = {
            prop["name"]: prop["value"]
            for component in cbom["components"]
            for prop in component["properties"]
        }
        self.assertIn("qtangl:remediationDeadline", props_by_name)
        self.assertIn("qtangl:remediationPqcAlgorithm", props_by_name)

    def test_committed_sample_cbom_matches_schema(self) -> None:
        self.assertTrue(SAMPLE_CBOM.exists(), f"missing sample CBOM at {SAMPLE_CBOM}")
        document = json.loads(SAMPLE_CBOM.read_text(encoding="utf-8"))
        errors = validate_cbom(document)
        self.assertEqual(errors, [], msg="; ".join(errors))


if __name__ == "__main__":
    unittest.main()
