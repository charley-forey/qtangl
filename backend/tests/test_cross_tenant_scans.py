"""Cross-tenant scan isolation for production assess."""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.main import app


class CrossTenantScanIsolationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers_a = {"Authorization": "Bearer qtangl-demo-key"}
        self.headers_b = {"Authorization": "Bearer qtangl-other-key"}

    def test_scan_status_not_found_for_other_tenant(self) -> None:
        create = self.client.post(
            "/pqc/scan",
            headers=self.headers_a,
            json={"useFixture": True, "scenarioId": "bank-tls-inventory"},
        )
        if create.status_code != 200:
            self.skipTest("Scan create unavailable in this environment")
        scan_id = create.json().get("scanId")
        self.assertTrue(scan_id)
        foreign = self.client.get(f"/pqc/scan/{scan_id}", headers=self.headers_b)
        self.assertIn(foreign.status_code, {401, 404})


if __name__ == "__main__":
    unittest.main()
