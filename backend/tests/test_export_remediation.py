from __future__ import annotations

import unittest

from app.remediation.service import merge_remediation_into_report


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


if __name__ == "__main__":
    unittest.main()
