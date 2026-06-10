from app.monitoring.drift_snapshots import build_external_snapshot_payload, compute_snapshot_hash
from app.monitoring.unified_diff import diff_snapshot_payloads
from app.monitoring.correlation import correlate_findings, normalize_fqdn


def test_snapshot_hash_idempotent():
    payload = {"findingIds": ["a", "b"], "assetCount": 2}
    assert compute_snapshot_hash(payload) == compute_snapshot_hash(payload)


def test_diff_snapshot_payloads():
    prev = {"findingIds": ["a", "b"]}
    curr = {"findingIds": ["b", "c"]}
    delta = diff_snapshot_payloads(prev, curr)
    assert delta["addedCount"] == 1
    assert delta["removedCount"] == 1
    assert "c" in delta["addedIds"]


def test_external_snapshot_builder():
    report = {
        "assets": [
            {"host": "x.com", "port": 443, "kind": "tls", "algorithm": "RSA", "quantumVulnerable": True},
        ],
        "readinessScore": 72,
    }
    snap = build_external_snapshot_payload(report)
    assert snap["assetCount"] == 1
    assert snap["quantumVulnerableCount"] == 1


def test_correlation():
    a = [{"assetId": "1", "host": "APP.EXAMPLE.COM"}]
    b = [{"assetId": "1", "host": "app.example.com"}]
    result = correlate_findings(a, b)
    assert result["sharedCount"] == 1


def test_normalize_fqdn():
    assert normalize_fqdn("https://APP.Example.com/path") == "app.example.com"
