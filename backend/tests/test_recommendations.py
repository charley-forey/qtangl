from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.recommendations.maturity import compute_maturity_stage
from app.recommendations.service import build_recommendations, dismiss_recommendation
from app.store.scan_jobs import save_scan_bundle
from app.tenants.service import create_tenant, issue_api_key


class RecommendationsEngineTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        self._reset_engine()
        from app.db.engine import init_db

        init_db()
        self.client = TestClient(app)
        create_tenant(name="Rec Co", tenant_id="tenant-rec")
        self.headers = {"Authorization": f"Bearer {issue_api_key(tenant_id='tenant-rec')['apiKey']}"}

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

    def test_maturity_stage_zero_without_scans(self) -> None:
        stage = compute_maturity_stage(tenant_id="tenant-rec")
        self.assertEqual(stage["stage"], 0)
        self.assertEqual(stage["nextStage"], 1)

    def test_recommendations_include_baseline_without_scans(self) -> None:
        recs = build_recommendations(tenant_id="tenant-rec", role="operator")
        self.assertTrue(any(r["source"] == "onboarding_baseline" for r in recs))

    def test_recommendations_after_scan(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-rec")
        recs = build_recommendations(tenant_id="tenant-rec", role="operator")
        self.assertTrue(any(r["category"] in {"schedule", "remediation", "scan"} for r in recs))
        stage = compute_maturity_stage(tenant_id="tenant-rec")
        self.assertGreaterEqual(stage["stage"], 1)

    def test_dismiss_recommendation_api(self) -> None:
        recs = build_recommendations(tenant_id="tenant-rec", role="admin")
        self.assertGreater(len(recs), 0)
        rid = recs[0]["id"]
        dismiss_recommendation(tenant_id="tenant-rec", recommendation_id=rid)
        after = build_recommendations(tenant_id="tenant-rec", role="admin")
        self.assertFalse(any(r["id"] == rid for r in after))

    def test_dashboard_summary_includes_recommendations(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-rec")
        response = self.client.get("/tenant/dashboard/summary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("recommendations", payload)
        self.assertIn("maturity", payload)
        self.assertIn("firstScanAt", payload)
        self.assertIsInstance(payload["recommendations"], list)

    def test_convert_recommendation_at_stage_three(self) -> None:
        from app.monitoring.service import create_schedule

        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-rec")
        create_schedule(
            tenant_id="tenant-rec",
            scenario_id="bank-tls-inventory",
            target="api.example.com",
            cadence_hours=168,
        )
        stage = compute_maturity_stage(tenant_id="tenant-rec")
        self.assertGreaterEqual(stage["stage"], 3)
        recs = build_recommendations(tenant_id="tenant-rec", role="admin")
        self.assertTrue(any(r.get("source") == "convert_upgrade" for r in recs))

    def test_explain_portfolio_api(self) -> None:
        response = self.client.post(
            "/tenant/ai/explain-portfolio",
            headers=self.headers,
            json={"persona": "executive", "prompt": "What should I tell the board?"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload.get("status"), "success")
        self.assertIn("explanation", payload)

    def test_alert_inbox_recommendations(self) -> None:
        from app.store.tenant_alerts import persist_alert

        persist_alert(
            tenant_id="tenant-rec",
            rule="readiness_drop",
            severity="high",
            message="Readiness dropped 6.0 points since last scan.",
            source="scan",
            payload={"scanId": "scan-test"},
        )
        recs = build_recommendations(tenant_id="tenant-rec", role="operator")
        self.assertTrue(any(r["source"] == "alert_inbox" for r in recs))
