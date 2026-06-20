from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from app.recommendations.maturity import compute_maturity_stage


def _rec_id(*parts: str) -> str:
    digest = hashlib.sha256(":".join(parts).encode()).hexdigest()[:16]
    return f"rec-{digest}"


def _mk(
    *,
    category: str,
    what: str,
    so_what: str,
    now_what: str,
    source: str,
    priority: int,
    deep_link: str,
    proof_type: str = "action",
    role_filter: list[str] | None = None,
    scan_id: str | None = None,
    dismissible: bool = True,
    extra_id: str = "",
) -> dict[str, Any]:
    rid = _rec_id(category, source, what, extra_id)
    return {
        "id": rid,
        "priority": priority,
        "category": category,
        "what": what,
        "soWhat": so_what,
        "nowWhat": now_what,
        "proof": {
            "type": proof_type,
            "scanId": scan_id,
            "deepLink": deep_link,
        },
        "source": source,
        "dismissible": dismissible,
        "roleFilter": role_filter or ["executive", "operator", "admin", "viewer"],
    }


def _role_ok(rec: dict[str, Any], role: str) -> bool:
    allowed = rec.get("roleFilter") or []
    normalized = "executive" if role == "viewer" else role
    return normalized in allowed or role in allowed


def build_recommendations(
    *,
    tenant_id: str,
    role: str = "operator",
    persona: str | None = None,
    scan_id: str | None = None,
) -> list[dict[str, Any]]:
    """Fuse scan, remediation, operational, maturity, benchmark, and billing signals."""
    from app.auth_workos.capabilities import compute_onboarding_hint
    from app.billing.entitlements import check_production_scan_access, tenant_entitlements
    from app.db.config import persistence_enabled
    from app.monitoring.service import list_schedules
    from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle
    from app.tenant.settings import get_tenant_billing_flags, get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    dismissed = set(settings.get("dismissedRecommendations") or [])
    recs: list[dict[str, Any]] = []

    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=25)
    done = [s for s in scans if s.get("status") == "done"]
    has_scans = len(done) > 0
    target_scan_id = scan_id or (str(done[0]["scanId"]) if done else None)

    schedules = list_schedules(tenant_id=tenant_id) if persistence_enabled() else []
    has_schedule = len(schedules) > 0

    if not has_scans:
        recs.append(
            _mk(
                category="scan",
                what="No baseline scan completed",
                so_what="You cannot measure quantum crypto exposure or prove readiness to auditors.",
                now_what="Run an authorized baseline scan on your production domain.",
                source="onboarding_baseline",
                priority=1,
                deep_link="/dashboard?tab=scans",
                role_filter=["operator", "admin"],
            )
        )
    elif not has_schedule:
        recs.append(
            _mk(
                category="schedule",
                what="Monitoring schedule not configured",
                so_what="Crypto posture can drift between audits without scheduled re-scans.",
                now_what="Create a weekly monitoring schedule for your primary target.",
                source="onboarding_schedule",
                priority=2,
                deep_link="/dashboard?tab=monitor",
                role_filter=["operator", "admin"],
            )
        )

    hint = compute_onboarding_hint(tenant_id=tenant_id)
    if not hint.get("complete") and hint.get("nextStep") == "invite":
        recs.append(
            _mk(
                category="scan",
                what="Team not fully onboarded",
                so_what="Executives and operators need dashboard access for accountability.",
                now_what="Invite Executive and Operator teammates.",
                source="onboarding_invite",
                priority=3,
                deep_link="/dashboard?tab=settings",
                role_filter=["admin"],
            )
        )

    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    ent = tenant_entitlements(tenant_id=tenant_id)
    if not billing.get("assessPaidAt") and int(billing.get("trialScansUsed", 0)) >= int(
        ent.get("trialScansRemaining", 1)
    ):
        recs.append(
            _mk(
                category="billing",
                what="Trial scan used — assess payment required",
                so_what="Production baselines and signed evidence require Assess entitlement.",
                now_what="Complete one-time Assess checkout to unlock production scans.",
                source="assess_payment",
                priority=1,
                deep_link="/dashboard?upgrade=assess",
                role_filter=["admin", "operator"],
            )
        )

    paywall = check_production_scan_access(tenant_id=tenant_id, use_fixture=False)
    if paywall and paywall.get("code") == "assess_payment_required":
        pass  # already covered above
    elif paywall and paywall.get("code") == "scan_quota_exceeded":
        recs.append(
            _mk(
                category="billing",
                what="Monthly scan quota reached",
                so_what="Additional scans are blocked until quota resets or tier upgrades.",
                now_what="Upgrade to Monitor for higher scan limits.",
                source="scan_quota",
                priority=2,
                deep_link="/dashboard?upgrade=monitor",
                role_filter=["admin"],
            )
        )

    if target_scan_id:
        bundle = load_scan_bundle(target_scan_id, tenant_id=tenant_id)
        if bundle:
            report = bundle.get("report") or {}
            exec_sum = report.get("executiveSummary") or {}
            backlog = report.get("remediationBacklog") or []
            for idx, item in enumerate(exec_sum.get("topPriorities") or []):
                title = str(item.get("title", "Priority item"))
                action = str(item.get("action", ""))[:240]
                rem_id = ""
                if idx < len(backlog):
                    rem_id = str(backlog[idx].get("id") or "")
                deep_link = f"/dashboard?tab=remediate&scanId={target_scan_id}"
                if rem_id:
                    deep_link += f"&remediationId={rem_id}"
                recs.append(
                    _mk(
                        category="remediation",
                        what=title,
                        so_what="Mosca-ranked priority from latest scan executive summary.",
                        now_what=action or "Review and assign owner in remediation board.",
                        source="top_priorities",
                        priority=10 + idx,
                        deep_link=deep_link,
                        proof_type="scan_backlog",
                        scan_id=target_scan_id,
                        extra_id=title,
                    )
                )

            scan_diff = report.get("scanDiff") or report.get("scan_diff")
            if scan_diff:
                delta = float(scan_diff.get("readinessDelta", 0))
                if delta <= -5:
                    recs.append(
                        _mk(
                            category="drift",
                            what=f"Readiness dropped {abs(delta):.1f} points",
                            so_what="Regression may indicate new vulnerable crypto or cert expiry.",
                            now_what="Review scan diff and prioritize degraded assets.",
                            source="readiness_drop",
                            priority=5,
                            deep_link=f"/dashboard?tab=scans&scanId={target_scan_id}",
                            proof_type="scan_diff",
                            scan_id=target_scan_id,
                        )
                    )
                new_qv = int(scan_diff.get("newQuantumVulnerableCount", 0))
                if new_qv > 0:
                    backlog = report.get("remediationBacklog") or []
                    rem_id = str(backlog[0].get("id") or "") if backlog else ""
                    deep_link = f"/dashboard?tab=remediate&scanId={target_scan_id}"
                    if rem_id:
                        deep_link += f"&remediationId={rem_id}"
                    recs.append(
                        _mk(
                            category="drift",
                            what=f"{new_qv} new quantum-vulnerable asset(s)",
                            so_what="New exposure increases harvest-now-decrypt-later risk.",
                            now_what="Triage new findings in the remediation board.",
                            source="new_quantum_vulnerable",
                            priority=4,
                            deep_link=deep_link,
                            proof_type="scan_diff",
                            scan_id=target_scan_id,
                        )
                    )

            if settings.get("benchmarkOptIn"):
                peer = (exec_sum.get("peerComparison") or {}) if exec_sum else {}
                if peer.get("available"):
                    band = str(peer.get("band", ""))
                    if band in {"below_median", "lagging", "bottom_quartile"}:
                        recs.append(
                            _mk(
                                category="compliance",
                                what="Below peer median readiness",
                                so_what=f"Industry cohort median is {peer.get('medianReadiness', '—')}.",
                                now_what="Accelerate TLS and signing-key migration to close the gap.",
                                source="benchmark_gap",
                                priority=15,
                                deep_link="/dashboard?tab=remediate",
                                proof_type="benchmark",
                                scan_id=target_scan_id,
                            )
                        )

    maturity = compute_maturity_stage(tenant_id=tenant_id)
    if maturity.get("stage") == 3 and maturity.get("nextStage") == 4:
        recs.append(
            _mk(
                category="remediation",
                what="Ready for Convert — verify-fix at scale",
                so_what="You are Monitored with active schedules; critical findings need closed-loop migration.",
                now_what="Start verify-fix on one critical TLS finding, then talk to sales about Convert orchestration.",
                source="convert_upgrade",
                priority=6,
                deep_link="/dashboard?tab=remediate&upgrade=convert",
                proof_type="maturity",
                role_filter=["admin", "operator", "executive"],
                extra_id="stage3-convert",
            )
        )
    if maturity.get("nextStage") is not None:
        recs.append(
            _mk(
                category="scan",
                what=f"Maturity: Stage {maturity['stage']} — {maturity['name']}",
                so_what=f"Next stage is {maturity.get('nextStageName')} ({maturity.get('nextStageTier')}).",
                now_what=_maturity_next_action(maturity),
                source="maturity_gap",
                priority=20,
                deep_link="/dashboard?tab=overview",
                proof_type="maturity",
                extra_id=str(maturity["stage"]),
            )
        )

    from app.portfolio.service import readiness_rollup

    rollup = readiness_rollup(tenant_id=tenant_id)
    scans = rollup.get("scans", [])
    high_risk = [
        row
        for row in scans
        if str(row.get("readinessBand", "")).lower() in {"lagging", "critical", "high-risk"}
    ]
    if high_risk:
        target = high_risk[0]
        recs.append(
            _mk(
                category="remediation",
                what=f"High-risk unit: {target.get('target', 'portfolio target')}",
                so_what=f"Readiness {target.get('readinessScore', '—')} below portfolio threshold.",
                now_what="Schedule remediation sprint for this business unit.",
                source="portfolio_high_risk",
                priority=12,
                deep_link="/dashboard?tab=monitor",
                role_filter=["operator", "admin", "executive"],
                extra_id=str(target.get("target", "")),
            )
        )

    if role in {"executive", "viewer"} and has_scans:
        recs.append(
            _mk(
                category="scan",
                what="Review latest board-ready evidence",
                so_what="Executives need signed reports for governance and audit committees.",
                now_what="Open latest scan report and export board pack.",
                source="executive_review",
                priority=8,
                deep_link=f"/dashboard?tab=scans&scanId={target_scan_id or ''}",
                role_filter=["executive", "viewer"],
            )
        )

    from app.store.tenant_alerts import list_alerts

    severity_priority = {"critical": 3, "high": 5, "medium": 8, "info": 12}
    for alert in list_alerts(tenant_id=tenant_id, since_days=30, include_resolved=False):
        rule = str(alert.get("rule") or alert.get("type") or "alert")
        alert_id = str(alert.get("id") or rule)
        payload = alert.get("payload") or {}
        scan_id = payload.get("scanId") or payload.get("scan_id")
        deep_link = str(alert.get("actionUrl") or "/dashboard?tab=overview")
        if not deep_link.startswith("/dashboard"):
            deep_link = "/dashboard?tab=overview"
        recs.append(
            _mk(
                category="drift" if rule in {"readiness_drop", "new_quantum_vulnerable", "algorithm_degraded"} else "scan",
                what=str(alert.get("message") or rule.replace("_", " ")),
                so_what=f"Unresolved alert: {rule.replace('_', ' ')}.",
                now_what="Review alert details and take action from the linked workflow.",
                source="alert_inbox",
                priority=severity_priority.get(str(alert.get("severity", "info")).lower(), 10),
                deep_link=deep_link,
                proof_type="alert",
                scan_id=str(scan_id) if scan_id else None,
                extra_id=alert_id,
            )
        )

    filtered = [r for r in recs if r["id"] not in dismissed and _role_ok(r, role)]
    filtered.sort(key=lambda r: r["priority"])
    return filtered[:12]


