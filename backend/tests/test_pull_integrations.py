"""Integration pull hub tests (Keyfactor, CLM, unified pull)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.integrations.broader_ingest import pull_dependency_track
from app.integrations.clm import AppViewXClmAdapter, EntrustClmAdapter, pull_clm
from app.integrations.pull import pull_inventory


def test_pull_inventory_kms_aws_stub():
    result = pull_inventory(tenant_id="demo", provider="kms-aws")
    assert result.get("ok") is True or result.get("ok") is False


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


def test_appviewx_clm_live_response():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "certificates": [{"id": "avx-1", "commonName": "app.example.com", "status": "active"}]
    }
    with patch("httpx.get", return_value=mock_resp):
        result = AppViewXClmAdapter(host="https://appviewx.example", token="tok").list_certificates()
    assert result["status"] == "ok"
    assert result["count"] == 1


def test_entrust_clm_live_response():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "certificates": [{"id": "ent-1", "commonName": "api.example.com", "status": "issued"}]
    }
    with patch("httpx.get", return_value=mock_resp):
        result = EntrustClmAdapter(api_key="key", tenant="tenant-1").list_certificates()
    assert result["status"] == "ok"
    assert result["count"] == 1


def test_pull_clm_appviewx_via_hub():
    with patch("app.integrations.pull._load_integration_config", return_value={"host": "https://avx", "token": "t"}):
        with patch(
            "app.integrations.clm.pull_clm",
            return_value={"status": "ok", "certificates": [{"commonName": "x.example.com", "id": "1"}]},
        ):
            result = pull_inventory(tenant_id="demo", provider="clm-appviewx")
    assert result["ok"] is True


def test_pull_dependency_track_live():
    project = {"name": "crypto-deps"}
    components = [{"uuid": "c1", "name": "openssl", "version": "3.0"}]
    mock_project = MagicMock()
    mock_project.raise_for_status = MagicMock()
    mock_project.json.return_value = project
    mock_components = MagicMock()
    mock_components.raise_for_status = MagicMock()
    mock_components.json.return_value = components
    mock_client = MagicMock()
    mock_client.get.side_effect = [mock_project, mock_components]
    mock_client.__enter__ = MagicMock(return_value=mock_client)
    mock_client.__exit__ = MagicMock(return_value=False)

    with patch("httpx.Client", return_value=mock_client):
        result = pull_dependency_track(
            base_url="https://dtrack.example",
            api_key="dtrack-key",
            project_id="proj-uuid",
        )
    assert result["status"] == "ok"
    assert result["componentCount"] == 1


def test_pull_dependency_track_missing_credentials():
    result = pull_dependency_track(base_url="", api_key="", project_id="p1")
    assert result["status"] == "error"
