"""KMS flip adapters: AWS, Azure, GCP — no private key export."""

from __future__ import annotations

import uuid
from typing import Any, Protocol


class KmsFlipAdapter(Protocol):
    provider: str

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]: ...
    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]: ...
    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]: ...


def get_kms_flip_adapter(provider: str) -> KmsFlipAdapter:
    registry: dict[str, type] = {
        "kms-aws": AwsKmsFlipAdapter,
        "aws": AwsKmsFlipAdapter,
        "kms-azure": AzureKmsFlipAdapter,
        "azure": AzureKmsFlipAdapter,
        "kms-gcp": GcpKmsFlipAdapter,
        "gcp": GcpKmsFlipAdapter,
    }
    cls = registry.get(provider.lower())
    if cls is None:
        raise ValueError(f"unsupported_kms_provider:{provider}")
    return cls()


class AwsKmsFlipAdapter:
    provider = "kms-aws"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "action": request.get("action", "update_alias"),
            "aliasName": request.get("aliasName"),
            "newKeySpec": request.get("keySpec", "SYMMETRIC_DEFAULT"),
            "previousKeyId": request.get("currentKeyId"),
            "targetEnv": target_env,
            "iamPolicy": "kms-flip-policy (deny decrypt/export)",
        }

    def create_key(self, *, client: Any, key_spec: str, description: str) -> dict[str, Any]:
        resp = client.create_key(
            Description=description,
            KeySpec=key_spec,
            KeyUsage="SIGN_VERIFY" if "ASYMMETRIC" in key_spec else "ENCRYPT_DECRYPT",
        )
        meta = resp.get("KeyMetadata", {})
        return {"keyId": meta.get("KeyId"), "arn": meta.get("Arn")}

    def schedule_rotation(self, *, client: Any, key_id: str) -> dict[str, Any]:
        client.enable_key_rotation(KeyId=key_id)
        return {"rotationEnabled": True, "keyId": key_id}

    def update_alias(self, *, client: Any, alias_name: str, key_id: str) -> dict[str, Any]:
        alias = alias_name if alias_name.startswith("alias/") else f"alias/{alias_name}"
        try:
            client.update_alias(AliasName=alias, TargetKeyId=key_id)
        except client.exceptions.NotFoundException:
            client.create_alias(AliasName=alias, TargetKeyId=key_id)
        return {"aliasName": alias, "targetKeyId": key_id}

    def tag_deprecated_key(self, *, client: Any, key_id: str) -> None:
        client.tag_resource(
            KeyId=key_id,
            Tags=[{"TagKey": "qtangl-migration", "TagValue": "deprecated"}],
        )

    def _client(self, *, tenant_id: str) -> Any | None:
        config = _load_cloud_config(tenant_id=tenant_id, provider="aws") or {}
        flip_role = config.get("flipRoleArn") or config.get("roleArn")
        region = config.get("region", "us-east-1")
        try:
            import boto3

            if flip_role:
                sts = boto3.client("sts", region_name=region)
                assumed = sts.assume_role(RoleArn=flip_role, RoleSessionName="qtangl-kms-flip")
                creds = assumed["Credentials"]
                return boto3.client(
                    "kms",
                    region_name=region,
                    aws_access_key_id=creds["AccessKeyId"],
                    aws_secret_access_key=creds["SecretAccessKey"],
                    aws_session_token=creds["SessionToken"],
                )
            return boto3.client("kms", region_name=region)
        except Exception:
            return None

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        client = self._client(tenant_id=tenant_id)
        if client is None:
            return {
                "provider": self.provider,
                "status": "stub",
                "externalRef": f"aws-kms-stub-{uuid.uuid4().hex[:8]}",
                "message": "Configure AWS flip role for live KMS flip.",
            }
        action = request.get("action", "update_alias")
        previous_key_id = request.get("currentKeyId")
        try:
            if action == "create_key":
                created = self.create_key(
                    client=client,
                    key_spec=str(request.get("keySpec", "SYMMETRIC_DEFAULT")),
                    description=f"Qtangl PQC migration key ({target_env})",
                )
                key_id = created["keyId"]
                if request.get("enableRotation"):
                    self.schedule_rotation(client=client, key_id=key_id)
                if request.get("aliasName"):
                    self.update_alias(client=client, alias_name=str(request["aliasName"]), key_id=key_id)
                if previous_key_id:
                    self.tag_deprecated_key(client=client, key_id=previous_key_id)
                return {
                    "provider": self.provider,
                    "status": "ok",
                    "keyId": key_id,
                    "previousKeyId": previous_key_id,
                    "externalRef": key_id,
                }
            if action == "update_alias":
                key_id = str(request.get("newKeyId") or request.get("keyId"))
                alias = str(request.get("aliasName"))
                self.update_alias(client=client, alias_name=alias, key_id=key_id)
                if previous_key_id:
                    self.tag_deprecated_key(client=client, key_id=previous_key_id)
                return {
                    "provider": self.provider,
                    "status": "ok",
                    "aliasName": alias,
                    "targetKeyId": key_id,
                    "previousKeyId": previous_key_id,
                    "externalRef": alias,
                }
            if action == "schedule_rotation":
                key_id = str(request.get("keyId"))
                self.schedule_rotation(client=client, key_id=key_id)
                return {"provider": self.provider, "status": "ok", "keyId": key_id, "externalRef": key_id}
            return {"provider": self.provider, "status": "error", "message": f"unknown_action:{action}"}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "keyId": external_ref}


