"""Cloud-native certificate pull adapters."""

from __future__ import annotations

import json
import os
from typing import Any


def pull_aws_acm(*, region: str = "us-east-1") -> dict[str, Any]:
    try:
        import boto3
    except ImportError:
        return {
            "provider": "aws_acm",
            "region": region,
            "status": "unavailable",
            "message": "Install boto3 for AWS ACM pull.",
            "certificates": [],
        }
    client = boto3.client("acm", region_name=region)
    paginator = client.get_paginator("list_certificates")
    certs: list[dict[str, Any]] = []
    for page in paginator.paginate():
        for summary in page.get("CertificateSummaryList", []):
            arn = summary.get("CertificateArn")
            if not arn:
                continue
            detail = client.describe_certificate(CertificateArn=arn)
            cert = detail.get("Certificate", {})
            certs.append(
                {
                    "arn": arn,
                    "domain": cert.get("DomainName"),
                    "status": cert.get("Status"),
                    "notAfter": str(cert.get("NotAfter", "")),
                    "keyAlgorithm": cert.get("KeyAlgorithm"),
                }
            )
    return {
        "provider": "aws_acm",
        "region": region,
        "status": "ok",
        "count": len(certs),
        "certificates": certs[:200],
    }


def pull_azure_keyvault(*, vault_name: str) -> dict[str, Any]:
    return {
        "provider": "azure_keyvault",
        "vault": vault_name,
        "status": "stub",
        "certificates": [],
        "message": "Configure Azure credentials for live pull.",
    }


def pull_gcp_certificate_manager(*, project_id: str) -> dict[str, Any]:
    return {
        "provider": "gcp_certificate_manager",
        "project": project_id,
        "status": "stub",
        "certificates": [],
    }


def acm_rows_for_import(*, region: str = "us-east-1") -> str:
    """JSON rows compatible with cloud_import.parse_cloud_inventory."""
    result = pull_aws_acm(region=region)
    rows = []
    for cert in result.get("certificates", []):
        rows.append(
            {
                "host": cert.get("domain", "unknown"),
                "port": 443,
                "kind": "tls",
                "algorithm": cert.get("keyAlgorithm", "RSA"),
                "label": cert.get("domain", ""),
            }
        )
    return json.dumps(rows)
