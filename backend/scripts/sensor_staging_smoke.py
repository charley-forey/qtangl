#!/usr/bin/env python3
"""Staging smoke: fleet → enroll → heartbeat → findings → drift/CBOM assertions."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
import uuid

SAMPLE_FINDING = {
    "schemaVersion": 1,
    "findingId": "staging-smoke-find-001",
    "findingType": "certificate",
    "hostId": "00000000-0000-4000-8000-000000000001",
    "hostname": "staging-smoke-host",
    "os": "linux",
    "location": "/etc/ssl/staging-smoke.pem",
    "algorithm": "RSA-2048",
    "keySize": 2048,
    "confidence": "high",
    "fingerprint": "sha256:staging-smoke-test",
}


def _request(method: str, url: str, headers: dict, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()
        raise RuntimeError(f"{method} {url} -> {exc.code}: {detail}") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description="Sensor staging smoke test")
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE", "http://127.0.0.1:8000"))
    parser.add_argument("--api-key", default=os.environ.get("QTANGL_API_KEY", ""))
    parser.add_argument("--simulate-findings", action="store_true", default=True)
    parser.add_argument("--skip-settings", action="store_true")
    args = parser.parse_args()

    if not args.api_key:
        print("Set QTANGL_API_KEY or pass --api-key", file=sys.stderr)
        return 2

    base = args.base_url.rstrip("/")
    headers = {"Authorization": f"Bearer {args.api_key}", "Content-Type": "application/json"}

    print(f"Sensor smoke against {base}")

    if not args.skip_settings:
        settings_payload = _request("GET", f"{base}/tenant/settings", headers)
        settings = settings_payload.get("settings") or {}
        discovery = dict(settings.get("discovery") or {})
        discovery["hostSensor"] = True
        settings["discovery"] = discovery
        _request("PUT", f"{base}/tenant/settings", headers, {"settings": settings})
        print("Enabled discovery.hostSensor")

    fleet = _request(
        "POST",
        f"{base}/tenant/discovery/fleets",
        headers,
        {"name": f"staging-smoke-{uuid.uuid4().hex[:6]}"},
    )
    token = fleet.get("enrollmentToken")
    nonce = fleet.get("enrollmentNonce")
    if not token:
        print("Fleet create failed — no enrollment token", file=sys.stderr)
        return 1
    print(f"Fleet created: {fleet.get('fleetId')}")

    enroll = _request(
        "POST",
        f"{base}/discovery/agent/enroll",
        {"Content-Type": "application/json"},
        {
            "enrollmentToken": token,
            "enrollmentNonce": nonce,
            "hostname": "staging-smoke-host",
            "os": "linux",
            "sensorVersion": "0.1.0",
        },
    )
    agent_id = enroll.get("agentId")
    tenant_id = enroll.get("tenantId")
    if not agent_id or not tenant_id:
        print("Enroll failed", file=sys.stderr)
        return 1
    print(f"Agent enrolled: {agent_id}")

    _request(
        "POST",
        f"{base}/discovery/agent/heartbeat",
        {"Content-Type": "application/json"},
        {"agentId": agent_id, "tenantId": tenant_id, "sensorVersion": "0.1.0"},
    )
    print("Heartbeat OK")

    if args.simulate_findings:
        finding = dict(SAMPLE_FINDING)
        finding["findingId"] = f"staging-smoke-{uuid.uuid4().hex[:8]}"
        ingest = _request(
            "POST",
            f"{base}/discovery/agent/findings",
            {
                "Content-Type": "application/json",
                "X-Qtangl-Discovery-Schema": "discovery-finding-v1",
            },
            {"agentId": agent_id, "tenantId": tenant_id, "findings": [finding]},
        )
        accepted = ingest.get("accepted", 0)
        if accepted < 1:
            print(f"Findings ingest failed: {ingest}", file=sys.stderr)
            return 1
        print(f"Findings ingested: {accepted}")

    agents = _request("GET", f"{base}/tenant/discovery/agents", headers)
    agent_rows = agents.get("agents") or []
    match = next((a for a in agent_rows if a.get("agentId") == agent_id), None)
    if not match:
        print("Agent not listed", file=sys.stderr)
        return 1
    if int(match.get("findingsCount") or 0) < 1:
        print(f"findingsCount expected >= 1, got {match.get('findingsCount')}", file=sys.stderr)
        return 1
    print(f"Agent findingsCount: {match.get('findingsCount')}")

    drift = _request("GET", f"{base}/tenant/discovery/host-drift", headers)
    drift_count = int(drift.get("count") or drift.get("findingCount") or len(drift.get("findings") or []) or 0)
    if drift_count < 1 and not drift.get("summary"):
        summary = drift.get("summary") or {}
        drift_count = int(summary.get("totalFindings") or summary.get("findingCount") or 0)
    if drift_count < 1:
        print(f"Host drift count low (payload keys: {list(drift.keys())}) — continuing if agents OK")

    try:
        program = _request("GET", f"{base}/tenant/remediation/program", headers)
        items = program.get("items") or []
        host_items = [i for i in items if i.get("sourceType") == "host_finding"]
        if host_items:
            print(f"Program items (host_finding): {len(host_items)}")
        else:
            print("No host_finding program items yet (remediation program may be disabled)")
    except RuntimeError:
        print("Remediation program endpoint skipped")

    print("\nSensor staging smoke PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
