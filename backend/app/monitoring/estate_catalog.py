"""Monitor estate catalog — targets, scenarios, and portfolio labels for demo seeding."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# Live-scan targets (must be on tenant allowlist + QTANGL_PQC_ENABLE_LIVE_SCAN for scheduler).
LIVE_MONITOR_TARGETS: tuple[dict[str, str], ...] = (
    {"target": "qtangl.com", "scenarioId": "bank-tls-inventory", "businessUnit": "Corporate", "label": "Qtangl apex"},
    {"target": "www.qtangl.com", "scenarioId": "bank-tls-inventory", "businessUnit": "Marketing", "label": "Marketing site"},
    {"target": "api.qtangl.com", "scenarioId": "gov-contractor-cmmc", "businessUnit": "Platform", "label": "API gateway"},
    {
        "target": "test.openquantumsafe.org",
        "scenarioId": "healthcare-insurer-hndl",
        "businessUnit": "PQC Lab",
        "label": "OQS reference host",
    },
    {
        "target": "badssl.com",
        "scenarioId": "bank-tls-inventory",
        "businessUnit": "Security Lab",
        "label": "TLS edge-case reference",
    },
    {
        "target": "www.cloudflare.com",
        "scenarioId": "gov-contractor-cmmc",
        "businessUnit": "CDN Benchmark",
        "label": "CDN TLS baseline",
    },
)

# Fixture scenario baselines (populate Command Center trend/alerts without live network).
FIXTURE_BASELINE_SCENARIOS: tuple[str, ...] = (
    "bank-tls-inventory",
    "gov-contractor-cmmc",
    "healthcare-insurer-hndl",
)

# Domains merged into tenant authorized-domain allowlist.
ESTATE_ALLOWLIST_DOMAINS: tuple[str, ...] = tuple(
    dict.fromkeys(row["target"] for row in LIVE_MONITOR_TARGETS)
)


@dataclass(frozen=True, slots=True)
class EstateSeedPlan:
    tenant_id: str
    notify_email: str
    live_targets: tuple[dict[str, str], ...]
    fixture_scenarios: tuple[str, ...]
    allowlist_domains: tuple[str, ...]
    cadence_hours: int = 24

    def summary(self) -> dict[str, Any]:
        return {
            "tenantId": self.tenant_id,
            "notifyEmail": self.notify_email,
            "liveScheduleCount": len(self.live_targets),
            "fixtureBaselineCount": len(self.fixture_scenarios),
            "allowlistDomains": list(self.allowlist_domains),
            "cadenceHours": self.cadence_hours,
        }
