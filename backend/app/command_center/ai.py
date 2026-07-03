"""AI services for Command Center — NL query, narrative, PR drafts, agentic plans."""

from __future__ import annotations

import re
from typing import Any

from app.command_center.guardrails import evaluate_method_honesty, sanitize_ai_output
from app.command_center.schemas import (
    AgenticPlanResponse,
    AgenticPlanStep,
    AiCitation,
    AiQueryResponse,
    ExecutiveNarrativeResponse,
    RemediationPrDraftResponse,
)
from app.recommendations.service import explain_portfolio_brief


def _citations_from_context(ctx: dict[str, Any]) -> list[AiCitation]:
    cites: list[AiCitation] = []
    if ctx.get("latestScanId"):
        cites.append(AiCitation(kind="scan", ref=str(ctx["latestScanId"]), label="Latest scan"))
    if ctx.get("alertCount"):
        cites.append(AiCitation(kind="alerts", ref="open", label=f"{ctx['alertCount']} open alerts"))
    return cites


def parse_nl_intent(query: str) -> tuple[str, dict[str, Any]]:
    q = query.lower()
    filters: dict[str, Any] = {}
    if "critical" in q or "high severity" in q:
        filters["severity"] = "critical"
    if "remediat" in q:
        filters["tab"] = "remediate"
    elif "drift" in q or "monitor" in q:
        filters["tab"] = "monitor"
    elif "scan" in q:
        filters["tab"] = "scans"
    if "hndl" in q or "harvest" in q:
        filters["hndl"] = True
    intent = "filter_estate"
    if "board" in q or "executive" in q:
        intent = "executive_summary"
    elif "why" in q and "drop" in q:
        intent = "explain_drop"
    return intent, filters


def run_nl_query(
    *,
    tenant_id: str,
    query: str,
    persona: str,
    portfolio_context: dict[str, Any] | None = None,
) -> AiQueryResponse:
    intent, filters = parse_nl_intent(query)
    ctx = portfolio_context or {}
    brief = explain_portfolio_brief(tenant_id=tenant_id, persona=persona, prompt=query)
    answer = sanitize_ai_output(brief.get("explanation") or "No portfolio context available yet.")
    ok, _ = evaluate_method_honesty(answer)
    return AiQueryResponse(
        answer=answer,
        intent=intent,
        filters=filters,
        citations=_citations_from_context(ctx),
        confidence="medium" if ctx.get("latestScanId") else "low",
        assumptions=[
            "Answer grounded in latest scan diff, alerts, and recommendations when available.",
            "Inventory aid — not a formal audit.",
        ],
        guardrailPassed=ok,
    )


def build_executive_narrative(
    *,
    tenant_id: str,
    summary: dict[str, Any],
) -> ExecutiveNarrativeResponse:
    readiness = summary.get("kpis", {}).get("latestReadiness")
    velocity = summary.get("remediationVelocity", {})
    closed = velocity.get("closedLast30d", 0)
    open_items = velocity.get("openCount", 0)
    parts = [
        f"Portfolio readiness is {readiness:.0f}/100." if readiness is not None else "Readiness score pending first completed scan.",
        f"{open_items} remediation items remain open; {closed} closed in the last 30 days." if open_items else "Remediation backlog is clear from latest inventory.",
        "Prioritize quantum-vulnerable TLS and long-lived certificates with documented owners and target dates.",
        "This summary reflects discovered inventory only — not complete estate coverage or formal audit attestation.",
    ]
    narrative = sanitize_ai_output(" ".join(parts))
    ok, _ = evaluate_method_honesty(narrative)
    cites = []
    if summary.get("latestScanId"):
        cites.append(AiCitation(kind="scan", ref=str(summary["latestScanId"]), label="Latest scan"))
    return ExecutiveNarrativeResponse(
        narrative=narrative,
        citations=cites,
        confidence="high" if readiness is not None else "low",
        assumptions=["Based on dashboard summary KPIs and remediation velocity."],
    )


def draft_remediation_pr(
    *,
    remediation_id: str,
    scan_id: str,
    title: str = "",
    algorithm: str = "",
) -> RemediationPrDraftResponse:
    safe_title = title or f"PQC remediation for {remediation_id}"
    return RemediationPrDraftResponse(
        remediationId=remediation_id,
        title=safe_title,
        description=(
            f"Automated draft to migrate {algorithm or 'quantum-vulnerable'} configuration "
            f"identified in scan {scan_id}. Review before merge."
        ),
        files=[
            {"path": "tls/hybrid.conf", "content": "# Enable hybrid TLS cipher suites\nHybridTLS=on\n"},
            {"path": "docs/pqc-remediation.md", "content": f"Remediation id: {remediation_id}\n"},
        ],
        checklist=[
            "Verify staging endpoint negotiates hybrid TLS",
            "Run follow-up scan and attach signed report",
            "Update owner and target date in remediation board",
        ],
    )


def build_agentic_plan(*, remediation_id: str) -> AgenticPlanResponse:
    steps = [
        AgenticPlanStep(id="1", label="Dry-run configuration change in staging", requiresApproval=True),
        AgenticPlanStep(id="2", label="Open PR with hybrid TLS / cert renewal bundle", requiresApproval=True),
        AgenticPlanStep(id="3", label="Schedule verification scan after deploy", requiresApproval=False),
        AgenticPlanStep(id="4", label="Mark remediation verified with signed evidence", requiresApproval=True),
    ]
    return AgenticPlanResponse(
        remediationId=remediation_id,
        steps=steps,
        assumptions=["Human approval required before any production change."],
    )
