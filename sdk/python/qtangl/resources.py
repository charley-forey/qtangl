"""Monitor, CBOM, drift, remediation, and report helpers for QtanglClient."""

from __future__ import annotations

from typing import Any, Mapping, Protocol
from urllib.parse import quote

from qtangl.models import (
    CbomConflictResolveRequest,
    JsonDict,
    ProgramCreateRequest,
    ProgramUpdateRequest,
    ProgramVerifyRequest,
    RemediationUpdateRequest,
    SchedulePatchRequest,
    TenantSettingsRequest,
)


class _TransportLike(Protocol):
    base_url: str
    api_key: str

    def request(
        self,
        method: str,
        path: str,
        *,
        json: Mapping[str, Any] | None = None,
        params: Mapping[str, str | int | float | bool | None] | None = None,
        auth: bool = True,
        idempotency_key: str | None = None,
    ) -> Any: ...


def _events_field(events: str | list[str] | None) -> str | None:
    if events is None:
        return None
    if isinstance(events, list):
        return ",".join(events)
    return events


class MonitorResource:
    def __init__(self, transport: _TransportLike) -> None:
        self._transport = transport

    def get_settings(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/settings")

    def update_settings(self, settings: TenantSettingsRequest | Mapping[str, Any]) -> JsonDict:
        body = TenantSettingsRequest.model_validate(settings).model_dump(mode="json", exclude_none=True)
        return self._transport.request("PUT", "/tenant/settings", json=body)

    def list_integrations(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/integrations")

    def save_integration(self, provider: str, config: Mapping[str, Any]) -> JsonDict:
        return self._transport.request("POST", f"/tenant/integrations/{provider}", json={"config": dict(config)})

    def list_webhooks(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/webhooks")

    def create_webhook(self, url: str, *, events: str | list[str] | None = None) -> JsonDict:
        body: dict[str, Any] = {"url": url}
        normalized = _events_field(events)
        if normalized is not None:
            body["events"] = normalized
        return self._transport.request("POST", "/tenant/webhooks", json=body)

    def delete_webhook(self, webhook_id: str) -> JsonDict:
        return self._transport.request("DELETE", f"/tenant/webhooks/{webhook_id}")

    def list_webhook_dlq(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/webhooks/dlq")

    def replay_webhook(self, dead_letter_id: str) -> JsonDict:
        return self._transport.request(
            "POST",
            "/tenant/webhooks/replay",
            json={"deadLetterId": dead_letter_id},
        )

    def patch_schedule(
        self,
        schedule_id: str,
        patch: SchedulePatchRequest | Mapping[str, Any],
    ) -> JsonDict:
        body = SchedulePatchRequest.model_validate(patch).model_dump(mode="json", exclude_none=True)
        return self._transport.request("PATCH", f"/tenant/schedules/{schedule_id}", json=body)

    def delete_schedule(self, schedule_id: str) -> JsonDict:
        return self._transport.request("DELETE", f"/tenant/schedules/{schedule_id}")

    def schedule_runs(self, schedule_id: str) -> JsonDict:
        return self._transport.request("GET", f"/tenant/schedules/{schedule_id}/runs")


class DriftResource:
    def __init__(self, transport: _TransportLike) -> None:
        self._transport = transport

    def summary(self, *, since_days: int = 7) -> JsonDict:
        return self._transport.request("GET", f"/tenant/drift/summary?since_days={since_days}")

    def scope(self, source_type: str, scope_key: str) -> JsonDict:
        return self._transport.request(
            "GET",
            f"/tenant/drift/{quote(source_type, safe='')}/{quote(scope_key, safe='')}",
        )

    def history(
        self,
        *,
        source_type: str | None = None,
        limit: int = 50,
    ) -> JsonDict:
        params: list[str] = [f"limit={limit}"]
        if source_type is not None:
            params.append(f"source_type={quote(source_type, safe='')}")
        query = "&".join(params)
        return self._transport.request("GET", f"/tenant/drift/history?{query}")

    def intel(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/drift-intel")


class RemediationResource:
    def __init__(self, transport: _TransportLike) -> None:
        self._transport = transport

    def list_for_scan(self, scan_id: str) -> JsonDict:
        return self._transport.request("GET", f"/tenant/scans/{scan_id}/remediation")

    def upsert_for_scan(
        self,
        scan_id: str,
        body: RemediationUpdateRequest | Mapping[str, Any],
    ) -> JsonDict:
        payload = RemediationUpdateRequest.model_validate(body).model_dump(mode="json", exclude_none=True)
        return self._transport.request("POST", f"/tenant/scans/{scan_id}/remediation", json=payload)

    def verify_for_scan(
        self,
        scan_id: str,
        *,
        remediation_id: str,
        verify_scan_id: str,
    ) -> JsonDict:
        return self._transport.request(
            "POST",
            f"/tenant/scans/{scan_id}/remediation/verify",
            json={"remediationId": remediation_id, "verifyScanId": verify_scan_id},
        )

    def intelligence(self, scan_id: str) -> JsonDict:
        return self._transport.request("GET", f"/tenant/scans/{scan_id}/remediation/intelligence")

    def simulate_for_scan(self, scan_id: str, body: Mapping[str, Any]) -> JsonDict:
        return self._transport.request("POST", f"/tenant/scans/{scan_id}/remediation/simulate", json=dict(body))

    def automate_for_scan(self, scan_id: str, body: Mapping[str, Any]) -> JsonDict:
        return self._transport.request("POST", f"/tenant/scans/{scan_id}/remediation/automate", json=dict(body))

    def list_program(
        self,
        *,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> JsonDict:
        params = [f"limit={limit}", f"offset={offset}"]
        if status is not None:
            params.append(f"status={quote(status, safe='')}")
        query = "&".join(params)
        return self._transport.request("GET", f"/tenant/remediation/program?{query}")

    def create_program(self, body: ProgramCreateRequest | Mapping[str, Any]) -> JsonDict:
        payload = ProgramCreateRequest.model_validate(body).model_dump(mode="json", exclude_none=True)
        return self._transport.request("POST", "/tenant/remediation/program", json=payload)

    def program_velocity(self) -> JsonDict:
        return self._transport.request("GET", "/tenant/remediation/program/velocity")

    def simulate_program(self, body: Mapping[str, Any]) -> JsonDict:
        return self._transport.request("POST", "/tenant/remediation/program/simulate", json=dict(body))

    def update_program(
        self,
        item_id: str,
        body: ProgramUpdateRequest | Mapping[str, Any],
    ) -> JsonDict:
        payload = ProgramUpdateRequest.model_validate(body).model_dump(mode="json", exclude_none=True)
        return self._transport.request("PUT", f"/tenant/remediation/program/{item_id}", json=payload)

    def program_playbook(self, item_id: str) -> JsonDict:
        return self._transport.request("GET", f"/tenant/remediation/program/{item_id}/playbook")

    def verify_program(
        self,
        item_id: str,
        body: ProgramVerifyRequest | Mapping[str, Any] | None = None,
    ) -> JsonDict:
        payload = ProgramVerifyRequest.model_validate(body or {}).model_dump(mode="json", exclude_none=True)
        return self._transport.request("POST", f"/tenant/remediation/program/{item_id}/verify", json=payload)

    def flip_dry_run(self, program_item_id: str, body: Mapping[str, Any]) -> JsonDict:
        return self._transport.request(
            "POST",
            f"/tenant/remediation/program/{program_item_id}/flip/dry-run",
            json=dict(body),
        )

    def flip(self, program_item_id: str, body: Mapping[str, Any]) -> JsonDict:
        return self._transport.request(
            "POST",
            f"/tenant/remediation/program/{program_item_id}/flip",
            json=dict(body),
        )


class CbomResource:
    def __init__(self, transport: _TransportLike) -> None:
        self._transport = transport

    def ingest(
        self,
        document: Mapping[str, Any],
        *,
        source_label: str | None = None,
        verification_status: str = "unverified-source",
        idempotency_key: str | None = None,
    ) -> JsonDict:
        body = {
            "document": dict(document),
            "verificationStatus": verification_status,
        }
        if source_label is not None:
            body["sourceLabel"] = source_label
        return self._transport.request(
            "POST",
            "/pqc/cbom/ingest",
            json=body,
            idempotency_key=idempotency_key,
        )

    def aggregate(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/cbom/aggregate")

    def sources(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/cbom/sources")

    def conflicts(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/cbom/conflicts")

    def diff(self) -> JsonDict:
        return self._transport.request("GET", "/pqc/cbom/diff")

    def resolve_conflict(
        self,
        conflict_id: str,
        resolved_value: str,
    ) -> JsonDict:
        body = CbomConflictResolveRequest(resolvedValue=resolved_value).model_dump(mode="json")
        return self._transport.request("PUT", f"/pqc/cbom/conflicts/{conflict_id}", json=body)


class ReportResource:
    def __init__(self, transport: _TransportLike) -> None:
        self._transport = transport

    def availability(self, scan_id: str) -> JsonDict:
        return self._transport.request("GET", f"/pqc/report/{scan_id}/availability")

    def persist_scan_bundle(self, scan_id: str, bundle: Mapping[str, Any]) -> JsonDict:
        return self._transport.request("POST", f"/pqc/scan/{scan_id}/persist", json=dict(bundle))
