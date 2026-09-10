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


def test_resource_findings_match_endpoint_and_kind_without_changing_report():
    from copy import deepcopy
    from app.demo.registry import DemoResource
    from app.demo.service import _per_resource_status

    resources = [
        DemoResource("tls-original", "TLS", "tls", "PAYMENTS.example.", 443, "Payments", "classical", "general"),
        DemoResource("jwks-original", "Keys", "jwks", "payments.example", 443, "Payments", "classical", "general"),
    ]
    bundle = {"report": {"readinessScore": 82.8, "signature": "unchanged"}, "assets": [
        {"id": "upload-2", "host": "payments.example", "port": 443, "kind": "jwks", "vulnerability": {"severity": "unknown", "status": "unknown"}},
        {"id": "upload-1", "host": "payments.example", "port": 443, "kind": "tls", "vulnerability": {"severity": "high", "status": "vulnerable"}},
    ]}
    original = deepcopy(bundle)
    rows = _per_resource_status(bundle, resources)
    assert [(row["severity"], row["status"]) for row in rows] == [("high", "vulnerable"), ("unknown", "unknown")]
    assert all(row["readinessScore"] is None for row in rows)
    assert bundle == original


def test_resource_matching_prefers_id_and_rejects_ambiguity_and_disabled():
    from app.demo.registry import DemoResource
    from app.demo.service import _per_resource_status
    from app.demo.assess import resources_to_uploaded_rows

    resource = DemoResource("original", "TLS", "tls", "example.test", 443, "Ops", "classical", "general")
    asset = {"id": "upload-1", "host": resource.host, "port": 443, "kind": "tls", "vulnerability": {"severity": "high"}}
    assert _per_resource_status({"assets": []}, [resource])[0]["severity"] == "unknown"
    assert _per_resource_status({"assets": [asset, dict(asset, id="upload-2")]}, [resource])[0]["severity"] == "unknown"
    exact = dict(asset, id=resource.id, vulnerability={"severity": "low"})
    assert _per_resource_status({"assets": [asset, exact]}, [resource])[0]["severity"] == "low"
    assert _per_resource_status({"assets": [exact, exact]}, [resource])[0]["severity"] == "unknown"
    resource.enabled = False
    assert _per_resource_status({"assets": [exact]}, [resource])[0]["severity"] == "unknown"
    assert resources_to_uploaded_rows([resource]) == []


def test_portfolio_does_not_reuse_legacy_global_scores(monkeypatch):
    from app.demo import compliance
    from app.demo.registry import DemoResource

    resources = [DemoResource("one", "TLS", "tls", "example.test", 443, "Ops", "classical", "general")]
    monkeypatch.setattr(compliance, "list_resources", lambda **kwargs: resources)
    monkeypatch.setattr(compliance, "list_snapshots", lambda **kwargs: [{"readinessScore": 82.8, "readinessBand": "transitioning", "perResourceStatus": [{"businessUnit": "Ops", "readinessScore": 82.8}]}])
    result = compliance.build_portfolio_rollup()
    assert result["overallReadiness"] == 82.8
    assert result["units"] == [{"businessUnit": "Ops", "assetCount": 1, "readinessScore": None, "readinessDelta": None}]


def test_fixture_pipeline_findings_reach_original_demo_resource():
    from app.demo.assess import run_demo_assessment
    from app.demo.registry import DemoResource
    from app.demo.service import _per_resource_status

    resource = DemoResource("original-tls", "TLS", "tls", "fixture.example", 443, "Ops", "classical", "general")
    bundle = run_demo_assessment(resources=[resource], scan_id="demo-resource-matching-test")
    uploaded = [asset for asset in bundle["assets"] if asset.get("host") == resource.host]
    assert len(uploaded) == 1
    assert uploaded[0]["id"] != resource.id
    finding = uploaded[0]["vulnerability"]
    assert finding["severity"] != "unknown"
    projected = _per_resource_status(bundle, [resource])[0]
    assert projected["severity"] == finding["severity"]
    assert projected["status"] == finding["status"]
    assert projected["readinessScore"] is None


def test_memory_history_is_chronological_and_portfolio_uses_latest(monkeypatch):
    from app.demo import store, compliance

    snapshots = [{"id": str(index), "readinessScore": score} for index, score in enumerate([20, 40, 60])]
    monkeypatch.setattr(store, "persistence_enabled", lambda: False)
    monkeypatch.setattr(store, "_MEM_SNAPSHOTS", snapshots)
    monkeypatch.setattr(compliance, "list_resources", lambda **kwargs: [])
    assert store.list_snapshots(limit=2) == snapshots[-2:]
    assert store.latest_snapshot()["readinessScore"] == 60
    assert compliance.build_portfolio_rollup()["overallReadiness"] == 60
