from __future__ import annotations

from typing import Any

from app.pqc.findings_delta import compute_findings_delta
from app.pqc.handshake import handshake_appendix_for_report
from app.pqc.models import MigrationReport
from app.pqc.references import glossary_for_report, references_for_report
from app.pqc.risk import mosca_assessment_for_report

try:
    from reportlab.lib import colors
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import Paragraph, Spacer, Table, TableStyle

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.common import exposure_range_text, format_wall_time, nearest_deadline, verify_url
from app.pqc.report_pdf.styles import CHARCOAL, MUTED, NAVY, WHITE


def watermark_banner(issues: list[str], body: ParagraphStyle) -> list[Any]:
    if not issues:
        return []
    text = "INCOMPLETE REPORT — coherence warnings: " + "; ".join(issues[:3])
    return [
        Paragraph(f'<font color="#DC2626"><b>{text}</b></font>', body),
        Spacer(1, 0.12 * inch),
    ]


def cover_section(
    report: MigrationReport,
    styles: dict[str, ParagraphStyle],
    *,
    coherence_issues: list[str] | None = None,
    branding: dict[str, Any] | None = None,
) -> list[Any]:
    from app.pqc.report_pdf.common import branding_display_name, logo_flowable

    body = styles["body"]
    muted = styles["muted"]
    title = styles["title"]
    generated = report.generated_at[:10] if report.generated_at else ""
    display = branding_display_name(branding)
    cover_title = f"{display} Q-Day Readiness Report" if display else "Qtangl Q-Day Readiness Report"
    items: list[Any] = []
    logo = logo_flowable(branding)
    if logo:
        items.append(logo)
        items.append(Spacer(1, 0.15 * inch))
    else:
        items.append(Spacer(1, 0.5 * inch))
    items.extend(
        [
            Paragraph(cover_title, title),
            Paragraph(f"<b>Scan ID:</b> {report.scan_id}", body),
            Paragraph(f"<b>Target:</b> {report.target_domain}", body),
            Paragraph(f"<b>Readiness band:</b> {report.readiness_band or '—'}", body),
            Paragraph(f"<b>Readiness score:</b> {report.readiness_score}/100", body),
            Paragraph(f"<b>Generated:</b> {generated}", body),
            Paragraph(f"<b>Scan depth:</b> {report.scan_depth or 'standard'}", muted),
        ]
    )
    items.extend(watermark_banner(coherence_issues or [], body))
    exp = exposure_range_text(report)
    if exp:
        items.append(Paragraph(f"<b>Migration exposure:</b> {exp}", body))
    items.append(Paragraph(f"<b>Nearest deadline:</b> {nearest_deadline(report)}", muted))
    if report.readiness_summary:
        items.append(Spacer(1, 0.1 * inch))
        items.append(Paragraph(report.readiness_summary, body))
    peer = (report.executive_summary or {}).get("peerComparison")
    if isinstance(peer, dict) and peer.get("available"):
        items.append(
            Paragraph(
                f"Peer band: {peer.get('band', '—')} vs {peer.get('industry', 'industry')} "
                f"(median {peer.get('median')}, n={peer.get('sampleSize')}).",
                muted,
            )
        )
    elif peer is None or not (isinstance(peer, dict) and peer.get("available")):
        items.append(
            Paragraph(
                "Peer benchmark: enroll Monitor for industry comparison when cohort size allows.",
                muted,
            )
        )
    return items


def scope_authorization_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    exec_sum = report.executive_summary or {}
    kinds = sorted({a.kind for a in report.assets})
    rows = [
        ["Field", "Value"],
        ["Authorized target", report.target_domain],
        ["Scan depth", report.scan_depth or "standard"],
        ["Scenario", report.scenario_id or "—"],
        ["Classified assets", str(len(report.assets))],
        ["Surfaces observed", ", ".join(kinds) if kinds else "—"],
        ["Authorization recorded", str(exec_sum.get("scanAuthorizationAt") or "—")],
    ]
    table = Table(rows, colWidths=[2.0 * inch, 4.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
            ]
        )
    )
    out_of_scope = [
        "Internal HSM and offline key material",
        "Shadow APIs not reachable from scan target",
        "Application-layer cryptography not exposed on scanned ports",
    ]
    blocks: list[Any] = [
        Paragraph("Scope and authorization", h2),
        table,
        Spacer(1, 0.1 * inch),
        Paragraph("<b>Explicitly out of scope</b>", body),
    ]
    for line in out_of_scope:
        blocks.append(Paragraph(f"• {line}", muted))
    for note in report.honesty_notes[:2]:
        blocks.append(Paragraph(f"• {note}", muted))
    return blocks


