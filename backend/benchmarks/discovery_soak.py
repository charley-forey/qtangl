#!/usr/bin/env python3
"""10k agent findings ingest soak benchmark."""

from __future__ import annotations

import argparse
import json
import statistics
import time
import urllib.request


def synthetic_findings(n: int) -> list[dict]:
    return [
        {
            "schemaVersion": 1,
            "findingId": f"soak-{i}",
            "findingType": "certificate",
            "hostId": "host-1",
            "hostname": "soak-host",
            "os": "linux",
            "algorithm": "RSA-2048",
            "confidence": "high",
        }
        for i in range(n)
    ]


def post_batch(base: str, agent_id: str, tenant_id: str, findings: list[dict]) -> float:
    body = json.dumps({"agentId": agent_id, "tenantId": tenant_id, "findings": findings}).encode()
    req = urllib.request.Request(
        f"{base.rstrip('/')}/discovery/agent/findings",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    start = time.perf_counter()
    with urllib.request.urlopen(req, timeout=30) as resp:
        resp.read()
    return time.perf_counter() - start


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8000")
    parser.add_argument("--agents", type=int, default=100)
    parser.add_argument("--batch", type=int, default=100)
    args = parser.parse_args()
    latencies: list[float] = []
    for agent in range(args.agents):
        latencies.append(
            post_batch(args.base, f"agent-soak-{agent}", "sandbox", synthetic_findings(args.batch))
        )
    p99 = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max(latencies)
    print(json.dumps({"agents": args.agents, "batch": args.batch, "p99Sec": p99, "maxSec": max(latencies)}))


if __name__ == "__main__":
    main()
