from __future__ import annotations

import os
import tempfile
import unittest

from app.db.config import production_mode, require_secrets_key
from app.db.engine import init_db, validate_production_config


class EnterprisePhase2Test(unittest.TestCase):
    def test_production_requires_secrets_key(self) -> None:
        os.environ["QTANGL_ENV"] = "production"
        os.environ.pop("QTANGL_SECRETS_KEY", None)
        with self.assertRaises(RuntimeError):
            validate_production_config()
        os.environ.pop("QTANGL_ENV", None)

    def test_production_rejects_invalid_secrets_key(self) -> None:
        os.environ["QTANGL_ENV"] = "production"
        os.environ["QTANGL_SECRETS_KEY"] = "not-a-valid-fernet-key"
        with self.assertRaises(RuntimeError):
            validate_production_config()
        os.environ.pop("QTANGL_ENV", None)
        os.environ.pop("QTANGL_SECRETS_KEY", None)

    def test_encrypt_survives_invalid_secrets_key(self) -> None:
        from app.security.secrets import encrypt_json_blob, is_valid_fernet_key

        os.environ["QTANGL_SECRETS_KEY"] = "not-a-valid-fernet-key"
        self.assertFalse(is_valid_fernet_key(os.environ["QTANGL_SECRETS_KEY"]))
        stored = encrypt_json_blob({"trialScansUsed": 1})
        self.assertFalse(stored.startswith("enc:"))
        os.environ.pop("QTANGL_SECRETS_KEY", None)

    def test_offboard_removes_tenant_rows(self) -> None:
        from fastapi.testclient import TestClient

        from app.db.engine import init_db
        from app.db.offboarding import offboard_tenant
        from app.main import app
        from app.pqc.data import load_dataset
        from app.pqc.pipeline import run_pqc_scan
        from app.store.scan_jobs import save_scan_bundle
        from app.tenants.service import create_tenant, issue_api_key

        tmp = tempfile.TemporaryDirectory()
        db_path = os.path.join(tmp.name, "offboard.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        import app.db.engine as engine_module

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        init_db()
        tenant = create_tenant(name="Offboard Co", tenant_id="tenant-off")
        key = issue_api_key(tenant_id=tenant["tenantId"], role="admin")["apiKey"]
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id="tenant-off")
        counts = offboard_tenant(tenant_id="tenant-off")
        self.assertGreaterEqual(counts.get("scans", 0), 1)
        client = TestClient(app)
        response = client.get("/tenant/scans", headers={"Authorization": f"Bearer {key}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 0)
        import app.db.engine as engine_module

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        os.environ.pop("DATABASE_URL", None)
        tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
