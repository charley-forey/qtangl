from __future__ import annotations

import csv
import io
import json
from typing import Any


def parse_cloud_inventory(text: str, *, filename: str = "") -> list[dict[str, Any]]:
    """Parse cloud PKI exports (AWS ACM JSON, Azure/GCP CSV, K8s secret list JSON)."""
    stripped = text.strip()
    lower_name = filename.lower()

    if stripped.startswith("{") or stripped.startswith("["):
        return _parse_json_inventory(stripped, lower_name)
    return _parse_csv_inventory(stripped)


def _parse_json_inventory(text: str, filename: str) -> list[dict[str, Any]]:
    data = json.loads(text)
    rows: list[dict[str, Any]] = []

    if isinstance(data, list):
        for index, item in enumerate(data):
            if not isinstance(item, dict):
                continue
            rows.append(_normalize_cloud_row(item, index, filename))
        return rows

    if "CertificateSummaryList" in data:
        for index, cert in enumerate(data["CertificateSummaryList"]):
            rows.append(
                {
                    "host": cert.get("DomainName", f"acm-{index}"),
                    "port": 443,
                    "kind": "tls",
                    "algorithm": cert.get("KeyAlgorithm", "RSA"),
                    "label": cert.get("DomainName", "ACM certificate"),
                    "source": "aws-acm",
                }
            )
        return rows

    if "items" in data:
        for index, item in enumerate(data["items"]):
            meta = item.get("metadata", {})
            name = meta.get("name", f"k8s-secret-{index}")
            rows.append(
                {
                    "host": name,
                    "port": 443,
                    "kind": "tls",
                    "algorithm": "unknown",
                    "label": f"K8s TLS secret {name}",
                    "source": "kubernetes",
                }
            )
        return rows

    if "value" in data and isinstance(data["value"], list):
        for index, cert in enumerate(data["value"]):
            rows.append(
                {
                    "host": cert.get("name", cert.get("id", f"azure-{index}")),
                    "port": 443,
                    "kind": "tls",
                    "algorithm": "RSA",
                    "label": cert.get("name", "Azure Key Vault cert"),
                    "source": "azure-keyvault",
                }
            )
        return rows

    return rows


def _parse_csv_inventory(text: str) -> list[dict[str, Any]]:
    reader = csv.DictReader(io.StringIO(text))
    rows: list[dict[str, Any]] = []
    for index, row in enumerate(reader):
        host = row.get("host") or row.get("domain") or row.get("DomainName") or row.get("name") or f"row-{index}"
        rows.append(
            {
                "host": host,
                "port": int(row.get("port") or 443),
                "kind": row.get("kind") or "tls",
                "algorithm": row.get("algorithm") or row.get("KeyAlgorithm") or "unknown",
                "label": row.get("label") or host,
                "source": "cloud-csv",
            }
        )
    return rows


def _normalize_cloud_row(item: dict[str, Any], index: int, filename: str) -> dict[str, Any]:
    return {
        "host": item.get("host") or item.get("domain") or item.get("DomainName") or f"cloud-{index}",
        "port": int(item.get("port") or 443),
        "kind": item.get("kind") or "tls",
        "algorithm": item.get("algorithm") or item.get("KeyAlgorithm") or "unknown",
        "label": item.get("label") or item.get("name") or f"Cloud asset {index}",
        "source": item.get("source") or filename or "cloud-json",
    }
