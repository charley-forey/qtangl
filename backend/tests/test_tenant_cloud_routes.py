"""Regression: cloud integration routes must not collide with GRC routes."""

from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
_HEADERS = {"Authorization": "Bearer qtangl-demo-key"}


def test_cloud_integration_save_uses_cloud_path():
    with patch("app.integrations.cloud.upsert_cloud_integration") as mock_upsert:
        mock_upsert.return_value = {"provider": "aws", "configured": True}
        response = client.post(
            "/tenant/integrations/cloud/aws",
            json={"region": "us-east-1"},
            headers=_HEADERS,
        )
    assert response.status_code == 200
    mock_upsert.assert_called_once()
    assert mock_upsert.call_args.kwargs["provider"] == "aws"


def test_grc_integration_save_uses_grc_path():
    with patch("app.integrations.service.upsert_integration") as mock_upsert:
        mock_upsert.return_value = {"provider": "jira", "configured": True}
        response = client.post(
            "/tenant/integrations/jira",
            json={"config": {"baseUrl": "https://example.atlassian.net", "apiToken": "x"}},
            headers=_HEADERS,
        )
    assert response.status_code == 200
    mock_upsert.assert_called_once()
