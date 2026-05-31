from __future__ import annotations

import os
import tempfile
import unittest

from sqlalchemy import create_engine, text

from app.db.engine import init_db
from app.db.models import ApiKey


class SchemaPatchTest(unittest.TestCase):
    def test_init_db_adds_missing_api_keys_role_column(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "legacy.db")
            engine = create_engine(f"sqlite:///{db_path}")
            with engine.begin() as conn:
                conn.execute(
                    text(
                        """
                        CREATE TABLE tenants (
                            id VARCHAR(64) PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            created_at DATETIME
                        )
                        """
                    )
                )
                conn.execute(
                    text(
                        """
                        CREATE TABLE api_keys (
                            id VARCHAR(64) PRIMARY KEY,
                            tenant_id VARCHAR(64) NOT NULL,
                            key_hash VARCHAR(128) NOT NULL,
                            label VARCHAR(255) NOT NULL,
                            revoked_at DATETIME,
                            created_at DATETIME
                        )
                        """
                    )
                )
            engine.dispose()

            os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
            os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
            import app.db.engine as engine_module

            engine_module._engine = None
            engine_module._SessionLocal = None
            try:
                init_db()
                with engine_module.db_session() as session:
                    row = session.query(ApiKey).first()
                    self.assertIsNotNone(row)
                    self.assertEqual(row.role, "admin")
            finally:
                if engine_module._engine is not None:
                    engine_module._engine.dispose()
                engine_module._engine = None
                engine_module._SessionLocal = None
                os.environ.pop("DATABASE_URL", None)


if __name__ == "__main__":
    unittest.main()
