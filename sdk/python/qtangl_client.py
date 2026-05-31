"""Minimal Qtangl PQC API client (Python)."""
from __future__ import annotations

import json
import urllib.error
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

    def scan_fixture(self, scenario_id: str = "bank-tls-inventory") -> dict[str, Any]:
        return self._post("/pqc/scan", {"scenarioId": scenario_id, "useFixture": True})

    def report_pdf(self, scan_id: str) -> bytes:
        url = f"{self.base_url}/pqc/report/{scan_id}?format=pdf&api_key={self.api_key}"
        with urllib.request.urlopen(url, timeout=120) as response:
            return response.read()

    def verify(self, scan_id: str) -> dict[str, Any]:
        return self._get(f"/pqc/verify/{scan_id}")

    def _get(self, path: str) -> dict[str, Any]:
        with urllib.request.urlopen(f"{self.base_url}{path}", timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))

    def _post(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base_url}{path}", data=data, headers=self._headers(), method="POST"
        )
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
