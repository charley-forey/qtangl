"""Overlay flip adapters: Git, K8s, Terraform, mesh/LB."""

from __future__ import annotations

import json
import uuid
from typing import Any, Protocol

from app.remediation.automation import (
    _HYBRID_TLS_SNIPPET,
    open_ado_hybrid_tls_pr,
    open_gitlab_hybrid_tls_pr,
    open_hybrid_tls_pr,
)

SNIPPET_LIBRARY: dict[str, str] = {
    "nginx": """# Qtangl hybrid TLS — nginx
ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519MLKEM768:X25519:secp384r1;
ssl_conf_command SignatureAlgorithms ml-dsa-65:ecdsa_secp384r1;
""",
    "envoy": """# Qtangl hybrid TLS — Envoy
transport_socket:
  name: envoy.transport_sockets.tls
  typed_config:
    "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
    common_tls_context:
      tls_params:
        ecdh_curves: ["X25519MLKEM768", "X25519"]
""",
    "haproxy": """# Qtangl hybrid TLS — HAProxy
ssl-default-bind-ciphersuites TLS_AES_256_GCM_SHA384
ssl-default-bind-options ssl-min-ver TLSv1.3
""",
    "caddy": """# Qtangl hybrid TLS — Caddy
{
  servers {
    protocols tls1.3
  }
}
""",
    "jwks": """{
  "keys": [
    {"kty": "EC", "crv": "P-384", "use": "sig", "alg": "ES384", "kid": "qtangl-rotate-1"}
  ]
}
""",
}


class OverlayFlipAdapter(Protocol):
    provider: str

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]: ...
    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]: ...
    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]: ...


def get_overlay_flip_adapter(provider: str) -> OverlayFlipAdapter:
    registry: dict[str, type] = {
        "github": GitOverlayAdapter,
        "gitlab": GitLabOverlayAdapter,
        "ado": AdoOverlayAdapter,
        "kubernetes": K8sOverlayAdapter,
        "k8s": K8sOverlayAdapter,
        "terraform": TerraformOverlayAdapter,
        "istio": MeshOverlayAdapter,
        "envoy": MeshOverlayAdapter,
        "f5": LbOverlayAdapter,
        "alb": LbOverlayAdapter,
    }
    cls = registry.get(provider.lower())
    if cls is None:
        return GitOverlayAdapter(provider=provider)
    return cls()


class GitOverlayAdapter:
    def __init__(self, provider: str = "github") -> None:
        self.provider = provider

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        snippet_key = request.get("snippetKey", "nginx")
        snippet = SNIPPET_LIBRARY.get(snippet_key, _HYBRID_TLS_SNIPPET)
        return {
            "status": "dry_run",
            "provider": self.provider,
            "targetEnv": target_env,
            "diff": {"snippetKey": snippet_key, "snippetPreview": snippet[:200]},
            "repo": request.get("repo"),
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        repo = request.get("repo", "")
        branch = request.get("branch", "")
        title = request.get("title", "Enable hybrid TLS (Qtangl flip)")
        if self.provider == "gitlab":
            result = open_gitlab_hybrid_tls_pr(repo=repo, branch=branch, title=title)
        elif self.provider == "ado":
            result = open_ado_hybrid_tls_pr(repo=repo, branch=branch, title=title)
        else:
            result = open_hybrid_tls_pr(repo=repo, branch=branch, title=title)
        result["externalRef"] = result.get("prUrl") or result.get("prNumber")
        return result

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "prUrl": external_ref}


class GitLabOverlayAdapter(GitOverlayAdapter):
    def __init__(self) -> None:
        super().__init__(provider="gitlab")


class AdoOverlayAdapter(GitOverlayAdapter):
    def __init__(self) -> None:
        super().__init__(provider="ado")


