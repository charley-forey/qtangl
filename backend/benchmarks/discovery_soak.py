"""Load soak harness for discovery ingest + heartbeats (dev/staging only)."""

from __future__ import annotations

import argparse
import time
import uuid

from app.discovery.fleet import ingest_findings, record_heartbeat


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--agents", type=int, default=100)
    parser.add_argument("--findings-per-agent", type=int, default=10)
    parser.add_argument("--heartbeats", action="store_true", help="Also record heartbeats per agent")
    args = parser.parse_args()

    start = time.perf_counter()
    total = 0
    hb = 0
    for i in range(args.agents):
        agent_id = f"soak-agent-{i}"
        tenant_id = "sandbox"
        if args.heartbeats:
            if record_heartbeat(agent_id=agent_id, tenant_id=tenant_id, sensor_version="0.1.0-soak"):
                hb += 1
        findings = [
            {
                "schemaVersion": 1,
                "findingId": f"soak-{uuid.uuid4().hex}",
                "findingType": "certificate",
                "hostId": str(uuid.uuid4()),
                "hostname": f"host-{i}",
                "os": "linux",
                "algorithm": "RSA-2048",
                "confidence": "high",
                "location": f"/etc/ssl/cert-{j}.pem",
            }
            for j in range(args.findings_per_agent)
        ]
        ingest_findings(agent_id=agent_id, tenant_id=tenant_id, findings=findings)
        total += len(findings)
    elapsed = time.perf_counter() - start
    p99_budget_ms = 2000
    rate = total / elapsed if elapsed else 0
    print(
        f"Ingested {total} findings from {args.agents} agents in {elapsed:.2f}s "
        f"({rate:.0f} findings/s, heartbeats={hb})"
    )
    if args.agents >= 1000 and elapsed > 0:
        est_p99 = (elapsed / max(1, args.agents)) * 1000 * 3
        print(f"Estimated p99 ingest budget check: {est_p99:.0f}ms (target <{p99_budget_ms}ms)")


if __name__ == "__main__":
    main()
