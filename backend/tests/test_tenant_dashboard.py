from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.store.scan_jobs import save_scan_bundle
from app.tenants.service import create_tenant, issue_api_key


class TenantDashboardEndpointsTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        self._reset_engine()
        init_db()
        self.client = TestClient(app)
        tenant = create_tenant(name="Dashboard Co", tenant_id="tenant-dash")
        self.tenant_key = issue_api_key(tenant_id=tenant["tenantId"])["apiKey"]
        self.headers = {"Authorization": f"Bearer {self.tenant_key}"}

    def tearDown(self) -> None:
        self._reset_engine()
        os.environ.pop("DATABASE_URL", None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None

    def _seed_scan(self) -> str:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-dash")
        return bundle.scan_id

    def test_tenant_me_includes_dashboard_metrics(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get("/tenant/me", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["scanCount"], 1)
        self.assertIsNotNone(payload["latestReadinessScore"])
        self.assertIsNotNone(payload["latestReadinessBand"])
        self.assertIsNotNone(payload["latestScanAt"])
        self.assertIn("scheduleCount", payload)
        self.assertIn("openCriticalCount", payload)
        self.assertIn("scansThisMonth", payload)

    def test_readiness_trend_returns_points(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/analytics/readiness-trend", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertGreaterEqual(payload["count"], 1)
        point = payload["points"][0]
        self.assertIn("date", point)
        self.assertIn("score", point)
        self.assertIn("scanId", point)
        self.assertIn("band", point)

    def test_dashboard_summary_aggregates_sections(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get("/tenant/dashboard/summary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        for key in (
            "me",
            "kpis",
            "trend",
            "digest",
            "commandCenter",
            "alerts",
            "recentScans",
            "schedulesSummary",
            "health",
        ):
            self.assertIn(key, payload, msg=f"missing {key}")
        self.assertGreaterEqual(payload["kpis"]["scanCount"], 1)
        scan_ids = {row["scanId"] for row in payload["recentScans"]}
        self.assertIn(scan_id, scan_ids)

    def test_dashboard_events_requires_auth(self) -> None:
        response = self.client.get("/tenant/dashboard/events")
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