class AzureKmsFlipAdapter:
    provider = "kms-azure"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "action": "new_key_version",
            "keyName": request.get("keyName"),
            "algorithm": request.get("algorithm", "RSA"),
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        config = _load_cloud_config(tenant_id=tenant_id, provider="azure") or {}
        vault_url = config.get("vaultUrl") or config.get("keyVaultUrl")
        if not vault_url:
            return {
                "provider": self.provider,
                "status": "stub",
                "externalRef": f"azure-kv-stub-{uuid.uuid4().hex[:8]}",
            }
        try:
            from azure.identity import ClientSecretCredential
            from azure.keyvault.keys import KeyClient
            from azure.keyvault.keys import KeyType

            credential = ClientSecretCredential(
                str(config.get("tenantId", "")),
                str(config.get("clientId", "")),
                str(config.get("clientSecret", "")),
            )
            client = KeyClient(vault_url=str(vault_url), credential=credential)
            key_name = str(request.get("keyName"))
            algo = request.get("algorithm", "RSA")
            key_type = KeyType.rsa if "RSA" in str(algo).upper() else KeyType.ec
            key = client.create_rsa_key(key_name) if key_type == KeyType.rsa else client.create_ec_key(key_name)
            return {
                "provider": self.provider,
                "status": "ok",
                "keyId": key.id,
                "externalRef": key.id,
                "previousVersion": request.get("previousVersionId"),
            }
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "keyId": external_ref}


class GcpKmsFlipAdapter:
    provider = "kms-gcp"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "action": "new_crypto_key_version",
            "cryptoKeyName": request.get("cryptoKeyName"),
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        config = _load_cloud_config(tenant_id=tenant_id, provider="gcp") or {}
        crypto_key_name = request.get("cryptoKeyName")
        if not crypto_key_name:
            return {"provider": self.provider, "status": "error", "message": "cryptoKeyName required"}
        try:
            from google.cloud import kms

            client = kms.KeyManagementServiceClient()
            version = client.create_crypto_key_version(request={"parent": crypto_key_name})
            return {
                "provider": self.provider,
                "status": "ok",
                "versionName": version.name,
                "externalRef": version.name,
            }
        except ImportError:
            return {
                "provider": self.provider,
                "status": "stub",
                "externalRef": f"gcp-kms-stub-{uuid.uuid4().hex[:8]}",
            }
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "versionName": external_ref}


def _load_cloud_config(*, tenant_id: str, provider: str) -> dict[str, Any] | None:
    try:
        from app.integrations.cloud import _load_cloud_config

        return _load_cloud_config(tenant_id=tenant_id, provider=provider)
    except Exception:
        return None
