"""Qtangl PQC API client (Python)."""
from __future__ import annotations

import json
import urllib.request
from typing import Any


class QtanglClient:
    def __init__(self, base_url: str, api_key: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def health_ready(self) -> dict[str, Any]:
        return self._get("/health/ready")

    def me(self) -> dict[str, Any]:
        return self._get("/tenant/me")

    def scan(self, *, target: str, scenario_id: str = "bank-tls-inventory", use_fixture: bool = False) -> dict[str, Any]:
        return self._post(
            "/pqc/scan",
            {"target": target, "scenarioId": scenario_id, "useFixture": use_fixture},
        )

    def scan_fixture(self, scenario_id: str = "bank-tls-inventory") -> dict[str, Any]:
        return self.scan(target="example.com", scenario_id=scenario_id, use_fixture=True)

    def list_schedules(self) -> dict[str, Any]:
        return self._get("/tenant/schedules")

    def create_schedule(
        self,
        *,
        target: str,
        cadence_hours: int = 168,
        notify_email: str | None = None,
    ) -> dict[str, Any]:
        return self._post(
            "/tenant/schedules",
            {
                "scenarioId": "bank-tls-inventory",
                "target": target,
                "cadenceHours": cadence_hours,
                "notifyEmail": notify_email,
            },
        )

    def get_settings(self) -> dict[str, Any]:
        return self._get("/tenant/settings")

    def update_settings(self, settings: dict[str, Any]) -> dict[str, Any]:
        return self._put("/tenant/settings", settings)

    def list_webhooks(self) -> dict[str, Any]:
        return self._get("/tenant/webhooks")

    def report_pdf(self, scan_id: str) -> bytes:
        url = f"{self.base_url}/tenant/scans/{scan_id}/report?format=pdf&api_key={self.api_key}"
        with urllib.request.urlopen(url, timeout=120) as response:
            return response.read()

    def verify(self, scan_id: str) -> dict[str, Any]:
        return self._get(f"/pqc/verify/{scan_id}")

    def _get(self, path: str) -> dict[str, Any]:
        req = urllib.request.Request(f"{self.base_url}{path}", headers=self._headers(), method="GET")
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))

    def _post(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(f"{self.base_url}{path}", data=data, headers=self._headers(), method="POST")
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))

    def _put(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(f"{self.base_url}{path}", data=data, headers=self._headers(), method="PUT")
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