def findings_delta_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    delta = (report.executive_summary or {}).get("findingsDelta") or compute_findings_delta(report)
    rows = [
        ["Metric", "Manual baseline", "Qtangl scan"],
        [
            "Wall time",
            format_wall_time(float(delta.get("manualWallTimeSeconds") or 0)),
            format_wall_time(float(delta.get("qtanglWallTimeSeconds") or 0)),
        ],
        ["Assets discovered", str(delta.get("manualAssetsFound", 0)), str(delta.get("qtanglAssetsFound", 0))],
        [
            "Quantum vulnerable",
            str(delta.get("manualQuantumVulnerable", 0)),
            str(delta.get("qtanglQuantumVulnerable", 0)),
        ],
        ["HNDL exposed", "—", str(delta.get("qtanglHndlExposed", 0))],
        ["Net-new assets", "—", str(delta.get("netNewAssets", 0))],
    ]
    table = Table(rows, colWidths=[1.8 * inch, 2.0 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [
        Paragraph("Findings delta vs manual baseline", h2),
        Paragraph(str(delta.get("summary", "")), body),
        Spacer(1, 0.08 * inch),
        table,
        Spacer(1, 0.08 * inch),
        Paragraph(
            "Customer attestation (optional): We confirm net-new findings vs our prior inventory dated ______.",
            muted,
        ),
    ]


def score_kpi_table(report: MigrationReport) -> Table:
    agility = report.crypto_agility_score
    rows = [
        ["Readiness score", f"{report.readiness_score}/100"],
        ["Readiness band", report.readiness_band or "—"],
        ["Coverage confidence", f"{report.coverage_confidence}%"],
        ["Crypto agility score", f"{agility:.1f}" if agility is not None else "—"],
        ["Assets classified", str(len(report.assets))],
        ["Remediation items", str(len(report.remediation_backlog))],
    ]
    table = Table(rows, colWidths=[2.2 * inch, 3.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#E2E8F0")),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return table


def scoreboard_comparison(report: MigrationReport, body: ParagraphStyle) -> list[Any]:
    sb = report.scoreboard_summary or {}
    manual = sb.get("manual") or {}
    qtangl = sb.get("qtangl") or manual
    rows = [
        ["Metric", "Customer baseline", "Qtangl discovery"],
        [
            "Wall time",
            format_wall_time(float(manual.get("scan_wall_time_seconds") or manual.get("scanWallTimeSeconds") or 0)),
            format_wall_time(float(qtangl.get("scan_wall_time_seconds") or qtangl.get("scanWallTimeSeconds") or 0)),
        ],
        [
            "Assets",
            str(manual.get("assets_discovered") or manual.get("assetsDiscovered") or 0),
            str(qtangl.get("assets_discovered") or qtangl.get("assetsDiscovered") or len(report.assets)),
        ],
        [
            "Quantum vulnerable",
            str(manual.get("quantum_vulnerable") or manual.get("quantumVulnerable") or 0),
            str(qtangl.get("quantum_vulnerable") or qtangl.get("quantumVulnerable") or 0),
        ],
        [
            "HNDL exposed",
            str(manual.get("hndl_exposed") or manual.get("hndlExposed") or 0),
            str(qtangl.get("hndl_exposed") or qtangl.get("hndlExposed") or 0),
        ],
        [
            "Readiness",
            str(manual.get("readiness_score") or manual.get("readinessScore") or 0),
            str(qtangl.get("readiness_score") or qtangl.get("readinessScore") or report.readiness_score),
        ],
    ]
    table = Table(rows, colWidths=[1.8 * inch, 2.0 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [table]


def executive_summary_text(report: MigrationReport) -> str:
    vuln = sum(
        1
        for asset in report.assets
        if asset.vulnerability.status in {"at-risk", "broken"} and not asset.pqc_ready
    )
    pqc_ready = sum(1 for asset in report.assets if asset.pqc_ready)
    return (
        f"This endpoint-scoped Q-Day readiness assessment identified <b>{len(report.assets)}</b> "
        f"classified cryptographic assets against <b>{report.target_domain}</b>. "
        f"<b>{vuln}</b> require migration under current NIST timelines; "
        f"<b>{pqc_ready}</b> already negotiate hybrid/PQC."
    )


def inventory_table_chunk(
    assets: list[Any],
    body: ParagraphStyle,
    muted: ParagraphStyle,
    explanations: dict[str, str],
) -> list[Any]:
    if not assets:
        return [Paragraph("No classified assets in this scan.", body)]
    rows: list[list[Any]] = [
        ["Asset", "Algorithm", "Severity", "PQC", "Shor qubits"],
    ]
    for asset in assets:
        rows.append(
            [
                Paragraph(asset.label[:45], body),
                Paragraph(asset.algorithm[:28], body),
                asset.vulnerability.severity,
                "Yes" if asset.pqc_ready else "No",
                str(asset.vulnerability.shor_logical_qubits or "—"),
            ]
        )
    table = Table(rows, colWidths=[1.5 * inch, 1.1 * inch, 0.7 * inch, 0.45 * inch, 0.75 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    blocks: list[Any] = [table]
    for asset in assets[:10]:
        expl = explanations.get(asset.id) or report_explanation_fallback(asset)
        blocks.append(
            Paragraph(
                f"<b>{asset.label}</b> — What this means: {expl[:240]}",
                muted,
            )
        )
    return blocks


def report_explanation_fallback(asset: Any) -> str:
    return asset.vulnerability.summary or asset.hndl_verdict or ""


def hndl_deep_dive(
    report: MigrationReport,
    styles: dict[str, ParagraphStyle],
    *,
    limit: int = 5,
) -> list[Any]:
    body = styles["body"]
    muted = styles["muted"]
    h2 = styles["h2"]
    assets = sorted(
        [a for a in report.assets if a.vulnerability.hndl_exposed],
        key=lambda a: a.mosca_priority,
        reverse=True,
    )[:limit]
    if not assets:
        return []
    blocks: list[Any] = [Paragraph("Top HNDL-exposed assets (deep dive)", h2)]
    explanations = report.asset_explanations or {}
    for asset in assets:
        badge = " [ALREADY TOO LATE]" if asset.already_too_late else ""
        blocks.append(Paragraph(f"<b>{asset.label}</b>{badge} — priority {asset.mosca_priority:.0f}", body))
        blocks.append(
            Paragraph(
                f"TLS {asset.tls_version or '—'} | Cipher: {asset.negotiated_cipher or '—'} | "
                f"Group: {asset.negotiated_group or '—'}",
                muted,
            )
        )
        expl = explanations.get(asset.id) or asset.hndl_verdict
        if expl:
            blocks.append(Paragraph(f"What this means: {expl[:220]}", muted))
        blocks.append(Spacer(1, 0.06 * inch))
    return blocks


def remediation_table(report: MigrationReport, body: ParagraphStyle) -> list[Any]:
    backlog = list(report.remediation_backlog)
    if not backlog:
        priorities = (report.executive_summary or {}).get("topPriorities") or []
        if priorities:
            blocks = [Paragraph("Prioritized actions (from executive summary)", body)]
            for item in priorities[:10]:
                blocks.append(
                    Paragraph(
                        f"• {item.get('title', '')} — {(item.get('action') or '')[:180]}",
                        body,
                    )
                )
            return blocks
        return [Paragraph("No remediation items required.", body)]

    rows: list[list[Any]] = [
        ["#", "Title", "Severity", "PQC algorithm", "Deadline", "Effort"],
    ]
    for item in backlog[:30]:
        rows.append(
            [
                str(item.priority),
                Paragraph(item.title[:55], body),
                item.severity,
                Paragraph(item.pqc_algorithm[:35], body),
                item.deadline,
                f"{item.effort_days}d",
            ]
        )
    table = Table(rows, colWidths=[0.3 * inch, 1.6 * inch, 0.55 * inch, 1.2 * inch, 0.7 * inch, 0.45 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CHARCOAL),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [table]


def migration_roadmap_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    roadmap = report.migration_roadmap or []
    if not roadmap:
        return []
    h2 = styles["h2"]
    body = styles["body"]
    rows = [["Milestone", "Deadline", "Severity", "PQC / notes"]]
    for item in roadmap[:15]:
        rows.append(
            [
                Paragraph(str(item.get("label", ""))[:50], body),
                str(item.get("deadline", "")),
                str(item.get("severity", "")),
                str(item.get("pqcAlgorithm", item.get("framework", "")))[:30],
            ]
        )
    table = Table(rows, colWidths=[2.2 * inch, 0.9 * inch, 0.7 * inch, 1.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return [Paragraph("Migration roadmap", h2), table]


def provenance_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    body = styles["body"]
    muted = styles["muted"]
    mono = styles["mono"]
    h2 = styles["h2"]
    if not report.signature:
        return []
    sig = report.signature
    blocks = [
        Paragraph("Report integrity &amp; provenance", h2),
        Paragraph(f"Algorithm: {sig.get('alg', '—')}", body),
        Paragraph(f"Key fingerprint: {sig.get('keyFingerprint', '—')}", mono),
        Paragraph(f"Content hash (SHA-256): {sig.get('contentHash', '—')}", mono),
        Paragraph(f"Signed at: {sig.get('signedAt', '—')}", muted),
        Paragraph(f"Verify: {verify_url(report)}", muted),
    ]
    content_hash = sig.get("contentHash")
    if content_hash:
        try:
            from app.pqc.transparency import log_inclusion_block

            inclusion = log_inclusion_block(str(content_hash))
            if inclusion and inclusion.get("included"):
                root_hash = inclusion.get("rootHash", "")
                root_snippet = f"{root_hash[:16]}…" if root_hash else "—"
                blocks.append(
                    Paragraph(
                        f"Transparency log seq {inclusion.get('seq', '—')} · root {root_snippet}",
                        muted,
                    )
                )
        except Exception:
            pass
    return blocks


def glossary_and_references(styles: dict[str, ParagraphStyle]) -> list[Any]:
    muted = styles["muted"]
    h2 = styles["h2"]
    blocks: list[Any] = [Paragraph("Glossary", h2)]
    for entry in glossary_for_report():
        blocks.append(Paragraph(f"<b>{entry['term']}</b>: {entry['plain']}", muted))
    blocks.append(Spacer(1, 0.12 * inch))
    blocks.append(Paragraph("References", h2))
    for ref in references_for_report()[:20]:
        blocks.append(
            Paragraph(f"[{ref['index']}] {ref['term']} — {ref.get('url', '')}", muted)
        )
    return blocks


def handshake_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    proof = report.handshake_proof
    if proof is None:
        return []
    if proof.mode == "fixture":
        return []
    appendix = handshake_appendix_for_report(proof)
    body = styles["body"]
    muted = styles["muted"]
    h2 = styles["h2"]
    return [
        Paragraph(str(appendix.get("title", "Post-quantum handshake appendix")), h2),
        Paragraph(
            f"Mode: {appendix.get('mode', '')} | Server: {appendix.get('server', '')}:"
            f"{appendix.get('port', '')} | TLS: {appendix.get('tlsVersion', '')}",
            body,
        ),
        Paragraph(str(appendix.get("summary", "")), muted),
    ]


def compliance_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    pack = report.compliance_pack or {}
    body = styles["body"]
    muted = styles["muted"]
    h2 = styles["h2"]
    blocks: list[Any] = [Paragraph("Compliance framework mapping", h2)]
    if pack.get("title"):
        blocks.append(Paragraph(str(pack["title"]), body))
    for gap in pack.get("gapFindings", [])[:8]:
        blocks.append(
            Paragraph(
                f"<b>{gap.get('framework', '')}</b> [{gap.get('status', '')}]: {gap.get('finding', '')}",
                body,
            )
        )
    summary = pack.get("complianceSummary") or {}
    if summary:
        blocks.append(Paragraph(f"Compliance summary: {summary}", muted))
    return blocks


def discovery_provenance_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    source_counts: dict[str, int] = {}
    for asset in report.assets:
        source = str(asset.metadata.get("source") or asset.kind or "unknown")
        source_counts[source] = source_counts.get(source, 0) + 1
    if not source_counts and not report.scan_coverage:
        return []

    blocks: list[Any] = [Paragraph("Discovery provenance", h2)]
    if source_counts:
        rows = [["Source / surface", "Assets"]]
        for source, count in sorted(source_counts.items(), key=lambda item: -item[1]):
            rows.append([source, str(count)])
        table = Table(rows, colWidths=[3.5 * inch, 1.5 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ]
            )
        )
        blocks.extend([table, Spacer(1, 0.08 * inch)])

    coverage = report.scan_coverage or []
    if coverage:
        blocks.append(Paragraph("<b>Endpoint coverage</b>", body))
        rows = [["Host", "Port", "Status", "Detail"]]
        for row in coverage[:20]:
            rows.append(
                [
                    str(row.get("host", ""))[:30],
                    str(row.get("port", "")),
                    str(row.get("status", "")),
                    str(row.get("detail", ""))[:40],
                ]
            )
        table = Table(rows, colWidths=[1.5 * inch, 0.5 * inch, 0.9 * inch, 2.5 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ]
            )
        )
        blocks.append(table)
        unreachable = sum(1 for row in coverage if row.get("status") == "unreachable")
        if unreachable:
            blocks.append(
                Paragraph(
                    f"{unreachable} discovered host(s) were unreachable — may indicate firewall gaps or decommissioned assets.",
                    muted,
                )
            )
    return blocks


def runtime_diff_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    diff = report.source_runtime_diff or {}
    if not diff:
        return []
    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    blocks: list[Any] = [Paragraph("Scanner runtime diff", h2)]
    for key in ("scannerVersion", "standardsVersion", "rulePackVersion", "previousScannerVersion"):
        if diff.get(key):
            blocks.append(Paragraph(f"<b>{key}:</b> {diff[key]}", body))
    if diff.get("summary"):
        blocks.append(Paragraph(str(diff["summary"]), muted))
    else:
        blocks.append(
            Paragraph(
                "Findings may differ from a prior scan due to scanner or standards updates, not infrastructure change.",
                muted,
            )
        )
    return blocks


def cbom_summary_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    if not report.assets:
        return []
    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    by_kind: dict[str, int] = {}
    for asset in report.assets:
        by_kind[asset.kind] = by_kind.get(asset.kind, 0) + 1
    rows = [["Component type", "Count"]]
    for kind, count in sorted(by_kind.items(), key=lambda item: -item[1]):
        rows.append([kind, str(count)])
    table = Table(rows, colWidths=[2.5 * inch, 1.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [
        Paragraph("CBOM summary", h2),
        Paragraph(
            "CycloneDX 1.6 · schema qtangl-cbom-v1 · full export in cbom.json within the evidence bundle.",
            body,
        ),
        table,
        Spacer(1, 0.06 * inch),
        Paragraph(
            "Import cbom.json into your GRC or procurement toolchain to track cryptographic components alongside software SBOMs.",
            muted,
        ),
    ]


def scoring_methodology_section(report: MigrationReport, styles: dict[str, ParagraphStyle]) -> list[Any]:
    from app.pqc.risk import crypto_agility_breakdown, readiness_formula_breakdown

    h2 = styles["h2"]
    body = styles["body"]
    muted = styles["muted"]
    formula = readiness_formula_breakdown(report.assets)
    agility = crypto_agility_breakdown(report.assets)
    blocks: list[Any] = [
        Paragraph("Scoring methodology", h2),
        Paragraph(
            "Readiness = inventory_baseline + safe% − at_risk% − broken% + hybrid_credit "
            "(endpoint-scoped; not a formal audit).",
            body,
        ),
        Paragraph(
            f"This scan: baseline {formula.get('inventoryBaseline', 0)}, hybrid credit "
            f"{formula.get('hybridCredit', 0)}, classified {formula.get('classifiedCount', 0)} "
            f"→ score {report.readiness_score}/100 ({report.readiness_band}).",
            body,
        ),
        Paragraph(
            "Bands: 0–25 Pre-migration baseline · 26–50 Partial · 51–75 In progress · 76–100 PQC-ready.",
            muted,
        ),
        Paragraph(
            f"Crypto agility {agility.get('score', report.crypto_agility_score or 0)} — "
            f"{agility.get('interpretation', '')}. "
            f"PQC-ready {agility.get('pqcReadyShare', 0)}% · short-lived certs {agility.get('shortLivedShare', 0)}%.",
            muted,
        ),
        Paragraph(
            "Shor logical-qubit estimates are order-of-magnitude references, not Q-Day timing predictions. "
            "See /assess/methodology and fixtures/calibration.md.",
            muted,
        ),
    ]
    reuse = int(agility.get("keyReuseEndpoints") or 0)
    if reuse:
        blocks.append(
            Paragraph(f"Key reuse detected across {reuse} endpoint(s) — rotation difficulty increases migration risk.", muted)
        )
    return blocks
