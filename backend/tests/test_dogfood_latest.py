"""Tests for public dogfood latest endpoint."""

from __future__ import annotations

import os
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.store.scan_jobs import save_scan_bundle


class DogfoodLatestTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ["QTANGL_DOGFOOD_TENANT_ID"] = "dogfood"
        os.environ["QTANGL_ENABLE_TRANSPARENCY_LOG"] = "false"
        self._reset_engine()
        init_db()
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self._reset_engine()
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("QTANGL_DOGFOOD_TENANT_ID", None)
        os.environ.pop("QTANGL_ENABLE_TRANSPARENCY_LOG", None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None

    def test_dogfood_latest_404_when_empty(self) -> None:
        response = self.client.get("/pqc/dogfood/latest")
        self.assertEqual(response.status_code, 404)

    def test_dogfood_latest_returns_scan(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(
            dataset,
            scenario_id="bank-tls-inventory",
            use_fixture=True,
            target_override="www.qtangl.com",
        )
        with patch(
            "app.monitoring.post_complete.enrich_completed_scan",
            side_effect=lambda scan_id, b, tenant_id: b,
        ):
            save_scan_bundle(bundle.scan_id, bundle, tenant_id="dogfood")

        response = self.client.get("/pqc/dogfood/latest")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["scanId"], bundle.scan_id)
        self.assertEqual(data["targetDomain"], "www.qtangl.com")
        self.assertIn("verifyUrl", data)
        self.assertTrue(data["verification"]["valid"])


if __name__ == "__main__":
    unittest.main()
