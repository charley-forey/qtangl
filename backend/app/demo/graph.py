from __future__ import annotations

from typing import Any

from app.command_center.graph import build_scan_graph
from app.demo.store import latest_snapshot, list_resources, load_bundle
from app.pqc.bundle_codec import bundle_from_api_dict


def build_demo_graph(*, scan_id: str | None = None) -> dict[str, Any]:
    bundle = None
    if scan_id:
        bundle = load_bundle(scan_id)
    if bundle is None:
        snap = latest_snapshot()
        bundle = snap.get("bundle") if snap else None
    if not bundle:
        resources = list_resources(enabled_only=True)
        nodes = []
        edges = []
        for resource in resources:
            host_id = f"host:{resource.host.lower()}"
            svc_id = f"service:{resource.host.lower()}:{resource.kind}"
            color = {"classical": "critical", "hybrid": "medium", "pqc": "low"}.get(resource.posture, "unknown")
            nodes.extend(
                [
                    {"id": host_id, "label": resource.host, "kind": "host", "quantumVulnerable": resource.posture == "classical", "severity": color},
                    {"id": svc_id, "label": f"{resource.kind}:{resource.port or ''}", "kind": "service", "quantumVulnerable": resource.posture == "classical", "severity": color},
                ]
            )
            edges.append({"source": host_id, "target": svc_id, "kind": "runs"})
        return {"scanId": None, "nodes": nodes, "edges": edges, "truncated": False}
    scan_bundle = bundle_from_api_dict(bundle)
    graph = build_scan_graph(scan_id=str(bundle.get("scanId", "")), report=scan_bundle.report)
    return {
        "scanId": bundle.get("scanId"),
        "nodes": [node.model_dump(by_alias=True) for node in graph.nodes],
        "edges": [edge.model_dump(by_alias=True) for edge in graph.edges],
        "truncated": graph.truncated,
    }
