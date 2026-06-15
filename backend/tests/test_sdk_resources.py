from __future__ import annotations

import unittest

from tests.test_sdk_client import _client


class SdkMonitorResourceTest(unittest.TestCase):
    def test_settings_and_webhooks_list(self) -> None:
        client, http = _client()
        try:
            settings = client.monitor.get_settings()
            self.assertIn("settings", settings)
            webhooks = client.monitor.list_webhooks()
            self.assertIn("webhooks", webhooks)
        finally:
            client.close()
            http.close()

    def test_cbom_aggregate_and_conflicts(self) -> None:
        client, http = _client()
        try:
            aggregate = client.cbom.aggregate()
            self.assertIn("status", aggregate)
            conflicts = client.cbom.conflicts()
            self.assertIn("conflicts", conflicts)
        finally:
            client.close()
            http.close()

    def test_report_availability_after_scan(self) -> None:
        client, http = _client()
        try:
            scan = client.scan_fixture()
            scan_id = str(scan["scanId"])
            availability = client.reports.availability(scan_id)
            self.assertIn("reportAvailable", availability)
        finally:
            client.close()
            http.close()


class SdkDriftRemediationResourceTest(unittest.TestCase):
    def test_drift_summary_and_intel(self) -> None:
        client, http = _client()
        try:
            summary = client.drift.summary(since_days=7)
            self.assertIn("scopeCount", summary)
            intel = client.drift.intel()
            self.assertIn("available", intel)
        finally:
            client.close()
            http.close()

    def test_remediation_program_list_and_velocity(self) -> None:
        client, http = _client()
        try:
            program = client.remediation.list_program()
            self.assertIn("items", program)
            velocity = client.remediation.program_velocity()
            self.assertIn("total", velocity)
        finally:
            client.close()
            http.close()
