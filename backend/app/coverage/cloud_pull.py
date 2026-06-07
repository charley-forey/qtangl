"""Cloud-native certificate pull adapters."""

from __future__ import annotations

import json
from typing import Any


def _aws_session(*, role_arn: str = "", external_id: str = "", region: str = "us-east-1"):
    try:
        import boto3
    except ImportError:
        return None, "boto3_unavailable"
    if role_arn:
        try:
            sts = boto3.client("sts", region_name=region)
            assume_kwargs: dict[str, Any] = {"RoleArn": role_arn, "RoleSessionName": "qtangl-cbom-pull"}
            if external_id:
                assume_kwargs["ExternalId"] = external_id
            creds = sts.assume_role(**assume_kwargs)["Credentials"]
            session = boto3.Session(
                aws_access_key_id=creds["AccessKeyId"],
                aws_secret_access_key=creds["SecretAccessKey"],
                aws_session_token=creds["SessionToken"],
                region_name=region,
            )
            return session.client("acm", region_name=region), None
        except Exception as exc:
            return None, f"assume_role_failed:{exc}"
    import boto3

    return boto3.client("acm", region_name=region), None


def pull_aws_acm(
    *,
    region: str = "us-east-1",
    role_arn: str = "",
    external_id: str = "",
) -> dict[str, Any]:
    client, err = _aws_session(role_arn=role_arn, external_id=external_id, region=region)
    if client is None:
        return {
            "provider": "aws_acm",
            "region": region,
            "status": "unavailable",
            "message": err or "Install boto3 for AWS ACM pull.",
            "certificates": [],
        }
    try:
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
    except Exception as exc:
        return {
            "provider": "aws_acm",
            "region": region,
            "status": "error",
            "message": str(exc),
            "certificates": [],
        }


def pull_azure_keyvault(
    *,
    vault_name: str,
    tenant_id: str = "",
    client_id: str = "",
    client_secret: str = "",
) -> dict[str, Any]:
    if not vault_name:
        return {
            "provider": "azure_keyvault",
            "vault": vault_name,
            "status": "error",
            "certificates": [],
            "message": "vaultName is required",
        }
    vault_url = f"https://{vault_name}.vault.azure.net/"
    try:
        from azure.identity import ClientSecretCredential, DefaultAzureCredential
        from azure.keyvault.certificates import CertificateClient
    except ImportError:
        return {
            "provider": "azure_keyvault",
            "vault": vault_name,
            "status": "unavailable",
            "certificates": [],
            "message": "Install azure-identity and azure-keyvault-certificates for Azure pull.",
        }

    try:
        if tenant_id and client_id and client_secret:
            credential = ClientSecretCredential(
                tenant_id=tenant_id,
                client_id=client_id,
                client_secret=client_secret,
            )
        else:
            credential = DefaultAzureCredential()
        client = CertificateClient(vault_url=vault_url, credential=credential)
        certs: list[dict[str, Any]] = []
        for props in client.list_properties_of_certificates():
            certs.append(
                {
                    "name": props.name,
                    "id": props.id,
                    "enabled": props.enabled,
                    "expiresOn": props.expires_on.isoformat() if props.expires_on else "",
                    "algorithm": "RSA",
                }
            )
        return {
            "provider": "azure_keyvault",
            "vault": vault_name,
            "status": "ok",
            "count": len(certs),
            "certificates": certs[:200],
        }
    except Exception as exc:
        return {
            "provider": "azure_keyvault",
            "vault": vault_name,
            "status": "error",
            "certificates": [],
            "message": str(exc),
        }


def pull_gcp_certificate_manager(*, project_id: str) -> dict[str, Any]:
    return {
        "provider": "gcp_certificate_manager",
        "project": project_id,
        "status": "roadmap",
        "certificates": [],
        "message": "GCP Certificate Manager scheduled pull is on the roadmap — use upload bundle import today.",
    }


def acm_rows_for_import(
    *,
    region: str = "us-east-1",
    role_arn: str = "",
    external_id: str = "",
) -> str:
    """JSON rows compatible with cloud_import.parse_cloud_inventory."""
    result = pull_aws_acm(region=region, role_arn=role_arn, external_id=external_id)
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
