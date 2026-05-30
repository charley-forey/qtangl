from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.repair_window.routing import apply_routing_repair_window
from app.solvers.routing import solve_routing_classically
from app.store.scan_jobs import create_job, get_job, list_jobs_for_tenant, save_scan_bundle
from app.tenants.service import create_tenant, issue_api_key, revoke_api_key
from app.models.canonical import CanonicalProblem


class TenantIsolationTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ["QTANGL_ADMIN_API_KEY"] = "admin-test-key"
        self._reset_engine()
        init_db()
        self.client = TestClient(app)
        tenant = create_tenant(name="Acme Bank", tenant_id="tenant-acme")
        key_payload = issue_api_key(tenant_id=tenant["tenantId"], label="primary")
        self.tenant_id = tenant["tenantId"]
        self.tenant_key = key_payload["apiKey"]
        other = create_tenant(name="Other Co", tenant_id="tenant-other")
        other_key = issue_api_key(tenant_id=other["tenantId"])
        self.other_key = other_key["apiKey"]

    def tearDown(self) -> None:
        self._reset_engine()
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("QTANGL_ADMIN_API_KEY", None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None

    def test_cross_tenant_scan_access_denied(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id=self.tenant_id)

        own = self.client.get(
            f"/tenant/scans/{bundle.scan_id}",
            headers={"Authorization": f"Bearer {self.tenant_key}"},
        )
        self.assertEqual(own.status_code, 200)

        foreign = self.client.get(
            f"/tenant/scans/{bundle.scan_id}",
            headers={"Authorization": f"Bearer {self.other_key}"},
        )
        self.assertEqual(foreign.status_code, 404)

    def test_admin_issue_and_revoke_key(self) -> None:
        issue = self.client.post(
            f"/admin/tenants/{self.tenant_id}/keys",
            headers={"Authorization": "Bearer admin-test-key"},
            json={"label": "rotated"},
        )
        self.assertEqual(issue.status_code, 200)
        new_key = issue.json()["apiKey"]

        me = self.client.get("/tenant/me", headers={"Authorization": f"Bearer {new_key}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["tenantId"], self.tenant_id)

        revoke = self.client.delete(
            f"/admin/keys/{issue.json()['keyId']}",
            headers={"Authorization": "Bearer admin-test-key"},
        )
        self.assertEqual(revoke.status_code, 200)
        revoked = self.client.get("/tenant/me", headers={"Authorization": f"Bearer {new_key}"})
        self.assertEqual(revoked.status_code, 401)

    def test_tenant_dashboard_lists_scans(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id=self.tenant_id)

        response = self.client.get(
            "/tenant/scans",
            headers={"Authorization": f"Bearer {self.tenant_key}"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["count"], 1)
        scan_ids = {item["scanId"] for item in payload["scans"]}
        self.assertIn(bundle.scan_id, scan_ids)


class RoutingHybridTest(unittest.TestCase):
    def test_routing_repair_window_evaluates_alternates(self) -> None:
        problem = CanonicalProblem(
            type="routing",
            raw={
                "depot": {"id": "depot", "x": 0, "y": 0},
                "vehicles": [{"id": "van-1", "capacity": 4}],
                "stops": [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}],
                "coordinates": {
                    "depot": {"x": 0, "y": 0},
                    "a": {"x": 4, "y": 0},
                    "b": {"x": 0, "y": 4},
                    "c": {"x": -4, "y": 0},
                    "d": {"x": 0, "y": -4},
                },
            },
        )
        classical = solve_routing_classically(problem)
        self.assertTrue(classical.feasible)
        result = apply_routing_repair_window(problem, classical)
        self.assertGreaterEqual(result.metrics.get("distinctFeasiblePlans", 1), 2)
        self.assertIn("orchestration", result.diagnostics)

    def test_optimize_routing_returns_repair_window_metrics(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/optimize",
            headers={"Authorization": "Bearer qtangl-demo-key"},
            json={
                "type": "routing",
                "vehicles": [{"id": "van-1", "capacity": 4}],
                "stops": [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}],
                "data": {
                    "depot": {"id": "depot", "x": 0, "y": 0},
                    "coordinates": {
                        "a": {"x": 4, "y": 0},
                        "b": {"x": 0, "y": 4},
                        "c": {"x": -4, "y": 0},
                        "d": {"x": 0, "y": -4},
                    },
                },
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("distinctFeasiblePlans", payload["metrics"])
        self.assertIn("localRepairWindowStopCount", payload["metrics"])


class WorkerPayloadTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        os.environ["DATABASE_URL"] = f"sqlite:///{self._tmpdir.name}/test.db"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        import app.db.engine as engine_module

        engine_module._engine = None
        engine_module._SessionLocal = None
        init_db()

    def tearDown(self) -> None:
        import app.db.engine as engine_module

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        os.environ.pop("DATABASE_URL", None)
        self._tmpdir.cleanup()

    def test_create_job_stores_payload_for_worker(self) -> None:
        scan_id = create_job(
            tenant_id="tenant-worker",
            payload={"scenarioId": "bank-tls-inventory", "tenantId": "tenant-worker", "seed": 99},
        )
        job = get_job(scan_id, tenant_id="tenant-worker")
        self.assertIsNotNone(job)
        self.assertEqual(job.status, "running")
        scans = list_jobs_for_tenant(tenant_id="tenant-worker")
        self.assertEqual(scans[0]["scanId"], scan_id)


if __name__ == "__main__":
    unittest.main()
