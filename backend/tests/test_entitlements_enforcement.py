from __future__ import annotations

import unittest
from unittest.mock import patch

from app.billing.entitlements import (
    TIER_DEFAULTS,
    check_scan_quota,
    check_schedule_cadence,
    check_schedule_quota,
)


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

    def test_sandbox_live_scan_skips_payment_gate(self) -> None:
        from app.billing.entitlements import check_batch_production_scan_access

        err = check_batch_production_scan_access(tenant_id="sandbox", count=1, use_fixture=False)
        self.assertIsNone(err)

    def test_sandbox_live_scan_skips_usage_recording(self) -> None:
        from unittest.mock import patch

        from app.billing.entitlements import record_production_scan_usage

        with patch("app.tenant.settings.patch_tenant_billing_flags") as mock_patch:
            record_production_scan_usage(tenant_id="sandbox", use_fixture=False)
            mock_patch.assert_not_called()

    def test_schedule_cadence_below_minimum(self) -> None:
        with patch("app.billing.entitlements.tenant_entitlements") as mock_ent:
            mock_ent.return_value = {**TIER_DEFAULTS["monitor"], "tier": "monitor", "status": "active"}
            err = check_schedule_cadence(tenant_id="t1", cadence_hours=1)
            self.assertIsNotNone(err)
            self.assertEqual(err["code"], "schedule_cadence_below_minimum")
            self.assertEqual(err["minimumCadenceHours"], 24)

    def test_live_scan_blocked_without_legal_acceptance(self) -> None:
        import os
        import tempfile

        from fastapi.testclient import TestClient

        from app.billing.entitlements import mark_assess_paid
        from app.db.engine import init_db
        from app.main import app
        from app.tenants.service import create_tenant, issue_api_key

        tmp = tempfile.TemporaryDirectory()
        db_path = os.path.join(tmp.name, "legal-scan.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None
        init_db()
        tenant = create_tenant(name="Scan Legal Co", tenant_id="tenant-scan-legal")
        key = issue_api_key(tenant_id=tenant["tenantId"])["apiKey"]
        mark_assess_paid(tenant_id="tenant-scan-legal")
        client = TestClient(app)
        with patch("app.api.pqc.live_scan_enabled", return_value=True):
            response = client.post(
                "/pqc/scan",
                headers={"Authorization": f"Bearer {key}"},
                json={"scenarioId": "bank-tls-inventory", "useFixture": False},
            )
        self.assertEqual(response.status_code, 402)
        detail = response.json()["detail"]
        self.assertEqual(detail["code"], "legal_acceptance_required")
        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        os.environ.pop("DATABASE_URL", None)
        tmp.cleanup()

    def test_fixture_scan_skips_legal_gate(self) -> None:
        import os
        import tempfile

        from fastapi.testclient import TestClient

        from app.db.engine import init_db
        from app.main import app
        from app.tenants.service import create_tenant, issue_api_key

        tmp = tempfile.TemporaryDirectory()
        db_path = os.path.join(tmp.name, "fixture-scan.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None
        init_db()
        tenant = create_tenant(name="Fixture Co", tenant_id="tenant-fixture")
        key = issue_api_key(tenant_id=tenant["tenantId"])["apiKey"]
        client = TestClient(app)
        response = client.post(
            "/pqc/scan",
            headers={"Authorization": f"Bearer {key}"},
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        self.assertEqual(response.status_code, 200)
        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        os.environ.pop("DATABASE_URL", None)
        tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