def _maturity_next_action(maturity: dict[str, Any]) -> str:
    nxt = maturity.get("nextStage")
    actions = {
        1: "Complete your first authorized baseline scan.",
        2: "Assign owners to top remediation backlog items.",
        3: "Enable a weekly monitoring schedule.",
        4: "Start verify-fix workflow on a critical finding.",
        5: "Reach readiness score ≥80 with active monitoring.",
        6: "Opt into benchmarks and sustain leading peer band.",
    }
    return actions.get(nxt, "Continue your quantum readiness journey.")


def recommendation_action_strings(*, tenant_id: str, role: str = "operator") -> list[str]:
    """Plain strings for portfolio command center / digest compatibility."""
    return [r["nowWhat"] for r in build_recommendations(tenant_id=tenant_id, role=role)[:5]]


def dismiss_recommendation(*, tenant_id: str, recommendation_id: str) -> None:
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    dismissed = list(settings.get("dismissedRecommendations") or [])
    if recommendation_id not in dismissed:
        dismissed.append(recommendation_id)
    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={
            "dismissedRecommendations": dismissed[-100:],
            "lastRecommendationRunAt": datetime.now(timezone.utc).isoformat(),
        },
    )


def explain_scan_brief(*, tenant_id: str, scan_id: str, persona: str | None = None) -> dict[str, Any]:
    """Executive scan-level brief (rules-first, optional LLM)."""
    from app.ai.copilot import explain_finding
    from app.store.scan_jobs import load_scan_bundle

    bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
    if not bundle:
        return {"status": "error", "reason": "scan_not_found"}

    report = bundle.get("report") or {}
    exec_sum = report.get("executiveSummary") or {}
    finding = {
        "title": f"Scan readiness {report.get('readinessScore')}",
        "severity": "info",
        "summary": exec_sum.get("verdict")
        or f"Readiness band {report.get('readinessBand')}. "
        f"{len(report.get('remediationBacklog') or [])} remediation items in backlog.",
        "readinessScore": report.get("readinessScore"),
        "readinessBand": report.get("readinessBand"),
    }
    context = json.dumps(
        {
            "persona": persona or "executive",
            "topPriorities": exec_sum.get("topPriorities", [])[:3],
            "exposureRangeUsd": exec_sum.get("exposureRangeUsd"),
            "nearestDeadline": exec_sum.get("nearestDeadline"),
        }
    )
    result = explain_finding(finding=finding, context=context)
    return {"status": "success", "scanId": scan_id, **result}


