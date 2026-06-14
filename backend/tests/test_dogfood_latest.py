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

    def test_dogfood_scan_verifies_end_to_end(self) -> None:
        """Full path with the REAL enrichment + persistence: a scan saved under a fixed
        id must be retrievable and verify as valid under that same id (regression for the
        dogfood content-hash mismatch and scan-id divergence)."""
        dataset = load_dataset()
        bundle = run_pqc_scan(
            dataset,
            scenario_id="bank-tls-inventory",
            use_fixture=True,
            target_override="www.qtangl.com",
            scan_id="scan-e2e-dogfood-id",
        )
        # No enrich mock here — exercises the real sign-for-storage path.
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="dogfood")

        verify = self.client.get(f"/pqc/verify/{bundle.scan_id}")
        self.assertEqual(verify.status_code, 200, msg=verify.text)
        self.assertTrue(verify.json()["verification"]["valid"], msg=verify.text)

        latest = self.client.get("/pqc/dogfood/latest")
        self.assertEqual(latest.status_code, 200)
        data = latest.json()
        self.assertEqual(data["scanId"], "scan-e2e-dogfood-id")
        self.assertTrue(data["verification"]["valid"], msg=latest.text)


if __name__ == "__main__":
    unittest.main()
