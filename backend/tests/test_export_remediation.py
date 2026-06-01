from __future__ import annotations

import unittest

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.remediation.service import apply_remediation_to_migration_report, merge_remediation_into_report


class ExportRemediationTest(unittest.TestCase):
    def test_merge_adds_workflow_status(self) -> None:
        report = {
            "readinessScore": 55.0,
            "remediationBacklog": [
                {"id": "rem-1", "title": "Rotate TLS", "severity": "high"},
            ],
        }
        statuses = [{"remediationId": "rem-1", "status": "done", "owner": "sec-team"}]
        merged = merge_remediation_into_report(report, statuses=statuses)
        self.assertEqual(merged["remediationBacklog"][0]["workflowStatus"], "done")
        self.assertEqual(merged["remediationBacklog"][0]["owner"], "sec-team")

    def test_pdf_overlay_metadata(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        report = bundle.report
        if not report.remediation_backlog:
            self.skipTest("no backlog generated")
        rid = report.remediation_backlog[0].id
        updated = apply_remediation_to_migration_report(
            report,
            statuses=[{"remediationId": rid, "status": "done", "owner": "alice", "targetDate": "2026-12-01"}],
        )
        meta = updated.remediation_backlog[0].metadata
        self.assertEqual(meta.get("workflowStatus"), "done")
        self.assertEqual(meta.get("owner"), "alice")


if __name__ == "__main__":
    unittest.main()
