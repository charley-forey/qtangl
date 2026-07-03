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


class CommandCenterRoutesTest(unittest.TestCase):
    """Route-level coverage for the /tenant/* Command Center Next Wave endpoints.

    These previously had only unit tests for their pure business-logic
    functions (build_scan_graph, build_hndl_exposure, ...) — nothing exercised
    the route handlers themselves against the real load_scan_bundle /
    list_jobs_for_tenant shapes, which is where the actual bugs were.
    """

    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ["QTANGL_BFF_SESSION_SECRET"] = "bff-secret-test-key-32chars-min"
        self._reset_engine()
        init_db()
        self.client = TestClient(app)
        tenant = create_tenant(name="CC Routes Co", tenant_id="tenant-cc-routes")
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
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-cc-routes")
        return bundle.scan_id

    def test_scan_graph(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get(f"/tenant/scans/{scan_id}/graph", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["scanId"], scan_id)
        self.assertGreater(payload["nodeCount"], 0)

    def test_hndl_exposure_with_explicit_scan_id(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get(f"/tenant/hndl/exposure?scan_id={scan_id}", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["scanId"], scan_id)
        self.assertGreater(payload["totalAssets"], 0)

    def test_hndl_exposure_falls_back_to_latest(self) -> None:
        scan_id = self._seed_scan()
        response = self.client.get("/tenant/hndl/exposure", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["scanId"], scan_id)

    def test_inbox(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/inbox", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("items", payload)
        self.assertIn("total", payload)

    def test_trajectory_forecast(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/analytics/trajectory-forecast", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("currentPace", payload)
        self.assertIn("confidenceBand", payload)

    def test_executive_narrative(self) -> None:
        self._seed_scan()
        response = self.client.get("/tenant/ai/executive-narrative", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("narrative", payload)
        self.assertIsInstance(payload["narrative"], str)
        self.assertGreater(len(payload["narrative"]), 0)


if __name__ == "__main__":
    unittest.main()
