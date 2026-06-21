from __future__ import annotations

import unittest

from app.pqc.bundle_codec import asset_from_dict, bundle_from_api_dict
from app.pqc.data import load_dataset
from app.pqc.models import MigrationReport, MoscaAssessment
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_pdf
from app.pqc.report_export import bundle_report, enrich_report_for_export, export_report_response
from app.pqc.report_pdf import build_board_pdf
from app.pqc.report_validate import validate_report_coherence
from app.pqc.serialize import serialize_bundle


class ReportCoherenceTest(unittest.TestCase):
    def test_fixture_scan_passes_coherence(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        issues = validate_report_coherence(bundle.report, strict=True)
        self.assertEqual(issues, [])

    def test_empty_assets_fails_coherence(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        report = bundle.report
        report.assets = []
        report.remediation_backlog = []
        issues = validate_report_coherence(report, strict=True)
        self.assertTrue(any("empty" in issue.lower() or "No classified" in issue for issue in issues))

    def test_bundle_round_trip_preserves_assets(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        serialized = serialize_bundle(bundle)
        reconstructed = bundle_from_api_dict(serialized)
        self.assertGreater(len(reconstructed.assets), 0)
        self.assertGreater(len(reconstructed.report.assets), 0)
        self.assertGreater(len(reconstructed.remediation_backlog), 0)


class ReportPdfExportTest(unittest.TestCase):
    def test_board_pdf_header(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        report = enrich_report_for_export(bundle.report, tenant_id="sandbox")
        pdf = build_board_pdf(report)
        self.assertTrue(pdf.startswith(b"%PDF"))
        self.assertGreater(len(pdf), 800)

    def test_full_pdf_contains_scope_section(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        pdf = report_to_pdf(enrich_report_for_export(bundle.report, tenant_id="sandbox"))
        self.assertTrue(pdf.startswith(b"%PDF"))
        self.assertGreater(len(pdf), 2000)
        try:
            import io

            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(pdf))
            text = "".join(page.extract_text() or "" for page in reader.pages)
            self.assertIn("Scope and authorization", text)
            self.assertIn("Findings delta", text)
            self.assertIn("Migration roadmap", text)
            self.assertIn("Scoring methodology", text)
            self.assertIn("CBOM summary", text)
        except ImportError:
            self.assertGreater(len(pdf), 5000)

    def test_board_pdf_is_two_pages(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        report = enrich_report_for_export(bundle.report, tenant_id="sandbox")
        pdf = build_board_pdf(report)
        try:
            import io

            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(pdf))
            self.assertEqual(len(reader.pages), 2)
        except ImportError:
            self.assertGreater(len(pdf), 800)

    def test_bundle_report_syncs_assets(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        bundle.report.assets = []
        synced = bundle_report(bundle)
        self.assertGreater(len(synced.assets), 0)

    def test_export_report_response_pdf(self) -> None:
        bundle = run_pqc_scan(load_dataset(), scenario_id="bank-tls-inventory", use_fixture=True)
        report = bundle_report(bundle)
        response = export_report_response(
            scan_id=bundle.scan_id,
            report=report,
            export_format="pdf",
            tenant_id="sandbox",
            branding={"companyName": "Demo Bank"},
        )
        body = response.body
        if isinstance(body, memoryview):
            body = body.tobytes()
        self.assertTrue(body.startswith(b"%PDF"))
    unittest.main()