class K8sOverlayAdapter:
    provider = "kubernetes"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        manifest = self._ingress_patch(request)
        return {
            "status": "dry_run",
            "provider": self.provider,
            "targetEnv": target_env,
            "dryRunDiff": manifest,
            "namespace": request.get("namespace", "default"),
        }

    def _ingress_patch(self, request: dict[str, Any]) -> dict[str, Any]:
        name = request.get("ingressName", "qtangl-ingress")
        namespace = request.get("namespace", "default")
        return {
            "apiVersion": "networking.k8s.io/v1",
            "kind": "Ingress",
            "metadata": {"name": name, "namespace": namespace},
            "spec": {
                "tls": [{"hosts": [request.get("host", "example.com")], "secretName": request.get("secretName", "tls-secret")}],
            },
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        manifest = self._ingress_patch(request)
        dry_run = bool(request.get("dryRunOnly"))
        return {
            "provider": self.provider,
            "status": "ok" if not dry_run else "dry_run",
            "manifest": manifest,
            "externalRef": f"k8s-{namespace_slug(request)}-{uuid.uuid4().hex[:8]}",
            "message": "Apply manifest via customer kubectl/CI or Enterprise delegated apply.",
        }

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "patchId": external_ref}


class TerraformOverlayAdapter:
    provider = "terraform"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        fragment = self._tf_fragment(request)
        return {"status": "dry_run", "provider": self.provider, "fragment": fragment}

    def _tf_fragment(self, request: dict[str, Any]) -> str:
        resource = request.get("resourceType", "aws_lb_listener")
        if "azure" in resource:
            return """resource "azurerm_application_gateway" "qtangl_pqc" {
  ssl_policy_name = "AppGwSslPolicy20220101"
  # Customer applies via CI — Qtangl generates fragment only
}
"""
        return """resource "aws_lb_listener" "qtangl_hybrid_tls" {
  ssl_policy = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  # Enable hybrid/PQ cipher suites per AWS guidance
}
"""

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        fragment = self._tf_fragment(request)
        return {
            "provider": self.provider,
            "status": "ok",
            "fragment": fragment,
            "externalRef": f"tf-{uuid.uuid4().hex[:8]}",
            "artifactPath": request.get("artifactPath", "qtangl/hybrid-tls.tf"),
        }

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "artifactId": external_ref}


class MeshOverlayAdapter:
    provider = "istio"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {"status": "dry_run", "provider": self.provider, "export": self._mesh_export(request)}

    def _mesh_export(self, request: dict[str, Any]) -> dict[str, Any]:
        return {
            "apiVersion": "security.istio.io/v1beta1",
            "kind": "PeerAuthentication",
            "metadata": {"name": "qtangl-hybrid-mtls", "namespace": request.get("namespace", "default")},
            "spec": {"mtls": {"mode": "STRICT"}},
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        export = self._mesh_export(request)
        return {
            "provider": self.provider,
            "status": "ok",
            "export": export,
            "externalRef": f"mesh-{uuid.uuid4().hex[:8]}",
        }

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "exportId": external_ref}


class LbOverlayAdapter:
    provider = "alb"

    def dry_run(self, *, request: dict[str, Any], target_env: str) -> dict[str, Any]:
        return {"status": "dry_run", "provider": self.provider, "policy": self._lb_policy(request)}

    def _lb_policy(self, request: dict[str, Any]) -> dict[str, Any]:
        lb_type = request.get("lbType", "alb")
        if lb_type == "f5":
            return {
                "class": "AS3",
                "declaration": {
                    "qtangl_tls": {"cipherGroup": {"cipherList": ["TLS13-AES256-GCM-SHA384"]}},
                },
            }
        return {
            "Type": "AWS::ElasticLoadBalancingV2::Listener",
            "Properties": {"SslPolicy": "ELBSecurityPolicy-TLS13-1-2-2021-06"},
        }

    def execute(self, *, request: dict[str, Any], target_env: str, tenant_id: str) -> dict[str, Any]:
        policy = self._lb_policy(request)
        return {
            "provider": self.provider,
            "status": "ok",
            "policy": policy,
            "externalRef": f"lb-{uuid.uuid4().hex[:8]}",
        }

    def poll(self, *, external_ref: str, tenant_id: str) -> dict[str, Any]:
        return {"provider": self.provider, "status": "succeeded", "policyId": external_ref}


def namespace_slug(request: dict[str, Any]) -> str:
    return str(request.get("namespace", "default")).replace("/", "-")