def explain_portfolio_brief(
    *,
    tenant_id: str,
    persona: str | None = None,
    prompt: str | None = None,
) -> dict[str, Any]:
    """Portfolio-wide brief — maturity, health, alerts, recommendations, digest."""
    from app.ai.copilot import explain_finding
    from app.portfolio.service import weekly_executive_digest
    from app.store.scan_jobs import list_jobs_for_tenant
    from app.store.tenant_alerts import list_alerts

    maturity = compute_maturity_stage(tenant_id=tenant_id)
    recs = build_recommendations(tenant_id=tenant_id, role="executive" if persona == "executive" else "operator")[:5]
    alerts = list_alerts(tenant_id=tenant_id, since_days=14, include_resolved=False)[:5]
    digest = weekly_executive_digest(tenant_id=tenant_id)

    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=100)
    terminal = [scan for scan in scans if scan.get("status") in {"done", "error"}]
    success = sum(1 for scan in terminal if scan.get("status") == "done")
    reliability = round((100.0 * success / len(terminal)), 1) if terminal else 100.0
    latest_done = next((scan for scan in scans if scan.get("status") == "done"), None)
    metrics = {
        "latestReadinessScore": latest_done.get("readinessScore") if latest_done else None,
        "latestReadinessBand": latest_done.get("readinessBand") if latest_done else None,
        "latestScanAt": (latest_done.get("updatedAt") or latest_done.get("createdAt")) if latest_done else None,
    }
    health = {
        "scanSuccessRatePct": reliability,
        "sampleSize": len(terminal),
        "lastScanAt": metrics.get("latestScanAt"),
    }

    finding = {
        "title": f"Portfolio readiness {metrics.get('latestReadinessScore', '—')}",
        "severity": "info",
        "summary": digest.get("headline") or "Portfolio quantum readiness overview.",
        "readinessScore": metrics.get("latestReadinessScore"),
        "readinessBand": metrics.get("latestReadinessBand"),
    }
    context = json.dumps(
        {
            "persona": persona or "executive",
            "prompt": prompt,
            "maturity": maturity,
            "health": health,
            "openAlerts": len(alerts),
            "alerts": [
                {"rule": a.get("rule"), "message": a.get("message"), "severity": a.get("severity")}
                for a in alerts
            ],
            "topRecommendations": [{"what": r.get("what"), "nowWhat": r.get("nowWhat")} for r in recs],
            "digest": {
                "headline": digest.get("headline"),
                "risks": (digest.get("risks") or [])[:3],
                "nextWeekFocus": (digest.get("nextWeekFocus") or [])[:3],
            },
        }
    )
    user_prompt = prompt or "Summarize portfolio quantum readiness for an executive audience."
    result = explain_finding(
        finding={**finding, "title": user_prompt, "question": user_prompt},
        context=context,
    )
    if result.get("source") == "rules":
        risks = digest.get("risks") or []
        focus = digest.get("nextWeekFocus") or []
        result["explanation"] = (
            f"{digest.get('headline', 'Portfolio overview')}. "
            f"Maturity stage {maturity.get('stage')} ({maturity.get('name')}). "
            f"{len(alerts)} open alert(s). "
            f"Top risk: {risks[0] if risks else 'none flagged'}. "
            f"Next focus: {focus[0] if focus else recs[0]['nowWhat'] if recs else 'Run baseline scans'}."
        )
    return {"status": "success", "tenantId": tenant_id, **result}
