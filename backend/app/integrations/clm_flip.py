"""CLM flip adapters: Venafi, DigiCert, AppViewX, Keyfactor, ACME."""

from __future__ import annotations

import os
import uuid
from typing import Any, Protocol


class ClmFlipAdapter(Protocol):
    provider: str

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]: ...
    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]: ...
    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]: ...


def get_clm_flip_adapter(provider: str) -> ClmFlipAdapter:
    registry: dict[str, type] = {
        "venafi": VenafiFlipAdapter,
        "digicert": DigiCertFlipAdapter,
        "appviewx": AppViewXFlipAdapter,
        "keyfactor": KeyfactorFlipAdapter,
        "acme": AcmeFlipAdapter,
    }
    cls = registry.get(provider.lower())
    if cls is None:
        raise ValueError(f"unsupported_clm_provider:{provider}")
    return cls()


class VenafiFlipAdapter:
    provider = "venafi"

    def _config(self, *, tenant_id: str) -> dict[str, Any]:
        return _load_integration(tenant_id=tenant_id, provider="clm-venafi") or {
            "baseUrl": os.environ.get("VENAFI_BASE_URL", ""),
            "apiKey": os.environ.get("VENAFI_API_KEY", ""),
            "writeBackEnabled": False,
        }

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        domain = request.get("domain") or request.get("commonName", "example.com")
        policy_id = request.get("policyId", "default")
        return {
            "status": "dry_run",
            "provider": self.provider,
            "targetEnv": target_env,
            "action": "request_certificate",
            "domain": domain,
            "policyId": policy_id,
            "diff": {"willRequest": True, "willInstall": bool(request.get("installTarget"))},
        }

    def request_certificate(self, *, config: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
        base_url = str(config.get("baseUrl") or "").strip()
        api_key = str(config.get("apiKey") or "").strip()
        domain = request.get("domain") or request.get("commonName", "")
        policy_id = request.get("policyId", "default")
        if not base_url or not api_key:
            return {
                "provider": self.provider,
                "status": "stub",
                "requestId": f"venafi-stub-{uuid.uuid4().hex[:8]}",
                "message": "Configure Venafi credentials for live certificate request.",
            }
        try:
            import httpx

            with httpx.Client(timeout=30) as client:
                resp = client.post(
                    f"{base_url.rstrip('/')}/vedcert/requests",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "PolicyDN": policy_id,
                        "Subject": {"CN": domain},
                        "CertificateAuthority": request.get("ca", "Default"),
                    },
                )
                if resp.status_code >= 400:
                    return {"provider": self.provider, "status": "error", "message": resp.text}
                data = resp.json()
                request_id = data.get("Guid") or data.get("id") or f"venafi-{uuid.uuid4().hex[:8]}"
                return {"provider": self.provider, "status": "pending", "requestId": request_id, "externalRef": request_id}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def install_certificate(self, *, config: dict[str, Any], request_id: str, install_target: str) -> dict[str, Any]:
        base_url = str(config.get("baseUrl") or "").strip()
        api_key = str(config.get("apiKey") or "").strip()
        if not base_url or not api_key or not config.get("writeBackEnabled"):
            return {"status": "skipped", "message": "writeBackEnabled required for install"}
        try:
            import httpx

            with httpx.Client(timeout=30) as client:
                resp = client.post(
                    f"{base_url.rstrip('/')}/vedcert/requests/{request_id}/install",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={"Target": install_target},
                )
                resp.raise_for_status()
                return {"status": "ok", "requestId": request_id, "installTarget": install_target}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        config = self._config(tenant_id=tenant_id)
        result = self.request_certificate(config=config, request=request)
        if result.get("status") == "pending" and request.get("installTarget"):
            install = self.install_certificate(
                config=config,
                request_id=str(result.get("requestId")),
                install_target=str(request.get("installTarget")),
            )
            result["install"] = install
        result["externalRef"] = result.get("requestId")
        return result

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        config = self._config(tenant_id=tenant_id)
        base_url = str(config.get("baseUrl") or "").strip()
        api_key = str(config.get("apiKey") or "").strip()
        if not base_url or not api_key:
            return {"provider": self.provider, "status": "succeeded", "requestId": external_ref, "stub": True}
        try:
            import httpx

            with httpx.Client(timeout=30) as client:
                resp = client.get(
                    f"{base_url.rstrip('/')}/vedcert/requests/{external_ref}",
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                resp.raise_for_status()
                data = resp.json()
                state = str(data.get("Status") or data.get("status") or "pending").lower()
                terminal = "succeeded" if state in {"issued", "completed", "success"} else "pending"
                if state in {"rejected", "failed", "error"}:
                    terminal = "failed"
                return {"provider": self.provider, "status": terminal, "requestId": external_ref, "venafiStatus": state}
        except Exception as exc:
            return {"provider": self.provider, "status": "pending", "message": str(exc)}


class DigiCertFlipAdapter:
    provider = "digicert"

    def _config(self, *, tenant_id: str) -> dict[str, Any]:
        return _load_integration(tenant_id=tenant_id, provider="clm-digicert") or {}

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "action": request.get("action", "order_certificate"),
            "commonName": request.get("commonName", "example.com"),
            "profileId": request.get("profileId"),
        }

    def order_certificate(self, *, config: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
        api_key = str(config.get("apiKey") or "").strip()
        base_url = str(config.get("baseUrl") or "https://one.digicert.com").rstrip("/")
        if not api_key:
            return {
                "provider": self.provider,
                "status": "stub",
                "orderId": f"digicert-stub-{uuid.uuid4().hex[:8]}",
            }
        try:
            import httpx

            resp = httpx.post(
                f"{base_url}/mpki/api/v1/certificate/order",
                headers={"X-API-KEY": api_key},
                json={
                    "common_name": request.get("commonName"),
                    "profile_id": request.get("profileId"),
                    "validity_years": request.get("validityYears", 1),
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            order_id = str(data.get("id") or data.get("order_id") or uuid.uuid4().hex[:12])
            return {"provider": self.provider, "status": "pending", "orderId": order_id, "externalRef": order_id}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def renew_certificate(self, *, config: dict[str, Any], cert_id: str) -> dict[str, Any]:
        api_key = str(config.get("apiKey") or "").strip()
        base_url = str(config.get("baseUrl") or "https://one.digicert.com").rstrip("/")
        if not api_key:
            return {"provider": self.provider, "status": "stub", "certId": cert_id}
        try:
            import httpx

            resp = httpx.post(
                f"{base_url}/mpki/api/v1/certificate/{cert_id}/renew",
                headers={"X-API-KEY": api_key},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            return {"provider": self.provider, "status": "pending", "orderId": data.get("id"), "externalRef": data.get("id")}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        config = self._config(tenant_id=tenant_id)
        if request.get("action") == "renew" and request.get("certId"):
            return self.renew_certificate(config=config, cert_id=str(request.get("certId")))
        return self.order_certificate(config=config, request=request)

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        config = self._config(tenant_id=tenant_id)
        api_key = str(config.get("apiKey") or "").strip()
        base_url = str(config.get("baseUrl") or "https://one.digicert.com").rstrip("/")
        if not api_key:
            return {"provider": self.provider, "status": "succeeded", "orderId": external_ref, "stub": True}
        try:
            import httpx

            resp = httpx.get(
                f"{base_url}/mpki/api/v1/certificate/order/{external_ref}",
                headers={"X-API-KEY": api_key},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            state = str(data.get("status") or "pending").lower()
            terminal = "succeeded" if state in {"issued", "completed", "active"} else "pending"
            if state in {"failed", "rejected", "cancelled"}:
                terminal = "failed"
            return {"provider": self.provider, "status": terminal, "orderId": external_ref, "digicertStatus": state}
        except Exception as exc:
            return {"provider": self.provider, "status": "pending", "message": str(exc)}


class AppViewXFlipAdapter:
    provider = "appviewx"

    def _config(self, *, tenant_id: str) -> dict[str, Any]:
        return _load_integration(tenant_id=tenant_id, provider="clm-appviewx") or {}

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "workflowId": request.get("workflowId", "pqc-issuance"),
            "commonName": request.get("commonName"),
        }

    def trigger_workflow(self, *, config: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
        host = str(config.get("host") or "").strip()
        token = str(config.get("token") or "").strip()
        workflow_id = request.get("workflowId", "pqc-issuance")
        if not host or not token:
            return {
                "provider": self.provider,
                "status": "stub",
                "workflowRunId": f"appviewx-stub-{uuid.uuid4().hex[:8]}",
            }
        try:
            import httpx

            resp = httpx.post(
                f"{host.rstrip('/')}/avxapi/workflow/{workflow_id}/trigger",
                headers={"Authorization": f"Bearer {token}"},
                json={"commonName": request.get("commonName"), "targetEnv": request.get("targetEnv", "staging")},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            run_id = str(data.get("runId") or data.get("id") or uuid.uuid4().hex[:12])
            return {"provider": self.provider, "status": "pending", "workflowRunId": run_id, "externalRef": run_id}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "message": str(exc)}

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        return self.trigger_workflow(config=self._config(tenant_id=tenant_id), request={**request, "targetEnv": target_env})

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        config = self._config(tenant_id=tenant_id)
        host = str(config.get("host") or "").strip()
        token = str(config.get("token") or "").strip()
        if not host or not token:
            return {"provider": self.provider, "status": "succeeded", "workflowRunId": external_ref, "stub": True}
        try:
            import httpx

            resp = httpx.get(
                f"{host.rstrip('/')}/avxapi/workflow/run/{external_ref}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            state = str(data.get("status") or "running").lower()
            terminal = "succeeded" if state in {"completed", "success"} else "pending"
            if state in {"failed", "error"}:
                terminal = "failed"
            return {"provider": self.provider, "status": terminal, "workflowRunId": external_ref}
        except Exception as exc:
            return {"provider": self.provider, "status": "pending", "message": str(exc)}


class KeyfactorFlipAdapter:
    provider = "keyfactor"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {
            "status": "dry_run",
            "provider": self.provider,
            "action": "write_metadata",
            "certId": request.get("certId"),
            "metadata": {"pqc-migration-status": "flip-scheduled", "targetEnv": target_env},
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        from app.integrations.keyfactor import write_keyfactor_metadata

        config = _load_integration(tenant_id=tenant_id, provider="keyfactor") or {}
        proof_url = request.get("proofUrl", "")
        metadata = {
            "pqc-migration-status": "flip-completed",
            "qtangl-proof-url": proof_url,
            "targetEnv": target_env,
        }
        result = write_keyfactor_metadata(
            base_url=str(config.get("baseUrl") or ""),
            api_token=str(config.get("apiToken") or ""),
            cert_id=str(request.get("certId") or ""),
            metadata=metadata,
            enabled=bool(config.get("writeBackEnabled", True)),
        )
        result["provider"] = self.provider
        result["externalRef"] = request.get("certId")
        return result

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "certId": external_ref}


class AcmeFlipAdapter:
    provider = "acme"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        from app.remediation.automation import request_acme_reissue

        domain = request.get("domain", "example.com")
        probe = request_acme_reissue(domain=domain, pqc_preferred=True)
        return {"status": "dry_run", "provider": self.provider, "acmeProbe": probe, "targetEnv": target_env}

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        from app.remediation.automation import complete_acme_issuance

        domain = request.get("domain", "example.com")
        result = complete_acme_issuance(
            domain=domain,
            csr_pem=request.get("csrPem"),
            account_key_pem=request.get("accountKeyPem"),
            pqc_preferred=bool(request.get("pqcPreferred", True)),
        )
        result["provider"] = self.provider
        result["externalRef"] = result.get("orderId") or result.get("orderUrl")
        return result

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "orderId": external_ref}


def _load_integration(*, tenant_id: str, provider: str) -> dict[str, Any] | None:
    try:
        from app.db.engine import db_session
        from app.db.models import TenantIntegration
        from app.security.secrets import decrypt_config
    except Exception:
        return None
    with db_session() as session:
        row = (
            session.query(TenantIntegration)
            .filter(TenantIntegration.tenant_id == tenant_id, TenantIntegration.provider == provider)
            .one_or_none()
        )
        if row is None:
            return None
        return decrypt_config(row.config_json or "{}")
