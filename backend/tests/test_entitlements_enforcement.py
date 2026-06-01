from __future__ import annotations

import unittest
from unittest.mock import patch

from app.billing.entitlements import check_scan_quota, check_schedule_quota, TIER_DEFAULTS


class EntitlementsTest(unittest.TestCase):
    def test_free_tier_schedule_quota(self) -> None:
        with patch("app.billing.entitlements.tenant_entitlements") as mock_ent:
            mock_ent.return_value = {**TIER_DEFAULTS["free"], "tier": "free", "status": "active"}
            with patch("app.monitoring.service.list_schedules", return_value=[]):
                err = check_schedule_quota(tenant_id="t-free")
                self.assertIsNotNone(err)
                self.assertEqual(err["code"], "schedule_quota_exceeded")

    def test_scan_quota_exceeded(self) -> None:
        with patch("app.billing.entitlements.tenant_entitlements") as mock_ent:
            mock_ent.return_value = {"tier": "free", "maxScansPerMonth": 2, "status": "active"}
            with patch("app.billing.entitlements.scans_created_this_month", return_value=2):
                err = check_scan_quota(tenant_id="t1")
                self.assertIsNotNone(err)
                self.assertEqual(err["code"], "scan_quota_exceeded")


if __name__ == "__main__":
    unittest.main()
