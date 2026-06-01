from __future__ import annotations

import os
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.auth import AuthDatabaseError, hash_api_key
from app.db.engine import db_session, init_db
from app.db.models import ApiKey
from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.store.scan_jobs import save_scan_bundle
from app.tenants.service import create_tenant, issue_api_key


class EnterpriseHardeningPhase1Test(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "test.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ.pop("QTANGL_DEBUG", None)
        self._reset_engine()
        init_db()
        self.client = TestClient(app, raise_server_exceptions=False)
        tenant = create_tenant(name="Acme", tenant_id="tenant-acme")
        self.tenant_key = issue_api_key(tenant_id=tenant["tenantId"])["apiKey"]

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

    def test_auth_db_error_returns_503_not_sandbox(self) -> None:
        with patch("app.auth._token_registered", side_effect=AuthDatabaseError("down")):
            response = self.client.get(
                "/tenant/me",
                headers={"Authorization": f"Bearer {self.tenant_key}"},
            )
        self.assertEqual(response.status_code, 503)
        self.assertIn("unavailable", response.json()["detail"].lower())

    def test_viewer_role_blocked_on_write(self) -> None:
        viewer_key = "qtangl_viewer_test_key_abc"
        with db_session() as session:
            session.add(
                ApiKey(
                    id="key-viewer-test",
                    tenant_id="tenant-acme",
                    key_hash=hash_api_key(viewer_key),
                    label="viewer",
                    role="viewer",
                )
            )
        response = self.client.post(
            "/tenant/schedules",
            headers={"Authorization": f"Bearer {viewer_key}"},
            json={"scenarioId": "bank-tls-inventory", "cadenceHours": 168},
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("viewer", response.json()["detail"].lower())

    def test_verify_unknown_scan_returns_404_without_sandbox_fallback(self) -> None:
        response = self.client.get("/pqc/verify/scan-does-not-exist-xyz")
        self.assertEqual(response.status_code, 404)

    def test_verify_finds_scan_by_id_not_tenant_sandbox_only(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-acme")

        response = self.client.get(f"/pqc/verify/{bundle.scan_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["scanId"], bundle.scan_id)

    def test_exception_handler_hides_internals_by_default(self) -> None:
        with patch("app.api.tenant.list_jobs_for_tenant", side_effect=RuntimeError("secret-db-password")):
            response = self.client.get(
                "/tenant/scans",
                headers={"Authorization": f"Bearer {self.tenant_key}"},
            )
        self.assertEqual(response.status_code, 500)
        body = response.json()
        self.assertNotIn("secret-db-password", body.get("message", ""))
        self.assertNotIn("detail", body)

    def test_exception_handler_shows_detail_when_debug(self) -> None:
        os.environ["QTANGL_DEBUG"] = "true"
        with patch("app.api.tenant.list_jobs_for_tenant", side_effect=RuntimeError("debug-visible")):
            response = self.client.get(
                "/tenant/scans",
                headers={"Authorization": f"Bearer {self.tenant_key}"},
            )
        os.environ.pop("QTANGL_DEBUG", None)
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json().get("detail"), "debug-visible")


if __name__ == "__main__":
    unittest.main()
