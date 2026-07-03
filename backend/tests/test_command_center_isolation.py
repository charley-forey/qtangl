"""Tenant isolation tests for Command Center Next Wave endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_scan_graph_rejects_unknown_scan():
    response = client.get(
        "/tenant/scans/nonexistent-scan/graph",
        headers={"Authorization": "Bearer qtangl-demo-key"},
    )
    assert response.status_code in {401, 404}


def test_hndl_exposure_requires_auth():
    response = client.get("/tenant/hndl/exposure")
    assert response.status_code in {401, 403, 422}


def test_saved_views_requires_auth():
    response = client.get("/tenant/saved-views")
    assert response.status_code in {401, 403, 422}
