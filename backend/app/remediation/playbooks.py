from __future__ import annotations

from typing import Any

PLAYBOOKS: dict[str, dict[str, Any]] = {
    "tls_hybrid_kex": {
        "title": "TLS hybrid key exchange rollout",
        "steps": [
            "Inventory affected TLS endpoints from scan report.",
            "Enable hybrid KEX (e.g. X25519Kyber768) on staging load balancers.",
            "Validate handshake with openssl s_client and Qtangl re-scan.",
            "Roll out to production during maintenance window.",
            "Trigger verify re-scan and attach signed proof.",
        ],
        "prerequisites": ["Load balancer admin access", "Change window approval"],
    },
    "jwks_rotation": {
        "title": "JWKS / OIDC key rotation",
        "steps": [
            "Generate new PQC-capable signing keys in HSM or KMS.",
            "Publish updated JWKS with overlap period for verifiers.",
            "Rotate issuer signing keys per OIDC best practice.",
            "Re-scan OIDC metadata endpoints for algorithm posture.",
        ],
        "prerequisites": ["IdP admin", "JWKS publication path"],
    },
    "ssh_host_keys": {
        "title": "SSH host key migration",
        "steps": [
            "Identify hosts with classical SSH host keys.",
            "Deploy hybrid or PQC host keys per vendor guidance.",
            "Update known_hosts / automation trust stores.",
            "Re-probe with host fleet scan and verify.",
        ],
        "prerequisites": ["SSH admin on target hosts"],
    },
    "code_signing": {
        "title": "Code signing certificate upgrade",
        "steps": [
            "Audit current code signing algorithms in CI/CD.",
            "Procure PQC-ready code signing cert from CA.",
            "Update signing pipelines and timestamp authority.",
            "Re-run code/binary scan to confirm dependency posture.",
        ],
        "prerequisites": ["CA relationship", "CI/CD admin"],
    },
    "jvm_cacerts": {
        "title": "JVM cacerts / trust store update",
        "steps": [
            "Export current cacerts from affected JVMs via sensor.",
            "Import enterprise PQC-ready roots into cacerts.",
            "Restart JVM services in rolling fashion.",
            "Confirm via host sensor re-probe and verify job.",
        ],
        "prerequisites": ["Host sensor deployed", "JVM restart window"],
    },
}


def playbook_for_item(item: dict[str, Any]) -> dict[str, Any]:
    source = item.get("sourceType", "external")
    title = (item.get("title") or "").lower()
    if source == "host_finding" and "cacerts" in title:
        key = "jvm_cacerts"
    elif "ssh" in title:
        key = "ssh_host_keys"
    elif "jwks" in title or "oidc" in title:
        key = "jwks_rotation"
    elif source in {"code_finding", "binary_finding"}:
        key = "code_signing"
    else:
        key = "tls_hybrid_kex"
    pb = PLAYBOOKS[key]
    return {"playbookKey": key, **pb}
