"""KMS metadata pull for CBOM ingestion (no key material)."""

from __future__ import annotations

from typing import Any


def pull_aws_kms(*, role_arn: str = "", region: str = "us-east-1") -> dict[str, Any]:
    """ListKeys, DescribeKey, GetKeyRotationStatus — metadata only."""
    try:
        import boto3
    except ImportError:
        return {"provider": "kms-aws", "status": "error", "keys": [], "message": "boto3 required"}

    try:
        session_kwargs: dict[str, Any] = {"region_name": region}
        if role_arn:
            sts = boto3.client("sts", region_name=region)
            assumed = sts.assume_role(RoleArn=role_arn, RoleSessionName="qtangl-kms-pull")
            creds = assumed["Credentials"]
            session_kwargs = {
                "aws_access_key_id": creds["AccessKeyId"],
                "aws_secret_access_key": creds["SecretAccessKey"],
                "aws_session_token": creds["SessionToken"],
                "region_name": region,
            }
        client = boto3.client("kms", **session_kwargs)
        keys: list[dict[str, Any]] = []
        paginator = client.get_paginator("list_keys")
        for page in paginator.paginate():
            for item in page.get("Keys", [])[:200]:
                key_id = item.get("KeyId")
                if not key_id:
                    continue
                desc = client.describe_key(KeyId=key_id).get("KeyMetadata", {})
                rotation = False
                try:
                    rot = client.get_key_rotation_status(KeyId=key_id)
                    rotation = bool(rot.get("KeyRotationEnabled"))
                except Exception:
                    pass
                keys.append(
                    {
                        "keyId": key_id,
                        "arn": desc.get("Arn"),
                        "algorithm": desc.get("CustomerMasterKeySpec") or desc.get("KeySpec"),
                        "keyUsage": desc.get("KeyUsage"),
                        "rotationEnabled": rotation,
                        "assetType": "kms-key",
                        "source": "aws-kms",
                    }
                )
        return {"provider": "kms-aws", "status": "ok", "count": len(keys), "keys": keys}
    except Exception as exc:
        return {"provider": "kms-aws", "status": "error", "keys": [], "message": str(exc)}


def pull_azure_keyvault_keys(*, vault_url: str, tenant_id: str = "", client_id: str = "", client_secret: str = "") -> dict[str, Any]:
    if not vault_url:
        return {"provider": "kms-azure", "status": "error", "keys": [], "message": "vault_url required"}
    try:
        from azure.identity import ClientSecretCredential
        from azure.keyvault.keys import KeyClient
    except ImportError:
        return {"provider": "kms-azure", "status": "stub", "keys": [], "message": "azure-keyvault-keys required"}

    try:
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
        client = KeyClient(vault_url=vault_url, credential=credential)
        keys = []
        for key_props in client.list_properties_of_keys():
            keys.append(
                {
                    "keyId": key_props.id,
                    "name": key_props.name,
                    "algorithm": str(key_props.key_type) if key_props.key_type else None,
                    "enabled": key_props.enabled,
                    "assetType": "kms-key",
                    "source": "azure-keyvault",
                }
            )
            if len(keys) >= 200:
                break
        return {"provider": "kms-azure", "status": "ok", "count": len(keys), "keys": keys}
    except Exception as exc:
        return {"provider": "kms-azure", "status": "error", "keys": [], "message": str(exc)}


def pull_gcp_cloud_kms(*, project_id: str, location: str = "global") -> dict[str, Any]:
    if not project_id:
        return {"provider": "kms-gcp", "status": "error", "keys": [], "message": "project_id required"}
    try:
        from google.cloud import kms
    except ImportError:
        return {"provider": "kms-gcp", "status": "stub", "keys": [], "message": "google-cloud-kms required"}

    try:
        client = kms.KeyManagementServiceClient()
        parent = f"projects/{project_id}/locations/{location}"
        keys: list[dict[str, Any]] = []
        for key_ring in client.list_key_rings(request={"parent": parent}):
            ring_name = key_ring.name
            for crypto_key in client.list_crypto_keys(request={"parent": ring_name}):
                version_algo = None
                try:
                    versions = list(client.list_crypto_key_versions(request={"parent": crypto_key.name}))
                    if versions:
                        version_algo = str(versions[0].algorithm)
                except Exception:
                    pass
                keys.append(
                    {
                        "keyId": crypto_key.name,
                        "name": crypto_key.name.split("/")[-1],
                        "algorithm": version_algo or str(crypto_key.purpose),
                        "assetType": "kms-key",
                        "source": "gcp-cloud-kms",
                    }
                )
                if len(keys) >= 200:
                    break
            if len(keys) >= 200:
                break
        return {"provider": "kms-gcp", "status": "ok", "count": len(keys), "keys": keys}
    except Exception as exc:
        return {"provider": "kms-gcp", "status": "error", "keys": [], "message": str(exc)}


def kms_rows_to_cbom(result: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "host": k.get("arn") or k.get("keyId") or k.get("name", "kms-key"),
            "port": 0,
            "kind": "kms",
            "algorithm": k.get("algorithm") or "unknown",
            "label": k.get("name") or k.get("keyId", "KMS key"),
            "source": result.get("provider", "kms"),
            "metadata": k,
        }
        for k in result.get("keys", [])
    ]
