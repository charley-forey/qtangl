"""Integration pull hub tests (Keyfactor, CLM, unified pull)."""

from __future__ import annotations

from unittest.mock import patch

from app.integrations.pull import pull_inventory


def test_pull_inventory_unsupported_provider():
    result = pull_inventory(tenant_id="demo", provider="unknown-vendor")
    assert result["ok"] is False


def test_pull_keyfactor_without_config():
    with patch("app.integrations.pull._load_integration_config", return_value={}):
        result = pull_inventory(tenant_id="demo", provider="keyfactor")
    assert result["ok"] is False


def test_pull_clm_digicert_stub():
    with patch("app.integrations.pull._load_integration_config", return_value={"apiKey": "x"}):
        with patch(
            "app.integrations.clm.pull_clm",
            return_value={"status": "stub", "certificates": [{"commonName": "test.example.com", "id": "1"}]},
        ):
            result = pull_inventory(tenant_id="demo", provider="clm-digicert")
    assert result["ok"] is True
    assert result["componentCount"] == 1


def test_pull_kubernetes_delegates_to_cloud():
    with patch(
        "app.integrations.cloud.pull_cloud_inventory",
        return_value={"ok": True, "provider": "kubernetes", "document": {"components": []}},
    ):
        result = pull_inventory(tenant_id="demo", provider="kubernetes")
    assert result["ok"] is True
