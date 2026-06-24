from __future__ import annotations

import unittest
from typing import Any
from unittest.mock import patch

from app.branding.logo_fetch import fetch_logo_bytes
from app.branding.resolve import resolve_branding
from app.tenant.settings import DEFAULT_SETTINGS


class BrandingResolveTest(unittest.TestCase):
    store: dict[str, dict[str, Any]]

    def setUp(self) -> None:
        self.store = {}

    def _get_raw(self, *, tenant_id: str) -> dict[str, Any]:
        base = dict(DEFAULT_SETTINGS)
        base.update(self.store.get(tenant_id, {}))
        return base

    def test_child_overrides_parent_report_branding(self) -> None:
        parent_id = "mssp-parent-branding-test"
        child_id = "mssp-child-branding-test"
        self.store[parent_id] = {
            "reportBranding": {
                "companyName": "Parent Corp",
                "logoUrl": "https://cdn.example.com/parent.png",
                "primaryColor": "#111111",
                "footerText": "Parent footer",
            },
            "portalBranding": {
                "headerText": "Parent Portal",
                "primaryColor": "#222222",
            },
        }
        self.store[child_id] = {
            "msspParentTenantId": parent_id,
            "reportBranding": {
                "companyName": "Child Bank",
                "primaryColor": "",
            },
            "portalBranding": {
                "accentColor": "#abcdef",
            },
        }
        with patch("app.branding.resolve.get_tenant_settings_raw", side_effect=self._get_raw):
            resolved = resolve_branding(child_id)
        report = resolved["reportBranding"]
        portal = resolved["portalBranding"]
        self.assertEqual(report["companyName"], "Child Bank")
        self.assertEqual(report["logoUrl"], "https://cdn.example.com/parent.png")
        self.assertEqual(report["footerText"], "Parent footer")
        self.assertEqual(portal["headerText"], "Parent Portal")
        self.assertEqual(portal["accentColor"], "#abcdef")
        self.assertEqual(portal["primaryColor"], "#222222")

    def test_defaults_when_no_parent(self) -> None:
        tenant_id = "standalone-branding-test"
        self.store[tenant_id] = {"reportBranding": {"companyName": "Solo Co"}}
        with patch("app.branding.resolve.get_tenant_settings_raw", side_effect=self._get_raw):
            resolved = resolve_branding(tenant_id)
        self.assertEqual(resolved["reportBranding"]["companyName"], "Solo Co")
        self.assertEqual(
            resolved["portalBranding"]["headerText"],
            DEFAULT_SETTINGS["portalBranding"]["headerText"],
        )


class LogoFetchTest(unittest.TestCase):
    def test_rejects_non_https(self) -> None:
        self.assertIsNone(fetch_logo_bytes("http://example.com/logo.png"))

    def test_rejects_empty_url(self) -> None:
        self.assertIsNone(fetch_logo_bytes(""))

    @patch("app.branding.logo_fetch.safe_urlopen")
    def test_returns_bytes_for_valid_https_logo(self, mock_open) -> None:
        class FakeResponse:
            headers = {"content-type": "image/png"}

            def read(self) -> bytes:
                return b"\x89PNGfake"

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        mock_open.return_value = FakeResponse()
        data = fetch_logo_bytes("https://cdn.example.com/logo.png")
        self.assertEqual(data, b"\x89PNGfake")


if __name__ == "__main__":
    unittest.main()
