from __future__ import annotations

import unittest

from app.customer_success.health import compute_customer_health


class CustomerHealthScoreTest(unittest.TestCase):
    def test_green_band_when_healthy(self) -> None:
        payload = compute_customer_health(
            tenant_id="tenant-a",
            last_scan_at="2026-06-15T12:00:00+00:00",
            open_critical=2,
            schedule_active=True,
            has_scans=True,
            remediation_velocity={"completionRatePct": 45},
            role="operator",
            settings={"weeklyDigestEnabled": True},
        )
        self.assertGreaterEqual(payload["score"], 75)
        self.assertEqual(payload["band"], "green")

    def test_red_band_when_stale_and_critical(self) -> None:
        payload = compute_customer_health(
            tenant_id="tenant-b",
            last_scan_at="2026-01-01T12:00:00+00:00",
            open_critical=20,
            schedule_active=False,
            has_scans=True,
            remediation_velocity={"completionRatePct": 0},
            role="executive",
            settings={"weeklyDigestEnabled": False},
        )
        self.assertLess(payload["score"], 50)
        self.assertEqual(payload["band"], "red")


if __name__ == "__main__":
    unittest.main()
