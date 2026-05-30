from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.main import app
from app.pqc.jobs import create_job, get_job, save_scan_bundle
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.sessions import create_session, get_session


class PersistenceStoreTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None
        init_db()

    def tearDown(self) -> None:
        import app.db.engine as engine_module

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        os.environ.pop("DATABASE_URL", None)
        import app.pqc.sessions as pqc_sessions

        pqc_sessions._store = None
        self._tmpdir.cleanup()

    def test_upload_session_survives_new_process_simulation(self) -> None:
        session_id = create_session([{"host": "api.example.com", "port": 443}], tenant_id="sandbox")
        payload = get_session(session_id, tenant_id="sandbox")
        self.assertEqual(payload[0]["host"], "api.example.com")

    def test_scan_bundle_persisted_for_report_download(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="sandbox")
        job = get_job(bundle.scan_id, tenant_id="sandbox")
        self.assertIsNotNone(job)
        self.assertEqual(job.status, "done")
        self.assertIsNotNone(job.bundle)


class OptimizeRoutingAllocationTest(unittest.TestCase):
    def test_routing_optimize_returns_routes(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/optimize",
            headers={"Authorization": "Bearer qtangl-demo-key"},
            json={
                "type": "routing",
                "vehicles": [{"id": "van-1", "capacity": 3}],
                "stops": [{"id": "stop-a"}, {"id": "stop-b"}, {"id": "stop-c"}],
                "data": {
                    "depot": {"id": "depot", "x": 0, "y": 0},
                    "coordinates": {
                        "stop-a": {"x": 1, "y": 1},
                        "stop-b": {"x": 2, "y": 0},
                        "stop-c": {"x": 1, "y": 2},
                    },
                },
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertGreaterEqual(len(payload["solution"]), 1)
        self.assertIn("routeCount", payload["metrics"])

    def test_allocation_optimize_assigns_shifts(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/optimize",
            headers={"Authorization": "Bearer qtangl-demo-key"},
            json={
                "type": "allocation",
                "staff": [
                    {"name": "Alice", "skills": ["RN"], "maxHours": 40},
                    {"name": "Bob", "skills": ["RN"], "maxHours": 40},
                ],
                "shifts": [
                    {"id": "day-icu", "requiredSkill": "RN"},
                    {"id": "night-icu", "requiredSkill": "RN"},
                ],
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertEqual(len(payload["solution"]), 2)


if __name__ == "__main__":
    unittest.main()
