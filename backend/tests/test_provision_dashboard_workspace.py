from __future__ import annotations

import unittest
from unittest.mock import patch

from app.billing.service import internal_signup_tier, provision_dashboard_workspace


class ProvisionDashboardWorkspaceTest(unittest.TestCase):
    def test_internal_signup_tier_for_qtangl_email(self) -> None:
        with patch.dict("os.environ", {"QTANGL_INTERNAL_TIER": "enterprise"}, clear=False):
            self.assertEqual(internal_signup_tier("charley@qtangl.com"), "enterprise")

    def test_internal_signup_tier_none_for_external_email(self) -> None:
        self.assertIsNone(internal_signup_tier("user@example.com"))

    def test_provision_qtangl_email_uses_internal_tier(self) -> None:
        with patch("app.billing.service.dashboard_self_serve_signup_enabled", return_value=True):
            with patch("app.db.config.persistence_enabled", return_value=True):
                with patch("app.billing.service._provision_tenant_core") as mock_core:
                    mock_core.return_value = {
                        "tenantId": "t-hq",
                        "tenantName": "Qtangl",
                        "role": "admin",
                        "membershipId": "mem-1",
                    }
                    with patch("app.tenant.settings.upsert_tenant_settings") as mock_settings:
                        with patch("app.audit.service.log_action") as mock_audit:
                            with patch.dict("os.environ", {"QTANGL_INTERNAL_TIER": "enterprise"}, clear=False):
                                result = provision_dashboard_workspace(
                                    user_id="usr-1",
                                    email="charley@qtangl.com",
                                    name="Qtangl",
                                )
        self.assertEqual(result["tenantId"], "t-hq")
        mock_core.assert_called_once()
        self.assertEqual(mock_core.call_args.kwargs["tier"], "enterprise")
        mock_settings.assert_called_once()
        mock_audit.assert_called_once()


if __name__ == "__main__":
    unittest.main()
