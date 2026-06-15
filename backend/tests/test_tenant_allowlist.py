"""Tests for per-tenant scan allowlist and demo vs production safety policy."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from app.pqc.safety import ScanSafetyError, assert_scannable, resolve_scannable


class TenantAllowlistSafetyTest(unittest.TestCase):
    def test_sandbox_blocks_arbitrary_domain(self) -> None:
        env = {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}
        with patch.dict(os.environ, env, clear=False):
            with self.assertRaises(ScanSafetyError):
                assert_scannable("customer-bank.com", port=443, tenant_id="sandbox")

    def test_sandbox_allows_oqs_demo_host(self) -> None:
        env = {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}
        with patch.dict(os.environ, env, clear=False):
            with patch("app.pqc.safety._validated_ips", return_value=["1.2.3.4"]):
                host = assert_scannable("test.openquantumsafe.org", port=443, tenant_id="sandbox")
        self.assertEqual(host, "test.openquantumsafe.org")

    def test_production_requires_tenant_allowlist(self) -> None:
        env = {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}
        with patch.dict(os.environ, env, clear=False):
            with patch("app.pqc.safety._tenant_allowlist", return_value=set()):
                with self.assertRaises(ScanSafetyError):
                    assert_scannable("api.customer.com", port=443, tenant_id="pilot-bank")

    def test_production_allows_listed_domain(self) -> None:
        env = {"QTANGL_PQC_ENABLE_LIVE_SCAN": "true"}
        with patch.dict(os.environ, env, clear=False):
            with patch("app.pqc.safety._tenant_allowlist", return_value={"api.customer.com"}):
                with patch("app.pqc.safety._validated_ips", return_value=["93.184.216.34"]):
                    target = resolve_scannable("api.customer.com", port=443, tenant_id="pilot-bank")
        self.assertEqual(target.host, "api.customer.com")


if __name__ == "__main__":
    unittest.main()
