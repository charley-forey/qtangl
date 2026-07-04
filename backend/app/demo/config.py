from __future__ import annotations

import os

DEMO_TENANT_ID = os.getenv("QTANGL_DEMO_TENANT_ID", "demo-live-range")
DEMO_SCENARIO_ID = os.getenv("QTANGL_DEMO_SCENARIO_ID", "bank-tls-inventory")
DEMO_CADENCE_SEC = float(os.getenv("QTANGL_DEMO_CADENCE_SEC", "60"))


def demo_enabled() -> bool:
    raw = os.getenv("QTANGL_DEMO_ENABLED", "true").lower()
    return raw in {"1", "true", "yes", "on"}


def demo_tenant_id() -> str:
    return DEMO_TENANT_ID
