"""Tests for incremental authorized-domain add/remove."""

from __future__ import annotations

import unittest
from typing import Any
from unittest.mock import patch

from app.tenant.settings import (
    DEFAULT_SETTINGS,
    append_tenant_scan_allowlist,
    get_tenant_scan_allowlist,
    remove_tenant_scan_allowlist,
)


class TenantAllowlistMutationTest(unittest.TestCase):
    tenant_id = "allowlist-mutation-test"
    store: dict[str, dict[str, Any]]

    def setUp(self) -> None:
        self.store = {self.tenant_id: dict(DEFAULT_SETTINGS)}

    def _get_raw(self, *, tenant_id: str) -> dict[str, Any]:
        return dict(self.store.get(tenant_id, DEFAULT_SETTINGS))

    def _upsert(self, *, tenant_id: str, settings: dict[str, Any]) -> dict[str, Any]:
        merged = dict(self.store.get(tenant_id, DEFAULT_SETTINGS))
        merged.update(settings)
        self.store[tenant_id] = merged
        return merged

    def test_append_and_remove_domain(self) -> None:
        with patch("app.tenant.settings.get_tenant_settings_raw", side_effect=self._get_raw), patch(
            "app.tenant.settings.upsert_tenant_settings", side_effect=self._upsert
        ):
            append_tenant_scan_allowlist(tenant_id=self.tenant_id, domain="https://qtangl.com")
            append_tenant_scan_allowlist(tenant_id=self.tenant_id, domain="api.qtangl.com")
            self.assertEqual(get_tenant_scan_allowlist(tenant_id=self.tenant_id), ["qtangl.com", "api.qtangl.com"])

            append_tenant_scan_allowlist(tenant_id=self.tenant_id, domain="qtangl.com")
            self.assertEqual(get_tenant_scan_allowlist(tenant_id=self.tenant_id), ["qtangl.com", "api.qtangl.com"])

            remove_tenant_scan_allowlist(tenant_id=self.tenant_id, domain="qtangl.com")
            self.assertEqual(get_tenant_scan_allowlist(tenant_id=self.tenant_id), ["api.qtangl.com"])


if __name__ == "__main__":
    unittest.main()
