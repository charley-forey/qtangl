from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_demo_status_public(client: TestClient):
    response = client.get("/demo/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["simulation"] is True
    assert "resources" in payload


def test_demo_reassess_requires_auth(client: TestClient):
    response = client.post("/demo/reassess")
    assert response.status_code in {401, 403}


def test_demo_scene_list(client: TestClient):
    response = client.get("/demo/scenes")
    assert response.status_code == 200
    scenes = response.json()["scenes"]
    assert any(s["id"] == "rollout-pqc-fleet" for s in scenes)
