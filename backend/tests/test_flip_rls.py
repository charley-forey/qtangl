"""RLS and security assertions for crypto flip."""

from __future__ import annotations

import unittest


class FlipRlsTests(unittest.TestCase):
    def test_crypto_flip_jobs_in_rls_tables(self) -> None:
        from app.db.rls import _TENANT_TABLES

        self.assertIn("crypto_flip_jobs", _TENANT_TABLES)
        self.assertIn("flip_approvals", _TENANT_TABLES)
