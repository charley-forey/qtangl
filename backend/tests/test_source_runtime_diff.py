from __future__ import annotations

from app.discovery.source_runtime_diff import compute_source_runtime_diff


def test_runtime_only_crypto_surfaced():
    diff = compute_source_runtime_diff(
        source_findings=[{"algorithm": "RSA-2048", "location": "auth.py"}],
        runtime_findings=[
            {"algorithm": "RSA-2048", "location": "auth.py"},
            {"algorithm": "AES-256-GCM", "location": "/lib/libssl.so"},
        ],
    )
    assert diff["sourceCount"] == 1
    assert diff["runtimeCount"] == 2
    assert "aes-256-gcm" in diff["runtimeOnly"]
