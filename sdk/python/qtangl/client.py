from __future__ import annotations

import time
from typing import Any, Mapping

from qtangl._transport import Transport
from qtangl.models import JsonDict, PqcScanRequest, ScheduleCreateRequest, VerifyReportRequest
from qtangl.resources import CbomResource, DriftResource, MonitorResource, RemediationResource, ReportResource


class QtanglClient:
    """Qtangl API client — scan, verify, monitor, and CBOM helpers."""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        timeout: float = 120.0,
        max_retries: int = 3,
        transport: Transport | None = None,
    ) -> None:
        self._transport = transport or Transport(
            base_url=base_url,
            api_key=api_key,
            timeout=timeout,
            max_retries=max_retries,
        )
        self.monitor = MonitorResource(self._transport)
        self.drift = DriftResource(self._transport)
        self.remediation = RemediationResource(self._transport)
        self.cbom = CbomResource(self._transport)
        self.reports = ReportResource(self._transport)

    def close(self) -> None:
        self._transport.close()

    def __enter__(self) -> QtanglClient:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def health_ready(self) -> JsonDict:
        return self._transport.request("GET", "/health/ready", auth=False)

    def scan(
        self,
        request: PqcScanRequest | Mapping[str, Any] | None = None,
        *,
        idempotency_key: str | None = None,
    ) -> JsonDict:
        body = PqcScanRequest.model_validate(request or {}).model_dump(mode="json", exclude_none=True)
        return self._transport.request(
            "POST",
            "/pqc/scan",
            json=body,
            idempotency_key=idempotency_key,
        )

    def scan_fixture(
        self,
        *,
        scenario_id: str = "bank-tls-inventory",
        idempotency_key: str | None = None,
    ) -> JsonDict:
        return self.scan(
            PqcScanRequest(scenarioId=scenario_id, useFixture=True, target="example.com"),
            idempotency_key=idempotency_key,
        )

    def get_scan(self, scan_id: str) -> JsonDict:
        return self._transport.request("GET", f"/pqc/scan/{scan_id}")

    def wait_for_scan(
        self,
        scan_id: str,
        *,
        timeout: float = 300.0,
        interval: float = 2.0,
    ) -> JsonDict:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            payload = self.get_scan(scan_id)
            status = payload.get("status")
            if status in {"success", "failed", "error"}:
                return payload
            time.sleep(interval)
        raise TimeoutError(f"Scan {scan_id} did not complete within {timeout}s")

    def verify_scan(self, scan_id: str) -> JsonDict:
        return self._transport.request("GET", f"/pqc/verify/{scan_id}", auth=False)

    def verify_report(self, report_json: Mapping[str, Any]) -> JsonDict:
        body = VerifyReportRequest(reportJson=dict(report_json)).model_dump(mode="json")
        return self._transport.request("POST", "/pqc/verify", json=body, auth=False)

    def transparency_root(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/transparency/root", auth=False)

    def transparency_keys(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/transparency/keys", auth=False)

    def transparency_inclusion(self, content_hash: str) -> JsonDict:
        return self._transport.request("GET", f"/pqc/transparency/{content_hash}", auth=False)

    def dogfood_latest(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/dogfood/latest", auth=False)

    def dogfood_summary(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/dogfood/summary", auth=False)

    def dogfood_history(self, *, days: int = 90) -> JsonDict:
        return self._transport.request("GET", f"/pqc/dogfood/history?days={days}", auth=False)

    def dogfood_auditor_bundle(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/dogfood/auditor-bundle", auth=False)

    def list_schedules(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/schedules")

    def create_schedule(
        self,
        request: ScheduleCreateRequest | Mapping[str, Any],
        *,
        idempotency_key: str | None = None,
    ) -> JsonDict:
        body = ScheduleCreateRequest.model_validate(request).model_dump(mode="json", exclude_none=True)
        return self._transport.request(
            "POST",
            "/tenant/schedules",
            json=body,
            idempotency_key=idempotency_key,
        )

    def list_scans(self, *, limit: int | None = None) -> JsonDict:
        path = "/tenant/scans"
        if limit is not None:
            path = f"{path}?limit={limit}"
        return self._transport.request("GET", path)

    def me(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/me")

    def billing_portal(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/billing/portal")

    def tenant_report_url(
        self,
        scan_id: str,
        *,
        format: str = "pdf",
    ) -> str:
        from urllib.parse import urlencode

        query = urlencode({"format": format, "api_key": self._transport.api_key})
        return f"{self._transport.base_url}/tenant/scans/{scan_id}/report?{query}"

    def pqc_report_url(
        self,
        scan_id: str,
        *,
        format: str = "pdf",
    ) -> str:
        from urllib.parse import urlencode

        query = urlencode({"format": format, "api_key": self._transport.api_key})
        return f"{self._transport.base_url}/pqc/report/{scan_id}?{query}"

    def request(
        self,
        method: str,
        path: str,
        *,
        json: Mapping[str, Any] | None = None,
        params: Mapping[str, str | int | float | bool | None] | None = None,
        auth: bool = True,
        idempotency_key: str | None = None,
    ) -> JsonDict:
        payload = self._transport.request(
            method,
            path,
            json=json,
            params=params,
            auth=auth,
            idempotency_key=idempotency_key,
        )
        if isinstance(payload, dict):
            return payload
        return {"data": payload}
