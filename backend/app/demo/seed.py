from __future__ import annotations

from app.demo.registry import ASSET_KINDS, ComplianceTarget, DemoResource, Posture


def seed_enterprise_fleet() -> list[DemoResource]:
    """Realistic multi-BU enterprise crypto estate for live demos."""
    specs: list[dict] = [
        {"id": "demo-api-gw", "label": "API Gateway TLS", "kind": "tls", "host": "api.acme-corp.example", "port": 443, "bu": "Platform", "posture": "classical"},
        {"id": "demo-admin-tls", "label": "Admin Portal TLS", "kind": "tls", "host": "admin.acme-corp.example", "port": 443, "bu": "Platform", "posture": "hybrid"},
        {"id": "demo-oidc-jwks", "label": "OIDC JWKS", "kind": "jwks", "host": "auth.acme-corp.example", "port": 443, "bu": "Identity", "posture": "classical", "compliance": "pci-dss"},
        {"id": "demo-bastion-ssh", "label": "Bastion SSH", "kind": "ssh", "host": "bastion.acme-corp.example", "port": 22, "bu": "Infrastructure", "posture": "classical"},
        {"id": "demo-payments-tls", "label": "Payments TLS", "kind": "tls", "host": "pay.acme-corp.example", "port": 443, "bu": "Payments", "posture": "classical", "compliance": "pci-dss"},
        {"id": "demo-payments-jwks", "label": "Payments JWKS", "kind": "jwks", "host": "pay.acme-corp.example", "port": 443, "bu": "Payments", "posture": "classical", "compliance": "pci-dss"},
        {"id": "demo-postgres-tls", "label": "Postgres TLS", "kind": "db_tls", "host": "db.acme-corp.example", "port": 5432, "bu": "Data", "posture": "classical"},
        {"id": "demo-mail-starttls", "label": "Mail STARTTLS", "kind": "email", "host": "mail.acme-corp.example", "port": 587, "bu": "Collaboration", "posture": "classical"},
        {"id": "demo-code-sign", "label": "Release Code Signing", "kind": "code_signing", "host": "sign.acme-corp.example", "port": None, "bu": "DevOps", "posture": "hybrid", "compliance": "cmmc"},
        {"id": "demo-edge-tls", "label": "Edge CDN TLS", "kind": "tls", "host": "cdn.acme-corp.example", "port": 443, "bu": "Platform", "posture": "pqc", "compliance": "nist-ir-8547"},
        {"id": "demo-hr-portal", "label": "HR Portal TLS", "kind": "tls", "host": "hr.acme-corp.example", "port": 443, "bu": "HR", "posture": "classical", "compliance": "cmmc"},
        {"id": "demo-analytics-db", "label": "Analytics DB TLS", "kind": "db_tls", "host": "analytics-db.acme-corp.example", "port": 5432, "bu": "Data", "posture": "hybrid"},
    ]
    resources: list[DemoResource] = []
    for spec in specs:
        kind = spec["kind"]
        if kind not in ASSET_KINDS:
            continue
        resources.append(
            DemoResource(
                id=str(spec["id"]),
                label=str(spec["label"]),
                kind=kind,  # type: ignore[arg-type]
                host=str(spec["host"]),
                port=int(spec["port"]) if spec.get("port") is not None else None,
                business_unit=str(spec.get("bu") or "default"),
                posture=spec.get("posture", "classical"),  # type: ignore[arg-type]
                compliance_target=spec.get("compliance", "general"),  # type: ignore[arg-type]
                enabled=True,
                active_events=[],
            )
        )
    return resources
