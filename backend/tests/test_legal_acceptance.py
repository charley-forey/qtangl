from __future__ import annotations

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from app.billing.legal import check_legal_acceptance
from app.db.engine import init_db
from app.main import app
from app.tenant.settings import get_tenant_billing_flags
from app.tenants.service import create_tenant, issue_api_key


class LegalAcceptanceTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "legal.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        self._reset_engine()
        init_db()
        tenant = create_tenant(name="Legal Co", tenant_id="tenant-legal")
        self.tenant_key = issue_api_key(tenant_id=tenant["tenantId"])["apiKey"]
        self.client = TestClient(app)
        self.headers = {"Authorization": f"Bearer {self.tenant_key}"}

    def tearDown(self) -> None:
        self._reset_engine()
        for key in ("DATABASE_URL", "QTANGL_DB_AUTO_MIGRATE"):
            os.environ.pop(key, None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None

    def test_legal_acceptance_required_before_accept(self) -> None:
        err = check_legal_acceptance(tenant_id="tenant-legal")
        self.assertIsNotNone(err)
        self.assertEqual(err["code"], "legal_acceptance_required")

    def test_legal_accept_persists_billing_flags(self) -> None:
        response = self.client.post(
            "/tenant/legal/accept",
            headers=self.headers,
            json={"termsVersion": "2026-06-08", "scanAuthorization": True, "domain": "example.com"},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "success")
        billing = body["billing"]
        self.assertEqual(billing["termsVersion"], "2026-06-08")
        self.assertIsNotNone(billing["termsAcceptedAt"])
        self.assertIsNotNone(billing["scanAuthorizationAt"])

        stored = get_tenant_billing_flags(tenant_id="tenant-legal")
        self.assertEqual(stored["termsVersion"], "2026-06-08")
        self.assertIsNone(check_legal_acceptance(tenant_id="tenant-legal"))


if __name__ == "__main__":
    unittest.main()
