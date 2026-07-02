from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.auth_workos.session import sign_bff_session
from app.db.engine import db_session, init_db
from app.db.models import TenantMembership, User
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
        os.environ["QTANGL_BFF_SESSION_SECRET"] = "bff-secret-test-key-32chars-min"
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
        self.assertIn("score", payload["health"])
        self.assertIn("band", payload["health"])
        self.assertGreaterEqual(payload["kpis"]["scanCount"], 1)
        scan_ids = {row["scanId"] for row in payload["recentScans"]}
        self.assertIn(scan_id, scan_ids)

    def test_dashboard_summary_with_remediation_status_rows(self) -> None:
        from app.remediation.service import upsert_remediation_status

        scan_id = self._seed_scan()
        upsert_remediation_status(
            tenant_id="tenant-dash",
            scan_id=scan_id,
            remediation_id="rem-done",
            status="done",
        )
        upsert_remediation_status(
            tenant_id="tenant-dash",
            scan_id=scan_id,
            remediation_id="rem-open",
            status="open",
        )
        response = self.client.get("/tenant/dashboard/summary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        velocity = response.json()["remediationVelocity"]
        self.assertEqual(velocity["closedCount"], 1)
        self.assertEqual(velocity["openCount"], 1)

    def test_dashboard_summary_extended_fields(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/dashboard/summary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        for key in (
            "latestScanDetail",
            "forecast",
            "remediationVelocity",
            "sloMetrics",
            "integrationsSummary",
            "layoutDefaults",
            "membershipHealth",
        ):
            self.assertIn(key, payload, msg=f"missing {key}")
        self.assertIn("persona", payload["layoutDefaults"])

    def test_dashboard_tab_scans(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get("/tenant/dashboard/tab/scans", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["tab"], "scans")
        scan_ids = {row["scanId"] for row in payload["data"]["scans"]}
        self.assertIn(scan_id, scan_ids)

    def test_dashboard_tab_settings(self) -> None:
        response = self.client.get("/tenant/dashboard/tab/settings", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("settings", response.json()["data"])

    def test_dashboard_tab_unknown(self) -> None:
        response = self.client.get("/tenant/dashboard/tab/unknown", headers=self.headers)
        self.assertEqual(response.status_code, 404)

    def test_portfolio_summary(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/partner/portfolio-summary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("children", payload)
        self.assertIn("rollup", payload)

    def test_digest_preview(self) -> None:
        self._seed_scan()
        response = self.client.post("/tenant/dashboard/digest/preview", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("html", payload)
        self.assertIn("narrative", payload["digest"])

    def test_bulk_export_requires_scan_ids(self) -> None:
        response = self.client.post("/tenant/scans/bulk-export", headers=self.headers, json={})
        self.assertEqual(response.status_code, 400)

    def test_analytics_track_accepts_dashboard_event(self) -> None:
        response = self.client.post(
            "/tenant/analytics/track",
            headers=self.headers,
            json={"event": "dashboard_tab_changed", "properties": {"tab": "overview"}},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["event"], "dashboard_tab_changed")

    def test_analytics_track_rejects_unknown_event(self) -> None:
        response = self.client.post(
            "/tenant/analytics/track",
            headers=self.headers,
            json={"event": "not_a_real_event"},
        )
        self.assertEqual(response.status_code, 400)

    def test_dashboard_summary_with_bff_session(self) -> None:
        self._seed_scan()
        with db_session() as session:
            session.add(User(id="usr-dash", workos_user_id="user_dash", email="dash@example.com"))
            session.add(
                TenantMembership(
                    id="mem-dash",
                    tenant_id="tenant-dash",
                    user_id="usr-dash",
                    role="admin",
                )
            )
        token = sign_bff_session(
            tenant_id="tenant-dash",
            user_id="usr-dash",
            role="admin",
            email="dash@example.com",
        )
        response = self.client.get(
            "/tenant/dashboard/summary",
            headers={"Authorization": f"Bff {token}"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("kpis", payload)
        self.assertIn("recentScans", payload)


if __name__ == "__main__":
    unittest.main()
