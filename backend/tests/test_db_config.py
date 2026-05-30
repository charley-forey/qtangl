from __future__ import annotations

import unittest

from app.auth import get_rate_limit
from app.db.config import normalize_database_url


class DatabaseUrlNormalizationTest(unittest.TestCase):
    def test_postgresql_scheme_uses_psycopg3_driver(self) -> None:
        url = normalize_database_url("postgresql://user:pass@host:5432/railway")
        self.assertEqual(url, "postgresql+psycopg://user:pass@host:5432/railway")

    def test_postgres_scheme_uses_psycopg3_driver(self) -> None:
        url = normalize_database_url("postgres://user:pass@host:5432/railway")
        self.assertEqual(url, "postgresql+psycopg://user:pass@host:5432/railway")

    def test_psycopg_scheme_left_unchanged(self) -> None:
        url = "postgresql+psycopg://user:pass@host:5432/qtangl"
        self.assertEqual(normalize_database_url(url), url)

    def test_sqlite_left_unchanged(self) -> None:
        url = "sqlite:///tmp/test.db"
        self.assertEqual(normalize_database_url(url), url)

    def test_rate_limit_floor_when_env_too_low(self) -> None:
        import os
        from unittest.mock import patch

        with patch.dict(os.environ, {"QTANGL_RATE_LIMIT_PER_MINUTE": "10"}):
            self.assertEqual(get_rate_limit(), 300)


if __name__ == "__main__":
    unittest.main()
