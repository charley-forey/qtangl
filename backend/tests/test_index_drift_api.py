"""Public drift index API."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_index_drift_public():
    response = client.get("/pqc/index/drift?industry=financial")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert "drift" in payload
