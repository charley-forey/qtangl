from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from app.monitoring.estate_catalog import ESTATE_ALLOWLIST_DOMAINS, LIVE_MONITOR_TARGETS


class MonitorEstateCatalogTest(unittest.TestCase):
    def test_live_targets_include_qtangl_and_oqs(self) -> None:
        targets = {row["target"] for row in LIVE_MONITOR_TARGETS}
        self.assertIn("qtangl.com", targets)
        self.assertIn("www.qtangl.com", targets)
        self.assertIn("api.qtangl.com", targets)
        self.assertIn("test.openquantumsafe.org", targets)
        self.assertGreaterEqual(len(LIVE_MONITOR_TARGETS), 6)

    def test_allowlist_matches_live_targets(self) -> None:
        self.assertEqual(set(ESTATE_ALLOWLIST_DOMAINS), {row["target"] for row in LIVE_MONITOR_TARGETS})


class ResolveTenantByEmailTest(unittest.TestCase):
    @patch("app.db.engine.db_session")
    def test_resolve_prefers_internal_hq(self, mock_db_session: MagicMock) -> None:
        import importlib.util
        import os

        script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "seed_monitor_estate.py")
        spec = importlib.util.spec_from_file_location("seed_monitor_estate", script_path)
        mod = importlib.util.module_from_spec(spec)
        assert spec.loader is not None
        spec.loader.exec_module(mod)

        user = MagicMock()
        user.id = "usr-1"
        membership_hq = MagicMock(role="admin")
        tenant_hq = MagicMock(id="t-hq", name="Qtangl HQ")
        membership_other = MagicMock(role="admin")
        tenant_other = MagicMock(id="t-other", name="Side project")

        session = MagicMock()
        session.query.return_value.filter.return_value.first.return_value = user
        session.query.return_value.join.return_value.filter.return_value.all.return_value = [
            (membership_other, tenant_other),
            (membership_hq, tenant_hq),
        ]
        mock_db_session.return_value.__enter__.return_value = session

        with (
            patch("app.db.config.persistence_enabled", return_value=True),
            patch("app.tenant.settings.get_tenant_settings_raw") as mock_settings,
        ):
            mock_settings.side_effect = lambda *, tenant_id: (
                {"orgType": "internal_hq"} if tenant_id == "t-hq" else {}
            )
            tenant_id = mod.resolve_tenant_id_by_email("charley@qtangl.com")

        self.assertEqual(tenant_id, "t-hq")


if __name__ == "__main__":
    unittest.main()
