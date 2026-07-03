"""Build crypto dependency graph from scan inventory."""

from __future__ import annotations

from typing import Any

from app.command_center.schemas import GraphEdge, GraphNode, ScanGraphResponse
from app.pqc.models import MigrationReport


def _severity(asset: Any) -> str:
    vuln = getattr(asset, "vulnerability", None)
    if vuln is None:
        return "unknown"
    return str(getattr(vuln, "severity", "unknown") or "unknown")


def _qv(asset: Any) -> bool:
    vuln = getattr(asset, "vulnerability", None)
    if vuln is None:
        return False
    status = str(getattr(vuln, "status", "") or "")
    return status in {"at-risk", "broken", "unknown"}


def build_scan_graph(
    *,
    scan_id: str,
    report: MigrationReport,
    max_nodes: int = 500,
) -> ScanGraphResponse:
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    seen: set[str] = set()

    def add_node(node: GraphNode) -> bool:
        if node.id in seen:
            return True
        if len(nodes) >= max_nodes:
            return False
        seen.add(node.id)
        nodes.append(node)
        return True

    truncated = False
    for asset in report.assets:
        host = (asset.host or asset.id or "unknown").strip().lower()
        host_id = f"host:{host}"
        if not add_node(
            GraphNode(
                id=host_id,
                label=host,
                kind="host",
                quantumVulnerable=_qv(asset),
                severity=_severity(asset),
                drillTarget=f"remediate?asset={asset.id}",
            )
        ):
            truncated = True
            break

        svc = str(asset.kind or "tls").strip().lower()
        port_suffix = f":{asset.port}" if asset.port else ""
        svc_id = f"service:{host}:{svc}{port_suffix}"
        if add_node(
            GraphNode(
                id=svc_id,
                label=f"{svc}{port_suffix}",
                kind="service",
                quantumVulnerable=_qv(asset),
                severity=_severity(asset),
            )
        ):
            edges.append(GraphEdge(source=host_id, target=svc_id, kind="runs"))

        algo = (asset.algorithm or "").strip()
        if algo:
            algo_id = f"algo:{algo.lower()}"
            add_node(
                GraphNode(
                    id=algo_id,
                    label=algo,
                    kind="algorithm",
                    quantumVulnerable=_qv(asset),
                    severity=_severity(asset),
                )
            )
            edges.append(GraphEdge(source=svc_id, target=algo_id, kind="uses"))

        cert_ref = (asset.label or "").strip()
        if cert_ref and cert_ref != host:
            cert_id = f"cert:{cert_ref.lower()[:80]}"
            add_node(
                GraphNode(
                    id=cert_id,
                    label=cert_ref[:60],
                    kind="cert",
                    quantumVulnerable=_qv(asset),
                    severity=_severity(asset),
                )
            )
            edges.append(GraphEdge(source=svc_id, target=cert_id, kind="presents"))

    return ScanGraphResponse(
        scanId=scan_id,
        nodes=nodes,
        edges=edges,
        nodeCount=len(nodes),
        truncated=truncated,
        assumptions=[
            "Graph derived from latest scan inventory — coverage limited to discovered assets.",
            "Node colors reflect quantum-vulnerability classification, not live exploitability.",
        ],
    )
