"""Kubernetes / cert-manager read-only certificate pull."""

from __future__ import annotations

import json
from typing import Any


def pull_k8s_certificates(
    *,
    kubeconfig_json: str = "",
    namespace: str = "",
    context: str = "",
) -> dict[str, Any]:
    try:
        from kubernetes import client, config
    except ImportError:
        return {
            "provider": "kubernetes",
            "status": "unavailable",
            "certificates": [],
            "message": "Install kubernetes client for K8s pull.",
        }

    try:
        if kubeconfig_json:
            cfg = json.loads(kubeconfig_json)
            from kubernetes.config import load_kube_config_from_dict

            load_kube_config_from_dict(cfg, context=context or None)
        else:
            config.load_incluster_config()
    except Exception as exc:
        return {
            "provider": "kubernetes",
            "status": "error",
            "certificates": [],
            "message": f"kubeconfig load failed: {exc}",
        }

    certs: list[dict[str, Any]] = []
    try:
        v1 = client.CoreV1Api()
        custom = client.CustomObjectsApi()
        ns = namespace or None
        secrets = v1.list_secret_for_all_namespaces() if not ns else v1.list_namespaced_secret(ns)
        for secret in secrets.items:
            if secret.type != "kubernetes.io/tls":
                continue
            certs.append(
                {
                    "name": secret.metadata.name,
                    "namespace": secret.metadata.namespace,
                    "kind": "tls-secret",
                }
            )

        try:
            crds = custom.list_cluster_custom_object(
                group="cert-manager.io",
                version="v1",
                plural="certificates",
            )
            for item in crds.get("items", []):
                meta = item.get("metadata", {})
                spec = item.get("status", {})
                certs.append(
                    {
                        "name": meta.get("name"),
                        "namespace": meta.get("namespace"),
                        "kind": "cert-manager-certificate",
                        "notAfter": spec.get("notAfter"),
                    }
                )
        except Exception:
            pass

        workloads: list[dict[str, Any]] = []
        try:
            apps = client.AppsV1Api()
            deploys = apps.list_deployment_for_all_namespaces() if not ns else apps.list_namespaced_deployment(ns)
            for dep in deploys.items:
                for container in dep.spec.template.spec.containers:
                    if container.image:
                        workloads.append({"image": container.image, "name": dep.metadata.name})
        except Exception:
            pass

        return {
            "provider": "kubernetes",
            "status": "ok",
            "workloads": workloads,
            "count": len(certs),
            "certificates": certs[:200],
        }
    except Exception as exc:
        return {
            "provider": "kubernetes",
            "status": "error",
            "certificates": [],
            "message": str(exc),
        }
